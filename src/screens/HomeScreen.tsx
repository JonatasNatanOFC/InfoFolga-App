import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { EmployeeTabScreenProps } from "../navigation/types";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

interface MeuPerfil {
  nome: string;
  cargo: string;
  setor: string;
  matricula: string;
  status: string;
  foto: string | null;
}

interface MinhasStats {
  solicitacoesPendentes: number;
  solicitacoesAprovadas: number;
  solicitacoesRejeitadas: number;
  diasDeFolgaUsados: number;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  ativo: { label: "Ativo", color: "#28a745", icon: "checkmark-circle-outline" },
  inativo: {
    label: "Inativo",
    color: "#6c757d",
    icon: "remove-circle-outline",
  },
  ferias: { label: "De Férias", color: "#17a2b8", icon: "airplane-outline" },
  folga: { label: "De Folga", color: "#ffc107", icon: "sunny-outline" },
};

function getSaudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function primeiroNome(nome?: string): string {
  if (!nome || !nome.trim()) return "Funcionário";
  return nome.trim().split(" ")[0];
}

function montarUrlFoto(
  baseURL: string,
  foto: string | null | undefined,
): string | null {
  if (!foto) return null;

  const fotoTratada = foto.trim();
  if (!fotoTratada) return null;

  if (
    fotoTratada.startsWith("http://") ||
    fotoTratada.startsWith("https://") ||
    fotoTratada.startsWith("data:image")
  ) {
    return fotoTratada;
  }

  if (fotoTratada.startsWith("/")) {
    return `${baseURL}${fotoTratada}`;
  }

  return `${baseURL}/${fotoTratada}`;
}

const HomeScreen: React.FC<EmployeeTabScreenProps<"Home">> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { logout, nomeUsuario } = useAuth();

  const [perfil, setPerfil] = useState<MeuPerfil | null>(null);
  const [stats, setStats] = useState<MinhasStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fotoErro, setFotoErro] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    setFotoErro(false);

    try {
      const [perfilRes, statsRes] = await Promise.all([
        api.get<MeuPerfil>("/api/funcionarios/me"),
        api.get<MinhasStats>("/api/funcionarios/me/stats"),
      ]);

      setPerfil(perfilRes.data);
      setStats(statsRes.data);
    } catch (error: any) {
      console.log(
        "ERRO AO CARREGAR HOME:",
        error?.response?.data || error?.message,
      );

      Alert.alert(
        "Erro",
        "Não foi possível carregar os dados da home do funcionário.",
      );

      setStats({
        solicitacoesPendentes: 0,
        solicitacoesAprovadas: 0,
        solicitacoesRejeitadas: 0,
        diasDeFolgaUsados: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const nome = perfil?.nome?.trim() || nomeUsuario || "Funcionário";
  const cargo = perfil?.cargo?.trim() || "";
  const setor = perfil?.setor?.trim() || "";
  const status = perfil?.status?.toLowerCase?.() || "ativo";
  const stCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.ativo;
  const fotoUrl = montarUrlFoto(api.defaults.baseURL || "", perfil?.foto);
  const mostrarFoto = !!fotoUrl && !fotoErro;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={["#007bff", "#0056b3"]}
        style={[styles.hero, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.heroRow}>
          {mostrarFoto ? (
            <Image
              source={{ uri: fotoUrl }}
              style={styles.avatarImage}
              onError={() => setFotoErro(true)}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {nome.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.heroInfo}>
            <Text style={styles.saudacao}>{getSaudacao()},</Text>
            <Text style={styles.heroNome}>{primeiroNome(nome)}!</Text>

            {cargo || setor ? (
              <Text style={styles.heroCargo}>
                {cargo}
                {cargo && setor ? " • " : ""}
                {setor}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: `${stCfg.color}33`,
              borderColor: `${stCfg.color}88`,
            },
          ]}
        >
          <Ionicons name={stCfg.icon} size={14} color={stCfg.color} />
          <Text style={[styles.statusText, { color: stCfg.color }]}>
            {stCfg.label}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.sectionTitle}>Minhas Solicitações</Text>

        <View style={styles.statsGrid}>
          <StatBox
            value={stats?.solicitacoesPendentes ?? 0}
            label="Pendentes"
            color="#ffc107"
            icon="hourglass-outline"
          />
          <StatBox
            value={stats?.solicitacoesAprovadas ?? 0}
            label="Aprovadas"
            color="#28a745"
            icon="checkmark-circle-outline"
          />
          <StatBox
            value={stats?.solicitacoesRejeitadas ?? 0}
            label="Rejeitadas"
            color="#dc3545"
            icon="close-circle-outline"
          />
        </View>

        <View style={styles.diasCard}>
          <View style={[styles.diasIcon, { backgroundColor: "#17a2b820" }]}>
            <Ionicons name="calendar-outline" size={28} color="#17a2b8" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.diasValue}>
              {stats?.diasDeFolgaUsados ?? 0}
            </Text>
            <Text style={styles.diasLabel}>
              dias de folga usados no período
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ações Rápidas</Text>

        <ActionRow
          icon="add-circle-outline"
          label="Nova Solicitação"
          sublabel="Peça folga ou férias"
          color="#007bff"
          onPress={() => navigation.navigate("NovaSolicitacao")}
        />

        <ActionRow
          icon="list-outline"
          label="Minhas Solicitações"
          sublabel="Veja histórico e status"
          color="#6f42c1"
          onPress={() => navigation.navigate("MinhasSolicitacoes")}
        />

        <ActionRow
          icon="person-outline"
          label="Meu Perfil"
          sublabel="Visualize seus dados"
          color="#17a2b8"
          onPress={() =>
            Alert.alert("Em breve", "Tela de perfil em desenvolvimento.")
          }
        />
      </ScrollView>
    </View>
  );
};

function StatBox({
  value,
  label,
  color,
  icon,
}: {
  value: number;
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View
      style={[styles.statBox, { borderTopColor: color, borderTopWidth: 3 }]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={color}
        style={{ marginBottom: 6 }}
      />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionRow({
  icon,
  label,
  sublabel,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.actionRow}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionSub}>{sublabel}</Text>
      </View>

      <Ionicons name="chevron-forward-outline" size={18} color="#ccc" />
    </TouchableOpacity>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },

  hero: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  heroInfo: {
    flex: 1,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },

  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },

  saudacao: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
  },

  heroNome: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  heroCargo: {
    marginTop: 2,
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
  },

  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },

  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusText: {
    fontWeight: "600",
    fontSize: 12,
  },

  scroll: {
    padding: 18,
    paddingBottom: 28,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 14,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },

  statBox: {
    flexGrow: 1,
    minWidth: "30%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  statValue: {
    fontSize: 22,
    fontWeight: "bold",
  },

  statLabel: {
    marginTop: 4,
    color: "#666",
    fontSize: 12,
  },

  diasCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  diasIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  diasValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },

  diasLabel: {
    marginTop: 2,
    fontSize: 13,
    color: "#666",
  },

  actionRow: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  actionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },

  actionSub: {
    marginTop: 2,
    fontSize: 12,
    color: "#777",
  },
});
