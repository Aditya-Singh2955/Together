import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const TermsOfServiceScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.date}>Last Updated: May 2024</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By using Together, you agree to these Terms of Service. If you do not agree to these terms, 
          please do not use the application.
        </Text>

        <Text style={styles.sectionTitle}>2. Use of Service</Text>
        <Text style={styles.text}>
          You must provide accurate information when creating an account or recording an expense. 
          The app is provided to facilitate group expense tracking and is not responsible for the actual 
          transfer of any funds between users.
        </Text>

        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.text}>
          You are responsible for safeguarding your account password. You must notify us immediately of 
          any unauthorized use of your account.
        </Text>

        <Text style={styles.sectionTitle}>4. Limitation of Liability</Text>
        <Text style={styles.text}>
          Together shall not be liable for any indirect, incidental, or consequential damages resulting from 
          your use of the service or any disputes regarding expenses.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#e2e8f0",
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#0f172a" },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 24, fontFamily: "Poppins_700Bold", color: "#0f172a", marginBottom: 4 },
  date: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#64748b", marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#0f172a", marginTop: 16, marginBottom: 8 },
  text: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#475569", lineHeight: 24 },
});

export default TermsOfServiceScreen;
