import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../navigation/RootNavigator";
import { auth } from "../../../firbase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { playOuchSound } from "../../utils/toastWithSound";
import QRCodeImg from "../../../assets/QR.jpeg";

const TEAL = "#1a9f8f";
const TEAL_LIGHT = "#2bb7a8";
const BG = "#f5f7fa";
const CARD_BG = "#fff";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#6b7280";

const SETTINGS_ITEMS = [
  { id: "2.5", label: "Support Aditya Kumar", icon: "heart" },
  { id: "3", label: "Help", icon: "help-circle-outline" },
  { id: "4", label: "Log Out", icon: "log-out-outline" },
];

const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
  android: { elevation: 2 },
});

const AVATAR_COLORS = [
  "#38bdf8", // light blue
  "#fbbf24", // amber
  "#f472b6", // pink
  "#c084fc", // purple
  "#4ade80", // green
  "#f87171", // red
];

const getColorFromName = (name) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const AvatarLarge = ({ name }) => {
  const bgColor = getColorFromName(name);
  return (
    <View style={[styles.avatarLarge, { backgroundColor: bgColor }]}>
      <Text style={[styles.avatarLetter, { color: "#fff" }]}>{name ? name.charAt(0).toUpperCase() : "?"}</Text>
    </View>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supportModalVisible, setSupportModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const user = auth.currentUser;
          if (!user) return;

          const db = getFirestore();
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            setProfile({
              name: user.displayName || "User",
              email: user.email || "",
            });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }, [])
  );

  const handleSettingsPress = (item) => {
    if (item.label === "Log Out") logout();
    else if (item.label === "Help") navigation.navigate("Help");
    else if (item.label === "Support Aditya Kumar") setSupportModalVisible(true);
  };

  const avatarLetter = profile?.name ? profile.name.charAt(0).toUpperCase() : "?";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.8} onPress={playOuchSound}>
            <Image
              source={require("../../../assets/header.png")}
              style={{ width: 140, height: 44 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} activeOpacity={0.7}>
            <Ionicons name="person-circle-outline" size={36} color={TEAL} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileCard}>
            {loading ? (
              <ActivityIndicator size="large" color="#14b8a6" style={{ marginVertical: 32 }} />
            ) : (
              <>
                <AvatarLarge name={profile?.name} />
                <Text style={styles.userName}>{profile?.name || "User"}</Text>
                <Text style={styles.userEmail}>{profile?.email || ""}</Text>
                <TouchableOpacity
                  style={styles.editBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate("EditProfile")}
                >
                  <Text style={styles.editBtnText}>EDIT PROFILE</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SETTINGS</Text>
          </View>
          <View style={styles.listCard}>
            {SETTINGS_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.settingsRow}
                onPress={() => handleSettingsPress(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.settingsIconWrap, { backgroundColor: item.label === "Log Out" ? "#fee2e2" : item.label === "Support Aditya Kumar" ? "#fee2e2" : "#f1f5f9" }]}>
                  <Ionicons name={item.icon} size={20} color={item.label === "Log Out" || item.label === "Support Aditya Kumar" ? "#ef4444" : "#0f172a"} />
                </View>
                <Text style={[styles.settingsLabel, item.label === "Log Out" && { color: "#ef4444" }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.footerText}>
            Made with :) in Providence Gurgaon, Haryana
          </Text>
          <Text style={[styles.footerText, { marginTop: 0 }]}>
            with lots of Love Aditya Kumar
          </Text>
          <Text style={[styles.footerText, { marginTop: 0, marginBottom: 24 }]}>
            Copyright © 2026 Together Inc.
          </Text>
        </ScrollView>

        <Modal
          visible={supportModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSupportModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setSupportModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Support the Creator 💖</Text>
                  <Image source={QRCodeImg} style={styles.qrImage} />
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setSupportModalVisible(false)}>
                    <Text style={styles.closeBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
    paddingVertical: 12,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  profileBtn: { padding: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  profileCard: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#1e293b",
  },
  avatarLetter: {
    fontSize: 40,
    fontFamily: "Poppins_700Bold",
  },
  userName: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#94a3b8",
    marginBottom: 24,
  },
  editBtn: {
    backgroundColor: "#ccfbf1",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#99f6e4",
  },
  editBtnText: { fontSize: 13, fontFamily: "Poppins_700Bold", color: "#0f766e", letterSpacing: 1 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#64748b",
    letterSpacing: 1.5,
  },
  listCard: {
    gap: 12,
    marginBottom: 24,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...cardShadow,
  },
  settingsIconWrap: { 
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#0f172a",
    letterSpacing: -0.2,
  },
  footerText: {
    textAlign: "center",
    marginTop: 24,
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#94a3b8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    width: "90%",
    ...cardShadow,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#0f172a",
    marginBottom: 20,
    textAlign: "center",
  },
  qrImage: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    borderRadius: 16,
    marginBottom: 24,
  },
  closeBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  closeBtnText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },
});

export default ProfileScreen;
