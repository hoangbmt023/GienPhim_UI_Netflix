import { useEffect } from 'react';
import './AboutPage.css';
import { useLang } from '@/utils/lang';
import { getPageContent } from '@/utils/markdownLoader';
import FaqAccordion from '@/components/FaqAccordion/FaqAccordion';

export default function FaqPage() {
  const { t, lang } = useLang();
  const mdContent = getPageContent('faq', lang);

  useEffect(() => {
    document.title = `${t.faq.title} - GienPhim`;
  }, [t.faq.title]);

  return (
    <div className="about-page">
      <div className="about-header">
        <h1 className="about-title">{t.faq.title}</h1>
        <p className="about-subtitle">{t.faq.subtitle || t.supportLayout.faqSub || 'Giải đáp các thắc mắc thường gặp'}</p>
      </div>

      <div className="about-container">
        <FaqAccordion content={mdContent} />
      </div>
    </div>
  );
}
