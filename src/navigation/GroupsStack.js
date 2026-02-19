import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GroupsScreen from "../screens/groups/GroupsScreen";
import JoinGroupScreen from "../screens/groups/JoinGroupScreen";

const Stack = createNativeStackNavigator();

export default function GroupsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupsMain" component={GroupsScreen} />
      <Stack.Screen name="JoinGroup" component={JoinGroupScreen} />
    </Stack.Navigator>
  );
}
