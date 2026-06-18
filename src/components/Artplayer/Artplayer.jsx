import { useEffect, useRef } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

const PROGRESS_KEY = 'gienphim_playback_progress';
const MAX_PROGRESS_RECORDS = 200;

// Lấy tiến trình đã lưu
function getSavedProgress(movieSlug, epSlug, fallbackUrl) {
  try {
    const dataStr = localStorage.getItem(PROGRESS_KEY);
    if (!dataStr) return 0;
    const data = JSON.parse(dataStr);
    const key = (movieSlug && epSlug) ? `${movieSlug}_${epSlug}` : fallbackUrl;
    return data[key]?.time || 0;
  } catch (_) {
    return 0;
  }
}

// Lưu tiến trình (LRU Cache tối đa 200 tập gần nhất)
function saveProgress(movieSlug, epSlug, fallbackUrl, time) {
  try {
    const dataStr = localStorage.getItem(PROGRESS_KEY);
    let data = {};
    if (dataStr) {
      try {
        data = JSON.parse(dataStr);
      } catch (_) {
        data = {};
      }
    }

    const key = (movieSlug && epSlug) ? `${movieSlug}_${epSlug}` : fallbackUrl;
    data[key] = {
      time,
      updatedAt: Date.now()
    };

    const keys = Object.keys(data);
    if (keys.length > MAX_PROGRESS_RECORDS) {
      const sortedKeys = keys.sort((a, b) => (data[a].updatedAt || 0) - (data[b].updatedAt || 0));
      while (sortedKeys.length > MAX_PROGRESS_RECORDS) {
        const oldestKey = sortedKeys.shift();
        delete data[oldestKey];
      }
    }

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save progress in localStorage', err);
  }
}

// Xóa tiến trình
function removeProgress(movieSlug, epSlug, fallbackUrl) {
  try {
    const dataStr = localStorage.getItem(PROGRESS_KEY);
    if (!dataStr) return;
    const data = JSON.parse(dataStr);
    const key = (movieSlug && epSlug) ? `${movieSlug}_${epSlug}` : fallbackUrl;
    if (data[key]) {
      delete data[key];
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
    }
  } catch (_) {}
}

export default function ArtplayerPlayer({ url, movieSlug, epSlug, onReady, className, style }) {
  const artContainerRef = useRef(null);
  const artRef = useRef(null);

  useEffect(() => {
    if (!url || !artContainerRef.current) return;

    // Destroy existing instance if the URL changed
    if (artRef.current) {
      try {
        const video = artRef.current.video;
        if (video) {
          video.pause();
          video.removeAttribute('src');
          video.load();
        }
      } catch (_) {}
      if (artRef.current.hls) {
        try {
          artRef.current.hls.detachMedia();
          artRef.current.hls.destroy();
        } catch (_) {}
      }
      artRef.current.destroy(true);
      artRef.current = null;
    }

    const art = new Artplayer({
      container: artContainerRef.current,
      url: url,
      autoplay: true,
      muted: false,
      volume: 0.7,
      theme: '#e50914',
      playbackRate: true,
      aspectRatio: true,
      setting: true,
      fullscreen: true,
      pip: true,
      miniProgressBar: true,
      playsInline: true,
      autoPlayback: false,
      airplay: true,
      hotkey: true,
      moreVideoAttr: {
        crossOrigin: 'anonymous',
        playsInline: true,
        'webkit-playsinline': true,
      },
      lock: true,
      customType: {
        m3u8: function (videoEl, m3u8Url, player) {
          if (player.isDestroy) return;
          if (Hls.isSupported()) {
            if (player.hls) {
              try {
                player.hls.detachMedia();
                player.hls.destroy();
              } catch (_) {}
            }
            const hls = new Hls();
            hls.loadSource(m3u8Url);
            hls.attachMedia(videoEl);
            player.hls = hls;
            player.on('destroy', () => {
               try {
                 hls.detachMedia();
                 hls.destroy();
               } catch (_) {}
            });
          } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
            videoEl.src = m3u8Url;
          }
        },
      },
    });

    artRef.current = art;

    // Tự động khôi phục tiến trình phát (Auto Resume) không hiển thị banner
    art.once('ready', () => {
      const time = getSavedProgress(movieSlug, epSlug, url);
      if (time > 5 && time < art.duration - 10) {
        art.currentTime = time;
      }
    });

    // Tự động lưu tiến trình phát
    art.on('video:timeupdate', () => {
      const currentTime = art.currentTime;
      if (currentTime > 5 && art.duration && currentTime < art.duration - 10) {
        saveProgress(movieSlug, epSlug, url, currentTime);
      }
    });

    // Xóa tiến trình khi xem hết phim
    art.on('video:ended', () => {
      removeProgress(movieSlug, epSlug, url);
    });

    if (onReady) {
      onReady(art);
    }

    return () => {
      if (artRef.current) {
        try {
          const video = artRef.current.video;
          if (video) {
            video.pause();
            video.removeAttribute('src');
            video.load();
          }
        } catch (_) {}
        if (artRef.current.hls) {
          try {
            artRef.current.hls.detachMedia();
            artRef.current.hls.destroy();
          } catch (_) {}
        }
        artRef.current.destroy(true);
        artRef.current = null;
      }
    };
  }, [url, movieSlug, epSlug]);

  // Global keyboard shortcut: F key to toggle Fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in inputs or textareas
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (artRef.current) {
          // Toggle fullscreen
          artRef.current.fullscreen = !artRef.current.fullscreen;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={artContainerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'auto',
        ...style,
      }}
    />
  );
}
