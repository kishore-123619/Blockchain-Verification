import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://blockchain-verification-x6sp.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("token-expired"));
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  studentRegister: (userData) => api.post("/auth/student-register", userData),
  adminSignup: (formData) => api.post("/auth/admin-signup", formData),
  login: (credentials) => api.post("/auth/login", credentials),
  adminLogin: (credentials) => api.post("/auth/admin-login", credentials),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
};

export const studentAPI = {
  getProfile: (id) => api.get(`/students/${id}`),
  getStudentById: (id) => api.get(`/students/${id}`),
  updateProfile: (id, data) => api.put(`/students/${id}`, data),
  generate2FA: () => api.get("/students/2fa/generate"),
  enable2FA: (token) => api.post("/students/2fa/enable", { token }),
  disable2FA: () => api.post("/students/2fa/disable"),
};

export const adminAPI = {
  getStudents: () => api.get("/students"),
  registerStudent: (data) => api.post("/students/register", data),
  bulkRegisterStudents: (formData) => api.post("/students/bulk", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  exportStudents: () => api.get("/students/export", { responseType: 'blob' }),
  issueCertificate: (data) => api.post("/admin/certificates", data),
  updateTransactionHash: (id, transactionHash) => api.put(`/admin/certificates/${id}/txhash`, { transactionHash }),
  getCertificates: () => api.get("/admin/certificates"),
  exportCertificates: () => api.get("/admin/certificates/export", { responseType: 'blob' }),
  getPendingAdmins: () => api.get("/students/pending-admins"),
  getStats: () => api.get("/students/stats"),
  approveAdmin: (id) => api.put(`/students/approve-admin/${id}`),
  rejectAdmin: (id) => api.delete(`/students/reject-admin/${id}`),
};

export const verifierAPI = {
  getCertificates: () => api.get("/verifier/certificates"),
  verifyCertificate: (id) => api.post(`/verifier/verify/${id}`),
};

export const certificateAPI = {
  getCertificate: (id) => api.get(`/certificates/${id}`),
  verifyHash: (hash) => api.post("/certificates/verify-hash", { hash }),
};

export default api;
