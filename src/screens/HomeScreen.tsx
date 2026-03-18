import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { EmployeeTabScreenProps } from "../navigation/types";

const HomeScreen: React.FC<EmployeeTabScreenProps<"Home">> = ({ route }) => {
  const nomeUsuario = route.params?.nomeUsuario || "Funcionário";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo(a),</Text>
      <Text style={styles.userName}>{nomeUsuario}!</Text>
      <Text style={styles.subtitle}>Este é o seu painel de funcionário.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: { fontSize: 24, color: "#333" },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8,
    color: "#007bff",
  },
  subtitle: { fontSize: 16, color: "#666", marginTop: 20 },
});

export default HomeScreen;
