import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.0.194:8080";

// Rotas públicas que NÃO devem receber o token de autenticação
const PUBLIC_ROUTES = ["/api/auth/login", "/api/auth/register"];

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      config.url?.includes(route),
    );

    if (!isPublicRoute) {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    console.log(`[API] ${config.method?.toUpperCase()} ${BASE_URL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status !== 404) {
      console.log(`[API] ERRO ${status}:`, error?.response?.data ?? error?.message);
    }

    if (status === 401) {
      await AsyncStorage.removeItem("userToken");
      delete api.defaults.headers.common.Authorization;
    }

    return Promise.reject(error);
  },
);

export const setAuthToken = async (token: string | null) => {
  if (token) {
    await AsyncStorage.setItem("userToken", token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    await AsyncStorage.removeItem("userToken");
    delete api.defaults.headers.common.Authorization;
  }
};

export const loadStoredToken = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
  return token;
};

export default api;
