import CreateSleepSccreen from "@/components/screens/Createsleep";

import React from "react";

import { GestureHandlerRootView } from "react-native-gesture-handler";
const OfficialGames = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CreateSleepSccreen />
    </GestureHandlerRootView>
  );
};

export default OfficialGames;
