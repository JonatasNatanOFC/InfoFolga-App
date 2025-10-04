import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";

// Define os tipos de parâmetros para cada rota
export type RootStackParamList = {
  Login: undefined; // A tela de Login não recebe parâmetros
  Home: { nomeUsuario: string }; // A tela Home recebe o nome do usuário
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }} // Esconde o cabeçalho na tela de login
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Início" }} // Define o título do cabeçalho na tela Home
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
