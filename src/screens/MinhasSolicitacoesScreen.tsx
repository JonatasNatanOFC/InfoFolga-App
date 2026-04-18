import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppHeader from "../components/AppHeader";
import {
  listarMinhasSolicitacoes,
  cancelarSolicitacao,
  Solicitacao,
} from "../services/solicitacaoService";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDENTE: { label: "Pendente", color: "#ffc107" },
  APROVADA: { label: "Aprovada", color: "#28a745" },
  REJEITADA: { label: "Rejeitada", color: "#dc3545" },
};

function formatarData(data: string) {
  if (!data) return "-";
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}

const MinhasSolicitacoesScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);

  const carregar = useCallback(async (pullToRefresh = false) => {
    if (pullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await listarMinhasSolicitacoes();
      setSolicitacoes(data);
    } catch (error: any) {
      const backMessage =
        error?.response?.data?.erro ||
        "Não foi possível carregar suas solicitações.";
      Alert.alert("Erro", backMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function handleCancelar(id: number) {
    Alert.alert("Cancelar solicitação", "Deseja cancelar esta solicitação?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelarSolicitacao(id);
            await carregar();
          } catch (error: any) {
            const backMessage =
              error?.response?.data?.erro ||
              "Não foi possível cancelar a solicitação.";
            Alert.alert("Erro", backMessage);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Minhas Solicitações" />

      <FlatList
        data={solicitacoes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        onRefresh={() => carregar(true)}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="clipboard-outline" size={38} color="#9aa3ad" />
            <Text style={styles.emptyText}>
              Nenhuma solicitação encontrada.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const st = STATUS_CONFIG[item.status] ?? {
            label: item.status,
            color: "#666",
          };

          return (
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.tipo}>
                  {item.tipo === "FERIAS" ? "Férias" : "Folga"}
                </Text>
                <View
                  style={[styles.badge, { backgroundColor: `${st.color}20` }]}
                >
                  <Text style={[styles.badgeText, { color: st.color }]}>
                    {st.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.periodo}>
                {formatarData(item.dataInicio)} até {formatarData(item.dataFim)}
              </Text>

              <Text style={styles.motivoLabel}>Motivo</Text>
              <Text style={styles.motivo}>
                {item.motivo?.trim() ? item.motivo : "Não informado"}
              </Text>

              {item.status === "PENDENTE" && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelar(item.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#dc3545" />
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

export default MinhasSolicitacoesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 12,
    color: "#7f8790",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tipo: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontWeight: "700",
    fontSize: 12,
  },
  periodo: {
    marginTop: 12,
    fontSize: 15,
    color: "#444",
  },
  motivoLabel: {
    marginTop: 14,
    fontSize: 13,
    color: "#777",
    fontWeight: "600",
  },
  motivo: {
    marginTop: 4,
    fontSize: 14,
    color: "#333",
  },
  cancelButton: {
    marginTop: 16,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#dc3545",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: "#dc3545",
    fontWeight: "700",
  },
});
