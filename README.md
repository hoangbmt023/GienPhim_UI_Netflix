# 🎬 GienPhim Frontend - Movie Streaming UI

**A modern, responsive React application with Netflix-like design and seamless integration with GienPhim backend API.**

---

## 🎯 Overview

GienPhim Frontend is a professional single-page application (SPA) built with **React 19**, **Vite**, and **React Router DOM v7**. It provides a complete movie streaming experience with user authentication, profile management, search, filtering, watch history, and favorites management.

**Key Features:**

- ✅ Responsive Netflix-style UI (Mobile, Tablet, Desktop, Smart TV)
- ✅ User authentication with JWT tokens
- ✅ Multi-profile support with PIN protection
- ✅ Advanced movie search & filtering
- ✅ Watch history with resume feature
- ✅ Favorites management
- ✅ Video player with multiple servers/quality
- ✅ Dark theme throughout
- ✅ Multilingual support (English, Vietnamese)
- ✅ Progressive Web App (PWA) ready

---

## 📋 Tech Stack

| Technology           | Version | Purpose                   |
| -------------------- | ------- | ------------------------- |
| **React**            | 19.2.5  | UI framework              |
| **Vite**             | 8.0.9   | Build tool & dev server   |
| **React Router DOM** | 7.14.2  | Client-side routing       |
| **Axios**            | 1.16.0  | HTTP client               |
| **React Markdown**   | 10.1.0  | Markdown rendering        |
| **Lucide React**     | 1.14.0  | Icon library              |
| **CSS3**             | -       | Styling (no dependencies) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- GienPhim Backend running (http://localhost:8080)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/GienPhim_UI_Netflix.git
cd GienPhim_UI_Netflix
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env` file in the root directory:

```env
# Backend API
VITE_API_URL=http://localhost:8080

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false

# Ophim API (for movie data)
VITE_OPHIM_API_URL=https://ophim.cc/api
```

### 4. Start Development Server

```bash
npm run dev
```

Open browser at `http://localhost:5173`

---

## 📦 Project Structure

```
src/
├── components/
│   ├── AnnouncementBar/          # Top announcement banner
│   ├── auth/                     # Login/Register forms
│   ├── CategoryCards/             # Category carousel
│   ├── ConfirmModal/              # Confirmation dialogs
│   ├── EpisodeList/               # Episode selection
│   ├── FaqAccordion/              # FAQ accordion
│   ├── footer/                    # Footer component
│   ├── FranchiseSection/          # Series/franchise display
│   ├── header/                    # Navigation header
│   ├── HeroBanner/                # Hero section
│   ├── ImageWithFallback/         # Image with fallback
│   ├── MainLayout/                # Main page layout
│   ├── MarkdownContent/           # Markdown renderer
│   ├── MiniPlayer/                # Floating video player
│   ├── MovieCard/                 # Movie card component
│   ├── MovieRow/                  # Horizontal movie row
│   ├── Pagination/                # Pagination controls
│   ├── PersistentPlayer/          # Video player
│   ├── SideLabelRow/              # Sidebar with label
│   ├── SpotlightSection/          # Featured content
│   └── StatusModal/               # Status notifications
├── contexts/
│   ├── AuthContext.jsx            # Auth state management
│   └── PiPContext.jsx             # Picture-in-Picture context
├── hooks/
│   ├── usePictureInPicture.js     # PiP hook
│   └── useWakeLock.js             # Screen wake lock
├── locales/
│   ├── en.js                      # English translations
│   └── vi.js                      # Vietnamese translations
├── pages/
│   ├── AboutPage/
│   ├── AuthPage/
│   ├── BrowsePage/
│   ├── HomePage/
│   ├── MovieDetailPage/
│   ├── MyListHistoryPage/
│   ├── SupportPage/
│   ├── FaqPage/
│   ├── PrivacyPage/
│   ├── TermsPage/
│   └── WatchPage/
├── routes/
│   └── AppRoutes.jsx              # Route definitions
├── services/
│   ├── api.js                     # Axios instance & interceptors
│   ├── authApi.js                 # Auth endpoints
│   ├── movieApi.js                # Movie endpoints
│   ├── userApi.js                 # User endpoints
│   ├── profileApi.js              # Profile endpoints
│   ├── contactApi.js              # Contact endpoints
│   └── ophimApi.js                # External OPhim API
├── utils/
│   └── lang.js                    # Language utilities
├── assets/                        # Images, icons
├── App.jsx                        # Root component
├── App.css                        # Global styles
├── index.css                      # Reset & variables
└── main.jsx                       # Entry point
```

---

## 🔐 Authentication Flow

### User Registration & Login

```
┌──────────────────┐
│ Registration     │ Fill email & password
│ Form             │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ POST /api/users/register         │
│ Backend validates & creates user │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Activation Page                  │
│ User receives OTP email          │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ POST /api/auth/activate-account  │
│ Enter OTP to activate            │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Login Page                       │
│ Email + Password                 │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ POST /api/auth/login             │
│ Get accessToken + refreshToken   │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Store tokens in localStorage:    │
│ • accessToken                    │
│ • refreshToken                   │
│ • selectedProfile                │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Redirect to Home/Profiles Page   │
└──────────────────────────────────┘
```

### Profile Selection & API Access

```
User has tokens but needs to select profile:
│
├─ GET /api/profiles (list all profiles)
└─ Shows profile selection screen

User selects profile:
│
├─ POST /api/profiles/{profileId}/switch
├─ Get profileToken
├─ Store profileToken in localStorage
└─ Can now access movie/favorite/history endpoints

API Request Flow:
│
├─ Include: Authorization: Bearer <accessToken>
├─ Include: x-profile-token: <profileToken>
├─ Backend validates both tokens
├─ If accessToken expired: auto refresh
└─ API returns movie/favorite/history data
```

---

## 📡 API Services

### Available Services

All API calls are handled through service files in `src/services/`:

#### authApi.js

```javascript
authApi.login(email, password);
authApi.logout(refreshToken);
authApi.sendActivateOtp(email);
authApi.activateAccount(email, otp);
authApi.forgotPassword(email);
authApi.verifyForgotPassword(email, otp);
authApi.resetPassword(email, token, password);
```

#### userApi.js

```javascript
userApi.register(email, password);
```

#### profileApi.js

```javascript
profileApi.getProfiles();
profileApi.createProfile(data);
profileApi.updateProfile(id, data);
profileApi.deleteProfile(id, pin);
profileApi.switchProfile(id, pin);
profileApi.resetPinWithPassword(id, password);
```

#### movieApi.js

```javascript
movieApi.getFavorites(page, size);
movieApi.addFavorite(slug);
movieApi.checkFavorite(slug);
movieApi.removeFavorite(favoriteId);
movieApi.removeFavorites(favoriteIds);

movieApi.getHistory(page, size);
movieApi.saveHistory(slug, episode, episodeSlug, server, timePos);
movieApi.removeHistory(historyId);
movieApi.removeHistories(historyIds);
movieApi.clearAllHistory();
```

#### contactApi.js

```javascript
contactApi.createTicket(data);
contactApi.getMyTickets(page, size);
contactApi.getAllTickets(page, size); // Admin
contactApi.getTicketDetail(id); // Admin
contactApi.updateTicketStatus(id, status); // Admin
contactApi.replyToTicket(id, message); // Admin
```

#### ophimApi.js (External API)

```javascript
getMovieDetail(slug);
searchMovies(query);
getMoviesByGenre(slug);
getMoviesByCountry(slug);
getMoviesByYear(year);
```

---

## 🎨 Styling

### Design System

**Color Scheme:**

- Primary: `#E50914` (Netflix Red)
- Dark Background: `#141414`
- Text: `#FFFFFF` (light), `#808080` (muted)
- Accent: `#221f1f` (hover states)

**Responsive Breakpoints:**

```css
/* Mobile */
@media (max-width: 768px) {
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
}

/* Desktop */
@media (min-width: 1025px) {
}

/* 4K/Smart TV */
@media (min-width: 1920px) {
}
```

**CSS Variables** (src/index.css)

```css
--primary-red: #e50914;
--dark-bg: #141414;
--text-light: #ffffff;
--text-muted: #808080;
--transition-smooth: all 0.3s ease;
```

---

## 🌐 Multilingual Support

### Supported Languages

- 🇬🇧 English (en)
- 🇻🇳 Vietnamese (vi)

### Usage

```javascript
import { getT, getPath } from "@/utils/lang";

const t = getT(); // Get translations for current language
const path = getPath("home"); // Get translated route path

// In JSX
<h1>{t.myList.history}</h1>;
```

### Adding Translations

Edit language files in `src/locales/`:

```javascript
// en.js
export const messages_en = {
  auth: {
    login: "Login",
    logout: "Logout",
    // ...
  },
  myList: {
    history: "Watch History",
    saved: "Saved",
    // ...
  },
};
```

---

## 🎬 Features Guide

### 1. Home Page

- Featured content carousel
- Movie recommendations
- Genre-based sections
- New releases
- Popular movies

### 2. Browse Page

**Filters:**

- By Genre
- By Country
- By Year
- By Type (movie/series)

**Search:**

- Live search with dropdown
- Auto-complete suggestions

### 3. Movie Detail Page

- Full movie information
- Cast & director
- Ratings & reviews
- Episode list (for series)
- Multiple servers/quality
- Related movies

### 4. Watch Page

**Video Player:**

- Play/Pause controls
- Progress bar with scrubbing
- Volume control
- Fullscreen toggle
- Speed control
- Quality selection
- Picture-in-Picture mode

**Features:**

- Episode selection
- Server switching
- Auto-play next episode
- Resume from last position
- Save to favorites
- See similar movies

### 5. My List/History Page

**Sections:**

- Watch History (continue watching)
- Saved/Favorites

**Actions:**

- Delete individual items
- Clear entire list
- Resume watching
- View details

### 6. Support Page

- FAQ section
- Contact form
- Response tracking
- Knowledge base

---

## 🔌 Integration with Backend

### Automatic Token Refresh

The API client (`src/services/api.js`) automatically:

1. Includes `accessToken` in every request header
2. Detects 401 responses (token expired)
3. Calls refresh-token endpoint
4. Retries original request with new token
5. Updates localStorage with new token

```javascript
// See src/services/api.js for full implementation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Auto refresh token
      const { data } = await axios.post(
        `${api.defaults.baseURL}/api/auth/refresh-token`,
        {
          refreshToken: localStorage.getItem("refreshToken"),
        },
      );

      localStorage.setItem("accessToken", data.data.accessToken);
      return api(originalRequest);
    }
    return Promise.reject(error);
  },
);
```

---

## 🧪 Testing

### Manual Testing

1. **Register:**
   - Fill email & password
   - Click submit
   - Check email for OTP
   - Enter OTP to activate

2. **Login:**
   - Enter registered email
   - Enter password
   - Verify tokens stored

3. **Create Profile:**
   - Click "Create Profile"
   - Enter profile name
   - Set PIN (optional)
   - Select avatar

4. **Watch Movie:**
   - Search movie
   - Click movie card
   - Select episode/server
   - Play video
   - Check resume feature

5. **Add to Favorites:**
   - Open movie detail
   - Click heart icon
   - Verify in "My List"

### Using Browser DevTools

```javascript
// Check stored tokens
localStorage.getItem("accessToken");
localStorage.getItem("refreshToken");
localStorage.getItem("selectedProfile");

// Check API calls (Network tab)
// Filter by: api/auth, api/movies, api/profiles

// Check console for errors
// Should have no CORS errors
```

---

## 🚀 Build & Deployment

### Build for Production

```bash
npm run build
```

Outputs optimized files to `dist/` folder

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Vercel auto-deploys from Git with these settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "https://your-backend.com",
    "VITE_OPHIM_API_URL": "https://ophim.cc/api"
  }
}
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Docker Deployment

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
```

---

## 📊 Performance Optimization

- ✅ **Code Splitting:** Lazy loading with React Router
- ✅ **Image Optimization:** ImageWithFallback component
- ✅ **Caching:** Axios response caching
- ✅ **Minification:** Vite auto-minifies builds
- ✅ **CSS Purging:** Unused CSS removed
- ✅ **Bundling:** Optimized chunk sizes

### Lighthouse Scores Target

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

---

## 🔒 Security

- ✅ HTTPS enforced in production
- ✅ Secure localStorage for tokens
- ✅ CSRF protection via same-origin
- ✅ Input validation on forms
- ✅ XSS prevention (React auto-escapes)
- ✅ CORS configured for backend
- ✅ Rate limiting respected (from backend)
- ✅ No sensitive data in logs

---

## 🐛 Troubleshooting

### API Connection Failed

**Error:** `Cannot reach API server`

**Solutions:**

```bash
# Check backend is running
curl http://localhost:8080/api

