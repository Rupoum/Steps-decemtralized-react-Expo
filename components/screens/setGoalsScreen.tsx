import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Image, StyleSheet, Text, View, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";

const SetGoalsScreen = () => {
  const [sleepGoal, setSleepGoal] = useState(5);
  const [stakeAmount, setStakeAmount] = useState("");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#1a0033", "#4b0082", "#290d44"]}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Your daily sleep duration</Text>
          <Image
            source={require("../../assets/images/sleepIcon.png")}
            style={{ width: "90%", height: "20%" }}
          />
          <Text style={styles.goalText}>
            {sleepGoal} <Text>hours</Text>
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={15}
            step={1}
            // value={sleepGoal}
            onValueChange={(value) => setSleepGoal(value)}
            minimumTrackTintColor="#7FD4F5"
            maximumTrackTintColor="#8A9AAB"
            thumbTintColor="#7FD4F5"
          />
          <Text style={styles.stakeLabel}>Stake Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount to stake"
            placeholderTextColor="#8A9AAB"
            keyboardType="numeric"
            value={stakeAmount}
            onChangeText={setStakeAmount}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    color: "white",
    fontSize: 22,
    marginBottom: 30,
    alignSelf: "center",
  },
  goalText: {
    color: "#7FD4F5",
    fontSize: 30,
    fontWeight: "bold",
    marginVertical: 20,
    alignSelf: "center",
  },
  slider: {
    width: 350,
    height: 40,
    alignSelf: "center",
  },
  stakeLabel: {
    color: "white",
    fontSize: 18,
    marginTop: 30,
    marginBottom: 10,
    alignSelf: "center",
  },
  input: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderColor: "#7FD4F5",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "white",
    fontSize: 16,
    alignSelf: "center",
    backgroundColor: "#2A3A4A",
  },
});

export default SetGoalsScreen;
