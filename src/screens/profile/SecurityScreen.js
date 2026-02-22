import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const TEAL = "#1a9f8f";
const BG = "#f5f7fa";
const CARD_BG = "#fff";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#6b7280";

const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

const SECURITY_ITEMS = [
  { id: "1", label: "Change Password", icon: "lock-closed-outline", screen: "ChangePassword" },
  { id: "2", label: "Two-Factor Authentication", icon: "shield-checkmark-outline", screen: "TwoFactor" },
  { id: "3", label: "Login sessions", icon: "phone-portrait-outline", screen: "Sessions" },
];

const SecurityScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Security</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, cardShadow]}>
            {SECURITY_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.row, index < SECURITY_ITEMS.length - 1 && styles.rowBorder]}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon} size={22} color={TEXT_PRIMARY} style={styles.rowIcon} />
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.infoCard, cardShadow]}>
            <Ionicons name="information-circle-outline" size={24} color={TEAL} />
            <Text style={styles.infoText}>
              Keep your account secure by using a strong password and enabling two-factor authentication when available.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  headerPlaceholder: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  card: { backgroundColor: CARD_BG, borderRadius: 16, overflow: "hidden", marginBottom: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  rowIcon: { marginRight: 14 },
  rowLabel: { flex: 1, fontSize: 16, fontFamily: "Poppins_400Regular", color: TEXT_PRIMARY },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#e0f2ef",
    borderRadius: 16,
    padding: 18,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: TEXT_PRIMARY,
    marginLeft: 12,
    lineHeight: 22,
  },
});

export default SecurityScreen;
