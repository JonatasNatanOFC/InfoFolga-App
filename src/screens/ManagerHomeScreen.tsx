import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DashboardStatCard from "../components/DashboardStatCard";
import AppHeader from "../components/AppHeader";
import QuickActionButton from "../components/QuickActionButton";
import api from "../services/api";
import { ManagerTabScreenProps } from "../navigation/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

interface DashboardStats {
  pendingRequests: number;
  totalEmployees: number;
  approvedLast30Days: number;
  rejectedLast30Days: number;
}

interface UserData {
  nome: string;
}

const ManagerHomeScreen: React.FC<ManagerTabScreenProps<"Inicio">> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userName, setUserName] = useState("A carregar...");

  const loadInitialData = async () => {
    try {
      const [statsResponse, userResponse] = await Promise.all([
        api.get<DashboardStats>("/api/gerencia/dashboard-stats"),
        api.get<UserData>("/api/usuarios/me"),
      ]);
      setStats(statsResponse.data);
      setUserName(userResponse.data.nome);
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do painel.");
      setStats({ pendingRequests: 0, totalEmployees: 0, approvedLast30Days: 0, rejectedLast30Days: 0 });
      setUserName("Gerente");
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: "Auth" }],
    });
  };

  if (!stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <AppHeader subtitle={userName + " • Gerente"} onLogout={handleLogout} />
      <ScrollView>
        <View style={styles.section}>
          <DashboardStatCard
            icon="hourglass-outline"
            label="Solicitações Pendentes"
            value={stats.pendingRequests}
            color="#ffc107"
          />
          <DashboardStatCard
            icon="people-outline"
            label="Total de Funcionários"
            value={stats.totalEmployees}
            color="#17a2b8"
          />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <DashboardStatCard
                compact
                icon="checkmark-circle-outline"
                label="Aprovadas (30d)"
                value={stats.approvedLast30Days}
                color="#28a745"
              />
            </View>
            <View style={{ flex: 1 }}>
              <DashboardStatCard
                compact
                icon="close-circle-outline"
                label="Rejeitadas (30d)"
                value={stats.rejectedLast30Days}
                color="#dc3545"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <QuickActionButton
            icon="clipboard-outline"
            label="Revisar Solicitações"
            onPress={() => navigation.navigate("Solicitacoes")}
            color="#ffc107"
          />
          <QuickActionButton
            icon="person-add-outline"
            label="Gerenciar Funcionários"
            onPress={() => navigation.jumpTo("Funcionarios", { screen: "FuncionariosList" })}
            color="#17a2b8"
          />
          <QuickActionButton
            icon="analytics-outline"
            label="Ver Relatórios"
            onPress={() => navigation.navigate("Relatorios")}
            color="#28a745"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  logoutButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 18,
  },
  welcomePanel: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
  },
  welcomeText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    marginTop: 10,
  },
});

export default ManagerHomeScreen;
