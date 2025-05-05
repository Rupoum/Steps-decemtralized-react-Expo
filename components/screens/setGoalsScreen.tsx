"use client"

import { LinearGradient } from "expo-linear-gradient"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  Animated,
  Vibration,
  Dimensions,
  Easing,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Slider from "@react-native-community/slider"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { BACKEND_URL } from "@/Backendurl"
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from "@gorhom/bottom-sheet"
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import SlideButton from "rn-slide-button"
import { router } from "expo-router"
import React from "react"

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

// Animated moon component
const AnimatedMoon = () => {
  const moonScale = useRef(new Animated.Value(1)).current
  const moonRotation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(moonScale, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(moonScale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    Animated.loop(
      Animated.timing(moonRotation, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }, [])

  const spin = moonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <Animated.View
      style={[
        styles.moonContainer,
        {
          transform: [{ scale: moonScale }, { rotate: spin }],
        },
      ]}
    >
      <View style={styles.moon}>
        <View style={styles.moonCrater1} />
        <View style={styles.moonCrater2} />
        <View style={styles.moonCrater3} />
      </View>
    </Animated.View>
  )
}

// Animated coin component
const AnimatedCoin = ({ value }) => {
  const coinRotation = useRef(new Animated.Value(0)).current
  const coinScale = useRef(new Animated.Value(1)).current
  const coinY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Coin flip animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(coinRotation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Coin bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(coinY, {
          toValue: -10,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(coinY, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Pulse animation when value changes
    Animated.sequence([
      Animated.timing(coinScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(coinScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }, [value])

  const spin = coinRotation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "90deg", "180deg"],
  })

  const coinWidth = coinRotation.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [40, 20, 0, 20, 40],
  })

  return (
    <Animated.View
      style={[
        styles.coinContainer,
        {
          transform: [{ translateY: coinY }, { rotateY: spin }, { scale: coinScale }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.coin,
          {
            width: coinWidth,
          },
        ]}
      >
        <Text style={styles.coinText}>SOL</Text>
      </Animated.View>
    </Animated.View>
  )
}

// Transaction loader with animations
const TransactionLoader = ({ loading, error, success, amount, onRetry, onClose }) => {
  const spinValue = useRef(new Animated.Value(0)).current
  const scaleValue = useRef(new Animated.Value(0)).current
  const successOpacity = useRef(new Animated.Value(0)).current
  const successScale = useRef(new Animated.Value(0.5)).current

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ).start()

      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      spinValue.setValue(0)
    }

    if (success) {
      // Vibrate on success
      Vibration.vibrate([0, 70, 50, 100])

      // Animate success message
      Animated.parallel([
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(successScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start()

      // Navigate after delay
      setTimeout(() => {
        router.push("/(nonav)/profile")
      }, 2000)
    }
  }, [loading, success])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <Animated.View style={[styles.transactionContainer, { transform: [{ scale: scaleValue }] }]}>
      {loading && (
        <View style={styles.loaderContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <View style={styles.customLoader}>
              <View style={styles.loaderInner} />
            </View>
          </Animated.View>
          <Text style={styles.processingText}>Processing Transaction...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <Text style={styles.errorTitle}>Transaction Failed</Text>
          <Text style={styles.errorMessage}>{error.message || "An error occurred"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {success && !loading && (
        <Animated.View
          style={[
            styles.successContainer,
            {
              opacity: successOpacity,
              transform: [{ scale: successScale }],
            },
          ]}
        >
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.successText}>Quest Started!</Text>
          <Text style={styles.successMessage}>You've staked {amount} SOL</Text>
          <Text style={styles.redirectingText}>Redirecting to your profile...</Text>
        </Animated.View>
      )}
    </Animated.View>
  )
}

const SetGoalsScreen = () => {
  const [sleepGoal, setSleepGoal] = useState(8)
  const [stakeAmount, setStakeAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [stakeds, setStaked] = useState(false)

  const titleOpacity = useRef(new Animated.Value(0)).current
  const sliderScale = useRef(new Animated.Value(0.9)).current
  const inputScale = useRef(new Animated.Value(0.9)).current
  const buttonScale = useRef(new Animated.Value(1)).current
  const sleepGoalScale = useRef(new Animated.Value(1)).current

  const connection = new Connection("https://api.devnet.solana.com")
  const escrowpublickey = "AL3YQV36ADyq3xwjuETH8kceNTH9fuP43esbFiLF1V1A";

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(() => ["50%", "75%"], [])

  useEffect(() => {
    // Animate elements on mount
    Animated.stagger(200, [
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(sliderScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(inputScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()
    const checkStake = async () => {
      try {
        const userid = await AsyncStorage.getItem("userid")
        const stake = await axios.get(`${BACKEND_URL}/getstake/${userid}`)
        if (stake.data.stake[0]?.Status === "CurrentlyRunning") {
          router.replace("/(nonav)/goal")
          setStaked(true)
        } else {
          setStaked(false)
        }
      } catch (e) {
        console.log(e)
      }
    }
    checkStake()
  }, [])

  // Button press animation
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  // Sleep goal change animation
  useEffect(() => {
    Animated.sequence([
      Animated.timing(sleepGoalScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sleepGoalScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }, [sleepGoal])

  const handlePresentModalPress = useCallback(() => {
    animateButton()
    setShowLoader(false)
    bottomSheetModalRef.current?.present()
  }, [])

  const handleRetry = () => {
    setError(null)
    Onsend()
  }

  const handleClose = () => {
    setShowLoader(false)
    setError(null)
    setSuccess(false)
  }

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
      const publickeys=new PublicKey(publickey);
      console.log(publickeys);
      const exc=new PublicKey(escrowpublickey);
        console.log("assd",exc);
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

      console.log(sleepGoal);
      console.log(serializedTransaction);
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.post(`${BACKEND_URL}/create/stake`, {
        tx: serializedTransaction,
        userid: userid,
        amount: Number(stakeAmount),
        Hours: sleepGoal.toString()+"h",
        Startdate:today
      }); 
      console.log(response.data);
      if (response.status === 200) {
        setSuccess(true);
        ToastAndroid.show("Added to the contest", ToastAndroid.SHORT);
        router.push("/(nonav)/profile")
      }
    } catch (e: any) {
      setError(e);
      console.log(e);
      ToastAndroid.show(e.message || "Transaction Failed!", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };
  const getRewardEstimate = () => {
    if (!stakeAmount) return "0"
    const baseMultiplier = 1.2
    const goalBonus = sleepGoal >= 7 && sleepGoal <= 9 ? 0.1 : 0
    const estimatedReward = Number(stakeAmount) * (baseMultiplier + goalBonus)
    return estimatedReward.toFixed(2)
  }
  const interpolatedWidth = sliderScale.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"], // Adjust the range as needed
  });

  // Get difficulty level based on sleep goal
  // const getDifficultyLevel = () => {
  //   if (sleepGoal < 6) return { text: "Easy", color: "#4ADE80" }
  //   if (sleepGoal > 10) return { text: "Hard", color: "#EF4444" }
  //   return { text: "Medium", color: "#F59E0B" }
  // }

  // const difficulty = getDifficultyLevel()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <LinearGradient colors={["#1a0033", "#4b0082", "#290d44"]} style={styles.gradient}>
            <AnimatedStars />

            <View style={styles.container}>
              <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>Sleep Quest Challenge</Animated.Text>

              <View style={styles.questCard}>
                <AnimatedMoon />

                <View style={styles.goalContainer}>
                  <Text style={styles.goalLabel}>Your Sleep Goal</Text>
                  <Animated.Text style={[styles.goalText, { transform: [{ scale: sleepGoalScale }] }]}>
                    {sleepGoal} <Text style={styles.goalUnit}>hours</Text>
                  </Animated.Text>

                  {/* <View style={styles.difficultyBadge}>
                    <Text style={[styles.difficultyText, { color: difficulty.color }]}>{difficulty.text}</Text>
                  </View> */}
                </View>

                <Animated.View
                  style={{
                    width: interpolatedWidth,
                    // transform: [{ scaleX: sliderScale }],
                  }}
                >
                  <Slider
                    style={styles.slider}
                    minimumValue={5}
                    maximumValue={12}
                    step={1}
                      // value={sleepGoal}
                    onValueChange={(value) => setSleepGoal(value)}
                    minimumTrackTintColor="#7FD4F5"
                    maximumTrackTintColor="rgba(138, 154, 171, 0.4)"
                    thumbTintColor="#7FD4F5"
                    
                  />

                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabel}>5h</Text>
                    <Text style={styles.sliderLabel}>12h</Text>
                  </View>
                </Animated.View>

                <View style={styles.rewardInfoContainer}>
                  <Text style={styles.rewardInfoText}>Healthy sleep (7-9h) earns bonus rewards!</Text>
                </View>

                <View style={styles.stakeContainer}>
                  <Text style={styles.stakeLabel}>Your Stake</Text>

                  <View style={styles.stakeInputContainer}>
                    <AnimatedCoin value={stakeAmount} />

                    <Animated.View
                      style={{
                        flex: 1,
                        transform: [{ scale: inputScale }],
                      }}
                    >
                      <TextInput
                        style={styles.input}
                        placeholder="Enter SOL amount"
                        placeholderTextColor="rgba(138, 154, 171, 0.7)"
                        keyboardType="numeric"
                        value={stakeAmount}
                        onChangeText={setStakeAmount}
                      />
                    </Animated.View>
                  </View>

                  {stakeAmount ? (
                    <View style={styles.rewardEstimateContainer}>
                      <Text style={styles.rewardEstimateText}>Potential reward: {getRewardEstimate()} SOL</Text>
                    </View>
                  ) : null}
                </View>

                <Animated.View
                  style={{
                    transform: [{ scale: buttonScale }],
                  }}
                >
                  <TouchableOpacity
                    style={styles.startQuestButton}
                    onPress={handlePresentModalPress}
                    disabled={!stakeAmount || stakeds}
                  >
                    <Text style={styles.startQuestButtonText}>
                      {stakeds ? "Already in a Quest" : "Start Sleep Quest"}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                {stakeds && <Text style={styles.alreadyStakedText}>You already have an active sleep quest!</Text>}
              </View>
            </View>

            <BottomSheetModal
              ref={bottomSheetModalRef}
              snapPoints={snapPoints}
              backgroundStyle={styles.bottomSheetBackground}
            >
              <BottomSheetView style={{ flex: 1 }}>
                <View style={styles.bottomSheetContent}>
                  <View style={styles.bottomSheetHandle} />

                  <Text style={styles.confirmTitle}>Confirm Your Quest</Text>

                  <View style={styles.questDetailsCard}>
                    <View style={styles.questDetailRow}>
                      <Text style={styles.questDetailLabel}>Sleep Goal:</Text>
                      <Text style={styles.questDetailValue}>{sleepGoal} hours</Text>
                    </View>

                    <View style={styles.questDetailRow}>
                      <Text style={styles.questDetailLabel}>Your Stake:</Text>
                      <Text style={styles.questDetailValue}>{stakeAmount} SOL</Text>
                    </View>

                    <View style={styles.questDetailRow}>
                      <Text style={styles.questDetailLabel}>Potential Reward:</Text>
                      <Text style={[styles.questDetailValue, styles.rewardValue]}>{getRewardEstimate()} SOL</Text>
                    </View>

                    <View style={styles.questRulesContainer}>
                      <Text style={styles.questRulesTitle}>Quest Rules:</Text>
                      <Text style={styles.questRulesText}>• Track your sleep daily for 10 days</Text>
                      <Text style={styles.questRulesText}>• Meet your goal at least 7 days to earn rewards</Text>
                      <Text style={styles.questRulesText}>• Earn badges for consistent sleep patterns</Text>
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
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
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
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  questCard: {
    width: "100%",
    backgroundColor: "rgba(26, 0, 51, 0.7)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#783887",
    shadowColor: "#7FD4F5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  moonContainer: {
    marginBottom: 20,
  },
  moon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E1E1E1",
    shadowColor: "#7FD4F5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    position: "relative",
  },
  moonCrater1: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#CCCCCC",
    top: 15,
    left: 15,
  },
  moonCrater2: {
    position: "absolute",
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "#CCCCCC",
    top: 45,
    left: 25,
  },
  moonCrater3: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CCCCCC",
    top: 20,
    right: 15,
  },
  goalContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  goalLabel: {
    color: "#D1D5DB",
    fontSize: 16,
    marginBottom: 5,
  },
  goalText: {
    color: "#7FD4F5",
    fontSize: 42,
    fontWeight: "bold",
  },
  goalUnit: {
    fontSize: 24,
    color: "#7FD4F5",
    opacity: 0.8,
  },
  difficultyBadge: {
    position: "absolute",
    right: -50,
    top: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginTop: -5,
  },
  sliderLabel: {
    color: "#8A9AAB",
    fontSize: 12,
  },
  rewardInfoContainer: {
    backgroundColor: "rgba(127, 212, 245, 0.1)",
    borderRadius: 10,
    padding: 10,
    marginVertical: 15,
    width: "100%",
  },
  rewardInfoText: {
    color: "#7FD4F5",
    fontSize: 14,
    textAlign: "center",
  },
  stakeContainer: {
    width: "100%",
    marginBottom: 20,
  },
  stakeLabel: {
    color: "#D1D5DB",
    fontSize: 16,
    marginBottom: 10,
  },
  stakeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  coinContainer: {
    marginRight: 10,
  },
  coin: {
    height: 40,
    backgroundColor: "#FFD700",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  coinText: {
    color: "#1a0033",
    fontWeight: "bold",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#783887",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "white",
    fontSize: 16,
    backgroundColor: "rgba(120, 56, 135, 0.3)",
  },
  rewardEstimateContainer: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  rewardEstimateText: {
    color: "#FFD700",
    fontSize: 14,
  },
  startQuestButton: {
    backgroundColor: "#783887",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 20,
    shadowColor: "#7FD4F5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  startQuestButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  alreadyStakedText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  bottomSheetBackground: {
    backgroundColor: "#290d44",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: "#783887",
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#783887",
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
  rewardValue: {
    color: "#FFD700",
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
  slideButtonContainer: {
    backgroundColor: "rgba(120, 56, 135, 0.3)",
    borderWidth: 1,
    borderColor: "#783887",
    borderRadius: 30,
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
  transactionContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "rgba(26, 0, 51, 0.9)",
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#783887",
  },
  loaderContainer: {
    alignItems: "center",
    padding: 20,
  },
  customLoader: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "#7FD4F5",
    borderTopColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#783887",
    borderBottomColor: "transparent",
  },
  processingText: {
    color: "white",
    fontSize: 18,
    marginTop: 20,
    fontWeight: "500",
  },
  errorContainer: {
    alignItems: "center",
    padding: 10,
  },
  errorIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  errorIconText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
  },
  errorTitle: {
    color: "#EF4444",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorMessage: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#783887",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  successContainer: {
    alignItems: "center",
    padding: 10,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4ADE80",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  successIconText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
  },
  successText: {
    color: "#4ADE80",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  successMessage: {
    color: "white",
    fontSize: 16,
    marginBottom: 15,
  },
  redirectingText: {
    color: "#D1D5DB",
    fontSize: 14,
    fontStyle: "italic",
  },
})

export default SetGoalsScreen
