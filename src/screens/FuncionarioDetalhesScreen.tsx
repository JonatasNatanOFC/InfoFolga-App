import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "../services/api";
import AppHeader from "../components/AppHeader";
import FuncionarioModal, {
  FuncionarioForm,
  FuncionarioField,
} from "../components/FuncionarioModal";
import { validarCpf } from "../utils/cpf";
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
  folga: { label: "Folga", color: "#ffc107" },
};

const editFields: FuncionarioField[] = [
  { key: "nome", label: "Nome *", placeholder: "Nome completo", secure: false },
  {
    key: "matricula",
    label: "Matricula *",
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
    label: "Nova Senha",
    placeholder: "Deixe vazio para nao alterar",
    secure: true,
  },
];

function FuncionarioDetalhesScreen(
  props: FuncionariosStackScreenProps<"FuncionarioDetalhes">,
): React.ReactElement {
  const { funcionarioId } = props.route.params;

  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState<FuncionarioForm>({
    nome: "",
    matricula: "",
    cargo: "",
    setor: "",
    cpf: "",
    senha: "",
    foto: null,
    status: "ativo",
  });
  const [saving, setSaving] = useState(false);

  const loadFuncionario = () => {
    setLoading(true);

    api
      .get<Funcionario>("/api/gerencia/funcionarios/" + funcionarioId)
      .then((r) => setFuncionario(r.data))
      .catch((e) => {
        const status = e?.response?.status;

        if (status === 401) {
          Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        } else if (status === 403) {
          Alert.alert(
            "Erro",
            "Você não tem permissão para acessar este funcionário.",
          );
        } else {
          Alert.alert("Erro", "Nao foi possivel carregar os detalhes.");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFuncionario();
  }, []);

  const abrirEdicao = () => {
    if (!funcionario) return;

    setEditForm({
      nome: funcionario.nome,
      matricula: funcionario.matricula,
      cargo: funcionario.cargo,
      setor: funcionario.setor ?? "",
      cpf: funcionario.cpf ?? "",
      senha: "",
      foto: funcionario.foto,
      status: funcionario.status,
    });

    setEditModalVisible(true);
  };

  const checkCpf = async (
    digits: string,
  ): Promise<"invalido" | "duplicado" | "ok" | null> => {
  if (!validarCpf(digits)) return "invalido";

  if (funcionario?.cpf?.replace(/\D/g, "") === digits) return "ok";

  try {
    const { data } = await api.get(
      `/api/gerencia/cpf-buscar?cpf=${digits}`,
    );
    if (data && data.id !== funcionarioId) return "duplicado";
    return "ok";
  } catch (e: any) {
    if (e?.response?.status === 404) return "ok";
    return null;
  }
};

  const handleSalvarEdicao = async () => {
    if (!editForm.nome || !editForm.matricula || !editForm.cargo) {
      Alert.alert("Erro", "Preencha os campos obrigatorios.");
      return;
    }

    const cpfDigitos = editForm.cpf.replace(/\D/g, "");
    const cpfAtualDigitos = funcionario?.cpf?.replace(/\D/g, "") ?? "";

    // Valida CPF apenas se foi informado
    if (cpfDigitos && !validarCpf(cpfDigitos)) {
      Alert.alert("Erro", "CPF invalido. Verifique os digitos informados.");
      return;
    }

    if (cpfDigitos && cpfDigitos !== cpfAtualDigitos) {
  try {
    const { data } = await api.get(
      `/api/gerencia/cpf-buscar?cpf=${cpfDigitos}`,
    );
    if (data && data.id !== funcionarioId) {
      Alert.alert("Erro", "Ja existe um funcionario cadastrado com este CPF.");
      return;
    }
  } catch (e: any) {
    if (e?.response?.status !== 404) {
      console.warn("[verificar-cpf] Erro inesperado:", e?.response?.status);
    }
  }
} 

    setSaving(true);

    try {
      await api.put("/api/gerencia/funcionarios/" + funcionarioId, {
        ...editForm,
        cpf: cpfDigitos || null,
      });

      setEditModalVisible(false);
      loadFuncionario();
    } catch (e: any) {
      const status = e?.response?.status;

      if (status === 401) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
      } else if (status === 403) {
        Alert.alert(
          "Erro",
          "Você não tem permissão para atualizar o funcionário.",
        );
      } else if (status === 409) {
        Alert.alert("Erro", "Ja existe um funcionario cadastrado com este CPF ou matrícula.");
      } else {
        Alert.alert("Erro", "Nao foi possivel atualizar o funcionario.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemover = () => {
    if (!funcionario) return;

    Alert.alert("Remover", "Deseja remover " + funcionario.nome + "?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete("/api/gerencia/funcionarios/" + funcionarioId);
            props.navigation.goBack();
          } catch (e: any) {
            const status = e?.response?.status;

            if (status === 401) {
              Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
            } else if (status === 403) {
              Alert.alert(
                "Erro",
                "Você não tem permissão para remover o funcionário.",
              );
            } else {
              Alert.alert("Erro", "Nao foi possivel remover o funcionario.");
            }
          }
        },
      },
    ]);
  };

  const pickImage = () => {
    Alert.alert("Adicionar foto", "Escolha uma opcao", [
      {
        text: "Galeria",
        onPress: async () => {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (!permission.granted) {
            Alert.alert("Permissao negada", "Permita o acesso a galeria.");
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
          });

          if (!result.canceled && result.assets[0]) {
            setEditForm((f) => ({
              ...f,
              foto: "data:image/jpeg;base64," + result.assets[0].base64,
            }));
          }
        },
      },
      {
        text: "Camera",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();

          if (!permission.granted) {
            Alert.alert("Permissao negada", "Permita o acesso a camera.");
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
          });

          if (!result.canceled && result.assets[0]) {
            setEditForm((f) => ({
              ...f,
              foto: "data:image/jpeg;base64," + result.assets[0].base64,
            }));
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!funcionario) {
    return (
      <View style={styles.center}>
        <Text>Funcionario nao encontrado</Text>
      </View>
    );
  }

  const st = statusConfig[funcionario.status] ?? {
    label: funcionario.status,
    color: "#888",
  };

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Detalhes do Funcionario" />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {funcionario.foto ? (
              <Image source={{ uri: funcionario.foto }} style={styles.avatar} />
            ) : (
              <Ionicons name="person-circle-outline" size={90} color="#bbb" />
            )}
          </View>

          <Text style={styles.nome}>{funcionario.nome}</Text>

          <View
            style={[styles.statusBadge, { backgroundColor: st.color + "22" }]}
          >
            <Text style={[styles.statusText, { color: st.color }]}>
              {st.label}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          {[
            {
              icon: "id-card-outline",
              label: "Matricula",
              value: funcionario.matricula,
            },
            {
              icon: "briefcase-outline",
              label: "Cargo",
              value: funcionario.cargo,
            },
            {
              icon: "business-outline",
              label: "Setor",
              value: funcionario.setor ?? "Nao informado",
            },
            {
              icon: "finger-print-outline",
              label: "CPF",
              value: funcionario.cpf
                ? "***.***.***-" + funcionario.cpf.replace(/\D/g, "").slice(-2)
                : "Nao informado",
            },
          ].map((item, index, arr) => (
            <View
              key={item.label}
              style={[
                styles.infoRow,
                index < arr.length - 1 && styles.infoRowBorder,
              ]}
            >
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

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editBtn} onPress={abrirEdicao}>
            <Ionicons name="pencil-outline" size={18} color="#007bff" />
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.removeBtn} onPress={handleRemover}>
            <Ionicons name="trash-outline" size={18} color="#dc3545" />
            <Text style={styles.removeBtnText}>Remover</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FuncionarioModal
        visible={editModalVisible}
        title="Editar Funcionario"
        form={editForm}
        saving={saving}
        submitLabel="Salvar Alteracoes"
        fields={editFields}
        onClose={() => setEditModalVisible(false)}
        onSubmit={handleSalvarEdicao}
        onChangeForm={setEditForm}
        onPickImage={pickImage}
        onCheckCpf={checkCpf}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    elevation: 1,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  nome: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 13, fontWeight: "bold" },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 8,
    elevation: 1,
  },
  infoRow: { flexDirection: "row", alignItems: "center", padding: 14 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f0f2f5" },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e8f0fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: "#888", marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "bold", color: "#333" },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#007bff",
    elevation: 1,
  },
  editBtnText: { color: "#007bff", fontSize: 15, fontWeight: "bold" },
  removeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#dc3545",
    elevation: 1,
  },
  removeBtnText: { color: "#dc3545", fontSize: 15, fontWeight: "bold" },
});

export default FuncionarioDetalhesScreen;
