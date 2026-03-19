import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onLogout?: () => void;
  rightActions?: React.ReactNode;
}

function AppHeader({ title, subtitle, onLogout, rightActions }: AppHeaderProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={["#007bff", "#0056b3"]}
      style={[styles.gradient, { paddingTop: insets.top }]}
    >
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>Controle de Folgas</Text>
          <Text style={styles.subtitle}>{subtitle ?? title}</Text>
        </View>
        <View style={styles.actions}>
          {rightActions}
          {onLogout && (
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { paddingHorizontal: 20, paddingBottom: 16 },
  content: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10 },
  title: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  subtitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  actions: { flexDirection: "row", alignItems: "center" },
  logoutBtn: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.4)", marginLeft: 8 },
  logoutText: { color: "#fff", fontWeight: "bold" },
});

export default AppHeader;
