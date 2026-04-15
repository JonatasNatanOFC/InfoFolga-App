import React, { useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { AuthScreenProps } from "../navigation/types";
import { useAuth } from "../hooks/useAuth";

const LoginScreen: React.FC<AuthScreenProps<"Login">> = ({ navigation }) => {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const { login, setRole } = useAuth();

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

  function formatCpf(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  async function handleLogin() {
    const cpfDigits = cpf.replace(/\D/g, "");

    if (cpfDigits.length !== 11 || !senha) {
      Alert.alert("Atenção", "Por favor, preencha o CPF completo e a senha.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(cpfDigits, senha);
      setRole(result.role);
    } catch (error: any) {
      let errorMessage = "Não foi possível conectar ao servidor.";

      if (error?.isAxiosError && error?.response) {
        const backMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : (error.response.data?.message ?? error.response.data?.erro);

        if (backMessage) {
          errorMessage = backMessage;
        } else if (
          error.response.status === 401 ||
          error.response.status === 403
        ) {
          errorMessage = "CPF ou senha inválidos.";
        } else {
          errorMessage = `Erro do servidor (${error.response.status}).`;
        }
      } else if (error?.isAxiosError && error?.request) {
        errorMessage =
          "Erro de rede. Verifique sua conexão e se o servidor está acessível.";
      }

      Alert.alert("Erro no Login", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

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
          placeholder="CPF"
          keyboardType="numeric"
          value={cpf}
          onChangeText={(v) => setCpf(formatCpf(v))}
          style={styles.input}
        />
        <TextInput
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f5f7fb" },
  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "bold", marginTop: 12, color: "#111" },
  subtitle: { fontSize: 15, color: "#666", marginTop: 6 },
  form: { gap: 14 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default LoginScreen;