import api from "./api";

export interface Solicitacao {
  id: number;
  funcionarioId: number;
  funcionarioNome: string;
  funcionarioFoto: string | null;
  funcionarioSetor: string | null;
  funcionarioCargo: string | null;
  tipo: "FOLGA" | "FERIAS";
  status: "PENDENTE" | "APROVADA" | "REJEITADA";
  dataInicio: string;
  dataFim: string;
  motivo: string;
  motivoResposta: string | null;
  criadoEm: string;
}

export async function listarSolicitacoesPorStatus(
  status: "PENDENTE" | "APROVADA" | "REJEITADA",
) {
  const response = await api.get<Solicitacao[]>(
    `/api/gerencia/solicitacoes/status?status=${status}`,
  );
  return response.data;
}

export async function aprovarSolicitacao(id: number) {
  const response = await api.put(`/api/gerencia/solicitacoes/${id}/aprovar`);
  return response.data;
}

export async function rejeitarSolicitacao(id: number, motivo: string) {
  const response = await api.put(`/api/gerencia/solicitacoes/${id}/rejeitar`, {
    motivo,
  });
  return response.data;
}
