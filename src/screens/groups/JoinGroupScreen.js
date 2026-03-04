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
          <Ionicons name="information-circle-outline" size={20} color={TEAL} style={{ marginRight: 8 }} />
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
    paddingVertical: 8,
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
  appName: { fontSize: 18, fontFamily: "Poppins_400Regular", color: "#4a4a4a", marginBottom: 8 },
  screenTitle: { fontSize: 24, fontFamily: "Poppins_600SemiBold", color: "#333" },
  joinSection: { marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 6,
  },
  joinButton: {
    backgroundColor: TEAL,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  joinButtonText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6faf7",
    borderRadius: 12,
    padding: 16,
  },
  hintText: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular", color: "#1a1a1a" },
});

export default JoinGroupScreen;
