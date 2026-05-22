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
    ja: 'about/ABOUT_JA.md',
    ko: 'about/ABOUT_KO.md',
    zh: 'about/ABOUT_ZH.md',
  },
  faq: {
    vi: 'faq/FAQ_VI.md',
    en: 'faq/FAQ_EN.md',
    ja: 'faq/FAQ_JA.md',
    ko: 'faq/FAQ_KO.md',
    zh: 'faq/FAQ_ZH.md',
  },
  policy: {
    vi: 'privacy-policy/PRIVACY_POLICY_VI.md',
    en: 'privacy-policy/PRIVACY_POLICY_EN.md',
    ja: 'privacy-policy/PRIVACY_POLICY_JA.md',
    ko: 'privacy-policy/PRIVACY_POLICY_KO.md',
    zh: 'privacy-policy/PRIVACY_POLICY_ZH.md',
  },
  terms: {
    vi: 'terms-of-use/TERMS_OF_USE_VI.md',
    en: 'terms-of-use/TERMS_OF_USE_EN.md',
    ja: 'terms-of-use/TERMS_OF_USE_JA.md',
    ko: 'terms-of-use/TERMS_OF_USE_KO.md',
    zh: 'terms-of-use/TERMS_OF_USE_ZH.md',
  }
};

export const getPageContent = (pageKey, lang) => {
  const path = CONTENT_MAP[pageKey]?.[lang] || CONTENT_MAP[pageKey]?.['en'];
  if (!path) return '';
  return getMarkdownContent(path);
};
