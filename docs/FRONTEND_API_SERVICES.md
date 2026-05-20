# 🔌 GienPhim Frontend - API Services Documentation

**Complete guide to all API service modules in GienPhim UI**

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Base API Configuration](#base-api-configuration)
3. [Authentication API](#authentication-api)
4. [User API](#user-api)
5. [Profile API](#profile-api)
6. [Movie API](#movie-api)
7. [Contact API](#contact-api)
8. [OPhim API](#ophim-api)
9. [Error Handling](#error-handling)
10. [Usage Examples](#usage-examples)

---

## Overview

The Frontend communicates with the Backend API through service modules located in `src/services/`. Each service module exports an object containing methods for specific API operations.

### Available Services

| Service | Purpose | File |
|---------|---------|------|
| **api** | Base Axios instance with interceptors | `api.js` |
| **authApi** | User authentication & password reset | `authApi.js` |
| **userApi** | User registration | `userApi.js` |
| **profileApi** | Profile management | `profileApi.js` |
| **movieApi** | Favorites & watch history | `movieApi.js` |
| **contactApi** | Support tickets | `contactApi.js` |
| **ophimApi** | External movie data | `ophimApi.js` |

---

## Base API Configuration

### File: `src/services/api.js`

**Purpose**: Configure Axios instance with automatic token handling and error management

### Features

- ✅ Auto-attach Authorization header with access token
- ✅ Auto-attach x-profile-token header when available
- ✅ Automatic token refresh on 401 responses
- ✅ Request queue for concurrent requests during token refresh
- ✅ CORS configuration
- ✅ Error handling

### Configuration

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Request Interceptor

Automatically adds tokens to every request:

```javascript
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  const profileToken = localStorage.getItem('profileToken');
  if (profileToken) {
    config.headers['x-profile-token'] = profileToken;
  }
  
  return config;
});
```

### Response Interceptor

Handles 401 responses and auto-refreshes tokens:

```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Auto-refresh token logic
      const newToken = await refreshAccessToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return api(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Environment Variables

```env
# Backend API URL
VITE_API_URL=http://localhost:8080

# Feature configuration
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
```

---

## Authentication API

### File: `src/services/authApi.js`

**Purpose**: Handle user authentication, token refresh, and password management

### Methods

#### 1. `login(data)`

Login with email and password

**Parameters:**
```javascript
{
  email: string,      // User email
  password: string    // User password
}
```

**Returns:** `Promise<AxiosResponse>`

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Example:**
```javascript
const response = await authApi.login({
  email: "user@example.com",
  password: "SecurePass123!"
});

const { accessToken, refreshToken } = response.data.data;
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

---

#### 2. `logout(refreshToken)`

Logout user and invalidate refresh token

**Parameters:**
```javascript
refreshToken: string  // User's refresh token from localStorage
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
const refreshToken = localStorage.getItem('refreshToken');
await authApi.logout(refreshToken);

localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
localStorage.removeItem('selectedProfile');
```

---

#### 3. `sendActivateOtp(email)`

Send OTP code to email for account activation

**Parameters:**
```javascript
email: string  // User email address
```

**Returns:** `Promise<AxiosResponse>`

**Response:**
```json
{
  "success": true,
  "message": "OTP kích hoạt đã được gửi đến email"
}
```

**Example:**
```javascript
await authApi.sendActivateOtp("user@example.com");
// User checks email for OTP code
```

---

#### 4. `activateAccount(email, otp)`

Verify OTP and activate account

**Parameters:**
```javascript
{
  email: string,  // User email
  otp: string     // OTP from email (6 digits)
}
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
await authApi.activateAccount(
  "user@example.com",
  "123456"  // OTP from email
);
```

---

#### 5. `forgotPassword(email)`

Request password reset by sending OTP

**Parameters:**
```javascript
email: string  // User email address
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
await authApi.forgotPassword("user@example.com");
// User receives OTP in email
```

---

#### 6. `verifyForgotPassword(email, otp)`

Verify OTP for password reset

**Parameters:**
```javascript
{
  email: string,  // User email
  otp: string     // OTP from email
}
```

**Returns:** `Promise<AxiosResponse>`

**Response:**
```json
{
  "success": true,
  "data": {
    "resetToken": "temp-reset-token-xyz"
  }
}
```

**Example:**
```javascript
const response = await authApi.verifyForgotPassword(
  "user@example.com",
  "123456"
);
```

---

#### 7. `resetPassword(data)`

Set new password using reset token

**Parameters:**
```javascript
{
  email: string,      // User email
  resetToken: string, // From verifyForgotPassword response
  newPassword: string // New password
}
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
await authApi.resetPassword({
  email: "user@example.com",
  resetToken: "temp-reset-token-xyz",
  newPassword: "NewSecurePass456!"
});
```

---

## User API

### File: `src/services/userApi.js`

**Purpose**: User registration and account management

### Methods

#### 1. `register(data)`

Create new user account

**Parameters:**
```javascript
{
  email: string,      // Valid email address
  password: string    // Min 6 characters
}
```

**Returns:** `Promise<AxiosResponse>`

**Response:**
```json
{
  "success": true,
  "message": "Tài khoản đã được đăng ký thành công."
}
```

**Example:**
```javascript
await userApi.register({
  email: "newuser@example.com",
  password: "SecurePass123!"
});

// After registration, user needs to:
// 1. Activate account with OTP
// 2. Login to get tokens
```

---

## Profile API

### File: `src/services/profileApi.js`

**Purpose**: Manage user profiles (sub-accounts)

### Methods

#### 1. `getProfiles()`

Get all profiles for authenticated user

**Returns:** `Promise<AxiosResponse>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "profile-uuid-1",
      "name": "Main Profile",
      "avatar": "https://cloudinary.com/avatar1.jpg",
      "hasPin": true,
      "createdAt": "2026-05-20T10:00:00Z"
    },
    {
      "id": "profile-uuid-2",
      "name": "Kid Profile",
      "avatar": "https://cloudinary.com/avatar2.jpg",
      "hasPin": false,
      "createdAt": "2026-05-20T11:00:00Z"
    }
  ]
}
```

**Example:**
```javascript
const response = await profileApi.getProfiles();
const profiles = response.data.data;

profiles.forEach(profile => {
  console.log(`${profile.name} - ${profile.id}`);
});
```

---

#### 2. `createProfile(data)`

Create new profile/sub-account

**Parameters:**
```javascript
{
  name: string,           // Profile name (required)
  avatar?: string,        // Avatar URL (optional)
  pin?: string           // 4-digit PIN (optional)
}
```

**Returns:** `Promise<AxiosResponse>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "profile-uuid-3",
    "name": "New Profile",
    "avatar": "https://cloudinary.com/avatar3.jpg",
    "hasPin": true
  }
}
```

**Example:**
```javascript
const newProfile = await profileApi.createProfile({
  name: "Kids Profile",
  pin: "1234",
  avatar: "https://example.com/avatar.jpg"
});

console.log("Created profile:", newProfile.data.data.id);
```

---

#### 3. `updateProfile(id, data)`

Modify existing profile

**Parameters:**
```javascript
id: string  // Profile ID

{
  name?: string,      // New name
  avatar?: string,    // New avatar URL
  pin?: string       // New PIN
}
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
await profileApi.updateProfile("profile-uuid-1", {
  name: "Updated Profile Name",
  pin: "5678"
});
```

---

#### 4. `deleteProfile(id, pin)`

Remove profile from account

**Parameters:**
```javascript
id: string    // Profile ID
pin?: string  // PIN (required if profile is PIN-protected)
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
// Without PIN
await profileApi.deleteProfile("profile-uuid-1");

// With PIN
await profileApi.deleteProfile("profile-uuid-1", "1234");
```

---

#### 5. `switchProfile(id, pin)`

Activate profile and get profile token

**Parameters:**
```javascript
id: string    // Profile ID
pin?: string  // PIN (required if profile is PIN-protected)
```

**Returns:** `Promise<AxiosResponse>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "profile-uuid-1",
    "name": "Main Profile",
    "avatar": "https://cloudinary.com/avatar1.jpg",
    "profileToken": "profile-jwt-token-123"
  }
}
```

**Example:**
```javascript
const response = await profileApi.switchProfile("profile-uuid-1", "1234");
const { profileToken } = response.data.data;

// Store profile token for future API calls
localStorage.setItem('profileToken', profileToken);
localStorage.setItem('selectedProfile', JSON.stringify({
  id: response.data.data.id,
  name: response.data.data.name
}));
```

---

#### 6. `resetPinWithPassword(id, password)`

Reset profile PIN using account password

**Parameters:**
```javascript
id: string        // Profile ID
password: string  // Account password
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
await profileApi.resetPinWithPassword(
  "profile-uuid-1",
  "AccountPassword123!"
);
```

---

## Movie API

### File: `src/services/movieApi.js`

**Purpose**: Manage favorites and watch history

### Methods

#### 1. `getFavorites(page, size)`

Get user's favorite movies

**Parameters:**
```javascript
page: number = 1,   // Page number (default: 1)
size: number = 20   // Items per page (default: 20)
```

**Returns:** `Promise<AxiosResponse>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "favorite-uuid-1",
      "slug": "avatar-1",
      "name": "Avatar",
      "thumb_url": "https://ophim-cdn.com/thumb.jpg",
      "poster_url": "https://ophim-cdn.com/poster.jpg",
      "createdAt": "2026-05-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

**Example:**
```javascript
const response = await movieApi.getFavorites(1, 20);
const favorites = response.data.data;
const totalPages = response.data.pagination.totalPages;

favorites.forEach(movie => {
  console.log(`${movie.name} (${movie.slug})`);
});
```

---

#### 2. `addFavorite(slug)`

Add movie to favorites

**Parameters:**
```javascript
slug: string  // Movie slug identifier
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
await movieApi.addFavorite("avatar-1");
console.log("Added to favorites");
```

---

#### 3. `checkFavorite(slug)`

Check if movie is in favorites

**Parameters:**
```javascript
slug: string  // Movie slug identifier
```

**Returns:** `Promise<AxiosResponse>`

**Response:**
```json
{
  "success": true,
  "data": {
    "isFavorite": true
  }
}
```

**Example:**
```javascript
const response = await movieApi.checkFavorite("avatar-1");
const isFavorite = response.data.data.isFavorite;

// Update heart icon state
setIsFavorited(isFavorite);
```

---

#### 4. `removeFavorite(favoriteId)`

Remove single movie from favorites

**Parameters:**
```javascript
favoriteId: string  // Favorite record ID
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
await movieApi.removeFavorite("favorite-uuid-1");
console.log("Removed from favorites");
```

---

#### 5. `removeFavorites(favoriteIds)`

Remove multiple movies from favorites

**Parameters:**
```javascript
favoriteIds: string[]  // Array of favorite IDs
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
const ids = ["favorite-uuid-1", "favorite-uuid-2", "favorite-uuid-3"];
await movieApi.removeFavorites(ids);
console.log("Removed multiple favorites");
```

---

#### 6. `getHistory(page, size)`

Get user's watch history

**Parameters:**
```javascript
page: number = 1,   // Page number
size: number = 20   // Items per page
```

**Returns:** `Promise<AxiosResponse>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "history-uuid-1",
      "slug": "avatar-1",
      "name": "Avatar",
      "thumb_url": "https://ophim-cdn.com/thumb.jpg",
      "episode": "5",
      "timePos": 3600,
      "updatedAt": "2026-05-20T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

**Example:**
```javascript
const response = await movieApi.getHistory(1, 20);
const watchedMovies = response.data.data;

watchedMovies.forEach(item => {
  console.log(`${item.name} - Episode ${item.episode}`);
  console.log(`Watched at: ${item.timePos} seconds`);
});
```

---

#### 7. `saveHistory(slug, episode, episodeSlug, server, timePos)`

Save or update movie watch progress

**Parameters:**
```javascript
slug: string,           // Movie slug (required)
episode: string,        // Episode name/number (optional)
episodeSlug: string,    // Episode slug (optional)
server: number,         // Server index 0, 1, 2... (optional)
timePos: number         // Time watched in seconds (optional)
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
// Save video progress when user is watching
await movieApi.saveHistory(
  "avatar-1",           // Movie slug
  "5",                  // Episode number
  "tap-5",              // Episode slug
  0,                    // Server index
  1800                  // 30 minutes watched
);
```

**Use Case - Auto-save Progress:**
```javascript
// In watch component, save every 30 seconds
const saveProgressInterval = setInterval(() => {
  movieApi.saveHistory(
    movieSlug,
    currentEpisode,
    currentEpisodeSlug,
    selectedServer,
    Math.floor(videoElement.currentTime)
  );
}, 30000); // Every 30 seconds

// Clear on unmount
return () => clearInterval(saveProgressInterval);
```

---

#### 8. `removeHistory(historyId)`

Delete single history item

**Parameters:**
```javascript
historyId: string  // History record ID
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
await movieApi.removeHistory("history-uuid-1");
```

---

#### 9. `removeHistories(historyIds)`

Delete multiple history items

**Parameters:**
```javascript
historyIds: string[]  // Array of history IDs
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
const ids = ["history-uuid-1", "history-uuid-2"];
await movieApi.removeHistories(ids);
```

---

#### 10. `clearAllHistory()`

Delete entire watch history

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
await movieApi.clearAllHistory();
console.log("All watch history cleared");
```

---

## Contact API

### File: `src/services/contactApi.js`

**Purpose**: Support ticket system

### Methods

#### 1. `createTicket(data)`

Submit new support ticket

**Parameters:**
```javascript
{
  name: string,     // Contact name
  email: string,    // Contact email
  subject: string,  // Issue subject
  message: string   // Detailed message
}
```

**Returns:** `Promise<AxiosResponse>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ticket-uuid-1",
    "status": "PENDING"
  }
}
```

**Example:**
```javascript
const response = await contactApi.createTicket({
  name: "John Doe",
  email: "john@example.com",
  subject: "Cannot watch movies",
  message: "I'm unable to play videos on my account"
});

console.log("Ticket created:", response.data.data.id);
```

---

#### 2. `getMyTickets(page, size)`

Get user's support tickets

**Parameters:**
```javascript
page: number = 1,
size: number = 20
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
const response = await contactApi.getMyTickets(1, 10);
const tickets = response.data.data;

tickets.forEach(ticket => {
  console.log(`[${ticket.status}] ${ticket.subject}`);
});
```

---

#### 3. `getTicketDetail(id)`

Get single ticket details (Admin)

**Parameters:**
```javascript
id: string  // Ticket ID
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
const response = await contactApi.getTicketDetail("ticket-uuid-1");
```

---

#### 4. `updateTicketStatus(id, status)`

Update ticket status (Admin)

**Parameters:**
```javascript
id: string,     // Ticket ID
status: string  // PENDING | REPLIED | RESOLVED | CLOSED
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
await contactApi.updateTicketStatus("ticket-uuid-1", "REPLIED");
```

---

#### 5. `replyToTicket(id, message)`

Reply to support ticket (Admin)

**Parameters:**
```javascript
id: string,      // Ticket ID
message: string  // Reply message
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
await contactApi.replyToTicket(
  "ticket-uuid-1",
  "Thank you for contacting us. We've resolved your issue."
);
```

---

## OPhim API

### File: `src/services/ophimApi.js`

**Purpose**: Fetch movie data from external OPhim API

### Methods

#### 1. `getMovieDetail(slug)`

Get detailed information about a movie

**Parameters:**
```javascript
slug: string  // Movie slug (e.g., "avatar-1")
```

**Returns:** `Promise<AxiosResponse>`

**Response:**
```json
{
  "data": {
    "item": {
      "name": "Avatar",
      "slug": "avatar-1",
      "content": "Movie description...",
      "type": "movie",
      "status": "completed",
      "episodes": [
        {
          "server_name": "VietSub HD",
          "server_data": [
            {
              "name": "1",
              "slug": "tap-1",
              "filename": "avatar-1-tap-1.m3u8"
            }
          ]
        }
      ],
      "poster_url": "https://ophim-cdn.com/poster.jpg",
      "thumb_url": "https://ophim-cdn.com/thumb.jpg"
    }
  }
}
```

**Example:**
```javascript
const response = await getMovieDetail("avatar-1");
const movieData = response.data.item;

console.log(`Title: ${movieData.name}`);
console.log(`Episodes: ${movieData.episodes.length}`);
```

---

#### 2. `searchMovies(query)`

Search for movies by keyword

**Parameters:**
```javascript
query: string  // Search keyword
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
const response = await searchMovies("Avatar");
const results = response.data.items;

results.forEach(movie => {
  console.log(`${movie.name} (${movie.slug})`);
});
```

---

#### 3. `getMoviesByGenre(slug)`

Get movies by genre/category

**Parameters:**
```javascript
slug: string  // Genre slug (e.g., "hanh-dong")
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
const response = await getMoviesByGenre("hanh-dong");
const actionMovies = response.data.items;
```

---

#### 4. `getMoviesByCountry(slug)`

Get movies by country

**Parameters:**
```javascript
slug: string  // Country code (e.g., "au-my")
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
const response = await getMoviesByCountry("au-my");
const usMovies = response.data.items;
```

---

#### 5. `getMoviesByYear(year)`

Get movies by release year

**Parameters:**
```javascript
year: number  // Year (e.g., 2023)
```

**Returns:** `Promise<AxiosResponse>`

**Example:**
```javascript
const response = await getMoviesByYear(2023);
const newMovies = response.data.items;
```

---

## Error Handling

### Error Response Format

```javascript
{
  success: false,
  message: "Error description",
  errors?: {
    fieldName: "Validation error message"
  }
}
```

### Handling Errors in Components

```javascript
try {
  const response = await movieApi.addFavorite(slug);
  console.log("Added to favorites");
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired or user not logged in
    redirectToLogin();
  } else if (error.response?.status === 409) {
    // Movie already in favorites
    showNotification("Already saved");
  } else if (error.response?.data?.errors) {
    // Validation errors
    Object.entries(error.response.data.errors).forEach(([field, msg]) => {
      showFieldError(field, msg);
    });
  } else {
    // Generic error
    showNotification(error.response?.data?.message || "Error occurred");
  }
}
```

### Common Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Proceed normally |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error - check field errors |
| 401 | Unauthorized | Token expired - refresh or re-login |
| 403 | Forbidden | Access denied - check permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Show generic error message |

---

## Usage Examples

### Complete Auth Flow

```javascript
// 1. Register
await userApi.register({
  email: "newuser@example.com",
  password: "SecurePass123!"
});

// 2. Activate
await authApi.sendActivateOtp("newuser@example.com");
// User checks email and gets OTP

await authApi.activateAccount(
  "newuser@example.com",
  "123456" // OTP from email
);

// 3. Login
const response = await authApi.login({
  email: "newuser@example.com",
  password: "SecurePass123!"
});

const { accessToken, refreshToken } = response.data.data;
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 4. Get and select profile
const profilesResponse = await profileApi.getProfiles();
const mainProfile = profilesResponse.data.data[0];

const switchResponse = await profileApi.switchProfile(mainProfile.id);
const { profileToken } = switchResponse.data.data;
localStorage.setItem('profileToken', profileToken);

// 5. Can now use movie API
await movieApi.addFavorite("avatar-1");
const favorites = await movieApi.getFavorites(1, 20);
```

### Movie Detail with History

```javascript
import { useState, useEffect } from 'react';
import { movieApi } from '@/services/movieApi';
import { getMovieDetail } from '@/services/ophimApi';

function MovieDetail({ slug }) {
  const [movieData, setMovieData] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadMovie = async () => {
      // Get movie details from OPhim
      const detailResponse = await getMovieDetail(slug);
      setMovieData(detailResponse.data.item);

      // Check if favorited
      const favResponse = await movieApi.checkFavorite(slug);
      setIsFavorite(favResponse.data.data.isFavorite);
    };

    loadMovie();
  }, [slug]);

  const handleAddFavorite = async () => {
    try {
      await movieApi.addFavorite(slug);
      setIsFavorite(true);
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  };

  const handleWatchProgress = async (episode, server, timePos) => {
    await movieApi.saveHistory(
      slug,
      episode.name,
      episode.slug,
      server,
      timePos
    );
  };

  return (
    <div>
      <h1>{movieData?.name}</h1>
      <button onClick={handleAddFavorite}>
        {isFavorite ? "❤️ Saved" : "♡ Save"}
      </button>
      {/* Video player with handleWatchProgress */}
    </div>
  );
}
```

### Search & Filter

```javascript
import { useState } from 'react';
import { searchMovies, getMoviesByGenre } from '@/services/ophimApi';

function Browse() {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("hanh-dong");

  const handleSearch = async (query) => {
    const response = await searchMovies(query);
    setSearchResults(response.data.items || []);
  };

  const handleGenreChange = async (genre) => {
    setSelectedGenre(genre);
    const response = await getMoviesByGenre(genre);
    setSearchResults(response.data.items || []);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search movies..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      
      <select value={selectedGenre} onChange={(e) => handleGenreChange(e.target.value)}>
        <option value="hanh-dong">Action</option>
        <option value="tinh-cam">Romance</option>
        {/* More genres */}
      </select>

      <div className="results">
        {searchResults.map(movie => (
          <div key={movie.slug}>
            <img src={movie.thumb_url} alt={movie.name} />
            <h3>{movie.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

**Last Updated**: May 2026  
**Version**: 1.0.0
