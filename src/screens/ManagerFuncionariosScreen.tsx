import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AppHeader from "../components/AppHeader";
import FuncionarioModal, {
  FuncionarioForm,
  FuncionarioField,
} from "../components/FuncionarioModal";
import { validarCpf } from "../utils/cpf";
import api from "../services/api";

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
  ferias: { label: "Férias", color: "#17a2b8" },
  folga: { label: "Folga", color: "#ffc107" },
};

const EMPTY_FORM: FuncionarioForm = {
  nome: "",
  matricula: "",
  cargo: "",
  setor: "",
  cpf: "",
  senha: "",
  foto: null,
  status: "ativo",
};

const addFields: FuncionarioField[] = [
  { key: "nome", label: "Nome *", placeholder: "Nome completo", secure: false },
  {
    key: "matricula",
    label: "Matrícula *",
    placeholder: "Ex: 00123",
    secure: false,
  },
  {
    key: "cargo",
    label: "Cargo *",
    placeholder: "Ex: Analista",
    secure: false,
  },
  { key: "setor", label: "Setor", placeholder: "Ex: TI", secure: false },
  { key: "cpf", label: "CPF", placeholder: "000.000.000-00", secure: false },
  {
    key: "senha",
    label: "Senha *",
    placeholder: "Senha inicial",
    secure: true,
  },
];

function ManagerFuncionariosScreen(props: any): React.ReactElement {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<FuncionarioForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadFuncionarios = async () => {
    setLoading(true);
    try {
      const response = await api.get<Funcionario[]>(
        "/api/gerencia/funcionarios",
      );

      // LOG DE TESTE ADICIONADO AQUI PARA INSPECIONAR A RESPOSTA DA API
      console.log(
        "DADOS RECEBIDOS DA API:",
        JSON.stringify(response.data, null, 2),
      );

      setFuncionarios(response.data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os funcionários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFuncionarios();
  }, []);

  const mascararCpf = (cpf: string | null) => {
    if (!cpf) return "***.***.***-**";
    const digits = cpf.replace(/\D/g, "");
    return "***.***.***-" + digits.slice(-2);
  };

  const pickImage = async (onPick: (base64: string) => void) => {
    Alert.alert("Adicionar foto", "Escolha uma opção", [
      {
        text: "Galeria",
        onPress: async () => {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert("Permissão negada", "Permita o acesso à galeria.");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
          });
          if (!result.canceled && result.assets[0])
            onPick("data:image/jpeg;base64," + result.assets[0].base64);
        },
      },
      {
        text: "Câmera",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert("Permissão negada", "Permita o acesso à câmera.");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
          });
          if (!result.canceled && result.assets[0])
            onPick("data:image/jpeg;base64," + result.assets[0].base64);
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const checkCpf = async (
    digits: string,
  ): Promise<"invalido" | "duplicado" | "ok" | null> => {
    if (!validarCpf(digits)) return "invalido";
    try {
      console.log("[checkCpf] Verificando CPF:", digits);
      const response = await api.get(
        `/api/gerencia/funcionarios/buscar-cpf/${digits}`,
      );
      console.log("[checkCpf] Resposta:", response.status, response.data);
      return "duplicado";
    } catch (e: any) {
      console.log("[checkCpf] Erro status:", e?.response?.status);
      console.log("[checkCpf] Erro message:", e?.message);
      console.log("[checkCpf] Erro completo:", JSON.stringify(e?.response));
      if (e?.response?.status === 404) return "ok";
      return null;
    }
  };

  const handleAdicionar = async () => {
    if (!form.nome || !form.matricula || !form.cargo || !form.senha) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }
    if (form.cpf && !validarCpf(form.cpf)) {
      Alert.alert("Erro", "CPF inválido. Verifique os dígitos informados.");
      return;
    }
    if (form.cpf) {
      try {
        await api.get(
          `/api/gerencia/funcionarios/buscar-cpf/${form.cpf.replace(/\D/g, "")}`,
        );
        Alert.alert(
          "Erro",
          "Já existe um funcionário cadastrado com este CPF.",
        );
        return;
      } catch (e: any) {
        if (e?.response?.status !== 404) {
          Alert.alert("Erro", "Não foi possível verificar o CPF.");
          return;
        }
      }
    }
    setSaving(true);
    try {
      await api.post("/api/gerencia/funcionarios", form);
      setModalVisible(false);
      setForm(EMPTY_FORM);
      loadFuncionarios();
    } catch {
      Alert.alert("Erro", "Não foi possível adicionar o funcionário.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        subtitle="Funcionários"
        rightActions={
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={loadFuncionarios}
              style={{ padding: 6, marginRight: 4 }}
            >
              <Ionicons name="refresh-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{
                backgroundColor: "rgba(255,255,255,0.25)",
                borderRadius: 20,
                paddingHorizontal: 10,
                padding: 6,
              }}
            >
              <Ionicons name="person-add-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : funcionarios.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum funcionário encontrado</Text>
        </View>
      ) : (
        <FlatList
          data={funcionarios}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const st = statusConfig[item.status] ?? {
              label: item.status,
              color: "#888",
            };
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  props.navigation.navigate("FuncionarioDetalhes", {
                    funcionarioId: item.id,
                  })
                }
                activeOpacity={0.75}
              >
                <View style={styles.avatarContainer}>
                  {item.foto ? (
                    <Image
                      source={{ uri: item.foto }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Ionicons
                      name="person-circle-outline"
                      size={52}
                      color="#bbb"
                    />
                  )}
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.nome}</Text>
                  <Text style={styles.cardDetail}>
                    CPF: {mascararCpf(item.cpf)}
                  </Text>
                  <Text style={styles.cardDetail}>
                    Matrícula: {item.matricula}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: st.color + "22" },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: st.color }]}>
                      {st.label}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color="#ccc"
                />
              </TouchableOpacity>
            );
          }}
        />
      )}

      <FuncionarioModal
        visible={modalVisible}
        title="Adicionar Funcionário"
        form={form}
        saving={saving}
        submitLabel="Adicionar Funcionário"
        fields={addFields}
        onClose={() => {
          setModalVisible(false);
          setForm(EMPTY_FORM);
        }}
        onSubmit={handleAdicionar}
        onChangeForm={setForm}
        onPickImage={() =>
          pickImage((b64) => setForm((f) => ({ ...f, foto: b64 })))
        }
        onCheckCpf={checkCpf}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#aaa", fontSize: 15, marginTop: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    elevation: 1,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0f2f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    overflow: "hidden",
  },
  avatarImage: { width: 56, height: 56, borderRadius: 28 },
  cardInfo: { flex: 1 },
  cardName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  cardDetail: { fontSize: 12, color: "#666", marginTop: 2 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  statusText: { fontSize: 11, fontWeight: "bold" },
});

export default ManagerFuncionariosScreen;
