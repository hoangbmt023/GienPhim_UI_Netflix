import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { getMovieDetail, getByCategory, getByCountry, searchMovies, parseItems, imgUrl } from '@/services/ophimApi';
import { movieApi } from '@/services/movieApi';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/header/Header';
import MovieRow from '@/components/MovieRow/MovieRow';
import FranchiseSection from '@/components/FranchiseSection/FranchiseSection';
import EpisodeList from '@/components/EpisodeList/EpisodeList';
import { useWakeLock } from '@/hooks/useWakeLock';
import { usePiP } from '@/contexts/PiPContext';
import './WatchPage.css';
import { getPath, useLang } from '@/utils/lang';

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
const SkipNextIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" />
  </svg>
);
const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function WatchPage() {
  const { t } = useLang();
  const TYPE_MAP = { series: t.movieDetail.typeSeries, single: t.movieDetail.typeSingle, hoathinh: t.movieDetail.typeHoatHinh, tvshows: t.movieDetail.typeTvshows };
  const { slug } = useParams();
  const [searchParams, setSP] = useSearchParams();
  const navigate = useNavigate();

  const epSlug = searchParams.get('ep') || '';
  const serverIdx = parseInt(searchParams.get('server') || '0', 10);

  const { isAuthenticated, selectedProfile } = useAuth();
  const [movie, setMovie] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [catRelated, setCatRelated] = useState([]);
  const [countryRelated, setCountryRelated] = useState([]);
  const [kwRelated, setKwRelated] = useState([]);
  const [franchise, setFranchise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selServer, setSelServer] = useState(serverIdx);

  /* PiPContext API mới */
  const { registerVideo, registerSlot, startVideo, startPiP,
    hasStarted, isPiP, expandPiP } = usePiP();

  const slotCallbackRef = useCallback((node) => {
    registerSlot(node);
  }, [registerSlot]);

  const wakeLock = useWakeLock();

  useEffect(() => {
    if (hasStarted) { wakeLock.acquire(); }
    else { wakeLock.release(); }
    return () => wakeLock.release();
  }, [hasStarted]);

  useEffect(() => {
    if (isPiP) expandPiP();
  }, []);

  useEffect(() => {
    return () => {
      startPiP();
      wakeLock.release();
    };
  }, []);

  const loadRelatedByKeywords = useCallback(async (slug, currentSlug) => {
    try {
      const r = await searchMovies(slug, 1, 10);
      const items = parseItems(r);
      setKwRelated(items.filter(m => m.slug !== currentSlug).slice(0, 18));
    } catch (_) { }
  }, []);

  useEffect(() => {
    if (isAuthenticated && selectedProfile && slug) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, selectedProfile, slug]);

  const checkFavoriteStatus = async () => {
    try {
      const res = await movieApi.checkFavorite(slug);
      if (res.data.success && res.data.data.isFavorited) {
        setIsSaved(true);
        if (res.data.data.favoriteId) setFavoriteId(res.data.data.favoriteId);
      } else {
        setIsSaved(false);
      }
    } catch (err) {
      console.error('Failed to check favorite status', err);
    }
  };

  const handleSaveMovie = async () => {
    if (!isAuthenticated || !selectedProfile) {
      navigate(getPath('login'));
      return;
    }

    setSaveLoading(true);
    try {
      if (isSaved) {
        await movieApi.removeFavorite(favoriteId || slug);
        setIsSaved(false);
        setFavoriteId(null);
      } else {
        const res = await movieApi.addFavorite(slug);
        setIsSaved(true);
        if (res.data.data?.id) setFavoriteId(res.data.data.id);
      }
    } catch (err) {
      console.error('Lỗi khi lưu/bỏ lưu phim:', err);
    } finally {
      setSaveLoading(false);
    }
  };

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

  useEffect(() => {
    setSelServer(serverIdx);
  }, [serverIdx, epSlug]);

  const currentEp = useMemo(() => {
    if (!movie?.episodes) return null;
    const server = movie.episodes[selServer];
    if (!server) return null;
    return server.server_data.find(e => e.slug === epSlug) || server.server_data[0];
  }, [movie, selServer, epSlug]);

  const nextEp = useMemo(() => {
    if (!movie?.episodes || !currentEp) return null;
    const serverData = movie.episodes[selServer]?.server_data || [];
    const currentIndex = serverData.findIndex(e => e.slug === currentEp.slug);
    if (currentIndex !== -1 && currentIndex < serverData.length - 1) {
      return serverData[currentIndex + 1];
    }
    return null;
  }, [movie, currentEp, selServer]);

  const goEp = (ep, si = selServer) => {
    const next = new URLSearchParams();
    next.set('ep', ep.slug);
    next.set('server', si);
    setSP(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (hasStarted && isAuthenticated && selectedProfile && slug) {
      movieApi.saveHistory(slug, ep.name, 0).catch(e => console.error('Failed to save history', e));
    }
  };

  const embedUrl = currentEp?.link_embed || '';

  useEffect(() => {
    if (embedUrl && movie?.name) {
      registerVideo(embedUrl, movie.name, slug, currentEp?.name || '', currentEp?.slug || '', selServer);
    }
  }, [embedUrl, movie?.name, slug, currentEp?.name, currentEp?.slug, selServer, registerVideo]);

  const handlePlayClick = () => {
    startVideo();
    if (isAuthenticated && selectedProfile && slug && currentEp) {
      movieApi.saveHistory(slug, currentEp.name, 0).catch(e => console.error('Failed to save history', e));
    }
  };

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
        <p>{t.watch?.movieNotFound || 'Không tìm thấy phim.'}</p>
        <Link to={getPath('home')} className="wp-btn">{t.watch?.backHome || 'Về trang chủ'}</Link>
      </div>
    </div>
  );

  const thumbSrc = imgUrl(movie.thumb_url || movie.poster_url);

  return (
    <div className="watch-page">
      <Header />

      <div className="wp-player-wrapper">
        <div className="wp-topnav">
          <button className="wp-back" onClick={() => navigate(`${getPath('movie')}/${slug}`)}>
            <BackIcon /> {t.watch?.movieDetail || 'Chi tiết phim'}
          </button>
          <div className="wp-topnav__center">
            <span className="wp-topnav__title">{movie.name}</span>
            {currentEp && currentEp.name !== 'Full' && (
              <span className="wp-topnav__ep">– {t.watch?.episode || 'Tập'} {currentEp.name}</span>
            )}
          </div>
        </div>

        <div className="wp-player">
          {embedUrl ? (
            <>
              <div ref={slotCallbackRef} className="wp-player__slot" />
              {!hasStarted && (
                <div className="wp-player__cover" onClick={handlePlayClick} style={{ zIndex: 20, pointerEvents: 'auto' }}>
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
              <p>{t.watch?.noSource || 'Không có nguồn phát.'}</p>
            </div>
          )}
        </div>
      </div>

      <div className="wp-content">
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
            {nextEp && (
              <button className="wp-btn wp-btn--next" onClick={() => goEp(nextEp)}>
                <SkipNextIcon /> {t.watch?.nextEpisode || 'Tập tiếp theo'}
              </button>
            )}
            <button 
              className={`wp-btn wp-btn--ghost ${isSaved ? 'saved' : ''}`}
              onClick={handleSaveMovie}
              disabled={saveLoading}
            >
              <BookmarkIcon /> {isSaved ? t.movieDetail.saved : t.movieDetail.save}
            </button>
            <Link to={getPath('myList')} className="wp-btn wp-btn--ghost">
              <HistoryIcon /> {t.watch.history}
            </Link>
            <Link to={`${getPath('movie')}/${slug}`} className="wp-btn wp-btn--detail">
              {t.movieDetail.tabInfo}
            </Link>
          </div>
        </div>

        {movie.content && (
          <p className="wp-desc"
            dangerouslySetInnerHTML={{
              __html: movie.content.slice(0, 380) + (movie.content.length > 380 ? '...' : '')
            }}
          />
        )}

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

      <FranchiseSection franchise={franchise} />

      {kwRelated.length > 0 && (
        <div className="wp-related">
          <MovieRow title={t.movieDetail.relatedMovies} items={kwRelated} seeAllLink={movie.category?.[0] ? `/category/${movie.category[0].slug}` : '/home'} />
        </div>
      )}

      {catRelated.length > 0 && (
        <div className="wp-related">
          <MovieRow title={`${t.movieDetail.sameCategory} · ${movie.category?.[0]?.name || ''}`} items={catRelated} seeAllLink={movie.category?.[0] ? `/category/${movie.category[0].slug}` : '/home'} />
        </div>
      )}

      {countryRelated.length > 0 && (
        <div className="wp-related">
          <MovieRow title={`${t.movieDetail.sameCountry} · ${movie.country?.[0]?.name || ''}`} items={countryRelated} seeAllLink={movie.country?.[0] ? `/country/${movie.country[0].slug}` : '/home'} />
        </div>
      )}
    </div>
  );
}
