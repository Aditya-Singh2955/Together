import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const TEAL = "#2bb7a8";
const GREY = "#4a4a4a";

const YOUR_GROUPS = [
  { id: "1", name: "Roommates", icon: "bed-outline", circleColor: TEAL },
  { id: "2", name: "Trip", icon: "airplane-outline", circleColor: GREY },
  { id: "3", name: "Roommates", icon: "people-outline", circleColor: GREY },
  { id: "4", name: "Roommatis", icon: "home-outline", circleColor: TEAL },
];

const JoinGroupScreen = () => {
  const navigation = useNavigation();
  const [inviteCode, setInviteCode] = useState("");

  const handleJoin = () => {
    // TODO: validate and join group with inviteCode
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo & branding */}
        <View style={styles.brandSection}>
          <Image
            source={require("../../../assets/Together.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Together</Text>
          <Text style={styles.screenTitle}>Join a Group</Text>
        </View>

        {/* Invite code & Join */}
        <View style={styles.joinSection}>
          <TextInput
            style={styles.input}
            placeholder="Invite Code"
            placeholderTextColor="#999"
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoin}
            activeOpacity={0.8}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>

        {/* Your Groups */}
        <View style={styles.groupsSection}>
          <Text style={styles.sectionTitle}>Your Groups</Text>
          <View style={styles.groupList}>
            {YOUR_GROUPS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.groupRow}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.groupIconCircle,
                    { backgroundColor: item.circleColor },
                  ]}
                >
                  <Ionicons name={item.icon} size={22} color="#fff" />
                </View>
                <Text style={styles.groupName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backButton: { padding: 8 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 32 },
  brandSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 28,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  appName: {
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
    color: GREY,
    marginBottom: 8,
  },
  screenTitle: {
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    color: "#333",
  },
  joinSection: {
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#333",
    marginBottom: 16,
  },
  joinButton: {
    backgroundColor: TEAL,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  joinButtonText: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
  groupsSection: {},
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#333",
    marginBottom: 16,
  },
  groupList: {},
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  groupIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  groupName: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#333",
  },
});

export default JoinGroupScreen;
