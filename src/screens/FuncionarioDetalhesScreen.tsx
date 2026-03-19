import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import AppHeader from "../components/AppHeader";
import { FuncionariosStackScreenProps } from "../navigation/types";

interface Funcionario {
  id: number;
  nome: string;
  matricula: string;
  cargo: string;
  setor: string;
  cpf: string | null;
  foto: string | null;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ativo: { label: "Ativo", color: "#28a745" },
  inativo: { label: "Inativo", color: "#6c757d" },
  ferias: { label: "De Ferias", color: "#17a2b8" },
};

function FuncionarioDetalhesScreen(props: FuncionariosStackScreenProps<"FuncionarioDetalhes">): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { funcionarioId } = props.route.params;
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Funcionario>("/api/gerencia/funcionarios/" + funcionarioId)
      .then((r) => setFuncionario(r.data))
      .catch(() => Alert.alert("Erro", "Nao foi possivel carregar os detalhes."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#007bff" /></View>
  );

  if (!funcionario) return (
    <View style={styles.center}><Text>Funcionario nao encontrado</Text></View>
  );

  const st = statusConfig[funcionario.status] ?? { label: funcionario.status, color: "#888" };

  return (
    <View style={styles.container}>
      <AppHeader
        subtitle="Detalhes do Funcionario"
        rightActions={
          <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ padding: 6, marginRight: 8 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {funcionario.foto
              ? <Image source={{ uri: funcionario.foto }} style={styles.avatar} />
              : <Ionicons name="person-circle-outline" size={90} color="#bbb" />
            }
          </View>
          <Text style={styles.nome}>{funcionario.nome}</Text>
          <View style={[styles.statusBadge, { backgroundColor: st.color + "22" }]}>
            <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          {[
            { icon: "id-card-outline", label: "Matricula", value: funcionario.matricula },
            { icon: "briefcase-outline", label: "Cargo", value: funcionario.cargo },
            { icon: "business-outline", label: "Setor", value: funcionario.setor ?? "Nao informado" },
            { icon: "finger-print-outline", label: "CPF", value: funcionario.cpf ? "***.***.***-" + funcionario.cpf.replace(/\D/g, "").slice(-2) : "Nao informado" },
          ].map((item, index, arr) => (
            <View key={item.label} style={[styles.infoRow, index < arr.length - 1 && styles.infoRowBorder]}>
              <View style={styles.infoIconContainer}>
                <Ionicons name={item.icon as any} size={20} color="#007bff" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: "#007bff", paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  profileCard: { backgroundColor: "#fff", borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 16, elevation: 1 },
  avatarContainer: { width: 90, height: 90, borderRadius: 45, overflow: "hidden", marginBottom: 12, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f2f5" },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  nome: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 13, fontWeight: "bold" },
  infoCard: { backgroundColor: "#fff", borderRadius: 16, padding: 8, elevation: 1 },
  infoRow: { flexDirection: "row", alignItems: "center", padding: 14 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f0f2f5" },
  infoIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#e8f0fe", justifyContent: "center", alignItems: "center", marginRight: 14 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: "#888", marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "bold", color: "#333" },
});

export default FuncionarioDetalhesScreen;
