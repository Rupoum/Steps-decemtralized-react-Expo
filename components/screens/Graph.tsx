import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { VictoryBar, VictoryChart, VictoryTheme } from "victory-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView } from "react-native-gesture-handler";

const Graph = () => {
  return (
    <LinearGradient
      colors={["#1a0033", "#4b0082", "#290d44"]}
      style={styles.container}
    >
      <SafeAreaView>
        <View style={{ padding: 20 }}>
          <View>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "bold",
                color: "white",
              }}
            >
              Sleep
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              marginTop: 20,
            }}
          >
            <Text style={styles.secondHeader}>Day</Text>
            <Text style={styles.secondHeader}>Month</Text>
            <Text style={styles.secondHeader}>Year</Text>
          </View>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 30,
            }}
          >
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: "gray",
                width: 100,
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 13,
                }}
              >
                11th April
              </Text>
            </View>
          </View>
          <ScrollView style={{ marginTop: 10 }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  color: "white",
                }}
              >
                6h 54 min
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e2a3a",
  },
  secondHeader: {
    color: "white",
  },
});
export default Graph;
