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
import { useNavigation, useRoute } from "@react-navigation/native";
import { verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../../../firbase";
import { showErrorToast } from "../../utils/toastWithSound";

const OTPVerification = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const email = route.params?.email || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      showErrorToast("Please enter the reset code from your email.");
      return;
    }

    setLoading(true);
    try {
      // Verify the code is valid before proceeding
      await verifyPasswordResetCode(auth, trimmedCode);
      // Code is valid — go to set new password screen
      navigation.navigate("PasswordVerification", { email, oobCode: trimmedCode });
    } catch (err) {
      if (err.code === "auth/expired-action-code") {
        showErrorToast("This code has expired. Please request a new one.");
      } else if (err.code === "auth/invalid-action-code") {
        showErrorToast("Invalid code. Please check and try again.");
      } else {
        showErrorToast("Invalid or expired code. Try again.");
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
            <Text style={styles.title}>Enter Reset Code</Text>
            <Text style={styles.subtitle}>
              Open the reset email sent to{"\n"}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
            <Text style={styles.hint}>
              Copy the code from the link in your email.{"\n"}
              It appears after <Text style={styles.codeHint}>oobCode=</Text> in the URL.
            </Text>
          </View>

          <View style={styles.ContentSection}>
            <TextInput
              style={styles.input}
              placeholder=" Paste reset code here"
              placeholderTextColor="#777"
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.8 }]}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>← Go back and resend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  container: { flex: 1 },
  LogoSection: { flex: 2, justifyContent: "center", alignItems: "center" },
  logo: { width: 180, height: 180, resizeMode: "contain" },
  LoginSection: { flex: 8 },
  titleSection: { alignItems: "center", marginBottom: 20, paddingHorizontal: 35 },
  title: { fontSize: 26, fontFamily: "Poppins_700Bold", color: "#0f172a", letterSpacing: -0.5, marginBottom: 10 },
  subtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#64748b", textAlign: "center", marginBottom: 10 },
  emailHighlight: { fontFamily: "Poppins_600SemiBold", color: "#0f172a" },
  hint: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 6,
    paddingHorizontal: 10,
  },
  codeHint: { fontFamily: "Poppins_600SemiBold", color: "#0f172a" },
  ContentSection: { paddingHorizontal: 35 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#0f172a",
  },
  button: { backgroundColor: "#0f172a", paddingVertical: 16, borderRadius: 16, alignItems: "center", marginBottom: 16 },
  buttonText: { color: "#fff", fontSize: 18, fontFamily: "Poppins_700Bold" },
  backBtn: { alignItems: "center" },
  backText: { fontSize: 14, color: "#64748b", fontFamily: "Poppins_400Regular" },
});

export default OTPVerification;
