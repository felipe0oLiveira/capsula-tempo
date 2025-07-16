import React, { useState } from 'react';
import { login, register } from './services/api';
import './Login.css';

type Mode = 'login' | 'register';

export default function App() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function isValidEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
  }
  function isValidPassword(password: string) {
    return password.length >= 6;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!isValidEmail(email)) {
      setError('E-mail inválido.');
      return;
    }
    if (!isValidPassword(password)) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      setMessage('Login realizado com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!isValidEmail(email)) {
      setError('E-mail inválido.');
      return;
    }
    if (!isValidPassword(password)) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await register(email, password);
      setMessage('Cadastro realizado com sucesso! Agora faça login.');
      setMode('login');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="split-bg">
      <div className="split-left">
        <div className="login-container">
          <div className="login-avatar-wrapper">
            <div className="login-avatar">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="6" stroke="white" strokeWidth="2" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <div className="login-avatar-lines">
              <div className="line"></div>
              <div className="line"></div>
            </div>
          </div>
          <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#fff', letterSpacing: 1 }}>
            Entrar
          </h2>
          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-input-group">
              <span className="icon">
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
          </form>
          <div className="login-options">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <a className="login-forgot" href="#">Forgot your password?</a>
          </div>
          <div style={{ width: '100%', textAlign: 'center', marginTop: 16 }}>
            <button
              onClick={() => setMode('register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: 14,
                marginTop: 8
              }}
            >
              Não tem conta? Cadastre-se agora
            </button>
          </div>
          <div className="login-separator"></div>
          {(error || message) && (
            <p style={{ color: error ? '#ffbaba' : '#baffc9', marginTop: 16, textAlign: 'center' }}>
              {error || message}
            </p>
          )}
        </div>
      </div>
      <div className="split-right">
        {mode === 'register' ? (
          <div className="register-container">
            <h2 style={{ color: '#fff', marginBottom: 24 }}>Criar Conta</h2>
            <form className="login-form" onSubmit={handleRegister}>
              <div className="login-input-group">
                <span className="icon">
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
                {loading ? 'Aguarde...' : 'CADASTRAR'}
              </button>
            </form>
            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => setMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: 14,
                  marginTop: 8
                }}
              >
                Já tem conta? Entrar
              </button>
            </div>
          </div>
        ) : (
          <div className="welcome-content">
            <h1>Welcome.</h1>
            <p>
              Envie uma mensagem para o seu futuro e surpreenda-se.<br />
              Não tem uma conta?{' '}
              <a href="#" onClick={e => { e.preventDefault(); setMode('register'); }}>
                Cadastre-se agora
              </a>
            </p>
            {/* <div className="welcome-art"></div> */}
          </div>
        )}
      </div>
    </div>
  );
}