import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const TEAL = "#1a9f8f";
const BG = "#f5f7fa";
const CARD_BG = "#fff";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#6b7280";

const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [expenseReminders, setExpenseReminders] = useState(true);
  const [groupUpdates, setGroupUpdates] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          <View style={[styles.card, cardShadow]}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Push notifications</Text>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: "#e5e7eb", true: "#a7f3ec" }}
                thumbColor={pushEnabled ? TEAL : "#f4f4f4"}
              />
            </View>
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.rowLabel}>Email notifications</Text>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ false: "#e5e7eb", true: "#a7f3ec" }}
                thumbColor={emailEnabled ? TEAL : "#f4f4f4"}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Reminders</Text>
          <View style={[styles.card, cardShadow]}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Expense reminders</Text>
              <Switch
                value={expenseReminders}
                onValueChange={setExpenseReminders}
                trackColor={{ false: "#e5e7eb", true: "#a7f3ec" }}
                thumbColor={expenseReminders ? TEAL : "#f4f4f4"}
              />
            </View>
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.rowLabel}>Group updates</Text>
              <Switch
                value={groupUpdates}
                onValueChange={setGroupUpdates}
                trackColor={{ false: "#e5e7eb", true: "#a7f3ec" }}
                thumbColor={groupUpdates ? TEAL : "#f4f4f4"}
              />
            </View>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  headerPlaceholder: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_SECONDARY,
    marginBottom: 10,
    marginTop: 8,
  },
  card: { backgroundColor: CARD_BG, borderRadius: 16, overflow: "hidden", marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  rowLabel: { fontSize: 16, fontFamily: "Poppins_400Regular", color: TEXT_PRIMARY },
});

export default NotificationsScreen;
