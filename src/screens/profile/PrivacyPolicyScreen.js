import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.date}>Last Updated: May 2024</Text>

        <Text style={styles.sectionTitle}>1. Data We Collect</Text>
        <Text style={styles.text}>
          We collect personal information such as your name, email address, and transaction data 
          when you create an account, join groups, and add expenses.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use It</Text>
        <Text style={styles.text}>
          The data collected is used solely to provide the group expense splitting features of Together. 
          We use it to calculate balances, show your activity history, and send notifications.
        </Text>

        <Text style={styles.sectionTitle}>3. Account Security</Text>
        <Text style={styles.text}>
          We prioritize your account security. Passwords are encrypted, and we use secure cloud databases 
          to ensure your data is kept safe from unauthorized access.
        </Text>

        <Text style={styles.sectionTitle}>4. Contact Us</Text>
        <Text style={styles.text}>
          If you have questions about this Privacy Policy, please contact our support team from the Help page.
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

export default PrivacyPolicyScreen;
