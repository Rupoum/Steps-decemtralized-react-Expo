import LeaderboardScreen from "@/components/screens/LeaderboardScreen";
import Wallet from "@/components/screens/Wallet";
import { NavigationContainer } from "@react-navigation/native";
import { Link } from "expo-router";
// import Wallets from "@/components/screens/Wallet2";
import React from "react";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const wallet = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Wallet />
     
    </GestureHandlerRootView>
  );
};

export default wallet;
