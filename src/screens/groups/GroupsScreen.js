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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { auth } from "../../../firbase";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { playOuchSound } from "../../utils/toastWithSound";

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

const ICON_OPTIONS = [
  "bed-outline", "airplane-outline", "people-outline",
  "home-outline", "cart-outline", "restaurant-outline",
  "car-outline", "gift-outline",
];

const GroupsScreen = () => {
  const navigation = useNavigation();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadGroups = async () => {
        setLoading(true);
        try {
          const db = getFirestore();
          const user = auth.currentUser;
          const q = query(
            collection(db, "groups"),
            where("members", "array-contains", user.uid)
          );
          const snapshot = await getDocs(q);
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setGroups(list);
        } catch (err) {
          console.error("Error loading groups:", err);
        } finally {
          setLoading(false);
        }
      };
      loadGroups();
    }, [])
  );

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
          <Ionicons name="people-outline" size={28} color={TEAL} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={[styles.joinBtn, buttonShadow]}
            onPress={() => navigation.navigate("JoinGroup")}
            activeOpacity={0.85}
          >
            <Ionicons name="link-outline" size={20} color="#0f766e" style={styles.joinBtnIcon} />
            <Text style={styles.joinBtnText}>JOIN WITH CODE</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>YOUR GROUPS</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#14b8a6" style={{ marginTop: 32 }} />
          ) : groups.length === 0 ? (
            <View style={[styles.groupCard, { padding: 40, alignItems: "center" }]}>
              <Ionicons name="people-outline" size={56} color="#e2e8f0" />
              <Text style={styles.emptyText}>No groups yet.</Text>
              <Text style={styles.emptySubText}>Create one or join with an invite code!</Text>
            </View>
          ) : (
            <View style={styles.listCard}>
              {groups.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.groupCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate("GroupDetail", { groupId: item.id, groupName: item.name })}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name={item.icon || "people-outline"} size={22} color="#0f766e" />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowLabel} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.rowSub}>{item.members?.length || 1} members</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, buttonShadow]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("CreateGroup")}
          >
            <Ionicons name="add-circle-outline" size={22} color="#fff" style={styles.primaryBtnIcon} />
            <Text style={styles.primaryBtnText}>Create New Group</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ccfbf1",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#99f6e4",
    marginBottom: 32,
  },
  joinBtnIcon: { marginRight: 8 },
  joinBtnText: { fontSize: 14, fontFamily: "Poppins_700Bold", color: "#0f766e", letterSpacing: 1 },
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
  emptyState: { alignItems: "center", marginTop: 40 },
  emptyText: { fontSize: 17, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY, marginTop: 16 },
  emptySubText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#64748b", marginTop: 6, textAlign: "center" },
  listCard: {
    gap: 12,
    marginBottom: 24,
  },
  groupCard: {
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
  rowInfo: { flex: 1, marginRight: 10 },
  rowLabel: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0f172a", letterSpacing: -0.2 },
  rowSub: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#64748b", marginTop: 2 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ccfbf1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 8,
  },
  primaryBtnIcon: { marginRight: 8 },
  primaryBtnText: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#fff" },
});

export default GroupsScreen;
