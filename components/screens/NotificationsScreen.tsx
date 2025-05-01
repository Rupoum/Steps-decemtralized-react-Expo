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
import { router } from "expo-router";
interface user {
  id: number;
  username: string;
}
const NotificationsScreen = () => {
  const [username, setusername] = useState<user[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const userid = await AsyncStorage.getItem("userid");
      const response = await axios.get(
        `${BACKEND_URL}/friend/request/${userid}`
      );
      const username: [] = response.data.message;
      const formattedMessage = username.map((username, index) => ({
        id: index + 1,
        username,
      }));
      setusername(formattedMessage);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAccept = async (notificationId: string, username: string) => {
    try {
      const userid = await AsyncStorage.getItem("userid");
      await axios.post(`${BACKEND_URL}/accept/friend`, {
        userid: userid,
        username: username,
        bool: true,
      });
      setusername((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleDecline = async (notificationId: string) => {
    try {
      const userid = await AsyncStorage.getItem("userid");
      await axios.post(`${BACKEND_URL}/accept/friend`, {
        userid: userid,
        username: username,
        bool: false,
      });
      setusername((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  const renderNotification = ({ item }: any) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationText}>
        {item.username} sent you a friend request
      </Text>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAccept(item.id, item.username)}
        >
          <Ionicons name="checkmark-circle" size={30} color="green" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => handleDecline(item.username)}
        >
          <Ionicons name="close-circle" size={30} color="red" />
        </TouchableOpacity>
      </View>
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
            data={username}
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
