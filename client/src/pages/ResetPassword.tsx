import React, { useState } from 'react';
import { useLocation, useNavigate } from 'wouter';

function useQuery() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  return params;
}

export default function ResetPassword() {
  const params = useQuery();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const navigate = useNavigate()[1];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        setStatus('Senha alterada com sucesso.');
        setTimeout(() => navigate('/login'), 1500);
      } else setStatus('Token inválido ou expirado.');
    } catch (err) {
      setStatus('Erro de rede.');
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Escolher nova senha</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Nova senha</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          className="w-full p-2 border rounded mb-4"
        />
        <button className="px-4 py-2 bg-green-600 text-white rounded">Alterar senha</button>
      </form>
      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}
