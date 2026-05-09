import { useEffect } from 'react';
import './AboutPage.css';
import { useLang } from '@/utils/lang';
import { getPageContent } from '@/utils/markdownLoader';
import MarkdownContent from '@/components/MarkdownContent/MarkdownContent';

export default function PolicyPage() {
  const { t, lang } = useLang();
  const mdContent = getPageContent('policy', lang);

  useEffect(() => {
    document.title = `${t.policy.title} - GienPhim`;
  }, [t.policy.title]);

  return (
    <div className="about-page">
      <div className="about-header">
        <h1 className="about-title">{t.policy.title}</h1>
        <p className="about-subtitle">{t.policy.subtitle}</p>
      </div>

      <div className="about-container">
        <MarkdownContent content={mdContent} />
      </div>
    </div>
  );
}
