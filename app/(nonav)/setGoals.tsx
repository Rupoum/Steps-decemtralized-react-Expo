import SetGoalsScreen from "@/components/screens/setGoalsScreen";
import React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const SetGoalsScree = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SetGoalsScreen />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({});

export default SetGoalsScree;
