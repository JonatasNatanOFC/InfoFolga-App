import React, { useCallback, useState } from "react";
import {
  View,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import AppHeader from "../components/AppHeader";
import SolicitacaoCard from "../components/SolicitacaoCard";
import RejeitarSolicitacaoModal from "../components/RejeitarSolicitacaoModal";

import {
  listarSolicitacoesPorStatus,
  aprovarSolicitacao,
  rejeitarSolicitacao,
  Solicitacao,
} from "../services/gerenciaService";

type AbaStatus = "PENDENTE" | "APROVADA" | "REJEITADA";

const ManagerSolicitacoesScreen = () => {
  const [statusAtual, setStatusAtual] = useState<AbaStatus>("PENDENTE");
  const [data, setData] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejeitarId, setRejeitarId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listarSolicitacoesPorStatus(statusAtual);
      setData(response);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar solicitações.");
    } finally {
      setLoading(false);
    }
  }, [statusAtual]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function handleAprovar(id: number) {
    try {
      await aprovarSolicitacao(id);
      Alert.alert("Sucesso", "Solicitação aprovada.");
      carregar();
    } catch {
      Alert.alert("Erro", "Erro ao aprovar.");
    }
  }

  async function handleConfirmarRejeicao(motivo: string) {
    if (!rejeitarId) return;

    try {
      await rejeitarSolicitacao(rejeitarId, motivo);
      setRejeitarId(null);
      Alert.alert("Sucesso", "Solicitação rejeitada.");
      carregar();
    } catch {
      Alert.alert("Erro", "Erro ao rejeitar.");
    }
  }

  function renderTab(label: string, value: AbaStatus) {
    const ativo = statusAtual === value;

    return (
      <TouchableOpacity
        style={[styles.tabButton, ativo && styles.tabButtonActive]}
        onPress={() => setStatusAtual(value)}
      >
        <Text style={[styles.tabText, ativo && styles.tabTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Solicitações" />

      <View style={styles.tabs}>
        {renderTab("Pendentes", "PENDENTE")}
        {renderTab("Aprovadas", "APROVADA")}
        {renderTab("Rejeitadas", "REJEITADA")}
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#007bff" />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={data}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhuma solicitação encontrada.
            </Text>
          }
          renderItem={({ item }) => (
            <SolicitacaoCard
              item={item}
              mostrarAcoes={statusAtual === "PENDENTE"}
              onAprovar={() => handleAprovar(item.id)}
              onRejeitar={() => setRejeitarId(item.id)}
            />
          )}
        />
      )}

      <RejeitarSolicitacaoModal
        visible={rejeitarId !== null}
        onClose={() => setRejeitarId(null)}
        onConfirm={handleConfirmarRejeicao}
      />
    </View>
  );
};

export default ManagerSolicitacoesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#007bff",
  },
  tabText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
  },
  tabTextActive: {
    color: "#fff",
  },
  list: {
    padding: 20,
    paddingTop: 8,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 40,
    fontSize: 14,
  },
});
