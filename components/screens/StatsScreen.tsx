import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { Moon, Award, TrendingUp, Heart } from "react-native-feather";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Mock data for development
const MOCK_STEP_DATA = [
  { day: "MON", steps: 8500, date: "2023-05-01" },
  { day: "TUE", steps: 10200, date: "2023-05-02" },
  { day: "WED", steps: 7800, date: "2023-05-03" },
  { day: "THU", steps: 12000, date: "2023-05-04" },
  { day: "FRI", steps: 9300, date: "2023-05-05" },
  { day: "SAT", steps: 5600, date: "2023-05-06" },
  { day: "SUN", steps: 11200, date: "2023-05-07" },
];

const MOCK_SLEEP_DATA = [
  { day: "MON", hours: 7.2, quality: 85, date: "2023-05-01" },
  { day: "TUE", hours: 6.5, quality: 75, date: "2023-05-02" },
  { day: "WED", hours: 8.0, quality: 90, date: "2023-05-03" },
  { day: "THU", hours: 7.8, quality: 88, date: "2023-05-04" },
  { day: "FRI", hours: 6.8, quality: 78, date: "2023-05-05" },
  { day: "SAT", hours: 8.5, quality: 92, date: "2023-05-06" },
  { day: "SUN", hours: 7.5, quality: 84, date: "2023-05-07" },
];

interface StepData {
  day: string;
  steps: number;
  date: string;
}

interface SleepData {
  day: string;
  hours: number;
  quality: number;
  date: string;
}

