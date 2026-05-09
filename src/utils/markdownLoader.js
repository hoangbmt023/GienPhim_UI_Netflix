/**
 * Markdown Loader Utility
 * Uses Vite's import.meta.glob to load all .md files from the content directory.
 */

// Import all .md files in the content directory recursively as raw strings
const markdownFiles = import.meta.glob('../../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/**
 * Normalizes a path to match the keys in markdownFiles.
 * Example: 'faq/FAQ_VI.md' -> '../../content/faq/FAQ_VI.md'
 */
export const getMarkdownContent = (path) => {
  const fullPath = `../../content/${path}`;
  return markdownFiles[fullPath] || '';
};

/**
 * Maps a page key and language to a specific file path.
 */
const CONTENT_MAP = {
  about: {
    vi: 'about/ABOUT_VI.md',
    en: 'about/ABOUT_EN.md',
  },
  faq: {
    vi: 'faq/FAQ_VI.md',
    en: 'faq/FAQ_EN.md',
  },
  policy: {
    vi: 'privacy-policy/PRIVACY_POLICY_VI.md',
    en: 'privacy-policy/PRIVACY_POLICY_EN.md',
  },
  terms: {
    vi: 'terms-of-use/TERMS_OF_USE_VI.md',
    en: 'terms-of-use/TERMS_OF_USE_EN.md',
  }
};

export const getPageContent = (pageKey, lang) => {
  const path = CONTENT_MAP[pageKey]?.[lang];
  if (!path) return '';
  return getMarkdownContent(path);
};
