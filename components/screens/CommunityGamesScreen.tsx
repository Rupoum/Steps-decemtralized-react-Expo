import { BACKEND_URL } from "@/Backendurl";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Skeleton } from "@rneui/base";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Pressable,
  Animated,
} from "react-native";
import { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import SlideButton from "rn-slide-button";
interface GAME {
  id: string;
  name: string;
  Amount: number;
  days: number;
  memberqty: number;
  Dailystep: number;
  types: string;
  startdate: string;
  status: string;
  members: string;
  Hours: string;
}

const OfficialGamesScreen = () => {
  const [game, setgame] = useState<GAME[]>([]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const escrowpublickey = "AL3YQV36ADyq3xwjuETH8kceNTH9fuP43esbFiLF1V1A";
  const [selectedGame, setSelectedGame] = useState<GAME>();
  const [loading, setLoading] = useState<boolean>(true);
  const [joined, setjoined] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const snapPoints = useMemo(() => ["50%", "60%"], []);
  const handleJoinClick = useCallback((game: any) => {
    console.log("Joining game", game.name);
    setSelectedGame(game);
    bottomSheetModalRef.current?.present();
  }, []);
  useEffect(() => {
    const fetchuserdata = async () => {
      try {
        const userid = await AsyncStorage.getItem("userid");
        console.log("userdid");
        const response = await axios.get(
          `${BACKEND_URL}/history/prev/${userid}`
        );
        console.log("cca",response.data.Tournament);
        setjoined(response.data.Tournament);
      } catch (error) {
        console.log(error);
      }
    };
    fetchuserdata();
    const fetchgame = async () => {
      setLoading(true);
      try {
        const userid = await AsyncStorage.getItem("username");
        console.log("userdid");
        const response = await axios.get(
          `${BACKEND_URL}/challenge/private/${userid}`
        );
        setgame(response.data.allchalange);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchgame();
  }, []);
  const Onsend = async () => {
    try {
      const connection = new Connection("https://api.devnet.solana.com");
      const publickey = await AsyncStorage.getItem("PublicKey");
      if (!publickey) {
        Alert.alert("NO public key found");
        return;
      }
      if (selectedGame == null) {
        return;
      }
      const balance = await connection.getBalance(new PublicKey(publickey));
      console.log(selectedGame.Amount);
      if (balance < selectedGame.Amount * LAMPORTS_PER_SOL) {
        Alert.alert("Not enough credit");
        return;
      }
      console.log("chh");
      console.log(publickey);
      const signature = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publickey),
          toPubkey: new PublicKey(escrowpublickey),
          lamports: LAMPORTS_PER_SOL * selectedGame.Amount,
        })
      );
      const { blockhash } = await connection.getLatestBlockhash();
      signature.recentBlockhash = blockhash;
      signature.feePayer = new PublicKey(publickey);
      const serilize = signature.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      console.log("chekc1");
      const response = await axios.post(
        `${BACKEND_URL}/challenge/join/public/${selectedGame.id}`,
        { tx: serilize }
      );
      if (response.status == 200) {
        Alert.alert("ADDed to the contest");
      }
    } catch (e: any) {
      console.log(e);
      Alert.alert(e);
    }
  };
  const handleRetry = () => {
    setError(null);
    Onsend();
  };

  const handleClose = () => {
    setShowLoader(false);
    setError(null);
    setSuccess(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <LinearGradient
          colors={["#1a0033", "#4b0082", "#290d44"]}
          style={styles.gradient}
        >
          <ScrollView
            contentContainerStyle={[
              styles.container,
              loading && {
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            {game.map((game) => (
              <View key={game.id}>
                {loading ? (
                  <Skeleton
                    animation="pulse"
                    style={styles.gameCard}
                    height={170}
                    width={320}
                    LinearGradientComponent={LinearGradient}
                  />
                ) : (
                  <View>
                    <Animated.View
                      entering={FadeInDown.duration(400).delay(200)}
                      style={[
                        styles.gameCard,
                        {
                          shadowColor: "#9d4edd",
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.5,
                          shadowRadius: 12,
                          elevation: 10,
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={["#2b0f45", "#3b1a63", "#4b2387"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          borderRadius: 16,
                          overflow: "hidden",
                          borderLeftWidth: 4,
                          borderLeftColor:
                            game.status === "Active"
                              ? "#00ff00"
                              : game.status === "Upcoming"
                              ? "#ffaa00"
                              : game.status === "Completed"
                              ? "#ff5555"
                              : "#9d4edd",
                        }}
                      >
                        <Pressable
                          onPress={() => router.push(`/status/${game.id}`)}
                          style={({ pressed }) => [
                            { opacity: pressed ? 0.8 : 1 },
                            { flex: 1 },
                            { padding: 16 },
                          ]}
                          android_ripple={{ color: "rgba(255, 255, 255, 0.1)" }}
                        >
                          {/* Header Section */}
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.gameHeader,
                                  {
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    marginBottom: 4,
                                    color: "#ffffff",
                                  },
                                ]}
                              >
                                {game.name}
                              </Text>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <MaterialCommunityIcons
                                  name="calendar"
                                  size={12}
                                  color="#bfbfbf"
                                />
                                <Text
                                  style={{
                                    color: "#bfbfbf",
                                    fontSize: 12,
                                    marginLeft: 4,
                                  }}
                                >
                                  {game.startdate}
                                </Text>
                              </View>
                            </View>

                            <View>
                              {joined.some((join) => join.id == game.id) ? (
                                <View style={{ alignItems: "center" }}>
                                  <View
                                    style={{
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.1)",
                                      paddingHorizontal: 10,
                                      paddingVertical: 6,
                                      borderRadius: 12,
                                      flexDirection: "row",
                                      alignItems: "center",
                                    }}
                                  >
                                    <MaterialCommunityIcons
                                      name="check-circle"
                                      size={14}
                                      color="#00ff00"
                                    />
                                    <Text
                                      style={{
                                        color: "#ffffff",
                                        fontSize: 12,
                                        fontWeight: "bold",
                                        marginLeft: 4,
                                      }}
                                    >
                                      Joined
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      marginTop: 4,
                                      backgroundColor:
                                        game.status === "Active"
                                          ? "rgba(0, 255, 0, 0.2)"
                                          : game.status === "Upcoming"
                                          ? "rgba(255, 170, 0, 0.2)"
                                          : game.status === "Completed"
                                          ? "rgba(255, 85, 85, 0.2)"
                                          : "rgba(157, 78, 221, 0.2)",
                                      paddingHorizontal: 8,
                                      paddingVertical: 2,
                                      borderRadius: 8,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color:
                                          game.status === "Active"
                                            ? "#00ff00"
                                            : game.status === "Upcoming"
                                            ? "#ffaa00"
                                            : game.status === "Completed"
                                            ? "#ff5555"
                                            : "#9d4edd",
                                        fontSize: 11,
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {game.status}
                                    </Text>
                                  </View>
                                </View>
                              ) : (
                                <TouchableOpacity
                                  style={{
                                    backgroundColor: "#9d4edd",
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    borderRadius: 12,
                                    shadowColor: "#9d4edd",
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 6,
                                    elevation: 5,
                                  }}
                                  onPress={() => {
                                    // // Add haptic feedback if available
                                    // if (ReactNativeHapticFeedback) {
                                    //   ReactNativeHapticFeedback.trigger('impactMedium');
                                    // }
                                    handleJoinClick(game);
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Text
                                    style={{
                                      color: "white",
                                      fontSize: 16,
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Join
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>

                          {/* Divider with glow effect */}
                          <View
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                              marginVertical: 16,
                            }}
                          >
                            <LinearGradient
                              colors={[
                                "rgba(229, 204, 255, 0.1)",
                                "rgba(229, 204, 255, 0.6)",
                                "rgba(229, 204, 255, 0.1)",
                              ]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={{
                                width: "100%",
                                height: 1,
                              }}
                            />
                          </View>

                          {/* Game Stats Section */}
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              paddingHorizontal: 5,
                            }}
                          >
                            {/* Entry */}
                            <View style={styles.statContainer}>
                              <View style={styles.statIconContainer}>
                                <MaterialCommunityIcons
                                  name="cash"
                                  size={16}
                                  color="#9d4edd"
                                />
                              </View>
                              <Text style={styles.statLabel}>Entry</Text>
                              <Text style={styles.statValue}>
                                {game.Amount}
                              </Text>
                            </View>

                            {/* Days */}
                            <View style={styles.statContainer}>
                              <View style={styles.statIconContainer}>
                                <MaterialCommunityIcons
                                  name="calendar-range"
                                  size={16}
                                  color="#9d4edd"
                                />
                              </View>
                              <Text style={styles.statLabel}>Days</Text>
                              <Text style={styles.statValue}>{game.days}</Text>
                            </View>

                            {/* Steps/Hours */}
                            <View style={styles.statContainer}>
                              <View style={styles.statIconContainer}>
                                <MaterialCommunityIcons
                                  name={
                                    game.types == "Steps"
                                      ? "shoe-print"
                                      : "clock-outline"
                                  }
                                  size={16}
                                  color="#9d4edd"
                                />
                              </View>
                              <Text style={styles.statLabel}>
                                {game.types == "Steps"
                                  ? "Daily Steps"
                                  : "Hours"}
                              </Text>
                              <Text style={styles.statValue}>
                                {game.types == "Steps"
                                  ? game.Dailystep
                                  : game.Hours}
                              </Text>
                            </View>

                            {/* Players */}
                            <View style={styles.statContainer}>
                              <View style={styles.statIconContainer}>
                                <MaterialCommunityIcons
                                  name="account-group"
                                  size={16}
                                  color="#9d4edd"
                                />
                              </View>
                              <Text style={styles.statLabel}>Players</Text>
                              <Text style={styles.statValue}>
                                {game.memberqty}
                              </Text>
                            </View>
                          </View>

                          {/* Prize indicator */}
                          <View
                            style={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              backgroundColor: "#FFD700",
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderBottomLeftRadius: 12,
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <MaterialCommunityIcons
                              name="trophy"
                              size={12}
                              color="#000"
                            />
                            <Text
                              style={{
                                color: "#000",
                                fontSize: 10,
                                fontWeight: "bold",
                                marginLeft: 2,
                              }}
                            >
                              {game.Totalamount}
                            </Text>
                          </View>
                        </Pressable>
                      </LinearGradient>
                    </Animated.View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
          <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            backgroundStyle={styles.bottomSheetBackground}
          >
            <BottomSheetView style={{ flex: 1 }}>
              {selectedGame ? (
                <View style={styles.bottomSheetContent}>
                  <View style={styles.bottomSheetHandle} />

                  <Text style={styles.confirmTitle}>
                    Confirm Your Challenge
                  </Text>

                  <View style={styles.questDetailsCard}>
                    {/* <View style={styles.questDetailRow}>
                                          <Text style={styles.questDetailLabel}></Text>
                                          <Text style={styles.questDetailValue}>
                                            {selectedGame.name}{" "}
                                          </Text>
                                        </View> */}

                    <View style={styles.questDetailRow}>
                      <Text style={styles.questDetailLabel}>
                        Your Entry fee:
                      </Text>
                      <Text style={styles.questDetailValue}>
                        {selectedGame.Amount} SOL
                      </Text>
                    </View>

                    <View style={styles.questRulesContainer}>
                      <Text style={styles.questRulesTitle}>
                        Challenge Rules:
                      </Text>
                      <Text style={styles.questRulesText}>
                        • Track your sleep/steps until the competion end
                      </Text>
                      <Text style={styles.questRulesText}>
                        • Meet your goal at until the competion end
                      </Text>
                      <Text style={styles.questRulesText}>
                        • You will win if you hit competion target
                      </Text>
                    </View>
                  </View>
                  <SlideButton
                    title="Slide To Begin Quest"
                    width="90%"
                    height={60}
                    reverseSlideEnabled={false}
                    animation={true}
                    titleStyle={styles.slideButtonTitle}
                    titleContainerStyle={styles.slideButtonTitleContainer}
                    containerStyle={styles.slideButtonContainer}
                    underlayStyle={styles.slideButtonUnderlay}
                    thumbStyle={styles.slideButtonThumb}
                    onSlideEnd={Onsend}
                  />
                  {showLoader && (
                    <TransactionLoader
                      loading={loading}
                      error={error}
                      success={success}
                      amount={selectedGame?.Amount}
                      onRetry={handleRetry}
                      onClose={handleClose}
                    />
                  )}
                </View>
              ) : (
                <Text style={styles.bottomSheetTitle}>No Game Selected</Text>
              )}
            </BottomSheetView>
          </BottomSheetModal>
        </LinearGradient>
      </BottomSheetModalProvider>
    </SafeAreaView>
  );
};
const TransactionLoader = ({
  loading,
  error,
  success,
  amount,
  onRetry,
  onClose,
}: any) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [loading, spinValue]);
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.transactionContainer}>
      {loading && (
        <View style={styles.loadingContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <ActivityIndicator size="large" color="#9C89FF" />
          </Animated.View>
          <Text style={styles.loaderText}>Processing...</Text>
        </View>
      )}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Transaction Failed</Text>
          <Text style={styles.errorMessage}>
            {error.message || "An error occurred"}
          </Text>
          <View style={styles.buttonContainer}></View>
        </View>
      )}
      {success && !loading && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>Transaction Successful!</Text>
          <Text style={styles.successMessage}>Amount: {amount} SOL</Text>
          {/* <Text onPress={onClose} style={styles.closeButton}>
            Close
          </Text> */}
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    paddingBottom: 100,
  },
  bottomSheetBackground: {
    backgroundColor: "#290d44",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: "#783887",
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    // backgroundColor: "#783887",
    borderRadius: 3,
    marginBottom: 20,
  },
  confirmTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  questDetailsCard: {
    width: "100%",
    backgroundColor: "rgba(26, 0, 51, 0.7)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#783887",
  },
  questDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  questDetailLabel: {
    color: "#D1D5DB",
    fontSize: 16,
  },
  questDetailValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  questRulesContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "rgba(127, 212, 245, 0.1)",
    borderRadius: 10,
  },
  questRulesTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  questRulesText: {
    color: "#D1D5DB",
    fontSize: 14,
    marginBottom: 5,
  },
  slideButtonTitleContainer: {
    backgroundColor: "transparent",
  },
  slideButtonTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  slideButtonUnderlay: {
    backgroundColor: "rgba(127, 212, 245, 0.2)",
  },
  slideButtonThumb: {
    backgroundColor: "#783887",
    borderWidth: 2,
    borderColor: "#7FD4F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: "white",
    marginBottom: 10,
  },
  gameCard: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 16,
    overflow: "hidden",
  },
  gameHeader: {
    color: "white",
    fontSize: 23,
    fontWeight: "bold",
  },
  joinbutton: {
    backgroundColor: "#783887",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  BottomSheetBackground: {
    flex: 1,
    backgroundColor: "#7E3887",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  bottomSheetTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 20,
    marginBottom: 15,
  },
  // gameCard: {
  //   marginHorizontal: 16,
  //   marginVertical: 10,
  //   borderRadius: 16,
  //   overflow: 'hidden',
  // },
  sleepTargetText: {
    fontSize: 16,
    color: "#9e9a99",
    marginLeft: 5,
  },
  sleepVisual: {
    flexDirection: "row",
    marginTop: 10,
  },
  sleepHourBlock: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    marginRight: 5,
  },
  sleepHourFilled: {
    backgroundColor: "#5C6BC0",
  },
  syncContainer: {
    alignItems: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  // container: {
  //   flex: 1,
  //   padding: 15,
  //   backgroundColor: '#f5f5f5',
  // },
  proggressContainer: {
    marginBottom: 25,
  },
  proggressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9e9a99",
    marginBottom: 10,
  },
  header: {
    marginBottom: 15,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  badgeContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  badge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  successBadge: {
    backgroundColor: "#e8f5e9",
  },
  sleepProgress: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2196f3",
  },
  slider: {
    width: "100%",
    height: 10,
    marginBottom: 10,
  },
  setpsdiv: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  steptext: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  stepsSeparator: {
    color: "#9e9a99",
    fontSize: 20,
    marginHorizontal: 5,
  },
  texttarget: {
    fontSize: 20,
    color: "#9e9a99",
  },
  stepsLabel: {
    marginLeft: 5,
    color: "#9e9a99",
    fontSize: 15,
    fontWeight: "bold",
  },
  sleepContainer: {
    marginBottom: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sleepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9e9a99",
    marginBottom: 10,
  },
  // gameHeader: {
  //   color: 'white',
  //   fontSize: 18,
  //   fontWeight: 'bold',
  // },
  statContainer: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 70,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(157, 78, 221, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  statLabel: {
    color: "#bfbfbf",
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  // joinbutton: {
  //   backgroundColor: '#9d4edd',
  //   paddingHorizontal: 20,
  //   paddingVertical: 10,
  //   borderRadius: 12,
  //   shadowColor: "#9d4edd",
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowOpacity: 0.3,
  //   shadowRadius: 6,
  //   elevation: 5,
  // },

  // text: {
  //   color: "white",
  //   fontSize: 24,
  //   marginBottom: 20,
  // },
  // setpsdiv: {
  //   flexDirection: "row",
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  stepsCard: {
    backgroundColor: "#1a0033",
    padding: 10,
    borderRadius: 10,
    margin: 20,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  gamesContainer: {
    marginVertical: 10,
    paddingLeft: 20,
  },
  gamesTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  gamesScrollContent: {
    paddingRight: "100%",
  },
  // gameCard: {
  //   width: 320,
  //   height: 170,
  //   marginHorizontal: 10,
  //   backgroundColor: "#1a0033",
  //   borderRadius: 10,
  //   padding: 10,
  // },
  gameImage: {
    width: 170,
    height: 120,
    resizeMode: "contain",
    marginBottom: 10,
  },
  gameTitle: {
    color: "#9e9a99",
    fontSize: 30,
    fontWeight: "bold",
  },
  // gameHeader: {
  //   color: "white",
  //   fontSize: 23,
  //   fontWeight: "bold",
  // },
  // joinbutton: {
  //   backgroundColor: "#783887",
  //   paddingHorizontal: 20,
  //   paddingVertical: 5,
  //   borderRadius: 20,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  sleepText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5C6BC0",
  },
  gamebttn: {
    backgroundColor: "#7E38B7",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 10,
  },
  gamebttnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
  },
  // bottomSheetTitle: {
  //   color: "white",
  //   fontSize: 24,
  //   fontWeight: "bold",
  //   marginLeft: 20,
  //   marginBottom: 15,
  // },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#9C89FF",
    marginBottom: 20,
  },
  gameDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gameDetailItem: {
    flex: 1,
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  gameDetailLabel: {
    color: "#bfbfbf",
    fontSize: 14,
    marginBottom: 5,
  },
  gameDetailValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  gameDescription: {
    marginTop: 10,
    marginBottom: 20,
  },
  gameDescriptionLabel: {
    color: "#bfbfbf",
    fontSize: 16,
    marginBottom: 10,
  },
  gameDescriptionText: {
    color: "white",
    fontSize: 14,
    lineHeight: 22,
  },
  joinGameButton: {
    backgroundColor: "#9C89FF",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  joinGameButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  // BottomSheetBackground: {
  //   flex: 1,
  //   backgroundColor: "#7E3887",
  //   borderTopLeftRadius: 30,
  //   borderTopRightRadius: 30,
  // },
  transactionContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#1a0033",
    borderRadius: 10,
  },
  loadingContainer: {
    alignItems: "center",
  },
  loaderText: {
    color: "white",
    fontSize: 18,
    marginTop: 10,
  },
  errorContainer: {
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorMessage: {
    color: "white",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  retryButton: {
    color: "white",
    fontSize: 16,
    marginRight: 20,
  },
  closeButton: {
    color: "white",
    fontSize: 16,
  },
  successContainer: {
    alignItems: "center",
  },
  successText: {
    color: "green",
    fontSize: 18,
    fontWeight: "bold",
  },
  successMessage: {
    color: "white",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  stepbox: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    paddingRight: 94,
    height: 132,
    paddingBottom: 24,
    paddingLeft: 94,
    paddingTop: 24,
    width: 342,
  },
  gameDetailsContainer: {
    backgroundColor: "#1a0033",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  syncText: {
    fontSize: 15,
    marginBottom: 5,
    color: "#9e9a99",
  },
  syncHint: {
    color: "#9e9a99",
    fontSize: 12,
    marginBottom: 15,
  },
  sleepImage: {
    width: 170,
    height: 200,
    resizeMode: "contain",
    marginTop: 20,
  },
  // steptext: {
  //   fontSize: 24,2
  //   fontWeight: 'bold',
  //   color: '#4CAF50',
  // },
});

export default OfficialGamesScreen;
