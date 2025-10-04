import axios from "axios";

// Interfaces para tipar os dados da API
// Request: O que enviamos para o backend
export interface LoginRequest {
  matricula: string;
  senha: string;
}

// Response: O que esperamos receber do backend
export interface LoginResponse {
  token: string;
  nomeUsuario: string;
}

const api = axios.create({
  // Lembre-se de usar o IP da sua máquina na rede local
  baseURL: "http://localhost:8081",
});

export default api;
