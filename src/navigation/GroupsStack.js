import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GroupsScreen from "../screens/groups/GroupsScreen";
import JoinGroupScreen from "../screens/groups/JoinGroupScreen";
import CreateGroupScreen from "../screens/groups/CreateGroupScreen";
import GroupDetailScreen from "../screens/groups/GroupDetailScreen";
import SettleScreen from "../screens/groups/SettleScreen";
import AddExpenseScreen from "../screens/home/AddExpenseScreen";

const Stack = createNativeStackNavigator();

export default function GroupsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupsMain" component={GroupsScreen} />
      <Stack.Screen name="JoinGroup" component={JoinGroupScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="Settle" component={SettleScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
    </Stack.Navigator>
  );
}
