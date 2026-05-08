import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownContent.css';

/**
 * A reusable component to render markdown content with Netflix/GienPhim styling.
 */
export default function MarkdownContent({ content }) {
  if (!content) return null;

  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
