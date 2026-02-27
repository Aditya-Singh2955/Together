import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../../../assets/Landing.png";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firbase";
import { useAuth } from "../../navigation/RootNavigator";
import { showSuccessToast, showErrorToast } from "../../utils/toastWithSound";

const SignupScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
  
    if (!trimmedName) {
      showErrorToast("Please enter your name.");
      return;
    }
    if (!trimmedEmail) {
      showErrorToast("Please enter your email.");
      return;
    }
    if (!password) {
      showErrorToast("Please enter a password.");
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
      await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      showSuccessToast("Account created successfully 🎉");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        showErrorToast("This email is already registered. Try logging in.");
      } else if (err.code === "auth/invalid-email") {
        showErrorToast("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        showErrorToast("Password is too weak. Use at least 6 characters.");
      } else {
        showErrorToast(err.message || "Sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.LogoSection}>
          <Image source={Logo} style={styles.logo} />
        </View>

        <View style={styles.LoginSection}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Create Account</Text>
          </View>

          <View style={styles.ContentSection}>
            <TextInput
              style={styles.input}
              placeholder=" Enter Your Name"
              placeholderTextColor="#777"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder=" Enter Your Email"
              placeholderTextColor="#777"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder=" Password"
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
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            Already have an account?{" "}
            <Text style={styles.signupLink} onPress={() => navigation.navigate("Login")}>
              Login
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  LogoSection: { alignItems: "center", paddingTop: 16 },
  logo: { width: 200, height: 200, resizeMode: "contain" },
  LoginSection: { paddingHorizontal: 35, paddingTop: 8 },
  titleSection: { alignItems: "center", marginBottom: 16 },
  title: {
    fontSize: 28,
    fontFamily: "Poppins_600SemiBold",
    color: "#3f3333",
  },
  ContentSection: { marginTop: 8 },
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
  buttonDisabled: { opacity: 0.8 },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  signupContainer: { alignItems: "center", paddingVertical: 24, paddingBottom: 32 },
  signupText: { fontSize: 15, color: "#444", fontFamily: "Poppins_400Regular" },
  signupLink: { color: "#36BFA6", fontFamily: "Poppins_600SemiBold" },
});

export default SignupScreen;
