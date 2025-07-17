import React, { useState } from 'react';

interface MessageFormProps {
  onSubmit: (data: { message: string; scheduledFor: string }) => void;
  loading?: boolean;
}

export default function MessageForm({ onSubmit, loading }: MessageFormProps) {
  const [message, setMessage] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!message.trim()) {
      setError('Digite uma mensagem.');
      return;
    }
    if (!scheduledFor) {
      setError('Escolha uma data e hora.');
      return;
    }
    onSubmit({ message, scheduledFor });
    setMessage('');
    setScheduledFor('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Sua Mensagem</label>
        <textarea
          className="form-input form-textarea"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Escreva sua mensagem para o futuro..."
          rows={4}
          disabled={loading}
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Data e Hora de Envio</label>
        <input
          type="datetime-local"
          className="form-input"
          value={scheduledFor}
          onChange={e => setScheduledFor(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <button 
        type="submit" 
        className="submit-button"
        disabled={loading}
      >
        {loading ? 'Agendando...' : 'Agendar Mensagem'}
      </button>
      
      {error && (
        <div style={{ 
          color: '#ff6b6b', 
          marginTop: 16, 
          padding: '0.8rem', 
          background: 'rgba(255,107,107,0.1)', 
          borderRadius: '8px',
          border: '1px solid rgba(255,107,107,0.3)',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
    </form>
  );
} 