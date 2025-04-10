import React, { useState } from "react";
import { StyleSheet } from "react-native";
const Table=()=>{
    const [data,setdata]=useState([{
        "username":"youval","day1":"12k","day2":"17k","day5":"12k","day6":"17k",},
        {"username":"youval","day1":"12k","day2":"17k","day5":"12k","day6":"17k",},
        {"username":"youval","day1":"12k","day2":"17k","day5":"12k","day6":"17k",},
        {"username":"youval","day1":"12k","day2":"17k","day5":"12k","day6":"17k",},
        {"username":"youval","day1":"12k","day2":"17k","day5":"12k","day6":"17k",},
        {"username":"youval","day1":"12k","day2":"17k","day5":"12k","day6":"17k",}
    
    ])
    return(
        <View></View>
    )
}
const style=StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#fff",
        paddingVertical:30,
        paddingHorizontal:20  
    },
    listcontainer:{
        flex:1
    },
    header:{
        flexDirection:'row',
        paddingVertical:10,
     borderBottomWidth:1,
     borde
    }
})