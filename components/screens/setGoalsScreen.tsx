import { LinearGradient } from "expo-linear-gradient";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  ToastAndroid,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BACKEND_URL } from "@/Backendurl";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SlideButton from "rn-slide-button";

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
        <View
          style={{
            alignItems: "center",
          }}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <ActivityIndicator size="large" color="#9C89FF" />
          </Animated.View>
          <Text
            style={{
              color: "white",
              fontSize: 18,
              marginTop: 10,
            }}
          >
            Processing...
          </Text>
        </View>
      )}
      {error && !loading && (
        <View
          style={{
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "red",
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            Transaction Failed
          </Text>
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

const SetGoalsScreen = () => {
  const [sleepGoal, setSleepGoal] = useState(5);
  const [stakeAmount, setStakeAmount] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startDateMode, setStartDateMode] = useState<"date" | "time">("date");
  const [endDateMode, setEndDateMode] = useState<"date" | "time">("date");
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [form, setform] = useState({
    startdate: format(new Date(), "yyyy-MM-dd").toString(),
    enddate: format(new Date(), "yyyy-MM-dd").toString(),
  });
  const connection = new Connection("https://api.devnet.solana.com");
  const escrowpublickey = "AL3YQV36ADyq3xwjuETH8kceNTH9fuP43esbFiLF1V1A";
  const handleStartDateChange = (event: any, selectedDate: any) => {
    if (selectedDate) {
      const currentDate = selectedDate;
      setShowStartDate(false);
      setStartDate(currentDate);
      setform({ ...form, startdate: format(currentDate, "yyyy-MM-dd") });
    } else {
      setShowStartDate(false);
    }
  };
  const handleEndDateChange = (event: any, selectedDate: any) => {
    if (selectedDate) {
      const currentDate = selectedDate;
      setShowEndDate(false);
      setEndDate(currentDate);
      setform({ ...form, enddate: format(currentDate, "yyyy-MM-dd") });
    } else {
      setShowEndDate(false);
    }
  };
  const showStartDatePicker = () => {
    setStartDateMode("date");
    setShowStartDate(true);
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

  const showEndDatePicker = () => {
    setEndDateMode("date");
    setShowEndDate(true);
  };

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    setShowLoader(false);
    bottomSheetModalRef.current?.present();
  }, []);

  const snapPoints = useMemo(() => ["50%", "75%"], []);
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
      console.log("error1");
      const balance = await connection.getBalance(new PublicKey(publickey));

      if (balance < Number(stakeAmount) * LAMPORTS_PER_SOL) {
        throw new Error("Insufficient balance");
      }
      console.log("error2");
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publickey),
          toPubkey: new PublicKey(escrowpublickey),
          lamports: LAMPORTS_PER_SOL * Number(stakeAmount),
        })
      );
      console.log("error3");
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(publickey);

      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      const userid = await AsyncStorage.getItem("userid");

      const daysDifference = Math.ceil(
        (new Date(form.enddate).getTime() -
          new Date(form.startdate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      console.log(daysDifference);
      console.log(form);
      console.log(sleepGoal);
      console.log(serializedTransaction);
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.post(`${BACKEND_URL}/create/stake`, {
        tx: serializedTransaction,
        userid: userid,
        amount: Number(stakeAmount),
        Hours: sleepGoal.toString(),
        Startdate:today
      }); 
      console.log(response.data);
      if (response.status === 200) {
        setSuccess(true);
        ToastAndroid.show("Added to the contest", ToastAndroid.SHORT);
      }
    } catch (e: any) {
      setError(e);
      console.log(e);
      ToastAndroid.show(e.message || "Transaction Failed!", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <LinearGradient
            colors={["#1a0033", "#4b0082", "#290d44"]}
            style={styles.gradient}
          >
            <View style={styles.container}>
              <Text style={styles.title}>Your daily sleep duration</Text>
              <Image
                source={require("../../assets/images/sleepIcon.png")}
                style={{ width: "90%", height: "20%" }}
              />
              <Text style={styles.goalText}>
                {sleepGoal} <Text>hours</Text>
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={15}
                step={1}
                onValueChange={(value) => setSleepGoal(value)}
                minimumTrackTintColor="#7FD4F5"
                maximumTrackTintColor="#8A9AAB"
                thumbTintColor="#7FD4F5"
              />
              {/* <Text style={styles.stakeLabel}>Stake Amount</Text> */}
              <TextInput
                style={styles.input}
                placeholder="Enter amount to stake"
                placeholderTextColor="#8A9AAB"
                keyboardType="numeric"
                value={stakeAmount}
                onChangeText={setStakeAmount}
              />
              {/* <View style={styles.input}>
                <TouchableOpacity onPress={showStartDatePicker}>
                  <Text style={styles.dateButtonText}>
                    Start Date: {format(startDate, "yyyy-MM-dd")}
                  </Text>
                </TouchableOpacity>
                {showStartDate && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={startDate}
                    mode={startDateMode}
                    is24Hour={true}
                    display="default"
                    onChange={handleStartDateChange}
                  />
                )}
              </View> */}
              {/* <View style={styles.input}>
                <TouchableOpacity onPress={showEndDatePicker}>
                  <Text style={styles.dateButtonText}>
                    End Date: {format(endDate, "yyyy-MM-dd")}
                  </Text>
                </TouchableOpacity>
                {showEndDate && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={endDate}
                    mode={endDateMode}
                    is24Hour={true}
                    display="default"
                    onChange={handleEndDateChange}
                  />
                )}
              </View> */}
              <TouchableOpacity
                style={{
                  alignSelf: "center",
                  backgroundColor: "#783887",
                  paddingHorizontal: 20,
                  paddingVertical: 5,
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={handlePresentModalPress}
              >
                <Text
                  style={{
                    color: "white",
                  }}
                >
                  Join
                </Text>
              </TouchableOpacity>
            </View>
            <BottomSheetModal
              ref={bottomSheetModalRef}
              snapPoints={snapPoints}
              backgroundStyle={styles.BottomSheetBackground}
            >
              <BottomSheetView
                style={{
                  flex: 1,
                }}
              >
                <View style={{ paddingHorizontal: 10 }}>
                  <View style={styles.gameDetailsContainer}>
                    <Text
                      style={{
                        color: "white",
                      }}
                    >
                      You Pay:{stakeAmount} SOL
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
                      amount={stakeAmount}
                      onRetry={handleRetry}
                      onClose={handleClose}
                    />
                  )}
                </View>
              </BottomSheetView>
            </BottomSheetModal>
          </LinearGradient>
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  BottomSheetBackground: {
    flex: 1,
    backgroundColor: "#7E3887",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gameDetailsContainer: {
    backgroundColor: "#1a0033",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    color: "white",
    fontSize: 22,
    marginBottom: 30,
    alignSelf: "center",
  },
  errorMessage: {
    color: "white",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  goalText: {
    color: "#7FD4F5",
    fontSize: 30,
    fontWeight: "bold",
    marginVertical: 20,
    alignSelf: "center",
  },
  dateButtonText: {
    color: "white",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  transactionContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#1a0033",
    borderRadius: 10,
  },
  slider: {
    width: 350,
    height: 40,
    alignSelf: "center",
    marginBottom: 20,
  },
  stakeLabel: {
    color: "white",
    fontSize: 18,
    marginTop: 30,
    marginBottom: 10,
    alignSelf: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 30, 30, 0.7)",
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  input: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderColor: "#783887",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "white",
    fontSize: 16,
    alignSelf: "center",
    backgroundColor: "#783887",
    justifyContent: "center",
    marginBottom: 20,
  },
  bottomSheetBackground: {
    backgroundColor: "#7E3887",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
});

export default SetGoalsScreen;