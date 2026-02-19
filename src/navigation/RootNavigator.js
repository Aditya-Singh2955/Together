import React, { createContext, useState, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";

import AuthStack from "./AuthStack";
import BottomTabs from "./BottomTabs";

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = () => {
    console.log("Login called - changing state to true");
    setIsLoggedIn(true);
  };
  
  const logout = () => {
    console.log("Logout called - changing state to false");
    setIsLoggedIn(false);
  };

  console.log("RootNavigator - isLoggedIn:", isLoggedIn);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      <NavigationContainer>
        {isLoggedIn ? (
          <BottomTabs key="main" />
        ) : (
          <AuthStack key="auth" />
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
