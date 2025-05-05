import React, { useEffect, useState } from "react";
import { Redirect, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native";
import { getGrantedPermissions, initialize } from "react-native-health-connect";

const StartPage = () => {
  const [auth, setauth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const Auth = async () => {
      try {
        const isInitialized = await initialize(); 
        const granted=getGrantedPermissions();
        const token = await AsyncStorage.getItem("token");
        console.log("Token found:", token);
        if (token) {
          setauth(true);
        } else {
          setauth(false);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setauth(false);
      } finally {
        setLoading(false);
      }
    };
    Auth();
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!auth) {
    // Redirect to the welcome page if not authenticated
    return <Redirect href="/welcome" />;
  }

  // Redirect to the profile page if authenticated
  return <Redirect href="/(tabs)" />;
};

export default StartPage;
