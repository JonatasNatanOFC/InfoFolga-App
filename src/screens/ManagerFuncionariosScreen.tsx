import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ListRenderItem,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";

import AppHeader from "../components/AppHeader";
import FuncionarioModal, {
  FuncionarioForm,
  FuncionarioField,
} from "../components/FuncionarioModal";
import api from "../services/api";
import * as funcionarioService from "../services/funcionarioService";
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

const ADD_FIELDS: FuncionarioField[] = [
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
    required: true,
  },
  {
    key: "cpf",
    label: "CPF",
    placeholder: "000.000.000-00",
    secure: false,
    required: true,
  },
  {
    key: "senha",
    label: "Senha",
    placeholder: "Senha inicial",
    secure: true,
    required: true,
  },
];

function ManagerFuncionariosScreen({
  navigation,
}: FuncionariosStackScreenProps<"FuncionariosList">): React.ReactElement {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<FuncionarioForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadFuncionarios = useCallback(async (pullToRefresh = false) => {
    if (pullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get<Funcionario[]>(
        "/api/gerencia/funcionarios",
      );
      console.log(
        "[DEBUG] Funcionários carregados do servidor:",
        response.data,
      );
      setFuncionarios(response.data);
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 401) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
      } else if (status === 403) {
        Alert.alert("Erro", "Sem permissão para acessar os funcionários.");
      } else {
        Alert.alert("Erro", "Não foi possível carregar os funcionários.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFuncionarios();
    }, [loadFuncionarios]),
  );

  const handleRefresh = useCallback(() => {
    loadFuncionarios(true);
  }, [loadFuncionarios]);

  const resetFormAndClose = useCallback(() => {
    setModalVisible(false);
    setForm(EMPTY_FORM);
  }, []);

  const abrirModalAdicionar = useCallback(() => {
    setForm(EMPTY_FORM);
    setModalVisible(true);
  }, []);

  const mascararCpf = useCallback((cpf: string | null) => {
    if (!cpf) return "***.***.***-**";

    const digits = cpf.replace(/\D/g, "");
    return "***.***.***-" + digits.slice(-2);
  }, []);

  const getStatusConfig = useCallback((status: string) => {
    return STATUS_CONFIG[status] ?? { label: status, color: "#888" };
  }, []);

  const pickImage = useCallback(async (onPick: (base64: string) => void) => {
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
            onPick(`data:image/jpeg;base64,${result.assets[0].base64}`);
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
            onPick(`data:image/jpeg;base64,${result.assets[0].base64}`);
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  }, []);

  const checkCpf = useCallback(
    async (digits: string): Promise<CpfCheckResult> => {
      if (!validarCpf(digits)) return "invalido";

      try {
        await api.get(`/api/gerencia/cpf-buscar?cpf=${digits}`);
        return "duplicado";
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return "ok";
        }
        return null;
      }
    },
    [],
  );

  const validateForm = useCallback(async (): Promise<boolean> => {
    if (
      !form.nome ||
      !form.matricula ||
      !form.cargo ||
      !form.setor ||
      !form.senha
    ) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return false;
    }

    const cpfDigitos = form.cpf?.replace(/\D/g, "") ?? "";

    if (!cpfDigitos) {
      Alert.alert("Erro", "O CPF é obrigatório.");
      return false;
    }

    if (!validarCpf(cpfDigitos)) {
      Alert.alert("Erro", "CPF inválido. Verifique os dígitos informados.");
      return false;
    }

    const cpfStatus = await checkCpf(cpfDigitos);

    if (cpfStatus === "invalido") {
      Alert.alert("Erro", "CPF inválido. Verifique os dígitos informados.");
      return false;
    }

    if (cpfStatus === "duplicado") {
      Alert.alert("Erro", "Já existe um funcionário cadastrado com este CPF.");
      return false;
    }

    if (cpfStatus === null) {
      Alert.alert(
        "Erro",
        "Não foi possível verificar o CPF. Verifique sua conexão e tente novamente.",
      );
      return false;
    }

    return true;
  }, [checkCpf, form]);

  const handleAdicionar = useCallback(async () => {
    if (saving) return;

    const isValid = await validateForm();
    if (!isValid) return;

    const cpfDigitos = form.cpf.replace(/\D/g, "");

    setSaving(true);

    try {
      await funcionarioService.criarFuncionario({
        ...form,
        cpf: cpfDigitos || null,
      });

      resetFormAndClose();
      await loadFuncionarios();
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 401) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
      } else if (status === 403) {
        Alert.alert(
          "Erro",
          "Você não tem permissão para adicionar funcionário.",
        );
      } else if (status === 409) {
        Alert.alert(
          "Erro",
          "Já existe um funcionário cadastrado com este CPF ou matrícula.",
        );
      } else {
        Alert.alert("Erro", "Não foi possível adicionar o funcionário.");
      }
    } finally {
      setSaving(false);
    }
  }, [form, loadFuncionarios, resetFormAndClose, saving, validateForm]);

  const data = useMemo(() => funcionarios, [funcionarios]);

  const renderItem: ListRenderItem<Funcionario> = useCallback(
    ({ item }) => {
      const statusInfo = getStatusConfig(item.status);

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.card}
          onPress={() =>
            navigation.navigate("FuncionarioDetalhes", {
              funcionarioId: item.id,
            })
          }
        >
          <View style={styles.avatarContainer}>
            {item.foto ? (
              <Image source={{ uri: item.foto }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person-outline" size={26} color="#999" />
            )}
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.nome}</Text>
            <Text style={styles.cardDetail}>{item.cargo}</Text>
            <Text style={styles.cardDetail}>Matrícula: {item.matricula}</Text>
            <Text style={styles.cardDetail}>CPF: {mascararCpf(item.cpf)}</Text>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusInfo.color}20` },
              ]}
            >
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>
      );
    },
    [getStatusConfig, mascararCpf, navigation],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        subtitle="Funcionários"
        rightActions={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={abrirModalAdicionar}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        }
      />

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={
          data.length === 0 ? styles.emptyContainer : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="people-outline" size={40} color="#bbb" />
            <Text style={styles.emptyText}>Nenhum funcionário encontrado</Text>
          </View>
        }
      />

      <FuncionarioModal
        visible={modalVisible}
        title="Adicionar Funcionário"
        form={form}
        saving={saving}
        submitLabel="Adicionar Funcionário"
        fields={ADD_FIELDS}
        onClose={resetFormAndClose}
        onSubmit={handleAdicionar}
        onChangeForm={setForm}
        onPickImage={() =>
          pickImage((b64) => setForm((current) => ({ ...current, foto: b64 })))
        }
        onCheckCpf={checkCpf}
      />
    </View>
  );
}

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
  headerActions: {
    flexDirection: "row",
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#28a745",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 15,
    marginTop: 12,
  },
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
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  cardDetail: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
  },
});

export default ManagerFuncionariosScreen;
