import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { EmployeeTabParamList } from "./types";
import HomeScreen from "../screens/HomeScreen";
import NovaSolicitacaoScreen from "../screens/NovaSolicitacaoScreen";
import MinhasSolicitacoesScreen from "../screens/MinhasSolicitacoesScreen";

const EmployeeTab = createBottomTabNavigator<EmployeeTabParamList>();

const EmployeeNavigator = () => (
  <EmployeeTab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: "#007bff",
      tabBarInactiveTintColor: "gray",
      tabBarIcon: ({ color, size, focused }) => {
        let iconName: keyof typeof Ionicons.glyphMap = "ellipse";

        if (route.name === "Home") {
          iconName = focused ? "home" : "home-outline";
        } else if (route.name === "NovaSolicitacao") {
          iconName = focused ? "add-circle" : "add-circle-outline";
        } else if (route.name === "MinhasSolicitacoes") {
          iconName = focused ? "list" : "list-outline";
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <EmployeeTab.Screen
      name="Home"
      component={HomeScreen}
      options={{ tabBarLabel: "Início" }}
    />
    <EmployeeTab.Screen
      name="NovaSolicitacao"
      component={NovaSolicitacaoScreen}
      options={{ tabBarLabel: "Solicitar" }}
    />
    <EmployeeTab.Screen
      name="MinhasSolicitacoes"
      component={MinhasSolicitacoesScreen}
      options={{ tabBarLabel: "Histórico" }}
    />
  </EmployeeTab.Navigator>
);

export default EmployeeNavigator;
