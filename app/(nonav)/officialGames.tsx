import OfficialGamesScreen from "@/components/screens/OfficialGamesScreen";
import AnimatedStarsBackground from "@/components/utils/background";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const OfficialGames = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
       <LinearGradient colors={["#1a0033", "#4b0082", "#290d44"]} style={styles.gradient}>
       <AnimatedStarsBackground />
      <OfficialGamesScreen />
      </LinearGradient>
    </GestureHandlerRootView>

  );
};
const styles=StyleSheet.create({
  gradient:{
    flex:1
  }
})

export default OfficialGames;
