import { SafeAreaView } from "react-native-safe-area-context"
import React, { useState } from "react"
import { View,StyleSheet, TextInput, Button, Alert} from "react-native"
import {Picker} from '@react-native-picker/picker';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "@/Backendurl";
enum currn{
    sol,
    usdc
}
const Competion=()=>{
    const [loading,setloading]=useState(false);
    const[error,seterror]=useState("");
    const [form,setform]=useState({name:"",memberqty:0,Dailystep:0,Amount:0,Digital_Currency:"",days:0})
    const Submit=async()=>{
        setloading(true);
        try {
            const userid=await AsyncStorage.getItem("userid")
            console.log(userid);
             const response=await axios.post(`${BACKEND_URL}/create/challenge`,{
                name:form.name,
                memberqty:form.memberqty,
                Dailystep:form.Dailystep,
                days:form.days,
                Digital_Currency:"Sol",
                Amount:form.Amount,
                userid:userid 
             });
             console.log(response.data);
             Alert.alert("Challenge created succeffuly"); 
        } catch (error:any) {
            Alert.alert("Error",error.message);
            seterror(error);
        }
    }
 
    return(
        <SafeAreaView>
         <View>
              <TextInput
                      style={styles.input}
                      placeholder="Name"
                      onChangeText={(e)=>{setform({...form,name:e})}}
                      keyboardType="name-phone-pad"
                      autoCapitalize="none"
                    />
                   <TextInput
                      style={styles.input}
                      placeholder="Memberqty"
                      onChangeText={(e)=>{setform({...form,memberqty:parseInt(e)})}}
                      keyboardType="numeric"
                      autoCapitalize="none"
                    /> 
                        <TextInput
                      style={styles.input}
                      placeholder="DailyStep"
                      onChangeText={(e)=>{setform({...form,Dailystep:parseInt(e)})}}
                      keyboardType="numeric"
                      autoCapitalize="none"
                    /> 
                        <TextInput
                      style={styles.input}
                      placeholder="Amount"
                      onChangeText={(e)=>{setform({...form,Amount:parseInt(e)})}}
                      keyboardType="numeric"
                      autoCapitalize="none"
                    /> 
                     <TextInput
                      style={styles.input}
                      placeholder="Days"
                      onChangeText={(e)=>{setform({...form,days:parseInt(e)})}}
                      keyboardType="numeric"
                      autoCapitalize="none"
                    /> 
                      <TextInput
                      style={styles.input}
                      placeholder="Currency"
                      onChangeText={(e)=>{setform({...form,Digital_Currency:e})}}
                      keyboardType="name-phone-pad"
                      autoCapitalize="none"
                    /> 
                  
       <Button title={loading ? "Creating..." : "Create"} onPress={Submit} >

       </Button>

         </View>
        </SafeAreaView>
    )
}
export default Competion;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});