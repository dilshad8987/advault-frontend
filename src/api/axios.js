import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://advault-backend-production-fb35.up.railway.app/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refreshToken');
        const res = await axios.post((process.env.REACT_APP_API_URL || 'https://advault-backend-production-fb35.up.railway.app/api') + '/auth/refresh', { refreshToken: refresh });
        localStorage.setItem('accessToken', res.data.accessToken);
        original.headers.Authorization = 'Bearer ' + res.data.accessToken;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
