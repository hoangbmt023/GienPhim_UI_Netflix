import React, { useState, useEffect, useRef } from 'react';
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
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    
    if (isFixed) {
      document.addEventListener('scroll', () => setIsOpen(false), true);
    }
    
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      if (isFixed) {
        document.removeEventListener('scroll', () => setIsOpen(false), true);
      }
    };
  }, [isFixed]);

  const toggleDropdown = (e) => {
    if (disabled) return;
    
    if (!isOpen && isFixed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 4 + 'px',
        left: (rect.right - 140) + 'px', // align right, width is ~140px
        width: '140px',
        zIndex: 99999
      });
    }
    setIsOpen(!isOpen);
  };

  const selectedOpt = options.find(o => o.value === value) || options[0];
  const displayLabel = triggerText || (selectedOpt ? selectedOpt.label : '');

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
      {isOpen && (
        <div 
          className={`custom-select-menu ${isFixed ? 'action-select-menu' : ''}`} 
          style={isFixed ? { ...menuStyle, right: 'auto', bottom: 'auto', textAlign: 'left', margin: 0 } : {}}
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
      )}
    </div>
  );
}
