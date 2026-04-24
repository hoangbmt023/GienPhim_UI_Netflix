import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { getMovieDetail, getByCategory, getByCountry, getMovieKeywords, searchMovies, parseItems, imgUrl } from '@/services/ophimApi';
import Header from '@/components/header/Header';
import MovieRow from '@/components/MovieRow/MovieRow';
import FranchiseSection from '@/components/FranchiseSection/FranchiseSection';
import './WatchPage.css';

/* ── Icons ── */
const BackIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ListIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
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
  const [epSearch, setEpSearch] = useState('');
  const [isPlaying, setIsPlaying] = useState(() => window.innerWidth <= 767);

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
    setEpSearch('');
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
        const baseSlug = slug.replace(/-phan-\d+$/i, '').replace(/-season-\d+$/i, '').replace(/-\d{1,2}$/, '');
        if (baseSlug) {
          searchMovies(baseSlug.replace(/-/g, ' '), 1).then(rF => {
            const items = parseItems(rF).filter(m => m.slug !== slug && m.slug.startsWith(baseSlug));
            if (items.length > 0) setFranchise(items);
          }).catch(() => {});
        }

        loadRelatedByKeywords(slug, slug);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => { 
    setSelServer(serverIdx); 
    setIsPlaying(false);
  }, [serverIdx, epSlug]);

  /* Current episode */
  const currentEp = useMemo(() => {
    if (!movie?.episodes) return null;
    const server = movie.episodes[selServer];
    if (!server) return null;
    return server.server_data.find(e => e.slug === epSlug) || server.server_data[0];
  }, [movie, selServer, epSlug]);

  /* Filtered episode list */
  const filteredEps = useMemo(() => {
    const server = movie?.episodes?.[selServer];
    if (!server) return [];
    if (!epSearch.trim()) return server.server_data;
    return server.server_data.filter(ep =>
      ep.name.toLowerCase().includes(epSearch.toLowerCase())
    );
  }, [movie, selServer, epSearch]);

  const goEp = (ep, si = selServer) => {
    const next = new URLSearchParams();
    next.set('ep', ep.slug);
    next.set('server', si);
    setSP(next);
  };

  const embedUrl = currentEp?.link_embed || '';

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

      {/* ── TOPNAV ── */}
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

      {/* ── PLAYER – matching content width ── */}
      <div className="wp-player-wrapper">
        <div className="wp-player">
          {embedUrl ? (
            isPlaying ? (
              <iframe
                key={embedUrl}
                src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
                title={movie.name}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="wp-player__cover" onClick={() => setIsPlaying(true)}>
                <img src={imgUrl(movie.thumb_url || movie.poster_url)} alt="Cover" />
                <div className="wp-player__overlay">
                  <button className="wp-player__play-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                </div>
              </div>
            )
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
          <Link to={`/phim/${slug}`} className="wp-btn wp-btn--detail">
            Chi tiết phim
          </Link>
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
        {movie.episodes?.length > 0 && (
          <div className="wp-episodes">
            <div className="wp-episodes__head">
              <div className="wp-episodes__left">
                <ListIcon />
                <h2 className="wp-episodes__title">Danh sách tập</h2>
                {hasMultiEp && (
                  <span className="wp-episodes__count">
                    {movie.episodes[selServer]?.server_data?.length} tập
                  </span>
                )}
              </div>

              <div className="wp-episodes__right">
                {/* Server tabs */}
                {movie.episodes.length > 1 && (
                  <div className="wp-servers">
                    {movie.episodes.map((sv, si) => (
                      <button
                        key={si}
                        className={`wp-server-btn${selServer === si ? ' active' : ''}`}
                        onClick={() => {
                          setSelServer(si);
                          const ep0 = sv.server_data[0];
                          if (ep0) goEp(ep0, si);
                        }}
                      >
                        {sv.server_name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Episode search */}
                {hasMultiEp && (
                  <input
                    className="wp-ep-search"
                    type="text"
                    placeholder="Tìm tập..."
                    value={epSearch}
                    onChange={e => setEpSearch(e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* Episode grid */}
            <div className="wp-ep-grid">
              {filteredEps.map(ep => {
                const isActive = ep.slug === currentEp?.slug;
                return (
                  <button
                    key={ep.slug}
                    className={`wp-ep-btn${isActive ? ' active' : ''}`}
                    onClick={() => goEp(ep, selServer)}
                    title={`Tập ${ep.name}`}
                  >
                    {ep.name}
                  </button>
                );
              })}
              {filteredEps.length === 0 && (
                <p className="wp-ep-empty">Không tìm thấy tập.</p>
              )}
            </div>
          </div>
        )}
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
