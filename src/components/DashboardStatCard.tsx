import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number | string;
  color: string;
}

const DashboardStatCard: React.FC<Props> = ({ icon, label, value, color }) => {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: { padding: 12, borderRadius: 8 },
  textContainer: { marginLeft: 16 },
  value: { fontSize: 22, fontWeight: "bold", color: "#111" },
  label: { fontSize: 14, color: "#666" },
});

export default DashboardStatCard;
