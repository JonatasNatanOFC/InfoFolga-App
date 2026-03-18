import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { EmployeeTabParamList } from "./types";
import HomeScreen from "../screens/HomeScreen";

const EmployeeTab = createBottomTabNavigator<EmployeeTabParamList>();

const EmployeeNavigator = () => (
  <EmployeeTab.Navigator screenOptions={{ headerShown: false }}>
    <EmployeeTab.Screen name="Home" component={HomeScreen} />
  </EmployeeTab.Navigator>
);

export default EmployeeNavigator;
