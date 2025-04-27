import { FitbitButton } from "@/components/screens/fitbit";
import GameLeaderboard from "@/components/screens/gamestatus";
import Graph from "@/components/screens/Graph";
import ActivityTracker from "@/components/screens/StatsScreen";
import React from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Stats = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <Graph /> */}
      {/* <FitbitButton/> */}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({});

export default Stats;
