import { useState, useEffect } from 'react';
import HeroBanner    from '@/components/HeroBanner/HeroBanner';
import MovieRow      from '@/components/MovieRow/MovieRow';
import SideLabelRow  from '@/components/SideLabelRow/SideLabelRow';
import SpotlightSection from '@/components/SpotlightSection/SpotlightSection';
import { getMovieList, getByCountry, parseItems } from '@/services/ophimApi';

export default function PhimLePage() {
  const [featured, setFeatured] = useState([]);
  const [phimLe,   setPhimLe]   = useState([]);
  const [auMy,     setAuMy]     = useState([]);
  const [hanQuoc,  setHanQuoc]  = useState([]);
  const [nhatBan,  setNhatBan]  = useState([]);

  const [loading, setLoading] = useState({
    featured: true, phimLe: true, auMy: true, hanQuoc: true, nhatBan: true,
  });
  const done = (key) => setLoading(p => ({ ...p, [key]: false }));

  useEffect(() => {
    getMovieList('phim-le', { page: 1 })
      .then(r => {
        const items = parseItems(r);
        setPhimLe(items);
        setFeatured(items.filter(m => m.thumb_url));
      })
      .catch(() => {})
      .finally(() => { done('phimLe'); done('featured'); });

    getByCountry('au-my', { page: 1 })
      .then(r => setAuMy(parseItems(r)))
      .catch(() => {})
      .finally(() => done('auMy'));

    getByCountry('han-quoc', { page: 1 })
      .then(r => setHanQuoc(parseItems(r)))
      .catch(() => {})
      .finally(() => done('hanQuoc'));

    getByCountry('nhat-ban', { page: 1 })
      .then(r => setNhatBan(parseItems(r)))
      .catch(() => {})
      .finally(() => done('nhatBan'));
  }, []);

  return (
    <div style={{ background: '#141414', minHeight: '100vh' }}>
      <HeroBanner movies={featured} loading={loading.featured} />

      <SpotlightSection
        title="Phim Lẻ nổi bật"
        items={phimLe}
        loading={loading.phimLe}
        seeAllLink="/danh-sach/phim-le"
      />

      <MovieRow
        title="Top Phim Lẻ"
        items={phimLe}
        loading={loading.phimLe}
        seeAllLink="/danh-sach/phim-le"
        ranked
      />

      <SideLabelRow
        title="Điện ảnh Âu Mỹ"
        items={auMy}
        loading={loading.auMy}
        seeAllLink="/quoc-gia/au-my"
      />

      <SideLabelRow
        title="Điện ảnh Hàn Quốc"
        items={hanQuoc}
        loading={loading.hanQuoc}
        seeAllLink="/quoc-gia/han-quoc"
      />

      <SideLabelRow
        title="Điện ảnh Nhật Bản"
        items={nhatBan}
        loading={loading.nhatBan}
        seeAllLink="/quoc-gia/nhat-ban"
      />

      <div style={{ height: 48 }} />
    </div>
  );
}
