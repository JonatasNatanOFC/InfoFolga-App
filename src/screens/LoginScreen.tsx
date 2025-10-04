import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator, // Componente para o feedback de "carregando"
  ViewStyle,
  TextStyle,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import api, { LoginRequest, LoginResponse } from "../services/api";

// Tipagem para as propriedades de navegação da tela de Login
type Props = StackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [matricula, setMatricula] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false); // Estado de carregamento

  const handleLogin = async () => {
    if (!matricula || !senha) {
      Alert.alert(
        "Atenção",
        "Por favor, preencha os campos de matrícula e senha."
      );
      return;
    }

    setIsLoading(true); // Inicia o carregamento

    try {
      const loginData: LoginRequest = { matricula, senha };

      const response = await api.post<LoginResponse>(
        "/api/auth/login",
        loginData
      );

      const { token, nomeUsuario } = response.data;

      // Sucesso!
      console.log(`Login bem-sucedido. Token: ${token}`);

      // Navega para a tela Home, substituindo a tela de Login na pilha
      // para que o usuário não possa voltar para ela apertando o botão "voltar".
      navigation.replace("Home", { nomeUsuario });
    } catch (error: any) {
      console.error("Falha no login:", error);

      let errorMessage =
        "Não foi possível conectar ao servidor. Tente novamente.";
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        errorMessage = "Matrícula ou senha inválida.";
      }

      Alert.alert("Erro no Login", errorMessage);
    } finally {
      setIsLoading(false); // Finaliza o carregamento, independentemente de sucesso ou erro
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controle de Folgas</Text>

      <TextInput
        style={styles.input}
        placeholder="Matrícula"
        value={matricula}
        onChangeText={setMatricula}
        keyboardType="numeric"
        editable={!isLoading} // Não deixa editar enquanto carrega
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        editable={!isLoading}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Entrar" onPress={handleLogin} />
      )}
    </View>
  );
};

// Estilos
interface Style {
  container: ViewStyle;
  title: TextStyle;
  input: TextStyle;
}

const styles = StyleSheet.create<Style>({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
});

export default LoginScreen;
