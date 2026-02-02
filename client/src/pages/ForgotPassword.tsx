import React, { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setStatus('Email enviado se o usuário existir.');
      else setStatus('Erro ao solicitar reset.');
    } catch (err) {
      setStatus('Erro de rede.');
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Recuperar Senha</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          className="w-full p-2 border rounded mb-4"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Enviar</button>
      </form>
      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}
