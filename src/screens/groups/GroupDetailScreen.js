import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { auth } from "../../../firbase";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  arrayUnion,
  orderBy,
  query,
  deleteDoc,
} from "firebase/firestore";
import * as Clipboard from "expo-clipboard";
import { showSuccessToast, showErrorToast } from "../../utils/toastWithSound";
import { computeMemberBalances, isSettlement } from "../../utils/balances";
import { formatExpenseDateTime } from "../../utils/date";

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

const GroupDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { groupId, groupName } = route.params;

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add member modal
  const [showAddMember, setShowAddMember] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

  const currentUser = auth.currentUser;
  const db = getFirestore();
  const [copied, setCopied] = useState(false);

  const copyInviteCode = async () => {
    const code = group?.inviteCode;
    if (!code) {
      showErrorToast("Invite code not available.");
      return;
    }
    try {
      await Clipboard.setStringAsync(code);
      setCopied(true);
      showSuccessToast("Invite code copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showErrorToast("Could not copy code.");
    }
  };

  const loadGroupData = useCallback(async () => {
    setLoading(true);
    try {
      // Load group doc
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (!groupDoc.exists()) return;
      const groupData = groupDoc.data();
      setGroup(groupData);

      // Load member names
      const memberDocs = await Promise.all(
        groupData.members.map((uid) => getDoc(doc(db, "users", uid)))
      );
      setMembers(
        memberDocs.filter((d) => d.exists()).map((d) => ({ uid: d.id, ...d.data() }))
      );

      // Load expenses
      const expQuery = query(
        collection(db, "groups", groupId, "expenses"),
        orderBy("createdAt", "desc")
      );
      const expSnapshot = await getDocs(expQuery);
      setExpenses(expSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error loading group:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      loadGroupData();
    }, [loadGroupData])
  );

  // Load friends not already in the group
  const openAddMember = async () => {
    setShowAddMember(true);
    setFriendsLoading(true);
    try {
      const myDoc = await getDoc(doc(db, "users", currentUser.uid));
      const friendUids = myDoc.data()?.friends || [];
      const currentMemberUids = group?.members || [];

      const eligibleUids = friendUids.filter((uid) => !currentMemberUids.includes(uid));
      if (eligibleUids.length === 0) {
        setFriends([]);
        return;
      }

      const friendDocs = await Promise.all(
        eligibleUids.map((uid) => getDoc(doc(db, "users", uid)))
      );
      setFriends(
        friendDocs.filter((d) => d.exists()).map((d) => ({ uid: d.id, ...d.data() }))
      );
    } catch (err) {
      console.error("Error loading friends:", err);
    } finally {
      setFriendsLoading(false);
    }
  };

  const addMemberToGroup = async (friendUid, friendName) => {
    try {
      await updateDoc(doc(db, "groups", groupId), {
        members: arrayUnion(friendUid),
      });
      setShowAddMember(false);
      showSuccessToast(`${friendName} added to group!`);
      loadGroupData();
    } catch (err) {
      showErrorToast("Failed to add member.");
      console.error(err);
    }
  };

  const regularExpenses = expenses.filter((e) => !isSettlement(e));
  const settlements = expenses.filter((e) => isSettlement(e));

  // 1. Group Total: Sum ALL expenses EXCEPT settlements
  const totalExpenses = regularExpenses.reduce(
    (sum, e) => sum + (parseFloat(e.amount) || 0),
    0
  );

  // 2. Individual Member Balances
  // Positive = Owed money back
  // Negative = Owes someone else
  const memberBalances = computeMemberBalances(members, expenses);

  const undoSettlement = (exp) => {
    Alert.alert(
      "Undo settlement?",
      "This will remove this payment from the group balance.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Undo",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "groups", groupId, "expenses", exp.id));
              showSuccessToast("Settlement undone");
              loadGroupData();
            } catch (err) {
              showErrorToast("Could not undo settlement.");
              console.error(err);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {groupName}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={TEAL} style={{ marginTop: 60 }} />
        ) : (
          <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Invite Code Card */}
            <View style={[styles.inviteCard, cardShadow]}>
              <Ionicons name="link-outline" size={20} color={TEAL} />
              <Text style={styles.inviteLabel}>Invite Code</Text>
              <Text style={styles.inviteCode}>{group?.inviteCode}</Text>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={copyInviteCode}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={copied ? "checkmark-circle-outline" : "copy-outline"}
                  size={18}
                  color="#0f766e"
                />
                <Text style={styles.copyBtnText}>{copied ? "Copied" : "Copy Code"}</Text>
              </TouchableOpacity>
              <Text style={styles.inviteHint}>Share this to invite others</Text>
            </View>

            {/* Group Total Summary Card */}
            <View style={[styles.splitCard, cardShadow]}>
              <View style={styles.splitRow}>
                <View style={styles.splitItem}>
                   <Text style={styles.splitLabel}>Group Spending</Text>
                   <Text style={styles.splitValueHighlighted}>₹{totalExpenses.toFixed(2)}</Text>
                </View>
              </View>
              <View style={styles.splitFooter}>
                <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.splitFooterText}>Total of all expenses (excluding settlement payments)</Text>
              </View>
            </View>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>MEMBERS ({members.length})</Text>
              <TouchableOpacity onPress={openAddMember} style={styles.addMemberBtn} activeOpacity={0.7}>
                <Ionicons name="person-add-outline" size={18} color="#0f766e" />
                <Text style={styles.addMemberText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.listCard}>
              {members.map((m, index) => {
                const bal = memberBalances[m.uid] || 0;
                const isSettled = Math.abs(bal) < 0.01;
                const getsBack = bal > 0.01;

                return (
                  <View key={m.uid} style={styles.itemCard}>
                    <Avatar name={m.name} />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {m.name}
                        {m.uid === group?.createdBy ? "  👑" : ""}
                        {m.uid === currentUser.uid ? "  (you)" : ""}
                      </Text>
                      <Text style={styles.itemMeta} numberOfLines={1}>{m.email}</Text>
                    </View>
                    
                    <View style={[
                      styles.netBadge,
                      isSettled ? { backgroundColor: "#f3f4f6" } : getsBack ? { backgroundColor: "#ccfbf1" } : { backgroundColor: "#fee2e2" }
                    ]}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.netBadgeText,
                          isSettled ? { color: "#64748b" } : getsBack ? { color: "#0f766e" } : { color: "#ef4444" }
                        ]}
                      >
                        {isSettled ? "Settled" : getsBack ? `Gets ₹${Math.abs(bal).toFixed(2)}` : `Owes ₹${Math.abs(bal).toFixed(2)}`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Expenses */}
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>EXPENSES</Text>
            {regularExpenses.length === 0 ? (
              <View style={[styles.itemCard, { paddingVertical: 40, justifyContent: "center", alignItems: "center", flexDirection: "column" }]}>
                <Ionicons name="receipt-outline" size={48} color="#e2e8f0" />
                <Text style={styles.emptyText}>No expenses yet</Text>
              </View>
            ) : (
              <View style={styles.listCard}>
                {regularExpenses.map((exp) => (
                  <TouchableOpacity
                    key={exp.id}
                    style={styles.itemCard}
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate("ExpenseDetail", { groupId, members, expenseId: exp.id })
                    }
                  >
                    <View style={styles.expenseIcon}>
                      <Ionicons name="receipt-outline" size={20} color="#0f766e" />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{exp.title}</Text>
                      <Text style={styles.itemMeta}>
                        {exp.paidByName}
                        {exp.category ? ` · ${exp.category}` : ""}
                      </Text>
                      {!!formatExpenseDateTime(exp.createdAt) && (
                        <Text style={styles.itemMeta}>{formatExpenseDateTime(exp.createdAt)}</Text>
                      )}
                    </View>
                    <View style={styles.settlementActions}>
                      <Text style={styles.expenseAmount}>₹{parseFloat(exp.amount).toFixed(2)}</Text>
                      <Text style={styles.editText}>Details</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>SETTLEMENTS</Text>
            {settlements.length === 0 ? (
              <View style={[styles.itemCard, { paddingVertical: 28, justifyContent: "center", alignItems: "center", flexDirection: "column" }]}>
                <Ionicons name="cash-outline" size={40} color="#e2e8f0" />
                <Text style={styles.emptyText}>No settlements yet</Text>
              </View>
            ) : (
              <View style={styles.listCard}>
                {settlements.map((exp) => {
                  const receiverUid = exp.splitAmong?.[0];
                  const receiver = members.find((m) => m.uid === receiverUid);
                  const canUndo = exp.paidBy === currentUser?.uid;
                  return (
                    <View key={exp.id} style={styles.itemCard}>
                      <View style={[styles.expenseIcon, styles.settlementIcon]}>
                        <Ionicons name="cash-outline" size={20} color="#0f766e" />
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{exp.title || "Settle Up"}</Text>
                        <Text style={styles.itemMeta}>
                          {exp.paidByName} paid {receiver?.name || "member"}
                        </Text>
                        {!!formatExpenseDateTime(exp.createdAt) && (
                          <Text style={styles.itemMeta}>{formatExpenseDateTime(exp.createdAt)}</Text>
                        )}
                      </View>
                      <View style={styles.settlementActions}>
                        <Text style={styles.expenseAmount}>₹{parseFloat(exp.amount).toFixed(2)}</Text>
                        <View style={styles.actionLinks}>
                          {canUndo && (
                            <TouchableOpacity
                              onPress={() =>
                                navigation.navigate("Settle", { groupId, settlement: exp })
                              }
                              activeOpacity={0.7}
                            >
                              <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                          )}
                          {canUndo && (
                            <TouchableOpacity onPress={() => undoSettlement(exp)} activeOpacity={0.7}>
                              <Text style={styles.undoText}>Undo</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
          <View style={[styles.stickyBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.addExpenseBtn, buttonShadow]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("AddExpense", { groupId, members })}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnText}>Add Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.settleBtn, buttonShadow]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("Settle", { groupId })}
            >
              <Text style={styles.settleBtnText}>💸 Settle Up</Text>
            </TouchableOpacity>
          </View>
          </>
        )}

        {/* Add Member Modal */}
        <Modal visible={showAddMember} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Friend to Group</Text>
                <TouchableOpacity onPress={() => setShowAddMember(false)}>
                  <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
                </TouchableOpacity>
              </View>
              {friendsLoading ? (
                <ActivityIndicator size="large" color={TEAL} style={{ marginTop: 32 }} />
              ) : friends.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Text style={styles.emptyText}>All your friends are already in this group!</Text>
                </View>
              ) : (
                <FlatList
                  data={friends}
                  keyExtractor={(f) => f.uid}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.friendRow}
                      onPress={() => addMemberToGroup(item.uid, item.name)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberAvatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{item.name}</Text>
                        <Text style={styles.memberEmail}>{item.email}</Text>
                      </View>
                      <Ionicons name="add-circle-outline" size={24} color={TEAL} />
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: { padding: 8, flexShrink: 0 },
  headerSpacer: { width: 40, flexShrink: 0 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_PRIMARY,
    textAlign: "center",
    marginHorizontal: 8,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },

  inviteCard: {
    backgroundColor: "#e6faf7",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    gap: 4,
  },
  inviteLabel: { fontSize: 13, fontFamily: "Poppins_400Regular", color: TEXT_SECONDARY },
  inviteCode: { fontSize: 28, fontFamily: "Poppins_700Bold", color: TEAL, letterSpacing: 8 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ccfbf1",
    borderWidth: 1,
    borderColor: "#99f6e4",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 8,
    gap: 6,
  },
  copyBtnText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0f766e" },
  inviteHint: { fontSize: 12, fontFamily: "Poppins_400Regular", color: TEXT_SECONDARY },

  splitCard: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  splitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  splitItem: {
    flex: 1,
    alignItems: "center",
  },
  splitLabel: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: "#94a3b8",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  splitValueHighlighted: {
    fontSize: 40,
    fontFamily: "Poppins_700Bold",
    color: "#ffffff",
    lineHeight: 48,
  },
  splitFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    gap: 6,
  },
  splitFooterText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#94a3b8",
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#64748b",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  addMemberBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addMemberText: { fontSize: 13, fontFamily: "Poppins_700Bold", color: "#0f766e", letterSpacing: 0.5 },

  listCard: {
    gap: 12,
    marginBottom: 24,
  },
  itemCard: {
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: { fontSize: 18, fontFamily: "Poppins_700Bold" },
  itemInfo: { flex: 1, minWidth: 0, marginRight: 12 },
  itemName: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#0f172a", letterSpacing: -0.2 },
  itemMeta: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#64748b", marginTop: 2 },
  
  netBadge: {
    maxWidth: "42%",
    flexShrink: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  netBadgeText: { fontSize: 13, fontFamily: "Poppins_700Bold", letterSpacing: 0.3 },

  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ccfbf1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  expenseAmount: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0f172a", letterSpacing: -0.5 },
  settlementIcon: { backgroundColor: "#e0f2fe" },
  settlementActions: { alignItems: "flex-end" },
  actionLinks: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  editText: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#0f766e" },
  undoText: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#ef4444" },

  emptyText: { fontSize: 15, fontFamily: "Poppins_400Regular", color: "#64748b", marginTop: 12 },

  stickyBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: CARD_BG,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
  },
  addExpenseBtn: {
    backgroundColor: "#0f172a",
  },
  actionBtnText: { fontSize: 15, fontFamily: "Poppins_700Bold", color: "#fff" },
  settleBtn: {
    backgroundColor: "#ccfbf1",
    borderWidth: 1,
    borderColor: "#99f6e4",
  },
  settleBtnText: { fontSize: 15, fontFamily: "Poppins_700Bold", color: "#0f766e" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  modalEmpty: { padding: 32, alignItems: "center" },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
});

export default GroupDetailScreen;
