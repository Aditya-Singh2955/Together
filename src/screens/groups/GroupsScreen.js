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
const TEAL_LIGHT = "#2bb7a8";
const BG = "#f5f7fa";
const CARD_BG = "#fff";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#6b7280";

const GROUPS = [
  { id: "1", name: "Roommates", icon: "bed-outline", color: TEAL_LIGHT },
  { id: "2", name: "Trip", icon: "airplane-outline", color: TEXT_SECONDARY },
  { id: "3", name: "Dinner Club", icon: "people-outline", color: TEXT_SECONDARY },
  { id: "4", name: "Roommatis", icon: "home-outline", color: TEAL_LIGHT },
];

const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

const GroupsScreen = () => {
  const navigation = useNavigation();

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
          <TouchableOpacity
            style={[styles.joinBtn, cardShadow]}
            onPress={() => navigation.navigate("JoinGroup")}
            activeOpacity={0.85}
          >
            <Ionicons name="link-outline" size={20} color={TEAL} style={styles.joinBtnIcon} />
            <Text style={styles.joinBtnText}>Join a Group</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Your Groups</Text>
          <View style={[styles.listCard, cardShadow]}>
            {GROUPS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.row, index === GROUPS.length - 1 && styles.rowLast]}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={22} color="#fff" />
                </View>
                <Text style={styles.rowLabel}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.primaryBtn, cardShadow]} activeOpacity={0.85}>
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
  profileBtn: { padding: 4 },
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
  listCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowLast: { borderBottomWidth: 0 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_PRIMARY,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TEAL,
    paddingVertical: 18,
    borderRadius: 14,
  },
  primaryBtnIcon: { marginRight: 8 },
  primaryBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#fff" },
});

export default GroupsScreen;
