import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LoginRequest {
  cpf: string;
  senha: string;
}

const getBaseURL = () => {
  if (__DEV__) {
    return process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.194:8080";
  }
  return "https://api.sisacesso.com.br";
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const fullUrl = `${config.baseURL ?? ""}${config.url ?? ""}`;

    console.log("URL:", fullUrl);
    console.log("TOKEN NA REQUISIÇÃO:", token);
    console.log("AUTH HEADER:", config.headers?.Authorization);

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("AXIOS ERROR STATUS:", error?.response?.status);
    console.log("AXIOS ERROR DATA:", error?.response?.data);
    console.log("AXIOS ERROR MESSAGE:", error?.message);

    const status = error?.response?.status;

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
