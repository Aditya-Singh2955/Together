import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import VerificationScreen from "../screens/auth/Verification"
import OTPVerificationScreen from "../screens/auth/OTPVerification"
import PasswordVerification from "../screens/auth/DoublePassword"

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="PasswordVerification" component={PasswordVerification} />
    </Stack.Navigator>
  );
}
