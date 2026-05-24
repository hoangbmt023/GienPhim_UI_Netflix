import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSwitchPath, setLang } from '@/utils/lang';
import { useLang } from '@/utils/lang';
import { useTheme } from '@/contexts/ThemeContext';
import { LANGUAGES, getLanguage } from '@/constants/languages';
import './SettingsModal.css';

/* ─── Icons ─── */
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── Component ─── */
export default function SettingsModal({ open, onClose, lang }) {
  const { t } = useLang();
  const s = t.settings; // shortcut

  // ── Theme: đọc/ghi qua context, KHÔNG tự quản lý localStorage ──
  const { themeMode, setThemeMode } = useTheme();

  const THEME_MODES = [
    { value: 'dark',  label: s.dark  },
    { value: 'light', label: s.light },
    { value: 'auto',  label: s.auto, note: s.autoNote },
  ];

  const [page, setPage]             = useState('main');
  const [direction, setDir]         = useState('forward');
  const [animKey, setAnimKey]       = useState(0);
  const [langBounce, setLangBounce] = useState(null);
  const [overlayOut, setOOut]       = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /* Đóng với animation */
  const handleClose = () => {
    setOOut(true);
    setTimeout(() => { setOOut(false); onClose(); }, 180);
  };

  /* Navigation */
  const goTo = (target) => {
    setDir('forward');
    setAnimKey(k => k + 1);
    setPage(target);
  };
  const goBack = () => {
    setDir('back');
    setAnimKey(k => k + 1);
    setPage('main');
  };

  /* Escape key */
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open]);

  /* Reset khi mở */
  useEffect(() => {
    if (open) { setPage('main'); setDir('forward'); setAnimKey(0); setOOut(false); }
  }, [open]);

  /* Theme change — chỉ cần gọi setThemeMode, hook useAutoTheme tự xử lý body class */
  const handleTheme = (mode) => setThemeMode(mode);

  /* Language change */
  const handleLang = (code) => {
    if (code === lang) { handleClose(); return; }
    setLangBounce(code);
    setTimeout(() => {
      setLang(code);
      const newPath = getSwitchPath(location.pathname, code);
      onClose();
      navigate(newPath);
      window.location.reload();
    }, 280);
  };

  // Dùng getLanguage() thay vì LANGUAGES.find() lặp lại
  const curLang = getLanguage(lang);

  if (!open) return null;

  const pageClass = `sm-page sm-page--${direction}`;

  return (
    <div
      className={`settings-overlay${overlayOut ? ' settings-overlay--out' : ''}`}
      onClick={(e) => { if (e.currentTarget === e.target) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={s.title}
    >
      <div className={`settings-modal${overlayOut ? ' settings-modal--out' : ''}`}>

        {/* ── Header bar ── */}
        <div className="sm-header">
          <button
            className="sm-icon-btn"
            style={{ visibility: page !== 'main' ? 'visible' : 'hidden' }}
            onClick={goBack}
            aria-label={s.back}
          >
            <ChevronLeft />
          </button>

          <span className={`sm-header__title${page === 'main' ? ' sm-header__title--main' : ''}`}>
            {page === 'main'     && s.title}
            {page === 'display'  && s.display}
            {page === 'language' && s.language}
          </span>

          <button className="sm-icon-btn" onClick={handleClose} aria-label={s.close}>
            <XIcon />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="sm-body">

          {/* MAIN */}
          {page === 'main' && (
            <div key={`main-${animKey}`} className={pageClass}>
              <div className="sm-page-scroll">
                <button className="sm-row" onClick={() => goTo('display')}>
                  <div className="sm-row__info">
                    <span className="sm-row__label">{s.display}</span>
                    <span className="sm-row__sub">
                      {s.displaySub} ·{' '}
                      <em className="sm-row__sub--em">
                        {THEME_MODES.find(m => m.value === themeMode)?.label}
                      </em>
                    </span>
                  </div>
                  <span className="sm-row__chevron"><ChevronRight /></span>
                </button>

                <div className="sm-divider" />

                <button className="sm-row" onClick={() => goTo('language')}>
                  <div className="sm-row__info">
                    <span className="sm-row__label">{s.language}</span>
                    <span className="sm-row__sub">
                      {curLang.flag} {curLang.label}
                    </span>
                  </div>
                  <span className="sm-row__chevron"><ChevronRight /></span>
                </button>
              </div>
            </div>
          )}

          {/* DISPLAY */}
          {page === 'display' && (
            <div key={`display-${animKey}`} className={pageClass}>
              <div className="sm-page-header">
                <div className="sm-section-title">{s.appearance}</div>
                <div className="sm-section-desc">{s.appearanceDesc}</div>
              </div>

              <div className="sm-page-scroll">
                {THEME_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    className={`sm-radio-row${themeMode === mode.value ? ' selected' : ''}`}
                    onClick={() => handleTheme(mode.value)}
                  >
                    <div className="sm-radio-row__info">
                      <span className="sm-radio-row__label">{mode.label}</span>
                      {mode.note && (
                        <span className="sm-radio-row__note">{mode.note}</span>
                      )}
                    </div>
                    <div className={`sm-radio${themeMode === mode.value ? ' sm-radio--on' : ''}`}>
                      <div className="sm-radio__dot" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LANGUAGE */}
          {page === 'language' && (
            <div key={`language-${animKey}`} className={pageClass}>
              <div className="sm-page-header">
                <div className="sm-section-title">{s.selectLang}</div>
                <div className="sm-section-desc">{s.selectLangDesc}</div>
              </div>

              <div className="sm-page-scroll">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    className={`sm-lang-row${lang === l.code ? ' selected' : ''}${langBounce === l.code ? ' bouncing' : ''}`}
                    onClick={() => handleLang(l.code)}
                  >
                    <div className="sm-lang-row__info">
                      <span className="sm-lang-row__flag">{l.flag}</span>
                      <span className="sm-lang-row__label">{l.label}</span>
                      <span className="sm-lang-row__native">{l.native}</span>
                    </div>
                    <span className={`sm-lang-row__check${lang === l.code ? ' show' : ''}`}>
                      <CheckIcon />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
