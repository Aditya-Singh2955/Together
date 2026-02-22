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
        tabBarActiveTintColor: "#1a9f8f",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Groups") iconName = "people";
          else if (route.name === "Friends") iconName = "person-add";
          else if (route.name === "Activity") iconName = "pulse";
          else if (route.name === "Profile") iconName = "person";

          return <Ionicons name={iconName} size={22} color={color} />;
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
