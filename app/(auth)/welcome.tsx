import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Alert,
  BackHandler,
} from "react-native";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import AnimatedStarsBackground from "@/components/utils/background";

const { width, height } = Dimensions.get("window");

// Import local images
const localImages = {
  stake: require("../../assets/images/sleep2.png"),
  track: require("../../assets/images/Run2.gif"),
  rewards: require("../../assets/images/sleep2.png"),
  compete: require("../../assets/images/Run2.gif"),
};

const slides = [
  {
    id: "1",
    title: "Stake to Achieve",
    description:
      "Join challenges by staking SOL. Put your money where your goals are and commit to real change.",
    image: localImages.stake,
  },
  {
    id: "2",
    title: "Track Your Progress",
    description:
      "Automated tracking connects with health APIs to monitor your activity. Watch your goals become reality in real-time.",
    image: localImages.track,
  },
  {
    id: "3",
    title: "Earn Rewards",
    description:
      "Complete challenges to get your stake back plus rewards. Success pays off—literally.",
    image: localImages.rewards,
  },
  {
    id: "4",
    title: "Compete & Connect",
    description:
      "Join a community of achievers. Climb leaderboards, earn badges, and celebrate streaks together.",
    image: localImages.compete,
  },
];

const Slide = ({ item, scrollX, index }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  // Parallax effect for the image
  const translateX = scrollX.interpolate({
    inputRange,
    outputRange: [width * 0.3, 0, -width * 0.3],
    extrapolate: "clamp",
  });

  // Fade and scale effect for the title and description
  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  });

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.8, 1, 0.8],
    extrapolate: "clamp",
  });

  return (
    
    <View style={styles.slideContainer}>
      <Animated.Image
        source={item.image}
        style={[
          styles.image,
          {
            transform: [{ translateX }],
          },
        ]}
        resizeMode="contain"
      />
      <Animated.Text
        style={[
          styles.title,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        {item.title}
      </Animated.Text>
      <Animated.Text
        style={[
          styles.description,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        {item.description}
      </Animated.Text>
    </View>
  );
};

const Paginator = ({ data, scrollX }) => {
  return (
    <View style={styles.paginationContainer}>
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 20, 10],
          extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
              },
            ]}
            key={i.toString()}
          />
        );
      })}
    </View>
  );
};

const Welcome = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push("/(auth)/singup");
    }
  };
  useEffect(() => {
    const backAction = () => {
      // Alert.alert('Hold on!', 'Are you sure you want to go back?', [
      //   {
      //     text: 'Cancel',
      //     onPress: () => null,
      //     style: 'cancel',
      //   },
      //   {text: 'YES', onPress: () => BackHandler.exitApp()},
      // ]);
      BackHandler.exitApp()
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [])

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <LinearGradient colors={["#1a0033", "#4b0082", "#290d44"]} style={styles.gradient}>
            <AnimatedStarsBackground />
      <View style={styles.container}>
        <View style={styles.slidesContainer}>
          <FlatList
            data={slides}
            renderItem={({ item, index }) => (
              <Slide item={item} scrollX={scrollX} index={index} />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            keyExtractor={(item) => item.id}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={32}
            onViewableItemsChanged={viewableItemsChanged}
            viewabilityConfig={viewConfig}
            ref={slidesRef}
          />
        </View>

        <Paginator data={slides} scrollX={scrollX} />

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            animateButton();
            scrollTo();
          }}
        >
          <Animated.Text
            style={[
              styles.buttonText,
              {
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Animated.Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
    
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slidesContainer: {
    flex: 3,
  },
  slideContainer: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 20,
  },
  title: {
    fontWeight: "800",
    fontSize: 28,
    marginBottom: 10,
    color: "#ffffff",
    textAlign: "center",
  },
  description: {
    fontWeight: "300",
    color: "#e0e0e0",
    textAlign: "center",
    paddingHorizontal: 20,
    fontSize: 16,
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: "row",
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff",
    marginHorizontal: 8,
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 15,
    borderRadius: 30,
    marginBottom: 40,
    width: width * 0.6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Welcome;
