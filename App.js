import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import RootNavigator from "./src/navigation/RootNavigator";
import { useFonts } from "expo-font";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import ToastManager from "toastify-react-native";

const { width, height } = Dimensions.get("window");


export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded) return null;

  return (
    <>
      {showSplash ? (
        <Animated.View style={[styles.splash, { opacity: fadeAnim }]}>
          <Image
            source={require("./assets/Splash.jpeg")}
            style={styles.splashImage}
            resizeMode="cover"
          />
        </Animated.View>
      ) : (
        <>
          <RootNavigator />
          <ToastManager />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    width,
    height,
  },
  splashImage: {
    width: "100%",
    height: "100%",
  },
});
