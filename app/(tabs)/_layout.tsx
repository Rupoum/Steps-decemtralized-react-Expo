import React from "react";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Layout = () => {
  // const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "wallet") {
            iconName = focused ? "wallet" : "wallet-outline";
          } else if (route.name === "leaderboard") {
            iconName = focused ? "trophy" : "trophy-outline";
          } else if (route.name === "profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "health") {
            iconName = focused ? "stats-chart-outline" : "stats-chart";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6c5ce7",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.7)",
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          // position: "absolute",

          left: "10%",
          right: "10%",

          backgroundColor: "#EE82EE",
          // borderRadius: 25,

          height: 65,

          ...styles.shadow,
          borderTopWidth: 0,
        },
        tabBarBackground: () => (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(26, 0, 51, 0.75)" },
            ]}
          />
        ),
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontWeight: "500",
        },
      })}
    >
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      {/* <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      /> */}
      <Tabs.Screen
        name="stats"
        options={{
          title: "Statistics",
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
});

export default Layout;
