import { useEffect } from 'react';
import './AboutPage.css';
import { useLang } from '@/utils/lang';
import { getPageContent } from '@/utils/markdownLoader';
import MarkdownContent from '@/components/MarkdownContent/MarkdownContent';

export default function TermsPage() {
  const { t, lang } = useLang();
  const mdContent = getPageContent('terms', lang);

  useEffect(() => {
    document.title = `${t.terms.title} - GienPhim`;
  }, [t.terms.title]);

  return (
    <div className="about-page">
      <div className="about-header">
        <h1 className="about-title">{t.terms.title}</h1>
        <p className="about-subtitle">{t.terms.subtitle}</p>
      </div>

      <div className="about-container">
        <MarkdownContent content={mdContent} />
      </div>
    </div>
  );
}
