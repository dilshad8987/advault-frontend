import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://advault-backend-production-c824.up.railway.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers['Authorization'] = 'Bearer ' + token;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers['Authorization'] = 'Bearer ' + token;
          return api(original);
        }).catch(err => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refresh = localStorage.getItem('refreshToken');
        const res = await axios.post(BASE_URL + '/auth/refresh', { refreshToken: refresh });
        const newToken = res.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
        original.headers['Authorization'] = 'Bearer ' + newToken;
        processQueue(null, newToken);
        return api(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
