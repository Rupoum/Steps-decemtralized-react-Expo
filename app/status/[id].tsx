import StepTable from "@/components/screens/gamestatus";
import GameLeaderboard from "@/components/screens/gamestatus";
import { useLocalSearchParams, useSearchParams } from "expo-router/build/hooks";
import React from "react";
import { View,Text } from "react-native"
const App=()=>{
  const {id}=useLocalSearchParams();

    return(
        // <View>
          // <GameLeaderboard>
          <StepTable challengeId={id as String}/>
          // </GameLeaderboard>
        // </View>
    )
}
export default App;