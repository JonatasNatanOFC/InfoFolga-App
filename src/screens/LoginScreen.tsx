import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Keyboard,
} from "react-native";
import { AuthScreenProps } from "../navigation/types";
import api, { setAuthToken } from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

interface LoginRequest {
  cpf: string;
  senha: string;
}

interface LoginResponse {
  token: string;
  nomeUsuario: string;
  role: "ROLE_GERENTE" | "ROLE_FUNCIONARIO";
}

const LoginScreen: React.FC<AuthScreenProps<"Login">> = ({ navigation }) => {
  const [cpf, setCpf] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardOpen(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardOpen(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const handleLogin = async () => {
    const cpfDigits = cpf.replace(/\D/g, "");

    if (cpfDigits.length !== 11 || !senha) {
      Alert.alert("Atenção", "Por favor, preencha o CPF completo e a senha.");
      return;
    }

    setIsLoading(true);

    // Usa .then/.catch para NUNCA rejeitar a promise externamente.
    // O try/catch padrão em modo dev do Expo pode deixar o overlay aparecer
    // antes de capturar o erro; este padrão evita isso completamente.
    const result = await api
      .post<LoginResponse>("/api/auth/login", { cpf: cpfDigits, senha })
      .then((response) => ({ ok: true as const, data: response.data }))
      .catch((error: any) => ({ ok: false as const, error }));

    setIsLoading(false);

    if (!result.ok) {
      const error = result.error;
      let errorMessage = "Não foi possível conectar ao servidor.";

      if (error?.isAxiosError && error?.response) {
        const backMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data?.message ?? error.response.data?.erro;

        if (backMessage) {
          errorMessage = backMessage;
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = "CPF ou senha inválidos.";
        } else {
          errorMessage = `Erro do servidor (${error.response.status}).`;
        }
      } else if (error?.isAxiosError && error?.request) {
        errorMessage = "Erro de rede. Verifique sua conexão e se o servidor está acessível.";
      }

      Alert.alert("Erro no Login", errorMessage);
      return;
    }

    const { token, nomeUsuario, role } = result.data;

    if (!token) {
      Alert.alert("Erro de Login", "A resposta do servidor não incluiu um token.");
      return;
    }

    await setAuthToken(token);

    if (role === "ROLE_GERENTE") {
      navigation.replace("ManagerApp", { screen: "Inicio" });
    } else {
      navigation.replace("EmployeeApp", {
        screen: "Home",
        params: { nomeUsuario },
      });
    }
  };

  return (
    <View
      style={[
        styles.container,
        keyboardOpen && { justifyContent: "flex-start", paddingTop: 100 },
      ]}
    >
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Ionicons name="briefcase-outline" size={60} color="#007bff" />
        <Text style={styles.title}>Controle de Folgas</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="CPF"
          value={cpf}
          onChangeText={(text) => setCpf(formatCpf(text))}
          keyboardType="numeric"
          editable={!isLoading}
          placeholderTextColor="#888"
          maxLength={14}
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
    </View>
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
