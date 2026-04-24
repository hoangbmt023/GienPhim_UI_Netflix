/**
 * OPhim API Service
 * Docs  : /docs/ophim-api.md
 * Base  : https://ophim1.com
 * CDN   : https://img.ophim.live/uploads/movies/{filename}
 */

export const BASE_URL  = import.meta.env.VITE_API_BASE ;
export const CDN_IMAGE = 'https://img.ophim.live/uploads/movies';

/* ─── Helpers ──────────────────────────────────────── */

/** filename → full CDN URL */
export const imgUrl = (filename) =>
  filename ? `${CDN_IMAGE}/${filename}` : '/placeholder.jpg';

/**
 * Normalize API responses:
 *  - { data: { items: [] } }  → items array
 *  - { data: [] }             → array
 *  - other                    → []
 */
export const parseItems = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  return [];
};

/** Pagination info from list response */
export const parsePagination = (r) => {
  const pg = r?.data?.params?.pagination;
  if (!pg) return { currentPage: 1, totalPages: 1, totalItems: 0, totalItemsPerPage: 24, pageRanges: 5 };
  return {
    currentPage       : pg.currentPage        ?? 1,
    totalItems        : pg.totalItems         ?? 0,
    totalItemsPerPage : pg.totalItemsPerPage  ?? 24,
    pageRanges        : pg.pageRanges         ?? 5,
    /* totalPages computed from totalItems / perPage */
    totalPages: Math.ceil((pg.totalItems ?? 0) / (pg.totalItemsPerPage ?? 24)),
  };
};

/** Fetch wrapper */
const get = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`[OPhim] ${res.status} ${path}`);
  return res.json();
};

/** Build query string from params object (skips undefined/null) */
const qs = (params = {}) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, v);
  });
  const str = p.toString();
  return str ? `?${str}` : '';
};

/* ─── ENDPOINTS ─────────────────────────────────────── */

/**
 * Phim trang chủ
 * GET /v1/api/home
 */
export const getHome = () => get('/v1/api/home');

/**
 * Danh sách phim (bộ lọc đầy đủ)
 * GET /v1/api/danh-sach/{slug}
 *
 * @param {string} slug  phim-moi | phim-bo | phim-le | tv-shows | hoat-hinh |
 *                        phim-vietsub | phim-thuyet-minh | phim-long-tien |
 *                        phim-bo-dang-chieu | phim-bo-hoan-thanh |
 *                        phim-sap-chieu | subteam | phim-chieu-rap
 * @param {object} opts  { page, limit, sort_field, sort_type, category, country, year, type }
 */
export const getMovieList = (slug = 'phim-moi', opts = {}) =>
  get(`/v1/api/danh-sach/${slug}${qs({ page: 1, ...opts })}`);

/**
 * Tìm kiếm phim
 * GET /v1/api/tim-kiem?keyword=&page=&limit=
 */
export const searchMovies = (keyword, page = 1, limit = 24) =>
  get(`/v1/api/tim-kiem${qs({ keyword, page, limit })}`);

/**
 * Danh sách thể loại
 * GET /v1/api/the-loai
 */
export const getCategories = () => get('/v1/api/the-loai');

/**
 * Phim theo thể loại
 * GET /v1/api/the-loai/{slug}?page=&limit=&...
 */
export const getByCategory = (slug, opts = {}) =>
  get(`/v1/api/the-loai/${slug}${qs({ page: 1, ...opts })}`);

/**
 * Danh sách quốc gia
 * GET /v1/api/quoc-gia
 */
export const getCountries = () => get('/v1/api/quoc-gia');

/**
 * Phim theo quốc gia
 * GET /v1/api/quoc-gia/{slug}?page=&limit=&...
 */
export const getByCountry = (slug, opts = {}) =>
  get(`/v1/api/quoc-gia/${slug}${qs({ page: 1, ...opts })}`);

/**
 * Danh sách năm phát hành
 * GET /v1/api/nam
 */
export const getYears = () => get('/v1/api/nam');

/**
 * Phim theo năm phát hành
 * GET /v1/api/nam/{year}?page=&...
 */
export const getByYear = (year, opts = {}) =>
  get(`/v1/api/nam/${year}${qs({ page: 1, ...opts })}`);

/**
 * Thông tin chi tiết phim + episodes
 * GET /v1/api/phim/{slug}
 */
export const getMovieDetail = (slug) => get(`/v1/api/phim/${slug}`);

/**
 * Hình ảnh phim
 * GET /v1/api/hinh-anh/{slug}
 */
export const getMovieImages = (slug) => get(`/v1/api/hinh-anh/${slug}`);

/**
 * Diễn viên
 * GET /v1/api/dien-vien/{slug}
 */
export const getActor = (slug) => get(`/v1/api/dien-vien/${slug}`);

/**
 * Từ khóa
 * GET /v1/api/tu-khoa/{slug}
 */
/**
 * Keywords phim (dùng TMDB data)
 * GET /v1/api/phim/{slug}/keywords
 * Response: { success, data: { keywords: [{ name, name_vn, tmdb_keyword_id }] } }
 */
export const getMovieKeywords = (slug) => get(`/v1/api/phim/${slug}/keywords`);

/**
 * Chuyển YouTube URL bất kỳ sang embed URL
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 */
export const getYouTubeEmbed = (url) => {
  if (!url) return '';
  const match =
    url.match(/[?&]v=([A-Za-z0-9_-]{11})/) ||
    url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ||
    url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
  return url;
};
