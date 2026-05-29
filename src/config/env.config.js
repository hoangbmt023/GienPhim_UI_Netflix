const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  OPHIM_BASE_URL: import.meta.env.VITE_API_BASE || 'https://ophim1.com',
  OPHIM_CDN_IMAGE: import.meta.env.VITE_CDN_IMAGE || 'https://img.ophim.live/uploads/movies',
  APP_VERSION: import.meta.env.VITE_APP_VERSION,
  IS_PROD: import.meta.env.PROD,
};

export default ENV;
