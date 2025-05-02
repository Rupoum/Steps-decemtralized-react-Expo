import { BACKEND_URL } from "@/Backendurl";
import StakeStatus from "@/components/screens/goals";
import SetGoalsScreen from "@/components/screens/setGoalsScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const SetGoalsScree = () => {
  const [stakeds, setstaked] = useState(false);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    const staked = async () => {
      try {
        setloading(true);
        const userid = await AsyncStorage.getItem("userid");
        const stake = await axios.get(`${BACKEND_URL}/getstake/${userid}`);
        if (stake.data.stake[0].Status == "CurrentlyRunning") {
          setstaked(true);
        } else {
          setstaked(false);
        }
        console.log(stakeds);
      } catch (e) {
        console.log(e);
      } finally {
        setloading(false);
      }
    };
    staked();
  }, []); 

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9d85e0" />
          <Text style={styles.loadingText}>Loading tournaments...</Text>
        </View>
      ) : stakeds ? (
        <StakeStatus />
      ) : (
        <SetGoalsScreen />
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "white",
    fontSize: 16,
  },
});

export default SetGoalsScree;