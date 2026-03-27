import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export interface LoginRequest {
  matricula: string;
  senha: string;
}

const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === "android") {
      return process.env.EXPO_PUBLIC_API_URL; 
    }
    return process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";
  }
  return "https://api.infofolga.com.br";
};

const api = axios.create({
  baseURL: getBaseURL(),
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
