import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LoginRequest {
  matricula: string;
  senha: string;
}

const api = axios.create({
  baseURL: "http://192.168.0.135:8080", // 🔥 seu IP
  timeout: 5000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
