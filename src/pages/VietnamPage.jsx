import { useState, useEffect } from 'react';
import HeroBanner       from '@/components/HeroBanner/HeroBanner';
import SpotlightSection from '@/components/SpotlightSection/SpotlightSection';
import SideLabelRow     from '@/components/SideLabelRow/SideLabelRow';
import MovieRow         from '@/components/MovieRow/MovieRow';
import { getByCountry, parseItems } from '@/services/ophimApi';

/**
 * VietnamPage – Trang Phim Việt Nam đặc biệt (không chia page)
 * Route: /quoc-gia/viet-nam
 */
export default function VietnamPage() {
  const [hero,   setHero]   = useState([]);
  const [page1,  setPage1]  = useState([]);  /* 24 phim – trang 1 */
  const [page2,  setPage2]  = useState([]);  /* 24 phim – trang 2 */

  const [loading, setLoading] = useState({ hero: true, p1: true, p2: true });
  const done = (k) => setLoading(p => ({ ...p, [k]: false }));

  useEffect(() => {
    /* Trang 1 – hero + spotlight + ranked */
    getByCountry('viet-nam', { page: 1 })
      .then(r => {
        const items = parseItems(r);
        setPage1(items);
        setHero(items.filter(m => m.thumb_url).slice(0, 8));
      })
      .catch(() => {})
      .finally(() => { done('hero'); done('p1'); });

    /* Trang 2 – phim mới cập nhật VN (khác hẳn trang 1) */
    getByCountry('viet-nam', { page: 2 })
      .then(r => setPage2(parseItems(r)))
      .catch(() => {})
      .finally(() => done('p2'));
  }, []);

  return (
    <div style={{ background: '#141414', minHeight: '100vh' }}>

      {/* Hero */}
      <HeroBanner movies={hero} loading={loading.hero} />

      {/* Spotlight – top 10 nổi bật */}
      <SpotlightSection
        title="Phim Việt Nam nổi bật"
        items={page1}
        loading={loading.p1}
        seeAllLink="/quoc-gia/viet-nam?page=1"
      />

      {/* Top Phim Việt Nam – ranked (page 1) */}
      <MovieRow
        title="Top Phim Việt Nam"
        items={page1}
        loading={loading.p1}
        seeAllLink="/danh-sach/phim-moi?country=viet-nam"
        ranked
      />

      {/* Phim Việt Nam mới cập nhật (page 2 – khác data) */}
      <SideLabelRow
        title="Phim Việt Nam mới cập nhật"
        items={page2}
        loading={loading.p2}
        seeAllLink="/danh-sach/phim-moi?country=viet-nam"
      />

      {/* Phim Việt Nam page 1 cũ (slice 8+ để không trùng ranked) */}
      <SideLabelRow
        title="Có thể bạn chưa xem"
        items={page1.slice(8)}
        loading={loading.p1}
        seeAllLink="/quoc-gia/viet-nam"
      />

      <div style={{ height: 48 }} />
    </div>
  );
}
