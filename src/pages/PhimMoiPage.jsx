import { useState, useEffect } from 'react';
import HeroBanner       from '@/components/HeroBanner/HeroBanner';
import SpotlightSection from '@/components/SpotlightSection/SpotlightSection';
import SideLabelRow     from '@/components/SideLabelRow/SideLabelRow';
import MovieRow         from '@/components/MovieRow/MovieRow';
import { getMovieList, getByCountry, parseItems } from '@/services/ophimApi';
import { useLang } from '@/utils/lang';

export default function PhimMoiPage() {
  const { t } = useLang();
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
        title={t.sections?.newMovies || 'Phim mới cập nhật'}
        items={recent}
        loading={loading.recent}
        seeAllLink="/list/phim-moi"
      />

      <MovieRow
        title={t.sections?.todayNew || 'Phim mới nhất hôm nay'}
        items={recent}
        loading={loading.recent}
        seeAllLink="/list/phim-moi"
      />

      <SideLabelRow
        title={t.sections?.korean || 'Điện ảnh Hàn Quốc'}
        items={korean}
        loading={loading.korean}
        seeAllLink="/country/han-quoc"
      />

      <SideLabelRow
        title={t.sections?.chinese || 'Điện ảnh Trung Quốc'}
        items={chinese}
        loading={loading.chinese}
        seeAllLink="/country/trung-quoc"
      />

      <SideLabelRow
        title={t.sections?.western || 'Điện ảnh Phương Tây'}
        items={western}
        loading={loading.western}
        seeAllLink="/country/au-my"
      />

      <div style={{ height: 48 }} />
    </div>
  );
}
