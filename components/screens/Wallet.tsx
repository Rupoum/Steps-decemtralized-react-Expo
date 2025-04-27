"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  ToastAndroid,
  Animated,
  ActivityIndicator,
} from "react-native";
import React from "react";
import {
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import SlideButton from "rn-slide-button";
import axios from "axios";
import { BACKEND_URL } from "@/Backendurl";
import { router } from "expo-router";

const TransactionLoader = ({
  loading,
  error,
  success,
  amount,
  recipientAddress,
  onRetry,
  onClose,
}: any) => {
  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
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

  const truncateAddress = (address: any) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <View style={loaderStyles.container}>
      <View style={loaderStyles.card}>
        {loading && (
          <View style={loaderStyles.loadingContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Feather name="loader" size={48} color="white" />
            </Animated.View>
            <Text style={loaderStyles.loadingText}>Processing Transaction</Text>
            <Text style={loaderStyles.loadingSubtext}>
              Please wait while we process your transaction
            </Text>

            <View style={loaderStyles.transactionDetails}>
              <View style={loaderStyles.detailRow}>
                <Text style={loaderStyles.detailLabel}>Amount:</Text>
                <Text style={loaderStyles.detailValue}>{amount} SOL</Text>
              </View>
              <View style={loaderStyles.detailRow}>
                <Text style={loaderStyles.detailLabel}>To:</Text>
                <Text style={loaderStyles.detailValue}>
                  {truncateAddress(recipientAddress)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {error && !loading && (
          <View style={loaderStyles.errorContainer}>
            <View style={loaderStyles.errorIconContainer}>
              <Feather name="alert-circle" size={48} color="#EF4444" />
            </View>
            <Text style={loaderStyles.errorTitle}>Transaction Failed</Text>
            <Text style={loaderStyles.errorMessage}>
              {error.message || "An error occurred during the transaction"}
            </Text>

            <View style={loaderStyles.buttonContainer}>
              <TouchableOpacity
                style={loaderStyles.retryButton}
                onPress={onRetry}
              >
                <Text style={loaderStyles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={loaderStyles.cancelButton}
                onPress={onClose}
              >
                <Text style={loaderStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {success && !loading && !error && (
          <View style={loaderStyles.successContainer}>
            <View style={loaderStyles.successIconContainer}>
              <Feather name="check" size={48} color="#10B981" />
            </View>
            <Text style={loaderStyles.successTitle}>
              Transaction Successful!
            </Text>
            <Text style={loaderStyles.successMessage}>
              Your transaction has been processed successfully
            </Text>

            <View style={loaderStyles.transactionDetails}>
              <View style={loaderStyles.detailRow}>
                <Text style={loaderStyles.detailLabel}>Amount:</Text>
                <Text style={loaderStyles.detailValue}>{amount} SOL</Text>
              </View>
              <View style={loaderStyles.detailRow}>
                <Text style={loaderStyles.detailLabel}>To:</Text>
                <Text style={loaderStyles.detailValue}>
                  {truncateAddress(recipientAddress)}
                </Text>
              </View>
              <View style={loaderStyles.detailRow}>
                <Text style={loaderStyles.detailLabel}>Status:</Text>
                <Text
                  style={[loaderStyles.detailValue, loaderStyles.successStatus]}
                >
                  Confirmed
                </Text>
              </View>
            </View>

            <TouchableOpacity style={loaderStyles.doneButton} onPress={onClose}>
              <Text style={loaderStyles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const Wallet = () => {
  const connection = new Connection("https://api.devnet.solana.com");
  const [balance, setBalance] = useState(0);
  const [history, sethistory] = useState([
    {
      id: 0,
      amount: 0,
      topublickey: "",
      type: "",
      time: "",
      frompublickey: "",
    },
  ]);
  const [sol, setsol] = useState(0);
  const [error, seterror] = useState("");
  const [loading, setloading] = useState(false);
  const Airdrop = async () => {
    try {
      setloading;
      const connection = new Connection("https://api.devnet.solana.com");
      const publicKey = await AsyncStorage.getItem("PublicKey");
      if (!publicKey) {
        ToastAndroid.show("No public Key found", ToastAndroid.SHORT);
        return;
      }
      await connection.requestAirdrop(
        new PublicKey(publicKey),
        1 * LAMPORTS_PER_SOL
      );

      ToastAndroid.show("1 SOL Airdropped", ToastAndroid.SHORT);
      router.push("/(tabs)/wallet");
    } catch (e: any) {
      // seterro(e);
      console.log(e);
      seterror(e);
      ToastAndroid.show(
        "Failed To Airdrop Try after Sometime",
        ToastAndroid.SHORT
      );
      router.push("/(tabs)/wallet");
    }
  };
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setloading(true);
        const publicKey = await AsyncStorage.getItem("PublicKey");
        console.log(publicKey);
        if (!publicKey) {
          ToastAndroid.show("No public Key found", ToastAndroid.SHORT);
          return;
        }

        const [response, balance, accountInfo] = await Promise.all([
          axios.get("http://192.168.29.157:3000/test"),

          connection.getBalance(new PublicKey(publicKey)),
          connection.getSignaturesForAddress(new PublicKey(publicKey), {
            limit: 10,
          }),
        ]);

        const transactionPromises = accountInfo.map(async (account) => {
          try {
            const signature = await connection.getParsedTransaction(
              account.signature
            );
            // console.log(account);
            if (!signature) return null;
            console.log("test", signature.transaction.message);

            let amount = 0;
            let type = "";
            let from = "";
            let to = "";
            if (
              signature.transaction.message.accountKeys[0].signer &&
              signature.transaction.message.accountKeys[0].pubkey.toBase58() ===
                publicKey
            ) {
              const postbalance = signature.meta?.postBalances[0] || 0;
              const prebalance = signature.meta?.preBalances[0] || 0;
              amount = prebalance - postbalance;
              type = "Send";
              from = publicKey;
              to =
                signature.transaction.message.accountKeys[1].pubkey.toBase58();
            } else {
              const postbalance = signature.meta?.postBalances[1] || 0;
              const prebalance = signature.meta?.preBalances[1] || 0;
              amount = postbalance - prebalance;
              type = "Recieve";
              from =
                signature.transaction.message.accountKeys[0].pubkey.toBase58();
              to =
                signature.transaction.message.accountKeys[1].pubkey.toBase58();
            }

            return {
              amount: Math.abs(amount) / LAMPORTS_PER_SOL,
              toPublicKey: to,
              type,
              time: signature.blockTime
                ? new Date(signature.blockTime * 1000).toLocaleString()
                : "Unknown",
              frompublickey: from,
              id: account.signature,
            };
          } catch (error) {
            console.error("Error processing transaction:", error);
            return null;
          } finally {
            setloading(false);
          }
        });
        const transactions = (await Promise.all(transactionPromises)).filter(
          Boolean
        );
        sethistory(transactions);
        setBalance(balance * response.data.sol);
        setsol(balance / LAMPORTS_PER_SOL);
      } catch (e) {
        console.error("Wallet fetch error:", e);
      }
    };

    fetchWallet();
  }, []);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);
  const snapPointsModal = useMemo(() => ["30%", "50%"], []);
  const snapPointsModal2 = useMemo(() => ["55%", "60%"], []);

  const renderItem = useCallback(({ item }: any) => {
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionIconContainer}>
          {
            item.type === "Recieve" ? (
              <Feather name="arrow-down-left" size={20} color="#4CD964" />
            ) : (
              <Feather name="arrow-up-right" size={20} color="#FF3B30" />
            )
            // <Feather name="repeat" size={20} color="#007AFF" />
          }
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>
            {item.type === "Recieve"
              ? `From ${item.frompublickey}`
              : `To ${item.toPublicKey}`}
          </Text>
          <Text style={styles.transactionDate}>{item.time}</Text>
        </View>

        <Text
          style={[
            styles.transactionAmount,
            {
              color:
                item.type === "Recieve"
                  ? "#4CD964"
                  : item.type === "Send"
                  ? "#FF3B30"
                  : "#007AFF",
            },
          ]}
        >
          {item.amount}
        </Text>
        <Image
          source={require("../../assets/images/Sol.png")}
          style={{ width: 20, height: 30, marginLeft: 10 }}
        />
      </View>
    );
  }, []);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const bottomSheetModalRef2 = useRef<BottomSheetModal>(null);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSendModal = useCallback(() => {
    bottomSheetModalRef2.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);
  const handleSheetChanges2 = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <LinearGradient
            colors={["#1a0033", "#4b0082", "#290d44"]}
            style={styles.gradient}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Wallet</Text>
              {/* <TouchableOpacity style={styles.settingsButton}>
                <Feather name="settings" size={24} color="#5EDCF5" />
              </TouchableOpacity> */}
            </View>
            <View style={styles.balanceContainer}>
              {/* <ActivityIndicator size="large" color="#00ff00" /> */}

              <Text style={styles.balanceText}>
                ${(balance / LAMPORTS_PER_SOL).toFixed(2)}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 30,
                gap: 10,
              }}
            >
              <Image
                source={require("../../assets/images/Sol.png")}
                style={{ width: 30, height: 30 }}
              />
              <Text
                style={{
                  color: "white",
                }}
              >
                {sol}
              </Text>
            </View>
            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handlePresentModalPress}
              >
                <Feather name="plus" size={24} color="white" />
                <Text style={styles.actionButtonText}>Add</Text>
              </TouchableOpacity>
              {/* <Button title="Present Modal" color="black" /> */}
              <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={snapPointsModal}
                index={0}
                handleIndicatorStyle={{
                  backgroundColor: "#CCCCCC",
                  width: 40,
                  height: 5,
                  borderRadius: 3,
                }}
                onChange={handleSheetChanges}
                backgroundStyle={styles.bottomModalBackground}
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
                  <AddModal />
                </BottomSheetView>
              </BottomSheetModal>
              <TouchableOpacity style={styles.actionButton} onPress={Airdrop}>
                <Feather name="dollar-sign" size={24} color="white" />
                <Text style={styles.actionButtonText}>Airdrop</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSendModal}
              >
                <Feather name="send" size={24} color="white" />
                <Text style={styles.actionButtonText}>Send</Text>
              </TouchableOpacity>
              <BottomSheetModal
                ref={bottomSheetModalRef2}
                snapPoints={snapPointsModal2}
                index={0}
                handleIndicatorStyle={{
                  backgroundColor: "#CCCCCC",
                  width: 40,
                  height: 5,
                  borderRadius: 3,
                }}
                onChange={handleSheetChanges2}
                backgroundStyle={styles.bottomModalBackground}
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
                  <SendModal />
                </BottomSheetView>
              </BottomSheetModal>
            </View>
          </LinearGradient>
          <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            backgroundStyle={styles.bottomSheetBackground}
            handleIndicatorStyle={styles.bottomSheetIndicator}
            style={{ paddingHorizontal: 12 }}
          >
            <View
              style={{
                backgroundColor: "#1a0033",
                marginTop: 20,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
            >
              <View style={styles.bottomSheetHeader}>
                <Text style={styles.bottomSheetTitle}>Balances</Text>
                <Feather name="clock" size={20} color="white" />
              </View>
              <View></View>
              {loading ? (
                <ActivityIndicator size="large" color="#00ff00" />
              ) : (
                <BottomSheetFlatList
                  data={history}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderItem}
                  contentContainerStyle={styles.transactionList}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>
                      No Transaction available
                    </Text>
                  }
                />
              )}
            </View>
          </BottomSheet>
        </BottomSheetModalProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const AddModal = () => {
  const [copiedText, setCopiedText] = useState("");
  const [pubclickey, setpublic] = useState("");
  useEffect(() => {
    const getpublic = async () => {
      const key = await AsyncStorage.getItem("PublicKey");
      if (key == null) {
        return;
      }
      setpublic(key);
    };
    getpublic();
  });
  const copyToClipboard = async () => {
    const key = await AsyncStorage.getItem("PublicKey");
    if (key == null) {
      setCopiedText("No public key found");
      return;
    }

    setCopiedText(key);
    await Clipboard.setStringAsync(key);
  };
  return (
    <View
      style={{
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 10,
          backgroundColor: "#1a0033",
          borderRadius: 20,
          marginTop: 20,
        }}
      >
        <Text style={styles.bottomSheetTitle}>Add crypto</Text>
        <View
          style={{
            padding: 20,
            borderRadius: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#9c96a3",
              padding: 10,
              borderRadius: 20,
              marginTop: 20,
            }}
          >
            <Text
              style={{
                color: "white",
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {pubclickey}
            </Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: "#7E3887",
              paddingVertical: 10,
              width: "20%",
              borderRadius: 20,
              marginTop: 20,
              alignItems: "center",
              alignSelf: "center",
            }}
            onPress={copyToClipboard}
          >
            <Text style={{ color: "white" }}>Copy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const SendModal = () => {
  const [Amount, setamount] = useState(0);
  const [publicaddress, setpublicaddress] = useState("");
  const [error, seterror] = useState(null);
  const [loading, setloading] = useState(false);
  const [response, setresponse] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const handleRetry = () => {
    seterror(null);
    onSend();
  };

  const handleClose = () => {
    setShowLoader(false);
    seterror(null);
    setresponse(false);
  };

  const onSend = async () => {
    setShowLoader(true);
    setloading(true);
    seterror(null);

    try {
      const publickey = await AsyncStorage.getItem("PublicKey");
      if (!publickey) {
        throw new Error("No public key found");
      }
      const connection = new Connection("https://api.devnet.solana.com");
      const getBalance = await connection.getBalance(new PublicKey(publickey));

      if (getBalance < Amount * LAMPORTS_PER_SOL) {
        throw new Error("Don't have enough funds!");
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publickey),
          toPubkey: new PublicKey(publicaddress),
          lamports: LAMPORTS_PER_SOL * Amount,
        })
      );
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(publickey);
      const serializetransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      const response = await axios.post(`${BACKEND_URL}/send/wallet`, {
        tx: serializetransaction,
      });
      console.log(response.data);
      setresponse(true);
      ToastAndroid.show("Transaction Sent Successfully!", ToastAndroid.SHORT);
    } catch (e: any) {
      console.log(e);
      setresponse(false);
      seterror(e);
      ToastAndroid.show(e.message || "Transaction Failed!", ToastAndroid.SHORT);
    } finally {
      setloading(false);
    }
  };

  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View
        style={{ padding: 20, borderRadius: 20, backgroundColor: "#1a0033" }}
      >
        {showLoader ? (
          <TransactionLoader
            loading={loading}
            error={error}
            success={response}
            amount={Amount}
            recipientAddress={publicaddress}
            onRetry={handleRetry}
            onClose={handleClose}
          />
        ) : (
          <View>
            <Text style={styles.bottomSheetTitle}>Send Crypto</Text>
            <View>
              <Text style={{ color: "white", marginTop: 20 }}>
                Send crypto to a friend
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 20,
                  paddingLeft: 10,
                }}
              >
                <Text style={{ color: "white" }}>Amount</Text>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#9c96a3",
                    padding: 8,
                    marginLeft: 5,
                    borderRadius: 20,
                  }}
                >
                  <TextInput
                    placeholder="Enter amount"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    onChangeText={(e) => {
                      setamount(Number.parseFloat(e) || 0);
                    }}
                    style={{ color: "white" }}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 20,
                }}
              >
                <Text style={{ color: "white" }}>Recipient</Text>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#9c96a3",
                    padding: 10,
                    borderRadius: 20,
                    marginLeft: 10,
                  }}
                >
                  <TextInput
                    placeholder="Enter recipient address"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    style={{ color: "white" }}
                    onChangeText={(e) => setpublicaddress(e)}
                  />
                </View>
              </View>
              <View style={{ marginTop: 20 }}>
                <SlideButton
                  title="Slide To Send"
                  width="70%"
                  padding="2"
                  reverseSlideEnabled={false}
                  animation={true}
                  titleContainerStyle={{
                    backgroundColor: "#7E3887",
                  }}
                  containerStyle={{
                    backgroundColor: "#4b0082",
                  }}
                  underlayStyle={{
                    backgroundColor: "#1a0033",
                  }}
                  onSlideEnd={onSend}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  bottomModalBackground: {
    flex: 1,
    backgroundColor: "#7E3887",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  container: {
    flex: 1,
    backgroundColor: "#1E2130",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  balanceText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    width: 80,
    height: 80,
    backgroundColor: "#252A3D",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    marginTop: 8,
    fontSize: 14,
  },
  bottomSheetBackground: {
    backgroundColor: "#7E3887",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetIndicator: {
    backgroundColor: "#CCCCCC",
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  transactionList: {
    paddingBottom: "100%",
    paddingHorizontal: 20,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 13,
    fontWeight: "200",
    color: "white",
  },
  transactionDate: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

// Loader component styles
const loaderStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  card: {
    width: "100%",

    backgroundColor: "#7E3887",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 24,
  },
  errorContainer: {
    alignItems: "center",
    padding: 16,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3F1D54",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EF4444",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  successContainer: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1a0033",
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1D3F2B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 24,
  },
  transactionDetails: {
    // width: "100%",
    backgroundColor: "#290d44",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    marginTop: 16,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#CCCCCC",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  successStatus: {
    color: "#10B981",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  retryButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#290d44",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#CCCCCC",
    fontSize: 16,
    fontWeight: "600",
  },
  doneButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Wallet;
