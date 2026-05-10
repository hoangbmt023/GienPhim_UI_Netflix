import React from 'react';
import { useLang } from '@/utils/lang';
import './StatusModal.css';

const SuccessIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="status-icon success">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="status-icon error">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="status-icon warning">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export default function StatusModal({
  isOpen,
  onClose,
  type = 'success', // 'success', 'error', 'warning'
  title,
  description,
  buttonText
}) {
  const { t } = useLang();
  
  if (!isOpen) return null;

  const finalButtonText = buttonText || (t.common && t.common.close ? t.common.close : 'OK');

  const renderIcon = () => {
    switch (type) {
      case 'success': return <SuccessIcon />;
      case 'error': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      default: return null;
    }
  };

  return (
    <div className="status-modal-overlay">
      <div className="status-modal">
        <div className={`status-modal-icon-wrapper ${type}`}>
          {renderIcon()}
        </div>
        {title && <h3 className="status-modal-title">{title}</h3>}
        {description && <p className="status-modal-desc">{description}</p>}
        <div className="status-modal-actions">
          <button className={`modal-btn status-btn-${type}`} onClick={onClose}>
            {finalButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
