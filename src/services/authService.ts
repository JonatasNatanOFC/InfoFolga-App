import api, { setAuthToken } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LoginRequest {
  cpf: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  nomeUsuario: string;
  role: "ROLE_GERENTE" | "ROLE_FUNCIONARIO";
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/api/auth/login", payload);
  return response.data;
}

export async function persistLogin(
  token: string,
  role: string,
  nomeUsuario: string,
) {
  await setAuthToken(token);
  await AsyncStorage.setItem("userRole", role);
  await AsyncStorage.setItem("userName", nomeUsuario);
}

export async function logout() {
  await setAuthToken(null);
}
