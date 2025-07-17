import React, { useState } from 'react';
import { login } from '../../services/api';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login.');
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
          autoComplete="current-password"
        />
      </div>
      <button className="login-btn" type="submit" disabled={loading}>
        {loading ? 'Aguarde...' : 'LOGIN'}
      </button>
      <div className="login-options">
        <label className="login-remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
          />
          Lembre-se de mim
        </label>
        <a className="login-forgot" href="#">Esqueceu a senha?</a>
      </div>
      {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
    </form>
  );
} 