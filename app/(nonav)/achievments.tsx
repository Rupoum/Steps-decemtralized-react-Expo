import { BACKEND_URL } from "@/Backendurl";
import AchievmentsScreen from "@/components/screens/AchievmentsScreen";
import AnimatedStarsBackground from "@/components/utils/background";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Achievments = () => {
  const [hasStake, setHasStake] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStake = async () => {
      try {
        setLoading(true);
        const userid = await AsyncStorage.getItem("userid");
        const response = await axios.get(`${BACKEND_URL}/getstake/${userid}`);
        if (response.data.stake.length > 0 && 
            response.data.stake[0].Status === "CurrentlyRunning") {
          setHasStake(true);
        } else {
          setHasStake(false);
          // Alert.alert(
          //   "No Active Stake",
          //   "You do not have any active stakes. Please start a stake to view achievements.",
          //   [{ text: "OK" }]
          // );
        }
      } catch (error) {
        console.error(error);
        Alert.alert(
          "Error",
          "An error occurred while fetching stake data. Please try again later.",
          [{ text: "OK" }]
        );
        setHasStake(false);
      } finally {
        setLoading(false);
      }
    };
    checkStake();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={["#1a0033", "#4b0082", "#290d44"]} style={styles.gradient}>
         <AnimatedStarsBackground />
        
      <View style={styles.container}>
      <ActivityIndicator size={"large"}></ActivityIndicator>
        <Text>Loading...</Text>
      </View>
      </LinearGradient>
      
    );
  }

  if (!hasStake) {
    return (
      <LinearGradient colors={["#1a0033", "#4b0082", "#290d44"]} style={styles.gradient}>
         <AnimatedStarsBackground />
      <View style={styles.container}>
        <Text style={styles.message}>
          You need an active stake to view achievements
        </Text>
      </View>
      </LinearGradient>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AchievmentsScreen />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: '#FFFFFF',

  },
  gradient: {
    flex: 1,
  },
});

export default Achievments;