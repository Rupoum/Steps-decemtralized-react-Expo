import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native"
import React from "react"
import GamifiedStepTable from "@/components/screens/gamestatus"

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0033" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Step Challenge</Text>
        <Text style={styles.headerSubtitle}>Track your daily progress</Text>
      </View>
      <GamifiedStepTable challengeId="123" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c001a",
  },
  header: {
    padding: 16,
    backgroundColor: "#1a0033",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#c4b5fd",
    textAlign: "center",
    marginTop: 4,
  },
})

export default App
