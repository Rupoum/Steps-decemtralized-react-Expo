import React, {
  useCallback,
  useRef,
  useMemo,
  useState,
  useEffect,
} from "react";
import { StyleSheet, View, Text, Image, Switch, ActivityIndicator } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { BACKEND_URL } from "@/Backendurl";

interface FORM {
  steps: string;
  username: string;
  id: string;
  avatar: string;
}

export default function LeaderboardScreen() {
  const [form, setform] = useState([
    {
      steps: 0,
      username: "",
    },
  ]);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%", "53%", "75%"], []);
   const [loading,setloading]=useState(false);
  const handleSheetChange = useCallback((index: any) => {
    console.log("handleSheetChange", index);
  }, []);

  useEffect(() => {
    const fetchstep = async () => {
      try {
        setloading(true);
        const response = await axios.get(`${BACKEND_URL}/total/steps`);
        console.log(response.data.data);
        const formateddata = response.data.data
          .map((dat: any) => ({
            id: dat.username,
            username: dat.username,
            steps: Number(dat.steps),
            avatar:
              "https://c8.alamy.com/comp/2PWERD5/student-avatar-illustration-simple-cartoon-user-portrait-user-profile-icon-youth-avatar-vector-illustration-2PWERD5.jpg",
          }))
          .sort((a: any, b: any) => b.steps - a.steps);
        setform(formateddata);
      } catch (e) {
        console.log(e);
      }finally{
        setloading(false);
      }
    };
    fetchstep();
  }, []);

  const renderItem = ({ item, index }: { item: FORM; index: number }) => {
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.index}>{index + 1}</Text>
        <View style={styles.avatarColumn}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        </View>
        <View style={styles.usernameColumn}>
          <Text style={styles.text}> {item.username}</Text>
        </View>
        <View style={styles.stepsColumn}>
          <Text style={styles.text}> {item.steps}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <LinearGradient
        colors={["#1a0033", "#4b0082", "#290d44"]}
        style={styles.gradient}
      >
        <View style={styles.backgroundContent}>
          <Image
            source={require("../../assets/images/Run2.gif")}
            style={{ width: "100%", height: "40%" }}
          />
        </View>
      </LinearGradient>
      {/* Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
        animateOnMount={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
        style={{
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          paddingHorizontal: 15,
        }}
      >
        <View
          style={{
            backgroundColor: "#1a0033",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          }}
        >
          <View
            style={{
              justifyContent: "space-between",
            }}
          >
            <View style={{}}>
              <Text
                style={{
                  color: "white",
                  marginLeft: 20,
                  fontSize: 20,
                  fontWeight: "bold",
                  marginVertical: 15,
                }}
              >
                LeaderBoard
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                
              </View>
            </View>
          </View>
            {loading ?(
               <ActivityIndicator size="large" color="#00ff00" />
            ):(
              <View>
                <View style={styles.headings}>
                <Text style={styles.headingFont}>Rank</Text>
                <Text style={styles.headingFont}>Avatar</Text>
                <Text style={styles.headingFont}>User</Text>
                <Text style={styles.headingFont}>Fitness XP</Text>
              </View>
 <BottomSheetFlatList
 data={form}
 keyExtractor={(item) => item.id}
 renderItem={renderItem}
 contentContainerStyle={styles.contentContainer}
/></View>
            )}
          {/* </View> */}
          
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#1E2130",
  },
  backgroundContent: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
    width: 100,
    color: "white",
    textAlign: "center",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a0033",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  rankColumn: {
    width: 40,
    alignItems: "center",
  },
  avatarColumn: {
    width: 50,
    alignItems: "center",
  },
  usernameColumn: {
    width: 100,
    alignItems: "flex-start",
    paddingLeft: 10,
    textOverflow: "ellipsis",
  },
  stepsColumn: {
    width: 80,
    alignItems: "flex-end",
  },
  index: {
    width: 40,
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
    color: "#FFD700",
  },
  texts: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 27,
  },
  contentContainer: {
    paddingBottom: "100%",
  },
  headings: {
    flexDirection: "row",
    marginBottom: 10,
    paddingHorizontal: 25,
    justifyContent: "space-around",
    paddingTop: 10,
  },
  headingFont: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#bfbfbf",
    width: 80,

    // marginBottom: 10,
  },
  bottomSheetBackground: {
    backgroundColor: "#7E3887",
    borderRadius: 20,
  },
  bottomSheetIndicator: {
    backgroundColor: "#CCCCCC",
    width: 40,
    height: 5,
    borderRadius: 3,
  },
});
