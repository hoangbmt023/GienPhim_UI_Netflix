import React, { useState, useMemo, useEffect } from 'react';
import './EpisodeList.css';

/* ── Icons ── */
const ListIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const EpisodeList = ({ movie, currentEpSlug, onEpClick, initialServer = 0 }) => {
  const [selServer, setSelServer] = useState(initialServer);
  const [epSearch, setEpSearch] = useState('');

  // Update server if parent changes it
  useEffect(() => {
    setSelServer(initialServer);
  }, [initialServer]);

  const episodes = movie?.episodes || [];
  const server = episodes[selServer];
  const hasMultiEp = (server?.server_data?.length || 0) > 1;

  const filteredEps = useMemo(() => {
    if (!server?.server_data) return [];

    // De-duplicate by slug and filter by search
    const seen = new Set();
    const unique = server.server_data.filter(ep => {
      if (seen.has(ep.slug)) return false;
      seen.add(ep.slug);
      return true;
    });

    if (!epSearch.trim()) return unique;

    const searchLower = epSearch.toLowerCase();
    return unique.filter(ep =>
      ep.name.toLowerCase().includes(searchLower) ||
      ep.slug.toLowerCase().includes(searchLower)
    );
  }, [server, epSearch]);

  if (!episodes.length) return null;

  return (
    <div className="episode-list-comp">
      <div className="ep-list-head">
        <div className="ep-list-left">
          <ListIcon />
          <h2 className="ep-list-title">Danh sách tập</h2>
          {hasMultiEp && (
            <span className="ep-list-count">
              {server?.server_data?.length} tập
            </span>
          )}
        </div>

        <div className="ep-list-right">
          {/* Server tabs */}
          {episodes.length > 1 && (
            <div className="ep-servers">
              {episodes.map((sv, si) => (
                <button
                  key={si}
                  className={`ep-server-btn${selServer === si ? ' active' : ''}`}
                  onClick={() => {
                    setSelServer(si);
                    setEpSearch('');
                    // Optional: auto-play first ep of new server? 
                    // Usually handled by parent via onEpClick if desired.
                  }}
                >
                  {sv.server_name}
                </button>
              ))}
            </div>
          )}

          {/* Episode search */}
          {hasMultiEp && (
            <div className="ep-search-wrap">
              <input
                className="ep-search-input"
                type="text"
                placeholder="Tìm tập..."
                value={epSearch}
                onChange={e => setEpSearch(e.target.value)}
              />
              {epSearch && (
                <button className="ep-search-clear" onClick={() => setEpSearch('')}>✕</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Episode grid */}
      <div className="ep-grid">
        {filteredEps.map(ep => {
          const isActive = ep.slug === currentEpSlug;
          return (
            <button
              key={ep.slug}
              className={`ep-btn${isActive ? ' active' : ''}`}
              onClick={() => onEpClick(ep, selServer)}
              title={`Tập ${ep.name}`}
            >
              {ep.name}
            </button>
          );
        })}
        {filteredEps.length === 0 && epSearch.trim() && (
          <p className="ep-empty">Không tìm thấy tập «{epSearch}».</p>
        )}
        {filteredEps.length === 0 && !epSearch.trim() && (
          <div className="ep-empty ep-empty--no-data">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
            </svg>
            <p>Chưa có tập nào &mdash; đang cập nhật...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpisodeList;
