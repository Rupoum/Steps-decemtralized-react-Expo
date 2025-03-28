import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";
import { BACKEND_URL } from "@/Backendurl";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      message: "Xyz sent you a friend request",
      type: "friend_request",
    },
    {
      id: "2",
      message: "Your friend request to Abcd was accepted",
      type: "general",
    },
    {
      id: "3",
      message: "ABcd sent you a friend request",
      type: "friend_request",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const userid = await AsyncStorage.getItem("userid");
        const response = await axios.get(
          `${BACKEND_URL}/notifications/${userid}`
        );
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // fetchNotifications();
  }, []);

  const handleAccept = async (notificationId: string) => {
    try {
      await axios.post(`${BACKEND_URL}/notifications/accept`, {
        id: notificationId,
      });
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleDecline = async (notificationId: string) => {
    try {
      await axios.post(`${BACKEND_URL}/notifications/decline`, {
        id: notificationId,
      });
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  const renderNotification = ({ item }: any) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationText}>{item.message}</Text>
      {item.type === "friend_request" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAccept(item.id)}
          >
            <Ionicons name="checkmark-circle" size={30} color="green" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => handleDecline(item.id)}
          >
            <Ionicons name="close-circle" size={30} color="red" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={["#1a0033", "#4b0082", "#290d44"]}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Notifications for you </Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#9C89FF" />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No notifications available</Text>
            }
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 20 },
  header: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30,
  },
  notificationItem: {
    backgroundColor: "#290d44",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationText: {
    color: "white",
    fontSize: 16,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  acceptButton: {
    // backgroundColor: "#34C759",
    padding: 5,
    borderRadius: 50,
  },
  declineButton: {
    // backgroundColor: "#FF3B30",
    padding: 5,
    borderRadius: 50,
  },
  emptyText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default NotificationsScreen;
