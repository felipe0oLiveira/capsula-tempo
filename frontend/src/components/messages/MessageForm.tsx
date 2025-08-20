import React, { useState } from 'react';

interface MessageFormProps {
  onSubmit: (data: { message: string; scheduledFor: string }) => void;
  loading?: boolean;
}

export default function MessageForm({ onSubmit, loading }: MessageFormProps) {
  const [message, setMessage] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [error, setError] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);

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
    
    // Inicia a animação
    setShowAnimation(true);
    
    // Aguarda a animação terminar antes de enviar
    setTimeout(() => {
      onSubmit({ message, scheduledFor });
      setMessage('');
      setScheduledFor('');
      setShowAnimation(false);
    }, 3000); // 3 segundos para a animação
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Sua Mensagem</label>
          <textarea
            className="form-input form-textarea"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Escreva sua mensagem para o futuro..."
            rows={4}
            disabled={loading || showAnimation}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Data e Hora de Envio</label>
          <input
            type="datetime-local"
            className="form-input"
            value={scheduledFor}
            onChange={e => setScheduledFor(e.target.value)}
            disabled={loading || showAnimation}
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading || showAnimation}
        >
          {loading ? 'Agendando...' : showAnimation ? 'Enviando...' : 'Agendar Mensagem'}
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

      {/* Animação 3D da Carta */}
      {showAnimation && (
        <div className="letter-animation-overlay">
          <div className="letter-container">
            {/* Carta */}
            <div className="letter">
              <div className="letter-front">
                <div className="letter-content">
                  <div className="letter-header">
                    <div className="stamp">📮</div>
                    <div className="address">
                      <div className="to">Para: Futuro</div>
                      <div className="date">{new Date(scheduledFor).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                  <div className="letter-body">
                    <div className="message-preview">
                      {message.length > 50 ? `${message.substring(0, 50)}...` : message}
                    </div>
                  </div>
                </div>
              </div>
              <div className="letter-back"></div>
            </div>
            
            {/* Envelope */}
            <div className="envelope">
              <div className="envelope-front">
                <div className="envelope-flap-top"></div>
                <div className="envelope-body">
                  <div className="envelope-address">
                    <div className="envelope-to">📬 Futuro</div>
                    <div className="envelope-date">{new Date(scheduledFor).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
                <div className="envelope-flap-bottom"></div>
              </div>
              <div className="envelope-back"></div>
            </div>
            
            {/* Partículas mágicas */}
            <div className="magic-particles">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="particle" style={{
                  '--delay': `${i * 0.1}s`,
                  '--x': `${Math.random() * 100}%`,
                  '--y': `${Math.random() * 100}%`
                } as React.CSSProperties}></div>
              ))}
            </div>
            
            {/* Texto de confirmação */}
            <div className="confirmation-text">
              <h3>Mensagem Enviada! ✨</h3>
              <p>Sua carta para o futuro foi agendada com sucesso!</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 