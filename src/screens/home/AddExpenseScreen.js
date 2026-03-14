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
import { auth } from "../../../firbase";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { showSuccessToast, showErrorToast, playOuchSound } from "../../utils/toastWithSound";

const TEAL = "#0f172a";
const TEAL_LIGHT = "#1e293b";
const BG = "#f8fafc";
const CARD_BG = "#fff";
const TEXT_PRIMARY = "#0f172a";
const TEXT_SECONDARY = "#64748b";

const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, members } = route.params;

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidByUid, setPaidByUid] = useState(auth.currentUser?.uid || "");
  const [splitAmong, setSplitAmong] = useState(members.map((m) => m.uid));
  const [loading, setLoading] = useState(false);

  const toggleSplit = (uid) => {
    setSplitAmong((prev) =>
      prev.includes(uid) ? prev.filter((u) => u !== uid) : [...prev, uid]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) { showErrorToast("Please enter a title."); return; }
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) { showErrorToast("Enter a valid amount."); return; }
    if (splitAmong.length === 0) { showErrorToast("Select at least one person to split with."); return; }

    setLoading(true);
    try {
      const db = getFirestore();
      const payer = members.find((m) => m.uid === paidByUid);
      await addDoc(collection(db, "groups", groupId, "expenses"), {
        title: title.trim(),
        amount: amt,
        paidBy: paidByUid,
        paidByName: payer?.name || "Unknown",
        splitAmong,
        createdAt: new Date().toISOString(),
      });
      showSuccessToast("Expense added!");
      navigation.goBack();
    } catch (err) {
      showErrorToast("Failed to save expense.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const perPerson =
    splitAmong.length > 0 && !isNaN(parseFloat(amount))
      ? (parseFloat(amount) / splitAmong.length).toFixed(2)
      : "0.00";

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

          <Text style={styles.sectionTitle}>Split Among</Text>
          <View style={[styles.card, cardShadow]}>
            {members.map((m, index) => (
              <TouchableOpacity key={m.uid}
                style={[styles.memberRow, index === members.length - 1 && styles.rowLast]}
                onPress={() => toggleSplit(m.uid)} activeOpacity={0.7}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{m.name?.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.memberName}>{m.name}{m.uid === auth.currentUser?.uid ? " (you)" : ""}</Text>
                <View style={[styles.checkbox, splitAmong.includes(m.uid) && styles.checkboxSelected]}>
                  {splitAmong.includes(m.uid) && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {splitAmong.length > 0 && parseFloat(amount) > 0 && (
            <View style={[styles.splitPreview, cardShadow]}>
              <Ionicons name="calculator-outline" size={20} color={TEAL} />
              <Text style={styles.splitPreviewText}>₹{perPerson} per person ({splitAmong.length} people)</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, cardShadow, loading && { opacity: 0.7 }]}
            onPress={handleSave} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="checkmark-circle-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>Save Expense</Text>
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
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  card: { backgroundColor: CARD_BG, borderRadius: 16, padding: 20, marginBottom: 20 },
  label: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 16, fontFamily: "Poppins_400Regular", color: TEXT_PRIMARY },
  sectionTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY, marginBottom: 12 },
  memberRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
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
  splitPreview: { flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 20 },
  splitPreviewText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: TEAL },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: TEAL, paddingVertical: 18, borderRadius: 16, marginTop: 10 },
  saveBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#fff" },
});

export default AddExpenseScreen;
