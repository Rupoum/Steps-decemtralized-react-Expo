import ProfileScreen from "@/components/screens/ProfileScreen";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Profile = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProfileScreen />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({});

export default Profile;
