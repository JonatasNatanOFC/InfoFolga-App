import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

import api from "../services/api";
import * as funcionarioService from "../services/funcionarioService";
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

type CpfCheckResult = "invalido" | "duplicado" | "ok" | null;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ativo: { label: "Ativo", color: "#28a745" },
  inativo: { label: "Inativo", color: "#6c757d" },
  ferias: { label: "De Férias", color: "#17a2b8" },
  folga: { label: "Folga", color: "#ffc107" },
};

const EDIT_FIELDS: FuncionarioField[] = [
  {
    key: "nome",
    label: "Nome",
    placeholder: "Nome completo",
    secure: false,
    required: true,
  },
  {
    key: "matricula",
    label: "Matrícula",
    placeholder: "Ex: 00123",
    secure: false,
    required: true,
  },
  {
    key: "cargo",
    label: "Cargo",
    placeholder: "Ex: Analista",
    secure: false,
    required: true,
  },
  {
    key: "setor",
    label: "Setor",
    placeholder: "Ex: TI",
    secure: false,
  },
  {
    key: "cpf",
    label: "CPF",
    placeholder: "000.000.000-00",
    secure: false,
  },
  {
    key: "senha",
    label: "Nova senha",
    placeholder: "Deixe vazio para não alterar",
    secure: true,
  },
];

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

