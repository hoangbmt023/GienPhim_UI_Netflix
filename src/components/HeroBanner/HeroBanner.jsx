import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { imgUrl, getMovieImages } from '@/services/ophimApi';
import ImageWithFallback from '@/components/ImageWithFallback/ImageWithFallback';
import './HeroBanner.css';
import { getPath, useLang } from '@/utils/lang';

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '').trim();

const PlaySvg = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path d="M8 5v14l11-7z" fill="currentColor" />
  </svg>
);

const InfoSvg = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="8" strokeWidth="3.5" />
    <line x1="12" y1="12" x2="12" y2="16" />
  </svg>
);

const StarSvg = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="#f5c518">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const MapPinSvg = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const ClockSvg = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const AUTO_INTERVAL = 8000;

/**
 * HeroBanner
 * Props:
 *   movies  {Array}   – list (max 8 shown)
 *   loading {boolean}
 */
export default function HeroBanner({ movies = [], loading = false }) {
  const { t } = useLang();
  const items = movies.slice(0, 8);
  const [activeIdx, setActiveIdx] = useState(0);
  const [backdropCache, setBackdropCache] = useState({});
  const timerRef = useRef(null);
  const heroRef = useRef(null);
  const swipeStartX = useRef(null);
  const swipeStartY = useRef(null);

  // Fetch hình ảnh bổ sung nếu thiếu hình ngang hoặc trên Desktop
  useEffect(() => {
    if (!items.length) return;

    items.forEach(movie => {
      if (backdropCache[movie.slug]) return;

      // Gọi API cho mọi phim trong Hero Banner để đảm bảo chất lượng hình ảnh tốt nhất
      getMovieImages(movie.slug)
        .then(res => {
          if (res.success && res.data?.images) {
            const backdrop = res.data.images.find(img => img.type === 'backdrop');
            if (backdrop) {
              const baseUrl = res.data.image_sizes?.backdrop?.original || 'https://image.tmdb.org/t/p/original';
              const fullUrl = `${baseUrl}${backdrop.file_path}`;
              setBackdropCache(prev => ({ ...prev, [movie.slug]: fullUrl }));
            }
          }
        })
        .catch(err => console.error("Lỗi lấy ảnh TMDB:", err));
    });
  }, [items, backdropCache]);

  const goTo = useCallback((idx) => {
    setActiveIdx(idx);
  }, []);

  const next = useCallback(() => {
    setActiveIdx(i => (i + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setActiveIdx(i => (i - 1 + items.length) % items.length);
  }, [items.length]);

  /* Swipe detection via imperative listeners on hero element.
   * Using refs avoids stale closures and re-render interference. */
  const nextRef = useRef(next);
  const prevRef = useRef(prev);
  useEffect(() => { nextRef.current = next; }, [next]);
  useEffect(() => { prevRef.current = prev; }, [prev]);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const onStart = (e) => {
      // Ignore touches starting inside the thumbnail strip
      if (e.target.closest('.hero__thumbs')) return;
      swipeStartX.current = e.touches[0].clientX;
      swipeStartY.current = e.touches[0].clientY;
    };

    const onEnd = (e) => {
      if (swipeStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - swipeStartX.current;
      const dy = e.changedTouches[0].clientY - swipeStartY.current;
      swipeStartX.current = null;
      // Trigger if horizontal movement exceeds threshold and is more horizontal than vertical
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) nextRef.current();
        else prevRef.current();
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
    };
  }, [items.length]); // re-attach when movies load (heroRef is null during skeleton)

  /* Auto-advance – luôn chạy, không pause khi hover */
  useEffect(() => {
    if (!items.length) return;
    timerRef.current = setTimeout(next, AUTO_INTERVAL);
    return () => clearTimeout(timerRef.current);
  }, [activeIdx, items.length, next]);

  if (loading) {
    return (
      <div className="hero">
        <div className="hero__skeleton">
          <div className="skeleton" />
        </div>
      </div>
    );
  }

  if (!items.length) return null;

  const movie = items[activeIdx];

  /* Ưu tiên ảnh từ TMDB Cache -> thumb_url -> poster_url */
  const posterSrc = (m) => {
    if (backdropCache[m.slug]) return backdropCache[m.slug];
    return imgUrl(m?.thumb_url || m?.poster_url);
  };

  /* Meta info */
  const countries = movie?.country?.map(c => c.name).join(', ') || '';
  const imdb      = movie?.imdb?.vote_average;
  const tmdb      = movie?.tmdb?.vote_average;
  const desc      = stripHtml(movie?.content || movie?.description || '');

  return (
    <section 
      ref={heroRef}
      className="hero" 
      aria-label={t.common.featuredMovies}
    >
      {/* Crossfade backdrops */}
      <div className="hero__backdrop-wrap" aria-hidden="true">
        {items.map((m, i) => (
          <ImageWithFallback
            key={m._id}
            wrapperClassName={`hero__backdrop ${i === activeIdx ? 'visible' : ''}`}
            className="hero__backdrop-img"
            src={posterSrc(m)}
            alt=""
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      <div className="hero__grad-left"   aria-hidden="true" />
      <div className="hero__grad-bottom" aria-hidden="true" />

      {/* Content */}
      <div className="hero__content">
        <div className="hero__text" key={movie._id}>

          {/* Badges */}
          <div className="hero__badge-row">
            {imdb > 0 && (
              <span className="hero__badge hero__badge--imdb">
                <span className="imdb-text">IMDb:</span> {imdb.toFixed(1)}
              </span>
            )}
            {movie.episode_current && (
              <span className="hero__badge hero__badge--ep">{movie.episode_current}</span>
            )}
            {movie.year && <span className="hero__badge">{movie.year}</span>}
            {movie.quality && (
              <span className="hero__badge hero__badge--quality">{movie.quality}</span>
            )}
            {movie.lang && <span className="hero__badge">{movie.lang}</span>}
          </div>

          {/* Title */}
          <h1 className="hero__title">{movie.name}</h1>

          {movie.origin_name && (
            <p className="hero__origin">{movie.origin_name}</p>
          )}

          {/* Genre tags */}
          {movie.category?.length > 0 && (
            <div className="hero__tags">
              {movie.category.map((c) => (
                <Link
                  key={c.id}
                  to={`${getPath('category')}/${c.slug}`}
                  className="hero__tag"
                  onClick={(e) => e.stopPropagation()}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {/* Meta row: thời lượng / quốc gia / rating */}
          {(movie.time || countries || tmdb > 0) && (
            <div className="hero__meta">
              {movie.time && (
                <span className="hero__meta-item hero__meta-item--time">
                  <ClockSvg /> {movie.time}
                </span>
              )}
              {countries && (
                <span className="hero__meta-item hero__meta-item--land">
                  <MapPinSvg /> {countries}
                </span>
              )}
              {!imdb && tmdb > 0 && (
                <span className="hero__meta-item hero__meta-item--tmdb">
                  ★ TMDB {tmdb.toFixed(1)}
                </span>
              )}
            </div>
          )}

          {/* Description – nếu có (từ detail endpoint) */}
          {desc && <p className="hero__desc">{desc}</p>}

          {/* Actions */}
          <div className="hero__actions">
            <Link to={`${getPath('movie')}/${movie.slug}`} className="hero__play-btn">
              <PlaySvg /> {t.myList.watchNow}
            </Link>
            <Link to={`${getPath('movie')}/${movie.slug}`} className="hero__info-btn">
              <InfoSvg /> {t.common.info}
            </Link>
          </div>
        </div>
      </div>

      {/* Thumbnail strip – ẩn trên mobile bằng CSS */}
      <div className="hero__thumbs" aria-label={t.common.selectMovie}>
        {items.map((m, i) => (
          <button
            key={m._id}
            type="button"
            className={`hero__thumb-wrap ${i === activeIdx ? 'active' : ''}`}
            title={m.name}
            onClick={(e) => { goTo(i); e.currentTarget.blur(); }}
          >
            <ImageWithFallback
              key={m._id}
              src={imgUrl(m.thumb_url)}
              alt={m.name}
              className="hero__thumb-img"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
