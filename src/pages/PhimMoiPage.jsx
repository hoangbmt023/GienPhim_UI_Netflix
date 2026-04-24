import { useState, useEffect } from 'react';
import HeroBanner       from '@/components/HeroBanner/HeroBanner';
import SpotlightSection from '@/components/SpotlightSection/SpotlightSection';
import SideLabelRow     from '@/components/SideLabelRow/SideLabelRow';
import MovieRow         from '@/components/MovieRow/MovieRow';
import { getMovieList, getByCountry, parseItems } from '@/services/ophimApi';

export default function PhimMoiPage() {
  const [hero,    setHero]    = useState([]);
  const [recent,  setRecent]  = useState([]);
  const [korean,  setKorean]  = useState([]);
  const [chinese, setChinese] = useState([]);
  const [western, setWestern] = useState([]);

  const [loading, setLoading] = useState({
    hero: true, recent: true, korean: true, chinese: true, western: true,
  });
  const done = (k) => setLoading(p => ({ ...p, [k]: false }));

  useEffect(() => {
    getMovieList('phim-moi', { page: 1 })
      .then(r => {
        const items = parseItems(r);
        setHero(items.filter(m => m.thumb_url));
        setRecent(items);
      })
      .catch(() => {})
      .finally(() => { done('hero'); done('recent'); });

    getByCountry('han-quoc', { page: 1 })
      .then(r => setKorean(parseItems(r)))
      .catch(() => {})
      .finally(() => done('korean'));

    getByCountry('trung-quoc', { page: 1 })
      .then(r => setChinese(parseItems(r)))
      .catch(() => {})
      .finally(() => done('chinese'));

    getByCountry('au-my', { page: 1 })
      .then(r => setWestern(parseItems(r)))
      .catch(() => {})
      .finally(() => done('western'));
  }, []);

  return (
    <div style={{ background: '#141414', minHeight: '100vh' }}>
      <HeroBanner movies={hero} loading={loading.hero} />

      <SpotlightSection
        title="Phim mới cập nhật"
        items={recent}
        loading={loading.recent}
        seeAllLink="/danh-sach/phim-moi"
      />

      <MovieRow
        title="Phim mới nhất hôm nay"
        items={recent}
        loading={loading.recent}
        seeAllLink="/danh-sach/phim-moi"
      />

      <SideLabelRow
        title="Điện ảnh Hàn Quốc"
        items={korean}
        loading={loading.korean}
        seeAllLink="/quoc-gia/han-quoc"
      />

      <SideLabelRow
        title="Điện ảnh Trung Quốc"
        items={chinese}
        loading={loading.chinese}
        seeAllLink="/quoc-gia/trung-quoc"
      />

      <SideLabelRow
        title="Điện ảnh Phương Tây"
        items={western}
        loading={loading.western}
        seeAllLink="/quoc-gia/au-my"
      />

      <div style={{ height: 48 }} />
    </div>
  );
}
