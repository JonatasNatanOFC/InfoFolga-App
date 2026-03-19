import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number | string;
  color: string;
  compact?: boolean;
}

const DashboardStatCard: React.FC<Props> = ({ icon, label, value, color, compact }) => {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }, compact && styles.iconCompact]}>
        <Ionicons name={icon} size={compact ? 18 : 24} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.value, compact && styles.valueCompact]}>{value}</Text>
        <Text style={[styles.label, compact && styles.labelCompact]} numberOfLines={2}>{label}</Text>
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
  cardCompact: {
    padding: 12,
  },
  iconContainer: { padding: 12, borderRadius: 8 },
  iconCompact: { padding: 8 },
  textContainer: { marginLeft: 10, flex: 1 },
  value: { fontSize: 22, fontWeight: "bold", color: "#111" },
  valueCompact: { fontSize: 18 },
  label: { fontSize: 13, color: "#666" },
  labelCompact: { fontSize: 11, color: "#666" },
});

export default DashboardStatCard;