# Check VITE_API_URL in .env
echo $VITE_API_URL

# Verify CORS headers from backend
# Check browser console for CORS errors
```

### Tokens Not Working

**Error:** `401 Unauthorized`

**Solutions:**

```javascript
// Clear old tokens
localStorage.clear();

// Login again
// Check token format: Bearer <token>
// Verify token not expired

// Check Network tab for token in headers
```

### Video Player Issues

**Error:** `Cannot play video` or `Server error`

**Solutions:**

- Check server/quality selection
- Try different server
- Check if movie data loaded (Network tab)
- Clear browser cache
- Try incognito mode

### Mobile Responsiveness

**Issue:** UI broken on mobile

**Check:**

- Viewport meta tag in index.html
- CSS media queries for mobile
- Touch event handling
- Viewport width in DevTools

---

## 🎓 Learning Resources

### Documentation

- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router Docs](https://reactrouter.com)
- [Axios Docs](https://axios-http.com)

### Related Projects

- [Backend Repository](../GienPhim_Be_Netflix)
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [OPhim API](https://ophim.cc)

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push branch: `git push origin feature/feature-name`
5. Submit Pull Request

---

## 📜 License

This project is licensed under the ISC License - see LICENSE file for details.

---

## 👨‍💻 Author

**Hoang Bmt**

- GitHub: [@hoangbmt023](https://github.com/hoangbmt023)
- Email: hoangbmt023@gmail.com

---

## 🆘 Support

For issues and feature requests: [GitHub Issues](https://github.com/yourusername/GienPhim_UI_Netflix/issues)
