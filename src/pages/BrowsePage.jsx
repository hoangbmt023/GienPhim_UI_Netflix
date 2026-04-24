import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  getMovieList, getByCategory, getByCountry, getByYear, searchMovies,
  getCategories, getCountries,
  parseItems, parsePagination, imgUrl,
} from '@/services/ophimApi';
import './BrowsePage.css';

/* ─────────────── ICONS ─────────────── */
const ChevronL = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronR = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ChevronDown = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const FilterIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

/* ─────────────── STATIC DATA ─────────────── */
const YEARS = Array.from({ length: 20 }, (_, i) => 2025 - i);

const SORT_OPTIONS = [
  { value: 'modified.time', label: 'Mới cập nhật' },
  { value: 'year', label: 'Năm phát hành' },
  { value: '_id', label: 'Mới thêm' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'Tất cả loại' },
  { value: 'series', label: 'Phim Bộ' },
  { value: 'single', label: 'Phim Lẻ' },
  { value: 'hoathinh', label: 'Hoạt Hình' },
  { value: 'tvshows', label: 'TV Shows' },
];

const SLUG_LABELS = {
  'phim-moi': 'Phim Mới Cập Nhật',
  'phim-bo': 'Phim Bộ',
  'phim-le': 'Phim Lẻ',
  'tv-shows': 'TV Shows',
  'hoat-hinh': 'Phim Hoạt Hình',
  'phim-vietsub': 'Phim Vietsub',
  'phim-thuyet-minh': 'Phim Thuyết Minh',
  'phim-long-tien': 'Phim Lồng Tiếng',
  'phim-bo-dang-chieu': 'Phim Bộ Đang Chiếu',
  'phim-bo-hoan-thanh': 'Phim Bộ Hoàn Thành',
  'phim-sap-chieu': 'Phim Sắp Chiếu',
  'subteam': 'Subteam',
  'phim-chieu-rap': 'Phim Chiếu Rạp',
};

const LIMIT = 40;

