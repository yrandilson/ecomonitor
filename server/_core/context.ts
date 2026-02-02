import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "@shared/const";
import { validateLocalAuth } from "../auth-local";
import { getUserById } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  
  console.log('[Context] Cookies recebidos:', Object.keys(opts.req.cookies));
  console.log('[Context] COOKIE_NAME:', COOKIE_NAME);
  console.log('[Context] Cookie value:', opts.req.cookies[COOKIE_NAME] ? 'EXISTS' : 'NOT_FOUND');

  try {
    // Primeiro tenta autenticação OAuth (sistema original)
    user = await sdk.authenticateRequest(opts.req);
    if (user) {
      console.log('[Context] OAuth user found:', user.email);
    }
  } catch (error) {
    // Se falhar, tenta autenticação local
    try {
      const token = opts.req.cookies[COOKIE_NAME];
      if (token) {
        console.log('[Context] Local auth token found, validating...');
        const decoded = validateLocalAuth(token);
        if (decoded) {
          console.log('[Context] Token válido, userId:', decoded.userId);
          const localUser = await getUserById(decoded.userId);
          if (localUser) {
            console.log('[Context] Usuário local encontrado:', localUser.email);
            user = localUser;
          } else {
            console.warn('[Context] Usuário local não encontrado no banco:', decoded.userId);
          }
        } else {
          console.warn('[Context] Token JWT inválido ou expirado');
        }
      } else {
        console.log('[Context] Nenhum token nos cookies');
      }
    } catch (localError) {
      console.error('[Context] Erro ao validar auth local:', localError);
      user = null;
    }
  }

  console.log('[Context] Final user:', user ? `${user.email}` : 'NULL');

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
