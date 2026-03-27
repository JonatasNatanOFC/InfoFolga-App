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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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
  ferias: { label: "De Ferias", color: "#17a2b8" },
  folga: { label: "Folga", color: "#ffc107" },
};

const editFields = [
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
      .then((r) => {
        setFuncionario(r.data);
      })
      .catch(() =>
        Alert.alert("Erro", "Nao foi possivel carregar os detalhes."),
      )
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

  const handleSalvarEdicao = async () => {
    if (!editForm.nome || !editForm.matricula || !editForm.cargo) {
      Alert.alert("Erro", "Preencha os campos obrigatorios.");
      return;
    }
    setSaving(true);
    try {
      await api.put("/api/gerencia/funcionarios/" + funcionarioId, editForm);
      setEditModalVisible(false);
      loadFuncionario();
    } catch {
      Alert.alert("Erro", "Nao foi possivel atualizar o funcionario.");
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
          } catch {
            Alert.alert("Erro", "Nao foi possivel remover o funcionario.");
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
          if (!result.canceled && result.assets[0])
            setEditForm((f) => ({
              ...f,
              foto: "data:image/jpeg;base64," + result.assets[0].base64,
            }));
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
            setEditForm((f) => ({
              ...f,
              foto: "data:image/jpeg;base64," + result.assets[0].base64,
            }));
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );

  if (!funcionario)
    return (
      <View style={styles.center}>
        <Text>Funcionario nao encontrado</Text>
      </View>
    );

  const st = statusConfig[funcionario.status] ?? {
    label: funcionario.status,
    color: "#888",
  };

  return (
    <View style={styles.container}>
      <AppHeader
        subtitle="Detalhes do Funcionario"
      />

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

        {/* Botões de ação no rodapé */}
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

      {/* Modal de edição */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar Funcionario</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Foto */}
                <TouchableOpacity
                  style={styles.photoPicker}
                  onPress={pickImage}
                >
                  {editForm.foto ? (
                    <Image
                      source={{ uri: editForm.foto }}
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

                {/* Status */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Status</Text>
                  <View style={styles.statusRow}>
                    {Object.entries(statusConfig).map(([key, val]) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.statusOption,
                          editForm.status === key && {
                            backgroundColor: val.color,
                            borderColor: val.color,
                          },
                        ]}
                        onPress={() =>
                          setEditForm((f) => ({ ...f, status: key }))
                        }
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            editForm.status === key && { color: "#fff" },
                          ]}
                        >
                          {val.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Campos */}
                {editFields.map((field) => (
                  <View key={field.key} style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{field.label}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={field.placeholder}
                      placeholderTextColor="#aaa"
                      secureTextEntry={field.secure}
                      value={
                        editForm[field.key as keyof FuncionarioForm] as string
                      }
                      onChangeText={(v) =>
                        setEditForm((f) => ({ ...f, [field.key]: v }))
                      }
                    />
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSalvarEdicao}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Salvar Alteracoes</Text>
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
  headerBtn: { padding: 6, marginLeft: 8 },
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

export default FuncionarioDetalhesScreen;
