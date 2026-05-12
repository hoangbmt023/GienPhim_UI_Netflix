import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';
import { getPath, useLang } from '@/utils/lang';

export default function NotFoundPage() {
  const { t } = useLang();

  useEffect(() => {
    document.title = `${t.notFound.title} - ${t.notFound.subtitle} - GienPhim`;
  }, [t.notFound]);

  return (
    <div className="not-found-page">
      <div className="nf-content">
        <h1 className="nf-title">{t.notFound.title}</h1>
        <h2 className="nf-subtitle">{t.notFound.subtitle}</h2>
        <p className="nf-desc">{t.notFound.desc}</p>
        <div className="nf-actions">
          <Link to={getPath('home')} className="nf-btn nf-btn--primary">
            {t.notFound.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}