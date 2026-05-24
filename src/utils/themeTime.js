/**
 * utils/themeTime.js
 * ──────────────────
 * Pure functions — KHÔNG có side effect, KHÔNG import React.
 * Dễ unit test, dễ tái sử dụng.
 */

/** Giờ bắt đầu ban ngày  (6:00)  */
export const DAY_START_HOUR = 6;

/** Giờ bắt đầu ban đêm  (18:00) */
export const NIGHT_START_HOUR = 18;

/**
 * Nhận một số giờ (0–23), trả về "dark" hoặc "light".
 * @param {number} hour
 * @returns {'dark' | 'light'}
 */
export const getThemeByHour = (hour) => {
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? 'light' : 'dark';
};

/**
 * Kiểm tra giờ hiện tại có phải ban đêm không.
 * @returns {boolean}
 */
export const isNightTime = () => {
  const hour = new Date().getHours();
  return getThemeByHour(hour) === 'dark';
};

/**
 * Trả về theme phù hợp với giờ hiện tại.
 * @returns {'dark' | 'light'}
 */
export const getThemeByCurrentTime = () => {
  return getThemeByHour(new Date().getHours());
};
