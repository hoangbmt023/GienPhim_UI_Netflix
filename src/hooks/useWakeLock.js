/**
 * useWakeLock – Giữ màn hình sáng khi đang xem video.
 * Ưu tiên: Screen Wake Lock API (Chrome/Edge/Android Chrome)
 * Fallback: Video ẩn 1×1px (iOS Safari trick - thường dùng thư viện NoSleep.js)
 *
 * Lưu ý với iOS Safari:
 *  - Safari < 16.4 không hỗ trợ Wake Lock API.
 *  - Trick video ẩn hoạt động bằng cách phát một video rất nhỏ, loop.
 *    iOS sẽ không tắt màn hình khi có media đang phát.
 *  - Video phải được trigger từ user interaction (gesture).
 */
import { useRef, useCallback } from 'react';

// Tiny valid MP4 (1×1 pixel, 1 frame) – đây là video hợp lệ nhỏ nhất có thể
// Source: https://github.com/nicehash/NiceHashQuickMiner/issues/100 pattern
const TINY_MP4_BASE64 =
  'data:video/mp4;base64,' +
  'AAAAHGZ0eXBtcDQyAAAAAG1wNDJpc29taXNvMgAAAyhtb292AAAAbG12aGQAAAAA' +
  'AAAAAAAAAAAAAP8AAABQAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAA' +
  'AAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAImlvZHMA' +
  'AAAAEgAAAAQAAAABAAAA//8AAAAZAAAB9AAAARcAAAL4AAAAFHRyYWsAAAAcdGtoZAAAAAAA' +
  'AAAAAAAAAAEAAAAAAABQAAAAAAAAAAAAAAAAAQAAAAABAAAAAAAAAAAAAAAAAAQAAAAAAAAA' +
  'AAAAAAAAAQAAAAAAAAAAAAAAAAAAABAAAAC2bWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAADwA' +
  'AAAAAABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIA' +
  'AAAAhW1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAA' +
  'x1cmwgAAAAAQAAAElzdGJsAAAAK3N0c2QAAAAAAAAAAQAAABthdmMxAAAAAAAAAAEAAAAAAAAA' +
  'AAAAAAAAAAAAEAAQAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAY//8AAAAxYXZjQwFNQAz/4QAYZ01AD/tAgYPkAAAAAAAPAAAADxYPGDGWAQAGaOvjyyLA' +
  'AAAAGHNtaGQAAAAAAAAAAAAAAAAAAAAAAAAAFHN0c2MAAAAAAAAAAgAAAAEAAAABAAAAAgAAAAIA' +
  'AAAAAQAAAAMAAAAYc3RzegAAAAAAAAAAAAAAAAAAAAABAAAAGHN0Y28AAAAAAAAAAQAAADQAAACF' +
  'bXZleAAAABhtdmhkAAAAAAAAAAAAAAAAAAAA/wAAAFAAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAA' +
  'AAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAEAAAAAmRpb2RzAAAAEgAAAAQAAAAB' +
  'AAAA//8AAAAZAAAHgAAAARcAAA==';

export function useWakeLock() {
  const wakeLockRef = useRef(null);
  const noSleepVideoRef = useRef(null);

  /**
   * Tạo và lưu trữ video ảo cho iOS Safari.
   * Phải gọi từ trong user interaction context (click, touch).
   */
  const createNoSleepVideo = useCallback(() => {
    if (noSleepVideoRef.current) return noSleepVideoRef.current;

    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.muted = true;
    video.loop = true;
    // Ẩn hoàn toàn khỏi viewport
    Object.assign(video.style, {
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
      width: '1px',
      height: '1px',
      opacity: '0',
      pointerEvents: 'none',
    });

    video.src = TINY_MP4_BASE64;
    document.body.appendChild(video);
    noSleepVideoRef.current = video;
    return video;
  }, []);

  /**
   * Kích hoạt giữ màn hình sáng.
   * Thử Wake Lock API → fallback video ảo iOS.
   */
  const acquire = useCallback(async () => {
    // ── Ưu tiên 1: Screen Wake Lock API (Chrome 84+, Edge, Android) ──
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');

        // Tự động tái kích hoạt sau khi người dùng quay lại tab
        wakeLockRef.current.addEventListener('release', () => {
          if (!document.hidden) acquire();
        });
        return;
      } catch {
        // SecurityError (iframe), NotAllowedError (tài liệu ẩn) → fallback
      }
    }

    // ── Fallback: Video ảo (iOS Safari, trình duyệt cũ) ──
    try {
      const video = createNoSleepVideo();
      await video.play();
    } catch {
      // Fail silently – user interaction có thể bị thiếu trên một số device
    }
  }, [createNoSleepVideo]);

  /**
   * Giải phóng wake lock và dọn dẹp tài nguyên.
   */
  const release = useCallback(() => {
    // Giải phóng Wake Lock API
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }

    // Dừng và xóa video ảo iOS
    if (noSleepVideoRef.current) {
      noSleepVideoRef.current.pause();
      noSleepVideoRef.current.remove();
      noSleepVideoRef.current = null;
    }
  }, []);

  return { acquire, release };
}
