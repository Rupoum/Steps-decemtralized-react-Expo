import CreateGameScreen from "@/components/screens/CreateGameScree";
import OfficialGamesScreen from "@/components/screens/OfficialGamesScreen";
import SelectGameTypeScreen from "@/components/screens/SelectGameTypeScreen";
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const OfficialGames = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SelectGameTypeScreen />
    </GestureHandlerRootView>
  );
};

export default OfficialGames;
