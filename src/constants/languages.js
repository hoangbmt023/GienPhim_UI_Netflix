/**
 * constants/languages.js
 * ──────────────────────
 * Danh sách ngôn ngữ được hỗ trợ trong toàn app.
 *
 * Cách thêm ngôn ngữ mới:
 *   1. Thêm entry vào mảng LANGUAGES bên dưới.
 *   2. Tạo file locale tương ứng ở src/locales/<code>.js
 *   3. Import & đăng ký trong src/utils/lang.js (getT function).
 *
 * Không cần sửa SettingsModal.jsx hay bất kỳ component nào khác.
 */

/**
 * @typedef {Object} Language
 * @property {string} code   - Mã ngôn ngữ ISO 639-1 (vi, en, ja, …)
 * @property {string} label  - Tên hiển thị đầy đủ (bằng ngôn ngữ đó hoặc tiếng Anh)
 * @property {string} native - Tên ngắn native (hiển thị bên phải trong UI)
 * @property {string} flag   - Emoji cờ quốc gia (tuỳ chọn nhưng giúp UX tốt hơn)
 */

/** @type {Language[]} */
export const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt',  native: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English (US)', native: 'English',     flag: '🇺🇸' },
  { code: 'ja', label: '日本語',        native: 'Japanese',    flag: '🇯🇵' },
  { code: 'ko', label: '한국어',        native: 'Korean',      flag: '🇰🇷' },
  { code: 'zh', label: '简体中文',      native: 'Chinese',     flag: '🇨🇳' },
];

/** Map nhanh code → Language object, tránh .find() lặp đi lặp lại */
export const LANGUAGE_MAP = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l])
);

/** Lấy Language object theo code, fallback về tiếng Việt */
export const getLanguage = (code) => LANGUAGE_MAP[code] ?? LANGUAGES[0];
