import { useEffect } from 'react';
import './AboutPage.css';
import { useLang } from '@/utils/lang';
import { getPageContent } from '@/utils/markdownLoader';
import MarkdownContent from '@/components/MarkdownContent/MarkdownContent';

export default function AboutPage() {
  const { t, lang } = useLang();
  const mdContent = getPageContent('about', lang);

  useEffect(() => {
    document.title = `${t.about.title} - GienPhim`;
  }, [t.about.title]);

  return (
    <div className="about-page">
      <div className="about-header">
        <h1 className="about-title">{t.about.title}</h1>
        <p className="about-subtitle">{t.about.subtitle}</p>
      </div>

      <div className="about-container">
        <MarkdownContent content={mdContent} />
      </div>
    </div>
  );
}
