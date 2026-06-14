import axios from 'axios';

// Hardcoded — env variable inconsistencies se bachne ke liye
// Agar custom backend URL chahiye, yahan change karo
const BASE_URL = 'https://api.advault.in/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Device ID generate karo — ek baar localStorage mein save hota hai
// VPN on/off karne se yeh nahi badlega, reliable device identifier hai
function getDeviceId() {
  let id = localStorage.getItem('x-device-id');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('x-device-id', id);
  }
  return id;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers['Authorization'] = 'Bearer ' + token;
  // Har request ke saath device ID bhejo — server fingerprint mein use hoti hai
  config.headers['x-device-id'] = getDeviceId();
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
