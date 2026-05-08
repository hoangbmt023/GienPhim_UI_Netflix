import { useState, useEffect } from 'react';
import HeroBanner from '@/components/HeroBanner/HeroBanner';
import SpotlightSection from '@/components/SpotlightSection/SpotlightSection';
import MovieRow from '@/components/MovieRow/MovieRow';
import SideLabelRow from '@/components/SideLabelRow/SideLabelRow';
import { getMovieList, parseItems } from '@/services/ophimApi';
import { useLang } from '@/utils/lang';

export default function HoatHinhPage() {
  const { t } = useLang();
  const [hero, setHero] = useState([]);
  const [hhList, setHhList] = useState([]);
  const [latestYear, setLatestYear] = useState([]);
  const [action, setAction] = useState([]);
  const [family, setFamily] = useState([]);
  const [nhatBan, setNhatBan] = useState([]);
  const [oldest, setOldest] = useState([]);

  const [loading, setLoading] = useState({
    hero: true, hh: true, latestYear: true, action: true,
    family: true, nhatBan: true, oldest: true,
  });
  const done = (k) => setLoading(p => ({ ...p, [k]: false }));

  useEffect(() => {
    // Top / Featured Hoạt hình
    getMovieList('hoat-hinh', { page: 1 })
      .then(r => {
        const items = parseItems(r);
        setHero(items.filter(m => m.thumb_url));
        setHhList(items);
      })
      .catch(() => { })
      .finally(() => { done('hero'); done('hh'); });

    // Hoạt hình năm mới nhất
    getMovieList('hoat-hinh', { page: 1, sort_field: 'year', sort_type: 'desc' })
      .then(r => setLatestYear(parseItems(r)))
      .catch(() => { })
      .finally(() => done('latestYear'));

    // Hoạt hình Phiêu lưu
    getMovieList('hoat-hinh?category=phieu-luu', { page: 1 })
      .then(r => setAction(parseItems(r)))
      .catch(() => { })
      .finally(() => done('action'));

    // Hoạt hình Gia đình
    getMovieList('hoat-hinh?category=gia-dinh', { page: 1 })
      .then(r => setFamily(parseItems(r)))
      .catch(() => { })
      .finally(() => done('family'));

    // Hoạt hình Nhật Bản
    getMovieList('hoat-hinh?country=nhat-ban', { page: 1 })
      .then(r => setNhatBan(parseItems(r)))
      .catch(() => { })
      .finally(() => done('nhatBan'));

    // Hoạt hình cũ nhất
    getMovieList('hoat-hinh', { page: 1, sort_field: 'modified.time', sort_type: 'asc' })
      .then(r => setOldest(parseItems(r)))
      .catch(() => { })
      .finally(() => done('oldest'));
  }, []);

  return (
    <div style={{ background: '#141414', minHeight: '100vh' }}>
      <HeroBanner movies={hero} loading={loading.hero} />

      <SpotlightSection
        title={t.sections.latestAnimation}
        items={latestYear}
        loading={loading.latestYear}
        seeAllLink="/list/hoat-hinh?sort_field=year&sort_type=desc"
      />

      <MovieRow
        title={t.sections.topAnimation}
        items={hhList}
        loading={loading.hh}
        seeAllLink="/list/hoat-hinh"
        ranked
      />

      <SideLabelRow
        title={t.sections.latestJapaneseAnimation}
        items={nhatBan}
        loading={loading.nhatBan}
        seeAllLink="/list/hoat-hinh?country=nhat-ban"
      />

      <SideLabelRow
        title={t.sections.adventureAnimation}
        items={action}
        loading={loading.action}
        seeAllLink="/list/hoat-hinh?category=phieu-luu"
      />

      <SideLabelRow
        title={t.sections.familyAnimation}
        items={family}
        loading={loading.family}
        seeAllLink="/list/hoat-hinh?category=gia-dinh"
      />

      <MovieRow
        title={t.sections.oldestAnimation}
        items={oldest}
        loading={loading.oldest}
        seeAllLink="/list/hoat-hinh?sort_field=modified.time&sort_type=asc"
      />

      <div style={{ height: 48 }} />
    </div>
  );
}
