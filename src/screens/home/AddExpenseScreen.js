import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../../../firbase";
import { getFirestore, collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { showSuccessToast, showErrorToast, playOuchSound } from "../../utils/toastWithSound";
import { receiptFromPickerAsset, ReceiptImage } from "../../utils/receipt";

const TEAL = "#0f172a";
const TEAL_LIGHT = "#1e293b";
const BG = "#f8fafc";
const CARD_BG = "#fff";
const TEXT_PRIMARY = "#0f172a";
const TEXT_SECONDARY = "#64748b";

const CATEGORIES = ["Food", "Travel", "Stay", "Shopping", "Bills", "Fun", "Other"];
const SPLIT_MODES = [
  { id: "equal", label: "Equal" },
  { id: "amount", label: "Amount" },
  { id: "percent", label: "%" },
];

const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

const equalShares = (uids, total, mode) => {
  const next = {};
  if (!uids.length) return next;
  if (mode === "percent") {
    const each = (100 / uids.length).toFixed(2);
    uids.forEach((uid) => { next[uid] = each; });
  } else if (mode === "amount") {
    const each = (total / uids.length).toFixed(2);
    uids.forEach((uid) => { next[uid] = each; });
  }
  return next;
};

const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, members, expense } = route.params;
  const isEdit = !!expense?.id;

  const [title, setTitle] = useState(expense?.title || "");
  const [amount, setAmount] = useState(
    expense?.amount != null ? String(expense.amount) : ""
  );
  const [paidByUid, setPaidByUid] = useState(
    expense?.paidBy || auth.currentUser?.uid || ""
  );
  const [splitAmong, setSplitAmong] = useState(
    expense?.splitAmong || members.map((m) => m.uid)
  );
  const [splitType, setSplitType] = useState(expense?.splitType || "equal");
  const [shares, setShares] = useState(expense?.shares || {});
  const [category, setCategory] = useState(expense?.category || "Other");
  const [note, setNote] = useState(expense?.note || "");
  const [receiptUri, setReceiptUri] = useState(expense?.receiptUrl || "");
  const [loading, setLoading] = useState(false);

  const total = parseFloat(amount) || 0;

  const applySplitType = (mode) => {
    setSplitType(mode);
    if (mode !== "equal") {
      setShares(equalShares(splitAmong, total, mode));
    }
  };

  const toggleSplit = (uid) => {
    setSplitAmong((prev) => {
      const next = prev.includes(uid) ? prev.filter((u) => u !== uid) : [...prev, uid];
      if (splitType !== "equal") {
        setShares(equalShares(next, total, splitType));
      }
      return next;
    });
  };

  const updateShare = (uid, value) => {
    setShares((prev) => ({ ...prev, [uid]: value }));
  };

  const pickReceipt = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showErrorToast("Photo permission is required.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.35,
        allowsEditing: true,
        base64: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      setReceiptUri(receiptFromPickerAsset(result.assets[0]));
    } catch (err) {
      console.error(err);
      showErrorToast("Could not add photo.");
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { showErrorToast("Please enter a title."); return; }
    if (!amount || isNaN(total) || total <= 0) { showErrorToast("Enter a valid amount."); return; }
    if (splitAmong.length === 0) { showErrorToast("Select at least one person to split with."); return; }

    if (splitType === "amount") {
      const sum = splitAmong.reduce((s, uid) => s + (parseFloat(shares[uid]) || 0), 0);
      if (Math.abs(sum - total) > 0.05) {
        showErrorToast(`Shares must add up to ₹${total.toFixed(2)}.`);
        return;
      }
    }
    if (splitType === "percent") {
      const sum = splitAmong.reduce((s, uid) => s + (parseFloat(shares[uid]) || 0), 0);
      if (Math.abs(sum - 100) > 0.05) {
        showErrorToast("Percentages must add up to 100%.");
        return;
      }
    }

    setLoading(true);
    try {
      const db = getFirestore();
      const payer = members.find((m) => m.uid === paidByUid);
      const receiptUrl = receiptUri || "";

      const payload = {
        title: title.trim(),
        amount: total,
        paidBy: paidByUid,
        paidByName: payer?.name || "Unknown",
        splitAmong,
        splitType,
        shares: splitType === "equal" ? {} : shares,
        category,
        note: note.trim(),
        receiptUrl,
      };

      if (isEdit) {
        await updateDoc(doc(db, "groups", groupId, "expenses", expense.id), {
          ...payload,
          updatedAt: new Date().toISOString(),
        });
        showSuccessToast("Expense updated");
      } else {
        await addDoc(collection(db, "groups", groupId, "expenses"), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        showSuccessToast("Expense added!");
      }
      navigation.goBack();
    } catch (err) {
      showErrorToast("Failed to save expense.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const shareSum = splitAmong.reduce((s, uid) => s + (parseFloat(shares[uid]) || 0), 0);
  const equalShare = splitAmong.length ? (total / splitAmong.length).toFixed(2) : "0.00";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={playOuchSound} style={styles.headerTitleContainer}>
            <Image
              source={require("../../../assets/header.png")}
              style={{ width: 140, height: 44 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, cardShadow]}>
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle}
              placeholder="e.g. Pizza, Electricity Bill" placeholderTextColor={TEXT_SECONDARY}
              autoCapitalize="sentences" editable={!loading} />
            <Text style={[styles.label, { marginTop: 16 }]}>Amount (₹)</Text>
            <TextInput style={styles.input} value={amount} onChangeText={setAmount}
              placeholder="0.00" placeholderTextColor={TEXT_SECONDARY}
              keyboardType="decimal-pad" editable={!loading} />

            <Text style={[styles.label, { marginTop: 16 }]}>Category</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, category === item && styles.chipActive]}
                  onPress={() => setCategory(item)}
                >
                  <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>Note</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="Optional note"
              placeholderTextColor={TEXT_SECONDARY}
              multiline
              editable={!loading}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>Receipt</Text>
            {receiptUri ? (
              <View>
                <ReceiptImage uri={receiptUri} height={180} />
                <View style={styles.receiptActions}>
                  <TouchableOpacity onPress={pickReceipt}><Text style={styles.linkTeal}>Change</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setReceiptUri("")}><Text style={styles.linkRed}>Remove</Text></TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.receiptBtn} onPress={pickReceipt} disabled={loading}>
                <Ionicons name="camera-outline" size={20} color={TEXT_SECONDARY} />
                <Text style={styles.receiptBtnText}>Add receipt photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.sectionTitle}>Paid By</Text>
          <View style={[styles.card, cardShadow]}>
            {members.map((m, index) => (
              <TouchableOpacity key={m.uid}
                style={[styles.memberRow, index === members.length - 1 && styles.rowLast]}
                onPress={() => setPaidByUid(m.uid)} activeOpacity={0.7}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{m.name?.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.memberName}>{m.name}{m.uid === auth.currentUser?.uid ? " (you)" : ""}</Text>
                <View style={[styles.radio, paidByUid === m.uid && styles.radioSelected]}>
                  {paidByUid === m.uid && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Split</Text>
          <View style={styles.modeRow}>
            {SPLIT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[styles.modeBtn, splitType === mode.id && styles.modeBtnActive]}
                onPress={() => applySplitType(mode.id)}
              >
                <Text style={[styles.modeText, splitType === mode.id && styles.modeTextActive]}>{mode.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.card, cardShadow]}>
            {members.map((m, index) => {
              const included = splitAmong.includes(m.uid);
              return (
                <View key={m.uid} style={[styles.splitBlock, index === members.length - 1 && styles.rowLast]}>
                  <TouchableOpacity style={styles.memberRow} onPress={() => toggleSplit(m.uid)} activeOpacity={0.7}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{m.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.memberName}>{m.name}{m.uid === auth.currentUser?.uid ? " (you)" : ""}</Text>
                    <View style={[styles.checkbox, included && styles.checkboxSelected]}>
                      {included && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                  {included && splitType !== "equal" && (
                    <TextInput
                      style={styles.shareInput}
                      value={shares[m.uid] != null ? String(shares[m.uid]) : ""}
                      onChangeText={(v) => updateShare(m.uid, v)}
                      placeholder={splitType === "percent" ? "%" : "₹"}
                      placeholderTextColor={TEXT_SECONDARY}
                      keyboardType="decimal-pad"
                      editable={!loading}
                    />
                  )}
                </View>
              );
            })}
          </View>

          {splitAmong.length > 0 && total > 0 && (
            <View style={[styles.splitPreview, cardShadow]}>
              <Ionicons name="calculator-outline" size={20} color={TEAL} />
              <Text style={styles.splitPreviewText}>
                {splitType === "equal" && `₹${equalShare} each (${splitAmong.length})`}
                {splitType === "amount" && `₹${shareSum.toFixed(2)} of ₹${total.toFixed(2)}`}
                {splitType === "percent" && `${shareSum.toFixed(1)}% of 100%`}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, cardShadow, loading && { opacity: 0.7 }]}
            onPress={handleSave} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="checkmark-circle-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>{isEdit ? "Save Changes" : "Save Expense"}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: CARD_BG,
    borderBottomWidth: 1, borderBottomColor: "#eee" },
  backBtn: { padding: 8 },
  headerTitleContainer: { flex: 1, alignItems: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  card: { backgroundColor: CARD_BG, borderRadius: 16, padding: 20, marginBottom: 20 },
  label: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 16, fontFamily: "Poppins_400Regular", color: TEXT_PRIMARY },
  noteInput: { minHeight: 80, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: "#f1f5f9" },
  chipActive: { backgroundColor: TEAL },
  chipText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: TEXT_SECONDARY },
  chipTextActive: { color: "#fff" },
  receiptBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingVertical: 16, borderStyle: "dashed",
  },
  receiptBtnText: { fontSize: 14, fontFamily: "Poppins_400Regular", color: TEXT_SECONDARY },
  receiptPreview: { width: "100%", height: 180, borderRadius: 12, backgroundColor: "#f1f5f9", resizeMode: "cover" },
  receiptActions: { flexDirection: "row", gap: 16, marginTop: 8 },
  linkTeal: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0f766e" },
  linkRed: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#ef4444" },
  sectionTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY, marginBottom: 12 },
  modeRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  modeBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0" },
  modeBtnActive: { backgroundColor: TEAL, borderColor: TEAL },
  modeText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: TEXT_SECONDARY },
  modeTextActive: { color: "#fff" },
  splitBlock: { borderBottomWidth: 1, borderBottomColor: "#f0f0f0", paddingBottom: 8, marginBottom: 4 },
  memberRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  rowLast: { borderBottomWidth: 0 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: TEAL_LIGHT,
    alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  memberName: { flex: 1, fontSize: 15, fontFamily: "Poppins_400Regular", color: TEXT_PRIMARY },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#d1d5db",
    alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: TEAL, backgroundColor: "#f8fafc" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: TEAL },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#d1d5db",
    alignItems: "center", justifyContent: "center" },
  checkboxSelected: { borderColor: TEAL, backgroundColor: TEAL },
  shareInput: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 8, marginLeft: 50, marginBottom: 8, fontSize: 15,
    fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY,
  },
  splitPreview: { flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 20 },
  splitPreviewText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: TEAL },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: TEAL, paddingVertical: 18, borderRadius: 16, marginTop: 10 },
  saveBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#fff" },
});

export default AddExpenseScreen;
