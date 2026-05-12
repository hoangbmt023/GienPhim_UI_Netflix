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
import { useLang } from "@/utils/lang";

export default function HomePage() {
  const { t } = useLang();
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
    document.title = `${t.common?.home} - GienPhim`;

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
    getMovieList("phim-long-tieng", { page: 1 })
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
      <CategoryCards title={t.sections.whatAreYouInterestedIn} limit={8} />

      {/* 3. SPOTLIGHT – Phim chiếu rạp */}
      <SpotlightSection
        title={t.sections.newInTheaters}
        items={theaterMovies}
        loading={loading.theater}
        seeAllLink="/list/phim-chieu-rap"
      />

      {/* Phim Sắp Chiếu */}
      <MovieRow
        title={t.sections.upcomingMovies}
        items={upcomingMovies}
        loading={loading.upcoming}
        seeAllLink="/list/phim-sap-chieu"
      />

      {/* 4. TOP PHIM BỘ */}
      <MovieRow
        title={t.sections.topSeries}
        items={seriesMovies}
        loading={loading.series}
        seeAllLink="/list/phim-bo"
        ranked
      />

      {/* 5. TOP PHIM LẺ */}
      <MovieRow
        title={t.sections.topMovies}
        items={singleMovies}
        loading={loading.single}
        seeAllLink="/list/phim-le"
        ranked
      />

      {/* Phim Vietsub */}
      <SideLabelRow
        title={t.sections.vietsubCollection}
        items={vietsubMovies}
        loading={loading.vietsub}
        seeAllLink="/list/phim-vietsub"
      />

      {/* Phim Lồng Tiếng */}
      <SideLabelRow
        title={t.sections.dubbedMovies}
        items={dubbedMovies}
        loading={loading.dubbed}
        seeAllLink="/list/phim-long-tieng"
      />

      {/* 6. ĐIỆN ẢNH HÀN QUỐC */}
      <SideLabelRow
        title={t.sections.koreanCinema}
        items={koreanMovies}
        loading={loading.korean}
        seeAllLink="/country/han-quoc"
      />

      {/* 7. ĐIỆN ẢNH TRUNG QUỐC */}
      <SideLabelRow
        title={t.sections.chineseCinema}
        items={chineseMovies}
        loading={loading.chinese}
        seeAllLink="/country/trung-quoc"
      />

      {/* 8. ĐIỆN ẢNH ÂU MỸ */}
      <SideLabelRow
        title={t.sections.westernCinema}
        items={westernMovies}
        loading={loading.western}
        seeAllLink="/country/au-my"
      />

      {/* 9. PHIM VIỆT NAM */}
      <SideLabelRow
        title={t.sections.vietnameseMovies}
        items={vietnamMovies}
        loading={loading.vietnam}
        seeAllLink="/country/vietnam"
      />

      {/* 10. ĐIỆN ẢNH NHẬT BẢN */}
      <SideLabelRow
        title={t.sections.japaneseCinema}
        items={japanMovies}
        loading={loading.japan}
        seeAllLink="/country/nhat-ban"
      />

      {/* 11. PHIM MỚI CẬP NHẬT */}
      <MovieRow
        title={t.sections.recentlyUpdated}
        items={newMovies}
        loading={loading.new}
        seeAllLink="/list/phim-moi"
      />

      <div style={{ height: 48 }} />
    </div>
  );
}
