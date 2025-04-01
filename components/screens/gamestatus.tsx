import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

// Get screen dimensions
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Types
type Player = {
  id: string;
  username: string;
  score: number;
  avatar?: string;
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
  days: number; // Number of days in the competition
};

const GameLeaderboard = () => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const dayTabsScrollViewRef = useRef<ScrollView>(null);
  
  const snapPoints = useMemo(() => ['50%', '70%'], []);

  // Handle presenting the bottom sheet
  const handlePresentBottomSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  // Scroll to active day tab
  const scrollToActiveDay = useCallback((day: number) => {
    if (dayTabsScrollViewRef.current) {
      // Calculate the position to scroll to
      const tabWidth = 80; // Approximate width of each tab
      const scrollPosition = (day - 1) * tabWidth;
      
      // Scroll to the position with animation
      dayTabsScrollViewRef.current.scrollTo({
        x: scrollPosition - SCREEN_WIDTH / 4, // Center the tab
        animated: true,
      });
    }
  }, []);

  // Fetch game data and players
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // In a real app, replace with your actual API endpoint
        // const response = await fetch('https://api.example.com/game/bonk-april');
        // const data = await response.json();
        
        // Mock data based on the screenshot with 18 days
        setGameData({
          id: '1',
          title: 'BONK April Maintenance',
          entry: '1M',
          duration: '30 Days',
          dateRange: '01/04 - 30/04',
          steps: '4k',
          players: {
            registered: 221,
            free: 303,
          },
          days: 18, // Using 18 days as requested
        });
        
        // Simulate API response delay
        setTimeout(() => {
          setLoading(false);
          // Auto-present the bottom sheet after data is loaded
          handlePresentBottomSheet();
        }, 1000);
      } catch (error) {
        console.error('Error fetching game data:', error);
        setLoading(false);
      }
    };

    const fetchPlayers = async () => {
      try {
        // In a real app, replace with your actual API endpoint
        // const response = await fetch(`https://api.example.com/game/bonk-april/leaderboard?day=${activeDay}`);
        // const data = await response.json();
        
        // Mock data based on the screenshot
        const mockPlayers: Player[] = [
          { id: '1', username: 'opebear', score: 30000, avatar: 'https://via.placeholder.com/40' },
          { id: '2', username: 'mydoan', score: 29498, avatar: 'https://via.placeholder.com/40' },
          { id: '3', username: 'a5868519', score: 27053, avatar: 'https://via.placeholder.com/40' },
          { id: '4', username: 'KoreaUniv', score: 26364, avatar: 'https://via.placeholder.com/40' },
          { id: '5', username: 'haydoidayctm', score: 21423, avatar: 'https://via.placeholder.com/40' },
          { id: '6', username: 'masato', score: 20655, avatar: 'https://via.placeholder.com/40' },
          { id: '7', username: 'longximing', score: 20095, avatar: 'https://via.placeholder.com/40' },
        ];
        
        setPlayers(mockPlayers);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    fetchGameData();
    fetchPlayers();
  }, [handlePresentBottomSheet]);

  // Update players when active day changes
  useEffect(() => {
    const fetchPlayersForDay = async () => {
      try {
        // In a real app, replace with your actual API endpoint
        // const response = await fetch(`https://api.example.com/game/bonk-april/leaderboard?day=${activeDay}`);
        // const data = await response.json();
        
        // For demo purposes, we'll just update the scores slightly based on the day
        const mockPlayers: Player[] = [
          { id: '1', username: 'opebear', score: 30000 + (activeDay * 100), avatar: 'https://via.placeholder.com/40' },
          { id: '2', username: 'mydoan', score: 29498 + (activeDay * 50), avatar: 'https://via.placeholder.com/40' },
          { id: '3', username: 'a5868519', score: 27053 + (activeDay * 75), avatar: 'https://via.placeholder.com/40' },
          { id: '4', username: 'KoreaUniv', score: 26364 + (activeDay * 60), avatar: 'https://via.placeholder.com/40' },
          { id: '5', username: 'haydoidayctm', score: 21423 + (activeDay * 90), avatar: 'https://via.placeholder.com/40' },
          { id: '6', username: 'masato', score: 20655 + (activeDay * 40), avatar: 'https://via.placeholder.com/40' },
          { id: '7', username: 'longximing', score: 20095 + (activeDay * 30), avatar: 'https://via.placeholder.com/40' },
        ];
        
        setPlayers(mockPlayers);
        
        // Scroll to the active day tab
        scrollToActiveDay(activeDay);
      } catch (error) {
        console.error('Error fetching players for day:', error);
      }
    };

    if (!loading && gameData) {
      fetchPlayersForDay();
    }
  }, [activeDay, loading, gameData, scrollToActiveDay]);

  const formatScore = (score: number): string => {
    return score >= 30000 ? '30k+' : score.toString();
  };

  // Generate day tabs dynamically based on the competition duration
  const renderDayTabs = () => {
    if (!gameData) return null;
    
    const tabs = [];
    for (let i = 1; i <= gameData.days; i++) {
      tabs.push(
        <TouchableOpacity
          key={`day-${i}`}
          style={[styles.dayTab, activeDay === i && styles.activeDayTab]}
          onPress={() => setActiveDay(i)}
        >
          <Text style={[styles.dayTabText, activeDay === i && styles.activeDayTabText]}>
            Day{i}
          </Text>
        </TouchableOpacity>
      );
    }
    return tabs;
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.container}>
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
            <ActivityIndicator size="large" color="#7FD4F5" style={styles.loader} />
          ) : (
            <View style={styles.gameCard}>
              <View style={styles.gameHeader}>
                <View style={styles.gameTitleContainer}>
                  <Image
                    source={{ uri: 'https://via.placeholder.com/50' }}
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
                      source={{ uri: 'https://via.placeholder.com/20' }}
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
                    {gameData?.players.registered}{' '}
                    <Text style={styles.freeText}>+ {gameData?.players.free} free</Text>
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.silhouetteContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.silhouette}
            />
          </View>

          {/* Bottom Sheet Modal */}
          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={snapPoints}
            handleIndicatorStyle={styles.bottomSheetIndicator}
            backgroundStyle={styles.bottomSheetBackground}
            backdropComponent={(props) => (
              <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.7}
              />
            )}
          >
            <BottomSheetView style={styles.bottomSheetContent}>
              <View style={styles.leaderboardHeader}>
                <View style={styles.userSortContainer}>
                  <Text style={styles.userLabel}>User</Text>
                  <Ionicons name="swap-vertical" size={18} color="#7FD4F5" />
                </View>
                
                {/* Horizontally scrollable day tabs */}
                <ScrollView
                  ref={dayTabsScrollViewRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dayTabsScrollContent}
                  style={styles.dayTabsScroll}
                >
                  {renderDayTabs()}
                </ScrollView>
              </View>
              
              <ScrollView style={styles.playersList}>
                {players.map((player) => (
                  <View key={player.id} style={styles.playerRow}>
                    <View style={styles.playerInfo}>
                      <Image
                        source={{ uri: player.avatar }}
                        style={styles.playerAvatar}
                      />
                      <Text style={styles.playerUsername}>{player.username}</Text>
                    </View>
                    <Text style={styles.playerScore}>
                      {formatScore(player.score)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </BottomSheetView>
          </BottomSheetModal>
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#1A2330',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  menuButton: {
    padding: 8,
  },
  
  // Loading indicator
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Game card styles
  gameCard: {
    margin: 16,
    backgroundColor: '#1E2734',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  gameTitle: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7FD4F5',
  },
  joinButton: {
    backgroundColor: '#7FD4F5',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#1A2330',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A3A4A',
    marginVertical: 16,
  },
  
  // Stats container styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#8A9AAB',
    marginBottom: 4,
    fontSize: 14,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  statValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  freeText: {
    color: '#8A9AAB',
    fontWeight: 'normal',
  },
  
  // Silhouette styles
  silhouetteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  silhouette: {
    width: 150,
    height: 150,
    tintColor: '#7FD4F5',
  },
  
  // Bottom sheet styles
  bottomSheetBackground: {
    backgroundColor: '#7FD4F5',
  },
  bottomSheetIndicator: {
    backgroundColor: '#555',
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: '#1E2734',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  
  // Leaderboard header styles
  leaderboardHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  userSortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userLabel: {
    color: 'white',
    marginRight: 8,
    fontSize: 16,
  },
  
  // Day tabs styles
  dayTabsScroll: {
    flexGrow: 0,
    marginTop: 8,
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
    alignItems: 'center',
  },
  activeDayTab: {
    backgroundColor: '#2A3A4A',
  },
  dayTabText: {
    color: '#8A9AAB',
    fontSize: 14,
  },
  activeDayTabText: {
    color: 'white',
    fontWeight: '500',
  },
  
  // Players list styles
  playersList: {
    flex: 1,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3A4A',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerUsername: {
    color: '#7FD4F5',
    fontSize: 16,
  },
  playerScore: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'right',
  },
});

export default GameLeaderboard;