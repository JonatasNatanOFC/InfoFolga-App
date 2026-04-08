import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatCpf } from "../utils/cpf";

export interface FuncionarioForm {
  nome: string;
  matricula: string;
  cargo: string;
  setor: string;
  cpf: string;
  senha: string;
  foto: string | null;
  status: string;
}

export interface FuncionarioField {
  key: keyof FuncionarioForm;
  label: string;
  placeholder: string;
  secure: boolean;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ativo: { label: "Ativo", color: "#28a745" },
  inativo: { label: "Inativo", color: "#6c757d" },
  ferias: { label: "De Férias", color: "#17a2b8" },
  folga: { label: "Folga", color: "#ffc107" },
};

interface FuncionarioModalProps {
  visible: boolean;
  title: string;
  form: FuncionarioForm;
  saving: boolean;
  submitLabel: string;
  fields: FuncionarioField[];
  onClose: () => void;
  onSubmit: () => void;
  onChangeForm: (form: FuncionarioForm) => void;
  onPickImage: () => void;
  onCheckCpf?: (cpf: string) => Promise<"invalido" | "duplicado" | "ok" | null>;
}

function FuncionarioModal({
  visible,
  title,
  form,
  saving,
  submitLabel,
  fields,
  onClose,
  onSubmit,
  onChangeForm,
  onPickImage,
  onCheckCpf,
}: FuncionarioModalProps): React.ReactElement {
  const [cpfStatus, setCpfStatus] = React.useState<
    "invalido" | "duplicado" | "ok" | null
  >(null);
  const [checkingCpf, setCheckingCpf] = React.useState(false);

  React.useEffect(() => {
    if (!visible) {
      setCpfStatus(null);
      setCheckingCpf(false);
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={Keyboard.dismiss}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Foto */}
              <TouchableOpacity
                style={styles.photoPicker}
                onPress={onPickImage}
              >
                {form.foto ? (
                  <Image
                    source={{ uri: form.foto }}
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

              {/* Status */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusRow}>
                  {Object.entries(statusConfig).map(([key, val]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.statusOption,
                        form.status === key && {
                          backgroundColor: val.color,
                          borderColor: val.color,
                        },
                      ]}
                      onPress={() => onChangeForm({ ...form, status: key })}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          form.status === key && { color: "#fff" },
                        ]}
                      >
                        {val.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Campos */}
              {fields.map((field) => (
                <View key={field.key} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{field.label}</Text>

                  <View style={field.key === "cpf" ? styles.cpfRow : undefined}>
                    <TextInput
                      style={[
                        styles.input,
                        field.key === "cpf" && { flex: 1 },
                        field.key === "cpf" &&
                          cpfStatus === "ok" &&
                          styles.inputOk,
                        field.key === "cpf" &&
                          (cpfStatus === "invalido" ||
                            cpfStatus === "duplicado") &&
                          styles.inputError,
                      ]}
                      placeholder={field.placeholder}
                      placeholderTextColor="#aaa"
                      secureTextEntry={field.secure}
                      keyboardType={field.key === "cpf" ? "numeric" : "default"}
                      value={form[field.key] as string}
                      onChangeText={async (v) => {
                        if (field.key === "cpf") {
                          const masked = formatCpf(v);
                          onChangeForm({ ...form, cpf: masked });
                          setCpfStatus(null);
                          const digits = masked.replace(/\D/g, "");
                          if (digits.length === 11 && onCheckCpf) {
                            setCheckingCpf(true);
                            const result = await onCheckCpf(digits);
                            setCpfStatus(result);
                            setCheckingCpf(false);
                          }
                        } else {
                          onChangeForm({ ...form, [field.key]: v });
                        }
                      }}
                    />

                    {field.key === "cpf" && (
                      <View style={styles.cpfIcon}>
                        {checkingCpf ? (
                          <ActivityIndicator size="small" color="#007bff" />
                        ) : cpfStatus === "ok" ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color="#28a745"
                          />
                        ) : cpfStatus === "invalido" ? (
                          <Ionicons
                            name="close-circle"
                            size={22}
                            color="#dc3545"
                          />
                        ) : cpfStatus === "duplicado" ? (
                          <Ionicons name="warning" size={22} color="#ffc107" />
                        ) : null}
                      </View>
                    )}
                  </View>

                  {field.key === "cpf" && cpfStatus === "invalido" && (
                    <Text style={styles.cpfErrorText}>CPF invalido</Text>
                  )}
                  {field.key === "cpf" && cpfStatus === "duplicado" && (
                    <Text style={styles.cpfWarnText}>CPF ja cadastrado</Text>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={onSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>{submitLabel}</Text>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: Platform.OS === "ios" ? "88%" : "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
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
  inputOk: {
    borderWidth: 1.5,
    borderColor: "#28a745",
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: "#dc3545",
  },
  cpfRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cpfIcon: {
    width: 28,
    alignItems: "center",
  },
  cpfErrorText: {
    fontSize: 12,
    color: "#dc3545",
    marginTop: 4,
  },
  cpfWarnText: {
    fontSize: 12,
    color: "#e6a817",
    marginTop: 4,
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

export default FuncionarioModal;
