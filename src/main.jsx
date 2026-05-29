import { StrictMode } from 'react'
import ENV from './config/env.config';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

// Tối ưu hóa cho môi trường Production
if (ENV.IS_PROD) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
