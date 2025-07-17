import React, { useState, useEffect } from 'react';

interface EditMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { message: string; scheduledFor: string }) => void;
  message: {
    id: string;
    message: string;
    scheduledFor: string;
    status?: 'pending' | 'sent';
  } | null;
  loading?: boolean;
}

export default function EditMessageModal({ 
  isOpen, 
  onClose, 
  onSave, 
  message, 
  loading 
}: EditMessageModalProps) {
  const [formData, setFormData] = useState({
    message: '',
    scheduledFor: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (message) {
      setFormData({
        message: message.message,
        scheduledFor: message.scheduledFor.slice(0, 16) // Formato para datetime-local
      });
      setError('');
    }
  }, [message]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!formData.message.trim()) {
      setError('Digite uma mensagem.');
      return;
    }
    if (!formData.scheduledFor) {
      setError('Escolha uma data e hora.');
      return;
    }

    onSave(formData);
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">✏️ Editar Mensagem</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Sua Mensagem</label>
            <textarea
              className="form-input form-textarea"
              value={formData.message}
              onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
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
              value={formData.scheduledFor}
              onChange={e => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 