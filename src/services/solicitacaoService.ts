import api from "./api";

export type TipoSolicitacao = "FOLGA" | "FERIAS";
export type StatusSolicitacao = "PENDENTE" | "APROVADA" | "REJEITADA";

export interface CriarSolicitacaoPayload {
  tipo: TipoSolicitacao;
  dataInicio: string;
  dataFim: string;
  motivo: string;
}

export interface Solicitacao {
  id: number;
  funcionarioId: number;
  funcionarioNome: string;
  funcionarioFoto: string | null;
  tipo: TipoSolicitacao;
  status: StatusSolicitacao;
  dataInicio: string;
  dataFim: string;
  motivo: string;
  criadoEm: string;
}

export async function criarSolicitacao(payload: CriarSolicitacaoPayload) {
  const response = await api.post<Solicitacao>(
    "/api/funcionarios/solicitacoes",
    payload,
  );
  return response.data;
}

export async function listarMinhasSolicitacoes() {
  const response = await api.get<Solicitacao[]>(
    "/api/funcionarios/solicitacoes",
  );
  return response.data;
}

export async function cancelarSolicitacao(id: number) {
  await api.delete(`/api/funcionarios/solicitacoes/${id}`);
}
