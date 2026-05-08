import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './FaqAccordion.css';

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function FaqAccordion({ content }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!content) return null;

  const sections = content.split(/(?=##\s+\d+\.)/g).filter(s => s.trim().startsWith('##'));
  
  const items = sections.map(section => {
    const lines = section.split('\n');
    const question = lines[0].replace(/##\s+\d+\.\s*/, '').trim();
    const answer = lines.slice(1).join('\n').trim();
    return { question, answer };
  });

  return (
    <div className="faq-accordion">
      {items.map((item, idx) => (
        <div key={idx} className={`faq-item ${openIndex === idx ? 'open' : ''}`}>
          <button className="faq-question" onClick={() => setOpenIndex(openIndex === idx ? null : idx)}>
            <span>{item.question}</span>
            <ChevronIcon />
          </button>
          <div className="faq-answer">
            <div className="faq-answer-inner markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.answer}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
