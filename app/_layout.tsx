import React from "react";
import { Stack } from "expo-router";
import { Button, Touchable, TouchableOpacity, View } from "react-native";

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
      />
      <Stack.Screen name="status/[id]"
      options={{title:"Challenge Info"}}></Stack.Screen>
      <Stack.Screen name="(nonav)/nativeheatlth" options={{title:""}}></Stack.Screen>
      <Stack.Screen
        name="(nonav)/communityGames"
        options={{ title: "Community Games" }}
      />
       <Stack.Screen
        name="(auth)/welcome"
        
        options={{ title: "Welcome to Solara" ,headerBackVisible:false}}
      />
      <Stack.Screen name="(nonav)/statuss"></Stack.Screen>
      <Stack.Screen name="(nonav)/newGame" options={{ title: "Create Game" }} />
      <Stack.Screen
        name="(nonav)/newSleepGame"
        options={{ title: "Create Game" }}
      />
      <Stack.Screen name="(auth)/singup" options={{title:"Sign Up"}}></Stack.Screen>
      <Stack.Screen name="(auth)/login" options={{title:"Login"}}></Stack.Screen>
      <Stack.Screen 
  name="(nonav)/goal" 
  options={() => ({
    title: "Goals",
    headerBackTitle: 'Custom Back',
    headerBackTitleStyle: { fontSize: 30 },
    headerLeft: () => (
      <View>
      <TouchableOpacity onPress={() => alert('This is a button!')}></TouchableOpacity>
      </View>
    )
  })}
/>
      <Stack.Screen
        name="(nonav)/historyGames"
        options={{ title: " " }}
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