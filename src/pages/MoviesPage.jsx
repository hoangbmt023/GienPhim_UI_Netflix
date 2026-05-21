import { useState, useEffect } from "react";
import HeroBanner from "@/components/HeroBanner/HeroBanner";
import MovieRow from "@/components/MovieRow/MovieRow";
import SideLabelRow from "@/components/SideLabelRow/SideLabelRow";
import SpotlightSection from "@/components/SpotlightSection/SpotlightSection";
import { getMovieList, parseItems } from "@/services/ophimApi";
import { useLang } from "@/utils/lang";

export default function MoviesPage() {
  const { t } = useLang();
  const [featured, setFeatured] = useState([]);
  const [phimLe, setPhimLe] = useState([]);
  const [auMy, setAuMy] = useState([]);
  const [le2026, setLe2026] = useState([]);
  const [hanQuoc, setHanQuoc] = useState([]);
  const [nhatBan, setNhatBan] = useState([]);

  const [loading, setLoading] = useState({
    featured: true,
    phimLe: true,
    auMy: true,
    hanQuoc: true,
    nhatBan: true,
  });
  const done = (key) => setLoading((p) => ({ ...p, [key]: false }));

  useEffect(() => {
    document.title = `${t.header.movies || 'Phim Lẻ'} - GienPhim`;

    getMovieList("phim-le", { page: 1 })
      .then((r) => {
        const items = parseItems(r);
        setPhimLe(items);
        setFeatured(items.filter((m) => m.thumb_url));
      })
      .catch(() => { })
      .finally(() => {
        done("phimLe");
        done("featured");
      });

    getMovieList("phim-le?year=2026", { page: 1 })
      .then((r) => setLe2026(parseItems(r)))
      .catch(() => { })
      .finally(() => done("le2026"));

    getMovieList("phim-le?country=au-my", { page: 1 })
      .then((r) => setAuMy(parseItems(r)))
      .catch(() => { })
      .finally(() => done("auMy"));

    getMovieList("phim-le?country=han-quoc", { page: 1 })
      .then((r) => setHanQuoc(parseItems(r)))
      .catch(() => { })
      .finally(() => done("hanQuoc"));

    getMovieList("phim-le?country=nhat-ban", { page: 1 })
      .then((r) => setNhatBan(parseItems(r)))
      .catch(() => { })
      .finally(() => done("nhatBan"));
  }, [t.header.movies]);

  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      <HeroBanner movies={featured} loading={loading.featured} />

      <SpotlightSection
        title={t.sections.movies2026}
        items={le2026}
        loading={loading.le2026}
        seeAllLink="/list/phim-le?year=2026"
      />

      <MovieRow
        title={t.sections.topMovies}
        items={phimLe}
        loading={loading.phimLe}
        seeAllLink="/list/phim-le"
        ranked
      />

      <SideLabelRow
        title={t.sections.westernCinema}
        items={auMy}
        loading={loading.auMy}
        seeAllLink="/list/phim-le?country=au-my"
      />

      <SideLabelRow
        title={t.sections.koreanCinema}
        items={hanQuoc}
        loading={loading.hanQuoc}
        seeAllLink="/list/phim-le?country=han-quoc"
      />

      <SideLabelRow
        title={t.sections.japaneseCinema}
        items={nhatBan}
        loading={loading.nhatBan}
        seeAllLink="/list/phim-le?country=nhat-ban"
      />

      <div style={{ height: 48 }} />
    </div>
  );
}
