import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003';

const API = axios.create({
  baseURL: `${API_URL}/products`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getInventoryStats = () => API.get('/stats');
export const getAllProducts = (params) => API.get('/', { params });
export const getProductById = (id) => API.get(`/${id}`);
export const createProduct = (data) => API.post('/', data);
export const updateProduct = (id, data) => API.put(`/${id}`, data);
export const deleteProduct = (id) => API.delete(`/${id}`);

export default API;
