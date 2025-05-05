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
  Button,
  ActivityIndicator,
  ToastAndroid,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import axios from "axios";
import { BACKEND_URL } from "@/Backendurl";
import AnimatedStarsBackground from "../utils/background";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, seterror] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  }; 
  const submitHealthData = async () => {
    if (!height || !weight) {
      Alert.alert("Error", "Please enter both height and weight");
      return;
    }
    
    setHealthLoading(true);
    try {
    
      await AsyncStorage.setItem("userHeight", height);
      await AsyncStorage.setItem("userWeight", weight);
      
      // Navigate to the main app
      router.replace("/(nonav)/nativeheatlth");
    } catch (error) {
      ToastAndroid.show("Failed to save health data", ToastAndroid.SHORT);
    } finally {
      setHealthLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    seterror(null);
    try {
      const response = await axios.post(`${BACKEND_URL}/signin`, {
        email,
        password,
      });
      await AsyncStorage.setItem("username", response.data.user.username);
      await AsyncStorage.setItem("token", response.data.token);
      await AsyncStorage.setItem("PublicKey", response.data.user.publickey);
      await AsyncStorage.setItem("userid", response.data.user.id);
      await AsyncStorage.setItem("Avatar",response.data.user.Avatar)
      router.push("/nativeheatlth");
      if (!AsyncStorage.getItem("PublicKey")) {
        console.log("No public found");
        Alert.alert("No public found");
      }
      console.log("Signup response:", response.data);
    } catch (err: any) {
      if (err instanceof Error && "response" in err) {
        // console.log(err);
        console.log("hrr"); 
        const axiosError = err as { response: { data: { message: string } } };
        console.log(axiosError.response.data.error[0].message);
        ToastAndroid.show(axiosError.response.data.error[0].message||"Password is Incorrect",ToastAndroid.LONG)
        seterror(
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
  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
       <LinearGradient colors={["#1a0033", "#4b0082", "#290d44"]} style={styles.gradient}>
       <AnimatedStarsBackground />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Log In</Text>
            </View>

            <View style={styles.formContainer}>
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
                  <Text style={styles.showButtonText}>Show</Text>
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
                  <Text style={styles.signUpButtonText}>Login</Text>
                )}
              </TouchableOpacity>
              {error && (
                <View style={styles.container}>
                  <Text style={styles.signUpButtonText}>{error}</Text>
                </View>
              )}

              <View style={styles.newUserContainer}>
                <Text style={styles.newUserText}>Dont Have an Account</Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/singup")}>
                  <Text style={styles.joinNowText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Modal
          visible={showHealthModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowHealthModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.healthModalContainer}>
              <Text style={styles.healthModalTitle}>Health Information</Text>
              <Text style={styles.healthModalSubtitle}>
                Please provide your goals
              </Text>
              <View style={styles.healthInputContainer}>
                <TextInput
                  style={styles.healthInput}
                  placeholder="Height (cm)"
                  placeholderTextColor="#999"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.healthInputContainer}>
                <TextInput
                  style={styles.healthInput}
                  placeholder="Weight (kg)"
                  placeholderTextColor="#999"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity
                style={styles.healthSubmitButton}
                onPress={submitHealthData}
                disabled={healthLoading}
              >
                {healthLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.healthSubmitButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        </SafeAreaView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient:{
    flex:1
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
  subtitle: {
    fontSize: 16,
    color: "#cccccc",
    marginBottom: 20,
  },
  formContainer: {
    width: "100%",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthModalContainer: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  healthModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a0033',
    marginBottom: 5,
    textAlign: 'center',
  },
  healthModalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
  },
  healthInputContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    justifyContent: 'center',
    marginBottom: 15,
  },
  healthInput: {
    color: '#1a0033',
    fontSize: 16,
  },
  healthSubmitButton: {
    backgroundColor: '#8a2be2',
    borderRadius: 10,
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  healthSubmitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  forgotPasswordContainer: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#cccccc",
    fontSize: 14,
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
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  orText: {
    color: "#cccccc",
    paddingHorizontal: 10,
    fontSize: 14,
  },
  appleButton: {
    backgroundColor: "rgba(30, 30, 30, 0.7)",
    borderRadius: 5,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  appleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  appleIcon: {
    fontSize: 18,
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
    color: "gray",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default Login;
