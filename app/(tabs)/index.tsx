import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// import { Avatar } from "react-native-ui-lib";
// import { Skeleton } from "@rneui/themed";

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  StatusBar,
  Button,
  ToastAndroid,
  ActivityIndicator,
  Animated,
  Pressable,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  GestureHandlerRootView,
  RefreshControl,
  ScrollView,
} from "react-native-gesture-handler";
import SlideButton from "rn-slide-button";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Link, router } from "expo-router";
import { initialize, readRecords } from "react-native-health-connect";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BACKEND_URL } from "@/Backendurl";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import Entypo from "@expo/vector-icons/Entypo";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
interface GAme {
  Amount: number;
  id: string;
  name: string;
}

const escrowpublickey = "AL3YQV36ADyq3xwjuETH8kceNTH9fuP43esbFiLF1V1A";
// SplashScreen.preventAutoHideAsync();
// SplashScreen.setOptions({
//   duration: 1000,
//   fade: true,
// });

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

const App = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedGame, setSelectedGame] = useState<GAme>();
  // const [appIsReady, setAppIsReady] = useState(false);
  const connection = new Connection("https://api.devnet.solana.com");
  const snapPoints = useMemo(() => ["50%", "75%"], []);

  const handleJoinClick = useCallback((game: any) => {
    console.log("Join clicked for game:", game.title);
    setSelectedGame(game);
    bottomSheetModalRef.current?.present();
  }, []);
  useEffect(() => {
    const handleRedirect = async (url: string) => {
      const parse = new URL(url);
      console.log("pars", parse);
      const code = parse.searchParams.get("code");
      console.log("code", code);
      const codeverifier = await AsyncStorage.getItem("code");
      console.log("codeverifier", codeverifier);
      try {
        const clientId = "23Q8LW";
        const clientSecret = "b7ad7ce14620face8ab633f237c071bb";

        const tokenResponse = await axios.post(
          "https://api.fitbit.com/oauth2/token",
          `client_id=${clientId}&code=${code}&code_verifier="6r3i000b0o5n006w1o6t1d454y183y0i3w4h5i1u5o3l0s213e4s5h0w6k5t5v5253703r4a2j1q0d0z4l730t733r5i1t6n2e0j6k2n0v3q6k495g5j536r5t4n602p"&grant_type=authorization_code`,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              // "Authorization":"Basic MjNROExXTDpiN2FkN2NlMTQ2MjBmYWNlOGFiNjMzZjIzN2MwNzFiYg=="
            },
          }
        );
        console.log(tokenResponse);
        console.log("Token Response:", tokenResponse.data);
      } catch (error: any) {
        console.error("Error exchanging code for tokens:", error);
      }
    };
    // Linking.getInitialURL().then(handleRedirect);
    Linking.addEventListener("url", ({ url }) => handleRedirect(url));
    // handleRedirect();
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const Onsend = async () => {
    setShowLoader(true);
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const publickey = await AsyncStorage.getItem("PublicKey");
      if (!publickey) {
        throw new Error("No public key found");
      }

      const balance = await connection.getBalance(new PublicKey(publickey));
      if (!selectedGame) {
        throw new Error("No game selected");
      }

      if (balance < selectedGame.Amount * LAMPORTS_PER_SOL) {
        throw new Error("Insufficient balance");
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publickey),
          toPubkey: new PublicKey(escrowpublickey),
          lamports: LAMPORTS_PER_SOL * selectedGame.Amount,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(publickey);

      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      console.log(selectedGame.id);
      const response = await axios.post(
        `${BACKEND_URL}/challenge/join/public/${selectedGame.id}`,
        { tx: serializedTransaction }
      );
      console.log(response.data);
      if (response.status === 200) {
        setSuccess(true);
        ToastAndroid.show("Added to the contest", ToastAndroid.SHORT);
      }
    } catch (e: any) {
      setError(e);
      ToastAndroid.show(e.message || "Transaction Failed!", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
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

  const bottomSheetModalRef2 = useRef<BottomSheetModal>(null);
  const snapPoints2 = useMemo(() => ["30%"], []);
  const handleSearchGame = useCallback(() => {
    console.log("Search Game");
    bottomSheetModalRef2.current?.present();
  }, []);
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        animated={true}
        hidden={false}
        backgroundColor={"#1a0033"}
        barStyle={"light-content"}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <LinearGradient
            colors={["#1a0033", "#4b0082", "#290d44"]}
            style={styles.gradient}
          >
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <TouchableOpacity
                onPress={() => router.push("/(nonav)/profile")}
                style={{
                  alignSelf: "flex-end",
                  marginRight: 20,
                  marginTop: 10,
                }}
              >
                <Image
                  source={require("../../assets/images/profile.png")}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 25,
                  }}
                />
              </TouchableOpacity>
              <View style={{ padding: 5 }}>
                <StepsCount />
              </View>
              <View></View>
              <View>
                <OfficialGames handleJoinClick={handleJoinClick} />
              </View>
              <View>
                <CommunityGames handleJoinClick={handleJoinClick} />
              </View>
              <View>
                <JoinGame handleSearchGame={handleSearchGame} />
              </View>
            </ScrollView>
            <BottomSheetModal
              ref={bottomSheetModalRef}
              snapPoints={snapPoints}
              backgroundStyle={styles.BottomSheetBackground}
              backdropComponent={(props) => (
                <BottomSheetBackdrop
                  {...props}
                  disappearsOnIndex={-1}
                  appearsOnIndex={0}
                  opacity={0.9}
                />
              )}
            >
              <BottomSheetView>
                {selectedGame ? (
                  <View style={{ paddingHorizontal: 10 }}>
                    <View style={styles.gameDetailsContainer}>
                      <Text style={styles.bottomSheetTitle}>
                        {selectedGame.name}
                      </Text>
                      <Text
                        style={{
                          color: "white",
                        }}
                      >
                        You Pay: {selectedGame.Amount}
                      </Text>
                      <SlideButton
                        title="Slide To Confirm"
                        width="80%"
                        padding="2"
                        reverseSlideEnabled={false}
                        animation={true}
                        titleContainerStyle={{
                          backgroundColor: "#4b0082",
                        }}
                        containerStyle={{
                          backgroundColor: "#4b0082",
                        }}
                        underlayStyle={{
                          backgroundColor: "#1a0033",
                        }}
                        onSlideEnd={Onsend}
                      />
                    </View>
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

            <BottomSheetModal
              ref={bottomSheetModalRef2}
              snapPoints={snapPoints2}
              backgroundStyle={styles.BottomSheetBackground}
            >
              <BottomSheetView>
                <View>
                  <Text style={styles.bottomSheetTitle}>Search Game</Text>
                </View>
              </BottomSheetView>
            </BottomSheetModal>
          </LinearGradient>
        </BottomSheetModalProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const StepsCount = () => {
  const [error, seterror] = useState("");
  const [step, setstep] = useState(0);
  const [sleep, setsleep] = useState("");
  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const now = new Date();
        const midnightToday = new Date(now);
        midnightToday.setHours(0, 0, 0, 0);
        const startTime = midnightToday.toISOString();
        const endTime = now.toISOString();
        await initialize();
        const { records } = await readRecords("Steps", {
          timeRangeFilter: {
            operator: "between",
            startTime: startTime,
            endTime: endTime,
          },
        });

        const [sleepData] = await Promise.all([
          readRecords("SleepSession", {
            timeRangeFilter: {
              operator: "between",
              startTime: new Date(
                now.getTime() - 24 * 60 * 60 * 1000
              ).toISOString(),
              endTime: now.toISOString(),
            },
          }),
        ]);
        console.log(
          "sleeee",
          sleepData.records.map((stage) => stage.stages)
        );
        let totalSleepTime = 0;
        sleepData.records.map((cle) =>
          cle.stages?.map((entry) => {
            const startTime = new Date(entry.startTime).getTime();
            const endTime = new Date(entry.endTime).getTime();
            totalSleepTime += endTime - startTime;
          })
        );
        console.log("totalsleep", totalSleepTime);

        const totalSeconds = Math.floor(totalSleepTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        console.log(hours);
        console.log(minutes);
        setsleep(hours.toString() + " " + "H" + " " + minutes.toString() + "M");
        let count = 0;
        records.forEach((record) => {
          if (
            record.metadata?.dataOrigin === "com.google.android.apps.fitness"
          ) {
            count += record.count || 0;
          }
        });
        setstep(count);
      } catch (err) {
        console.error("Error fetching steps:", err);
        seterror("Failed to fetch steps. Please try again.");
      }
    };
    fetchSteps();
  });
  const usertarget = 5000;
  return (
    <View>
      <View>
        <View style={styles.stepsCard}>
          <Text
            style={[
              styles.text,
              {
                fontSize: 15,
                marginBottom: 5,
                color: "#9e9a99",
              },
            ]}
          >
            Open Health Connect to sync
          </Text>
          <Text
            style={[
              styles.text,
              {
                color: "#9e9a99",
                fontSize: 12,
              },
            ]}
          >
            (wait for few minutes)
          </Text>
          <Image
            source={require("../../assets/images/sleep2.png")}
            style={{
              width: 170,
              height: 200,
              resizeMode: "contain",
              marginTop: 20,
            }}
          />

          <View style={styles.setpsdiv}>
            {/* <Text style={styles.steptext}>{step}</Text> */}
            {/* <Text style={{ color: "white", fontSize: 20 }}>/</Text> */}
            <Text style={styles.texttarget}>4hr 21m</Text>
            <Text
              style={{
                marginLeft: 5,
                color: "#9e9a99",
                fontSize: 15,
                fontWeight: "bold",
              }}
            ></Text>
          </View>
        </View>
      </View>
    </View>
  );
};
interface Game {
  id: 1;
  title: string;
  entryPrice: number;
  time: string;
  participants: number;
  dailySteps: number;
}

