import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
  ScrollView,
  FlatList,
  ToastAndroid,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import axios from "axios";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BACKEND_URL } from "@/Backendurl";

const CreateSleepSccreen = () => {
  const [form, setform] = useState({
    name: "",
    memberqty: 0,
    Hours: "",
    Amount: 0,
    Digital_Currency: "sol",
    days: 0,
    startdate: format(new Date(), "yyyy-MM-dd").toString(),
    enddate: format(new Date(), "yyyy-MM-dd").toString(),
  });

  const [loading, setLoading] = useState(false);
  const [error, seterror] = useState<string | null>(null);
  const [startDateMode, setStartDateMode] = useState<"date" | "time">("date");
  const [endDateMode, setEndDateMode] = useState<"date" | "time">("date");
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState<"public" | "community">(
    "public"
  );
  const animatedValue = useRef(new Animated.Value(0)).current;
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  useEffect(() => {
    seterror(null);
    if (selectedTab === "community") {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
    const fetchFriends = async () => {
      const userid = await AsyncStorage.getItem("userid");
      console.log(userid);
      const response = await axios.get(`${BACKEND_URL}/get/friends/${userid}`);
      console.log(response.data.user);
      setFriends(response.data.user);
    };
    fetchFriends();
  }, [selectedTab]);

  const toggleFriendSelection = (friend: any) => {
    setSelectedFriends((prevSelected: any) => {
      if (prevSelected.includes(friend)) {
        const newSelected = prevSelected.filter((f: any) => f !== friend);
        // console.log("Friend deselected:", friend);
        // console.log("Currently selected friends:", newSelected);
        return newSelected;
      } else {
        const newSelected = [...prevSelected, friend];
        console.log("Friend selected:", friend);
        console.log("Currently selected friends:", newSelected);
        return newSelected;
      }
    });
  };

  useEffect(() => {
    setform((prev) => ({ ...prev, request: selectedFriends }));
  }, [selectedFriends]);

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

  const showEndDatePicker = () => {
    setEndDateMode("date");
    setShowEndDate(true);
  };
  const handleCreategame = async () => {
    setLoading(true);
    seterror(null);
    try {
      console.log("chek1");
      console.log("forma", form);
      const userid = await AsyncStorage.getItem("userid");
      console.log(userid);
      try {
        const response = await axios.post(
          `${BACKEND_URL}/create/challenge/sleep`,
          {
            name: form.name,
            memberqty: form.memberqty,
            // types:"Sleep",
            Amount: form.Amount,
            Digital_Currency: "sol",
            Hours: form.Hours.toString(),
            days: form.days,
            startdate: form.startdate,
            enddate: form.enddate,
            userid: userid,
            // request: form.request,
          }
        );
        console.log("Signup response:", response.data);
        Alert.alert("Success", "Game Created Successfully");
        router.push("/(tabs)");
      } catch (e) {
        console.log(e);
      }
    } catch (err: any) {
      if (err instanceof Error && "response" in err) {
        // console.log(err.r);
        console.log("heee");
        try {
          const axiosError = err as {
            response: { data: { error: { message: string } } };
          };
          console.log(axiosError);
          // @ts-ignore
          ToastAndroid.show(
            err.response.data.error[0].message,
            ToastAndroid.LONG
          );
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          ToastAndroid.show("An unexpected error occurred.", ToastAndroid.LONG);
        }
      } else {
        console.log(err);
        seterror("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  const handlePrivateCreategame = async () => {
    console.log("chee");
    setLoading(true);
    seterror(null);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/challenge/sleep/private`,
        {
          name: form.name,
          memberqty: form.memberqty,
          Hours: form.Hours.toString(),
          Amount: form.Amount,
          Digital_Currency: "sol",
          days: form.days,
          types: "Sleep",
          startdate: form.startdate,
          enddate: form.enddate,
          userid: await AsyncStorage.getItem("userid"),
          request: selectedFriends,
        }
      );
      Alert.alert("Success", "Game Created Successfully");
      router.push("/(tabs)");
      console.log("Signup response:", response.data);
    } catch (err: any) {
      if (err instanceof Error && "response" in err) {
        // console.log(err);
        const axiosError = err as { response: { data: { message: string } } };
        // @ts-ignore
        console.log(axiosError.response.data.error[0].message);
        // @ts-ignore
        ToastAndroid.show(
          err.response.data.error[0].message,
          ToastAndroid.LONG
        );
        // @ts-ignore
        seterror(
          // @ts-ignore
          axiosError.response.data.error[0].message ||
            "An error occurred. Please try again."
        );
      } else {
        console.log(err);
        seterror("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleTabPress = (tab: "public" | "community") => {
    setSelectedTab(tab);
    Animated.timing(animatedValue, {
      toValue: tab === "public" ? 0 : 1,
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

  const handleSheetChanges = useCallback((index: number) => {
    // console.log("handleSheetChanges", index);
  }, []);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <LinearGradient
        colors={["#1a0033", "#4b0082", "#8a2be2"]}
        style={styles.container}
      >
        <BottomSheetModalProvider>
          <SafeAreaView style={styles.safeArea}>
            <View>
              <View
                style={{ flexDirection: "row", justifyContent: "space-evenly" }}
              >
                <TouchableOpacity onPress={() => handleTabPress("public")}>
                  <View>
                    <Text style={{ color: "white" }}>For Everyone</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleTabPress("community")}>
                  <View>
                    <Text style={{ color: "white" }}>For Community</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.tabIndicatorContainer}>
              <Animated.View style={[styles.tabIndicator, animatedBarStyle]} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <View style={styles.contentContainer}>
                {selectedTab === "public" ? (
                  <View>
                    <View style={styles.headerContainer}>
                      <Text style={styles.title}>
                        Create Challenge for Everyone
                      </Text>
                    </View>

                    <GameForm
                      form={form}
                      setform={setform}
                      loading={loading}
                      error={error}
                      startDate={startDate}
                      endDate={endDate}
                      showStartDate={showStartDate}
                      showEndDate={showEndDate}
                      startDateMode={startDateMode}
                      endDateMode={endDateMode}
                      showStartDatePicker={showStartDatePicker}
                      showEndDatePicker={showEndDatePicker}
                      handleStartDateChange={handleStartDateChange}
                      handleEndDateChange={handleEndDateChange}
                      handleCreategame={handleCreategame}
                    />
                  </View>
                ) : (
                  <View>
                    <View style={styles.headerContainer}>
                      <Text style={styles.title}>
                        Create Challenge for Community
                      </Text>
                    </View>
                    <GameForm
                      form={form}
                      setform={setform}
                      loading={loading}
                      error={error}
                      startDate={startDate}
                      endDate={endDate}
                      showStartDate={showStartDate}
                      showEndDate={showEndDate}
                      startDateMode={startDateMode}
                      endDateMode={endDateMode}
                      showStartDatePicker={showStartDatePicker}
                      showEndDatePicker={showEndDatePicker}
                      handleStartDateChange={handleStartDateChange}
                      handleEndDateChange={handleEndDateChange}
                      handleCreategame={handlePrivateCreategame}
                    />
                    <TouchableOpacity
                      onPress={handlePresentModalPress}
                      style={styles.inviteFriendsButton}
                    >
                      <Text style={styles.inviteFriendsText}>
                        Invite Friends
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
            <BottomSheetModal
              ref={bottomSheetModalRef}
              index={0}
              snapPoints={["25%", "50%", "70%"]}
              onChange={handleSheetChanges}
              handleIndicatorStyle={{
                backgroundColor: "#CCCCCC",
                width: 40,
                height: 5,
                borderRadius: 3,
              }}
              backgroundStyle={styles.bottomModalBackground}
            >
              <BottomSheetView style={styles.bottomSheetContainer}>
                <Text style={styles.bottomSheetTitle}>Select Friends</Text>
                <Text style={styles.selectedCountText}>
                  {selectedFriends.length} friends selected
                </Text>
                <FlatList
                  data={friends}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.friendItem,
                        selectedFriends.includes(item) &&
                          styles.friendItemSelected,
                      ]}
                      onPress={() => toggleFriendSelection(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.checkboxContainer}>
                        <View
                          style={[
                            styles.checkbox,
                            selectedFriends.includes(item) &&
                              styles.checkboxSelected,
                          ]}
                        >
                          {selectedFriends.includes(item) && (
                            <View style={styles.checkmark} />
                          )}
                        </View>
                      </View>
                      <View style={styles.friendInfoContainer}>
                        <Text style={styles.friendText}>{item}</Text>
                        {selectedFriends.includes(item) && (
                          <Text style={styles.selectedText}>Selected</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                  contentContainerStyle={styles.friendsList}
                />
              </BottomSheetView>
            </BottomSheetModal>
          </SafeAreaView>
        </BottomSheetModalProvider>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};
const GameForm = ({
  form,
  setform,
  loading,
  error,
  startDate,
  endDate,
  showStartDate,
  showEndDate,
  startDateMode,
  endDateMode,
  showStartDatePicker,
  showEndDatePicker,
  handleStartDateChange,
  handleEndDateChange,
  handleCreategame,
}: any) => {
  return (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#999"
          onChangeText={(e) => {
            setform({ ...form, name: e });
          }}
          keyboardType="name-phone-pad"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Members Quantity"
          placeholderTextColor="#999"
          onChangeText={(e) => {
            setform({ ...form, memberqty: parseInt(e) });
          }}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Hours"
          placeholderTextColor="#999"
          onChangeText={(e) => setform({ ...form, Hours: parseInt(e) })}
          keyboardType="name-phone-pad"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#999"
          onChangeText={(e) => {
            setform({ ...form, Amount: parseFloat(e) });
          }}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Days"
          placeholderTextColor="#999"
          onChangeText={(e) => {
            setform({ ...form, days: parseInt(e) });
          }}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
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
      </View>
      <View style={styles.inputContainer}>
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
      </View>

      {error && (
        <View style={styles.container}>
          <Text style={styles.signUpButtonText}>{error}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.signUpButton}
        onPress={handleCreategame}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.signUpButtonText}>Create Tournament</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  formContainer: {
    width: "100%",
  },

  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  checkboxSelected: {
    backgroundColor: "#4CAF50",
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: "white",
    borderRadius: 2,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  friendItemSelected: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
  friendInfoContainer: {
    flex: 1,
  },
  friendText: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  selectedText: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 8,
  },
  friendsList: {
    paddingVertical: 8,
  },
  bottomSheetTitle: {
    fontSize: 20,
    marginBottom: 8,
    color: "white",
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  selectedCountText: {
    fontSize: 14,
    color: "#4CAF50",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  inviteFriendsButton: {
    backgroundColor: "rgba(74, 20, 140, 0.8)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  inviteFriendsText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
    flex: 1,
    color: "white",
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: "#8a2be2",
    borderRadius: 5,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  signUpButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  dateButtonText: {
    color: "white",
    fontSize: 16,
  },
  tabIndicator: {
    width: "45%",
    height: 2,
    backgroundColor: "green",
  },
  tabIndicatorContainer: {
    marginTop: 10,
    width: "90%",
    height: 2,
    alignSelf: "center",
    backgroundColor: "#333",
  },
  bottomSheetContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1a0033",
    marginHorizontal: 10,
    marginTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomModalBackground: {
    flex: 1,
    backgroundColor: "#7E3887",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});

export default CreateSleepSccreen;
