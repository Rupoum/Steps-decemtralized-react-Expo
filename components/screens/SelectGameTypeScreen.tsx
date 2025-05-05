import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AnimatedStarsBackground from "../utils/background";

const SelectGameTypeScreen = () => {
  return (
    <LinearGradient colors={["#1a0033", "#4b0082", "#290d44"]} style={styles.gradient}>
      <AnimatedStarsBackground />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(nonav)/newGame")}
        >
          <Ionicons name="walk-outline" size={24} color="#7FD4F5" />
          <Text style={styles.buttonText}>Steps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(nonav)/newSleepGame")}
        >
          <Ionicons name="bed-outline" size={24} color="#7FD4F5" />
          <Text style={styles.buttonText}>Sleep</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default SelectGameTypeScreen;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A3A4A",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#7FD4F5",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
