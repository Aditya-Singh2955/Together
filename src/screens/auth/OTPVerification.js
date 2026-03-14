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

const LoginScreen = () => {
  const navigation = useNavigation();
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.LogoSection}>
          <Image source={Logo} style={styles.logo} />
        </View>

        <View style={styles.LoginSection}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Forget Password</Text>
          </View>

          <View style={styles.ContentSection}>
            <TextInput
              style={styles.input}
              placeholder="OTP"
              placeholderTextColor="#777"
            />

            {/* <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Re Enter Your Password"
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
            </View> */}

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("PasswordVerification")}
            >
              <Text style={styles.buttonText}>Submit</Text>
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
    backgroundColor: "#f8fafc",
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
    color: "#0f172a",
    marginTop: 20,
    letterSpacing: -0.5,
  },

  ContentSection: {
    flex: 1,
    paddingHorizontal: 35,
    marginTop: 20,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#0f172a",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#0f172a",
  },

  button: {
    backgroundColor: "#0f172a", // dark indigo
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },

  forgotText: {
    textAlign: "center",
    marginTop: 15,
    color: "#0f172a",
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  signupContainer: {
    alignItems: "center",
    paddingBottom: 24,
  },

  signupText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Poppins_400Regular",
  },

  signupLink: {
    color: "#0f172a",
    fontFamily: "Poppins_600SemiBold",
  },
});

export default LoginScreen;
