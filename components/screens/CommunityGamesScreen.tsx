import { BACKEND_URL } from "@/Backendurl";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
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
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SlideButton from "rn-slide-button";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

interface GAME {
  id: string;
  title: string;
  entryPrice: number;
  time: string;
  participants: number;
  dailySteps: number;
}

const CommunityGamesScreen = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedGame, setSelectedGame] = useState<GAME | null>(null);
  const [games, setGames] = useState<GAME[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
  const escrowpublickey = "AL3YQV36ADyq3xwjuETH8kceNTH9fuP43esbFiLF1V1A";

  const snapPoints = useMemo(() => ["50%", "60%"], []);
  const handleJoinClick = useCallback((game: GAME) => {
    console.log("Joining game", game.title);
    setSelectedGame(game);
    bottomSheetModalRef.current?.present();
  }, []);

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
        const userid = await AsyncStorage.getItem("userid"); // Changed from "username" to "userid"
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
      if (balance < selectedGame.entryPrice * LAMPORTS_PER_SOL) {
        Alert.alert("Not enough credit");
        return;
      }
      const signature = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publickey),
          toPubkey: new PublicKey(escrowpublickey),
          lamports: LAMPORTS_PER_SOL * selectedGame.entryPrice,
        })
      );
      const { blockhash } = await connection.getLatestBlockhash();
      signature.recentBlockhash = blockhash;
      signature.feePayer = new PublicKey(publickey);
      const serilize = signature.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      const response = await axios.post(
        `${BACKEND_URL}/challenge/join/community/${selectedGame.id}`,
        { tx: serilize }
      );
      if (response.status == 200) {
        Alert.alert("Added to the contest");
      }
    } catch (e: any) {
      console.log(e);
      Alert.alert(e.message || "An error occurred");
    }
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
            {loading ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : (
              games.map((game) => (
                <View key={game.id} style={styles.gameCard}>
                  <View
                    style={{
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View>
                      <Text style={styles.gameHeader}>{game.title}</Text>
                    </View>
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
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <View>
                          <Text style={{ color: "#bfbfbf", fontSize: 12 }}>
                            Entry
                          </Text>
                        </View>
                        <View>
                          <Text style={{ color: "white", fontSize: 13 }}>
                            {game.entryPrice}
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
                            7 days
                          </Text>
                        </View>
                        <View>
                          <Text style={{ color: "white", fontSize: 13 }}>
                            {game.time}
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
                            Daily Steps
                          </Text>
                        </View>
                        <View>
                          <Text style={{ color: "white", fontSize: 13 }}>
                            {game.dailySteps}
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
                            Players
                          </Text>
                        </View>
                        <View>
                          <Text style={{ color: "white", fontSize: 13 }}>
                            {game.participants}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
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
                <View
                  style={{
                    paddingHorizontal: 10,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#1a0033",
                      borderRadius: 20,
                      paddingHorizontal: 20,
                      paddingVertical: 20,
                    }}
                  >
                    <Text style={styles.bottomSheetTitle}>
                      {selectedGame.title}
                    </Text>
                    <Text
                      style={{
                        color: "white",
                      }}
                    >
                      You Pay: {selectedGame.entryPrice}
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

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    paddingBottom: 100,
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
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 10,
    marginTop: 20,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 20,
    paddingBottom: 40,
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
});

export default CommunityGamesScreen;
