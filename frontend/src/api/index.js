import api from './axios';

// ─── AUTH ────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
};

// ─── PROFILE ─────────────────────────────────────────
export const profileApi = {
  get: () => api.get('/profile'),
  getById: (userId) => api.get(`/profile/public/${userId}`),
  update: (data) => api.put('/profile', data),
  updateName: (data) => api.put('/profile/name', data),
  uploadPicture: (formData) =>
    api.post('/profile/picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadResume: (formData) =>
    api.post('/profile/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  addExperience: (data) => api.post('/profile/experience', data),
  updateExperience: (expId, data) => api.put(`/profile/experience/${expId}`, data),
  deleteExperience: (expId) => api.delete(`/profile/experience/${expId}`),
  addEducation: (data) => api.post('/profile/education', data),
  updateEducation: (eduId, data) => api.put(`/profile/education/${eduId}`, data),
  deleteEducation: (eduId) => api.delete(`/profile/education/${eduId}`),
  updateSkills: (skills) => api.put('/profile/skills', { skills }),
};

// ─── JOBS ─────────────────────────────────────────────
export const jobsApi = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  apply: (id, formData) =>
    api.post(`/jobs/${id}/apply`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  toggleSave: (id) => api.post(`/jobs/${id}/save`),
  getSaved: () => api.get('/jobs/saved'),
  getMyApplications: (params) => api.get('/jobs/my-applications', { params }),
  getApplication: (id) => api.get(`/jobs/my-applications/${id}`),
  withdraw: (id) => api.delete(`/jobs/applications/${id}/withdraw`),
  getDashboard: () => api.get('/jobs/dashboard'),
};

// ─── RECRUITER ────────────────────────────────────────
export const recruiterApi = {
  getCompany: () => api.get('/recruiter/company'),
  updateCompany: (data) => api.put('/recruiter/company', data),
  uploadLogo: (formData) =>
    api.post('/recruiter/company/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyJobs: (params) => api.get('/recruiter/jobs', { params }),
  createJob: (data) => api.post('/recruiter/jobs', data),
  getJob: (id) => api.get(`/recruiter/jobs/${id}`),
  updateJob: (id, data) => api.put(`/recruiter/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/recruiter/jobs/${id}`),
  duplicateJob: (id) => api.post(`/recruiter/jobs/${id}/duplicate`),
  getApplicants: (jobId, params) => api.get(`/recruiter/jobs/${jobId}/applicants`, { params }),
  getApplicant: (appId) => api.get(`/recruiter/applications/${appId}`),
  updateStatus: (appId, data) => api.put(`/recruiter/applications/${appId}/status`, data),
  bulkUpdateStatus: (data) => api.put('/recruiter/applications/bulk-status', data),
  getDashboard: () => api.get('/recruiter/dashboard'),
};

// ─── ADMIN ────────────────────────────────────────────
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
  getCompanies: (params) => api.get('/admin/companies', { params }),
  verifyCompany: (id) => api.put(`/admin/companies/${id}/verify`),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  closeJob: (id) => api.put(`/admin/jobs/${id}/close`),
};

// ─── NOTIFICATIONS ────────────────────────────────────
export const notificationsApi = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};
