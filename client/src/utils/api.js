import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('byh_token');
      delete api.defaults.headers.common['Authorization'];
    }
    return Promise.reject(err);
  }
);

export default api;
