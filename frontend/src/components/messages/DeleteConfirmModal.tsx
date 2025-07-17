import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: {
    id: string;
    message: string;
    scheduledFor: string;
  } | null;
  loading?: boolean;
}

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  message, 
  loading 
}: DeleteConfirmModalProps) {
  if (!isOpen || !message) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Exibir exatamente como está no banco, sem conversões
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">🗑️ Deletar Mensagem</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="delete-content">
          <div className="delete-icon">
            ⚠️
          </div>
          
          <h4 className="delete-title">Tem certeza que deseja deletar esta mensagem?</h4>
          
          <p className="delete-description">
            Esta ação não pode ser desfeita. A mensagem será removida permanentemente.
          </p>
          
          <div className="message-preview">
            <div className="preview-label">Mensagem:</div>
            <div className="preview-text">{message.message}</div>
            <div className="preview-date">
              Agendada para: {formatDate(message.scheduledFor)}
            </div>
          </div>
        </div>
        
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
            type="button" 
            className="btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deletando...' : 'Sim, Deletar'}
          </button>
        </div>
      </div>
    </div>
  );
} 