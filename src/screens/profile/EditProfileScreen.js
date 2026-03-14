import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../../firbase";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { showSuccessToast, showErrorToast } from "../../utils/toastWithSound";

const TEAL = "#1a9f8f";
const TEAL_LIGHT = "#2bb7a8";
const BG = "#f5f7fa";
const CARD_BG = "#fff";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#6b7280";

const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
  android: { elevation: 2 },
});

const buttonShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12 },
  android: { elevation: 4 },
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

const EditProfileScreen = () => {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load current profile data from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();
        const docSnap = await getDoc(doc(db, "users", user.uid));

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setEmail(data.email || user.email || "");
          setPhone(data.phone || "");
        } else {
          setEmail(user.email || "");
        }
      } catch (error) {
        showErrorToast("Failed to load profile.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Save updated data back to Firestore
  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showErrorToast("Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      const db = getFirestore();
      await updateDoc(doc(db, "users", user.uid), {
        name: trimmedName,
        phone: phone.trim(),
      });
      showSuccessToast("Profile updated successfully!");
      navigation.goBack();
    } catch (error) {
      showErrorToast("Failed to save. Please try again.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#14b8a6" />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.avatarWrap}>
              <View style={[styles.avatarLarge, { backgroundColor: getColorFromName(name) }]}>
                <Text style={styles.avatarLetter}>{name ? name.charAt(0).toUpperCase() : "?"}</Text>
              </View>
            </View>

            <View style={[styles.card, cardShadow]}>
              <Text style={[styles.label, styles.labelFirst]}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={TEXT_SECONDARY}
                autoCapitalize="words"
                editable={!saving}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={email}
                placeholder="your@email.com"
                placeholderTextColor={TEXT_SECONDARY}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
              />
              <Text style={styles.hint}>Email cannot be changed here.</Text>

              <Text style={styles.label}>Phone (optional)</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98765 43210"
                placeholderTextColor={TEXT_SECONDARY}
                keyboardType="phone-pad"
                editable={!saving}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, buttonShadow, saving && { opacity: 0.7 }]}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
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
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  avatarWrap: { alignItems: "center", marginBottom: 24 },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#1e293b",
  },
  avatarLetter: { fontSize: 40, fontFamily: "Poppins_700Bold", color: "#fff" },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  label: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#64748b",
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  labelFirst: { marginTop: 0 },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  inputDisabled: {
    backgroundColor: "#f1f5f9",
    color: "#94a3b8",
  },
  hint: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#94a3b8",
    marginTop: 6,
    marginLeft: 4,
  },
  saveBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  saveBtnText: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#fff" },
});

export default EditProfileScreen;
