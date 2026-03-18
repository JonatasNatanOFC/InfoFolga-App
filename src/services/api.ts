import axios from "axios";

export interface LoginRequest {
  matricula: string;
  senha: string;
}

const api = axios.create({
  baseURL: "http://192.168.0.169:8080", // 🔥 seu IP
  timeout: 5000,
});

export default api;
