import React, { useState } from 'react';
import { register } from '../../services/api';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
}

export default function RegisterForm({ onRegisterSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await register(email, password);
      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-input-group">
        <span className="icon">
          {/* Ícone de usuário */}
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="4" stroke="#fff" strokeWidth="2"/>
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="#fff" strokeWidth="2"/>
          </svg>
        </span>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="login-input-group">
        <span className="icon">
          {/* Ícone de cadeado */}
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="4" stroke="#fff" strokeWidth="2"/>
            <path d="M12 16v-4" stroke="#fff" strokeWidth="2"/>
            <circle cx="12" cy="10" r="2" stroke="#fff" strokeWidth="2"/>
          </svg>
        </span>
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>
      <div className="login-input-group">
        <span className="icon">
          {/* Ícone de cadeado */}
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="4" stroke="#fff" strokeWidth="2"/>
            <path d="M12 16v-4" stroke="#fff" strokeWidth="2"/>
            <circle cx="12" cy="10" r="2" stroke="#fff" strokeWidth="2"/>
          </svg>
        </span>
        <input
          type="password"
          placeholder="Confirmar senha"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>
      <button className="login-btn" type="submit" disabled={loading}>
        {loading ? 'Aguarde...' : 'Cadastrar'}
      </button>
      {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
    </form>
  );
} 