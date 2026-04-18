import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  useColorScheme,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";

interface DateFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  disabled?: boolean;
}

function formatarData(date: Date | null) {
  if (!date) return "Selecionar data";
  return date.toLocaleDateString("pt-BR");
}

const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  minimumDate,
  disabled = false,
}) => {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(
    value || minimumDate || new Date(),
  );

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const abrirPicker = () => {
    if (disabled) return;
    setTempDate(value || minimumDate || new Date());
    setShow(true);
  };

  const confirmarIOS = () => {
    onChange(tempDate);
    setShow(false);
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={[styles.input, disabled && styles.inputDisabled]}
        onPress={abrirPicker}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {formatarData(value)}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#666" />
      </TouchableOpacity>

      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={value || minimumDate || new Date()}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          onChange={(_, selectedDate) => {
            setShow(false);
            if (selectedDate) {
              onChange(selectedDate);
            }
          }}
        />
      )}

      {show && Platform.OS === "ios" && (
        <Modal transparent animationType="slide" visible={show}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.modalCancel}>Cancelar</Text>
                </TouchableOpacity>

                <Text style={styles.modalTitle}>{label}</Text>

                <TouchableOpacity onPress={confirmarIOS}>
                  <Text style={styles.modalConfirm}>Confirmar</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                minimumDate={minimumDate}
                textColor={isDark ? "#FFFFFF" : "#000000"}
                themeVariant={isDark ? "dark" : "light"}
                locale="pt-BR"
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    setTempDate(selectedDate);
                  }
                }}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default DateField;

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e3e6ea",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputDisabled: {
    opacity: 0.6,
  },
  inputText: {
    fontSize: 16,
    color: "#222",
  },
  placeholder: {
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalContent: {
    backgroundColor: "#fff",
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalCancel: {
    color: "#666",
    fontSize: 16,
  },
  modalConfirm: {
    color: "#007bff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  iosPicker: {
    backgroundColor: "#fff",
  },
});
