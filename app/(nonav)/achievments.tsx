import AchievmentsScreen from "@/components/screens/AchievmentsScreen";
import React from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text } from "react-native-svg";

const Achievments = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AchievmentsScreen />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({});

export default Achievments;
