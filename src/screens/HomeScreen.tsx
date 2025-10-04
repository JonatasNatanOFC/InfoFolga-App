// src/screens/HomeScreen.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";

// Tipagem para as propriedades de navegação recebidas pela tela
type Props = StackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC<Props> = ({ route }) => {
  const { nomeUsuario } = route.params; // Recebe o parâmetro passado pela navegação

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo(a),</Text>
      <Text style={styles.userName}>{nomeUsuario}!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "#333",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8,
  },
});

export default HomeScreen;
