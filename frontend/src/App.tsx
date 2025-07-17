import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import './Login.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
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
                <LoginForm onLoginSuccess={() => navigate('/dashboard')} />
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
                  <RegisterForm onRegisterSuccess={() => setMode('login')} />
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
      </div>
              )}
            </div>
          </div>
        }
      />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    </Routes>
  );
}