function FuncionarioDetalhesScreen({
  route,
  navigation,
}: FuncionariosStackScreenProps<"FuncionarioDetalhes">): React.ReactElement {
  const { funcionarioId } = route.params;

  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState<FuncionarioForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleApiError = useCallback(
    (error: any, messages?: { forbidden?: string; generic?: string }) => {
      const status = error?.response?.status;

      if (status === 401) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      if (status === 403) {
        Alert.alert(
          "Erro",
          messages?.forbidden ??
            "Você não tem permissão para executar esta ação.",
        );
        return;
      }

      if (status === 409) {
        Alert.alert(
          "Erro",
          "Já existe um funcionário cadastrado com este CPF ou matrícula.",
        );
        return;
      }

      Alert.alert(
        "Erro",
        messages?.generic ?? "Não foi possível concluir a operação.",
      );
    },
    [],
  );

  const loadFuncionario = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get<Funcionario>(
        `/api/gerencia/funcionarios/${funcionarioId}`,
      );
      setFuncionario(response.data);
    } catch (error: any) {
      handleApiError(error, {
        forbidden: "Você não tem permissão para acessar este funcionário.",
        generic: "Não foi possível carregar os detalhes.",
      });
      setFuncionario(null);
    } finally {
      setLoading(false);
    }
  }, [funcionarioId, handleApiError]);

  useEffect(() => {
    loadFuncionario();
  }, [loadFuncionario]);

  const abrirEdicao = useCallback(() => {
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
  }, [funcionario]);

  const closeModal = useCallback(() => {
    setEditModalVisible(false);
    setEditForm(EMPTY_FORM);
  }, []);

  const checkCpf = useCallback(
    async (digits: string): Promise<CpfCheckResult> => {
      if (!validarCpf(digits)) return "invalido";

      if (funcionario?.cpf?.replace(/\D/g, "") === digits) {
        return "ok";
      }

      try {
        const { data } = await api.get(
          `/api/gerencia/cpf-buscar?cpf=${digits}`,
        );
        if (data && data.id !== funcionarioId) {
          return "duplicado";
        }
        return "ok";
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return "ok";
        }
        return null;
      }
    },
    [funcionario?.cpf, funcionarioId],
  );

  const validateEditForm = useCallback(async (): Promise<boolean> => {
    if (!editForm.nome || !editForm.matricula || !editForm.cargo) {
      Alert.alert("Erro", "Preencha os campos obrigatórios.");
      return false;
    }

    const cpfDigitos = editForm.cpf.replace(/\D/g, "");
    const cpfAtualDigitos = funcionario?.cpf?.replace(/\D/g, "") ?? "";

    if (cpfDigitos && !validarCpf(cpfDigitos)) {
      Alert.alert("Erro", "CPF inválido. Verifique os dígitos informados.");
      return false;
    }

    if (cpfDigitos && cpfDigitos !== cpfAtualDigitos) {
      try {
        const { data } = await api.get(
          `/api/gerencia/cpf-buscar?cpf=${cpfDigitos}`,
        );
        if (data && data.id !== funcionarioId) {
          Alert.alert(
            "Erro",
            "Já existe um funcionário cadastrado com este CPF.",
          );
          return false;
        }
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          console.warn(
            "[verificar-cpf] Erro inesperado:",
            error?.response?.status,
          );
        }
      }
    }

    return true;
  }, [editForm, funcionario?.cpf, funcionarioId]);

  const handleSalvarEdicao = useCallback(async () => {
    if (saving) return;

    const isValid = await validateEditForm();
    if (!isValid) return;

    const cpfDigitos = editForm.cpf.replace(/\D/g, "");

    setSaving(true);

    try {
      await funcionarioService.atualizarFuncionario(funcionarioId, {
        ...editForm,
        cpf: cpfDigitos || null,
      });

      closeModal();
      await loadFuncionario();
    } catch (error: any) {
      handleApiError(error, {
        forbidden: "Você não tem permissão para atualizar o funcionário.",
        generic: "Não foi possível atualizar o funcionário.",
      });
    } finally {
      setSaving(false);
    }
  }, [
    closeModal,
    editForm,
    funcionarioId,
    handleApiError,
    loadFuncionario,
    saving,
    validateEditForm,
  ]);

  const handleRemover = useCallback(() => {
    if (!funcionario) return;

    Alert.alert("Remover", `Deseja remover ${funcionario.nome}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await funcionarioService.removerFuncionario(funcionarioId);
            navigation.goBack();
          } catch (error: any) {
            handleApiError(error, {
              forbidden: "Você não tem permissão para remover o funcionário.",
              generic: "Não foi possível remover o funcionário.",
            });
          }
        },
      },
    ]);
  }, [funcionario, funcionarioId, handleApiError, navigation]);

  const pickImage = useCallback(() => {
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

          if (!result.canceled && result.assets[0]?.base64) {
            setEditForm((current) => ({
              ...current,
              foto: `data:image/jpeg;base64,${result.assets[0].base64}`,
            }));
          }
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

          if (!result.canceled && result.assets[0]?.base64) {
            setEditForm((current) => ({
              ...current,
              foto: `data:image/jpeg;base64,${result.assets[0].base64}`,
            }));
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  }, []);

  const statusInfo = useMemo(() => {
    if (!funcionario) {
      return { label: "Desconhecido", color: "#888" };
    }

    return (
      STATUS_CONFIG[funcionario.status] ?? {
        label: funcionario.status,
        color: "#888",
      }
    );
  }, [funcionario]);

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
        <Text style={styles.notFoundText}>Funcionário não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Detalhes do Funcionário" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusInfo.color}22` },
            ]}
          >
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoRow
            icon="briefcase-outline"
            label="Cargo"
            value={funcionario.cargo || "Não informado"}
            withBorder
          />
          <InfoRow
            icon="business-outline"
            label="Setor"
            value={funcionario.setor || "Não informado"}
            withBorder
          />
          <InfoRow
            icon="card-outline"
            label="Matrícula"
            value={funcionario.matricula || "Não informada"}
            withBorder
          />
          <InfoRow
            icon="document-text-outline"
            label="CPF"
            value={funcionario.cpf || "Não informado"}
          />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editBtn} onPress={abrirEdicao}>
            <Ionicons name="create-outline" size={18} color="#007bff" />
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
        title="Editar Funcionário"
        form={editForm}
        saving={saving}
        submitLabel="Salvar alterações"
        fields={EDIT_FIELDS}
        onClose={closeModal}
        onSubmit={handleSalvarEdicao}
        onChangeForm={setEditForm}
        onPickImage={pickImage}
        onCheckCpf={checkCpf}
      />
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  withBorder = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  withBorder?: boolean;
}) {
  return (
    <View style={[styles.infoRow, withBorder && styles.infoRowBorder]}>
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon} size={18} color="#007bff" />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  scrollContent: { padding: 20, paddingBottom: 28 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFoundText: { fontSize: 15, color: "#666" },
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