const OfficialGames = ({ handleJoinClick }: any) => {
  const [error, seterror] = useState("");
  const [joined, setjoined] = useState([]);
  const [loading, setloading] = useState(false);
  const [form, setform] = useState([
    {
      name: "",
      memberqty: 0,
      Dailystep: 0,
      Totalamount: 0,
      Amount: 0,
      Digital_Currency: "sol",
      days: 0,
      startdate: "",
      enddate: "",
      id: "",
      status: "",
      members: [],
      types: "",
      Hours: "",
    },
  ]);
  const scrollViewRef = useRef(null);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isEnd =
      layoutMeasurement.width + contentOffset.x >= contentSize.width - 20;
    if (isEnd && !isAtEnd) {
      setIsAtEnd(true);
      // setScrollEnabled(false);
    } else if (!isEnd && isAtEnd) {
      setIsAtEnd(false);
      setScrollEnabled(true);
    }
  };
  useEffect(() => {
    const fetchuserdata = async () => {
      try {
        setloading(true);
        const userid = await AsyncStorage.getItem("userid");
        console.log("userdid");
        const response = await axios.get(
          `${BACKEND_URL}/history/prev/${userid}`
        );
        //  console.log(response.data);
        setjoined(response.data.Tournament);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    const fetchdata = async () => {
      try {
        setloading(true);
        const response = await axios.get(`${BACKEND_URL}/challenge/public`);
        // console.log(response.data);
        setform(response.data.allchalange);
        // console.log("response", response.data.allchalange);
      } catch (Error) {
        console.log(Error);
      } finally {
        setloading(false);
      }
    };
    fetchdata();
    fetchuserdata();
  }, []);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);
  return (
    <BottomSheetModalProvider>
      <View style={styles.gamesContainer}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingRight: 16,
            marginBottom: 10,
          }}
        >
          <Text style={styles.gamesTitle}>Official Games</Text>

          <TouchableOpacity
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              justifyContent: "center",
              borderRadius: 10,
            }}
            onPress={() => router.push("/(nonav)/officialGames")}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Text style={{ color: "white" }}>All</Text>
              <AntDesign name="arrowright" size={15} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
          // contentContainerStyle={[
          //   styles.gamesScrollContent,
          //   form.length <= 4 && {
          //     alignSelf: "center",
          //     width: 1400,
          //     paddingRight: "40%",
          //     paddingLeft: 0,
          //   },
          // ]}
        >
          {form.map((game) => (
            <View>
              {loading ? (
                // <Skeleton
                //   height={80}
                //   width={250}
                //   animation="pulse"
                //   LinearGradientComponent
                // ></Skeleton>
                <View
                  style={{
                    width: 250,
                    height: 80,
                    backgroundColor: "#1a0033",
                    borderRadius: 10,
                    marginRight: 10,
                  }}
                />
              ) : (
                <View>
                  {/* <Pressable onPress={() => router.navigate('/status/', { [id]: "2" })}> */}
                  <View key={game.id} style={styles.gameCard}>
                    <Pressable
                      onPress={() =>
                        game.types === "sleep"
                          ? router.push(`/sleep/[id]`)
                          : router.push(`/status/${game.id}`)
                      }
                      style={({ pressed }) => [
                        { opacity: pressed ? 0.8 : 1 },
                        { flex: 1 },
                      ]}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingHorizontal: 10,
                        }}
                      >
                        <View>
                          <Text style={styles.gameHeader}>{game.name}</Text>
                          <View>
                            <Text
                              style={{
                                color: "gray",
                                fontSize: 12,
                              }}
                            >
                              {game.startdate}
                            </Text>
                          </View>
                        </View>
                        {joined.some((join) => join.id == game.id) ||
                        game.memberqty == game.members.length ? (
                          <View>
                            <Text style={{ color: "#bfbfbf", fontSize: 12 }}>
                              {game.memberqty == game.members.length
                                ? "Full"
                                : " Joined"}
                            </Text>
                            <Text
                              style={{
                                color: "white",
                                fontSize: 11,
                              }}
                            >
                              {game.status}
                            </Text>
                          </View>
                        ) : (
                          <View>
                            <TouchableOpacity
                              style={styles.joinbutton}
                              onPress={() => handleJoinClick(game)}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  fontSize: 16,
                                }}
                              >
                                Join
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      <View
                        style={{
                          marginTop: 10,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            width: "90%",
                            height: 0.5,
                            marginTop: 15,
                            backgroundColor: "#e5ccff",
                          }}
                        />
                      </View>
                      <View>
                        <View
                          style={{
                            marginTop: 10,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingHorizontal: 5,
                          }}
                        >
                          <View style={{ alignItems: "center" }}>
                            <View>
                              <Text style={{ color: "#bfbfbf", fontSize: 12 }}>
                                Entry
                              </Text>
                            </View>
                            <View>
                              <Text style={{ color: "white", fontSize: 13 }}>
                                {game.Amount}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <View>
                              <Text style={{ color: "#bfbfbf", fontSize: 12 }}>
                                Days
                              </Text>
                            </View>

                            <View>
                              <Text style={{ color: "white", fontSize: 13 }}>
                                {game.days}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {game.types == "Steps" ? (
                              <View>
                                <View>
                                  <Text
                                    style={{ color: "#bfbfbf", fontSize: 12 }}
                                  >
                                    Daily Steps
                                  </Text>
                                </View>
                                <View>
                                  <Text
                                    style={{ color: "white", fontSize: 13 }}
                                  >
                                    {game.Dailystep}
                                  </Text>
                                </View>
                              </View>
                            ) : (
                              <View>
                                <View>
                                  <Text
                                    style={{ color: "#bfbfbf", fontSize: 12 }}
                                  >
                                    Hours
                                  </Text>
                                </View>
                                <View>
                                  <Text
                                    style={{ color: "white", fontSize: 13 }}
                                  >
                                    {game.Hours}
                                  </Text>
                                </View>
                              </View>
                            )}
                          </View>
                          <View
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <View>
                              <Text style={{ color: "#bfbfbf", fontSize: 12 }}>
                                Players
                              </Text>
                            </View>
                            <View>
                              <Text style={{ color: "white", fontSize: 13 }}>
                                {game.memberqty}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  </View>
                  {/* </Link> */}
                  {/* </Pressable> */}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </BottomSheetModalProvider>
  );
};

const CommunityGames = ({ handleJoinClick }: any) => {
  const [error, seterror] = useState("");
  const [joined, setjoined] = useState([]);
  const [form, setform] = useState([
    {
      name: "",
      memberqty: 0,
      Dailystep: 0,
      Totalamount: 0,
      Amount: 0,
      Digital_Currency: "sol",
      days: 0,
      startdate: "",
      enddate: "",
      id: "",
      status: "",
      types: "",
      Hours: "",
    },
  ]);
  const scrollViewRef = useRef(null);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isEnd =
      layoutMeasurement.width + contentOffset.x >= contentSize.width - 20;
    if (isEnd && !isAtEnd) {
      setIsAtEnd(true);
      // setScrollEnabled(false);
    } else if (!isEnd && isAtEnd) {
      setIsAtEnd(false);
      setScrollEnabled(true);
    }
  };
  useEffect(() => {
    const fetchuserdata = async () => {
      try {
        const userid = await AsyncStorage.getItem("userid");
        //  console.log("userdid");
        const response = await axios.get(
          `${BACKEND_URL}/history/prev/${userid}`
        );
        //  console.log(response.data);
        setjoined(response.data.Tournament);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchdata = async () => {
      try {
        const userid = await AsyncStorage.getItem("username");
        console.log(userid);
        const response = await axios.get(
          `${BACKEND_URL}/challenge/private/${userid}`
        );
        // console.log(response.data);
        setform(response.data.allchalange);
        // console.log("response", response.data.allchalange);
      } catch (Error) {
        console.log(Error);
      }
    };
    fetchdata();
    fetchuserdata();
  }, []);

  return (
    <View style={styles.gamesContainer}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text style={styles.gamesTitle}>Community Games</Text>
        <TouchableOpacity
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            justifyContent: "center",
            borderRadius: 10,
          }}
          onPress={() => router.push("/(nonav)/communityGames")}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Text style={{ color: "white" }}>All</Text>
            <AntDesign name="arrowright" size={15} color="white" />
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        // contentContainerStyle={[
        //   styles.gamesScrollContent,
        //   form.length <= 4 && {
        //     alignSelf: "center",
        //     width: 1400,
        //     paddingRight: "40%",
        //     paddingLeft: 0,
        //   },
        // ]}
      >
        {form.map((game) => (
          <View>
            <View key={game.name} style={styles.gameCard}>
              <Pressable
                onPress={() => router.push(`/status/${game.id}`)}
                style={({ pressed }) => [
                  { opacity: pressed ? 0.8 : 1 },
                  { flex: 1 },
                ]}
              >
                <View
                  style={{
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text style={styles.gameHeader}>{game.name}</Text>
                    <View>
                      <Text
                        style={{
                          color: "gray",
                          fontSize: 12,
                        }}
                      >
                        {game.startdate}
                      </Text>
                    </View>
                  </View>
                  <View>
                    {joined.some((join) => join.id == game.id) ? (
                      <View>
                        <Text style={{ color: "#bfbfbf", fontSize: 12 }}>
                          Already Joined
                        </Text>
                        <Text
                          style={{
                            color: "white",

                            fontSize: 11,
                          }}
                        >
                          {game.status}
                        </Text>
                      </View>
                    ) : (
                      <View>
                        <TouchableOpacity
                          style={styles.joinbutton}
                          onPress={() => handleJoinClick(game)}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontSize: 16,
                            }}
                          >
                            Join
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: "90%",
                      height: 0.5,
                      marginTop: 20,
                      backgroundColor: "#e5ccff",
                    }}
                  />
                </View>
                <View>
                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingHorizontal: 5,
                    }}
                  >
                    <View
                      style={{ justifyContent: "center", alignItems: "center" }}
                    >
                      <View>
                        <Text style={{ color: "#bfbfbf", fontSize: 12 }}>
                          Entry
                        </Text>
                      </View>
                      <View>
                        <Text style={{ color: "white", fontSize: 13 }}>
                          {game.Amount}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{ justifyContent: "center", alignItems: "center" }}
                    >
                      <View>
                        <Text style={{ color: "#bfbfbf", fontSize: 12 }}>
                          Days
                        </Text>
                      </View>
                      <View>
                        <Text style={{ color: "white", fontSize: 13 }}>
                          {game.days}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{ justifyContent: "center", alignItems: "center" }}
                    >
                      {game.types == "Steps" ? (
                        <View>
                          <View>
                            <Text style={{ color: "#bfbfbf", fontSize: 12 }}>
                              Daily Steps
                            </Text>
                          </View>
                          <View>
                            <Text style={{ color: "white", fontSize: 13 }}>
                              {game.Dailystep}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View>
                          <View>
                            <Text style={{ color: "#bfbfbf", fontSize: 12 }}>
                              Hours
                            </Text>
                          </View>
                          <View>
                            <Text style={{ color: "white", fontSize: 13 }}>
                              {game.Hours}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                    <View
                      style={{ justifyContent: "center", alignItems: "center" }}
                    >
                      <View>
                        <Text style={{ color: "#bfbfbf", fontSize: 12 }}>
                          Players
                        </Text>
                      </View>
                      <View>
                        <Text style={{ color: "white", fontSize: 13 }}>
                          {game.memberqty}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const JoinGame = ({ handleSearchGame }: any) => {
  return (
    <View
      style={{
        padding: 15,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingRight: 16,
          marginBottom: 10,
        }}
      >
        <Text style={styles.gamesTitle}>Games</Text>
        <TouchableOpacity
          style={{
            justifyContent: "center",
            borderRadius: 10,
          }}
          onPress={() => router.push("/(nonav)/historyGames")}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Text style={{ color: "white" }}>History</Text>
            <AntDesign name="arrowright" size={15} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <View
        style={{
          paddingHorizontal: 20,
          marginVertical: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/(nonav)/selectGameType")}
        >
          <View
            style={[
              styles.gamebttn,
              {
                backgroundColor: "#9C89FF",
              },
            ]}
          >
            <View>
              <AntDesign name="plus" size={24} color="white" />
            </View>

            <View>
              <Text style={styles.gamebttnText}>Create Game</Text>
            </View>
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={() => handleSearchGame()}>
          <View style={styles.gamebttn}>
            <View>
              <FontAwesome6 name="magnifying-glass" size={24} color="white" />
            </View>
            <View>
              <Text style={styles.gamebttnText}>Game code</Text>
            </View>
          </View>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  steptext: {
    color: "white",
    fontSize: 30,
    marginRight: 10,
  },
  texttarget: {
    color: "white",
    fontSize: 30,
  },
  text: {
    color: "white",
    fontSize: 24,
    marginBottom: 20,
  },
  setpsdiv: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
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
  gameCard: {
    width: 320,
    height: 170,
    marginHorizontal: 10,
    backgroundColor: "#1a0033",
    borderRadius: 10,
    padding: 10,
  },
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
  bottomSheetTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 20,
    marginBottom: 15,
  },
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
  BottomSheetBackground: {
    flex: 1,
    backgroundColor: "#7E3887",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
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
  gameDetailsContainer: {
    backgroundColor: "#1a0033",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
});

export default App;
