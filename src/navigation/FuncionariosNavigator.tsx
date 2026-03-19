import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { FuncionariosStackParamList } from "./types";
import ManagerFuncionariosScreen from "../screens/ManagerFuncionariosScreen";
import FuncionarioDetalhesScreen from "../screens/FuncionarioDetalhesScreen";

const Stack = createStackNavigator<FuncionariosStackParamList>();

function FuncionariosNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FuncionariosList" component={ManagerFuncionariosScreen} />
      <Stack.Screen name="FuncionarioDetalhes" component={FuncionarioDetalhesScreen} />
    </Stack.Navigator>
  );
}

export default FuncionariosNavigator;
