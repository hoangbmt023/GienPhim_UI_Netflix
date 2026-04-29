import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { getMovieDetail, getByCategory, getByCountry, getMovieKeywords, searchMovies, parseItems, imgUrl } from '@/services/ophimApi';
import Header from '@/components/header/Header';
import MovieRow from '@/components/MovieRow/MovieRow';
import FranchiseSection from '@/components/FranchiseSection/FranchiseSection';
import EpisodeList from '@/components/EpisodeList/EpisodeList';
import { useWakeLock } from '@/hooks/useWakeLock';
import { usePiP } from '@/contexts/PiPContext';
import './WatchPage.css';

/* ── Icons ── */
const BackIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

const TYPE_MAP = { series: 'Phim Bộ', single: 'Phim Lẻ', hoathinh: 'Hoạt Hình', tvshows: 'TV Shows' };

export default function WatchPage() {
  const { slug } = useParams();
  const [searchParams, setSP] = useSearchParams();
  const navigate = useNavigate();

  const epSlug = searchParams.get('ep') || '';
  const serverIdx = parseInt(searchParams.get('server') || '0', 10);

  const [movie, setMovie] = useState(null);
  const [catRelated, setCatRelated] = useState([]);
  const [countryRelated, setCountryRelated] = useState([]);
  const [kwRelated, setKwRelated] = useState([]);
  const [franchise, setFranchise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selServer, setSelServer] = useState(serverIdx);

  /* PiPContext API mới */
  const { registerVideo, registerSlot, startVideo, startPiP,
    hasStarted, isPiP, expandPiP } = usePiP();

  /**
   * Callback ref cho slot div.
   * React gọi hàm này với DOM element khi div MOUNT (sau khi data load xong),
   * và với null khi div UNMOUNT.
   * Giải quyết vấn đề timing: slot chưa tồn tại khi WatchPage lần đầu mount (loading).
   */
  const slotCallbackRef = useCallback((node) => {
    registerSlot(node); // node = DOM element hoặc null
  }, [registerSlot]);

  const wakeLock = useWakeLock();

  /* Giữ màn hình sáng khi đang xem */
  useEffect(() => {
    if (hasStarted) { wakeLock.acquire(); }
    else { wakeLock.release(); }
    return () => wakeLock.release();
  }, [hasStarted]);

  /* Mount: nếu PiP đang active (user navigate trực tiếp, không qua expand button) → tắt PiP */
  useEffect(() => {
    if (isPiP) expandPiP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Cleanup khi rời trang → bật PiP (chỉ khi hasStarted) */
  useEffect(() => {
    return () => {
      startPiP();
      wakeLock.release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRelatedByKeywords = useCallback(async (slug, currentSlug) => {
    try {
      const r = await getMovieKeywords(slug);
      const keywords = r?.data?.keywords ?? [];
      if (!keywords.length) return;

      /* Take up to 3 most meaningful keywords */
      const terms = keywords
        .filter(k => k.name_vn && k.name_vn.length > 3)
        .slice(0, 3)
        .map(k => k.name_vn || k.name);

      const results = await Promise.all(
        terms.map(kw => searchMovies(kw, 1, 10).then(parseItems).catch(() => []))
      );

      const seen = new Set([currentSlug]);
      const merged = results.flat().filter(m => {
        if (seen.has(m.slug)) return false;
        seen.add(m.slug);
        return true;
      });
      setKwRelated(merged.slice(0, 18));
    } catch (_) { }
  }, []);

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    getMovieDetail(slug)
      .then(res => {
        const item = res?.movie || res?.data?.item || res?.item;
        if (!item) return;
        setMovie(item);
        document.title = `Xem phim ${item.name || ''} - GienPhim`;

        const cat = item.category?.[0]?.slug;
        if (cat) {
          getByCategory(cat, { page: 1, limit: 14 })
            .then(r2 => setCatRelated(parseItems(r2).filter(m => m.slug !== slug)))
            .catch(() => { });
        }

        const country = item.country?.[0]?.slug;
        if (country) {
          getByCountry(country, { page: 1, limit: 14 })
            .then(rC => setCountryRelated(parseItems(rC).filter(m => m.slug !== slug)))
            .catch(() => { });
        }

        /* Franchise related */
        const tmdbId = item.tmdb?.id;
        if (tmdbId) {
          searchMovies(tmdbId, 1).then(rF => {
            const items = parseItems(rF).filter(m =>
              m.slug !== slug && String(m.tmdb?.id) === String(tmdbId)
            );
            if (items.length > 0) setFranchise(items);
          }).catch(() => { });
        }

        loadRelatedByKeywords(slug, slug);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [slug]);

  /* Chuyển tập / server */
  useEffect(() => {
    setSelServer(serverIdx);
  }, [serverIdx, epSlug]);

  /* Current episode */
  const currentEp = useMemo(() => {
    if (!movie?.episodes) return null;
    const server = movie.episodes[selServer];
    if (!server) return null;
    return server.server_data.find(e => e.slug === epSlug) || server.server_data[0];
  }, [movie, selServer, epSlug]);

  const goEp = (ep, si = selServer) => {
    const next = new URLSearchParams();
    next.set('ep', ep.slug);
    next.set('server', si);
    setSP(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const embedUrl = currentEp?.link_embed || '';

  /* Đăng ký video vào PiPContext */
  useEffect(() => {
    if (embedUrl && movie?.name) {
      registerVideo(embedUrl, movie.name, slug, currentEp?.name || '');
    }
  }, [embedUrl, movie?.name, slug, currentEp?.name, registerVideo]);

  if (loading) return (
    <div className="watch-page">
      <Header />
      <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', borderRadius: 0, marginTop: 'var(--header-height)' }} />
    </div>
  );

  if (!movie) return (
    <div className="watch-page watch-page--error">
      <Header />
      <div className="wp-error-body">
        <p>Không tìm thấy phim.</p>
        <Link to="/home" className="wp-btn">Về trang chủ</Link>
      </div>
    </div>
  );

  const thumbSrc = imgUrl(movie.thumb_url || movie.poster_url);
  const hasMultiEp = (movie.episodes?.[selServer]?.server_data?.length || 0) > 1;

  return (
    <div className="watch-page">
      <Header />

      {/* ── PLAYER SECTION ── */}
      <div className="wp-player-wrapper">
        <div className="wp-topnav">
          <button className="wp-back" onClick={() => navigate(`/phim/${slug}`)}>
            <BackIcon /> Chi tiết phim
          </button>
          <div className="wp-topnav__center">
            <span className="wp-topnav__title">{movie.name}</span>
            {currentEp && currentEp.name !== 'Full' && (
              <span className="wp-topnav__ep">– Tập {currentEp.name}</span>
            )}
          </div>
        </div>

        <div className="wp-player">
          {embedUrl ? (
            <>
              {/*
                Slot placeholder: PersistentPlayer (trong App.jsx) sẽ tự đođạc
                và overlay iframe fixed lên đây. Không bao giờ có iframe trực tiếp.
              */}
              <div
                ref={slotCallbackRef}
                className="wp-player__slot"
              />

              {/* Overlay: chỉ hiện trước khi user bấm play lần đầu */}
              {!hasStarted && (
                <div
                  className="wp-player__cover"
                  onClick={startVideo}
                  style={{
                    zIndex: 20,
                    pointerEvents: 'auto'
                  }}
                >
                  <img src={imgUrl(movie.thumb_url || movie.poster_url)} alt="Cover" />
                  <div className="wp-player__overlay">
                    <button className="wp-player__play-btn">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="wp-player__empty">
              <p>Không có nguồn phát.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENT BELOW PLAYER ── */}
      <div className="wp-content">

        {/* Movie info strip */}
        <div className="wp-info">
          <img src={thumbSrc} alt={movie.name} className="wp-info__thumb" />
          <div className="wp-info__meta">
            <h1 className="wp-info__title">{movie.name}</h1>
            {movie.origin_name && <p className="wp-info__origin">{movie.origin_name}</p>}
            <div className="wp-info__badges">
              {movie.year && <span>{movie.year}</span>}
              {movie.quality && <span className="wp-badge wp-badge--red">{movie.quality}</span>}
              {movie.lang && <span>{movie.lang}</span>}
              {movie.type && <span>{TYPE_MAP[movie.type] || movie.type}</span>}
              {movie.episode_current && (
                <span className="wp-badge wp-badge--green">{movie.episode_current}</span>
              )}
            </div>
          </div>
          <div className="wp-info__actions">
            <button className="wp-btn wp-btn--ghost">
              <BookmarkIcon /> Yêu thích
            </button>
            <Link to={`/phim/${slug}`} className="wp-btn wp-btn--detail">
              Chi tiết phim
            </Link>
          </div>
        </div>

        {/* Description */}
        {movie.content && (
          <p className="wp-desc"
            dangerouslySetInnerHTML={{
              __html: movie.content.slice(0, 380) + (movie.content.length > 380 ? '...' : '')
            }}
          />
        )}

        {/* ── EPISODE LIST ── */}
        <EpisodeList
          movie={movie}
          currentEpSlug={currentEp?.slug}
          onEpClick={(ep, si) => {
            setSelServer(si);
            goEp(ep, si);
          }}
          initialServer={selServer}
        />
      </div>

      {/* ── RELATED – FRANCHISE (Phim trong bộ) ── */}
      <FranchiseSection franchise={franchise} />

      {/* ── RELATED – Keyword-based ── */}
      {kwRelated.length > 0 && (
        <div className="wp-related">
          <MovieRow
            title="Phim liên quan"
            items={kwRelated}
            seeAllLink={movie.category?.[0] ? `/the-loai/${movie.category[0].slug}` : '/home'}
          />
        </div>
      )}

      {/* ── RELATED – Category-based ── */}
      {catRelated.length > 0 && (
        <div className="wp-related">
          <MovieRow
            title={`Cùng thể loại · ${movie.category?.[0]?.name || ''}`}
            items={catRelated}
            seeAllLink={movie.category?.[0] ? `/the-loai/${movie.category[0].slug}` : '/home'}
          />
        </div>
      )}

      {/* ── RELATED – Country-based ── */}
      {countryRelated.length > 0 && (
        <div className="wp-related">
          <MovieRow
            title={`Cùng quốc gia · ${movie.country?.[0]?.name || ''}`}
            items={countryRelated}
            seeAllLink={movie.country?.[0] ? `/quoc-gia/${movie.country[0].slug}` : '/home'}
          />
        </div>
      )}
    </div>
  );
}
