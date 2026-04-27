import { useState, useEffect } from 'react';
import HeroBanner from '@/components/HeroBanner/HeroBanner';
import MovieRow from '@/components/MovieRow/MovieRow';
import SideLabelRow from '@/components/SideLabelRow/SideLabelRow';
import SpotlightSection from '@/components/SpotlightSection/SpotlightSection';
import { getMovieList, parseItems } from '@/services/ophimApi';

export default function PhimBoPage() {
  const [featured, setFeatured] = useState([]);
  const [phimBo, setPhimBo] = useState([]);
  const [dangChieu, setDangChieu] = useState([]);
  const [hoanThanh, setHoanThanh] = useState([]);
  const [korean, setKorean] = useState([]);
  const [chinese, setChinese] = useState([]);
  const [thai, setThai] = useState([]);
  const [nhatBan, setNhatBan] = useState([]);

  const [loading, setLoading] = useState({
    featured: true, phimBo: true, dangChieu: true, hoanThanh: true,
    korean: true, chinese: true, thai: true, nhatBan: true,
  });
  const done = (key) => setLoading(p => ({ ...p, [key]: false }));

  useEffect(() => {
    getMovieList('phim-bo', { page: 1 })
      .then(r => {
        const items = parseItems(r);
        setPhimBo(items);
        setFeatured(items.filter(m => m.thumb_url));
      })
      .catch(() => { })
      .finally(() => { done('phimBo'); done('featured'); });

    getMovieList('phim-bo-dang-chieu', { page: 1 })
      .then(r => setDangChieu(parseItems(r)))
      .catch(() => { })
      .finally(() => done('dangChieu'));

    getMovieList('phim-bo-hoan-thanh', { page: 1 })
      .then(r => setHoanThanh(parseItems(r)))
      .catch(() => { })
      .finally(() => done('hoanThanh'));

    getMovieList('phim-bo?country=han-quoc', { page: 1 })
      .then(r => setKorean(parseItems(r)))
      .catch(() => { })
      .finally(() => done('korean'));

    getMovieList('phim-bo?country=trung-quoc', { page: 1 })
      .then(r => setChinese(parseItems(r)))
      .catch(() => { })
      .finally(() => done('chinese'));

    getMovieList('phim-bo?country=thai-lan', { page: 1 })
      .then(r => setThai(parseItems(r)))
      .catch(() => { })
      .finally(() => done('thai'));

    getMovieList('phim-bo?country=nhat-ban', { page: 1 })
      .then(r => setNhatBan(parseItems(r)))
      .catch(() => { })
      .finally(() => done('nhatBan'));
  }, []);

  return (
    <div style={{ background: '#141414', minHeight: '100vh' }}>
      <HeroBanner movies={featured} loading={loading.featured} />

      <SpotlightSection
        title="Phim Bộ Đang Chiếu"
        items={dangChieu}
        loading={loading.dangChieu}
        seeAllLink="/danh-sach/phim-bo-dang-chieu"
      />

      <SpotlightSection
        title="Phim Bộ Hoàn Thành"
        items={hoanThanh}
        loading={loading.hoanThanh}
        seeAllLink="/danh-sach/phim-bo-hoan-thanh"
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
        seeAllLink="/danh-sach/phim-bo?country=han-quoc"
      />

      <SideLabelRow
        title="Phim Bộ Trung Quốc"
        items={chinese}
        loading={loading.chinese}
        seeAllLink="/danh-sach/phim-bo?country=trung-quoc"
      />

      <SideLabelRow
        title="Phim Bộ Thái Lan"
        items={thai}
        loading={loading.thai}
        seeAllLink="/danh-sach/phim-bo?country=thai-lan"
      />

      <SideLabelRow
        title="Phim Bộ Nhật Bản"
        items={nhatBan}
        loading={loading.nhatBan}
        seeAllLink="/danh-sach/phim-bo?country=nhat-ban"
      />

      <div style={{ height: 48 }} />
    </div>
  );
}