// Activity Bar Component
const ActivityBar = ({
  day,
  steps,
  maxSteps,
  onHover,
  isSelected,
}: {
  day: string;
  steps: number;
  maxSteps: number;
  onHover: (steps: number) => void;
  isSelected: boolean;
}) => {
  const animatedHeight = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    animatedHeight.value = withTiming((steps / maxSteps) * 100, {
      duration: 1000,
    });
    
    if (isSelected) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
    }
  }, [steps, isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${animatedHeight.value}%`,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.barContainer}>
      <TouchableOpacity
        style={styles.barWrapper}
        onPress={() => onHover(steps)}
      >
        <Animated.View 
          style={[
            styles.bar, 
            animatedStyle,
            isSelected && styles.selectedBar
          ]} 
        />
      </TouchableOpacity>
      <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
    </View>
  );
};

// Sleep Graph Component
const SleepBar = ({
  day,
  hours,
  quality,
  maxHours,
  onHover,
  isSelected,
}: {
  day: string;
  hours: number;
  quality: number;
  maxHours: number;
  onHover: (hours: number, quality: number) => void;
  isSelected: boolean;
}) => {
  const animatedHeight = useSharedValue(0);
  const animatedQuality = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    animatedHeight.value = withTiming((hours / maxHours) * 100, {
      duration: 1000,
    });
    animatedQuality.value = withDelay(
      500,
      withTiming(quality / 100, { duration: 800 })
    );
    
    if (isSelected) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
    }
  }, [hours, quality, isSelected]);

  const barStyle = useAnimatedStyle(() => ({
    height: `${animatedHeight.value}%`,
    transform: [{ scale: scale.value }],
  }));

  const qualityStyle = useAnimatedStyle(() => ({
    opacity: animatedQuality.value,
  }));

  // Determine color based on sleep quality
  const getQualityColor = () => {
    if (quality >= 85) return "#64DD17";
    if (quality >= 70) return "#FFD600";
    return "#FF3D00";
  };

  return (
    <View style={styles.barContainer}>
      <TouchableOpacity
        style={styles.barWrapper}
        onPress={() => onHover(hours, quality)}
      >
        <Animated.View 
          style={[
            styles.sleepBar, 
            barStyle,
            { backgroundColor: getQualityColor() },
            isSelected && styles.selectedSleepBar
          ]} 
        >
          <Animated.View style={[styles.qualityIndicator, qualityStyle]}>
            <Moon width={12} height={12} color="#fff" />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
      <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
    </View>
  );
};

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode;
  color: string;
}) => {
  return (
    <View style={[styles.statCard, { borderColor: color }]}>
      <View style={[styles.statCircle, { borderColor: color }]}>
        {icon}
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
};

// Achievement Badge Component
const AchievementBadge = ({ 
  title, 
  progress, 
  max, 
  icon 
}: { 
  title: string; 
  progress: number; 
  max: number;
  icon: React.ReactNode;
}) => {
  const percentage = (progress / max) * 100;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(percentage, { duration: 1500 });
  }, [percentage]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  return (
    <View style={styles.achievementBadge}>
      <View style={styles.badgeIconContainer}>
        {icon}
      </View>
      <View style={styles.badgeContent}>
        <Text style={styles.badgeTitle}>{title}</Text>
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </View>
        <Text style={styles.progressText}>{`${progress}/${max}`}</Text>
      </View>
    </View>
  );
};

// Main Component
const ActivityAndSleepTracker = () => {
  const [stepData, setStepData] = useState<StepData[]>([]);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [maxSteps, setMaxSteps] = useState(10000);
  const [maxSleepHours, setMaxSleepHours] = useState(10);
  const [selectedSteps, setSelectedSteps] = useState<number | null>(null);
  const [selectedSleep, setSelectedSleep] = useState<{hours: number, quality: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'steps' | 'sleep'>('steps');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would fetch from your API
        // const userid = await AsyncStorage.getItem("userid");
        // const response = await axios.post(`${BACKEND_URL}/activity/data`, { id: userid });
        
        // Using mock data for this example
        setTimeout(() => {
          setStepData(MOCK_STEP_DATA);
          setSleepData(MOCK_SLEEP_DATA);
          
          const maxStepsValue = Math.max(...MOCK_STEP_DATA.map(item => item.steps), 10000);
          setMaxSteps(maxStepsValue);
          
          const maxSleepValue = Math.max(...MOCK_SLEEP_DATA.map(item => item.hours), 9);
          setMaxSleepHours(maxSleepValue);
          
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to mock data on error
        setStepData(MOCK_STEP_DATA);
        setSleepData(MOCK_SLEEP_DATA);
        setMaxSteps(12000);
        setMaxSleepHours(9);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats
  const totalSteps = stepData.reduce((sum, item) => sum + item.steps, 0);
  const avgSleepHours = sleepData.reduce((sum, item) => sum + item.hours, 0) / (sleepData.length || 1);
  const avgSleepQuality = sleepData.reduce((sum, item) => sum + item.quality, 0) / (sleepData.length || 1);
  
  const stepStats = [
    { 
      title: "Total Steps", 
      value: `${(totalSteps / 1000).toFixed(1)}k`,
      icon: <TrendingUp width={16} height={16} color="#9C89FF" />,
      color: "#9C89FF"
    },
    {
      title: "Active Days",
      value: `${stepData.filter((item) => item.steps > 5000).length}`,
      icon: <Award width={16} height={16} color="#FF9C89" />,
      color: "#FF9C89"
    },
    { 
      title: "Avg Steps", 
      value: `${Math.round(totalSteps / (stepData.length || 1))}`,
      icon: <Heart width={16} height={16} color="#89FFCF" />,
      color: "#89FFCF"
    },
  ];
  
  const sleepStats = [
    { 
      title: "Avg Hours", 
      value: `${avgSleepHours.toFixed(1)}h`,
      icon: <Moon width={16} height={16} color="#9C89FF" />,
      color: "#9C89FF"
    },
    {
      title: "Quality",
      value: `${Math.round(avgSleepQuality)}%`,
      icon: <Heart width={16} height={16} color="#FF9C89" />,
      color: "#FF9C89"
    },
    { 
      title: "Good Nights", 
      value: `${sleepData.filter((item) => item.quality >= 85).length}`,
      icon: <Award width={16} height={16} color="#89FFCF" />,
      color: "#89FFCF"
    },
  ];

  // Achievements based on activity
  const achievements = [
    {
      title: "Step Master",
      progress: Math.min(totalSteps, 50000),
      max: 50000,
      icon: <TrendingUp width={20} height={20} color="#fff" />
    },
    {
      title: "Sleep Champion",
      progress: Math.min(Math.round(avgSleepHours * sleepData.length), 50),
      max: 50,
      icon: <Moon width={20} height={20} color="#fff" />
    },
    {
      title: "Consistency King",
      progress: stepData.filter(item => item.steps > 8000).length,
      max: 7,
      icon: <Award width={20} height={20} color="#fff" />
    }
  ];

  const handleStepSelect = (steps: number, day: string) => {
    setSelectedSteps(steps);
    setSelectedDay(day);
  };

  const handleSleepSelect = (hours: number, quality: number, day: string) => {
    setSelectedSleep({ hours, quality });
    setSelectedDay(day);
  };

  const screenWidth = Dimensions.get('window').width;
  const isFullPage = screenWidth > 500; // Determine if we should show full page or half page layout

  return (
    <ScrollView style={styles.scrollView}>
      <LinearGradient
        colors={["#1a0033", "#4b0082", "#290d44"]}
        style={[
          styles.container,
          isFullPage ? styles.fullPageContainer : styles.halfPageContainer
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Activity Tracker</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'steps' && styles.activeTab]}
              onPress={() => setActiveTab('steps')}
            >
              <Text style={[styles.tabText, activeTab === 'steps' && styles.activeTabText]}>
                Steps
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'sleep' && styles.activeTab]}
              onPress={() => setActiveTab('sleep')}
            >
              <Text style={[styles.tabText, activeTab === 'sleep' && styles.activeTabText]}>
                Sleep
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <LinearGradient
          colors={["#9C89FF", "#f8b8ff", "#7E3887"]}
          style={styles.contentContainer}
        >
          <Text style={styles.sectionTitle}>
            {activeTab === 'steps' ? 'Step Activity' : 'Sleep Patterns'}
          </Text>

          {/* Selected data display */}
          {activeTab === 'steps' && selectedSteps !== null && (
            <View style={styles.dataDisplay}>
              <Text style={styles.dataText}>
                {selectedSteps.toLocaleString()} steps
              </Text>
              {selectedSteps >= 10000 && (
                <View style={styles.achievementTag}>
                  <Award width={14} height={14} color="#FFD700" />
                  <Text style={styles.achievementText}>Goal Reached!</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'sleep' && selectedSleep !== null && (
            <View style={styles.dataDisplay}>
              <Text style={styles.dataText}>
                {selectedSleep.hours.toFixed(1)} hours
              </Text>
              <View style={[
                styles.qualityTag,
                { backgroundColor: selectedSleep.quality >= 85 
                  ? '#64DD17' 
                  : selectedSleep.quality >= 70 
                    ? '#FFD600' 
                    : '#FF3D00' 
                }
              ]}>
                <Text style={styles.qualityText}>
                  {selectedSleep.quality}% quality
                </Text>
              </View>
            </View>
          )}

          <View style={styles.chartContainer}>
            <View style={styles.yAxis}>
              {activeTab === 'steps' 
                ? [10, 8, 6, 4, 2].map((num) => (
                    <Text key={num} style={styles.yAxisLabel}>
                      {num}k
                    </Text>
                  ))
                : [8, 6, 4, 2, 0].map((num) => (
                    <Text key={num} style={styles.yAxisLabel}>
                      {num}h
                    </Text>
                  ))
              }
            </View>

            <View style={styles.chartContent}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#9C89FF" />
                </View>
              ) : activeTab === 'steps' ? (
                stepData.map((item, index) => (
                  <ActivityBar
                    key={index}
                    day={item.day}
                    steps={item.steps}
                    maxSteps={maxSteps}
                    onHover={(steps) => handleStepSelect(steps, item.day)}
                    isSelected={selectedDay === item.day}
                  />
                ))
              ) : (
                sleepData.map((item, index) => (
                  <SleepBar
                    key={index}
                    day={item.day}
                    hours={item.hours}
                    quality={item.quality}
                    maxHours={maxSleepHours}
                    onHover={(hours, quality) => handleSleepSelect(hours, quality, item.day)}
                    isSelected={selectedDay === item.day}
                  />
                ))
              )}
            </View>
          </View>

          {/* Stats cards */}
          <View style={styles.statsContainer}>
            {(activeTab === 'steps' ? stepStats : sleepStats).map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </View>

          {/* Achievements section */}
          <View style={styles.achievementsContainer}>
            <Text style={styles.achievementsTitle}>Achievements</Text>
            {achievements.map((achievement, index) => (
              <AchievementBadge
                key={index}
                title={achievement.title}
                progress={achievement.progress}
                max={achievement.max}
                icon={achievement.icon}
              />
            ))}
          </View>
        </LinearGradient>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#1a0033",
  },
  container: {
    flex: 1,
    backgroundColor: "#1a0033",
  },
  fullPageContainer: {
    minHeight: Dimensions.get('window').height,
  },
  halfPageContainer: {
    minHeight: Dimensions.get('window').height / 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 4,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  tabText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  activeTabText: {
    color: "white",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e2a3a",
    marginBottom: 20,
  },
  dataDisplay: {
    backgroundColor: "#1e2a3a",
    padding: 12,
    borderRadius: 15,
    marginBottom: 15,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
  },
  dataText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  achievementTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  achievementText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  qualityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  qualityText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  chartContainer: {
    height: 300,
    backgroundColor: "#1e2a3a",
    borderRadius: 20,
    flexDirection: "row",
    paddingVertical: 20,
    paddingRight: 10,
    marginBottom: 20,
  },
  yAxis: {
    width: 40,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  yAxisLabel: {
    color: "white",
    fontSize: 12,
  },
  chartContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-end",
    paddingLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  barContainer: {
    alignItems: "center",
  },
  barWrapper: {
    width: 30,
    height: "90%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    backgroundColor: "#f8b8ff",
    borderRadius: 20,
  },
  selectedBar: {
    backgroundColor: "#ffffff",
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  sleepBar: {
    width: "100%",
    borderRadius: 20,
    position: "relative",
  },
  selectedSleepBar: {
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  qualityIndicator: {
    position: "absolute",
    top: 5,
    left: "50%",
    marginLeft: -6,
    width: 12,
    height: 12,
  },
  dayText: {
    color: "white",
    fontSize: 12,
    marginTop: 8,
  },
  selectedDayText: {
    color: "#f8b8ff",
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "30%",
    backgroundColor: "#1e2a3a",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
  },
  statCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  statTitle: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
  achievementsContainer: {
    backgroundColor: "#1e2a3a",
    borderRadius: 20,
    padding: 15,
  },
  achievementsTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  achievementBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  badgeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7E3887",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  badgeContent: {
    flex: 1,
  },
  badgeTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    marginBottom: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#9C89FF",
    borderRadius: 3,
  },
  progressText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
});

export default ActivityAndSleepTracker;