import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LogBox } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";

// Suprime avisos no overlay do Expo em desenvolvimento.
// Todos os erros relevantes são tratados via Alert.alert() nas telas.
LogBox.ignoreAllLogs();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
