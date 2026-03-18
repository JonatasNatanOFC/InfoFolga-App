// src/components/QuickActionButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// AQUI ESTÁ A CORREÇÃO: Adicionamos a propriedade 'onPress'
interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color: string;
}

const QuickActionButton: React.FC<Props> = ({
  icon,
  label,
  onPress,
  color,
}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Ionicons name="chevron-forward-outline" size={22} color="#aaa" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
  },
  label: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});

export default QuickActionButton;
