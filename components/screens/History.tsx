import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "@/Backendurl";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get("window");

const History = () => {
  const [participated, setParticipated] = useState([]);
  const [created, setCreated] = useState([]);
  const [selectedTab, setSelectedTab] = useState("participated");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const userid = await AsyncStorage.getItem("userid");
        if (!userid) {
          setError("User ID not found.");
          setIsLoading(false);
          return;
        }
        
        // Fetch created tournaments
        const createdResponse = await axios.get(
          `${BACKEND_URL}/history/prevgame/${userid}`
        );
        
        // Fetch participated tournaments
        const participatedResponse = await axios.get(
          `${BACKEND_URL}/history/prev/${userid}`
        );
        
        setCreated(createdResponse.data.Tournament || []);
        setParticipated(participatedResponse.data.Tournament || []);
      } catch (e) {
        console.error("Error fetching history:", e);
        setError("Failed to fetch history. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleTabPress = (tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTab(tab);
    Animated.timing(animatedValue, {
      toValue: tab === "participated" ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const animatedBarStyle = {
    transform: [
      {
        translateX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, width * 0.45],
        }),
      },
    ],
  };

  const getStatusColor = (status) => {
    if (!status) return "#FFD700"; // Default gold for no status
    switch(status.toLowerCase()) {
      case "completed": return "#4CAF50"; // Green
      case "ongoing": return "#2196F3"; // Blue
      case "upcoming": return "#FF9800"; // Orange
      default: return "#FFD700"; // Gold
    }
  };

  const renderTournamentCard = ({ item, index }) => {
    const scale = scrollY.interpolate({
      inputRange: [-1, 0, index * 200, (index + 1) * 200],
      outputRange: [1, 1, 1, 0.95],
      extrapolate: 'clamp',
    });
    
    const opacity = scrollY.interpolate({
      inputRange: [-1, 0, index * 200, (index + 1) * 200],
      outputRange: [1, 1, 1, 0.7],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={[
          styles.cardContainer, 
          { 
            transform: [{ scale }],
            opacity,
            borderLeftColor: getStatusColor(item.status),
          }
        ]}
      >
        <LinearGradient
          colors={["#2c1259", "#3a1a6f", "#4b2387"]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{item.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status || "Completed"}</Text>
              </View>
            </View>
            <Text style={styles.dateRange}>
              {new Date(item.startdate).toLocaleDateString()} - {new Date(item.enddate).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <FontAwesome5 name="users" size={18} color="#9d85e0" />
                <Text style={styles.statValue}>{item.memberqty}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              
              <View style={styles.statItem}>
                <FontAwesome5 name="walking" size={18} color="#9d85e0" />
                <Text style={styles.statValue}>{item.Dailystep}</Text>
                <Text style={styles.statLabel}>Daily Steps</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="calendar-clock" size={18} color="#9d85e0" />
                <Text style={styles.statValue}>{item.days}</Text>
                <Text style={styles.statLabel}>Days</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.prizeContainer}>
              <View style={styles.prizeIcon}>
                <FontAwesome5 name="trophy" size={24} color="#FFD700" />
              </View>
              <View style={styles.prizeDetails}>
                <Text style={styles.prizeTitle}>Prize Pool</Text>
                <View style={styles.prizeValue}>
                  <Text style={styles.amount}>{item.Totalamount}</Text>
                  <Text style={styles.currency}>{item.Digital_Currency}</Text>
                </View>
                <Text style={styles.entryFee}>Entry: {item.Amount} {item.Digital_Currency}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              // Navigate to details or show modal
            }}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  };

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="trophy-outline" size={80} color="#6b46c1" />
      <Text style={styles.emptyTitle}>No Tournaments Found</Text>
      <Text style={styles.emptyText}>
        {selectedTab === "participated" 
          ? "You haven't participated in any tournaments yet." 
          : "You haven't created any tournaments yet."}
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          // Navigate to create or join tournament
        }}
      >
        <Text style={styles.emptyButtonText}>
          {selectedTab === "participated" ? "Join Tournament" : "Create Tournament"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={["#1a0033", "#4b0082", "#8a2be2"]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tournament History</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => handleTabPress("participated")}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabText, 
            selectedTab === "participated" && styles.activeTabText
          ]}>
            Participated
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => handleTabPress("created")}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabText, 
            selectedTab === "created" && styles.activeTabText
          ]}>
            Created
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabIndicatorContainer}>
        <Animated.View style={[styles.tabIndicator, animatedBarStyle]} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9d85e0" />
          <Text style={styles.loadingText}>Loading tournaments...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setIsLoading(true);
              setError("");
              // Retry fetching data
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          data={selectedTab === "participated" ? participated : created}
          renderItem={renderTournamentCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyList}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 20,
  },
  tabButton: {
    paddingVertical: 10,
    width: "45%",
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  activeTabText: {
    color: "white",
    fontWeight: "bold",
  },
  tabIndicatorContainer: {
    width: "90%",
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 3,
  },
  tabIndicator: {
    width: "50%",
    height: 3,
    backgroundColor: "#9d85e0",
    borderRadius: 3,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderLeftWidth: 5,
  },
  cardGradient: {
    borderRadius: 16,
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  dateRange: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  cardContent: {
    padding: 16,
    paddingTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 12,
  },
  prizeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  prizeIcon: {
    marginRight: 16,
  },
  prizeDetails: {
    flex: 1,
  },
  prizeTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  prizeValue: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  amount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFD700",
    marginRight: 4,
  },
  currency: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFD700",
    textTransform: "uppercase",
  },
  entryFee: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  detailsButtonText: {
    color: "white",
    fontWeight: "500",
    marginRight: 4,
  },
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#9d85e0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#9d85e0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default History;