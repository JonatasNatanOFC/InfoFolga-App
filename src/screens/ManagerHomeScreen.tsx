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
      console.warn("Erro ao carregar dados iniciais:", error);
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 18,
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
