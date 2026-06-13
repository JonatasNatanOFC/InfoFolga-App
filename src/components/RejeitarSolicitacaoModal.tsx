import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => Promise<void>;
}

const RejeitarSolicitacaoModal: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    const texto = motivo.trim();

    if (!texto) return;

    try {
      setLoading(true);
      await onConfirm(texto);
      setMotivo("");
      onClose();
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setMotivo("");
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Motivo da rejeição</Text>

          <TextInput
            style={styles.input}
            placeholder="Descreva o motivo"
            placeholderTextColor="#999"
            value={motivo}
            onChangeText={setMotivo}
            multiline
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, !motivo.trim() && { opacity: 0.6 }]}
              onPress={handleConfirm}
              disabled={!motivo.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RejeitarSolicitacaoModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
  },
  input: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    color: "#222",
    backgroundColor: "#fafafa",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cancelText: {
    color: "#666",
    fontWeight: "600",
  },
  confirmBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
  },
});
