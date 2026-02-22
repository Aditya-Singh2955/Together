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
import { useAuth } from "../../navigation/RootNavigator";

const TEAL = "#1a9f8f";
const TEAL_LIGHT = "#2bb7a8";
const BG = "#f5f7fa";
const CARD_BG = "#fff";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#6b7280";

const SETTINGS_ITEMS = [
  { id: "1", label: "Notifications", icon: "notifications-outline" },
  { id: "2", label: "Security", icon: "shield-checkmark-outline" },
  { id: "3", label: "Help", icon: "help-circle-outline" },
  { id: "4", label: "Log Out", icon: "log-out-outline" },
];

const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const handleSettingsPress = (item) => {
    if (item.label === "Log Out") logout();
    else if (item.label === "Notifications") navigation.navigate("Notifications");
    else if (item.label === "Security") navigation.navigate("Security");
    else if (item.label === "Help") navigation.navigate("Help");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Together</Text>
          <TouchableOpacity style={styles.profileBtn} activeOpacity={0.7}>
            <Ionicons name="person-circle-outline" size={36} color={TEAL} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.profileCard, cardShadow]}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLetter}>J</Text>
            </View>
            <Text style={styles.userName}>John Sanlaen</Text>
            <Text style={styles.userEmail}>johnleen@email.com</Text>
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={[styles.settingsCard, cardShadow]}>
            {SETTINGS_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.settingsRow, index === SETTINGS_ITEMS.length - 1 && styles.rowLast]}
                onPress={() => handleSettingsPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.settingsIconWrap}>
                  <Ionicons name={item.icon} size={22} color={TEXT_PRIMARY} />
                </View>
                <Text style={styles.settingsLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
              </TouchableOpacity>
            ))}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  profileBtn: { padding: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  profileCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: TEAL_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarLetter: {
    fontSize: 38,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
  userName: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: TEXT_SECONDARY,
    marginBottom: 20,
  },
  editBtn: {
    backgroundColor: TEAL,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  editBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_PRIMARY,
    marginBottom: 14,
  },
  settingsCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: "hidden",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowLast: { borderBottomWidth: 0 },
  settingsIconWrap: { marginRight: 14 },
  settingsLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: TEXT_PRIMARY,
  },
});

export default ProfileScreen;
