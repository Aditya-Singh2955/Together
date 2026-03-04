import React, { createContext, useState, useEffect, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firbase";

import AuthStack from "./AuthStack";
import BottomTabs from "./BottomTabs";

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  if (loading) return null;

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
