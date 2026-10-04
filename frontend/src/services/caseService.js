import api from './api';

export const caseService = {
  async getCases(params = {}) {
    const response = await api.get('/cases/', { params });
    return response.data;
  },

  async getCase(id) {
    const response = await api.get(`/cases/${id}/`);
    return response.data;
  },

  async createCase(caseData) {
    const response = await api.post('/cases/', caseData);
    return response.data;
  },

  async updateCase(id, caseData) {
    const response = await api.patch(`/cases/${id}/`, caseData);
    return response.data;
  },

  async deleteCase(id) {
    const response = await api.delete(`/cases/${id}/`);
    return response.data;
  },

  async searchCases(query) {
    const response = await api.get('/cases/search/', { params: { q: query } });
    return response.data;
  },
};
