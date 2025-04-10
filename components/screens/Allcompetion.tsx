import axios from "axios"
import { useEffect, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import React from "react"
import { Alert, Button,View } from "react-native"
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { BACKEND_URL } from "@/Backendurl"

interface Challenge{
name:string,
memberqty:number,
Dailystep:number,
Amount:number,
Digital_Currency:string,
days:number,
id:string
}
 const Allconp=()=>{
    const topublickey="CqCqA2kbY4m3K9hUCt8UTvH7dizseiGgHcbcFCWdvZJJ";
  const connection = new Connection("https://api.devnet.solana.com");
  const [challenge,setchallenge]=useState<Challenge[]>([{name:"",memberqty:0,Dailystep:0,Amount:0,Digital_Currency:"",days:0,id:""}])
  useEffect(()=>{
    const challenge=async()=>{
      const response=await axios.get(`${BACKEND_URL}/challenge`);
      setchallenge(response.data.allchalange);
      console.log(response.data.allchalange);
    }
    challenge();
  },[])  
  const Onclick=async(balanced:number,challengeid:string,amount:number)=>{
    try{const publickey=await AsyncStorage.getItem("PublicKey");
    if(!publickey){
        Alert.alert("No public key found");
        return;
    }
    console.log(publickey);
      const balance=await  connection.getBalance(new PublicKey(publickey)); 
      console.log("balande",balance) 
      if(balanced>balance){
        Alert.alert("Not enough balance");
        return;
      }
      const transaction =new Transaction().add(
        SystemProgram.transfer(
          {
            fromPubkey:new PublicKey(publickey),
            toPubkey:new PublicKey(topublickey),
            lamports:amount
          }
        )
      )
      const {blockhash}=await connection.getLatestBlockhash();
      transaction.recentBlockhash=blockhash;
      transaction.feePayer=new PublicKey(publickey);
      const serilze=transaction.serialize({
        requireAllSignatures:false,
        verifySignatures:false,
      })
      console.log(challengeid);
      const response=await axios.post(`${BACKEND_URL}/challenge/join/${challengeid}`,{tx:serilze});
     if(response.status==200){
        Alert.alert("txn successfull you are added to the competion");
     }}
     catch(Error:any){
        Alert.alert(Error);
     }
  }
    return(
        <SafeAreaView>
      {challenge.map((chll)=>
      <View>
      <View id={chll.id}>{chll.Amount}</View>
    <View id={chll.id}>{chll.memberqty}</View>
    <View id={chll.id}>{chll.name} </View>
    <View id={chll.id}>{chll.Digital_Currency}</View>
    <View id={chll.id}>{chll.days}</View>
    <View id={chll.id}>{chll.Dailystep}</View>
    <Button title="JOin" onPress={()=>Onclick(chll.Amount,chll.id,chll.Amount)} ></Button>
    </View>
      )}
      
    </SafeAreaView>
    )

}
export default Allconp;