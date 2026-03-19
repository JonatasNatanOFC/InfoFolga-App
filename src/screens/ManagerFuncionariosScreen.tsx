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
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AppHeader from "../components/AppHeader";
import api from "../services/api";
import { ManagerTabScreenProps } from "../navigation/types";

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

interface FuncionarioForm {
  nome: string;
  matricula: string;
  cargo: string;
  setor: string;
  cpf: string;
  senha: string;
  foto: string | null;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ativo: { label: "Ativo", color: "#28a745" },
  inativo: { label: "Inativo", color: "#6c757d" },
  ferias: { label: "Ferias", color: "#17a2b8" },
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

function ManagerFuncionariosScreen(props: any): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<FuncionarioForm>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<FuncionarioForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadFuncionarios = async () => {
    setLoading(true);
    try {
      const response = await api.get<Funcionario[]>(
        "/api/gerencia/funcionarios",
      );
      setFuncionarios(response.data);
    } catch {
      Alert.alert("Erro", "Nao foi possivel carregar os funcionarios.");
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
          if (!result.canceled && result.assets[0])
            onPick("data:image/jpeg;base64," + result.assets[0].base64);
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
          if (!result.canceled && result.assets[0])
            onPick("data:image/jpeg;base64," + result.assets[0].base64);
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleAdicionar = async () => {
    if (!form.nome || !form.matricula || !form.cargo || !form.senha) {
      Alert.alert("Erro", "Preencha todos os campos obrigatorios.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/api/gerencia/funcionarios", form);
      setModalVisible(false);
      setForm(EMPTY_FORM);
      loadFuncionarios();
    } catch {
      Alert.alert("Erro", "Nao foi possivel adicionar o funcionario.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditar = (item: Funcionario) => {
    setSelectedId(item.id);
    setEditForm({
      nome: item.nome,
      matricula: item.matricula,
      cargo: item.cargo,
      setor: item.setor ?? "",
      cpf: item.cpf ?? "",
      senha: "",
      foto: item.foto,
      status: item.status,
    });
    setEditModalVisible(true);
  };

  const handleSalvarEdicao = async () => {
    if (!editForm.nome || !editForm.matricula || !editForm.cargo) {
      Alert.alert("Erro", "Preencha os campos obrigatorios.");
      return;
    }
    setSaving(true);
    try {
      await api.put("/api/gerencia/funcionarios/" + selectedId, editForm);
      setEditModalVisible(false);
      loadFuncionarios();
    } catch {
      Alert.alert("Erro", "Nao foi possivel atualizar o funcionario.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemover = (item: Funcionario) => {
    Alert.alert("Remover", "Deseja remover " + item.nome + "?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete("/api/gerencia/funcionarios/" + item.id);
            loadFuncionarios();
          } catch {
            Alert.alert("Erro", "Nao foi possivel remover.");
          }
        },
      },
    ]);
  };

  const addFields = [
    {
      key: "nome",
      label: "Nome *",
      placeholder: "Nome completo",
      secure: false,
    },
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
      label: "Senha *",
      placeholder: "Senha inicial",
      secure: true,
    },
  ];

  const editFields = [
    {
      key: "nome",
      label: "Nome *",
      placeholder: "Nome completo",
      secure: false,
    },
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

  const renderFormModal = (
    visible: boolean,
    title: string,
    formData: FuncionarioForm,
    setFormData: (f: FuncionarioForm) => void,
    fields: typeof addFields,
    onSave: () => void,
    onClose: () => void,
    showStatus: boolean,
  ) => (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity
                style={styles.photoPicker}
                onPress={() =>
                  pickImage((b64) => setFormData({ ...formData, foto: b64 }))
                }
              >
                {formData.foto ? (
                  <Image
                    source={{ uri: formData.foto }}
                    style={styles.photoPreview}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera-outline" size={32} color="#007bff" />
                    <Text style={styles.photoPlaceholderText}>
                      Adicionar foto
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {showStatus && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Status</Text>
                  <View style={styles.statusRow}>
                    {Object.entries(statusConfig).map(([key, val]) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.statusOption,
                          formData.status === key && {
                            backgroundColor: val.color,
                            borderColor: val.color,
                          },
                        ]}
                        onPress={() =>
                          setFormData({ ...formData, status: key })
                        }
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            formData.status === key && { color: "#fff" },
                          ]}
                        >
                          {val.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {fields.map((field) => (
                <View key={field.key} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    placeholderTextColor="#aaa"
                    secureTextEntry={field.secure}
                    value={
                      formData[field.key as keyof FuncionarioForm] as string
                    }
                    onChangeText={(v) =>
                      setFormData({ ...formData, [field.key]: v })
                    }
                  />
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={onSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>{title}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        subtitle="Funcionarios"
        rightActions={
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity onPress={loadFuncionarios} style={{ padding: 6, marginRight: 4 }}>
              <Ionicons name="refresh-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={{ backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 20, paddingHorizontal: 10, padding: 6 }}>
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
          <Text style={styles.emptyText}>Nenhum funcionario encontrado</Text>
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
                    Matricula: {item.matricula}
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
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => handleEditar(item)}
                    style={styles.editBtn}
                  >
                    <Ionicons name="pencil-outline" size={18} color="#007bff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRemover(item)}
                    style={styles.removeBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {renderFormModal(
        modalVisible,
        "Adicionar Funcionario",
        form,
        setForm,
        addFields,
        handleAdicionar,
        () => {
          setModalVisible(false);
          setForm(EMPTY_FORM);
        },
        false,
      )}
      {renderFormModal(
        editModalVisible,
        "Salvar Alteracoes",
        editForm,
        setEditForm,
        editFields,
        handleSalvarEdicao,
        () => setEditModalVisible(false),
        true,
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  header: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  headerActions: { flexDirection: "row", alignItems: "center" },
  headerBtn: { padding: 6, marginLeft: 8 },
  addBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingHorizontal: 10,
  },
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
  cardActions: { flexDirection: "column", alignItems: "center" },
  editBtn: { padding: 6, marginBottom: 4 },
  removeBtn: { padding: 6 },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "92%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  photoPicker: { alignSelf: "center", marginBottom: 20 },
  photoPreview: { width: 90, height: 90, borderRadius: 45 },
  photoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#e8f0fe",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007bff",
    borderStyle: "dashed",
  },
  photoPlaceholderText: { fontSize: 11, color: "#007bff", marginTop: 4 },
  inputGroup: { marginBottom: 14 },
  inputLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f0f2f5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
  },
  saveBtn: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  statusRow: { flexDirection: "row", justifyContent: "space-between" },
  statusOption: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  statusOptionText: { fontSize: 12, fontWeight: "bold", color: "#555" },
});

export default ManagerFuncionariosScreen;
