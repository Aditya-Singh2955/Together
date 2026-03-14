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
import Logo from "../../../assets/Landing.png";
import { useNavigation } from "@react-navigation/native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firbase";
import { showSuccessToast, showErrorToast } from "../../utils/toastWithSound";

const Verification = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      showErrorToast("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      showSuccessToast("Reset code sent! Check your email.");
      navigation.navigate("OTPVerification", { email: trimmedEmail });
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        showErrorToast("No account found with this email.");
      } else if (err.code === "auth/invalid-email") {
        showErrorToast("Please enter a valid email address.");
      } else {
        showErrorToast(err.message || "Something went wrong. Try again.");
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
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email to receive a reset code.
            </Text>
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
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.8 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Code</Text>
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
  button: { backgroundColor: "#0f172a", paddingVertical: 16, borderRadius: 16, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontFamily: "Poppins_700Bold" },
  signupContainer: { alignItems: "center", paddingBottom: 24 },
  signupText: { fontSize: 14, color: "#64748b", fontFamily: "Poppins_400Regular" },
  signupLink: { color: "#0f172a", fontFamily: "Poppins_600SemiBold" },
});

export default Verification;
