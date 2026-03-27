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
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AppHeader from "../components/AppHeader";
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

const addFields = [
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

  return (
    <View style={styles.container}>
      <AppHeader
        subtitle="Funcionarios"
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
              // Card inteiro é clicável → vai para detalhes (onde ficam editar/excluir)
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
                {/* Seta indicando que é clicável */}
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

      {/* Modal — Adicionar funcionario */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Adicionar Funcionario</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setForm(EMPTY_FORM);
                  }}
                >
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
                    pickImage((b64) => setForm((f) => ({ ...f, foto: b64 })))
                  }
                >
                  {form.foto ? (
                    <Image
                      source={{ uri: form.foto }}
                      style={styles.photoPreview}
                    />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons
                        name="camera-outline"
                        size={32}
                        color="#007bff"
                      />
                      <Text style={styles.photoPlaceholderText}>
                        Adicionar foto
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {addFields.map((field) => (
                  <View key={field.key} style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{field.label}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={field.placeholder}
                      placeholderTextColor="#aaa"
                      secureTextEntry={field.secure}
                      value={form[field.key as keyof FuncionarioForm] as string}
                      onChangeText={(v) =>
                        setForm((f) => ({ ...f, [field.key]: v }))
                      }
                    />
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleAdicionar}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Adicionar Funcionario</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
});

export default ManagerFuncionariosScreen;
