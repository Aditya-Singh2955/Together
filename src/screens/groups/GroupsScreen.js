import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { auth } from "../../../firbase";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

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
          <Text style={styles.headerTitle}>Together</Text>
          <Ionicons name="people-outline" size={28} color={TEAL} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={[styles.joinBtn, cardShadow]}
            onPress={() => navigation.navigate("JoinGroup")}
            activeOpacity={0.85}
          >
            <Ionicons name="link-outline" size={20} color={TEAL} style={styles.joinBtnIcon} />
            <Text style={styles.joinBtnText}>Join a Group</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Your Groups</Text>

          {loading ? (
            <ActivityIndicator size="large" color={TEAL} style={{ marginTop: 32 }} />
          ) : groups.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={56} color={TEAL_LIGHT} />
              <Text style={styles.emptyText}>No groups yet.</Text>
              <Text style={styles.emptySubText}>Create one or join with an invite code!</Text>
            </View>
          ) : (
            <View style={[styles.listCard, cardShadow]}>
              {groups.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.row, index === groups.length - 1 && styles.rowLast]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("GroupDetail", { groupId: item.id, groupName: item.name })}
                >
                  <View style={[styles.iconCircle, { backgroundColor: TEAL_LIGHT }]}>
                    <Ionicons name={item.icon || "people-outline"} size={22} color="#fff" />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowLabel}>{item.name}</Text>
                    <Text style={styles.rowSub}>{item.members?.length || 1} members</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, cardShadow]}
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
    paddingVertical: 16,
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
    backgroundColor: CARD_BG,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: TEAL_LIGHT,
    marginBottom: 24,
  },
  joinBtnIcon: { marginRight: 8 },
  joinBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: TEAL },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_PRIMARY,
    marginBottom: 14,
  },
  emptyState: { alignItems: "center", marginTop: 40 },
  emptyText: { fontSize: 17, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY, marginTop: 16 },
  emptySubText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: TEXT_SECONDARY, marginTop: 6, textAlign: "center" },
  listCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowLast: { borderBottomWidth: 0 },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  rowSub: { fontSize: 12, fontFamily: "Poppins_400Regular", color: TEXT_SECONDARY, marginTop: 2 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TEAL,
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 8,
  },
  primaryBtnIcon: { marginRight: 8 },
  primaryBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#fff" },
});

export default GroupsScreen;
