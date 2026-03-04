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
import { SafeAreaView } from "react-native-safe-area-context";
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
} from "firebase/firestore";
import { showSuccessToast, showErrorToast } from "../../utils/toastWithSound";

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

const GroupDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
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

  useFocusEffect(loadGroupData);

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

  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{groupName}</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={TEAL} style={{ marginTop: 60 }} />
        ) : (
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
              <Text style={styles.inviteHint}>Share this to invite others</Text>
            </View>

            {/* Total */}
            <View style={[styles.totalCard, cardShadow]}>
              <Text style={styles.totalLabel}>Total Expenses</Text>
              <Text style={styles.totalAmount}>₹{totalExpenses.toFixed(2)}</Text>
            </View>

            {/* Members */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Members ({members.length})</Text>
              <TouchableOpacity onPress={openAddMember} style={styles.addMemberBtn} activeOpacity={0.7}>
                <Ionicons name="person-add-outline" size={18} color={TEAL} />
                <Text style={styles.addMemberText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.card, cardShadow]}>
              {members.map((m, index) => (
                <View
                  key={m.uid}
                  style={[styles.memberRow, index === members.length - 1 && styles.rowLast]}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{m.name?.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {m.name}
                      {m.uid === group?.createdBy ? "  👑" : ""}
                      {m.uid === currentUser.uid ? "  (you)" : ""}
                    </Text>
                    <Text style={styles.memberEmail}>{m.email}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Expenses */}
            <Text style={styles.sectionTitle}>Expenses</Text>
            {expenses.length === 0 ? (
              <View style={styles.emptyExpenses}>
                <Ionicons name="receipt-outline" size={48} color={TEAL_LIGHT} />
                <Text style={styles.emptyText}>No expenses yet</Text>
              </View>
            ) : (
              <View style={[styles.card, cardShadow]}>
                {expenses.map((exp, index) => (
                  <View
                    key={exp.id}
                    style={[styles.expenseRow, index === expenses.length - 1 && styles.rowLast]}
                  >
                    <View style={styles.expenseIcon}>
                      <Ionicons name="receipt-outline" size={20} color={TEAL} />
                    </View>
                    <View style={styles.expenseInfo}>
                      <Text style={styles.expenseTitle}>{exp.title}</Text>
                      <Text style={styles.expenseMeta}>Paid by {exp.paidByName}</Text>
                    </View>
                    <Text style={styles.expenseAmount}>₹{parseFloat(exp.amount).toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Add Expense Button */}
            <TouchableOpacity
              style={[styles.addExpenseBtn, cardShadow]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("AddExpense", { groupId, members })}
            >
              <Ionicons name="add-circle-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.addExpenseBtnText}>Add Expense</Text>
            </TouchableOpacity>
          </ScrollView>
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
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

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
  inviteHint: { fontSize: 12, fontFamily: "Poppins_400Regular", color: TEXT_SECONDARY },

  totalCard: {
    backgroundColor: TEAL,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  totalLabel: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.8)" },
  totalAmount: { fontSize: 32, fontFamily: "Poppins_700Bold", color: "#fff", marginTop: 4 },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  addMemberBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addMemberText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: TEAL },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowLast: { borderBottomWidth: 0 },
  memberAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: TEAL_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  memberAvatarText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  memberEmail: { fontSize: 12, fontFamily: "Poppins_400Regular", color: TEXT_SECONDARY, marginTop: 2 },

  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e6faf7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  expenseInfo: { flex: 1 },
  expenseTitle: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  expenseMeta: { fontSize: 12, fontFamily: "Poppins_400Regular", color: TEXT_SECONDARY, marginTop: 2 },
  expenseAmount: { fontSize: 16, fontFamily: "Poppins_700Bold", color: TEXT_PRIMARY },

  emptyExpenses: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 15, fontFamily: "Poppins_400Regular", color: TEXT_SECONDARY },

  addExpenseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TEAL,
    paddingVertical: 18,
    borderRadius: 14,
  },
  addExpenseBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#fff" },

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
