import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";

import AuthStack from "./AuthStack";
import BottomTabs from "./BottomTabs";

export default function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      {isLoggedIn ? <BottomTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
