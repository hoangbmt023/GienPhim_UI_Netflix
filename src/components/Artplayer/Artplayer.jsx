import { useEffect, useRef } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

export default function ArtplayerPlayer({ url, onReady, className, style }) {
  const artContainerRef = useRef(null);
  const artRef = useRef(null);

  useEffect(() => {
    if (!url || !artContainerRef.current) return;

    // Destroy existing instance if the URL changed
    if (artRef.current) {
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
      autoPlayback: true,
      airplay: true,
      hotkey: true,
      moreVideoAttr: {
        crossOrigin: 'anonymous',
        playsInline: true,
        'webkit-playsinline': true,
      },
      customType: {
        m3u8: function (videoEl, m3u8Url, player) {
          if (Hls.isSupported()) {
            if (player.hls) player.hls.destroy();
            const hls = new Hls();
            hls.loadSource(m3u8Url);
            hls.attachMedia(videoEl);
            player.hls = hls;
            player.on('destroy', () => {
              hls.destroy();
            });
          } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
            videoEl.src = m3u8Url;
          }
        },
      },
    });

    artRef.current = art;

    if (onReady) {
      onReady(art);
    }

    return () => {
      if (artRef.current) {
        artRef.current.destroy(true);
        artRef.current = null;
      }
    };
  }, [url]);

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
