import React from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  isLoading = false,
  confirmButtonClass = 'modal-btn-primary',
  showCloseButton = false
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        {showCloseButton && (
          <button className="confirm-modal-close" onClick={onClose} aria-label="Close" disabled={isLoading}>
            &times;
          </button>
        )}
        {title && <h3>{title}</h3>}
        {description && <p className="confirm-modal-desc">{description}</p>}
        <div className="confirm-modal-actions">
          {onConfirm && (
            <button className={`modal-btn ${confirmButtonClass}`} onClick={onConfirm} disabled={isLoading}>
              {confirmText}
            </button>
          )}
          {onClose && (
            <button className="modal-btn-outline" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
