import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENV } from "../config/env";

const PUBLIC_ROUTES = ["/api/auth/login"];

const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      config.url?.includes(route),
    );

    if (!isPublicRoute) {
      const token = await AsyncStorage.getItem("userToken");
      console.log(`[API REQUEST] Procurando token para: ${config.url}`);
      console.log(`[API REQUEST] Token encontrado: ${!!token}`);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(
          `[API REQUEST] ✅ Token adicionado ao header para ${config.url}`,
        );
      } else {
        console.warn(
          `[API REQUEST] ❌ AVISO: Token NÃO encontrado para rota ${config.url}`,
        );
      }
    }

    console.log(
      `[API REQUEST] ${config.method?.toUpperCase()} ${ENV.API_URL}${config.url}`,
    );

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    console.log(
      `[API RESPONSE] ✅ Status ${response.status} - ${response.config.url}`,
    );
    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    console.log(`[API RESPONSE] ❌ Erro ${status} - ${error?.config?.url}`);
    console.log(
      "[API ERROR]:",
      status,
      error?.response?.data ?? error?.message,
    );

    if (status === 401) {
      console.log("[API] 401 - Limpando token...");
      await AsyncStorage.removeItem("userToken");
      delete api.defaults.headers.common.Authorization;
    }

    return Promise.reject(error);
  },
);

export async function setAuthToken(token: string | null) {
  if (token) {
    await AsyncStorage.setItem("userToken", token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    await AsyncStorage.removeItem("userToken");
    delete api.defaults.headers.common.Authorization;
  }
}

export async function loadStoredToken() {
  const token = await AsyncStorage.getItem("userToken");

  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  return token;
}

export default api;
