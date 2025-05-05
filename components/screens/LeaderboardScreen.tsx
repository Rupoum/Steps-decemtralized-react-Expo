import React, {
  useCallback,
  useRef,
  useMemo,
  useState,
  useEffect,
} from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { BACKEND_URL } from "@/Backendurl";
import * as Haptics from "expo-haptics";
import AnimatedStarsBackground from "../utils/background";

interface FORM {
  steps: string | number;
  username: string;
  id: string;
  avatar: string;
}

const { width } = Dimensions.get("window");

export default function GamifiedLeaderboardScreen() {
  // State variables
  const [form, setform] = useState<FORM[]>([]);
  const [sleep, setsleep] = useState<FORM[]>([]);
  const [loading, setloading] = useState(false);
  const [showSleep, setShowSleep] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Bottom sheet ref and snap points
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%", "60%", "85%"], []);

  // Animated values for each rank
  const rankAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Handle bottom sheet changes
  const handleSheetChange = useCallback((index: number) => {
    if (index > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  // Fetch sleep data
  const fetchSleepData = async () => {
    try {
      setloading(true);
      const response = await axios.get(`${BACKEND_URL}/total/sleep`);
      const formattedData = response.data.data
        .map((dat: any, index: number) => ({
          id: dat.username,
          username: dat.username,
          steps: dat.steps,
          avatar:
            dat.avatar,
          rank: index + 1,
        }))
        .sort((a: any, b: any) => b.steps - a.steps);

      setSleepData(formattedData);
    } catch (e) {
      console.log(e);
    } finally {
      setloading(false);
    }
  };

  // Set sleep data
  const setSleepData = (data: FORM[]) => {
    setsleep(data);
    data.forEach((item) => {
      if (!rankAnimations[item.id]) {
        rankAnimations[item.id] = new Animated.Value(0);
      }
    });
    setTimeout(() => {
      data.forEach((item, index) => {
        Animated.timing(rankAnimations[item.id], {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      });
    }, 300);
  };

  // Fetch step data
  const fetchStepData = async () => {
    try {
      setloading(true);
      const response = await axios.get(`${BACKEND_URL}/total/steps`);
      console.log(response.data.data);
      const formattedData = response.data.data
        .map((dat: any, index: number) => ({
          id: dat.username,
          username: dat.username,
          steps: Number(dat.steps),
          avatar:
             dat.avatar,
          rank: index + 1,
        }))
        .sort((a: any, b: any) => b.steps - a.steps);
      console.log("format", formattedData);
      setStepData(formattedData);
    } catch (e) {
      console.log(e);
    } finally {
      setloading(false);
    }
  };

  // Set step data
  const setStepData = (data: FORM[]) => {
    setform(data);
    data.forEach((item) => {
      if (!rankAnimations[item.id]) {
        rankAnimations[item.id] = new Animated.Value(0);
      }
    });

    // Animate items sequentially
    setTimeout(() => {
      data.forEach((item, index) => {
        Animated.timing(rankAnimations[item.id], {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      });
    }, 300);
  };

  // Initial data fetch
  useEffect(() => {
    fetchStepData();
    fetchSleepData();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Fetch data when toggle changes
  useEffect(() => {
    if (showSleep) {
      fetchSleepData();
    } else {
      fetchStepData();
    }
  }, [showSleep]);

  const toggleData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowSleep((prev) => !prev);

    // Reset animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedUser(userId === selectedUser ? null : userId);
  };

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (showSleep) {
      fetchSleepData();
    } else {
      fetchStepData();
    }

    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Get medal emoji based on rank
  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  // Get background color based on rank
  const getRankColor = (rank: number) => {
    if (rank === 1) return "rgba(255, 215, 0, 0.15)"; // Gold
    if (rank === 2) return "rgba(192, 192, 192, 0.15)"; // Silver
    if (rank === 3) return "rgba(205, 127, 50, 0.15)"; // Bronze
    return "rgba(255, 255, 255, 0.05)"; // Default
  };

  // Get progress percentage for progress bar
  const getProgressPercentage = (value: number | string, max: number) => {
    const numValue = typeof value === "string" ? parseInt(value) : value;
    return Math.min((numValue / max) * 100, 100);
  };

  // Calculate max value for progress bar
  const getMaxValue = (data: FORM[]) => {
    if (data.length === 0) return 1;
    const maxItem = data[0];
    return typeof maxItem.steps === "string"
      ? parseInt(maxItem.steps)
      : maxItem.steps;
  };
  const renderItem = ({ item, index }: { item: FORM; index: number }) => {
    const isSelected = selectedUser === item.id;
    const displayValue = showSleep
      ? item.steps === 0
        ? "0h 0m"
        : `${item.steps}`
      : item.steps;

    // console.log("dasdsa",item.username);
    const rank = index + 1;
    const maxValue = getMaxValue(showSleep ? sleep : form);
    const progressPercentage = getProgressPercentage(item.steps, maxValue);
    const itemOpacity = rankAnimations[item.id] || new Animated.Value(0);
    const itemTranslateY = itemOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });
    return (
      <Animated.View
        style={[
          styles.itemContainer,
          {
            backgroundColor: isSelected
              ? "rgba(138, 43, 226, 0.3)"
              : getRankColor(rank),
            borderLeftWidth: isSelected ? 3 : 0,
            borderLeftColor: "#8a2be2",
            transform: [
              { translateY: itemTranslateY },
              { scale: isSelected ? 1.02 : 1 },
            ],
            opacity: itemOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.itemTouchable}
          onPress={() => handleUserSelect(item.id)}
          activeOpacity={0.7}
        >
          {/* Rank */}
          <View style={styles.rankColumn}>
            <Text style={[styles.index, rank <= 3 ? styles.topRank : null]}>
              {rank}
            </Text>
            <Text style={styles.medalText}>{getMedalEmoji(rank)}</Text>
          </View>

          {/* Avatar */}
          <View style={styles.avatarColumn}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            {rank <= 3 && (
              <View style={[styles.crown, { top: rank === 1 ? -15 : -10 }]}>
                <Text>{rank === 1 ? "👑" : ""}</Text>
              </View>
            )}
          </View>
          <View style={styles.usernameColumn}>
            <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
              {item.username}
            </Text>
            {isSelected && (
              <Text style={styles.selectedText}>
                {showSleep ? "Sleep Champion" : "Fitness Master"}
              </Text>
            )}
          </View>

          {/* Score */}
          <View style={styles.stepsColumn}>
            <Text style={[styles.text, rank <= 3 ? styles.topRankScore : null]}>
              {displayValue}
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor:
                      rank === 1
                        ? "#FFD700"
                        : rank === 2
                        ? "#C0C0C0"
                        : rank === 3
                        ? "#CD7F32"
                        : "#8a2be2",
                  },
                ]}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a0033", "#4b0082", "#290d44"]}
        style={styles.gradient}
      >
        <AnimatedStarsBackground />
        <Text style={styles.subtitleText}>
          {showSleep
            ? "Who's getting the best rest ?"
            : "Who's crushing their goals ?"}
        </Text>
        <Animated.View
          style={[
            styles.backgroundContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Background decorative elements */}
          {/* <Animated.View
            style={[
              styles.decorCircle,
              styles.decorCircle1,
              { transform: [{ rotate: spin }] },
            ]}
          />
          <Animated.View
            style={[
              styles.decorCircle,
              styles.decorCircle2,
              { transform: [{ scale: pulseAnim }] },
            ]}
          /> */}

          {/* Main background image */}
          <Image
            source={require("../../assets/images/Run2.gif")}
            style={styles.backgroundImage}
          />

          {/* Title overlay */}
          {/* <Animated.View 
            style={[
              styles.titleOverlay,
              {
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim
              }
            ]}
          >
            <Text style={styles.titleText}>
              {showSleep ? "SLEEP MASTERS" : "FITNESS LEGENDS"}
            </Text>
            <Text style={styles.subtitleText}>
              {showSleep ? "Who's getting the best rest?" : "Who's crushing their goals?"}
            </Text>
          </Animated.View> */}
        </Animated.View>
      </LinearGradient>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
        animateOnMount={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
        style={styles.bottomSheet}
      >
        <View style={styles.bottomSheetContent}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Leaderboard</Text>
              <Text style={styles.headerSubtitle}>
                {showSleep ? "Sleep Champions" : "Step Masters"}
              </Text>
            </View>

            {/* Toggle switch */}
            <View style={styles.toggleContainer}>
              <Text
                style={[
                  styles.toggleLabel,
                  !showSleep && styles.activeToggleLabel,
                ]}
              >
                Steps
              </Text>
              <Switch
                trackColor={{ false: "#4b0082", true: "#4b0082" }}
                thumbColor={showSleep ? "#FFD700" : "#06D6A0"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleData}
                value={showSleep}
                style={styles.toggle}
              />
              <Text
                style={[
                  styles.toggleLabel,
                  showSleep && styles.activeToggleLabel,
                ]}
              >
                Sleep
              </Text>
            </View>
          </View>

          {/* Refresh button */}

          {/* Leaderboard content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8a2be2" />
              <Text style={styles.loadingText}>Loading champions...</Text>
            </View>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Column headers */}
              <View style={styles.headings}>
                <Text style={styles.headingFont}>Rank</Text>
                <Text style={styles.headingFont}>Avatar</Text>
                <Text style={styles.headingFont}>User</Text>
                <Text style={styles.headingFont}>
                  {showSleep ? "Sleep Hours" : "Fitness XP"}
                </Text>
              </View>
              <BottomSheetFlatList
                data={showSleep ? sleep : form}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.contentContainer}
                // showsVerticalScrollIndicator={false}
                // onRefresh={handleRefresh}
                // refreshing={refreshing}
              />
            </Animated.View>
          )}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#1E2130",
  },
  backgroundContent: {
    flex: 1,
    justifyContent: "center",
    // marginTop: 40,
    marginBottom: 90,
    alignItems: "center",
    position: "relative",
  },
  backgroundImage: {
    width: "100%",
    height: "70%",
    // resizeMode: "cover",
  },
  decorCircle: {
    position: "absolute",
    borderRadius: 150,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  decorCircle1: {
    width: 300,
    height: 300,
    top: "10%",
    borderColor: "rgba(138, 43, 226, 0.2)",
  },
  decorCircle2: {
    width: 200,
    height: 200,
    top: "15%",
    borderColor: "rgba(255, 215, 0, 0.2)",
  },
  titleOverlay: {
    position: "absolute",
    top: "15%",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 15,
    width: "90%",
  },
  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    // marginTop: 5,
    alignSelf: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    marginTop: 25,
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    textAlign: "left",
  },
  itemContainer: {
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  itemTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  rankColumn: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarColumn: {
    width: 50,
    paddingLeft: 50,
    alignItems: "center",
    position: "relative",
  },
  usernameColumn: {
    flex: 1,
    paddingLeft: 60,
    paddingRight: 5,
  },
  stepsColumn: {
    width: 80,
    alignItems: "flex-end",
  },
  index: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.7)",
  },
  topRank: {
    fontSize: 18,
    color: "#FFD700",
    fontWeight: "900",
  },
  topRankScore: {
    color: "#FFD700",
  },
  medalText: {
    fontSize: 12,
    marginTop: 2,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  crown: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 10,
  },
  contentContainer: {
    paddingBottom: 180,
    paddingTop: 5,
  },
  headings: {
    flexDirection: "row",
    marginBottom: 10,
    paddingHorizontal: 25,
    justifyContent: "space-between",
    paddingTop: 10,
  },
  headingFont: {
    fontSize: 13,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.6)",
    // width: 80,
  },
  bottomSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  bottomSheetBackground: {
    backgroundColor: "#1a0033",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  bottomSheetIndicator: {
    backgroundColor: "#CCCCCC",
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  bottomSheetContent: {
    backgroundColor: "#1a0033",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 15,
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingTop: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 5,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 20,
    padding: 5,
  },
  toggle: {
    marginHorizontal: 5,
  },
  toggleLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    paddingHorizontal: 5,
  },
  activeToggleLabel: {
    color: "white",
    fontWeight: "bold",
  },
  progressBarContainer: {
    width: 60,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    marginTop: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  selectedText: {
    fontSize: 11,
    color: "#8a2be2",
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 10,
    fontSize: 16,
  },
  refreshButton: {
    backgroundColor: "rgba(138, 43, 226, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(138, 43, 226, 0.3)",
  },
  refreshText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "500",
  },
});
