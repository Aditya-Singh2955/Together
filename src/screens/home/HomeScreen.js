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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { auth } from "../../../firbase";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { playOuchSound } from "../../utils/toastWithSound";

const TEAL = "#1a9f8f";
const TEAL_LIGHT = "#2bb7a8";
const BG = "#f5f7fa";
const CARD_BG = "#fff";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#6b7280";
const RED = "#dc3545";

const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
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

const Avatar = ({ name }) => {
  const bgColor = getColorFromName(name);
  return (
    <View style={[styles.avatar, { backgroundColor: bgColor }]}>
      <Text style={[styles.avatarText, { color: "#fff" }]}>{name ? name.charAt(0).toUpperCase() : "?"}</Text>
    </View>
  );
};

const ActivityItem = ({ item }) => {
  const isPositive = item.netAmount >= 0;
  
  // Format dates cleanly
  const dateObj = new Date(item.createdAt);
  const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  
  return (
    <View style={styles.activityRow}>
      <Avatar name={item.paidByName} />
      <View style={styles.activityInfo}>
        <Text style={styles.activityName} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.activitySubtitle} numberOfLines={1}>
          {item.paidByName} • {dateStr}
        </Text>
      </View>
      <View style={[styles.amountBadge, isPositive ? { backgroundColor: "#ccfbf1" } : { backgroundColor: "#ffe3e3" }]}>
        <Text style={[styles.activityAmount, isPositive ? { color: "#0f766e" } : { color: "#e03131" }]}>
          {isPositive ? "+" : "-"}₹{Math.abs(item.netAmount).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [totalBalance, setTotalBalance] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchDashboardData = async () => {
        setLoading(true);
        try {
          const db = getFirestore();
          const user = auth.currentUser;
          if (!user) return;

          // 1. Fetch all groups the user is in
          const groupsQuery = query(
            collection(db, "groups"),
            where("members", "array-contains", user.uid)
          );
          const groupsSnapshot = await getDocs(groupsQuery);
          const groupIds = groupsSnapshot.docs.map((d) => d.id);

          let allExpenses = [];
          let netBalance = 0;

          // 2. Fetch expenses from every group
          for (const gId of groupIds) {
            const expSnapshot = await getDocs(collection(db, "groups", gId, "expenses"));
            expSnapshot.docs.forEach((d) => {
              const data = d.data();
              // Only process expenses where the user is either the payer or included in the split
              const isPayer = data.paidBy === user.uid;
              const isSplit = data.splitAmong?.includes(user.uid);

              if (isPayer || isSplit) {
                // Determine user's share of this expense
                const totalSplitPeople = data.splitAmong?.length || 1;
                const costPerPerson = data.amount / totalSplitPeople;
                
                let myNetTransaction = 0;

                if (isPayer && isSplit) {
                  // I paid, but I'm also in the split. 
                  // E.g., I paid $30 for 3 people (including me). I am owed $20.
                  myNetTransaction = data.amount - costPerPerson;
                } else if (isPayer && !isSplit) {
                  // I paid, but I'm not in the split for some reason.
                  // I am owed the full amount.
                  myNetTransaction = data.amount;
                } else if (!isPayer && isSplit) {
                  // Someone else paid, and I'm in the split.
                  // I owe my share.
                  myNetTransaction = -costPerPerson;
                }

                netBalance += myNetTransaction;

                allExpenses.push({
                  id: d.id,
                  groupId: gId,
                  netAmount: myNetTransaction,
                  ...data,
                });
              }
            });
          }

          // 3. Sort expenses by date (newest first)
          allExpenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setTotalBalance(netBalance);
          setRecentActivities(allExpenses.slice(0, 5)); // Keep only the latest 5 for Home screen
        } catch (err) {
          console.error("Error fetching home data:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
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
          <TouchableOpacity style={styles.profileBtn} activeOpacity={0.7} onPress={() => navigation.navigate("Profile")}>
            <Ionicons name="person-circle-outline" size={36} color={TEAL} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
             <ActivityIndicator size="large" color={TEAL} style={{ marginTop: 40 }} />
          ) : (
            <>
              <View style={[styles.balanceCard, totalBalance < 0 && { backgroundColor: "#fee2e2", borderColor: "#fca5a5" }]}>
                <View style={styles.balanceHeader}>
                   <Text style={[styles.balanceLabel, totalBalance < 0 && { color: "#ef4444" }]}>TOTAL BALANCE</Text>
                   <View style={[styles.statusBadge, totalBalance < 0 ? { backgroundColor: "#fecaca" } : { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                      <Text style={[styles.statusText, totalBalance < 0 ? { color: "#b91c1c" } : { color: "#ccfbf1" }]}>
                        {totalBalance === 0 ? "All Good" : totalBalance > 0 ? "Getting Paid" : "In Debt"}
                      </Text>
                   </View>
                </View>
                <Text style={styles.balanceAmount}>
                  <Text style={[styles.balanceCurrency, totalBalance < 0 && { color: "#ef4444" }]}>₹</Text>
                  <Text style={[styles.balanceValue, totalBalance < 0 && { color: "#ef4444" }]}>
                    {Math.abs(totalBalance).toFixed(2)}
                  </Text>
                </Text>
              </View>

              <TouchableOpacity 
                 style={styles.settleBtn}
                 activeOpacity={0.85}
                 onPress={() => navigation.navigate("Groups", { screen: "Settle", initial: false })}
              >
                 <Text style={styles.settleBtnText}>💸 SETTLE UP</Text>
                 <View style={styles.settleIconCircle}>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                 </View>
              </TouchableOpacity>

              <View style={styles.sectionHeader}>
                 <Text style={styles.sectionTitle}>LATEST ACTIVITY</Text>
              </View>
              
              {recentActivities.length === 0 ? (
                <View style={[styles.listCard, { padding: 40, alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" }]}>
                   <Ionicons name="receipt-outline" size={48} color="#e5e7eb" />
                   <Text style={{ marginTop: 12, color: TEXT_SECONDARY, fontFamily: "Poppins_400Regular" }}>No recent activity.</Text>
                </View>
              ) : (
                <View style={styles.listCard}>
                  {recentActivities.map((item) => (
                    <ActivityItem key={item.id} item={item} />
                  ))}
                </View>
              )}
            </>
          )}
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
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_PRIMARY,
  },
  profileBtn: { padding: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  balanceCard: {
    backgroundColor: "#0f172a", // sleek dark blue
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: "#94a3b8", // subtle slate
    letterSpacing: 1.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  balanceAmount: { 
    flexDirection: "row",
    alignItems: "flex-start",
  },
  balanceCurrency: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: "#14b8a6", // vibrant teal
    marginTop: 4,
    marginRight: 4,
  },
  balanceValue: { 
    fontSize: 48, 
    fontFamily: "Poppins_700Bold",
    color: "#ffffff",
    lineHeight: 56,
  },
  settleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ccfbf1", // very soft teal 
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#99f6e4",
  },
  settleBtnText: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    color: "#0f766e", // dark teal
    letterSpacing: 1,
  },
  settleIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0f766e",
    alignItems: "center",
    justifyContent: "center",
  },
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
  listCard: {
    // Spacer wrapper
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#1a1a1a",
  },
  activityInfo: { flex: 1, marginRight: 10 },
  activityName: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#0f172a", // Dark slate for strong readability
    letterSpacing: -0.2,
  },
  activitySubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#a1a1aa",
    marginTop: 2,
  },
  amountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activityAmount: { 
    fontSize: 14, 
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
