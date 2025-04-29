import React from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#1a0033",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(nonav)/officialGames"
        options={{ title: "Official Games" }}
      />{" "}
      <Stack.Screen
        name="(nonav)/communityGames"
        options={{ title: "Community Games" }}
      />
      <Stack.Screen name="(nonav)/newGame" options={{ title: "Create Game" }} />
      <Stack.Screen
        name="(nonav)/newSleepGame"
        options={{ title: "Create Game" }}
      />
      <Stack.Screen
        name="(nonav)/historyGames"
        options={{ title: "History" }}
      />
      <Stack.Screen
        name="(nonav)/notification"
        options={{ title: "Notification" }}
      />
      <Stack.Screen
        name="(nonav)/selectGameType"
        options={{ title: "Game Type" }}
      />
      <Stack.Screen name="(nonav)/setGoals" options={{ title: "Set Goals" }} />
      <Stack.Screen
        name="(auth)/login
      "
        options={{
          title: "Login",
        }}
      />
      <Stack.Screen name="(nonav)/profile" options={{ title: "Profile" }} />
      <Stack.Screen
        name="(nonav)/achievments"
        options={{ title: "Achievments" }}
      />
    </Stack>
  );
}
