import axios from "axios";
import ENV from "../config/env.config";

const api = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Auto-send HttpOnly cookies
});

// In-memory token storage
let inMemoryAccessToken = null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => {
  return inMemoryAccessToken;
};

// Interceptor cho Request: Thêm Access Token từ memory
api.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Trạng thái refresh token để tránh gọi nhiều lần cùng lúc
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor cho Response: Xử lý 401 và Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi là 401, không phải request login/refresh và chưa thử refresh
    if (error.response?.status === 401 && 
        !originalRequest.url.includes('/api/auth/login') && 
        !originalRequest.url.includes('/api/auth/refresh-token') &&
        !originalRequest.url.includes('/switch') &&
        !originalRequest._retry) {
      
      if (isRefreshing) {
        // Đang refresh, cho các request khác vào hàng đợi
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh token. 
        // Cookie chứa refreshToken sẽ tự động được gửi đi nhờ withCredentials: true.
        const { data } = await axios.post(`${api.defaults.baseURL}/api/auth/refresh-token`, {}, {
          withCredentials: true 
        });

        if (data.success && data.data?.accessToken) {
          const newAccessToken = data.data.accessToken;
          setAccessToken(newAccessToken);

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return api(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        localStorage.removeItem('selectedProfile');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
