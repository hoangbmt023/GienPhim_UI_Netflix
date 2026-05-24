import { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeByCurrentTime } from '@/utils/themeTime';

/**
 * Tính resolved theme từ preference.
 * @param {'dark'|'light'|'auto'} mode
 * @returns {'dark'|'light'}
 */
const resolveTheme = (mode) => {
  if (mode === 'dark') return 'dark';
  if (mode === 'light') return 'light';
  // 'auto': ưu tiên time-based trước, system theme làm fallback
  return getThemeByCurrentTime();
};

/**
 * Hook mount 1 lần ở root (App.jsx hoặc ThemeProvider).
 * Tự động đồng bộ theme ngay lập tức (instant) để đạt hiệu năng tối đa, không bị khựng hình.
 */
export const useAutoTheme = () => {
  const { themeMode } = useTheme();
  const intervalRef = useRef(null);

  /**
   * Áp dụng theme lên DOM ngay lập tức.
   */
  const applyTheme = (mode) => {
    const resolved = resolveTheme(mode);
    const isLight = resolved === 'light';
    const hasDarkNight = document.body.classList.contains('dark-night');

    if (isLight !== hasDarkNight) {
      // Tạm thời tắt toàn bộ transition để tránh hiệu ứng hover cũ bị khựng màu
      document.body.classList.add('gp-theme-changing');

      if (isLight) {
        document.body.classList.add('dark-night');
        localStorage.setItem('gp_dark_night', 'true');
      } else {
        document.body.classList.remove('dark-night');
        localStorage.setItem('gp_dark_night', 'false');
      }

      // Bật lại transition sau khi thay đổi theme hoàn tất
      setTimeout(() => {
        document.body.classList.remove('gp-theme-changing');
      }, 50);
    }
  };

  useEffect(() => {
    // Áp dụng theme lập tức
    applyTheme(themeMode);

    // Nếu là auto: setup interval + system listener
    if (themeMode === 'auto') {
      // Poll mỗi 60s để bắt kịp giờ đổi
      intervalRef.current = setInterval(() => {
        applyTheme('auto');
      }, 60_000);

      // Lắng nghe thay đổi theme hệ thống
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onSystemChange = () => applyTheme('auto');
      mq.addEventListener('change', onSystemChange);

      return () => {
        clearInterval(intervalRef.current);
        mq.removeEventListener('change', onSystemChange);
      };
    }

    // Cleanup interval nếu đổi từ auto → manual
    return () => clearInterval(intervalRef.current);
  }, [themeMode]);
};

