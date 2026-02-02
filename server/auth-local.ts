import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Express, Request, Response } from 'express';
import * as db from './db';
import { getSessionCookieOptions } from './_core/cookies';
import { COOKIE_NAME, ONE_YEAR_MS } from '@shared/const';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from './email-service';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

/**
 * Registra rotas de autenticação local (login/cadastro)
 * Compatível com o sistema existente de OAuth
 */
export function registerLocalAuthRoutes(app: Express) {
  
  // Rota de cadastro (registro)
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      console.log('[Register] Requisição recebida:', { email: req.body.email });
      const { email, password, name } = req.body as RegisterInput;

      // Validações básicas
      if (!email || !password) {
        res.status(400).json({ 
          error: 'Email e senha são obrigatórios' 
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ 
          error: 'Senha deve ter pelo menos 6 caracteres' 
        });
        return;
      }

      // Verificar se usuário já existe
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        res.status(400).json({ 
          error: 'Email já cadastrado' 
        });
        return;
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(password, 10);

      // Criar usuário
      const newUser = await db.createLocalUser({
        email,
        passwordHash,
        name: name || email.split('@')[0],
        loginMethod: 'local',
      });

      // Gerar token JWT
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email,
          openId: `local_${newUser.id}` // Compatibilidade com sistema OAuth
        },
        JWT_SECRET,
        { expiresIn: '365d' }
      );

      // Configurar cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { 
        ...cookieOptions, 
        maxAge: ONE_YEAR_MS 
      });

      res.status(201).json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error('[Auth] Erro no registro:', error);
      res.status(500).json({ 
        error: 'Erro ao criar conta' 
      });
    }
  });

  // Rota de login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      console.log('[Login] Requisição recebida:', { email: req.body.email });
      const { email, password } = req.body as LoginInput;

      // Validações básicas
      if (!email || !password) {
        res.status(400).json({ 
          error: 'Email e senha são obrigatórios' 
        });
        return;
      }

      // Buscar usuário
      const user = await db.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        res.status(401).json({ 
          error: 'Email ou senha inválidos' 
        });
        return;
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        res.status(401).json({ 
          error: 'Email ou senha inválidos' 
        });
        return;
      }

      // Atualizar último login
      await db.updateUserLastSignIn(user.id);

      // Gerar token JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          openId: user.openId || `local_${user.id}`
        },
        JWT_SECRET,
        { expiresIn: '365d' }
      );

      // Configurar cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { 
        ...cookieOptions, 
        maxAge: ONE_YEAR_MS 
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          points: user.points,
          trustScore: user.trustScore,
        },
      });
    } catch (error) {
      console.error('[Auth] Erro no login:', error);
      res.status(500).json({ 
        error: 'Erro ao fazer login' 
      });
    }
  });

  // Rota de verificação de sessão
  app.get('/api/auth/session', async (req: Request, res: Response) => {
    try {
      const token = req.cookies[COOKIE_NAME];
      
      if (!token) {
        res.json({ authenticated: false });
        return;
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await db.getUserById(decoded.userId);

      if (!user) {
        res.json({ authenticated: false });
        return;
      }

      res.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          points: user.points,
          trustScore: user.trustScore,
        },
      });
    } catch (error) {
      res.json({ authenticated: false });
    }
  });

  // ============== PASSWORD RESET ENDPOINTS ==============

  // Rota: Solicitar reset de senha
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      console.log('[ForgotPassword] Requisição recebida:', { email: req.body.email });
      const { email } = req.body;

      // Validações básicas
      if (!email) {
        res.status(400).json({ error: 'Email é obrigatório' });
        return;
      }

      // Buscar usuário
      const user = await db.getUserByEmail(email);
      if (!user) {
        // Não revelar se email existe por segurança
        console.log('[ForgotPassword] Email não encontrado:', email);
        res.status(200).json({
          message: 'Se este email está registrado, você receberá um link para resetar sua senha',
        });
        return;
      }

      // Gerar token seguro (32 bytes hex)
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Salvar token no banco com expiry 24h
      await db.savePasswordResetToken(user.id, resetToken, true);

      // Enviar email
      const emailSent = await sendPasswordResetEmail(user.email, resetToken, user.name || 'Usuário');

      if (!emailSent) {
        console.error('[ForgotPassword] Erro ao enviar email para:', email);
        res.status(500).json({ error: 'Erro ao enviar email. Tente novamente mais tarde.' });
        return;
      }

      console.log('[ForgotPassword] Email enviado com sucesso para:', email);
      res.status(200).json({
        message: 'Se este email está registrado, você receberá um link para resetar sua senha',
      });
    } catch (error) {
      console.error('[ForgotPassword] Erro:', error);
      res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
  });

  // Rota: Resetar senha com token
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      console.log('[ResetPassword] Requisição recebida');
      const { token, newPassword } = req.body;

      // Validações básicas
      if (!token || !newPassword) {
        res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
        return;
      }

      // Validar token
      const user = await db.validatePasswordResetToken(token);
      if (!user) {
        console.warn('[ResetPassword] Token inválido ou expirado');
        res.status(400).json({ error: 'Link de reset inválido ou expirado' });
        return;
      }

      // Hash da nova senha
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Atualizar senha no banco
      await db.updateUserPassword(user.id, passwordHash);

      // Limpar token de reset
      await db.clearPasswordResetToken(user.id);

      // Enviar email de confirmação
      await sendPasswordChangedEmail(user.email, user.name || 'Usuário');

      console.log('[ResetPassword] Senha resetada com sucesso para:', user.email);
      res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso! Você já pode fazer login.',
      });
    } catch (error) {
      console.error('[ResetPassword] Erro:', error);
      res.status(500).json({ error: 'Erro ao resetar senha' });
    }
  });

/**
 * Middleware para validar token JWT em requisições protegidas
 */
export function validateLocalAuth(token: string): { userId: number; email: string; openId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
      openId: decoded.openId,
    };
  } catch (error) {
    return null;
  }
}
