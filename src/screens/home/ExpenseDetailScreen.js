import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getFirestore, doc, deleteDoc, getDoc } from "firebase/firestore";
import { showSuccessToast, showErrorToast } from "../../utils/toastWithSound";
import { formatExpenseDateTime } from "../../utils/date";
import { getPersonShare } from "../../utils/balances";
import { ReceiptImage } from "../../utils/receipt";

const BG = "#f8fafc";
const CARD_BG = "#fff";
const TEXT_PRIMARY = "#0f172a";
const TEXT_SECONDARY = "#64748b";

const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

const ExpenseDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, members, expenseId, expense: passedExpense } = route.params;
  const [expense, setExpense] = useState(passedExpense || null);
  const [loading, setLoading] = useState(!passedExpense?.receiptUrl);

  useEffect(() => {
    const load = async () => {
      const id = expenseId || passedExpense?.id;
      if (!id) return;
      try {
        const db = getFirestore();
        const snap = await getDoc(doc(db, "groups", groupId, "expenses", id));
        if (snap.exists()) {
          setExpense({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupId, expenseId, passedExpense?.id]);

  const deleteExpense = () => {
    Alert.alert("Delete expense?", "This will update group balances.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const db = getFirestore();
            await deleteDoc(doc(db, "groups", groupId, "expenses", expense.id));
            showSuccessToast("Expense deleted");
            navigation.goBack();
          } catch (err) {
            showErrorToast("Could not delete expense.");
            console.error(err);
          }
        },
      },
    ]);
  };

  if (loading || !expense) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ActivityIndicator size="large" color="#0f766e" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const splitType = expense.splitType || "equal";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Expense</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, cardShadow]}>
          <Text style={styles.title}>{expense.title}</Text>
          <Text style={styles.amount}>₹{parseFloat(expense.amount || 0).toFixed(2)}</Text>
          <Text style={styles.meta}>Paid by {expense.paidByName}</Text>
          {!!formatExpenseDateTime(expense.createdAt) && (
            <Text style={styles.meta}>{formatExpenseDateTime(expense.createdAt)}</Text>
          )}
          <Text style={styles.meta}>Category · {expense.category || "Other"}</Text>
          {!!expense.note && <Text style={styles.note}>{expense.note}</Text>}
        </View>

        {expense.receiptUrl ? (
          <View style={styles.receiptWrap}>
            <ReceiptImage uri={expense.receiptUrl} height={240} />
          </View>
        ) : (
          <View style={styles.noPhoto}>
            <Ionicons name="image-outline" size={28} color="#94a3b8" />
            <Text style={styles.noPhotoText}>No receipt photo</Text>
          </View>
        )}

        <Text style={styles.section}>Who shares this</Text>
        <View style={[styles.card, cardShadow]}>
          {(expense.splitAmong || []).map((uid, index, arr) => {
            const member = members.find((m) => m.uid === uid);
            const share = getPersonShare(expense, uid);
            const extra =
              splitType === "percent" && expense.shares?.[uid] != null
                ? ` (${expense.shares[uid]}%)`
                : "";
            return (
              <View key={uid} style={[styles.shareRow, index === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.shareName}>{member?.name || "Member"}</Text>
                <Text style={styles.shareAmt}>₹{share.toFixed(2)}{extra}</Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.replace("AddExpense", { groupId, members, expense })}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.editBtnText}>Edit Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={deleteExpense}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
          <Text style={styles.deleteBtnText}>Delete Expense</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: CARD_BG,
    borderBottomWidth: 1, borderBottomColor: "#eee",
  },
  backBtn: { padding: 8 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  content: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: CARD_BG, borderRadius: 16, padding: 20, marginBottom: 16 },
  title: { fontSize: 22, fontFamily: "Poppins_700Bold", color: TEXT_PRIMARY },
  amount: { fontSize: 32, fontFamily: "Poppins_700Bold", color: "#0f766e", marginTop: 8 },
  meta: { fontSize: 14, fontFamily: "Poppins_400Regular", color: TEXT_SECONDARY, marginTop: 6 },
  note: { fontSize: 14, fontFamily: "Poppins_400Regular", color: TEXT_PRIMARY, marginTop: 12 },
  receiptWrap: { marginBottom: 16, alignItems: "center" },
  noPhoto: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    paddingVertical: 28,
    marginBottom: 16,
    gap: 8,
  },
  noPhotoText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: TEXT_SECONDARY },
  section: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: TEXT_SECONDARY, marginBottom: 10 },
  shareRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  shareName: { fontSize: 15, fontFamily: "Poppins_400Regular", color: TEXT_PRIMARY, flex: 1, marginRight: 8 },
  shareAmt: { fontSize: 15, fontFamily: "Poppins_700Bold", color: TEXT_PRIMARY },
  editBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#0f172a", paddingVertical: 16, borderRadius: 16, marginBottom: 12,
  },
  editBtnText: { color: "#fff", fontSize: 16, fontFamily: "Poppins_700Bold" },
  deleteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#fff", paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: "#fecaca",
  },
  deleteBtnText: { color: "#ef4444", fontSize: 16, fontFamily: "Poppins_700Bold" },
});

export default ExpenseDetailScreen;
