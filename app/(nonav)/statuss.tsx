import StakeStatus from "@/components/screens/goals";
import ProfileScreen from "@/components/screens/ProfileScreen";
import SetGoalsScreen from "@/components/screens/setGoalsScreen";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Profile = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <StakeStatus/>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({});

export default Profile;
