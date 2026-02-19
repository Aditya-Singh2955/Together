import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const TEAL = "#1a9f8f";
const TEAL_LIGHT = "#2bb7a8";
const BG = "#f5f7fa";
const CARD_BG = "#fff";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#6b7280";

const FRIENDS = [
  { id: "1", name: "John Sanlaen" },
  { id: "2", name: "Bean Peshey" },
  { id: "3", name: "John Baclaed" },
  { id: "4", name: "John Pesney" },
];

const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

const Avatar = ({ name }) => (
  <View style={styles.avatar}>
    <Text style={styles.avatarText}>{name.charAt(0)}</Text>
  </View>
);

const FriendsScreen = () => {
  const [search, setSearch] = useState("");

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
          <Text style={styles.sectionTitle}>My Friends</Text>
          <View style={[styles.searchWrap, cardShadow]}>
            <Ionicons name="search" size={20} color={TEXT_SECONDARY} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends"
              placeholderTextColor={TEXT_SECONDARY}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={[styles.listCard, cardShadow]}>
            {FRIENDS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.row, index === FRIENDS.length - 1 && styles.rowLast]}
                activeOpacity={0.7}
              >
                <Avatar name={item.name} />
                <Text style={styles.rowLabel}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.primaryBtn, cardShadow]} activeOpacity={0.85}>
            <Ionicons name="person-add-outline" size={22} color="#fff" style={styles.primaryBtnIcon} />
            <Text style={styles.primaryBtnText}>Add Friend</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_PRIMARY,
    marginBottom: 14,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: TEXT_PRIMARY,
    marginLeft: 12,
    paddingVertical: 0,
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: TEAL_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
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

export default FriendsScreen;
