import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  getMovieList, getByCategory, getByCountry, getByYear, searchMovies,
  getCategories, getCountries,
  parseItems, parsePagination, imgUrl,
} from '@/services/ophimApi';
import Pagination from '@/components/Pagination/Pagination';
import ImageWithFallback from '@/components/ImageWithFallback/ImageWithFallback';
import './BrowsePage.css';
import { getPath, useLang } from '@/utils/lang';

// Chevron icons moved to Pagination component
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
  { value: 'modified.time', label: 'M\u1edbi c\u1eadp nh\u1eadt' },
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

const LIMIT = 42;

/* ─────────────── FILTER DROPDOWN ─────────────── */
function FilterSelect({ label, value, options, onChange }) {
  const { t } = useLang();
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
        <span className="filter-select__value">{current?.label || (t.browse.all || 'Tất cả')}</span>
        <ChevronDown />
      </button>

      {open && (
        <div className="filter-select__menu">
          {label === t.browse.year && (
            <div style={{ padding: '6px 8px', marginBottom: '4px' }}>
              <input
                type="number"
                placeholder={t.browse.yearPlaceholder}
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
export default function BrowsePage({ type = 'list' }) {
  const { t } = useLang();
  
  const TYPE_OPTIONS = [
    { value: '', label: t.browse.allTypes },
    { value: 'series', label: t.browse.typeSeries },
    { value: 'single', label: t.browse.typeSingle },
    { value: 'hoathinh', label: t.browse.typeAnimation },
    { value: 'tvshows', label: t.browse.typeTv },
  ];
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
      const totalPages = Math.ceil(
        (pg2.totalItems || 0) / (pg2.totalItemsPerPage || LIMIT)
      );
      setPagination({ ...pg2, totalPages });

      /* Title */
      let t_title = '';
      if (type === 'search') {
        t_title = `${t.browse.searchResult}: ${keywordParam}`;
      } else {
        t_title = res?.data?.params?.type_slug?.text ||
          res?.data?.type_name ||
          t.browse.slugLabels[slug] ||
          SLUG_LABELS[slug] ||
          slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
      }
      setTitle(t_title);
      document.title = `${t_title ? t_title + ' - ' : ''}GienPhim`;
    } catch (e) {
      console.warn('[BrowsePage]', e);
    } finally {
      setLoading(false);
    }
  }, [slug, type, sortField, sortType, yearFilter, catFilter, ctrFilter, typeFilter, keywordParam, t]);

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

  /* ── Dynamic filter options ── */
  const catOptions = [{ value: '', label: t.browse.allCategories }, ...categories.map(c => ({ value: c.slug, label: c.name }))];
  const ctrOptions = [{ value: '', label: t.browse.allCountries }, ...countries.map(c => ({ value: c.slug, label: c.name }))];
  const yearOptions = [{ value: '', label: t.browse.allYears }, ...YEARS.map(y => ({ value: String(y), label: String(y) }))];

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
              {pagination.totalItems.toLocaleString()} {t.browse.moviesCount}
              {hasFilter && <span className="browse__filter-badge"> · {t.browse.filtering}</span>}
            </p>
          )}
        </div>
      </div>

      {/* ── FILTER BAR (Ẩn khi tìm kiếm) ── */}
      {type !== 'search' && (
        <div className="browse__filters">
          <div className="browse__filter-icon"><FilterIcon /> {t.browse.filters}</div>

          {/* Sort */}
          <FilterSelect
            label={t.browse.sort}
            value={`${sortField}|${sortType}`}
            options={[
              { value: 'modified.time|desc', label: t.browse.sortNew },
              { value: 'modified.time|asc', label: t.browse.sortOld },
              { value: 'year|desc', label: t.browse.sortYear },
              { value: 'year|asc', label: t.browse.sortYearOld },
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
            label={t.browse.year}
            value={yearFilter}
            options={yearOptions}
            onChange={(v) => setFilter('year', v)}
          />

          {/* Thể loại (ẩn khi đang ở trang thể loại) */}
          {type !== 'category' && (
            <FilterSelect
              label={t.browse.category}
              value={catFilter}
              options={catOptions}
              onChange={(v) => setFilter('category', v)}
            />
          )}

          {/* Quốc gia (ẩn khi đang ở trang quốc gia) */}
          {type !== 'country' && (
            <FilterSelect
              label={t.browse.country}
              value={ctrFilter}
              options={ctrOptions}
              onChange={(v) => setFilter('country', v)}
            />
          )}

          {/* Loại phim */}
          <FilterSelect
            label={t.browse.type}
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
              {t.browse.clearFilter} ✕
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
          <p>{t.browse.noMoviesFound}</p>
          <button className="browse__filter-clear" style={{ marginTop: 16 }} onClick={() => setSearchParams({ page: '1' })}>
            {t.browse.clearFilter}
          </button>
        </div>
      ) : (
        <div className="browse__grid">
          {items.map((m) => (
            <Link key={m._id} to={`${getPath('movie')}/${m.slug}`} className="browse-card">
              <div className="browse-card__img-wrap">
                <ImageWithFallback
                  className="browse-card__img"
                  src={imgUrl(m.thumb_url ?? m.poster_url)}
                  fallback={imgUrl(m.thumb_url)}
                  alt={m.name}
                />
                {m.quality && <span className="browse-card__quality">{m.quality}</span>}
                {m.lang && <span className="browse-card__lang">{m.lang}</span>}
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
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        pageRanges={pagination.pageRanges || 5}
        onPageChange={goPage}
      />
    </div>
  );
}
