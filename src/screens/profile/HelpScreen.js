import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
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

const HELP_ITEMS = [
  { id: "1", label: "FAQ", icon: "help-circle-outline", description: "Frequently asked questions", iconCircle: true },
  { id: "2", label: "Contact Support", icon: "chatbubble-outline", description: "Get in touch with our team", iconCircle: false },
  { id: "3", label: "Privacy Policy", icon: "document-text-outline", description: "How we handle your data", iconCircle: false },
  { id: "4", label: "Terms of Service", icon: "reader-outline", description: "Terms and conditions", iconCircle: false },
];

const HelpScreen = () => {
  const navigation = useNavigation();

  const handlePress = (item) => {
    if (item.label === "Contact Support") {
      Linking.openURL("mailto:support@together.app").catch(() => {});
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, cardShadow]}>
            {HELP_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.row, index < HELP_ITEMS.length - 1 && styles.rowBorder]}
                onPress={() => handlePress(item)}
                activeOpacity={0.7}
              >
                <View style={item.iconCircle ? styles.iconCircleWrap : styles.iconWrap}>
                  <Ionicons
                    name={item.icon}
                    size={item.iconCircle ? 20 : 24}
                    color={item.iconCircle ? "#fff" : TEXT_PRIMARY}
                  />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.rowDescription}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.contactCard, cardShadow]}>
            <Text style={styles.contactTitle}>Need more help?</Text>
            <Text style={styles.contactText}>
              Our support team is available to assist you. Reach out anytime and we'll get back to you as soon as possible.
            </Text>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL("mailto:support@together.app").catch(() => {})}
              activeOpacity={0.85}
            >
              <Ionicons name="mail-outline" size={20} color="#fff" style={styles.contactBtnIcon} />
              <Text style={styles.contactBtnText}>Email Support</Text>
            </TouchableOpacity>
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
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#e5e7eb" },
  iconWrap: { marginRight: 14 },
  iconCircleWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TEXT_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY },
  rowDescription: { fontSize: 13, fontFamily: "Poppins_400Regular", color: TEXT_SECONDARY, marginTop: 2 },
  contactCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
  },
  contactTitle: { fontSize: 17, fontFamily: "Poppins_600SemiBold", color: TEXT_PRIMARY, marginBottom: 8 },
  contactText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: TEXT_SECONDARY,
    lineHeight: 22,
    marginBottom: 18,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TEAL,
    paddingVertical: 14,
    borderRadius: 12,
  },
  contactBtnIcon: { marginRight: 8 },
  contactBtnText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#fff" },
});

export default HelpScreen;
