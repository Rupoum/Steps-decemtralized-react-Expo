import React, { useState } from "react";
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
  ToastAndroid,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import axios from "axios";
import { BACKEND_URL } from "@/Backendurl";
import { BottomSheet } from "@rneui/themed";

const Signup = () => {
  console.log(BACKEND_URL);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, seterror] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = async () => {
    if (!name || !username || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    setOtpLoading(false);

    setOtp("");
    seterror(null);
    try {
      const response = await axios.post(`${BACKEND_URL}/register`, {
        name,
        username,
        email,
        password,
      });
      await AsyncStorage.setItem("username",username);
      // console.log("Signup response:", response.data);
      setShowOtpModal(true);
    } catch (err: any) {
      if (err instanceof Error && "response" in err) {
        console.log(err);
        const axiosError = err as { response: { data: { message: string } } };
        // @ts-ignore
        ToastAndroid.show(err.response.data.message[0].message,ToastAndroid.LONG)
        console.log(axiosError.response.data);
        seterror(
          // @ts-ignore
          axiosError.response.data.error[0].message ||
            "An error occurred. Please try again."
        );
      } else {
        seterror("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }    
    setOtpLoading(true);
    try {
      console.log("chc");
      console.log(otp);
      const response = await axios.post(`${BACKEND_URL}/verify`, {
        email,
        code:otp,
        username,
        name,
        password
      });
      console.log(response);
      await AsyncStorage.setItem("token", response.data.token);
      ToastAndroid.show("Account verified successfully!", ToastAndroid.SHORT);
      router.replace("/(nonav)/nativeheatlth");
    } catch (err: any) {
      if (err instanceof Error && "response" in err) {
        const axiosError = err as { response: { data: { message: string } } };
        ToastAndroid.show(
          axiosError.response.data.message || "Invalid OTP. Please try again.",
          ToastAndroid.LONG
        );
      } else {
        ToastAndroid.show(
          "An unexpected error occurred. Please try again.",
          ToastAndroid.LONG
        );
      }
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#1a0033", "#4b0082", "#8a2be2"]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Sign Up</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  keyboardType="name-phone-pad"
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#999"
                  value={username}
                  onChangeText={setUsername}
                  keyboardType="name-phone-pad"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={toggleShowPassword}
                  style={styles.showButton}
                >
                  <Text style={styles.showButtonText}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>
              
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.newUserContainer}>
                <Text style={styles.newUserText}>Already have an account </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                  <Text style={styles.joinNowText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>

        <BottomSheet
          isVisible={showOtpModal}
          onBackdropPress={() => setShowOtpModal(false)}
          modalProps={{
            animationType: "slide",
            transparent: true,
          }}
        >
          <View style={styles.bottomSheetContainer}>
            <Text style={styles.bottomSheetTitle}>Verify Your Email</Text>
            <Text style={styles.bottomSheetSubtitle}>
              We've sent a 6-digit OTP to {email}
            </Text>
            
            <View style={styles.otpInputContainer}>
              <TextInput
                style={styles.otpInput}
                placeholder="Enter OTP"
                placeholderTextColor="#999"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus={true}
              />
            </View>
            
            <View style={styles.otpButtonContainer}>
              <TouchableOpacity
                style={styles.otpSecondaryButton}
                onPress={() => setShowOtpModal(false)}
              >
                <Text style={styles.otpSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.otpPrimaryButton}
                onPress={verifyOtp}
                disabled={otpLoading}
              >
                {otpLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.otpPrimaryButtonText}>Verify</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheet>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 40,
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 30, 30, 0.7)",
    borderRadius: 10,
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
  showButton: {
    paddingHorizontal: 10,
  },
  showButtonText: {
    color: "#cccccc",
    fontSize: 14,
  },
  signUpButton: {
    backgroundColor: "#8a2be2",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  signUpButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: "#ff3333",
    textAlign: "center",
  },
  newUserContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  newUserText: {
    color: "#cccccc",
    fontSize: 14,
  },
  joinNowText: {
    color: "#8a2be2",
    fontSize: 14,
    fontWeight: "bold",
  },
  // Bottom Sheet Styles
  bottomSheetContainer: {
    backgroundColor: "white",
    padding: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a0033",
    marginBottom: 5,
    textAlign: "center",
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 25,
    textAlign: "center",
  },
  otpInputContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    justifyContent: "center",
    marginBottom: 20,
  },
  otpInput: {
    color: "#1a0033",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  otpButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  otpPrimaryButton: {
    backgroundColor: "#8a2be2",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  otpPrimaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  otpSecondaryButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  otpSecondaryButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  resendText: {
    color: "#666",
    fontSize: 14,
  },
  resendLink: {
    color: "#8a2be2",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default Signup;