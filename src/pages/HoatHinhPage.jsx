import { useState, useEffect } from 'react';
import HeroBanner       from '@/components/HeroBanner/HeroBanner';
import SpotlightSection from '@/components/SpotlightSection/SpotlightSection';
import MovieRow         from '@/components/MovieRow/MovieRow';
import SideLabelRow     from '@/components/SideLabelRow/SideLabelRow';
import { getMovieList, getByCategory, parseItems } from '@/services/ophimApi';

export default function HoatHinhPage() {
  const [hero,   setHero]   = useState([]);
  const [hhList, setHhList] = useState([]);
  const [action, setAction] = useState([]);
  const [family, setFamily] = useState([]);

  const [loading, setLoading] = useState({ hero: true, hh: true, action: true, family: true });
  const done = (k) => setLoading(p => ({ ...p, [k]: false }));

  useEffect(() => {
    getMovieList('hoat-hinh', { page: 1 })
      .then(r => {
        const items = parseItems(r);
        setHero(items.filter(m => m.thumb_url));
        setHhList(items);
      })
      .catch(() => {})
      .finally(() => { done('hero'); done('hh'); });

    /* Phim hoạt hình thể loại Phiêu lưu */
    getByCategory('phieu-luu', { page: 1 })
      .then(r => setAction(parseItems(r)))
      .catch(() => {})
      .finally(() => done('action'));

    /* Phim hoạt hình thể loại Gia đình */
    getByCategory('gia-dinh', { page: 1 })
      .then(r => setFamily(parseItems(r)))
      .catch(() => {})
      .finally(() => done('family'));
  }, []);

  return (
    <div style={{ background: '#141414', minHeight: '100vh' }}>
      <HeroBanner movies={hero} loading={loading.hero} />

      <SpotlightSection
        title="Hoạt hình nổi bật"
        items={hhList}
        loading={loading.hh}
        seeAllLink="/danh-sach/hoat-hinh"
      />

      <MovieRow
        title="Top Phim Hoạt Hình"
        items={hhList}
        loading={loading.hh}
        seeAllLink="/danh-sach/hoat-hinh"
        ranked
      />

      <SideLabelRow
        title="Hoạt hình Phiêu Lưu"
        items={action}
        loading={loading.action}
        seeAllLink="/the-loai/phieu-luu"
      />

      <SideLabelRow
        title="Hoạt hình Gia Đình"
        items={family}
        loading={loading.family}
        seeAllLink="/the-loai/gia-dinh"
      />

      <MovieRow
        title="Hoạt hình mới nhất"
        items={hhList.slice(12)}
        loading={loading.hh}
        seeAllLink="/danh-sach/hoat-hinh"
      />

      <div style={{ height: 48 }} />
    </div>
  );
}
