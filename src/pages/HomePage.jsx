import { useState, useEffect } from "react";
import HeroBanner from "@/components/HeroBanner/HeroBanner";
import MovieRow from "@/components/MovieRow/MovieRow";
import CategoryCards from "@/components/CategoryCards/CategoryCards";
import SpotlightSection from "@/components/SpotlightSection/SpotlightSection";
import SideLabelRow from "@/components/SideLabelRow/SideLabelRow";
import {
  getHome,
  getMovieList,
  getByCountry,
  parseItems,
} from "@/services/ophimApi";

export default function HomePage() {
  const [heroMovies, setHeroMovies] = useState([]);
  const [newMovies, setNewMovies] = useState([]);
  const [seriesMovies, setSeriesMovies] = useState([]);
  const [singleMovies, setSingleMovies] = useState([]);
  const [koreanMovies, setKoreanMovies] = useState([]);
  const [chineseMovies, setChineseMovies] = useState([]);
  const [westernMovies, setWesternMovies] = useState([]);
  const [japanMovies, setJapanMovies] = useState([]);
  const [vietnamMovies, setVietnamMovies] = useState([]);
  const [theaterMovies, setTheaterMovies] = useState([]);
  
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [dubbedMovies, setDubbedMovies] = useState([]);
  const [vietsubMovies, setVietsubMovies] = useState([]);

  const [loading, setLoading] = useState({
    hero: true,
    new: true,
    series: true,
    single: true,
    korean: true,
    chinese: true,
    western: true,
    japan: true,
    vietnam: true,
    theater: true,
    upcoming: true,
    dubbed: true,
    vietsub: true,
  });

  const done = (key) => setLoading((p) => ({ ...p, [key]: false }));

  useEffect(() => {
    document.title = "GienPhim - Xem Phim Online Chất Lượng Cao";

    /* Hero */
    getHome()
      .then((r) => setHeroMovies(parseItems(r).filter((m) => m.thumb_url)))
      .catch(() => {})
      .finally(() => done("hero"));

    /* Phim mới cập nhật */
    getMovieList("phim-moi", { page: 1 })
      .then((r) => setNewMovies(parseItems(r)))
      .catch(() => {})
      .finally(() => done("new"));

    /* Phim bộ */
    getMovieList("phim-bo", { page: 1 })
      .then((r) => setSeriesMovies(parseItems(r)))
      .catch(() => {})
      .finally(() => done("series"));

    /* Phim lẻ */
    getMovieList("phim-le", { page: 1 })
      .then((r) => setSingleMovies(parseItems(r)))
      .catch(() => {})
      .finally(() => done("single"));

    /* Phim chiếu rạp */
    getMovieList("phim-chieu-rap", { page: 1 })
      .then((r) => setTheaterMovies(parseItems(r)))
      .catch(() => {})
      .finally(() => done("theater"));
      
    /* Sắp chiếu */
    getMovieList("phim-sap-chieu", { page: 1 })
      .then((r) => setUpcomingMovies(parseItems(r)))
      .catch(() => {})
      .finally(() => done("upcoming"));

    /* Lồng tiếng */
    getMovieList("phim-long-tien", { page: 1 })
      .then((r) => setDubbedMovies(parseItems(r)))
      .catch(() => {})
      .finally(() => done("dubbed"));

    /* Vietsub */
    getMovieList("phim-vietsub", { page: 1 })
      .then((r) => setVietsubMovies(parseItems(r)))
      .catch(() => {})
      .finally(() => done("vietsub"));

    /* Hàn Quốc */
    getByCountry("han-quoc", { page: 1 })
      .then((r) => setKoreanMovies(parseItems(r)))
      .catch(() => {})
      .finally(() => done("korean"));

    /* Trung Quốc */
    getByCountry("trung-quoc", { page: 1 })
      .then((r) => setChineseMovies(parseItems(r)))
      .catch(() => {})
      .finally(() => done("chinese"));

    /* Âu Mỹ */
    getByCountry("au-my", { page: 1 })
      .then((r) => setWesternMovies(parseItems(r)))
      .catch(() => {})
      .finally(() => done("western"));

    /* Nhật Bản */
    getByCountry("nhat-ban", { page: 1 })
      .then((r) => setJapanMovies(parseItems(r)))
      .catch(() => {})
      .finally(() => done("japan"));

    /* Việt Nam */
    getByCountry("viet-nam", { page: 1 })
      .then((r) => setVietnamMovies(parseItems(r)))
      .catch(() => {})
      .finally(() => done("vietnam"));
  }, []);

  return (
    <div style={{ background: "#141414", minHeight: "100vh" }}>
      {/* 1. HERO BANNER */}
      <HeroBanner movies={heroMovies} loading={loading.hero} />

      {/* 2. THỂ LOẠI */}
      <CategoryCards title="Bạn đang quan tâm gì?" limit={8} />

      {/* 3. SPOTLIGHT – Phim chiếu rạp */}
      <SpotlightSection
        title="Phim mới chiếu rạp"
        items={theaterMovies}
        loading={loading.theater}
        seeAllLink="/danh-sach/phim-chieu-rap"
      />
      
      {/* Phim Sắp Chiếu */}
      <MovieRow
        title="Phim Sắp Chiếu"
        items={upcomingMovies}
        loading={loading.upcoming}
        seeAllLink="/danh-sach/phim-sap-chieu"
      />

      {/* 4. TOP PHIM BỘ */}
      <MovieRow
        title="Top Phim Bộ"
        items={seriesMovies}
        loading={loading.series}
        seeAllLink="/danh-sach/phim-bo"
        ranked
      />

      {/* 5. TOP PHIM LẺ */}
      <MovieRow
        title="Top Phim Lẻ"
        items={singleMovies}
        loading={loading.single}
        seeAllLink="/danh-sach/phim-le"
        ranked
      />
      
      {/* Phim Vietsub */}
      <SideLabelRow
        title="Tuyển tập Vietsub"
        items={vietsubMovies}
        loading={loading.vietsub}
        seeAllLink="/danh-sach/phim-vietsub"
      />
      
      {/* Phim Lồng Tiếng */}
      <SideLabelRow
        title="Phim Lồng Tiếng"
        items={dubbedMovies}
        loading={loading.dubbed}
        seeAllLink="/danh-sach/phim-long-tien"
      />

      {/* 6. ĐIỆN ẢNH HÀN QUỐC */}
      <SideLabelRow
        title="Điện ảnh Hàn Quốc"
        items={koreanMovies}
        loading={loading.korean}
        seeAllLink="/quoc-gia/han-quoc"
      />

      {/* 7. ĐIỆN ẢNH TRUNG QUỐC */}
      <SideLabelRow
        title="Điện ảnh Trung Quốc"
        items={chineseMovies}
        loading={loading.chinese}
        seeAllLink="/quoc-gia/trung-quoc"
      />

      {/* 8. ĐIỆN ẢNH ÂU MỸ */}
      <SideLabelRow
        title="Điện ảnh Âu Mỹ"
        items={westernMovies}
        loading={loading.western}
        seeAllLink="/quoc-gia/au-my"
      />

      {/* 9. PHIM VIỆT NAM */}
      <SideLabelRow
        title="Phim Việt Nam"
        items={vietnamMovies}
        loading={loading.vietnam}
        seeAllLink="/quoc-gia/viet-nam"
      />

      {/* 10. ĐIỆN ẢNH NHẬT BẢN */}
      <SideLabelRow
        title="Điện ảnh Nhật Bản"
        items={japanMovies}
        loading={loading.japan}
        seeAllLink="/quoc-gia/nhat-ban"
      />

      {/* 11. PHIM MỚI CẬP NHẬT */}
      <MovieRow
        title="Phim mới cập nhật"
        items={newMovies}
        loading={loading.new}
        seeAllLink="/danh-sach/phim-moi"
      />

      <div style={{ height: 48 }} />
    </div>
  );
}
