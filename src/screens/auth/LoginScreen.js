import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../../../assets/Landing.png";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../navigation/RootNavigator";
import { Audio } from "expo-av";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../../assets/faaa_1sec.mp3"),
      );

      await sound.playAsync();

     
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log("Sound error:", error);
    }

    login();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.LogoSection}>
          <Image source={Logo} style={styles.logo} />
        </View>

        <View style={styles.LoginSection}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Log In</Text>
          </View>

          <View style={styles.ContentSection}>
            <TextInput
              style={styles.input}
              placeholder=" Enter Your Email"
              placeholderTextColor="#777"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#777"
                secureTextEntry={!passwordVisible}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <Ionicons
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={22}
                  color="#777"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text
                style={styles.forgotText}
                onPress={() => navigation.navigate("Verification")}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            Don't have an account?{" "}
            <Text
              style={styles.signupLink}
              onPress={() => navigation.navigate("Signup")}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    flex: 1,
  },

  LogoSection: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },

  LoginSection: {
    flex: 7,
  },

  titleSection: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontFamily: "Poppins_600SemiBold",
    color: "#3f3333",
    marginTop: 20,
  },

  ContentSection: {
    flex: 1,
    paddingHorizontal: 35,
    marginTop: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },

  button: {
    backgroundColor: "#36BFA6",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },

  forgotText: {
    textAlign: "center",
    marginTop: 15,
    color: "#36BFA6",
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  signupContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },

  signupText: {
    fontSize: 15,
    color: "#444",
    fontFamily: "Poppins_400Regular",
  },

  signupLink: {
    color: "#36BFA6",
    fontFamily: "Poppins_600SemiBold",
  },
});

export default LoginScreen;
