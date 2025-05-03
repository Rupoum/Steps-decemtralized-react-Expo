import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// import { Avatar } from "react-native-ui-lib";
import { Skeleton } from '@rneui/themed';
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
import { Card } from '@rneui/themed';

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
import { color, fonts, Icon, Slider } from "@rneui/base";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FadeInDown } from "react-native-reanimated";
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
  useEffect(()=>{
    const handleRedirect = async (url:string) => {
      const parse=new URL(url);
      console.log("pars",parse);
      const code = parse.searchParams.get('code');
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
      } catch (error:any) {
        console.error("Error exchanging code for tokens:", error);
      }
      
    };

    // Linking.getInitialURL().then(handleRedirect);
    Linking.addEventListener('url', ({ url }) => handleRedirect(url));
    // handleRedirect();
  })
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
                        // onSlideEnd={Onsend}
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
        setsleep(hours.toString()+ "h" +" "+ minutes.toString() + "m");
      
        let count = 0;
        records.forEach((record) => {
          if (
            record.metadata?.dataOrigin === "com.google.android.apps.fitness"
          ) {
            count += record.count || 0;
          }
        });
        setstep(count);
        const userid=await AsyncStorage.getItem("userid");
        console.log("usri",userid);
        console.log(sleep);
        console.log("step",step)
        try{
          const steps=step.toString();
          console.log(steps);
          const response =await axios.post(`${BACKEND_URL}/regular/update`,{steps,userid});
          const sleepresponse=await axios.post(`${BACKEND_URL}/regular/update/sleep`,{hours:sleep,userid})

          console.log("heety");
        console.log(response);
        }
        catch(e){
          console.log("dasd");
          console.log(e);
        }
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
             <Slider
        value={step}
        minimumValue={0}
        maximumValue={usertarget}
        disabled={true}
        // thumbTintColor="#4CAF50"
        // minimumTrackTintColor="#4CAF50"
        // maximumTrackTintColor="#e0e0e0"
        // trackStyle={{ height: 5, backgroundColor: 'transparent' }}
        // thumbStyle={{ height: 20, width: 20, backgroundColor: 'transparent' }}
        thumbProps={{
          children: (
            <Icon
              name="heartbeat"
              type="font-awesome"
              size={20}
              reverse
              containerStyle={{ bottom: 20, right: 20 }}
              color={color()}
            />
          ),
        }}
        style={styles.slider}
      />

        <View style={styles.setpsdiv}>
          <Text style={styles.steptext}>{step}</Text>
          <Text style={{ color: "white", fontSize: 20 }}>/</Text>
          <Text style={styles.texttarget}>{usertarget}</Text>
          <Text
            style={{
              marginLeft: 5,
              color: "#9e9a99",
              fontSize: 15,
              fontWeight: "bold",
            }}
          >
            steps
          </Text>
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
  const[loading,setloading]=useState(false);
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
   const handleScroll = (event:any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isEnd = layoutMeasurement.width + contentOffset.x >= contentSize.width - 20;
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
      }finally{
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
      }finally{
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
          }
        ]}
      >
        <LinearGradient
          colors={['#2b0f45', '#3b1a63', '#4b2387']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ 
            borderRadius: 16,
            overflow: 'hidden',
            borderLeftWidth: 4,
            borderLeftColor: game.status === 'Active' ? '#00ff00' : 
                             game.status === 'Upcoming' ? '#ffaa00' : 
                             game.status === 'Completed' ? '#ff5555' : '#9d4edd',
          }}
        >
          <Pressable
            onPress={() => router.push(`/status/${game.id}`)}
            style={({ pressed }) => [
              { opacity: pressed ? 0.8 : 1 },
              { flex: 1 },
              { padding: 16 }
            ]}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
          >
            {/* Header Section */}
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.gameHeader, { 
                  fontSize: 18, 
                  fontWeight: 'bold',
                  marginBottom: 4,
                  color: '#ffffff'
                }]}>
                  {game.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="calendar" size={12} color="#bfbfbf" />
                  <Text style={{
                    color: "#bfbfbf",
                    fontSize: 12,
                    marginLeft: 4
                  }}>
                    {game.startdate}
                  </Text>
                </View>
              </View>
              
              <View>
                {joined.some((join) => join.id == game.id) ? (
                  <View style={{ alignItems: 'center' }}>
                    <View style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <MaterialCommunityIcons name="check-circle" size={14} color="#00ff00" />
                      <Text style={{ 
                        color: "#ffffff", 
                        fontSize: 12,
                        fontWeight: 'bold',
                        marginLeft: 4
                      }}>
                        Joined
                      </Text>
                    </View>
                    <View style={{
                      marginTop: 4,
                      backgroundColor: game.status === 'Active' ? 'rgba(0, 255, 0, 0.2)' : 
                                      game.status === 'Upcoming' ? 'rgba(255, 170, 0, 0.2)' : 
                                      game.status === 'Completed' ? 'rgba(255, 85, 85, 0.2)' : 'rgba(157, 78, 221, 0.2)',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 8
                    }}>
                      <Text style={{
                        color: game.status === 'Active' ? '#00ff00' : 
                               game.status === 'Upcoming' ? '#ffaa00' : 
                               game.status === 'Completed' ? '#ff5555' : '#9d4edd',
                        fontSize: 11,
                        fontWeight: 'bold'
                      }}>
                        {game.status}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#9d4edd',
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
                    <Text style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: 'bold'
                    }}>
                      Join
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Divider with glow effect */}
            <View style={{
              justifyContent: "center",
              alignItems: "center",
              marginVertical: 16,
            }}>
              <LinearGradient
                colors={['rgba(229, 204, 255, 0.1)', 'rgba(229, 204, 255, 0.6)', 'rgba(229, 204, 255, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: "100%",
                  height: 1,
                }}
              />
            </View>

            {/* Game Stats Section */}
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 5,
            }}>
              {/* Entry */}
              <View style={styles.statContainer}>
                <View style={styles.statIconContainer}>
                  <MaterialCommunityIcons name="cash" size={16} color="#9d4edd" />
                </View>
                <Text style={styles.statLabel}>Entry</Text>
                <Text style={styles.statValue}>{game.Amount}</Text>
              </View>

              {/* Days */}
              <View style={styles.statContainer}>
                <View style={styles.statIconContainer}>
                  <MaterialCommunityIcons name="calendar-range" size={16} color="#9d4edd" />
                </View>
                <Text style={styles.statLabel}>Days</Text>
                <Text style={styles.statValue}>{game.days}</Text>
              </View>

              {/* Steps/Hours */}
              <View style={styles.statContainer}>
                <View style={styles.statIconContainer}>
                  <MaterialCommunityIcons 
                    name={game.types == "Steps" ? "shoe-print" : "clock-outline"} 
                    size={16} 
                    color="#9d4edd" 
                  />
                </View>
                <Text style={styles.statLabel}>
                  {game.types == "Steps" ? "Daily Steps" : "Hours"}
                </Text>
                <Text style={styles.statValue}>
                  {game.types == "Steps" ? game.Dailystep : game.Hours}
                </Text>
              </View>

              {/* Players */}
              <View style={styles.statContainer}>
                <View style={styles.statIconContainer}>
                  <MaterialCommunityIcons name="account-group" size={16} color="#9d4edd" />
                </View>
                <Text style={styles.statLabel}>Players</Text>
                <Text style={styles.statValue}>{game.memberqty}</Text>
              </View>
            </View>

            {/* Prize indicator */}
            <View style={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: '#FFD700',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderBottomLeftRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <MaterialCommunityIcons name="trophy" size={12} color="#000" />
              <Text style={{
                color: "#000",
                fontSize: 10,
                fontWeight: 'bold',
                marginLeft: 2
              }}>
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
  const[loading,setloading]=useState(false);
  const handleScroll = (event:any) => {
   const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
   const isEnd = layoutMeasurement.width + contentOffset.x >= contentSize.width - 20;
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
        //  console.log("userdid");
        const response = await axios.get(
          `${BACKEND_URL}/history/prev/${userid}`
        );
        //  console.log(response.data);
        setjoined(response.data.Tournament);
      } catch (error) {
        console.log(error);
      }finally{
           setloading(false);
      }
    };

    const fetchdata = async () => {
      try {
        setloading(true);
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
      }finally{
        setloading(false);
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
          }
        ]}
      >
        <LinearGradient
          colors={['#2b0f45', '#3b1a63', '#4b2387']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ 
            borderRadius: 16,
            overflow: 'hidden',
            borderLeftWidth: 4,
            borderLeftColor: game.status === 'Active' ? '#00ff00' : 
                             game.status === 'Upcoming' ? '#ffaa00' : 
                             game.status === 'Completed' ? '#ff5555' : '#9d4edd',
          }}
        >
          <Pressable
            onPress={() => router.push(`/status/${game.id}`)}
            style={({ pressed }) => [
              { opacity: pressed ? 0.8 : 1 },
              { flex: 1 },
              { padding: 16 }
            ]}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
          >
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.gameHeader, { 
                  fontSize: 18, 
                  fontWeight: 'bold',
                  marginBottom: 4,
                  color: '#ffffff'
                }]}>
                  {game.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="calendar" size={12} color="#bfbfbf" />
                  <Text style={{
                    color: "#bfbfbf",
                    fontSize: 12,
                    marginLeft: 4
                  }}>
                    {game.startdate}
                  </Text>
                </View>
              </View>
              
              <View>
                {joined.some((join) => join.id == game.id) ? (
                  <View style={{ alignItems: 'center' }}>
                    <View style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <MaterialCommunityIcons name="check-circle" size={14} color="#00ff00" />
                      <Text style={{ 
                        color: "#ffffff", 
                        fontSize: 12,
                        fontWeight: 'bold',
                        marginLeft: 4
                      }}>
                        Joined
                      </Text>
                    </View>
                    <View style={{
                      marginTop: 4,
                      backgroundColor: game.status === 'Active' ? 'rgba(0, 255, 0, 0.2)' : 
                                      game.status === 'Upcoming' ? 'rgba(255, 170, 0, 0.2)' : 
                                      game.status === 'Completed' ? 'rgba(255, 85, 85, 0.2)' : 'rgba(157, 78, 221, 0.2)',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 8
                    }}>
                      <Text style={{
                        color: game.status === 'Active' ? '#00ff00' : 
                               game.status === 'Upcoming' ? '#ffaa00' : 
                               game.status === 'Completed' ? '#ff5555' : '#9d4edd',
                        fontSize: 11,
                        fontWeight: 'bold'
                      }}>
                        {game.status}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#9d4edd',
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
                    <Text style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: 'bold'
                    }}>
                      Join
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Divider with glow effect */}
            <View style={{
              justifyContent: "center",
              alignItems: "center",
              marginVertical: 16,
            }}>
              <LinearGradient
                colors={['rgba(229, 204, 255, 0.1)', 'rgba(229, 204, 255, 0.6)', 'rgba(229, 204, 255, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: "100%",
                  height: 1,
                }}
              />
            </View>

            {/* Game Stats Section */}
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 5,
            }}>
              <View style={styles.statContainer}>
                <View style={styles.statIconContainer}>
                  <MaterialCommunityIcons name="cash" size={16} color="#9d4edd" />
                </View>
                <Text style={styles.statLabel}>Entry</Text>
                <Text style={styles.statValue}>{game.Amount}</Text>
              </View>

              {/* Days */}
              <View style={styles.statContainer}>
                <View style={styles.statIconContainer}>
                  <MaterialCommunityIcons name="calendar-range" size={16} color="#9d4edd" />
                </View>
                <Text style={styles.statLabel}>Days</Text>
                <Text style={styles.statValue}>{game.days}</Text>
              </View>

              {/* Steps/Hours */}
              <View style={styles.statContainer}>
                <View style={styles.statIconContainer}>
                  <MaterialCommunityIcons 
                    name={game.types == "Steps" ? "shoe-print" : "clock-outline"} 
                    size={16} 
                    color="#9d4edd" 
                  />
                </View>
                <Text style={styles.statLabel}>
                  {game.types == "Steps" ? "Daily Steps" : "Hours"}
                </Text>
                <Text style={styles.statValue}>
                  {game.types == "Steps" ? game.Dailystep : game.Hours}
                </Text>
              </View>

              {/* Players */}
              <View style={styles.statContainer}>
                <View style={styles.statIconContainer}>
                  <MaterialCommunityIcons name="account-group" size={16} color="#9d4edd" />
                </View>
                <Text style={styles.statLabel}>Players</Text>
                <Text style={styles.statValue}>{game.memberqty}</Text>
              </View>
            </View>

            {/* Prize indicator */}
            <View style={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: '#FFD700',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderBottomLeftRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <MaterialCommunityIcons name="trophy" size={12} color="#000" />
              <Text style={{
                color: "#000",
                fontSize: 10,
                fontWeight: 'bold',
                marginLeft: 2
              }}>
                {game.Totalamount}
              </Text>
            </View>
          </Pressable>
        </LinearGradient>
      </Animated.View>
    )}
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
  gameCard: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sleepTargetText: {
    fontSize: 16,
    color: '#9e9a99',
    marginLeft: 5,
  },
  sleepVisual: {
    flexDirection: 'row',
    marginTop: 10,
  },
  sleepHourBlock: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginRight: 5,
  },
  sleepHourFilled: {
    backgroundColor: '#5C6BC0',
  },
  syncContainer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  proggressContainer: {
    marginBottom: 25,
  },
  proggressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9e9a99',
    marginBottom: 10,
  },
  header: {
    marginBottom: 15,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
 
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  badge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  successBadge: {
    backgroundColor: '#e8f5e9',
  },
  sleepProgress: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  slider: {
    width: '100%',
    height: 10,
    marginBottom: 10,
  },
  setpsdiv: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  steptext: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  stepsSeparator: {
    color: '#9e9a99', 
    fontSize: 20,
    marginHorizontal: 5,
  },
  texttarget: {
    fontSize: 20,
    color: '#9e9a99',
  },
  stepsLabel: {
    marginLeft: 5,
    color: '#9e9a99',
    fontSize: 15,
    fontWeight: 'bold',
  },
  sleepContainer: {
    marginBottom: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sleepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9e9a99',
    marginBottom: 10,
  },
  gameHeader: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statContainer: {
    justifyContent: "center", 
    alignItems: "center",
    minWidth: 70,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(157, 78, 221, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: 'bold',
  },
  joinbutton: {
    backgroundColor: '#9d4edd',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#9d4edd",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  text: {
    color: "white",
    fontSize: 24,
    marginBottom: 20,
  },
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
    fontWeight: 'bold',
    color: '#5C6BC0',
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
  stepbox:{
    flex:1,
    borderRadius:10,
    padding:10,
    paddingRight:94,
    height:132,
    paddingBottom:24,
    paddingLeft:94,
    paddingTop:24,
    width:342
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
    color: '#9e9a99',
  },
  syncHint: {
    color: '#9e9a99',
    fontSize: 12,
    marginBottom: 15,
  },
  sleepImage: {
    width: 170,
    height: 200,
    resizeMode: 'contain',
    marginTop: 20,
  },
  // steptext: {
  //   fontSize: 24,2
  //   fontWeight: 'bold',
  //   color: '#4CAF50',
  // },
});

export default App;
