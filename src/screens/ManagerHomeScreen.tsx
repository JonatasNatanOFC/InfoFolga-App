// src/screens/ManagerHomeScreen.tsx
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
import { Ionicons } from "@expo/vector-icons";
import DashboardStatCard from "../components/DashboardStatCard";
import QuickActionButton from "../components/QuickActionButton";
import api from "../services/api";
import { ManagerTabScreenProps } from "../navigation/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DashboardStats {
  pendingRequests: number;
  totalEmployees: number;
  totalRequests: number;
}

interface UserData {
  nome: string;
}

const ManagerHomeScreen: React.FC<ManagerTabScreenProps<"Inicio">> = ({
  navigation,
}) => {
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
      setStats({ pendingRequests: 0, totalEmployees: 0, totalRequests: 0 });
      setUserName("Gerente");
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    // A melhor forma de navegar para o login a partir de um navegador aninhado
    navigation
      .getParent()
      ?.getParent()
      ?.reset({
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Controle de Folgas</Text>
          <Text style={styles.headerSubtitle}>{userName} • Gerente</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <View style={styles.welcomePanel}>
          <Text style={styles.welcomeTitle}>Painel Gerencial</Text>
          <Text style={styles.welcomeText}>Bem-vindo, {userName}</Text>
        </View>
      </View>
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
        <DashboardStatCard
          icon="calendar-outline"
          label="Total de Solicitações"
          value={stats.totalRequests}
          color="#28a745"
        />
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
          onPress={() => navigation.navigate("Funcionarios")}
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 14, color: "#666" },
  headerSubtitle: { fontSize: 18, fontWeight: "bold", color: "#111" },
  logoutButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: { color: "#fff", fontWeight: "bold" },
  section: { paddingHorizontal: 20, marginBottom: 10 },
  welcomePanel: { backgroundColor: "#007bff", borderRadius: 12, padding: 20 },
  welcomeTitle: { fontSize: 16, color: "#fff", opacity: 0.8 },
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
