import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, parseItems } from '@/services/ophimApi';
import './CategoryCards.css';

/* Màu gradient theo thứ tự */
const COLORS = [
  'linear-gradient(135deg,#c0392b,#8e44ad)',
  'linear-gradient(135deg,#1a5276,#2980b9)',
  'linear-gradient(135deg,#0e6655,#1abc9c)',
  'linear-gradient(135deg,#b7950b,#d35400)',
  'linear-gradient(135deg,#6c3483,#1a5276)',
  'linear-gradient(135deg,#1c2833,#2c3e50)',
  'linear-gradient(135deg,#a93226,#e74c3c)',
  'linear-gradient(135deg,#1b4f72,#2874a6)',
];

/**
 * CategoryCards
 * Fetch categories từ OPhim API và hiển thị dạng grid card.
 *
 * Props:
 *   title  {string}  – heading (default "Bạn đang quan tâm gì?")
 *   limit  {number}  – số lượng hiển thị (default 8)
 */
export default function CategoryCards({ title = 'Bạn đang quan tâm gì?', limit = 8 }) {
  const [cats, setCats]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(r => setCats(parseItems(r)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const display = cats.slice(0, limit);

  return (
    <section className="cat-section">
      <h2 className="cat-section__title">{title}</h2>

      <div className="cat-grid">
        {loading
          ? Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 10 }} />
            ))
          : display.map((c, i) => (
              <Link
                key={c._id}
                to={`/the-loai/${c.slug}`}
                className={`cat-card cat-card--${i % 8}`}
                style={{ '--grad': COLORS[i % COLORS.length] }}
                aria-label={`Xem phim ${c.name}`}
              >
                <p className="cat-card__name">{c.name}</p>
                <p className="cat-card__sub">Xem chủ đề →</p>
              </Link>
            ))
        }
      </div>
    </section>
  );
}
