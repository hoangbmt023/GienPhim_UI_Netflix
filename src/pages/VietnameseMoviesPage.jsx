import { useState, useEffect } from 'react';
import HeroBanner       from '@/components/HeroBanner/HeroBanner';
import SpotlightSection from '@/components/SpotlightSection/SpotlightSection';
import SideLabelRow     from '@/components/SideLabelRow/SideLabelRow';
import MovieRow         from '@/components/MovieRow/MovieRow';
import { getByCountry, getMovieList, parseItems } from '@/services/ophimApi';
import { useLang } from '@/utils/lang';

export default function VietnameseMoviesPage() {
  const { t } = useLang();
  const [hero, setHero] = useState([]);
  const [phimMoi, setPhimMoi] = useState([]);
  const [chieuRap, setChieuRap] = useState([]);
  const [phimLe, setPhimLe] = useState([]);
  const [phimBo, setPhimBo] = useState([]);
  const [tinhCam, setTinhCam] = useState([]);
  const [giaDinh, setGiaDinh] = useState([]);

  const [loading, setLoading] = useState({
    hero: true, phimMoi: true, chieuRap: true, phimLe: true, phimBo: true,
    tinhCam: true, giaDinh: true,
  });
  const done = (k) => setLoading(p => ({ ...p, [k]: false }));

  useEffect(() => {
    document.title = `${t.header.vietnamese || 'Phim Việt Nam'} - GienPhim`;

    // Top Phim Việt Nam + Hero
    getMovieList('phim-moi?country=viet-nam', { page: 1 })
      .then(r => {
        const items = parseItems(r);
        setHero(items.filter(m => m.thumb_url).slice(0, 8));
        setPhimMoi(items);
      })
      .catch(() => {})
      .finally(() => { done('hero'); done('phimMoi'); });

    // Phim Chiếu Rạp Việt Nam
    getMovieList('phim-chieu-rap?country=viet-nam', { page: 1 })
      .then(r => setChieuRap(parseItems(r)))
      .catch(() => {})
      .finally(() => done('chieuRap'));

    // Phim Lẻ Việt Nam
    getMovieList('phim-le?country=viet-nam', { page: 1 })
      .then(r => setPhimLe(parseItems(r)))
      .catch(() => {})
      .finally(() => done('phimLe'));

    // Phim Bộ Việt Nam
    getMovieList('phim-bo?country=viet-nam', { page: 1 })
      .then(r => setPhimBo(parseItems(r)))
      .catch(() => {})
      .finally(() => done('phimBo'));

    // Phim Tình Cảm Việt Nam
    getByCountry('viet-nam?category=tinh-cam', { page: 1 })
      .then(r => setTinhCam(parseItems(r)))
      .catch(() => {})
      .finally(() => done('tinhCam'));

    // Phim Gia Đình Việt Nam
    getByCountry('viet-nam?category=gia-dinh', { page: 1 })
      .then(r => setGiaDinh(parseItems(r)))
      .catch(() => {})
      .finally(() => done('giaDinh'));
  }, [t.header.vietnamese]);

  return (
    <div style={{ background: '#141414', minHeight: '100vh' }}>
      <HeroBanner movies={hero} loading={loading.hero} />

      <SpotlightSection
        title={t.sections.vietnameseTheatrical}
        items={chieuRap}
        loading={loading.chieuRap}
        seeAllLink="/list/phim-chieu-rap?country=viet-nam"
      />

      <MovieRow
        title={t.sections.topVietnameseMovies}
        items={phimMoi}
        loading={loading.phimMoi}
        seeAllLink="/list/phim-moi?country=viet-nam"
        ranked
      />

      <SideLabelRow
        title={t.sections.vietnameseSingleMovies}
        items={phimLe}
        loading={loading.phimLe}
        seeAllLink="/list/phim-le?country=viet-nam"
      />

      <SideLabelRow
        title={t.sections.vietnameseSeries}
        items={phimBo}
        loading={loading.phimBo}
        seeAllLink="/list/phim-bo?country=viet-nam"
      />

      <SideLabelRow
        title={t.sections.romanceCollection}
        items={tinhCam}
        loading={loading.tinhCam}
        seeAllLink="/category/tinh-cam?country=viet-nam"
      />

      <SideLabelRow
        title={t.sections.familyCollection}
        items={giaDinh}
        loading={loading.giaDinh}
        seeAllLink="/category/gia-dinh?country=viet-nam"
      />

      <div style={{ height: 48 }} />
    </div>
  );
}
