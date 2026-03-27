import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export interface LoginRequest {
  matricula: string;
  senha: string;
}

const api = axios.create({
  baseURL: process.env.API_BASE_URL || "http://localhost:8080",
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
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("userToken");
    }
    return Promise.reject(error);
  },
);

export default api;
