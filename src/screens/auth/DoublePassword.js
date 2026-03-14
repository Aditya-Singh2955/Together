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
import { useNavigation, useRoute } from "@react-navigation/native";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../../../firbase";
import { showSuccessToast, showErrorToast } from "../../utils/toastWithSound";

const DoublePassword = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { oobCode } = route.params || {};

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password) {
      showErrorToast("Please enter a new password.");
      return;
    }
    if (password.length < 6) {
      showErrorToast("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      showErrorToast("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      showSuccessToast("Password reset successfully! Please log in.");
      navigation.navigate("Login");
    } catch (err) {
      if (err.code === "auth/expired-action-code") {
        showErrorToast("Reset code expired. Please start over.");
      } else if (err.code === "auth/weak-password") {
        showErrorToast("Password is too weak. Use at least 6 characters.");
      } else {
        showErrorToast(err.message || "Failed to reset password. Try again.");
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
            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>Choose a strong new password for your account.</Text>
          </View>

          <View style={styles.ContentSection}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder=" New Password"
                placeholderTextColor="#777"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={22} color="#777" />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder=" Confirm Password"
                placeholderTextColor="#777"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!confirmVisible}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setConfirmVisible(!confirmVisible)}>
                <Ionicons name={confirmVisible ? "eye-off" : "eye"} size={22} color="#777" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.8 }]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            Remember your password?{" "}
            <Text style={styles.signupLink} onPress={() => navigation.navigate("Login")}>
              Log In
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  container: { flex: 1 },
  LogoSection: { flex: 3, justifyContent: "center", alignItems: "center" },
  logo: { width: 250, height: 250, resizeMode: "contain" },
  LoginSection: { flex: 7 },
  titleSection: { justifyContent: "center", alignItems: "center", marginBottom: 20, paddingHorizontal: 35 },
  title: { fontSize: 28, fontFamily: "Poppins_600SemiBold", color: "#0f172a", marginTop: 20, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#64748b", textAlign: "center", marginTop: 8 },
  ContentSection: { flex: 1, paddingHorizontal: 35, marginTop: 10 },
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
  button: { backgroundColor: "#0f172a", paddingVertical: 16, borderRadius: 16, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontFamily: "Poppins_700Bold" },
  signupContainer: { alignItems: "center", paddingBottom: 24 },
  signupText: { fontSize: 14, color: "#64748b", fontFamily: "Poppins_400Regular" },
  signupLink: { color: "#0f172a", fontFamily: "Poppins_600SemiBold" },
});

export default DoublePassword;
