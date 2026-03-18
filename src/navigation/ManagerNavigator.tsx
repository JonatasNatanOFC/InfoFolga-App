import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { ManagerTabParamList } from "./types";
import ManagerHomeScreen from "../screens/ManagerHomeScreen";

const ManagerTab = createBottomTabNavigator<ManagerTabParamList>();

const ManagerNavigator = () => (
  <ManagerTab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = "alert-circle";
        if (route.name === "Inicio")
          iconName = focused ? "home" : "home-outline";
        else if (route.name === "Solicitacoes")
          iconName = focused ? "clipboard" : "clipboard-outline";
        else if (route.name === "Funcionarios")
          iconName = focused ? "people" : "people-outline";
        else if (route.name === "Relatorios")
          iconName = focused ? "analytics" : "analytics-outline";
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#007bff",
      tabBarInactiveTintColor: "gray",
    })}
  >
    <ManagerTab.Screen name="Inicio" component={ManagerHomeScreen} />
  </ManagerTab.Navigator>
);

export default ManagerNavigator;
