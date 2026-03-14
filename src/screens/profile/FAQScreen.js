import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  {
    question: "How do I create a group?",
    answer: "Go to the Groups tab, tap the '+' icon or 'Create Group' button, enter a name, and select an icon. Once created, you can invite friends using the unique invite code."
  },
  {
    question: "How do I split an expense?",
    answer: "Open a group, tap 'Add Expense', enter the expense details, and specify who paid. The app will automatically split the cost equally among group members."
  },
  {
    question: "How can I settle my balances?",
    answer: "In a group, tap the 'Settle Up' button. Select the member you want to settle with, enter the amount you're paying them, and confirm to record the settlement."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use secure authentication and database services to ensure your data and transaction history are kept private and safe."
  }
];

const FAQScreen = () => {
  const navigation = useNavigation();
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {FAQS.map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <TouchableOpacity 
              style={styles.faqHeader} 
              onPress={() => toggleExpand(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.question}>{faq.question}</Text>
              <Ionicons 
                name={expandedIndex === index ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#64748b" 
              />
            </TouchableOpacity>
            {expandedIndex === index && (
              <Text style={styles.answer}>{faq.answer}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#e2e8f0",
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#0f172a" },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  faqCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  faqHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  question: { flex: 1, fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#0f172a", marginRight: 10 },
  answer: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#475569", marginTop: 12, lineHeight: 22 },
});

export default FAQScreen;
