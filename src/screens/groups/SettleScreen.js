import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { auth } from "../../../firbase";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { showSuccessToast, showErrorToast } from "../../utils/toastWithSound";
import { computeMemberBalances, getSettleRelation } from "../../utils/balances";

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

const SettleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Params
  const { groupId: preSelectedGroupId, settlement } = route.params || {};
  const isEdit = !!settlement?.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Selections
  const [selectedGroupId, setSelectedGroupId] = useState(preSelectedGroupId || null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");

  useFocusEffect(
    useCallback(() => {
      const loadInitialData = async () => {
        setLoading(true);
        try {
          const db = getFirestore();
          const user = auth.currentUser;
          if (!user) return;

          if (!selectedGroupId) {
            // Load groups if not pre-selected
            const groupsQuery = query(
              collection(db, "groups"),
              where("members", "array-contains", user.uid)
            );
            const snapshot = await getDocs(groupsQuery);
            setGroups(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
          } else {
            // Load members of the selected group
            const groupDoc = await getDoc(doc(db, "groups", selectedGroupId));
            if (groupDoc.exists()) {
              const groupData = groupDoc.data();
              const memberUids = groupData.members || [];

              if (memberUids.length > 0) {
                const memberDocs = await Promise.all(
                  memberUids.map((uid) => getDoc(doc(db, "users", uid)))
                );
                const loadedMembers = memberDocs
                  .filter((d) => d.exists())
                  .map((d) => ({ uid: d.id, ...d.data() }));
                setAllMembers(loadedMembers);
                setMembers(loadedMembers.filter((m) => m.uid !== user.uid));
              } else {
                setAllMembers([]);
                setMembers([]);
              }

              const expSnapshot = await getDocs(
                collection(db, "groups", selectedGroupId, "expenses")
              );
              setExpenses(expSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));

              if (isEdit) {
                setSelectedMemberId(settlement.splitAmong?.[0] || null);
                setAmount(
                  settlement.amount != null ? String(settlement.amount) : ""
                );
                setTitle(
                  !settlement.title || settlement.title === "Settle Up"
                    ? ""
                    : settlement.title
                );
              }
            }
          }
        } catch (err) {
          console.error("Error loading data:", err);
        } finally {
          setLoading(false);
        }
      };

      loadInitialData();
    }, [selectedGroupId, isEdit, settlement])
  );

  const myUid = auth.currentUser?.uid;
  const balances = computeMemberBalances(
    allMembers,
    isEdit ? expenses.filter((e) => e.id !== settlement.id) : expenses
  );
  const selectedMember = members.find((m) => m.uid === selectedMemberId);
  const selectedRelation = selectedMemberId
    ? getSettleRelation(myUid, selectedMemberId, balances)
    : null;
  const parsedAmount = parseFloat(amount);

  const selectMember = (uid) => {
    setSelectedMemberId(uid);
    const relation = getSettleRelation(myUid, uid, balances);
    if (relation.type === "you_owe") {
      setAmount(relation.amount.toFixed(2));
    } else {
      setAmount("");
    }
  };

  const handleSettle = async () => {
    if (!selectedGroupId) { showErrorToast("Select a group."); return; }
    if (!selectedMemberId) { showErrorToast("Select someone to settle with."); return; }
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) { showErrorToast("Enter a valid amount."); return; }

    setSubmitting(true);
    try {
      const db = getFirestore();
      
      // Get my name
      const meDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const myName = meDoc.exists() ? meDoc.data().name : "Unknown";

      const payload = {
        title: title.trim() || "Settle Up",
        isSettlement: true,
        amount: amt,
        paidBy: auth.currentUser.uid,
        paidByName: myName,
        splitAmong: [selectedMemberId],
      };

      if (isEdit) {
        await updateDoc(
          doc(db, "groups", selectedGroupId, "expenses", settlement.id),
          { ...payload, updatedAt: new Date().toISOString() }
        );
        showSuccessToast("Settlement updated");
      } else {
        await addDoc(collection(db, "groups", selectedGroupId, "expenses"), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        showSuccessToast("Settled up!");
      }
      
      // Go back to where we came from
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("Home");
      }
    } catch (err) {
      showErrorToast("Failed to settle.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? "Edit Settlement" : "Settle Up"}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {loading ? (
             <ActivityIndicator size="large" color={TEAL} style={{ marginTop: 40 }} />
          ) : (
            <>
              {/* Step 1: Select Group (if not already selected) */}
              {!selectedGroupId && (
                <View>
                  <Text style={styles.sectionTitle}>Select a Group to Settle In</Text>
                  <View style={[styles.card, cardShadow]}>
                    {groups.length === 0 ? (
                      <Text style={styles.emptyText}>You are not in any groups.</Text>
                    ) : (
                      groups.map((g, index) => (
                        <TouchableOpacity
                          key={g.id}
                          style={[styles.row, index === groups.length - 1 && styles.rowLast]}
                          onPress={() => setSelectedGroupId(g.id)}
                        >
                          <Ionicons name={g.icon || "people-outline"} size={22} color={TEAL} style={{ marginRight: 12 }} />
                          <Text style={styles.rowText}>{g.name}</Text>
                          <Ionicons name="chevron-forward" size={18} color={TEXT_SECONDARY} />
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                </View>
              )}

              {/* Step 2: Select Member and Amount */}
              {selectedGroupId && (
                <View>
                  <Text style={styles.sectionTitle}>Settle With</Text>
                  <View style={[styles.card, cardShadow]}>
                    {members.length === 0 ? (
                      <Text style={styles.emptyText}>No other members in this group to settle with.</Text>
                    ) : (
                      members.map((m, index) => {
                        const relation = getSettleRelation(myUid, m.uid, balances);
                        return (
                        <TouchableOpacity
                          key={m.uid}
                          style={[styles.row, index === members.length - 1 && styles.rowLast]}
                          onPress={() => selectMember(m.uid)}
                        >
                          <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{m.name?.charAt(0).toUpperCase()}</Text>
                          </View>
                          <View style={styles.rowInfo}>
                            <Text style={styles.rowText}>{m.name}</Text>
                            <Text
                              style={[
                                styles.rowHint,
                                relation.type === "you_owe" && styles.hintOwe,
                                relation.type === "owes_you" && styles.hintGet,
                              ]}
                            >
                              {relation.type === "you_owe"
                                ? `You owe ₹${relation.amount.toFixed(2)}`
                                : relation.type === "owes_you"
                                ? `Owes you ₹${relation.amount.toFixed(2)}`
                                : "All settled"}
                            </Text>
                          </View>
                          <View style={[styles.radio, selectedMemberId === m.uid && styles.radioSelected]}>
                            {selectedMemberId === m.uid && <View style={styles.radioDot} />}
                          </View>
                        </TouchableOpacity>
                        );
                      })
                    )}
                  </View>

                  {selectedMemberId && (
                    <>
                      <Text style={styles.sectionTitle}>Details</Text>
                      <View style={[styles.card, cardShadow, { gap: 16 }]}>
                        <View>
                          <Text style={styles.inputLabel}>Title (Optional)</Text>
                          <TextInput 
                            style={styles.inputTitle} 
                            value={title} 
                            onChangeText={setTitle}
                            placeholder="e.g. For movie tickets" 
                            placeholderTextColor={TEXT_SECONDARY}
                            editable={!submitting}
                          />
                        </View>
                        <View>
                          <Text style={styles.inputLabel}>Amount (₹)</Text>
                          <TextInput 
                            style={styles.inputAmount} 
                            value={amount} 
                            onChangeText={setAmount}
                            placeholder="0.00" 
                            placeholderTextColor={TEXT_SECONDARY}
                            keyboardType="decimal-pad" 
                            editable={!submitting} 
                            autoFocus
                          />
                          {selectedRelation?.type === "you_owe" && (
                            <Text style={styles.suggestText}>
                              Suggested: ₹{selectedRelation.amount.toFixed(2)}
                            </Text>
                          )}
                          {selectedRelation?.type === "owes_you" && (
                            <Text style={styles.warnText}>
                              {selectedMember?.name} owes you ₹{selectedRelation.amount.toFixed(2)}. They should settle with you.
                            </Text>
                          )}
                        </View>
                      </View>

                      {selectedMember && !isNaN(parsedAmount) && parsedAmount > 0 && (
                        <View style={styles.confirmBox}>
                          <Ionicons name="swap-horizontal-outline" size={20} color="#0f766e" />
                          <Text style={styles.confirmText}>
                            You are paying {selectedMember.name} ₹{parsedAmount.toFixed(2)}
                          </Text>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[styles.primaryBtn, cardShadow, submitting && { opacity: 0.7 }]}
                        onPress={handleSettle} 
                        disabled={submitting} 
                        activeOpacity={0.85}
                      >
                        {submitting ? <ActivityIndicator color="#fff" /> : (
                          <>
                            <Ionicons name="checkmark-circle-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.primaryBtnText}>
                              {isEdit ? "Save Changes" : "Confirm Settlement"}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
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
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: CARD_BG,
    borderBottomWidth: 1, borderBottomColor: "#eee"
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#64748b", marginBottom: 12, letterSpacing: 0.5 },
  card: { backgroundColor: CARD_BG, borderRadius: 24, padding: 16, marginBottom: 32, borderWidth: 1, borderColor: "#e2e8f0" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  rowLast: { borderBottomWidth: 0 },
  rowInfo: { flex: 1, marginRight: 10 },
  rowText: { fontSize: 15, fontFamily: "Poppins_400Regular", color: TEXT_PRIMARY },
  rowHint: { fontSize: 12, fontFamily: "Poppins_400Regular", color: TEXT_SECONDARY, marginTop: 2 },
  hintOwe: { color: "#ef4444", fontFamily: "Poppins_600SemiBold" },
  hintGet: { color: "#0f766e", fontFamily: "Poppins_600SemiBold" },
  suggestText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#0f766e", marginTop: 8 },
  warnText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#b45309", marginTop: 8 },
  confirmBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ccfbf1",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#99f6e4",
  },
  confirmText: { flex: 1, fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0f766e" },
  emptyText: { fontSize: 14, fontFamily: "Poppins_400Regular", color: TEXT_SECONDARY, textAlign: "center", paddingVertical: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: TEAL_LIGHT, alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#d1d5db", alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: "#14b8a6", backgroundColor: "#ccfbf1" },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#14b8a6" },
  inputLabel: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#64748b", marginBottom: 8 },
  inputTitle: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#0f172a", backgroundColor: "#f8fafc" },
  inputAmount: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 24, fontFamily: "Poppins_700Bold", color: "#14b8a6", backgroundColor: "#f8fafc" },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a", paddingVertical: 18, borderRadius: 16, marginTop: 10 },
  primaryBtnText: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#fff" },
});

export default SettleScreen;
