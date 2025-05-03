
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
  Dimensions,
  Easing,
} from "react-native"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { LinearGradient } from "expo-linear-gradient"
import Ionicons from "@expo/vector-icons/Ionicons"
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"
import React from "react"
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { router } from "expo-router"
import { FlatList } from "react-native-gesture-handler"
import axios from "axios"
import { BACKEND_URL } from "@/Backendurl"

const { width, height } = Dimensions.get("window")

// Animated stars component for background
const AnimatedStars = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const size = Math.random() * 3 + 1
      return {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        opacity: new Animated.Value(Math.random()),
        speed: Math.random() * 2000 + 1000,
      }
    })
  }, [])

  useEffect(() => {
    stars.forEach((star) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: 0.2,
            duration: star.speed,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: 1,
            duration: star.speed,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    })
  }, [stars])

  return (
    <View style={styles.starsContainer}>
      {stars.map((star) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
    </View>
  )
}

// Level progress bar component
// const LevelProgressBar = ({ level, experience, nextLevelExp }) => {
//   const progress = (experience / nextLevelExp) * 100

//   return (
//     <View style={styles.levelContainer}>
//       {/* <View style={styles.levelInfo}>
//         <View style={styles.levelBadge}>
//           <Text style={styles.levelText}>{level}</Text>
//         </View>
//         <Text style={styles.levelLabel}>Level {level}</Text>
//       </View>
//       <View style={styles.progressBarContainer}>
//         <View style={[styles.progressBar, { width: `${progress}%` }]} />
//       </View>
//       <Text style={styles.experienceText}>
//         {experience}/{nextLevelExp} XP
//       </Text> */}
//     </View>
//   )
// }

// // Achievement badge component
// const AchievementBadge = ({ icon, count, color, label }) => {
//   return (
//     <View style={styles.achievementBadge}>
//       <View style={[styles.badgeIconContainer, { backgroundColor: color }]}>
//         <FontAwesome5 name={icon} size={18} color="#fff" />
//       </View>
//       <Text style={styles.badgeCount}>{count}</Text>
//       <Text style={styles.badgeLabel}>{label}</Text>
//     </View>
//   )
// }

const ProfileScreen = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const bottomSheetModalRef2 = useRef<BottomSheetModal>(null)
  const [selectedTab, setSelectedTab] = useState<"friends" | "search">("friends")
  const animatedValue = useRef(new Animated.Value(0)).current
  const [notificationCount, setNotificationCount] = useState(0)
  const [username, setUsername] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(false)
  const [friends, setFriends] = useState([])

  // Animation values
  const profileScale = useRef(new Animated.Value(0.9)).current
  const optionsOpacity = useRef(new Animated.Value(0)).current
  const notificationBounce = useRef(new Animated.Value(0)).current

  // Game stats (mock data - would come from API in real app)
  const [userStats, setUserStats] = useState({
    level: 8,
    experience: 750,
    nextLevelExp: 1000,
    achievements: {
      sleepStreak: 12,
      perfectWeeks: 3,
      badges: 7,
    },
    stats: {
      avgSleep: "7.5h",
      bestStreak: "14 days",
      totalQuests: 5,
    },
  })

  useEffect(() => {
    // Animate elements on mount
    Animated.stagger(200, [
      Animated.spring(profileScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(optionsOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()

    // Notification bounce animation
    if (notificationCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(notificationBounce, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(notificationBounce, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    }

    // Fetch notification count
    const fetchNotificationCount = async () => {
      try {
        const userid = await AsyncStorage.getItem("userid")
        const response = await axios.get(`${BACKEND_URL}/friend/request/${userid}`)
        setNotificationCount(response.data.message.length)
      } catch (error) {
        console.error("Error fetching notification count:", error)
      }
    }

    fetchNotificationCount()
  }, [])

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const username = await AsyncStorage.getItem("username")
        if (username) {
          setUsername(username)
        }
        const userid = await AsyncStorage.getItem("userid")
        const response = await axios.get(`${BACKEND_URL}/get/friends/${userid}`)
        setFriends(response.data.user)
      } catch (e) {
        console.log(e)
      }
    }
    fetchFriends()
  }, [refreshTrigger])

  const logout = async () => {
    await AsyncStorage.removeItem("token")
    await AsyncStorage.removeItem("userid")
    await AsyncStorage.removeItem("PublicKey")
    router.push("/(auth)/welcome")
  }

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  const handlePresentSearchModalPress = useCallback(() => {
    bottomSheetModalRef2.current?.present()
  }, [])

  const snapPoints = useMemo(() => ["50%", "70%"], [])
  const snapPoints2 = useMemo(() => ["50%"], [])

  const handleTabPress = (tab: "friends" | "search") => {
    setSelectedTab(tab)
    Animated.timing(animatedValue, {
      toValue: tab === "friends" ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }

  const animatedBarStyle = {
    transform: [
      {
        translateX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 202],
        }),
      },
    ],
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsLoading(true)
    try {
      const userid = await AsyncStorage.getItem("userid")
      const response = await axios.get(`${BACKEND_URL}/all/users/${userid}?search=${searchQuery}`)
      setSearchResults(response.data.users)
    } catch (error) {
      console.error("Error fetching search results:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addFriend = async (username: string) => {
    try {
      setIsLoading(true)
      const userid = await AsyncStorage.getItem("userid")
      const response = await axios.post(`${BACKEND_URL}/add/friend`, {
        username: username,
        userid: userid,
      })
      ToastAndroid.show("Friend request sent!", ToastAndroid.SHORT)
      setRefreshTrigger((prev) => !prev)
    } catch (error) {
      console.log(error)
      ToastAndroid.show("Failed to send request", ToastAndroid.SHORT)
    } finally {
      setIsLoading(false)
    }
  }

  // Option item with animation
  const OptionItem = ({ icon, label, onPress, color = "#783887" }) => {
    const buttonScale = useRef(new Animated.Value(1)).current

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start()

      onPress()
    }

    return (
      <Animated.View style={{ opacity: optionsOpacity, transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity onPress={handlePress}>
          <View style={styles.options}>
            <View style={[styles.optionIconContainer, { backgroundColor: color }]}>
              <Ionicons name={icon} size={20} color="white" />
            </View>
            <Text style={styles.optionText}>{label}</Text>
            <Ionicons name="chevron-forward-outline" size={24} color="white" style={styles.optionArrow} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <BottomSheetModalProvider>
      <LinearGradient colors={["#1a0033", "#4b0082", "#290d44"]} style={styles.gradient}>
        <AnimatedStars />

        <View style={styles.container}>
          {/* Header with notification */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Profile</Text>
            <TouchableOpacity onPress={() => router.push("/(nonav)/notification")} style={styles.notificationButton}>
              <Ionicons name="notifications" size={24} color="#FFD700" />
              {notificationCount > 0 && (
                <Animated.View style={[styles.notificationBadge, { transform: [{ scale: notificationBounce }] }]}>
                  <Text style={styles.notificationText}>{notificationCount}</Text>
                </Animated.View>
              )}
            </TouchableOpacity>
          </View>

          {/* Profile card with animations */}
          <Animated.View style={[styles.profileCardContainer, { transform: [{ scale: profileScale }] }]}>
            <LinearGradient colors={["rgba(120, 56, 135, 0.8)", "rgba(26, 0, 51, 0.9)"]} style={styles.profileCard}>
              <Image source={require("../../assets/images/profile.png")} style={styles.profileImage} />
              <View style={styles.profileInfo}>
                <Text style={styles.username}>{username}</Text>
                {/* <LevelProgressBar
                  level={userStats.level}
                  experience={userStats.experience}
                  nextLevelExp={userStats.nextLevelExp}
                /> */}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Achievement badges */}
          <View style={styles.achievementsContainer}>
            {/* <AchievementBadge
              icon="moon"
              count={userStats.achievements.sleepStreak}
              color="#7FD4F5"
              label="Sleep Streak"
            /> */}
            {/* <AchievementBadge
              icon="calendar-check"
              count={userStats.achievements.perfectWeeks}
              color="#4ADE80"
              label="Perfect Weeks"
            /> */}
            {/* <AchievementBadge icon="medal" count={userStats.achievements.badges} color="#FFD700" label="Badges" /> */}
          </View>

          {/* Stats summary */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.stats.avgSleep}</Text>
              <Text style={styles.statLabel}>Avg. Sleep</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.stats.bestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.stats.totalQuests}</Text>
              <Text style={styles.statLabel}>Quests</Text>
            </View>
          </View>

          {/* Menu options */}
          <View style={styles.optionsContainer}>
            <OptionItem icon="people" label="Friends" color="#7FD4F5" onPress={handlePresentModalPress} />
            <OptionItem
              icon="bed"
              label="Sleep Goals"
              color="#4ADE80"
              onPress={() => router.push("/(nonav)/setGoals")}
            />
            <OptionItem
              icon="trophy"
              label="Achievements"
              color="#FFD700"
              onPress={() => router.push("/(nonav)/achievments")}
            />
            {/* <OptionItem
              icon="footsteps"
              label="Step Provider"
              color="#FF9F1C"
              onPress={() => router.push("/(nonav)/Stake")}
            /> */}
          </View>

          {/* Logout button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutText}>Logout</Text>
              <Ionicons name="log-out-outline" size={25} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Friends Bottom Sheet Modal */}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          snapPoints={snapPoints}
          index={1}
          backgroundStyle={styles.bottomSheetBackground}
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.9} />
          )}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            <View style={styles.bottomSheetHandle} />

            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity onPress={() => handleTabPress("friends")}>
                <View>
                  <Text style={[styles.tabText, selectedTab === "friends" && styles.activeTabText]}>My Friends</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleTabPress("search")}>
                <View>
                  <Text style={[styles.tabText, selectedTab === "search" && styles.activeTabText]}>Search</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.tabIndicatorContainer}>
              <Animated.View style={[styles.tabIndicator, animatedBarStyle]} />
            </View>

            {selectedTab === "friends" ? (
              <BottomSheetFlatList
                data={friends}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.friendItem}>
                    <View style={styles.friendAvatar}>
                      <Text style={styles.friendAvatarText}>{item.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.friendText}>{item}</Text>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="account-group" size={50} color="#783887" />
                    <Text style={styles.emptyText}>No friends yet, add friends!</Text>
                  </View>
                }
              />
            ) : (
              <View style={styles.searchView}>
                <View style={styles.searchBar}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a user..."
                    placeholderTextColor="#9e9a99"
                    onChangeText={setSearchQuery}
                  />
                  <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Ionicons name="search" size={20} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Loader */}
                {isLoading ? (
                  <ActivityIndicator size="large" color="#9C89FF" />
                ) : (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.searchResultItem}>
                        <View style={styles.searchResultUser}>
                          <View style={styles.searchResultAvatar}>
                            <Text style={styles.searchResultAvatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                          </View>
                          <Text style={styles.searchResultText}>{item.username}</Text>
                        </View>
                        {item.status === "requested" ? (
                          <View style={[styles.addButton, styles.requestedButton]}>
                            <Text style={styles.addButtonText}>Requested</Text>
                          </View>
                        ) : item.status === "accepted" ? (
                          <View style={[styles.addButton, styles.friendButton]}>
                            <Text style={styles.addButtonText}>Friends</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[styles.addButton, styles.addButtonActive]}
                            onPress={() => addFriend(item.username)}
                          >
                            <Text style={styles.addButtonText}>Add</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                    ListEmptyComponent={
                      searchQuery ? (
                        <View style={styles.emptyContainer}>
                          <Text style={styles.emptyText}>No users found</Text>
                        </View>
                      ) : null
                    }
                  />
                )}
              </View>
            )}
          </BottomSheetView>
        </BottomSheetModal>

        {/* Search Bottom Sheet Modal */}
        <BottomSheetModal
          ref={bottomSheetModalRef2}
          snapPoints={snapPoints2}
          backgroundStyle={styles.bottomSheetBackground}
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.9} />
          )}
        >
          <BottomSheetView>
            <View style={styles.bottomSheetContent}>
              <View style={styles.bottomSheetHandle} />
              <Text style={styles.bottomSheetTitle}>Search Game</Text>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      </LinearGradient>
    </BottomSheetModalProvider>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  starsContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  star: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  notificationButton: {
    position: "relative",
    padding: 5,
  },
  notificationBadge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "#FF4500",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  profileCardContainer: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#7FD4F5",
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  username: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  levelContainer: {
    width: "100%",
  },
  levelInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  levelBadge: {
    backgroundColor: "#FFD700",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  levelText: {
    color: "#1a0033",
    fontSize: 14,
    fontWeight: "bold",
  },
  levelLabel: {
    color: "#D1D5DB",
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#7FD4F5",
    borderRadius: 4,
  },
  experienceText: {
    color: "#D1D5DB",
    fontSize: 12,
  },
  achievementsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  achievementBadge: {
    alignItems: "center",
    flex: 1,
  },
  badgeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  badgeCount: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  badgeLabel: {
    color: "#D1D5DB",
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(26, 0, 51, 0.7)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#783887",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statLabel: {
    color: "#D1D5DB",
    fontSize: 12,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  options: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26, 0, 51, 0.7)",
    marginBottom: 10,
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#783887",
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  optionText: {
    color: "white",
    fontSize: 16,
    flex: 1,
  },
  optionArrow: {
    position: "absolute",
    right: 15,
  },
  logoutContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.5)",
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  bottomSheetBackground: {
    backgroundColor: "#290d44",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: "#783887",
  },
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#783887",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  bottomSheetTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  tabText: {
    color: "#9e9a99",
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: 20,
  },
  activeTabText: {
    color: "white",
    fontWeight: "bold",
  },
  tabIndicatorContainer: {
    marginTop: 10,
    width: "90%",
    height: 3,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 20,
  },
  tabIndicator: {
    width: "45%",
    height: 3,
    backgroundColor: "#7FD4F5",
    borderRadius: 1.5,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: "rgba(26, 0, 51, 0.7)",
    borderWidth: 1,
    borderColor: "#783887",
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#783887",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  friendAvatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  friendText: {
    color: "white",
    fontSize: 16,
  },
  searchView: {
    alignItems: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26, 0, 51, 0.7)",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
    // marginHorizontal: (20,0,51,0.7)
    // borderRadius: 15,
    // paddingHorizontal: 15,
    // marginBottom: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#783887",
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
    paddingVertical: 12,
  },
  searchButton: {
    padding: 10,
    backgroundColor: "#783887",
    borderRadius: 10,
  },
  searchResultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(26, 0, 51, 0.7)",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    width: 330,
    borderWidth: 1,
    borderColor: "#783887",
  },
  searchResultUser: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchResultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#783887",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  searchResultAvatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  searchResultText: {
    color: "white",
    fontSize: 16,
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonActive: {
    backgroundColor: "#7FD4F5",
  },
  requestedButton: {
    backgroundColor: "#9e9a99",
  },
  friendButton: {
    backgroundColor: "#4ADE80",
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    padding: 20,
  },
  emptyText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
})

export default ProfileScreen
