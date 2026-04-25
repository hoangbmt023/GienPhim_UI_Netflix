import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getMovieDetail, getMovieKeywords, getMovieImages,
  getByCategory, getByCountry, searchMovies,
  parseItems, imgUrl, getYouTubeEmbed,
} from '@/services/ophimApi';
import MovieRow from '@/components/MovieRow/MovieRow';
import './MovieDetailPage.css';

/* ─── Netflix-style Icons ─── */
const IconPlay = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M5 3l14 9-14 9V3z"/>
  </svg>
);
const IconBookmark = () => (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
  </svg>
);
const IconFilm = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8" strokeWidth="2.5"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
  </svg>
);
const IconChevRight = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

/* ─── Constants ─── */
const TYPE_MAP = { series:'Phim Bộ', single:'Phim Lẻ', hoathinh:'Hoạt Hình', tvshows:'TV Shows' };
const TABS = [
  { id:'info',    label:'Thông tin' },
  { id:'cast',    label:'Diễn viên' },
  { id:'trailer', label:'Trailer' },
  { id:'gallery', label:'Ảnh' },
];

export default function MovieDetailPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();

  const [movie,       setMovie]       = useState(null);
  const [breadcrumb,  setBreadcrumb]  = useState([]);
  const [images,      setImages]      = useState([]);
  const [kwRelated,      setKwRelated]      = useState([]);
  const [catRelated,     setCatRelated]     = useState([]);
  const [countryRelated, setCountryRelated] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [tab,         setTab]         = useState('info');
  const [lightbox,    setLightbox]    = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);

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
    } catch (_) {}
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    setTab('info');
    setDescExpanded(false);

    getMovieDetail(slug)
      .then(r => {
        const item = r?.data?.item;
        const bc   = r?.data?.breadCrumb ?? [];
        if (!item) return;
        setMovie(item);
        setBreadcrumb(bc);
        document.title = `${item.name || 'Chi tiết phim'} - GienPhim`;

        /* Category related */
        const cat = item.category?.[0]?.slug;
        if (cat) {
          getByCategory(cat, { page: 1, limit: 16 })
            .then(r2 => setCatRelated(parseItems(r2).filter(m => m.slug !== slug)))
            .catch(() => {});
        }

        /* Country related */
        const country = item.country?.[0]?.slug;
        if (country) {
          getByCountry(country, { page: 1, limit: 16 })
            .then(rC => setCountryRelated(parseItems(rC).filter(m => m.slug !== slug)))
            .catch(() => {});
        }

        /* Keyword related */
        loadRelatedByKeywords(slug, slug);

        /* Images */
        getMovieImages(slug)
          .then(r3 => setImages(r3?.data?.items ?? []))
          .catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, loadRelatedByKeywords]);

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="movie-detail">
      <div className="md-hero md-hero--skeleton">
        <div className="skeleton" style={{ width:'100%', height:'100%', borderRadius:0 }} />
      </div>
      <div className="md-body">
        <div style={{ display:'flex', flexDirection:'column', gap:12, paddingTop:32 }}>
          <div className="skeleton" style={{ width:280, height:36 }} />
          <div className="skeleton" style={{ width:200, height:20 }} />
          <div className="skeleton" style={{ width:'70%', height:64 }} />
        </div>
      </div>
    </div>
  );

  if (!movie) return (
    <div className="movie-detail" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:16 }}>
      <p style={{ color:'var(--text-muted)', fontSize:16 }}>Không tìm thấy phim.</p>
      <Link to="/home" className="md-btn md-btn--primary">Về trang chủ</Link>
    </div>
  );

  /* ── Episode data ── */
  const firstServer = movie.episodes?.[0];
  const firstEp     = firstServer?.server_data?.[0];
  const watchUrl    = firstEp ? `/xem-phim/${slug}?ep=${firstEp.slug}&server=0` : null;

  /* ── Image URLs ── */
  /* backdrop (landscape) */
  const backdrop = imgUrl(movie.poster_url || movie.thumb_url);
  /* portrait (vertical) */
  const verticalImg = imgUrl(movie.thumb_url || movie.poster_url);
  /* landscape (horizontal) */
  const horizontalImg = imgUrl(movie.poster_url || movie.thumb_url);

  /* ── Ratings ── */
  const imdbScore = movie.imdb?.vote_average;
  const tmdbScore = movie.tmdb?.vote_average;

  /* ── Description ── */
  const rawDesc = movie.content?.replace(/<[^>]+>/g, '') || '';
  const shortDesc = rawDesc.slice(0, 240);

  /* ── Trailer embed ── */
  const trailerEmbed = getYouTubeEmbed(movie.trailer_url);

  return (
    <div className="movie-detail">

      {/* ── HERO ── */}
      <div className="md-hero" style={{ '--bd': `url("${backdrop}")` }}>
        <div className="md-hero__bg" />
        <div className="md-hero__overlay" />

        {/* Breadcrumb */}
        <div className="md-breadcrumb">
          <Link to="/home" className="md-breadcrumb__item">Trang chủ</Link>
          {breadcrumb.filter(b => !b.isCurrent).map((b, i) => (
            <span key={i} className="md-breadcrumb__item">
              <IconChevRight />
              <Link to={b.slug}>{b.name}</Link>
            </span>
          ))}
          {movie.name && (
            <span className="md-breadcrumb__item md-breadcrumb__item--current">
              <IconChevRight /> {movie.name}
            </span>
          )}
        </div>

        <div className="md-hero__content">
          {/* Poster */}
          <div className="md-hero__poster">
            <img src={verticalImg} alt={movie.name} className="md-hero__poster-desktop" />
            <img src={horizontalImg} alt={movie.name} className="md-hero__poster-mobile" />
            {movie.quality && <span className="md-quality-badge">{movie.quality}</span>}
            {movie.chieurap && <span className="md-cinema-badge">Chiếu rạp</span>}
          </div>

          {/* Info */}
          <div className="md-hero__info">
            <h1 className="md-hero__title">{movie.name}</h1>
            {movie.origin_name && (
              <p className="md-hero__origin">{movie.origin_name}</p>
            )}

            {/* Ratings */}
            <div className="md-hero__ratings">
              {imdbScore > 0 && (
                <div className="md-rating md-rating--imdb">
                  <IconStar />
                  <span className="md-rating__score">{imdbScore.toFixed(1)}</span>
                  <span className="md-rating__label">IMDb</span>
                </div>
              )}
              {tmdbScore > 0 && (
                <div className="md-rating md-rating--tmdb">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="#01b4e4"><circle cx="12" cy="12" r="10"/></svg>
                  <span className="md-rating__score">{tmdbScore.toFixed(1)}</span>
                  <span className="md-rating__label">TMDB</span>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="md-hero__badges">
              {movie.year             && <span className="md-badge">{movie.year}</span>}
              {movie.time             && <span className="md-badge">{movie.time}</span>}
              {movie.lang             && <span className="md-badge">{movie.lang}</span>}
              {movie.type             && <span className="md-badge">{TYPE_MAP[movie.type] || movie.type}</span>}
              {movie.episode_current  && <span className="md-badge md-badge--green">{movie.episode_current}</span>}
              {movie.episode_total && movie.type !== 'single' && (
                <span className="md-badge">{movie.episode_total} tập</span>
              )}
            </div>

            {/* Genre tags */}
            {movie.category?.length > 0 && (
              <div className="md-hero__genres">
                {movie.category.map(c => (
                  <Link key={c.id} to={`/the-loai/${c.slug}`} className="md-genre-tag">{c.name}</Link>
                ))}
                {movie.country?.map(c => (
                  <Link key={c.id} to={`/quoc-gia/${c.slug}`} className="md-genre-tag md-genre-tag--country">
                    {c.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="md-hero__desc">
              {descExpanded ? (
                <div className="md-desc-box">
                  <p>{rawDesc}</p>
                  <button className="md-desc-toggle" onClick={() => setDescExpanded(false)}>
                    Thu gọn
                  </button>
                </div>
              ) : (
                <p>
                  {shortDesc}
                  {rawDesc.length > 240 && (
                    <button className="md-desc-toggle" onClick={() => setDescExpanded(true)}>
                      ... Xem thêm
                    </button>
                  )}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="md-hero__actions">
              {watchUrl ? (
                <button className="md-btn md-btn--primary" onClick={() => navigate(watchUrl)}>
                  <IconPlay /> Xem phim
                </button>
              ) : (
                <button className="md-btn md-btn--primary" disabled>
                  <IconPlay /> Sắp chiếu
                </button>
              )}
              <button className="md-btn md-btn--ghost">
                <IconBookmark /> Yêu thích
              </button>
              {trailerEmbed && (
                <button className="md-btn md-btn--ghost" onClick={() => setTab('trailer')}>
                  <IconFilm /> Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="md-body">

        {/* TABS */}
        <div className="md-tabs">
          <div className="md-tabs__inner">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`md-tabs__btn${tab === t.id ? ' active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT – centered */}
        <div className="md-tab-content">
          <div className="md-tab-inner">

            {/* Thông tin */}
            {tab === 'info' && (
              <div className="md-info-grid">
                <InfoRow label="Tên gốc"    value={movie.origin_name} />
                <InfoRow label="Năm"        value={movie.year} />
                <InfoRow label="Trạng thái" value={movie.episode_current} />
                <InfoRow label="Số tập"     value={movie.episode_total} />
                <InfoRow label="Thời lượng" value={movie.time} />
                <InfoRow label="Chất lượng" value={movie.quality} />
                <InfoRow label="Ngôn ngữ"   value={movie.lang} />
                <InfoRow label="Loại phim"  value={TYPE_MAP[movie.type] || movie.type} />
                <InfoRow label="Thể loại"
                  value={movie.category?.map(c => (
                    <Link key={c.id} to={`/the-loai/${c.slug}`} className="md-link">{c.name}</Link>
                  ))}
                />
                <InfoRow label="Quốc gia"
                  value={movie.country?.map(c => (
                    <Link key={c.id} to={`/quoc-gia/${c.slug}`} className="md-link">{c.name}</Link>
                  ))}
                />
                {movie.director?.length > 0 && (
                  <InfoRow label="Đạo diễn" value={movie.director.join(', ')} />
                )}
                {movie.view > 0 && (
                  <InfoRow label="Lượt xem" value={Number(movie.view).toLocaleString()} />
                )}
              </div>
            )}

            {/* Diễn viên */}
            {tab === 'cast' && (
              <div className="md-cast">
                {movie.actor?.length > 0 ? movie.actor.map((name, i) => (
                  <div key={i} className="md-cast__item">
                    <div className="md-cast__avatar">
                      {name.trim().charAt(0).toUpperCase()}
                    </div>
                    <p className="md-cast__name">{name}</p>
                  </div>
                )) : (
                  <p className="md-empty">Chưa có thông tin diễn viên.</p>
                )}
              </div>
            )}

            {/* Trailer */}
            {tab === 'trailer' && (
              <div className="md-trailer">
                {trailerEmbed ? (
                  <div className="md-trailer__wrap">
                    <iframe
                      src={trailerEmbed}
                      title={`Trailer – ${movie.name}`}
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <p className="md-empty">Chưa có trailer.</p>
                )}
              </div>
            )}

            {/* Ảnh */}
            {tab === 'gallery' && (
              <div className="md-gallery">
                {(images.length > 0
                  ? images.map(img => ({ src: imgUrl(img.filename), key: img.filename }))
                  : [movie.poster_url, movie.thumb_url].filter(Boolean).map(f => ({ src: imgUrl(f), key: f }))
                ).map(({ src, key }) => (
                  <div key={key} className="md-gallery__item" onClick={() => setLightbox(src)}>
                    <img src={src} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* LIGHTBOX */}
        {lightbox && (
          <div className="md-lightbox" onClick={() => setLightbox(null)}>
            <img src={lightbox} alt="Phóng to" />
            <button className="md-lightbox__close" onClick={() => setLightbox(null)}>✕</button>
          </div>
        )}

        {/* ── EPISODES ── */}
        {movie.episodes?.length > 0 && (
          <section className="md-episodes">
            <h2 className="md-section-title">Danh sách tập</h2>
            {movie.episodes.map((server, si) => (
              <div key={si} className="md-server">
                {movie.episodes.length > 1 && (
                  <p className="md-server__name">{server.server_name}</p>
                )}
                <div className="md-ep-grid">
                  {server.server_data.map(ep => (
                    <Link
                      key={ep.slug}
                      to={`/xem-phim/${slug}?ep=${ep.slug}&server=${si}`}
                      className="md-ep-btn"
                    >
                      {ep.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ── RELATED – Keyword-based ── */}
        {kwRelated.length > 0 && (
          <section className="md-related">
            <MovieRow
              title="Phim liên quan"
              items={kwRelated}
              seeAllLink={movie.category?.[0] ? `/the-loai/${movie.category[0].slug}` : '/home'}
            />
          </section>
        )}

        {/* ── RELATED – Same category ── */}
        {catRelated.length > 0 && (
          <section className="md-related">
            <MovieRow
              title={`Cùng thể loại · ${movie.category?.[0]?.name || ''}`}
              items={catRelated}
              seeAllLink={movie.category?.[0] ? `/the-loai/${movie.category[0].slug}` : '/home'}
            />
          </section>
        )}

        {/* ── RELATED – Same country ── */}
        {countryRelated.length > 0 && (
          <section className="md-related">
            <MovieRow
              title={`Cùng quốc gia · ${movie.country?.[0]?.name || ''}`}
              items={countryRelated}
              seeAllLink={movie.country?.[0] ? `/quoc-gia/${movie.country[0].slug}` : '/home'}
            />
          </section>
        )}

      </div>
    </div>
  );
}

/* ── Helper ── */
function InfoRow({ label, value }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="md-info-row">
      <span className="md-info-row__label">{label}</span>
      <span className="md-info-row__value">{value}</span>
    </div>
  );
}
