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
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { FlatList } from "react-native-gesture-handler";
import axios from "axios";
import { BACKEND_URL } from "@/Backendurl";
import { useEvent } from "react-native-reanimated";

const ProfileScreen = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedTab, setSelectedTab] = useState<"friends" | "search">(
    "friends"
  );
  const animatedValue = useRef(new Animated.Value(0)).current;

  interface Friend {
    username: string;
    status: string;
  }
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userid");
    await AsyncStorage.removeItem("PublicKey");
    router.push("/(auth)/welcome");
  };
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleDismissModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);
  const snapPoints = useMemo(() => ["50%", "70%"], []);

  const handleTabPress = (tab: "friends" | "search") => {
    setSelectedTab(tab);
    Animated.timing(animatedValue, {
      toValue: tab === "friends" ? 0 : 1,
      duration: 300,

      useNativeDriver: false,
    }).start();
  };

  const animatedBarStyle = {
    transform: [
      {
        translateX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 202],
        }),
      },
    ],
  };
  const [username, setusername] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [friends, setfriends] = useState([]);
  let Fetchfriend: any = null;
  useEffect(() => {
    Fetchfriend = async () => {
      try {
        const username = await AsyncStorage.getItem("username");
        if (username) {
          setusername(username);
        }
        const userid = await AsyncStorage.getItem("userid");
        console.log(userid);
        const response = await axios.get(
          `${BACKEND_URL}/get/friends/${userid}`
        );
        console.log(response.data.user);
        setfriends(response.data.user);
      } catch (e) {
        console.log(e);
      }
    };
    Fetchfriend();
  }, [refreshTrigger]);
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const userid = await AsyncStorage.getItem("userid");
      console.log(userid);
      console.log(BACKEND_URL);
      const response = await axios.get(
        `${BACKEND_URL}/all/users/${userid}?search=${searchQuery}`
      );
      console.log(response.data.users);
      setSearchResults(response.data.users);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const Addfriend = async (username: string) => {
    try {
      setIsLoading(true);
      const userid = await AsyncStorage.getItem("userid");
      console.log(userid);
      console.log(username);
      const response = await axios.post(`${BACKEND_URL}/add/friend`, {
        username: username,
        userid: userid,
      });
      ToastAndroid.show("Friend request send ", ToastAndroid.LONG);
      setRefreshTrigger((prev) => !prev);
      console.log(response.data);
      await axios.post(`${BACKEND_URL}/add/friend`, {
        username: username,
        userid: userid,
      });
      // await Fetchfriend();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheetModalProvider>
      <LinearGradient
        colors={["#1a0033", "#4b0082", "#290d44"]}
        style={styles.gradient}
      >
        <View>
          <TouchableOpacity
            onPress={() => router.push("/(nonav)/notification")}
            style={{
              padding: 10,
            }}
          >
            <Ionicons
              name="notifications"
              size={24}
              color="white"
              style={{ position: "absolute", right: 20, top: 5 }}
            />
          </TouchableOpacity>
          <View style={styles.profileCard}>
            <Image
              source={require("../../assets/images/profile.png")}
              style={styles.profileImage}
            />
            <Text style={styles.username}>{username}</Text>
          </View>
          <View>
            <TouchableOpacity onPress={handlePresentModalPress}>
              <View style={styles.options}>
                <Text style={styles.optionText}>Friends</Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={24}
                  color="white"
                  style={styles.optionIcon}
                />
              </View>
            </TouchableOpacity>
          </View>
          <BottomSheetModal
            snapPoints={snapPoints}
            index={1}
            ref={bottomSheetModalRef}
            backgroundStyle={styles.bottomSheetBackground}
            backdropComponent={(props) => (
              <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.8}
              />
            )}
          >
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity onPress={() => handleTabPress("friends")}>
                <View>
                  <View>
                    <Text
                      style={[
                        styles.tabText,
                        selectedTab === "friends" && styles.activeTabText,
                      ]}
                    >
                      My Friends
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleTabPress("search")}>
                <View>
                  <View>
                    <Text
                      style={[
                        styles.tabText,
                        selectedTab === "search" && styles.activeTabText,
                      ]}
                    >
                      Search
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.tabIndicatorContainer}>
              <Animated.View style={[styles.tabIndicator, animatedBarStyle]} />
            </View>
            {selectedTab === "friends" ? (
              <BottomSheetFlatList
                data={friends}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.friendItem}>
                    <Text style={styles.friendText}>{item}</Text>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No friends yet, add friends!
                    </Text>
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
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleSearch}
                  >
                    <Ionicons name="search" size={20} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Loader */}
                {isLoading ? (
                  <ActivityIndicator size="large" color="#9C89FF" />
                ) : (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item: any) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.searchResultItem}>
                        <Text style={styles.searchResultText}>
                          {item.username}
                        </Text>
                        {item.status === "requested" ? (
                          <View
                            style={[styles.addButton, styles.requestedButton]}
                          >
                            <Text style={styles.addButtonText}>Requested</Text>
                          </View>
                        ) : item.status === "accepted" ? (
                          <View style={[styles.addButton, styles.friendButton]}>
                            <Text style={styles.addButtonText}>Accepted</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[styles.addButton, styles.addButtonActive]}
                            onPress={() => Addfriend(item.username)}
                          >
                            <Text style={styles.addButtonText}>Add</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  />
                )}
              </View>
            )}
          </BottomSheetModal>
          <TouchableOpacity onPress={() => router.push("/(nonav)/setGoals")}>
            <View style={styles.options}>
              <Text style={styles.optionText}>Goals</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="white"
                style={styles.optionIcon}
              />
            </View>
          </TouchableOpacity>{" "}
          <TouchableOpacity onPress={() => router.push("/(nonav)/achievments")}>
            <View style={styles.options}>
              <Text style={styles.optionText}>Achievments</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="white"
                style={styles.optionIcon}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(nonav)/Stake")}>
            <View style={styles.options}>
              <Text style={styles.optionText}>Step Provider</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="white"
                style={styles.optionIcon}
              />
            </View>
          </TouchableOpacity>
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutText}>Logout</Text>
              <Ionicons name="log-out-outline" size={25} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </BottomSheetModalProvider>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  header: {
    color: "white",
    fontSize: 20,
    marginTop: 15,
    marginLeft: 15,
    fontWeight: "bold",
  },
  profileCard: {
    backgroundColor: "#1a0226",
    marginHorizontal: 20,
    paddingVertical: 40,
    borderRadius: 20,
    marginTop: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
  },
  username: {
    color: "white",
    fontSize: 20,
    alignSelf: "center",
    marginTop: 10,
  },
  options: {
    backgroundColor: "#1a0226",
    marginTop: 10,
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: { color: "white", fontSize: 15 },
  optionIcon: { position: "absolute", right: 10 },
  bottomSheetBackground: {
    backgroundColor: "#7E3887",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#1a0226",
    marginHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 13,
  },
  tabText: { color: "#9e9a99", fontSize: 13 },
  activeTabText: { color: "white", fontWeight: "bold" },
  tabIndicatorContainer: {
    marginTop: 10,
    width: "90%",
    height: 2,
    alignSelf: "center",
    backgroundColor: "#333",
    marginBottom: 30,
  },
  addButtonActive: {
    backgroundColor: "#007AFF",
  },
  requestedButton: {
    backgroundColor: "#AAAAAA",
  },
  friendButton: {
    backgroundColor: "#34C759",
  },
  tabIndicator: { width: "45%", height: 2, backgroundColor: "green" },
  friendItem: {
    padding: 12,
    marginHorizontal: 20,

    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#290d44",
    alignItems: "center",
  },
  friendText: { color: "white", fontSize: 14 },
  searchView: { marginTop: 20, alignItems: "center" },
  searchText: { color: "white", fontSize: 16 },
  logoutContainer: { marginTop: 20, alignItems: "center" },
  logoutButton: { flexDirection: "row", gap: 10, alignItems: "center" },
  logoutText: { color: "white", fontSize: 15, fontWeight: "bold" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a0226",
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 14,
    paddingVertical: 10,
  },
  searchButton: {
    padding: 10,
  },
  searchResultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#290d44",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    height: 60,
    width: 330,
  },
  searchResultText: { color: "white", fontSize: 14 },
  addButton: {
    backgroundColor: "#9C89FF",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  addButtonText: { color: "white", fontSize: 12, fontWeight: "bold" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
