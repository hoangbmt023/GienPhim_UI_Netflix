import { useState, useEffect } from "react";
import HeroBanner from "@/components/HeroBanner/HeroBanner";
import MovieRow from "@/components/MovieRow/MovieRow";
import SideLabelRow from "@/components/SideLabelRow/SideLabelRow";
import SpotlightSection from "@/components/SpotlightSection/SpotlightSection";
import { getMovieList, parseItems } from "@/services/ophimApi";

export default function PhimLePage() {
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
  }, []);

  return (
    <div style={{ background: "#141414", minHeight: "100vh" }}>
      <HeroBanner movies={featured} loading={loading.featured} />

      <SpotlightSection
        title="Phim Lẻ 2026"
        items={le2026}
        loading={loading.le2026}
        seeAllLink="/danh-sach/phim-le?year=2026"
      />

      <MovieRow
        title="Top Phim Lẻ"
        items={phimLe}
        loading={loading.phimLe}
        seeAllLink="/danh-sach/phim-le"
        ranked
      />

      <SideLabelRow
        title="Điện ảnh Âu Mỹ"
        items={auMy}
        loading={loading.auMy}
        seeAllLink="/danh-sach/phim-le?country=au-my"
      />

      <SideLabelRow
        title="Điện ảnh Hàn Quốc"
        items={hanQuoc}
        loading={loading.hanQuoc}
        seeAllLink="/danh-sach/phim-le?country=han-quoc"
      />

      <SideLabelRow
        title="Điện ảnh Nhật Bản"
        items={nhatBan}
        loading={loading.nhatBan}
        seeAllLink="/danh-sach/phim-le?country=nhat-ban"
      />

      <div style={{ height: 48 }} />
    </div>
  );
}
