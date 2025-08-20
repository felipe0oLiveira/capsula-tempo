import React, { useState, useEffect } from 'react';
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
  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);

  // Validação de email em tempo real
  useEffect(() => {
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailValid(emailRegex.test(email));
    } else {
      setEmailValid(true);
    }
  }, [email]);

  // Validação de senha em tempo real
  useEffect(() => {
    if (password) {
      setPasswordValid(password.length >= 6);
    } else {
      setPasswordValid(true);
    }
  }, [password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    // Validação final
    if (!emailValid || !passwordValid) {
      setError('Por favor, corrija os erros no formulário.');
      return;
    }

    setLoading(true);
    
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      
      // Salva preferência "lembrar de mim"
      if (remember) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }
      
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  // Carrega email salvo se "lembrar de mim" estava ativo
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);

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
          className={!emailValid && email ? 'error' : ''}
          disabled={loading}
        />
        {!emailValid && email && (
          <span className="error-message">E-mail inválido</span>
        )}
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
          className={!passwordValid && password ? 'error' : ''}
          disabled={loading}
        />
        {!passwordValid && password && (
          <span className="error-message">Senha deve ter pelo menos 6 caracteres</span>
        )}
      </div>
      
      <button 
        className={`login-btn ${loading ? 'loading' : ''}`} 
        type="submit" 
        disabled={loading || !emailValid || !passwordValid}
      >
        {loading ? (
          <>
            <svg className="spinner" width="20" height="20" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
              </circle>
            </svg>
            Entrando...
          </>
        ) : (
          'LOGIN'
        )}
      </button>
      
      <div className="login-options">
        <label className="login-remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            disabled={loading}
          />
          Lembre-se de mim
        </label>
        <a className="login-forgot" href="#" onClick={(e) => e.preventDefault()}>
          Esqueceu a senha?
        </a>
      </div>
      
      {error && (
        <div className="error-container">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>{error}</span>
        </div>
      )}
    </form>
  );
} 