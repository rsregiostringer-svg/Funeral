import api from './api';

export const activityService = {
  async getActivityLogs(params = {}) {
    const response = await api.get('/activity/', { params });
    return response.data;
  },
};

export const dashboardService = {
  async getDashboardStats() {
    const response = await api.get('/dashboard/');
    return response.data;
  },
};

export const reportService = {
  async getReportOverview(params = {}) {
    const response = await api.get('/reports/', { params });
    return response.data;
  },

  async downloadReportCSV(params = {}) {
    const response = await api.get('/reports/', {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });
    
    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Alaala_Funeral_Cases_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
