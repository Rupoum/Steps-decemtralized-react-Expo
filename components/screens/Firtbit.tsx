import { Redirect } from "expo-router";
import { generateCodeChallenge, generateCodeVerifier } from "../utils/pkce"
import { TouchableOpacity, View ,StyleSheet,Text ,Image, Linking} from "react-native";
import * as AuthSession from 'expo-auth-session';
import React, { useEffect, useState } from "react";
import axios from "axios";
import codegenNativeCommands from "react-native/Libraries/Utilities/codegenNativeCommands";
import { AsyncLocalStorage } from "async_hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Fitbit=()=>{  
 const onclick=async()=>{
    try{
      const token=await gettoken();
     console.log(token);
      
    }
     catch(e){
        console.log(e);
     }
 }
   return(
    <View style={styles.container}>
    <TouchableOpacity style={styles.fitbitButton} onPress={onclick}>
      <View style={styles.buttonContent}>
        {/* <Image 
          source={require('./fitbit-logo.png')}
          style={styles.logo}
        /> */}
        <Text style={styles.buttonText}>Sign in with Fitbit</Text>
      </View>
    </TouchableOpacity>
  </View>
   )
}
const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    fitbitButton: {
      backgroundColor: '#00B0B9',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logo: {
      width: 24,
      height: 24,
      marginRight: 12,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    }
  });
  const gettoken=async()=>{
    let redirectUrl:any;
 const codeverifer=generateCodeVerifier();
 console.log("codeverifersssss",codeverifer);
 await AsyncStorage.setItem("codes",codeverifer)
   const codechallenge=await generateCodeChallenge("6r3i000b0o5n006w1o6t1d454y183y0i3w4h5i1u5o3l0s213e4s5h0w6k5t5v5253703r4a2j1q0d0z4l730t733r5i1t6n2e0j6k2n0v3q6k495g5j536r5t4n602p");
  console.log("codechhaa",codechallenge);  
   await AsyncStorage.setItem("code",codechallenge)
    redirectUrl=new URL("https://www.fitbit.com/oauth2/authorize");
   redirectUrl.searchParams.append("client_id","23Q8LW");
   redirectUrl.searchParams.append("response_type", "code");
   redirectUrl.searchParams.append("code_challenge", codechallenge);
   redirectUrl.searchParams.append("code_challenge_method", "S256");
   redirectUrl.searchParams.append("scope", "activity profile sleep");
   console.log(redirectUrl.toString());
   const supported= await Linking.canOpenURL(redirectUrl.toString());
    if (supported) {
        await Linking.openURL(redirectUrl.toString());
       
      } else {
        console.error("Don't know how to open this URL:", redirectUrl);
      }
  }
  export default  Fitbit;