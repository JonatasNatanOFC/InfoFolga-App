import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View } from "react-native";
import { AppStackParamList, AuthStackParamList } from "./types";
import ManagerNavigator from "./ManagerNavigator";
import EmployeeNavigator from "./EmployeeNavigator";
import LoginScreen from "../screens/LoginScreen";
import { useAuth } from "../hooks/useAuth";

const AppStack = createStackNavigator<AppStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

const AppNavigator: React.FC = () => {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <AppStack.Screen name="Auth" component={AuthNavigator} />
        ) : role === "ROLE_GERENTE" ? (
          <AppStack.Screen name="ManagerApp" component={ManagerNavigator} />
        ) : (
          <AppStack.Screen name="EmployeeApp" component={EmployeeNavigator} />
        )}
      </AppStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;