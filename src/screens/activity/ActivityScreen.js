import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
const RED = "#dc3545";

const ACTIVITIES = [
  { id: "1", description: "John added $20 for groceries", amount: "-$20", amountColor: RED, icon: "bed-outline" },
  { id: "2", description: "You settled with Bean", amount: "$10.00", amountColor: TEXT_PRIMARY, icon: "person-circle-outline" },
  { id: "3", description: "You settled with Bean", amount: "-$10.00", amountColor: RED, icon: "airplane-outline" },
  { id: "4", description: "John added $20 for groceries", amount: "-$20", amountColor: RED, icon: "bed-outline" },
  { id: "5", description: "You settled with Bean", amount: "-$1.00", amountColor: RED, icon: "person-circle-outline" },
];

const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

const ActivityScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Together</Text>
          <View style={styles.profileBtn}>
            <Ionicons name="person-circle-outline" size={36} color={TEAL} />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={[styles.listCard, cardShadow]}>
            {ACTIVITIES.map((item, index) => (
              <View
                key={item.id}
                style={[styles.row, index === ACTIVITIES.length - 1 && styles.rowLast]}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon} size={20} color={TEAL} />
                </View>
                <Text style={styles.rowDescription} numberOfLines={1}>
                  {item.description}
                </Text>
                <Text style={[styles.rowAmount, { color: item.amountColor }]}>{item.amount}</Text>
              </View>
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
  headerTitle: { fontSize: 20, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  profileBtn: {},
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
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
    backgroundColor: "#e0f2ef",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  rowDescription: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: TEXT_PRIMARY,
  },
  rowAmount: { fontSize: 15, fontFamily: "Poppins_600SemiBold" },
});

export default ActivityScreen;
