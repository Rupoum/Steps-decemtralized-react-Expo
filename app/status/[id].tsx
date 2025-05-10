import StepTable from "@/components/screens/sleepgame";
import GameLeaderboard from "@/components/screens/gamestatus";
import { useLocalSearchParams, useSearchParams } from "expo-router/build/hooks";
import React from "react";
import { View,Text } from "react-native"
import GamifiedActivityTable from "@/components/screens/gamestatus";
const App=()=>{
  const {id}=useLocalSearchParams();
    console.log("id",id);
    return(
        // <View>
          // <GameLeaderboard>
          <GamifiedActivityTable challengeId={id as string} />
          // </GameLeaderboard>
        // </View>
    )
}
export default App;