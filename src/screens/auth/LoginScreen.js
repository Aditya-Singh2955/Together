import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../../../assets/Landing.png";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../navigation/RootNavigator";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firbase";
import { showSuccessToast, showErrorToast } from "../../utils/toastWithSound";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      showErrorToast("Please enter your email.");
      return;
    }
    if (!password) {
      showErrorToast("Please enter a password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
      showSuccessToast("Logged in successfully 🎉");
      login();
    } catch (err) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        showErrorToast("Incorrect email or password.");
      } else if (err.code === "auth/user-not-found") {
        showErrorToast("No account found with this email.");
      } else if (err.code === "auth/invalid-email") {
        showErrorToast("Please enter a valid email address.");
      } else {
        showErrorToast(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#777"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                editable={!loading}
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

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.8 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
    marginTop: 20,
    color: "#0f172a",
    fontSize: 14,
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
