import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import './CustomSelect.css';

export default function CustomSelect({ 
  value, 
  onChange, 
  options, 
  disabled, 
  style, 
  className = "", 
  isFixed = false,
  triggerText,
  triggerStyle
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const containerRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        // If clicking on the portalled menu options, do not close immediately on mousedown
        if (isFixed && e.target.closest('.custom-select-menu')) {
          return;
        }
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    
    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    if (isFixed && isOpen) {
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize, true);
    }
    
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize, true);
    };
  }, [isFixed, isOpen]);

  const toggleDropdown = (e) => {
    if (disabled) return;
    
    if (!isOpen && isFixed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 4 + 'px',
        right: (window.innerWidth - rect.right) + 'px',
        minWidth: rect.width + 'px',
        width: 'max-content',
        whiteSpace: 'nowrap',
        zIndex: 999999
      });
    }
    setIsOpen(!isOpen);
  };

  const selectedOpt = options.find(o => o.value === value) || options[0];
  const displayLabel = triggerText || (selectedOpt ? selectedOpt.label : '');

  const menuContent = (
    <div 
      className={`custom-select-menu ${isFixed ? 'action-select-menu' : ''}`} 
      style={isFixed ? { ...menuStyle, left: 'auto', bottom: 'auto', textAlign: 'left', margin: 0 } : {}}
    >
      {options.map((opt) => (
        <div
          key={opt.value}
          onClick={() => {
            if (onChange) onChange(opt.value);
            setIsOpen(false);
          }}
          className={`custom-select-option ${opt.value === value && !isFixed ? 'selected' : ''}`}
        >
          {opt.label}
        </div>
      ))}
    </div>
  );

  return (
    <div ref={containerRef} className={`custom-select-container ${className}`} style={{ ...style, width: isFixed ? 'auto' : '100%', display: isFixed ? 'inline-block' : 'block' }}>
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`custom-select-trigger ${isFixed ? 'action-select-trigger' : ''}`}
        style={triggerStyle}
      >
        <span>{displayLabel}</span>
        <ChevronDown size={isFixed ? 14 : 16} className={`custom-select-chevron ${isOpen ? 'open' : ''}`} style={isFixed ? { marginLeft: '8px' } : {}} />
      </button>
      {isOpen && (isFixed ? createPortal(menuContent, document.body) : menuContent)}
    </div>
  );
}
