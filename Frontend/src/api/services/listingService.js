import axiosInstance from '../axiosInstance';

export const listingService = {
  async getAll(params = {}) {
    const response = await axiosInstance.get('/api/v1/listings', { params });
    return response.data;
  },

  async getById(id) {
    const response = await axiosInstance.get(`/api/v1/listings/${id}`);
    return response.data;
  },

  async create(formData) {
    const response = await axiosInstance.post('/api/v1/listings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(id, formData) {
    const isFormData = formData instanceof FormData;
    const response = await axiosInstance.put(`/api/v1/listings/${id}`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  async changeStatus(id, status) {
    const response = await axiosInstance.patch(`/api/v1/listings/${id}/status`, { status });
    return response.data;
  },

  async delete(id) {
    const response = await axiosInstance.delete(`/api/v1/listings/${id}`);
    return response.data;
  },
};

export default listingService;

