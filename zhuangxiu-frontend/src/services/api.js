import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    console.error('API Error:', error);
    // 处理错误响应
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response;
      if (status === 401) {
        // 未授权，清除token并跳转到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // 返回错误信息
      return Promise.reject(data || { status: 'error', message: '请求失败' });
    } else if (error.request) {
      // 请求已发出但没有收到响应
      return Promise.reject({ status: 'error', message: '网络错误，请检查网络连接' });
    } else {
      // 其他错误
      return Promise.reject({ status: 'error', message: error.message || '请求失败' });
    }
  }
);

// API方法封装
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me')
};

export const projectAPI = {
  getAll: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`)
};

export const companyAPI = {
  getAll: () => api.get('/companies'),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`)
};

export const contractAPI = {
  getAll: () => api.get('/contracts'),
  create: (data) => api.post('/contracts', data),
  update: (id, data) => api.put(`/contracts/${id}`, data),
  delete: (id) => api.delete(`/contracts/${id}`),
  analyze: (id) => api.post(`/contracts/${id}/analyze`),
  audit: (id) => api.post(`/contracts/${id}/audit`)
};

export const designAPI = {
  getAll: () => api.get('/designs'),
  create: (data) => api.post('/designs', data),
  update: (id, data) => api.put(`/designs/${id}`, data),
  delete: (id) => api.delete(`/designs/${id}`),
  evaluate: (id) => api.post(`/designs/${id}/evaluate`)
};

export const constructionAPI = {
  getAll: () => api.get('/construction/constructions'),
  create: (data) => api.post('/construction/constructions', data),
  update: (id, data) => api.put(`/construction/constructions/${id}`, data),
  delete: (id) => api.delete(`/construction/constructions/${id}`),
  getCosts: () => api.get('/construction/costs'),
  createCost: (data) => api.post('/construction/costs', data),
  updateCost: (id, data) => api.put(`/construction/costs/${id}`, data),
  deleteCost: (id) => api.delete(`/construction/costs/${id}`)
};

export const acceptanceAPI = {
  getAll: () => api.get('/acceptance/acceptances'),
  create: (data) => api.post('/acceptance/acceptances', data),
  update: (id, data) => api.put(`/acceptance/acceptances/${id}`, data),
  delete: (id) => api.delete(`/acceptance/acceptances/${id}`)
};

export const noteAPI = {
  getAll: () => api.get('/notes'),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`)
};

export const materialAPI = {
  getAll: () => api.get('/materials'),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`)
};

export const budgetAPI = {
  generate: (data) => api.post('/budget/generate', data)
};

export const weatherAPI = {
  getAll: () => api.get('/weather/all'),
  getBeijing: () => api.get('/weather/beijing'),
  getLuoyang: () => api.get('/weather/luoyang')
};

// 文件上传API - 需要特殊处理multipart/form-data
export const uploadAPI = {
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteFile: (filename) => api.delete(`/upload/${filename}`)
};

export default api;