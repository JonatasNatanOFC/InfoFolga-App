import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  AppStackParamList,
  AuthStackParamList,
  EmployeeTabParamList,
} from "./types";
import ManagerNavigator from "./ManagerNavigator";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";

const AppStack = createStackNavigator<AppStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const EmployeeTab = createBottomTabNavigator<EmployeeTabParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
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
        <AppStack.Screen name="ManagerApp" component={ManagerNavigator} />
        <AppStack.Screen name="EmployeeApp" component={EmployeeTabNavigator} />
      </AppStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
