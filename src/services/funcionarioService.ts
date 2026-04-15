import api from "./api";

export interface Funcionario {
  id: number;
  nome: string;
  matricula: string;
  cargo: string;
  setor: string;
  cpf: string | null;
  foto: string | null;
  status: string;
  role: "ROLE_GERENTE" | "ROLE_FUNCIONARIO";
}

export interface FuncionarioPayload {
  nome: string;
  matricula: string;
  cargo: string;
  setor: string;
  cpf: string | null;
  senha: string;
  foto: string | null;
  status: string;
}

export async function listarFuncionarios() {
  const response = await api.get<Funcionario[]>("/api/gerencia/funcionarios");
  return response.data;
}

export async function buscarFuncionario(id: number) {
  const response = await api.get<Funcionario>(
    `/api/gerencia/funcionarios/${id}`,
  );
  return response.data;
}

export async function criarFuncionario(payload: FuncionarioPayload) {
  const response = await api.post("/api/gerencia/funcionarios", payload);
  return response.data;
}

export async function atualizarFuncionario(
  id: number,
  payload: FuncionarioPayload,
) {
  const response = await api.put(`/api/gerencia/funcionarios/${id}`, payload);
  return response.data;
}

export async function removerFuncionario(id: number) {
  await api.delete(`/api/gerencia/funcionarios/${id}`);
}

export async function buscarFuncionarioPorCpf(cpf: string) {
  const response = await api.get(`/api/gerencia/cpf-buscar?cpf=${cpf}`);
  return response.data;
}
