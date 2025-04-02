import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Player = {
  id: string;
  username: string;
  score: number;
  avatar?: string;
  dailySteps: number[];
};

type GameData = {
  id: string;
  title: string;
  entry: string;
  duration: string;
  dateRange: string;
  steps: string;
  players: {
    registered: number;
    free: number;
  };
  days: number;
};

const GameLeaderboard = () => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const dayTabsScrollViewRef = useRef<ScrollView>(null);
  const mainScrollViewRef = useRef<ScrollView>(null);
  const horizontalScrollRef = useRef<ScrollView>(null);
  const verticalScrollRef = useRef<ScrollView>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const snapPoints = useMemo(() => ["25%", "60%", "85%"], []);

  const handleVerticalScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Sync horizontal scroll with vertical scroll
    if (horizontalScrollRef.current) {
      horizontalScrollRef.current.scrollTo({
        x: event.nativeEvent.contentOffset.x,
        animated: false,
      });
    }
  } 
  const handleHorizontalScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Sync vertical scroll with horizontal scroll
    if (verticalScrollRef.current) {
      verticalScrollRef.current.scrollTo({
        y: event.nativeEvent.contentOffset.y,
        animated: false,
      });
    }
  };
  const handlePresentBottomSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const scrollToActiveDay = useCallback((day: number) => {
    if (dayTabsScrollViewRef.current) {
      const tabWidth = 80;
      const scrollPosition = (day - 1) * tabWidth;
      dayTabsScrollViewRef.current.scrollTo({
        x: scrollPosition - SCREEN_WIDTH / 4,
        animated: true,
      });
    }
  }, []);

  const handleDayPress = useCallback((day: number) => {
    setActiveDay(day);
    scrollToActiveDay(day);
  }, [scrollToActiveDay]);

  const generateRandomSteps = () => {
    return Array.from(
      { length: 30 },
      () => Math.floor(Math.random() * 10000) + 1000
    );
  };

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setGameData({
          id: "1",
          title: "BONK April Maintenance",
          entry: "1M",
          duration: "30 Days",
          dateRange: "01/04 - 30/04",
          steps: "4k",
          players: {
            registered: 221,
            free: 303,
          },
          days: 12,
        });

        setTimeout(() => {
          setLoading(false);
          handlePresentBottomSheet();
        }, 1000);
      } catch (error) {
        console.error("Error fetching game data:", error);
        setLoading(false);
      }
    };

    const fetchPlayers = async () => {
      try {
        // Generate more players for better scrolling demonstration
        const mockPlayers: Player[] = Array.from({ length: 50 }, (_, i) => ({
          id: `${i + 1}`,
          username: `user${i + 1}`,
          score: 30000 - i * 500,
          avatar: "https://via.placeholder.com/40",
          dailySteps: generateRandomSteps(),
        }));

        setPlayers(mockPlayers);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchGameData();
    fetchPlayers();
  }, [handlePresentBottomSheet]);

  useEffect(() => {
    // Scroll to active day when it changes
    scrollToActiveDay(activeDay);
  }, [activeDay, scrollToActiveDay]);

  // const renderPlayerRow = ({ item }: { item: Player }) => (
  //   <View style={styles.playerRow}>
  //     <View style={styles.playerInfo}>
  //       <Image source={{ uri: item.avatar }} style={styles.playerAvatar} />
  //       <Text style={styles.playerUsername} numberOfLines={1}>
  //         {item.username}
  //       </Text>
  //     </View>

  //     <ScrollView
  //       horizontal
  //       showsHorizontalScrollIndicator={false}
  //       contentContainerStyle={styles.daysScrollContainer}
  //       snapToInterval={80} // Snap to each day cell
  //       decelerationRate="fast"
  //     >
  //       {item.dailySteps.map((steps, dayIndex) => (
  //         <TouchableOpacity
  //           key={`day-${dayIndex}`}
  //           style={[
  //             styles.dayCell,
  //             activeDay === dayIndex + 1 && styles.activeDayCell,
  //           ]}
  //           onPress={() => handleDayPress(dayIndex + 1)}
  //         >
  //           <Text 
  //             style={[
  //               styles.dayCellText,
  //               activeDay === dayIndex + 1 && styles.activeDayCellText
  //             ]}
  //           >
  //             {steps}
  //           </Text>
  //           <Text 
  //             style={[
  //               styles.dayLabel,
  //               activeDay === dayIndex + 1 && styles.activeDayLabel
  //             ]}
  //           >
  //             Day {dayIndex + 1}
  //           </Text>
  //         </TouchableOpacity>
  //       ))}
  //     </ScrollView>
  //   </View>
  // );
  const renderPlayerRow = ({ item }: { item: Player }) => (
    <View style={styles.playerRow}>
      <View style={styles.playerInfo}>
        <Image source={{ uri: item.avatar }} style={styles.playerAvatar} />
        <Text style={styles.playerUsername} numberOfLines={1}>
          {item.username}
        </Text>
      </View>
      
      <View style={styles.daysRow}>
        {item.dailySteps.map((steps, dayIndex) => (
          <TouchableOpacity
            key={`day-${dayIndex}`}
            style={[
              styles.dayCell,
              activeDay === dayIndex + 1 && styles.activeDayCell,
            ]}
            onPress={() => handleDayPress(dayIndex + 1)}
          >
            <Text 
              style={[
                styles.dayCellText,
                activeDay === dayIndex + 1 && styles.activeDayCellText
              ]}
            >
              {steps}
            </Text>
            <Text 
              style={[
                styles.dayLabel,
                activeDay === dayIndex + 1 && styles.activeDayLabel
              ]}
            >
              Day {dayIndex + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDayTabs = () => {
    if (!gameData) return null;

    return (
      <ScrollView
        ref={dayTabsScrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayTabsScrollContent}
        snapToInterval={78} // Width of tab + margin
        decelerationRate="fast"
      >
        {Array.from({ length: gameData.days }).map((_, index) => (
          <TouchableOpacity
            key={`day-tab-${index + 1}`}
            style={[
              styles.dayTab,
              activeDay === index + 1 && styles.activeDayTab,
            ]}
            onPress={() => handleDayPress(index + 1)}
          >
            <Text
              style={[
                styles.dayTabText,
                activeDay === index + 1 && styles.activeDayTabText,
              ]}
            >
              Day {index + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderLeaderboardHeader = () => (
    <View style={styles.leaderboardHeader}>
      <Text style={styles.leaderboardTitle}>Leaderboard</Text>
      {renderDayTabs()}
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <LinearGradient
          colors={["#1a0033", "#4b0082", "#290d44"]}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={mainScrollViewRef}
            contentContainerStyle={styles.mainScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Game</Text>
              <TouchableOpacity style={styles.menuButton}>
                <Ionicons name="ellipsis-vertical" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator
                size="large"
                color="#7FD4F5"
                style={styles.loader}
              />
            ) : (
              <View style={styles.gameCard}>
                <View style={styles.gameHeader}>
                  <View style={styles.gameTitleContainer}>
                    <Image
                      source={{ uri: "https://via.placeholder.com/50" }}
                      style={styles.gameIcon}
                    />
                    <Text style={styles.gameTitle}>{gameData?.title}</Text>
                  </View>
                  <TouchableOpacity style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>Join</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Entry</Text>
                    <View style={styles.statValueContainer}>
                      <Image
                        source={{ uri: "https://via.placeholder.com/20" }}
                        style={styles.statIcon}
                      />
                      <Text style={styles.statValue}>{gameData?.entry}</Text>
                    </View>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>{gameData?.duration}</Text>
                    <Text style={styles.statValue}>{gameData?.dateRange}</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Steps</Text>
                    <Text style={styles.statValue}>{gameData?.steps}</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Players</Text>
                    <Text style={styles.statValue}>
                      {gameData?.players.registered}{" "}
                      <Text style={styles.freeText}>
                        + {gameData?.players.free} free
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.silhouetteContainer}>
              <Image
                source={{ uri: "https://via.placeholder.com/150" }}
                style={styles.silhouette}
              />
            </View>
          </ScrollView>
          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={1}
            snapPoints={snapPoints}
            enablePanDownToClose={false}
            handleIndicatorStyle={{ backgroundColor: "white", width: 40 }}
            backgroundStyle={styles.bottomSheetBackground}
          >
            <View style={styles.bottomSheetContainer}>
              {renderLeaderboardHeader()}
              
              {/* Horizontal Scroll for Days */}
              <ScrollView
                ref={horizontalScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.daysHeaderScroll}
                scrollEventThrottle={16}
                onScroll={handleHorizontalScroll}
              >
                <View style={{ width: 120 }} /> {/* Spacer for player info column */}
                {Array.from({ length: gameData?.days || 0 }).map((_, index) => (
                  <View key={`day-header-${index}`} style={styles.dayHeader}>
                    <Text style={styles.dayHeaderText}>Day {index + 1}</Text>
                  </View>
                ))}
              </ScrollView>
              
              {/* Vertical Scroll for Players */}
              <ScrollView
                ref={verticalScrollRef}
                scrollEventThrottle={16}
                onScroll={handleVerticalScroll}
                showsVerticalScrollIndicator={false}
              >
                <BottomSheetFlatList
                  data={players}
                  renderItem={renderPlayerRow}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.bottomSheetContent}
                  scrollEnabled={false} // We handle scrolling with the parent ScrollView
                />
              </ScrollView>
            </View>
          </BottomSheetModal>
        </LinearGradient>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A2330",
  },
  mainScrollContent: {
    flexGrow: 1,
  },
  daysHeaderScroll: {
    paddingLeft: 16,
    backgroundColor: '#1a0033',
  },
  dayHeader: {
    width: 80,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2A3A4A',
  },
  dayHeaderText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  daysRow: {
    flexDirection: 'row',
    paddingLeft: 8,
  },
  bottomSheetContainer: {
    flex: 1,
    backgroundColor: '#1a0033',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  menuButton: {
    padding: 8,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  gameCard: {
    margin: 16,
    backgroundColor: "#1E2734",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gameTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  gameIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  gameTitle: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: "bold",
    color: "#7FD4F5",
    flexShrink: 1,
  },
  joinButton: {
    backgroundColor: "#7FD4F5",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  joinButtonText: {
    color: "#1A2330",
    fontWeight: "bold",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#2A3A4A",
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    color: "#8A9AAB",
    marginBottom: 4,
    fontSize: 14,
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  statValue: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  // bottomSheetContainer: {
  //   flex: 1,
  //   backgroundColor: '#1a0033',
  // },
  // bottomSheetContent: {
  //   paddingHorizontal: 16,
  // },
  freeText: {
    color: "#8A9AAB",
    fontWeight: "normal",
  },
  silhouetteContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
    marginVertical: 20,
  },
  silhouette: {
    width: 150,
    height: 150,
    tintColor: "#7FD4F5",
  },
  bottomSheetBackground: {
    backgroundColor: "#7E3887",
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: "#1a0033",
  },
  leaderboardHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#1a0033",
    zIndex: 1,
  },
  leaderboardTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  dayTabsScrollContent: {
    paddingRight: 16,
  },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    minWidth: 70,
    alignItems: "center",
    backgroundColor: "#2A3A4A",
  },
  activeDayTab: {
    backgroundColor: "#7FD4F5",
  },
  dayTabText: {
    color: "#8A9AAB",
    fontSize: 14,
  },
  activeDayTabText: {
    color: "#1A2330",
    fontWeight: "500",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A3A4A",
    minHeight: 60,
    paddingHorizontal: 16,
  },
  playerInfo: {
    width: 120,
    flexDirection: "row",
    alignItems: "center",
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerUsername: {
    color: "#7FD4F5",
    fontSize: 14,
    flexShrink: 1,
  },
  daysScrollContainer: {
    flexGrow: 1,
    paddingLeft: 8,
  },
  dayCell: {
    width: 80,
    padding: 6,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#2A3A4A",
    alignItems: "center",
  },
  activeDayCell: {
    backgroundColor: "#7FD4F5",
  },
  dayCellText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  activeDayCellText: {
    color: "#1A2330",
  },
  dayLabel: {
    color: "#8A9AAB",
    fontSize: 10,
    marginTop: 2,
  },
  activeDayLabel: {
    color: "#1A2330",
  },
  bottomPadding: {
    height: 40,
  },
});

export default GameLeaderboard;