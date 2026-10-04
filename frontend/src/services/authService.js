import api from './api';

export const authService = {
  async login(username, password) {
    const response = await api.post('/auth/login/', { username, password });
    return response.data;
  },

  async logout(refreshToken) {
    try {
      await api.post('/auth/logout/', { refresh: refreshToken });
    } finally {
      localStorage.removeItem('alaala_access_token');
      localStorage.removeItem('alaala_refresh_token');
      localStorage.removeItem('alaala_user');
    }
  },

  async getMe() {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  async sendHeartbeat(isIdle = false) {
    const response = await api.post('/auth/heartbeat/', { is_idle: isIdle });
    return response.data;
  },
};
