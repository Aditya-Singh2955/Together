import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeScreen from "../screens/home/HomeScreen";
import GroupsStack from "./GroupsStack";
import FriendsScreen from "../screens/friends/FriendsScreen";
import ActivityScreen from "../screens/activity/ActivityScreen";
import ProfileStack from "./ProfileStack";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#0f172a",
          tabBarInactiveTintColor: "#94a3b8",
          tabBarStyle: {
            height: 60,
            paddingBottom: 5,
            borderTopWidth: 1,
            borderTopColor: "#e2e8f0",
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Home") iconName = focused ? "home" : "home-outline";
            else if (route.name === "Groups") iconName = focused ? "people" : "people-outline";
            else if (route.name === "Friends") iconName = focused ? "person-add" : "person-add-outline";
            else if (route.name === "Activity") iconName = focused ? "receipt" : "receipt-outline";
            else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";

            return <Ionicons name={iconName} size={24} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Groups" component={GroupsStack} />
        <Tab.Screen name="Friends" component={FriendsScreen} />
        <Tab.Screen name="Activity" component={ActivityScreen} />
        <Tab.Screen name="Profile" component={ProfileStack} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
