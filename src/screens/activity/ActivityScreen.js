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
import { useFocusEffect } from "@react-navigation/native";
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
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
  android: { elevation: 2 },
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

const ActivityScreen = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchActivityData = async () => {
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

          // 2. Fetch expenses from every group
          for (const gId of groupIds) {
            const expSnapshot = await getDocs(collection(db, "groups", gId, "expenses"));
            expSnapshot.docs.forEach((d) => {
              const data = d.data();
              const isPayer = data.paidBy === user.uid;
              const isSplit = data.splitAmong?.includes(user.uid);

              if (isPayer || isSplit) {
                const totalSplitPeople = data.splitAmong?.length || 1;
                const costPerPerson = data.amount / totalSplitPeople;
                let myNetTransaction = 0;

                if (isPayer && isSplit) {
                  myNetTransaction = data.amount - costPerPerson;
                } else if (isPayer && !isSplit) {
                  myNetTransaction = data.amount;
                } else if (!isPayer && isSplit) {
                  myNetTransaction = -costPerPerson;
                }

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

          setActivities(allExpenses);
        } catch (err) {
          console.error("Error fetching activity data:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchActivityData();
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
          <View style={styles.profileBtn}>
            <Ionicons name="person-circle-outline" size={36} color={TEAL} />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>ALL ACTIVITY</Text>
          </View>
          
          {loading ? (
             <ActivityIndicator size="large" color="#14b8a6" style={{ marginTop: 40 }} />
          ) : activities.length === 0 ? (
             <View style={[styles.listCard, { padding: 40, alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 20 }]}>
                <Ionicons name="receipt-outline" size={48} color="#e5e7eb" />
                <Text style={{ marginTop: 12, color: TEXT_SECONDARY, fontFamily: "Poppins_400Regular" }}>No activity yet.</Text>
             </View>
          ) : (
            <View style={styles.listCard}>
              {activities.map((item, index) => {
                const isPositive = item.netAmount >= 0;
                const dateObj = new Date(item.createdAt);
                const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                
                return (
                  <View
                    key={item.id}
                    style={styles.activityRow}
                  >
                    <Avatar name={item.paidByName} />
                    <View style={styles.activityInfo}>
                       <Text style={styles.activityName} numberOfLines={1}>
                         {item.title}
                       </Text>
                       <Text style={styles.activitySubtitle}>
                         {item.paidByName} • {dateStr}
                       </Text>
                    </View>
                    <View style={[styles.amountBadge, isPositive ? { backgroundColor: "#ccfbf1" } : { backgroundColor: "#fee2e2" }]}>
                      <Text style={[styles.activityAmount, isPositive ? { color: "#0f766e" } : { color: "#ef4444" }]}>
                        {isPositive ? "+" : "-"}₹{Math.abs(item.netAmount).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
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
  headerTitle: { fontSize: 20, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  profileBtn: {},
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
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
    // Wrapper
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
    ...cardShadow,
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
  },
  activityInfo: { flex: 1, marginRight: 10 },
  activityName: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#0f172a",
    letterSpacing: -0.2,
  },
  activitySubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#64748b",
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

export default ActivityScreen;
