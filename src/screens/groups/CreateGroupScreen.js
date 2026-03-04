import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../../firbase";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { showSuccessToast, showErrorToast } from "../../utils/toastWithSound";

const TEAL = "#1a9f8f";
const TEAL_LIGHT = "#2bb7a8";
const BG = "#f5f7fa";
const CARD_BG = "#fff";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#6b7280";

const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

const ICON_OPTIONS = [
  { name: "bed-outline", label: "Home" },
  { name: "airplane-outline", label: "Trip" },
  { name: "people-outline", label: "Group" },
  { name: "restaurant-outline", label: "Food" },
  { name: "cart-outline", label: "Shopping" },
  { name: "car-outline", label: "Travel" },
  { name: "gift-outline", label: "Gift" },
  { name: "game-controller-outline", label: "Fun" },
];

const generateInviteCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const CreateGroupScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("people-outline");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      showErrorToast("Please enter a group name.");
      return;
    }

    setLoading(true);
    try {
      const db = getFirestore();
      const user = auth.currentUser;
      const inviteCode = generateInviteCode();

      const docRef = await addDoc(collection(db, "groups"), {
        name: name.trim(),
        icon: selectedIcon,
        createdBy: user.uid,
        members: [user.uid],
        inviteCode: inviteCode,
        createdAt: new Date().toISOString(),
      });

      showSuccessToast("Group created!");
      navigation.replace("GroupDetail", {
        groupId: docRef.id,
        groupName: name.trim(),
      });
    } catch (err) {
      showErrorToast("Failed to create group.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Group</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, cardShadow]}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Roommates, Trip to Goa"
              placeholderTextColor={TEXT_SECONDARY}
              autoCapitalize="words"
              editable={!loading}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>Pick an Icon</Text>
            <View style={styles.iconGrid}>
              {ICON_OPTIONS.map((icon) => (
                <TouchableOpacity
                  key={icon.name}
                  style={[
                    styles.iconOption,
                    selectedIcon === icon.name && styles.iconOptionSelected,
                  ]}
                  onPress={() => setSelectedIcon(icon.name)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={icon.name}
                    size={26}
                    color={selectedIcon === icon.name ? "#fff" : TEXT_PRIMARY}
                  />
                  <Text style={[
                    styles.iconLabel,
                    selectedIcon === icon.name && styles.iconLabelSelected,
                  ]}>
                    {icon.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.createBtn, cardShadow, loading && { opacity: 0.7 }]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.createBtnText}>Create Group</Text>
              </>
            )}
          </TouchableOpacity>
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
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_PRIMARY,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: TEXT_PRIMARY,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  iconOption: {
    width: "22%",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    gap: 4,
  },
  iconOptionSelected: {
    backgroundColor: TEAL,
  },
  iconLabel: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_PRIMARY,
  },
  iconLabelSelected: { color: "#fff" },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TEAL,
    paddingVertical: 18,
    borderRadius: 14,
  },
  createBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#fff" },
});

export default CreateGroupScreen;
