import vi from '@/locales/vi';
import en from '@/locales/en';

export const getLang = () => {
  const savedLang = localStorage.getItem('gp_lang');
  const pathname = window.location.pathname;

  // 1. Kiểm tra khớp chính xác URL
  for (const key in PATHS) {
    if (pathname === PATHS[key].en) return 'en';
    if (pathname === PATHS[key].vi) return 'vi';
  }

  // 2. Kiểm tra khớp prefix (cho dynamic routes)
  const keys = Object.keys(PATHS).sort((a, b) => PATHS[b].vi.length - PATHS[a].vi.length);
  for (const key of keys) {
    if (PATHS[key].vi === '/' || PATHS[key].en === '/') continue;
    if (pathname.startsWith(PATHS[key].en)) return 'en';
    if (pathname.startsWith(PATHS[key].vi)) return 'vi';
  }

  return savedLang || 'vi';
};

export const setLang = (lang) => {
  localStorage.setItem('gp_lang', lang);
};

export const PATHS = {
  home: { vi: '/trang-chu', en: '/home' },
  login: { vi: '/dang-nhap', en: '/login' },
  register: { vi: '/dang-ky', en: '/register' },
  forgotPassword: { vi: '/quen-mat-khau', en: '/forgot-password' },
  verifyOtp: { vi: '/xac-thuc-otp', en: '/verify-otp' },
  resetPassword: { vi: '/dat-lai-mat-khau', en: '/reset-password' },
  profiles: { vi: '/ho-so', en: '/profiles' },
  myList: { vi: '/danh-sach-cua-toi', en: '/my-list' },
  series: { vi: '/phim-bo', en: '/series' },
  movies: { vi: '/phim-le', en: '/movies' },
  newReleases: { vi: '/phim-moi', en: '/new-releases' },
  animation: { vi: '/hoat-hinh', en: '/animation' },
  countryVietnam: { vi: '/quoc-gia/viet-nam', en: '/country/vietnam' },
  search: { vi: '/tim-kiem', en: '/search' },
  list: { vi: '/danh-sach', en: '/list' },
  category: { vi: '/the-loai', en: '/category' },
  country: { vi: '/quoc-gia', en: '/country' },
  year: { vi: '/nam', en: '/year' },
  movie: { vi: '/phim', en: '/movie' },
  watch: { vi: '/xem-phim', en: '/watch' },
  about: { vi: '/gioi-thieu', en: '/about' },
  privacy: { vi: '/chinh-sach-bao-mat', en: '/privacy-policy' },
  terms: { vi: '/dieu-khoan-su-dung', en: '/terms-of-use' },
  faq: { vi: '/cau-hoi-thuong-gap', en: '/faq' },
  contact: { vi: '/lien-he', en: '/contact' },
};

export const getPath = (key) => {
  const lang = getLang();
  return PATHS[key]?.[lang] || PATHS[key]?.['vi'] || '/';
};

export const getSwitchPath = (currentPath, newLang) => {
  // 1. Tìm chính xác
  for (const key in PATHS) {
    if (PATHS[key].vi === currentPath || PATHS[key].en === currentPath) {
      return PATHS[key][newLang];
    }
  }
  
  // 2. Tìm theo prefix (cho dynamic routes như /phim/:slug)
  const keys = Object.keys(PATHS).sort((a, b) => PATHS[b].vi.length - PATHS[a].vi.length);
  
  for (const key of keys) {
    const viPath = PATHS[key].vi;
    const enPath = PATHS[key].en;
    
    // Tránh khớp nhầm root '/'
    if (viPath === '/' || enPath === '/') continue;

    if (currentPath.startsWith(viPath)) {
      return currentPath.replace(viPath, PATHS[key][newLang]);
    }
    if (currentPath.startsWith(enPath)) {
      return currentPath.replace(enPath, PATHS[key][newLang]);
    }
  }
  
  return PATHS.home[newLang];
};

export const getT = () => {
  const lang = getLang();
  return lang === 'en' ? en : vi;
};

// ── REACT HOOK ──
export const useLang = () => {
  const lang = getLang();
  return { t: getT(), lang };
};
