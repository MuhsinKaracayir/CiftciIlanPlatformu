import axiosInstance from '../axiosInstance';

export const authService = {
  async register(userData) {
    const response = await axiosInstance.post('/api/v1/auth/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await axiosInstance.post('/api/v1/auth/login', credentials);
    return response.data;
  },

  async getMe() {
    const response = await axiosInstance.get('/api/v1/auth/me');
    return response.data;
  },
};

export default authService;

