import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import {
  AuthStackParamList,
  ManagerTabParamList,
  EmployeeTabParamList,
  AppStackParamList,
} from "./types";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import ManagerHomeScreen from "../screens/ManagerHomeScreen";

const AuthStack = createStackNavigator<AuthStackParamList>();
const ManagerTab = createBottomTabNavigator<ManagerTabParamList>();
const EmployeeTab = createBottomTabNavigator<EmployeeTabParamList>();
const AppStack = createStackNavigator<AppStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

const ManagerTabNavigator = () => (
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

const EmployeeTabNavigator = () => (
  <EmployeeTab.Navigator screenOptions={{ headerShown: false }}>
    <EmployeeTab.Screen name="Home" component={HomeScreen} />
  </EmployeeTab.Navigator>
);

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <AppStack.Navigator
        initialRouteName="Auth"
        screenOptions={{ headerShown: false }}
      >
        <AppStack.Screen name="Auth" component={AuthNavigator} />
        <AppStack.Screen name="ManagerApp" component={ManagerTabNavigator} />
        <AppStack.Screen name="EmployeeApp" component={EmployeeTabNavigator} />
      </AppStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
