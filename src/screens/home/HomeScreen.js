import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const TEAL = "#1a9f8f";
const TEAL_LIGHT = "#2bb7a8";
const BG = "#f5f7fa";
const CARD_BG = "#fff";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#6b7280";
const RED = "#dc3545";

const ACTIVITY_DATA = [
  { id: "1", name: "John Sanloen", subtitle: "Recent Activity", amount: "-$20.00", amountColor: RED },
  { id: "2", name: "Bean Peshey", subtitle: "Recent Activity", amount: "-$10.00", amountColor: TEAL_LIGHT },
  { id: "3", name: "John Baclaed", subtitle: "Jun 23, 2021", amount: "-$10.00", amountColor: TEAL_LIGHT },
  { id: "4", name: "John Pesney", subtitle: "Mar 1, 2021", amount: "-$20.00", amountColor: RED },
  { id: "5", name: "John Sanloen", subtitle: "Ace 7, 2021", amount: "-$10.00", amountColor: TEAL_LIGHT },
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

const ActivityItem = ({ item }) => (
  <View style={styles.activityRow}>
    <Avatar name={item.name} />
    <View style={styles.activityInfo}>
      <Text style={styles.activityName}>{item.name}</Text>
      <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
    </View>
    <Text style={[styles.activityAmount, { color: item.amountColor }]}>{item.amount}</Text>
  </View>
);

const HomeScreen = () => {
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
          <View style={[styles.balanceCard, cardShadow]}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              <Text style={styles.balanceValue}>$150.00</Text>
              <Text style={styles.balanceOwed}> owed</Text>
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Recent activity</Text>
          <View style={[styles.listCard, cardShadow]}>
            {ACTIVITY_DATA.map((item) => (
              <ActivityItem key={item.id} item={item} />
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
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_PRIMARY,
  },
  profileBtn: { padding: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  balanceCard: {
    backgroundColor: "#e0f2ef",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 28,
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: TEXT_SECONDARY,
    marginBottom: 6,
  },
  balanceAmount: { fontSize: 28, fontFamily: "Poppins_600SemiBold" },
  balanceValue: { color: TEAL },
  balanceOwed: { color: TEXT_PRIMARY },
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
    paddingVertical: 8,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
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
  activityInfo: { flex: 1 },
  activityName: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_PRIMARY,
  },
  activitySubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  activityAmount: { fontSize: 16, fontFamily: "Poppins_600SemiBold" },
});

export default HomeScreen;
