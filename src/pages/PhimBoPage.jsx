import { useState, useEffect } from 'react';
import HeroBanner    from '@/components/HeroBanner/HeroBanner';
import MovieRow      from '@/components/MovieRow/MovieRow';
import SideLabelRow  from '@/components/SideLabelRow/SideLabelRow';
import SpotlightSection from '@/components/SpotlightSection/SpotlightSection';
import { getMovieList, getByCountry, parseItems } from '@/services/ophimApi';

export default function PhimBoPage() {
  const [featured,  setFeatured]  = useState([]);
  const [phimBo,    setPhimBo]    = useState([]);
  const [korean,    setKorean]    = useState([]);
  const [chinese,   setChinese]   = useState([]);
  const [thai,      setThai]      = useState([]);

  const [loading, setLoading] = useState({
    featured: true, phimBo: true, korean: true, chinese: true, thai: true,
  });
  const done = (key) => setLoading(p => ({ ...p, [key]: false }));

  useEffect(() => {
    getMovieList('phim-bo', { page: 1 })
      .then(r => {
        const items = parseItems(r);
        setPhimBo(items);
        setFeatured(items.filter(m => m.thumb_url));
      })
      .catch(() => {})
      .finally(() => { done('phimBo'); done('featured'); });

    getByCountry('han-quoc', { page: 1 })
      .then(r => setKorean(parseItems(r)))
      .catch(() => {})
      .finally(() => done('korean'));

    getByCountry('trung-quoc', { page: 1 })
      .then(r => setChinese(parseItems(r)))
      .catch(() => {})
      .finally(() => done('chinese'));

    getByCountry('thai-lan', { page: 1 })
      .then(r => setThai(parseItems(r)))
      .catch(() => {})
      .finally(() => done('thai'));
  }, []);

  return (
    <div style={{ background: '#141414', minHeight: '100vh' }}>
      <HeroBanner movies={featured} loading={loading.featured} />

      <SpotlightSection
        title="Phim Bộ nổi bật"
        items={phimBo}
        loading={loading.phimBo}
        seeAllLink="/danh-sach/phim-bo"
      />

      <MovieRow
        title="Top Phim Bộ"
        items={phimBo}
        loading={loading.phimBo}
        seeAllLink="/danh-sach/phim-bo"
        ranked
      />

      <SideLabelRow
        title="Phim Bộ Hàn Quốc"
        items={korean}
        loading={loading.korean}
        seeAllLink="/quoc-gia/han-quoc"
      />

      <SideLabelRow
        title="Phim Bộ Trung Quốc"
        items={chinese}
        loading={loading.chinese}
        seeAllLink="/quoc-gia/trung-quoc"
      />

      <SideLabelRow
        title="Phim Bộ Thái Lan"
        items={thai}
        loading={loading.thai}
        seeAllLink="/quoc-gia/thai-lan"
      />

      <div style={{ height: 48 }} />
    </div>
  );
}
