import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TipoSolicitacao } from "../services/solicitacaoService";

interface Props {
  tipo: TipoSolicitacao;
  onChange: (tipo: TipoSolicitacao) => void;
}

const TipoSolicitacaoSelector: React.FC<Props> = ({ tipo, onChange }) => {
  return (
    <View>
      <Text style={styles.label}>Tipo</Text>

      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            tipo === "FOLGA" && styles.typeButtonActive,
          ]}
          onPress={() => onChange("FOLGA")}
        >
          <Ionicons
            name="sunny-outline"
            size={18}
            color={tipo === "FOLGA" ? "#fff" : "#007bff"}
          />
          <Text
            style={[
              styles.typeButtonText,
              tipo === "FOLGA" && styles.typeButtonTextActive,
            ]}
          >
            Folga
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            tipo === "FERIAS" && styles.typeButtonActive,
          ]}
          onPress={() => onChange("FERIAS")}
        >
          <Ionicons
            name="airplane-outline"
            size={18}
            color={tipo === "FERIAS" ? "#fff" : "#007bff"}
          />
          <Text
            style={[
              styles.typeButtonText,
              tipo === "FERIAS" && styles.typeButtonTextActive,
            ]}
          >
            Férias
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TipoSolicitacaoSelector;

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 14,
  },
  typeRow: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#fff",
  },
  typeButtonActive: {
    backgroundColor: "#007bff",
  },
  typeButtonText: {
    color: "#007bff",
    fontWeight: "600",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
});
