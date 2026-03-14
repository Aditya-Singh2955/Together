import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../../firbase";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { showSuccessToast, showErrorToast } from "../../utils/toastWithSound";

const TEAL = "#1a9f8f";
const TEAL_LIGHT = "#2bb7a8";
const BG = "#f5f7fa";
const CARD_BG = "#fff";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#6b7280";

const JoinGroupScreen = () => {
  const navigation = useNavigation();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const code = inviteCode.trim().toUpperCase();
    if (code.length !== 6) {
      showErrorToast("Please enter a valid 6-character invite code.");
      return;
    }

    setLoading(true);
    try {
      const db = getFirestore();
      const user = auth.currentUser;

      // Find group with this invite code
      const q = query(
        collection(db, "groups"),
        where("inviteCode", "==", code)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        showErrorToast("No group found with that code.");
        return;
      }

      const groupDoc = snapshot.docs[0];
      const groupData = groupDoc.data();

      // Check if already a member
      if (groupData.members?.includes(user.uid)) {
        showErrorToast("You are already in this group!");
        navigation.navigate("GroupDetail", {
          groupId: groupDoc.id,
          groupName: groupData.name,
        });
        return;
      }

      // Add user to group members
      await updateDoc(doc(db, "groups", groupDoc.id), {
        members: arrayUnion(user.uid),
      });

      showSuccessToast(`Joined ${groupData.name}!`);
      navigation.navigate("GroupDetail", {
        groupId: groupDoc.id,
        groupName: groupData.name,
      });
    } catch (err) {
      showErrorToast("Failed to join group.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandSection}>
          <Image
            source={require("../../../assets/Together.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Together</Text>
          <Text style={styles.screenTitle}>Join a Group</Text>
        </View>

        <View style={styles.joinSection}>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-character Invite Code"
            placeholderTextColor="#999"
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.joinButton, loading && { opacity: 0.7 }]}
            onPress={handleJoin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.joinButtonText}>Join Group</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.hintBox}>
          <Ionicons name="information-circle-outline" size={22} color="#14b8a6" style={{ marginRight: 10 }} />
          <Text style={styles.hintText}>
            Ask the group admin to share their invite code with you.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  backButton: { padding: 8 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 32 },
  brandSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 28,
  },
  logo: { width: 80, height: 80, marginBottom: 12 },
  appName: { fontSize: 18, fontFamily: "Poppins_400Regular", color: "#475569", marginBottom: 8 },
  screenTitle: { fontSize: 24, fontFamily: "Poppins_600SemiBold", color: "#0f172a", letterSpacing: -0.5 },
  joinSection: { marginBottom: 32 },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#0f172a",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 8,
  },
  joinButton: {
    backgroundColor: "#0f172a", // dark indigo
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  joinButtonText: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#fff" },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  hintText: { flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#64748b", lineHeight: 22 },
});

export default JoinGroupScreen;
