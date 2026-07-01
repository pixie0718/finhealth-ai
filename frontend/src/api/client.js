import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fh_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => api.post("/api/auth/register", data);
export const login = (email, password) => {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  return api.post("/api/auth/login", form, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
};
export const getMe = () => api.get("/api/auth/me");

// Scores
export const generateScore = (data) => api.post("/api/score/generate", data);
export const getDemoScore = () => api.get("/api/score/demo");
export const getHistory = () => api.get("/api/score/history");
export const getScore = (id) => api.get(`/api/score/${id}`);
export const getTrend = (gstin) => api.get("/api/score/trend", { params: { gstin } });

// Chat
export const sendChat = (message, context = null) =>
  api.post("/api/chat", { message, context });

// Consent
export const getConsent = (consentId) => api.get(`/api/score/consent/${consentId}`);

// Loan outcomes
export const recordOutcome = (msmeId, data) => api.post(`/api/score/${msmeId}/outcome`, data);
export const getAllOutcomes = () => api.get("/api/score/outcomes/all");

// Loan applications
export const applyForLoan = (msmeId, data) => api.post(`/api/score/${msmeId}/apply`, data);
export const getApplications = () => api.get("/api/score/applications/all");
export const setApplicationStatus = (reference, status) =>
  api.patch(`/api/score/applications/${reference}/status`, { status });

// Peer benchmark
export const getBenchmark = (business_type, city) =>
  api.get("/api/score/benchmark", { params: { business_type, city } });

export default api;