/* ─────────────── FILTER DROPDOWN ─────────────── */
function FilterSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = options.find(o => o.value === value);

  return (
    <div className={`filter-select${open ? ' open' : ''}`} ref={ref}>
      <button className="filter-select__trigger" onClick={() => setOpen(p => !p)}>
        <span className="filter-select__label">{label}: </span>
        <span className="filter-select__value">{current?.label || 'Tất cả'}</span>
        <ChevronDown />
      </button>

      {open && (
        <div className="filter-select__menu">
          {label === 'Năm' && (
            <div style={{ padding: '6px 8px', marginBottom: '4px' }}>
              <input
                type="number"
                placeholder="Nhập năm..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 12px', borderRadius: '6px', outline: 'none', fontSize: '13px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    onChange(e.target.value);
                    setOpen(false);
                  }
                }}
              />
            </div>
          )}
          {options.map(o => (
            <button
              key={o.value}
              className={`filter-select__item${o.value === value ? ' active' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────── BROWSE PAGE ─────────────── */
/**
 * type: 'list' | 'category' | 'country' | 'year'
 * When type='category'  → shows country + year filter
 * When type='country'   → shows category + year filter
 * When type='list'/'year' → shows category + country + year filter
 */
export default function BrowsePage({ type = 'list' }) {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  /* ── URL-driven filter state ── */
  const page = parseInt(searchParams.get('page') || '1', 10);
  const yearFilter = searchParams.get('year') || '';
  const catFilter = searchParams.get('category') || '';
  const ctrFilter = searchParams.get('country') || '';
  const typeFilter = searchParams.get('type') || '';
  const sortField = searchParams.get('sort_field') || 'modified.time';
  const sortType = searchParams.get('sort_type') || 'desc';

  /* ── data state ── */
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, pageRanges: 5 });
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);

  /* ── Fetch filter metadata once ── */
  useEffect(() => {
    getCategories().then(r => {
      const items = parseItems(r);
      if (items.length) setCategories(items);
    }).catch(() => { });
    getCountries().then(r => {
      const items = parseItems(r);
      if (items.length) setCountries(items);
    }).catch(() => { });
  }, []);

  /* ── Fetch movies ── */
  const keywordParam = searchParams.get('keyword') || '';

  const fetchData = useCallback(async (pg) => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const opts = {
        page: pg,
        limit: LIMIT,
        sort_field: sortField,
        sort_type: sortType,
        year: yearFilter || undefined,
        category: catFilter || undefined,
        country: ctrFilter || undefined,
        type: typeFilter || undefined,
      };

      let res;
      if (type === 'search') res = await searchMovies(keywordParam, pg, LIMIT);
      else if (type === 'list') res = await getMovieList(slug, opts);
      else if (type === 'category') res = await getByCategory(slug, opts);
      else if (type === 'country') res = await getByCountry(slug, opts);
      else if (type === 'year') res = await getByYear(slug, opts);

      setItems(parseItems(res));
      const pg2 = parsePagination(res);
      /* map pageRanges from API */
      const totalPages = Math.ceil(
        (pg2.totalItems || 0) / (pg2.totalItemsPerPage || LIMIT)
      );
      setPagination({ ...pg2, totalPages });

      /* Title */
      const t = type === 'search'
        ? `Tìm kiếm: ${keywordParam}`
        : res?.data?.params?.type_slug?.text ||
        res?.data?.type_name ||
        SLUG_LABELS[slug] ||
        slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
      setTitle(t);
      document.title = `${t ? t + ' - ' : ''}GienPhim`;
    } catch (e) {
      console.warn('[BrowsePage]', e);
    } finally {
      setLoading(false);
    }
  }, [slug, type, sortField, sortType, yearFilter, catFilter, ctrFilter, typeFilter, keywordParam]);

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);

  /* ── Update URL params ── */
  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val);
    else next.delete(key);
    next.set('page', '1');   // reset to page 1
    setSearchParams(next);
  };

  const goPage = (p) => {
    if (p < 1 || p > pagination.totalPages) return;
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
  };

  /* ── Pagination range using pageRanges from API ── */
  const pageRange = () => {
    const total = pagination.totalPages;
    const cur = page;
    const half = Math.floor((pagination.pageRanges || 5) / 2);
    const range = [];

    for (let i = Math.max(1, cur - half); i <= Math.min(total, cur + half); i++) {
      range.push(i);
    }
    // Add first/last with ellipsis
    if (range[0] > 2) { range.unshift('...'); range.unshift(1); }
    else if (range[0] === 2) { range.unshift(1); }
    if (range[range.length - 1] < total - 1) { range.push('...'); range.push(total); }
    else if (range[range.length - 1] === total - 1) { range.push(total); }

    return range;
  };

  /* ── Dynamic filter options ── */
  const catOptions = [{ value: '', label: 'Tất cả thể loại' }, ...categories.map(c => ({ value: c.slug, label: c.name }))];
  const ctrOptions = [{ value: '', label: 'Tất cả quốc gia' }, ...countries.map(c => ({ value: c.slug, label: c.name }))];
  const yearOptions = [{ value: '', label: 'Tất cả năm' }, ...YEARS.map(y => ({ value: String(y), label: String(y) }))];
  const sortOptions = SORT_OPTIONS.map(o => ({
    value: `${o.value}|${sortType}`,
    label: o.value === sortField ? (sortType === 'asc' ? `${o.label} ↑` : `${o.label} ↓`) : o.label,
  }));

  /* Check if filter is "active" (has any non-default value) */
  const hasFilter = yearFilter || catFilter || ctrFilter || typeFilter || sortField !== 'modified.time';

  return (
    <div className="browse">
      {/* ── PAGE HEADER ── */}
      <div className="browse__head">
        <div className="browse__head-left">
          <h1 className="browse__title">{title || <span className="skeleton" style={{ width: 200, height: 32, display: 'inline-block', borderRadius: 6 }} />}</h1>
          {!loading && (
            <p className="browse__meta">
              {pagination.totalItems.toLocaleString()} phim
              {hasFilter && <span className="browse__filter-badge"> · Đang lọc</span>}
            </p>
          )}
        </div>
      </div>

      {/* ── FILTER BAR (Ẩn khi tìm kiếm) ── */}
      {type !== 'search' && (
        <div className="browse__filters">
          <div className="browse__filter-icon"><FilterIcon /> Bộ lọc</div>

          {/* Sort */}
          <FilterSelect
            label="Sắp xếp"
            value={`${sortField}|${sortType}`}
            options={[
              { value: 'modified.time|desc', label: 'Mới cập nhật' },
              { value: 'modified.time|asc', label: 'Cũ nhất' },
              { value: 'year|desc', label: 'Năm mới nhất' },
              { value: 'year|asc', label: 'Năm cũ nhất' },
            ]}
            onChange={(v) => {
              const [sf, st] = v.split('|');
              const next = new URLSearchParams(searchParams);
              next.set('sort_field', sf); next.set('sort_type', st); next.set('page', '1');
              setSearchParams(next);
            }}
          />

          {/* Năm */}
          <FilterSelect
            label="Năm"
            value={yearFilter}
            options={yearOptions}
            onChange={(v) => setFilter('year', v)}
          />

          {/* Thể loại (ẩn khi đang ở trang thể loại) */}
          {type !== 'category' && (
            <FilterSelect
              label="Thể loại"
              value={catFilter}
              options={catOptions}
              onChange={(v) => setFilter('category', v)}
            />
          )}

          {/* Quốc gia (ẩn khi đang ở trang quốc gia) */}
          {type !== 'country' && (
            <FilterSelect
              label="Quốc gia"
              value={ctrFilter}
              options={ctrOptions}
              onChange={(v) => setFilter('country', v)}
            />
          )}

          {/* Loại phim */}
          <FilterSelect
            label="Loại"
            value={typeFilter}
            options={TYPE_OPTIONS}
            onChange={(v) => setFilter('type', v)}
          />

          {/* Clear filters */}
          {hasFilter && (
            <button
              className="browse__filter-clear"
              onClick={() => {
                const next = new URLSearchParams();
                next.set('page', '1');
                setSearchParams(next);
              }}
            >
              Xóa bộ lọc ✕
            </button>
          )}
        </div>
      )}

      {/* ── MOVIE GRID ── */}
      {loading ? (
        <div className="browse__grid">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="browse-card browse-card--skeleton">
              <div className="browse-card__img-wrap skeleton" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="browse__empty">
          <p>Không tìm thấy phim phù hợp.</p>
          <button className="browse__filter-clear" style={{ marginTop: 16 }} onClick={() => setSearchParams({ page: '1' })}>
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="browse__grid">
          {items.map((m) => (
            <Link key={m._id} to={`/phim/${m.slug}`} className="browse-card">
              <div className="browse-card__img-wrap">
                <img
                  className="browse-card__img"
                  src={imgUrl(m.poster_url || m.thumb_url)}
                  alt={m.name}
                  loading="lazy"
                  onError={(e) => {
                    const fb = imgUrl(m.thumb_url);
                    if (e.currentTarget.src !== fb) e.currentTarget.src = fb;
                  }}
                />
                {m.quality && <span className="browse-card__quality">{m.quality}</span>}
                {/* Play icon – shows on hover */}
                <div className="browse-card__overlay">
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                {/* Text overlay inside image – uniform height guaranteed */}
                <div className="browse-card__info">
                  <p className="browse-card__name">{m.name}</p>
                  <div className="browse-card__meta">
                    {m.year && <span className="browse-card__year">{m.year}</span>}
                    {m.episode_current && <span className="browse-card__ep-text">{m.episode_current}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {pagination.totalPages > 1 && (
        <div className="browse__pagination">
          {/* Jump to first */}
          <button
            className="browse__pg-btn browse__pg-btn--arrow"
            onClick={() => goPage(1)}
            disabled={page <= 1}
            title="Trang đầu"
          >
            «
          </button>

          <button
            className="browse__pg-btn browse__pg-btn--arrow"
            onClick={() => goPage(page - 1)}
            disabled={page <= 1}
            aria-label="Trang trước"
          >
            <ChevronL />
          </button>

          {pageRange().map((p, i) =>
            p === '...' ? (
              <span key={`d-${i}`} className="browse__pg-dots">…</span>
            ) : (
              <button
                key={p}
                className={`browse__pg-btn${p === page ? ' active' : ''}`}
                onClick={() => goPage(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            className="browse__pg-btn browse__pg-btn--arrow"
            onClick={() => goPage(page + 1)}
            disabled={page >= pagination.totalPages}
            aria-label="Trang sau"
          >
            <ChevronR />
          </button>

          {/* Jump to last */}
          <button
            className="browse__pg-btn browse__pg-btn--arrow"
            onClick={() => goPage(pagination.totalPages)}
            disabled={page >= pagination.totalPages}
            title="Trang cuối"
          >
            »
          </button>

          {/* Page info */}
          <span className="browse__pg-info">
            {page} / {pagination.totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
