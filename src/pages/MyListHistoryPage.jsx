import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { movieApi } from "@/services/movieApi";
import { imgUrl, getMovieDetail } from "@/services/ophimApi";
import Pagination from "@/components/Pagination/Pagination";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import ImageWithFallback from "@/components/ImageWithFallback/ImageWithFallback";
import { getPath, getT } from "@/utils/lang";
import "./MyListHistoryPage.css";

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
  </svg>
);

const SavedIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
  </svg>
);

// Detect page size based on window width
const getPageSize = () => (window.innerWidth <= 768 ? 16 : 24);

export default function MyListHistoryPage() {
  const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "history";
  const [loading, setLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [savedPage, setSavedPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [savedTotal, setSavedTotal] = useState(0);
  const [confirmType, setConfirmType] = useState(null);
  const [pageSize, setPageSize] = useState(getPageSize());
  const { isAuthenticated, selectedProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const t = getT();

  useEffect(() => {
    const title = activeTab === 'history' ? t.myList.history : t.myList.saved;
    document.title = `${title} - GienPhim`;
  }, [activeTab, t.myList]);

  // Update pageSize on resize
  useEffect(() => {
    const onResize = () => setPageSize(getPageSize());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate(getPath("login"));
      return;
    }
    if (!selectedProfile) {
      navigate(getPath("profiles"));
      return;
    }
  }, [isAuthenticated, selectedProfile, authLoading, navigate]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (authLoading || !selectedProfile) return;
    if (activeTab === "history") fetchHistory(1);
    else fetchSaved(1);
  }, [activeTab, selectedProfile, authLoading, pageSize]);

  // Scroll to top whenever page number changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [historyPage, savedPage]);

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const res = await movieApi.getHistory(page, pageSize);
      if (res.data.success) {
        setHistory(res.data.data);
        setHistoryTotal(res.data.pagination?.total || 0);
        setHistoryPage(page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async (page = 1) => {
    setLoading(true);
    try {
      const res = await movieApi.getFavorites(page, pageSize);
      if (res.data.success) {
        setSaved(res.data.data);
        setSavedTotal(res.data.pagination?.total || 0);
        setSavedPage(page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveHistory = async (historyId) => {
    try {
      await movieApi.removeHistory(historyId);
      setHistory((prev) => prev.filter((h) => h.historyId !== historyId && h.id !== historyId));
    } catch (err) {
      console.error(err);
    }
  };

  const executeClearAllHistory = async () => {
    try {
      await movieApi.clearAllHistory();
      setHistory([]);
      setHistoryTotal(0);
      setConfirmType(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveSaved = async (favoriteId) => {
    try {
      await movieApi.removeFavorite(favoriteId);
      setSaved((prev) => prev.filter((s) => s.favoriteId !== favoriteId && s.id !== favoriteId));
    } catch (err) {
      console.error(err);
    }
  };

  const executeClearAllSaved = async () => {
    try {
      const ids = saved.map((s) => s.favoriteId || s.id);
      if (ids.length > 0) await movieApi.removeFavorites(ids);
      setSaved([]);
      setSavedTotal(0);
      setConfirmType(null);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimePos = (seconds) => {
    if (!seconds || seconds <= 0) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const currentItems = activeTab === "history" ? history : saved;
  const currentTotal = activeTab === "history" ? historyTotal : savedTotal;

  const [movieDetails, setMovieDetails] = useState({});
  const fetchedSlugs = useRef(new Set());

  // Fetch movie details to get total episodes
  useEffect(() => {
    if (!currentItems || currentItems.length === 0) return;
    
    currentItems.forEach(item => {
      if (item.slug && !fetchedSlugs.current.has(item.slug)) {
        fetchedSlugs.current.add(item.slug);
        getMovieDetail(item.slug).then(res => {
          if (res?.data?.item) {
            setMovieDetails(prev => ({ ...prev, [item.slug]: res.data.item }));
          }
        }).catch(err => {
          console.error("Failed to fetch detail for", item.slug, err);
        });
      }
    });
  }, [currentItems]);

  const getEpisodeDisplay = (item) => {
    const detail = movieDetails[item.slug];
    
    if (activeTab === "history") {
       if (!detail || !detail.episodes || detail.episodes.length === 0) {
           return item.episode?.name ? t.myList.episode(item.episode.name) : null;
       }
       const serverIndex = item.episode?.server ?? 0;
       const serverData = detail.episodes[serverIndex]?.server_data || detail.episodes[0]?.server_data || [];
       const total = serverData.length;
       const lastEpName = total > 0 ? (serverData[total - 1]?.name || total) : "?";
       return `${t.myList.episode(item.episode?.name || "?")} / ${lastEpName}`;
    } else {
       if (!detail || !detail.episodes || detail.episodes.length === 0) {
           return null;
       }
       let maxServerData = [];
       detail.episodes.forEach(ep => {
           if (ep.server_data && ep.server_data.length > maxServerData.length) {
               maxServerData = ep.server_data;
           }
       });
       const total = maxServerData.length;
       if (total === 0) return null;
       const lastEpName = maxServerData[total - 1]?.name || total;
       return t.myList.episode(lastEpName);
    }
  };

  const getProgress = (item) => {
    if (activeTab !== "history" || !item.episode) return 0;
    const detail = movieDetails[item.slug];
    if (!detail || !detail.episodes || detail.episodes.length === 0) {
        return 40; // Default fallback if not loaded
    }
    
    const serverIndex = item.episode?.server ?? 0;
    const serverData = detail.episodes[serverIndex]?.server_data || detail.episodes[0]?.server_data || [];
    if (serverData.length === 0) return 0;
    
    const currentEpIndex = serverData.findIndex(ep => ep.slug === String(item.episode?.slug) || ep.name === String(item.episode?.name));
    if (currentEpIndex === -1) {
       // fallback, try parse int
       const parsedCur = parseInt(item.episode?.name);
       const total = serverData.length;
       if (!isNaN(parsedCur) && total > 0) {
           return Math.min(100, Math.max(0, (parsedCur / total) * 100));
       }
       return 0; // Can't determine progress
    }
    
    // progress based on current index out of total
    return Math.round(((currentEpIndex + 1) / serverData.length) * 100);
  };

  return (
    <div className="mylist-page">
      {/* ── HERO / HEADER ── */}
      <div className="mylist-hero">
        <div className="mylist-hero__content">
          <h1 className="mylist-hero__title">
            {activeTab === "history" ? t.myList.history : t.myList.saved}
          </h1>
          {currentTotal > 0 && (
            <span className="mylist-hero__count">
              {t.myList.films(currentTotal)}
            </span>
          )}
        </div>

        <div className="mylist-controls">
          <div className="mylist-tabs">
            <button
              className={`mylist-tab ${activeTab === "history" ? "active" : ""}`}
              onClick={() => handleTabChange("history")}
            >
              <HistoryIcon />
              <span>{t.myList.history}</span>
            </button>
            <button
              className={`mylist-tab ${activeTab === "saved" ? "active" : ""}`}
              onClick={() => handleTabChange("saved")}
            >
              <SavedIcon />
              <span>{t.myList.saved}</span>
            </button>
          </div>

          {currentItems.length > 0 && (
            <button
              className="mylist-clear-btn"
              onClick={() => setConfirmType(activeTab)}
            >
              <TrashIcon />
              <span>{t.myList.clearAll}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="mylist-content">
        {loading && currentItems.length === 0 ? (
          <div className="mylist-skeleton-grid">
            {Array.from({ length: pageSize }).map((_, i) => (
              <div key={i} className="mylist-skeleton" />
            ))}
          </div>
        ) : currentItems.length === 0 ? (
          <div className="mylist-empty">
            <div className="mylist-empty__icon">
              {activeTab === "history" ? <HistoryIcon /> : <SavedIcon />}
            </div>
            <p className="mylist-empty__title">
              {activeTab === "history"
                ? t.myList.emptyHistory
                : t.myList.emptySaved}
            </p>
            <p className="mylist-empty__sub">
              {activeTab === "history"
                ? t.myList.emptyHistorySub
                : t.myList.emptySavedSub}
            </p>
            <Link to={getPath("home")} className="mylist-browse-btn">
              {t.myList.explore}
            </Link>
          </div>
        ) : (
          <>
            <div className="mylist-grid">
              {currentItems.map((item) => (
                <div key={item.historyId || item.favoriteId || item.id} className="mylist-card">
                  <div
                    className="mylist-card__poster"
                    onClick={() => {
                      if (window.innerWidth <= 768) {
                        const path =
                          activeTab === "history"
                            ? `${getPath("watch")}/${item.slug}?ep=${item.episode?.slug || 1}&server=${item.episode?.server ?? 0}`
                            : `${getPath("movie")}/${item.slug}`;
                        navigate(path);
                      }
                    }}
                  >
                    {(() => {
                      const rawSrc =
                        movieDetails[item.slug]?.thumb_url ||
                        movieDetails[item.slug]?.poster_url ||
                        item.thumb_url ||
                        item.poster_url;
                      return rawSrc ? (
                        <ImageWithFallback
                          src={imgUrl(rawSrc)}
                          alt={movieDetails[item.slug]?.name || item.name}
                          wrapperClassName="mylist-card__img-wrap"
                          className="mylist-card__img"
                        />
                      ) : (
                        <div className="mylist-card__img-wrap skeleton" />
                      );
                    })()}

                    {/* Quality/HD badge – top left corner */}
                    {(movieDetails[item.slug]?.quality || item.quality) && (
                      <span className="mylist-card__quality-badge">
                        {movieDetails[item.slug]?.quality || item.quality}
                      </span>
                    )}

                    {/* Bottom gradient for legibility */}
                    <div className="mylist-card__gradient" />

                    {/* Progress bar for history */}
                    {activeTab === "history" && item.episode && (
                      <div className="mylist-card__progress-bar">
                        <div
                          className="mylist-card__progress-fill"
                          style={{ width: `${getProgress(item)}%` }}
                        />
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="mylist-card__hover-overlay">
                      <button
                        className="mylist-card__delete"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          activeTab === "history"
                            ? handleRemoveHistory(item.historyId || item.id)
                            : handleRemoveSaved(item.favoriteId || item.id);
                        }}
                        title={t.common.delete}
                      >
                        <TrashIcon />
                      </button>

                      <Link
                        to={
                          activeTab === "history"
                            ? `${getPath("watch")}/${item.slug}?ep=${item.episode?.slug || 1}&server=${item.episode?.server ?? 0}`
                            : `${getPath("movie")}/${item.slug}`
                        }
                        className="mylist-card__play"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PlayIcon />
                      </Link>
                    </div>

                    {/* Always-visible bottom info */}
                    <div className="mylist-card__info">
                      {/* Lang badge in info row */}
                      {(movieDetails[item.slug]?.lang || item.lang) && (
                        <div className="mylist-card__badges">
                          <span className="mylist-badge mylist-badge--lang">
                            {movieDetails[item.slug]?.lang || item.lang}
                          </span>
                        </div>
                      )}
                      <Link
                        to={`${getPath("movie")}/${item.slug}`}
                        className="mylist-card__title"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {movieDetails[item.slug]?.name || item.name}
                      </Link>
                      {activeTab === "history" && item.episode && (
                        <div className="mylist-card__meta">
                          <span className="mylist-card__ep">
                            {getEpisodeDisplay(item)}
                          </span>
                          {item.timePos > 0 && (
                            <span className="mylist-card__timepos">
                              ⏱ {formatTimePos(item.timePos)}
                            </span>
                          )}
                          {item.updatedAt && (
                            <span className="mylist-card__date">
                              {formatDate(item.updatedAt)}
                            </span>
                          )}
                        </div>
                      )}
                      {activeTab === "saved" && getEpisodeDisplay(item) && (
                        <div className="mylist-card__meta">
                          <span className="mylist-card__ep">
                            {getEpisodeDisplay(item)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={activeTab === "history" ? historyPage : savedPage}
              totalPages={Math.ceil(currentTotal / pageSize)}
              onPageChange={(p) => {
                if (activeTab === "history") fetchHistory(p);
                else fetchSaved(p);
              }}
            />
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmType !== null}
        onClose={() => setConfirmType(null)}
        title={t.myList.confirmClearTitle}
        description={
          confirmType === "history"
            ? t.myList.confirmClearHistory
            : t.myList.confirmClearSaved
        }
        confirmText={t.myList.clearAll}
        cancelText={t.common.cancel}
        onConfirm={
          confirmType === "history"
            ? executeClearAllHistory
            : executeClearAllSaved
        }
        showCloseButton={true}
      />
    </div>
  );
}
