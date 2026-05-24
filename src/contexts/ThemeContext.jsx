/**
 * contexts/ThemeContext.jsx
 * ─────────────────────────
 * Quản lý theme global: 'dark' | 'light' | 'auto'
 *
 * Chỉ làm 2 việc:
 *   1. Lưu giá trị themeMode hiện tại (user preference).
 *   2. Expose setThemeMode để hook / component thay đổi.
 *
 * Việc áp dụng class lên <body> và logic auto đặt ở useAutoTheme.js
 */
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

/**
 * Khởi tạo mode từ localStorage.
 * @returns {'dark' | 'light' | 'auto'}
 */
const initMode = () =>
  /** @type {'dark'|'light'|'auto'} */
  (localStorage.getItem('gp_theme_mode')) || 'dark';

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState(initMode);

  /** Setter duy nhất — cũng persist vào localStorage */
  const setThemeMode = (mode) => {
    localStorage.setItem('gp_theme_mode', mode);
    setThemeModeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

/** Hook tiêu thụ context — throw nếu dùng ngoài Provider */
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
};
