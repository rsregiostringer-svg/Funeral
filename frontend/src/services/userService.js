import api from './api';

export const userService = {
  async getUsers(params = {}) {
    const response = await api.get('/users/', { params });
    return response.data;
  },

  async getUser(id) {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  },

  async createUser(userData) {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  async updateUser(id, userData) {
    const response = await api.patch(`/users/${id}/`, userData);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}/`);
    return response.data;
  },

  async activateUser(id) {
    const response = await api.post(`/users/${id}/activate/`);
    return response.data;
  },

  async deactivateUser(id) {
    const response = await api.post(`/users/${id}/deactivate/`);
    return response.data;
  },

  async resetPassword(id, passwordData) {
    const response = await api.post(`/users/${id}/reset-password/`, passwordData);
    return response.data;
  },

  async getMonitoring() {
    const response = await api.get('/monitoring/');
    return response.data;
  },

  async getLoginHistory(params = {}) {
    const response = await api.get('/login-history/', { params });
    return response.data;
  },
};
