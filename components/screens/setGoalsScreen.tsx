import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BACKEND_URL } from "@/Backendurl";

const SetGoalsScreen = () => {
  const [sleepGoal, setSleepGoal] = useState(5);
  const [stakeAmount, setStakeAmount] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startDateMode, setStartDateMode] = useState<"date" | "time">("date");
  const [endDateMode, setEndDateMode] = useState<"date" | "time">("date");
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [form, setform] = useState({
    Amount: 0,
    Hours: "",
    startdate: format(new Date(), "yyyy-MM-dd").toString(),
    enddate: format(new Date(), "yyyy-MM-dd").toString(),
  });
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
  // const userid = await AsyncStorage.getItem("userid");
  // const createsleepchallenge = async () => {
  //   const sleep = await axios.post(`${BACKEND_URL}/create/stake`);
  // };
  return (
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
            // value={sleepGoal}
            onValueChange={(value) => setSleepGoal(value)}
            minimumTrackTintColor="#7FD4F5"
            maximumTrackTintColor="#8A9AAB"
            thumbTintColor="#7FD4F5"
          />
          <Text style={styles.stakeLabel}>Stake Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount to stake"
            placeholderTextColor="#8A9AAB"
            keyboardType="numeric"
            value={stakeAmount}
            onChangeText={setStakeAmount}
          />
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
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    color: "white",
    fontSize: 22,
    marginBottom: 30,
    alignSelf: "center",
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
  slider: {
    width: 350,
    height: 40,
    alignSelf: "center",
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
    borderColor: "#7FD4F5",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "white",
    fontSize: 16,
    alignSelf: "center",
    backgroundColor: "#2A3A4A",
  },
});

export default SetGoalsScreen;
