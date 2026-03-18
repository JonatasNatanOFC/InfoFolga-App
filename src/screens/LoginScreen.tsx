import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthScreenProps } from "../navigation/types";
import api, { LoginRequest } from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LoginResponse {
  token: string;
  nomeUsuario: string;
  role: "ROLE_GERENTE" | "ROLE_FUNCIONARIO";
}

const LoginScreen: React.FC<AuthScreenProps<"Login">> = ({ navigation }) => {
  const [matricula, setMatricula] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!matricula || !senha) {
      Alert.alert(
        "Atenção",
        "Por favor, preencha os campos de matrícula e senha.",
      );
      return;
    }
    setIsLoading(true);
    try {
      const loginData: LoginRequest = { matricula, senha };
      const response = await api.post<LoginResponse>(
        "/api/auth/login",
        loginData,
      );
      const { token, nomeUsuario, role } = response.data;

      if (!token) {
        Alert.alert(
          "Erro de Login",
          "A resposta do servidor não incluiu um token.",
        );
        setIsLoading(false);
        return;
      }

      await AsyncStorage.setItem("userToken", token);

      if (role === "ROLE_GERENTE") {
        navigation.replace("ManagerApp", { screen: "Inicio" });
      } else {
        navigation.replace("EmployeeApp", {
          screen: "Home",
          params: { nomeUsuario },
        });
      }
    } catch (error: any) {
      console.error("Falha no login:", error);
      let errorMessage = "Não foi possível conectar ao servidor.";
      if (error.isAxiosError && error.response) {
        errorMessage = `Erro do servidor: ${error.response.status}. Matrícula ou senha inválida.`;
      } else if (error.isAxiosError && error.request) {
        errorMessage =
          "Erro de rede. Verifique sua conexão e se o servidor backend está rodando.";
      }
      Alert.alert("Erro no Login", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Ionicons name="briefcase-outline" size={60} color="#007bff" />
        <Text style={styles.title}>Controle de Folgas</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Matrícula"
          value={matricula}
          onChangeText={setMatricula}
          keyboardType="numeric"
          editable={!isLoading}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          editable={!isLoading}
          placeholderTextColor="#888"
        />
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#007bff"
            style={{ marginTop: 20 }}
          />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 20,
  },
  header: { alignItems: "center", marginBottom: 40 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginTop: 10 },
  subtitle: { fontSize: 16, color: "#666", marginTop: 4 },
  form: { width: "100%" },
  input: {
    height: 50,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default LoginScreen;
