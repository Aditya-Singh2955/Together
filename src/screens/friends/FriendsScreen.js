import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { auth } from "../../../firbase";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  orderBy,
  startAt,
  endAt,
} from "firebase/firestore";
import { showSuccessToast, showErrorToast, playOuchSound } from "../../utils/toastWithSound";

const TEAL = "#1a9f8f";
const TEAL_LIGHT = "#2bb7a8";
const BG = "#f5f7fa";
const CARD_BG = "#fff";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#6b7280";

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: { elevation: 3 },
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
      <Text style={[styles.avatarText, { color: "#fff" }]}>
        {name ? name.charAt(0).toUpperCase() : "?"}
      </Text>
    </View>
  );
};

const FriendsScreen = () => {
  const [activeTab, setActiveTab] = useState("friends"); // "friends" | "search" | "requests"

  // My Friends tab
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);

  // Search tab
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState([]); // UIDs I already sent requests to

  // Requests tab
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const currentUser = auth.currentUser;
  const db = getFirestore();

  // ─── Load my friends list ───────────────────────────────────────────────────
  const loadFriends = async () => {
    setFriendsLoading(true);
    try {
      const myDoc = await getDoc(doc(db, "users", currentUser.uid));
      const friendUids = myDoc.data()?.friends || [];

      if (friendUids.length === 0) {
        setFriends([]);
        return;
      }

      // Fetch each friend's name from their user doc
      const friendDocs = await Promise.all(
        friendUids.map((uid) => getDoc(doc(db, "users", uid)))
      );

      const friendList = friendDocs
        .filter((d) => d.exists())
        .map((d) => ({ uid: d.id, ...d.data() }));

      setFriends(friendList);
    } catch (err) {
      console.error("Error loading friends:", err);
    } finally {
      setFriendsLoading(false);
    }
  };

  // ─── Load incoming friend requests ─────────────────────────────────────────
  const loadIncomingRequests = async () => {
    setRequestsLoading(true);
    try {
      const q = query(
        collection(db, "friendRequests"),
        where("toUid", "==", currentUser.uid),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);

      // For each request, fetch the sender's name
      const requests = await Promise.all(
        snapshot.docs.map(async (reqDoc) => {
          const data = reqDoc.data();
          const senderDoc = await getDoc(doc(db, "users", data.fromUid));
          return {
            requestId: reqDoc.id,
            fromUid: data.fromUid,
            senderName: senderDoc.exists() ? senderDoc.data().name : "Unknown",
          };
        })
      );

      setIncomingRequests(requests);
    } catch (err) {
      console.error("Error loading requests:", err);
    } finally {
      setRequestsLoading(false);
    }
  };

  // ─── Load sent requests (so we know which search results already have a pending request) ──
  const loadSentRequests = async () => {
    try {
      const q = query(
        collection(db, "friendRequests"),
        where("fromUid", "==", currentUser.uid),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      const uids = snapshot.docs.map((d) => d.data().toUid);
      setSentRequests(uids);
    } catch (err) {
      console.error("Error loading sent requests:", err);
    }
  };

  // Reload everything when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFriends();
      loadIncomingRequests();
      loadSentRequests();
    }, [])
  );

  // ─── Search users by name (prefix match) ────────────────────────────────────
  const handleSearch = async (text) => {
    setSearchText(text);
    if (text.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Firestore prefix search: name >= "ab" and name <= "ab\uf8ff"
      const q = query(
        collection(db, "users"),
        orderBy("name"),
        startAt(text.trim()),
        endAt(text.trim() + "\uf8ff")
      );
      const snapshot = await getDocs(q);

      const results = snapshot.docs
        .map((d) => ({ uid: d.id, ...d.data() }))
        // Exclude yourself
        .filter((u) => u.uid !== currentUser.uid);

      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // ─── Send a friend request ──────────────────────────────────────────────────
  const sendFriendRequest = async (toUid) => {
    try {
      // Check if already friends
      const myDoc = await getDoc(doc(db, "users", currentUser.uid));
      const myFriends = myDoc.data()?.friends || [];
      if (myFriends.includes(toUid)) {
        showErrorToast("You are already friends!");
        return;
      }

      await addDoc(collection(db, "friendRequests"), {
        fromUid: currentUser.uid,
        toUid: toUid,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      setSentRequests((prev) => [...prev, toUid]);
      showSuccessToast("Friend request sent!");
    } catch (err) {
      showErrorToast("Failed to send request.");
      console.error(err);
    }
  };

  // ─── Accept a friend request ─────────────────────────────────────────────────
  const acceptRequest = async (requestId, fromUid) => {
    try {
      // 1. Update request status to accepted
      await updateDoc(doc(db, "friendRequests", requestId), {
        status: "accepted",
      });

      // 2. Add each other to friends arrays
      await updateDoc(doc(db, "users", currentUser.uid), {
        friends: arrayUnion(fromUid),
      });
      await updateDoc(doc(db, "users", fromUid), {
        friends: arrayUnion(currentUser.uid),
      });

      // 3. Update local state
      setIncomingRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      showSuccessToast("Friend added!");
      loadFriends(); // refresh friends list
    } catch (err) {
      showErrorToast("Failed to accept request.");
      console.error(err);
    }
  };

  // ─── Reject a friend request ─────────────────────────────────────────────────
  const rejectRequest = async (requestId) => {
    try {
      await updateDoc(doc(db, "friendRequests", requestId), {
        status: "rejected",
      });
      setIncomingRequests((prev) =>
        prev.filter((r) => r.requestId !== requestId)
      );
      showSuccessToast("Request declined.");
    } catch (err) {
      showErrorToast("Failed to decline request.");
      console.error(err);
    }
  };

  // ─── Remove a friend ─────────────────────────────────────────────────────────
  const removeFriend = (friendUid, friendName) => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${friendName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await updateDoc(doc(db, "users", currentUser.uid), {
                friends: arrayRemove(friendUid),
              });
              await updateDoc(doc(db, "users", friendUid), {
                friends: arrayRemove(currentUser.uid),
              });
              setFriends((prev) => prev.filter((f) => f.uid !== friendUid));
              showSuccessToast(`${friendName} removed.`);
            } catch (err) {
              showErrorToast("Failed to remove friend.");
              console.error(err);
            }
          },
        },
      ]
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.8} onPress={playOuchSound}>
            <Image
              source={require("../../../assets/header.png")}
              style={{ width: 140, height: 44 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Ionicons name="people-outline" size={28} color={TEAL} />
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "friends" && styles.tabActive]}
            onPress={() => setActiveTab("friends")}
          >
            <Text style={[styles.tabText, activeTab === "friends" && styles.tabTextActive]}>
              My Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "search" && styles.tabActive]}
            onPress={() => setActiveTab("search")}
          >
            <Text style={[styles.tabText, activeTab === "search" && styles.tabTextActive]}>
              Search
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "requests" && styles.tabActive]}
            onPress={() => setActiveTab("requests")}
          >
            <Text style={[styles.tabText, activeTab === "requests" && styles.tabTextActive]}>
              Requests
              {incomingRequests.length > 0 && (
                <Text style={styles.badge}> {incomingRequests.length}</Text>
              )}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── MY FRIENDS TAB ── */}
        {activeTab === "friends" && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {friendsLoading ? (
              <ActivityIndicator size="large" color="#14b8a6" style={styles.loader} />
            ) : friends.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={56} color="#e2e8f0" />
                <Text style={styles.emptyText}>No friends yet.</Text>
                <Text style={styles.emptySubText}>Search for people and add them!</Text>
              </View>
            ) : (
              <View style={styles.listCard}>
                {friends.map((item, index) => (
                  <View key={item.uid} style={[styles.row, cardShadow]}>
                    <Avatar name={item.name} />
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowLabel}>{item.name}</Text>
                      <Text style={styles.rowSub}>{item.email}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFriend(item.uid, item.name)}
                      style={styles.removeBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="person-remove-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {/* ── SEARCH TAB ── */}
        {activeTab === "search" && (
          <View style={styles.flex}>
            <View style={styles.searchContainer}>
              <View style={[styles.searchWrap, cardShadow]}>
                <Ionicons name="search" size={20} color={TEXT_SECONDARY} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name..."
                  placeholderTextColor={TEXT_SECONDARY}
                  value={searchText}
                  onChangeText={handleSearch}
                  autoCapitalize="words"
                />
                {searchLoading && (
                  <ActivityIndicator size="small" color={TEAL} />
                )}
              </View>
            </View>

            {searchText.trim().length < 2 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={56} color={TEAL_LIGHT} />
                <Text style={styles.emptyText}>Find people</Text>
                <Text style={styles.emptySubText}>Type at least 2 characters to search</Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.uid}
                contentContainerStyle={styles.scrollContent}
                ListEmptyComponent={
                  !searchLoading && (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyText}>No users found.</Text>
                    </View>
                  )
                }
                renderItem={({ item }) => {
                  const isAlreadyFriend = friends.some((f) => f.uid === item.uid);
                  const requestSent = sentRequests.includes(item.uid);

                  return (
                    <View style={[styles.searchResultRow, cardShadow]}>
                      <Avatar name={item.name} />
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowLabel}>{item.name}</Text>
                        <Text style={styles.rowSub}>{item.email}</Text>
                      </View>
                      {isAlreadyFriend ? (
                        <View style={styles.alreadyFriendBadge}>
                          <Text style={styles.alreadyFriendText}>Friends</Text>
                        </View>
                      ) : requestSent ? (
                        <View style={styles.sentBadge}>
                          <Text style={styles.sentBadgeText}>Sent</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addBtn}
                          onPress={() => sendFriendRequest(item.uid)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.addBtnText}>Add</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }}
              />
            )}
          </View>
        )}

        {/* ── REQUESTS TAB ── */}
        {activeTab === "requests" && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {requestsLoading ? (
              <ActivityIndicator size="large" color="#14b8a6" style={styles.loader} />
            ) : incomingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="mail-outline" size={56} color="#e2e8f0" />
                <Text style={styles.emptyText}>No pending requests</Text>
                <Text style={styles.emptySubText}>When someone adds you, it shows here.</Text>
              </View>
            ) : (
              <View style={styles.listCard}>
                {incomingRequests.map((req, index) => (
                  <View key={req.requestId} style={[styles.requestRow, cardShadow]}>
                    <Avatar name={req.senderName} />
                    <Text style={[styles.rowLabel, { flex: 1 }]}>{req.senderName}</Text>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => acceptRequest(req.requestId, req.fromUid)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => rejectRequest(req.requestId)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_PRIMARY,
  },

  // Tabs
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  tabActive: {
    backgroundColor: "#0f172a",
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#64748b",
  },
  tabTextActive: {
    color: "#fff",
  },
  badge: {
    color: "#ef4444",
    fontFamily: "Poppins_700Bold",
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  loader: { marginTop: 48 },

  emptyState: { alignItems: "center", marginTop: 60 },
  emptyText: {
    fontSize: 17,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_PRIMARY,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#64748b",
    marginTop: 6,
    textAlign: "center",
  },

  listCard: { gap: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 10,
  },
  rowInfo: { flex: 1 },
  rowLabel: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#0f172a",
    letterSpacing: -0.2,
  },
  rowSub: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#64748b",
    marginTop: 2,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },

  // Search
  searchContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#0f172a",
    marginLeft: 12,
    paddingVertical: 0,
  },
  searchResultRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 14,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  // Buttons
  addBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  addBtnText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    fontSize: 13,
  },
  acceptBtn: {
    backgroundColor: "#0f172a",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtn: {
    backgroundColor: "#fee2e2",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  alreadyFriendBadge: {
    backgroundColor: "#e6faf7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  alreadyFriendText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: TEAL,
  },
  sentBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  sentBadgeText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT_SECONDARY,
  },
  removeBtn: {
    padding: 6,
  },
});

export default FriendsScreen;
