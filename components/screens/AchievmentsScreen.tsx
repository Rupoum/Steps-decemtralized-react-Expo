import React from "react";
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

// Badge data with days and descriptions
const BADGES = [
  {
    id: 1,
    days: 7,
    description: "One week of consistent sleep",
    icon: "moon",
    color: "#8a2be2",
  },
  {
    id: 2,
    days: 14,
    description: "Two weeks of healthy sleep habits",
    icon: "bed",
    color: "#7b68ee",
  },
  {
    id: 3,
    days: 21,
    description: "Three weeks of quality rest",
    icon: "star",
    color: "#9370db",
  },
  {
    id: 4,
    days: 30,
    description: "One month sleep master",
    icon: "trophy",
    color: "#6a5acd",
  },
  {
    id: 5,
    days: 45,
    description: "A month and a half of dedication",
    icon: "ribbon",
    color: "#5e4fa2",
  },
  {
    id: 6,
    days: 60,
    description: "Two months sleep champion",
    icon: "medal",
    color: "#4b0082",
  },
  {
    id: 7,
    days: 75,
    description: "Consistent sleep warrior",
    icon: "shield",
    color: "#3a0066",
  },
  {
    id: 8,
    days: 90,
    description: "Sleep transformation complete!",
    icon: "diamond",
    color: "#1a0033",
  },
];

// Generate mock sleep data for the calendar
const generateMockSleepData = () => {
  const today = new Date();
  const data = {};

  // Go back 60 days
  for (let i = 60; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Create some patterns - more successful days recently, some missed days
    if (i <= 21) {
      // Last 21 days (current streak) - all successful
      data[dateStr] = {
        success: true,
        hours: 7 + Math.random() * 1.5,
      };
    } else if (i % 5 === 0 || i % 7 === 0) {
      // Some missed days
      data[dateStr] = {
        success: false,
        hours: 4 + Math.random() * 2,
      };
    } else {
      // Other days successful
      data[dateStr] = {
        success: true,
        hours: 7 + Math.random() * 1.5,
      };
    }
  }

  return data;
};

// Calendar helper functions
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay(); // Ensure Sunday starts at 0
};

const getMonthName = (month) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month];
};

// Helper function for haptic feedback that works on both iOS and Android
const triggerHaptic = (type = "light") => {
  if (Platform.OS === "ios") {
    switch (type) {
      case "light":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } else if (Platform.OS === "android") {
    // Android haptic feedback
    switch (type) {
      case "light":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }
};

export default function AchievmentsScreen() {
  // Current streak days - this would come from your app's state management
  const [currentStreak, setCurrentStreak] = useState(21);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState(null);
  const [previousStreak, setPreviousStreak] = useState(currentStreak);
  const [selectedDay, setSelectedDay] = useState(null);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sleepData, setSleepData] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const badgeAnimations = useRef(
    BADGES.map(() => new Animated.Value(0))
  ).current;
  const calendarAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dayInfoAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for newly unlocked badges - moved outside of renderBadge
  useEffect(() => {
    if (recentlyUnlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [recentlyUnlocked, pulseAnim]);

  useEffect(() => {
    // Generate mock sleep data
    setSleepData(generateMockSleepData());

    // Animate badges in sequence when screen loads
    const animations = badgeAnimations.map((anim, index) => {
      return Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      });
    });

    Animated.stagger(50, animations).start();
  }, []);

  useEffect(() => {
    // Check if a new badge was unlocked
    if (currentStreak > previousStreak) {
      const newlyUnlocked = BADGES.find(
        (badge) => badge.days <= currentStreak && badge.days > previousStreak
      );

      if (newlyUnlocked) {
        setRecentlyUnlocked(newlyUnlocked.id);

        // Trigger haptic feedback
        triggerHaptic("success");

        // Clear the celebration after a delay
        setTimeout(() => {
          setRecentlyUnlocked(null);
        }, 3000);
      }
    }

    setPreviousStreak(currentStreak);
  }, [currentStreak, previousStreak]);

  useEffect(() => {
    if (selectedBadge !== null) {
      // Animate badge info appearance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
      ]).start();
    } else {
      // Animate badge info disappearance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedBadge, fadeAnim, scaleAnim]);

  useEffect(() => {
    // Animate calendar appearance/disappearance
    Animated.timing(calendarAnim, {
      toValue: showCalendar ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: showCalendar
        ? Easing.out(Easing.back(1.5))
        : Easing.in(Easing.ease),
    }).start();
  }, [showCalendar, calendarAnim]);

  useEffect(() => {
    // Animate day info appearance/disappearance
    if (selectedDay) {
      Animated.timing(dayInfoAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }).start();
    } else {
      Animated.timing(dayInfoAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedDay, dayInfoAnim]);

  const renderBadge = (badge, index) => {
    const isAchieved = currentStreak >= badge.days;
    const isNewlyUnlocked = recentlyUnlocked === badge.id;

    // Animation style for each badge
    const animatedStyle = {
      opacity: badgeAnimations[index],
      transform: [
        {
          scale: badgeAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
          }),
        },
        {
          translateY: badgeAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          }),
        },
      ],
    };

    return (
      <Animated.View
        key={badge.id}
        style={[styles.badgeContainer, animatedStyle]}
      >
        <TouchableOpacity
          style={{ width: "100%" }}
          onPress={() => {
            triggerHaptic("light");
            setSelectedBadge(selectedBadge === badge.id ? null : badge.id);
          }}
          activeOpacity={0.9}
        >
          <Animated.View
            style={{ transform: [{ scale: isNewlyUnlocked ? pulseAnim : 1 }] }}
          >
            {isAchieved ? (
              <View style={styles.badgeWrapper}>
                {/* Improved badge design */}
                <LinearGradient
                  colors={["#1a0033", "#4b0082", "#8a2be2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.badgeCircle}
                >
                  <View style={styles.badgeInnerCircle}>
                    <View style={styles.badgeIconContainer}>
                      <Ionicons name={`${badge.icon}`} size={32} color="#fff" />
                    </View>
                    <Text style={styles.badgeDays}>{badge.days}</Text>
                    <Text style={styles.badgeLabel}>DAYS</Text>
                  </View>
                </LinearGradient>

                {/* Badge rim/border */}
                <View style={styles.badgeRim} />
              </View>
            ) : (
              <BlurView intensity={80} tint="dark" style={styles.blurBadge}>
                <View style={styles.badgeWrapper}>
                  <View
                    style={[
                      styles.badgeCircle,
                      { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                    ]}
                  >
                    <View style={styles.badgeInnerCircle}>
                      <View
                        style={[
                          styles.badgeIconContainer,
                          { backgroundColor: "rgba(138, 43, 226, 0.2)" },
                        ]}
                      >
                        <Ionicons
                          name={`${badge.icon}-outline`}
                          size={32}
                          color="#8a2be2"
                          style={{ opacity: 0.5 }}
                        />
                      </View>
                      <Text
                        style={[
                          styles.badgeDays,
                          { color: "#8a2be2", opacity: 0.5 },
                        ]}
                      >
                        {badge.days}
                      </Text>
                      <Text
                        style={[
                          styles.badgeLabel,
                          { color: "#8a2be2", opacity: 0.5 },
                        ]}
                      >
                        DAYS
                      </Text>
                    </View>
                  </View>

                  {/* Lock icon overlay */}
                  <View style={styles.lockOverlay}>
                    <Ionicons
                      name="lock-closed"
                      size={24}
                      color="rgba(255,255,255,0.7)"
                    />
                  </View>
                </View>
              </BlurView>
            )}
          </Animated.View>

          {selectedBadge === badge.id && (
            <Animated.View
              style={[
                styles.badgeInfo,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.badgeInfoHeader}>
                <Text style={styles.badgeTitle}>{badge.days} Day Streak</Text>
                {isAchieved && (
                  <View style={styles.achievedTag}>
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text style={styles.achievedTagText}>Achieved</Text>
                  </View>
                )}
              </View>
              <Text style={styles.badgeDescription}>{badge.description}</Text>
              {!isAchieved && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(
                            100,
                            (currentStreak / badge.days) * 100
                          )}%`,
                          backgroundColor: badge.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.badgeRemaining}>
                    {badge.days - currentStreak} more days to unlock
                  </Text>
                </View>
              )}
            </Animated.View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Calendar
  const renderCalendarContent = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const today = new Date();

    // Create calendar days
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const dayData = sleepData[dateStr];

      const isToday =
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year;

      const isSuccess = dayData && dayData.success;
      const isMissed = dayData && !dayData.success;
      const isSelected =
        selectedDay &&
        selectedDay.day === day &&
        selectedDay.month === month &&
        selectedDay.year === year;

      days.push(
        <TouchableOpacity
          key={`day-${day}`}
          style={[
            styles.calendarDay,
            isToday && styles.calendarDayToday,
            isSelected && styles.calendarDaySelected,
          ]}
          onPress={() => {
            triggerHaptic("heavy");
            if (isSelected) {
              setSelectedDay(null);
            } else {
              setSelectedDay({
                day,
                month,
                year,
                data: dayData,
                dateStr,
              });
            }
          }}
        >
          <LinearGradient
            colors={
              isSuccess
                ? ["#8a2be2", "#6a5acd"]
                : isMissed
                ? ["#ff6b6b", "#ff4757"]
                : ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.calendarDayInner,
              isToday && styles.calendarDayTodayInner,
              isSelected && styles.calendarDaySelectedInner,
            ]}
          >
            <Text
              style={[
                styles.calendarDayText,
                (isSuccess || isToday || isMissed) &&
                  styles.calendarDayTextLight,
              ]}
            >
              {day}
            </Text>
            {dayData && (
              <View style={styles.calendarDayDot}>
                {isSuccess ? (
                  <Ionicons name="checkmark-circle" size={12} color="#fff" />
                ) : (
                  <Ionicons name="close-circle" size={12} color="#fff" />
                )}
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.calendarNavButton}
            onPress={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentDate(newDate);
              setSelectedDay(null);
              triggerHaptic("medium");
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.calendarTitle}>
            {getMonthName(month)} {year}
          </Text>

          <TouchableOpacity
            style={styles.calendarNavButton}
            onPress={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentDate(newDate);
              setSelectedDay(null);
              triggerHaptic("medium");
            }}
          >
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarDaysOfWeek}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Text key={day} style={styles.calendarDayOfWeek}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>{days}</View>

        {selectedDay && (
          <Animated.View
            style={[
              styles.dayInfoContainer,
              {
                opacity: dayInfoAnim,
                transform: [
                  {
                    translateY: dayInfoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.dayInfoHeader}>
              <Text style={styles.dayInfoTitle}>
                {selectedDay.day} {getMonthName(selectedDay.month)}{" "}
                {selectedDay.year}
              </Text>
              <TouchableOpacity
                style={styles.dayInfoCloseButton}
                onPress={() => {
                  triggerHaptic("light");
                  setSelectedDay(null);
                }}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {selectedDay.data ? (
              <View style={styles.dayInfoContent}>
                <View style={styles.dayInfoRow}>
                  <View style={styles.dayInfoIconContainer}>
                    <Ionicons
                      name={
                        selectedDay.data.success
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={24}
                      color={selectedDay.data.success ? "#8a2be2" : "#ff6b6b"}
                    />
                  </View>
                  <View style={styles.dayInfoTextContainer}>
                    <Text style={styles.dayInfoStatus}>
                      {selectedDay.data.success
                        ? "Sleep Goal Met"
                        : "Sleep Goal Missed"}
                    </Text>
                    <Text style={styles.dayInfoHours}>
                      {selectedDay.data.hours.toFixed(1)} hours of sleep
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.dayInfoContent}>
                <Text style={styles.dayInfoNoData}>
                  No sleep data available for this day
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        <View style={styles.calendarLegend}>
          <View style={styles.legendItem}>
            <LinearGradient
              colors={["#8a2be2", "#6a5acd"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.legendColor}
            />
            <Text style={styles.legendText}>Sleep Goal Met</Text>
          </View>
          <View style={styles.legendItem}>
            <LinearGradient
              colors={["#ff6b6b", "#ff4757"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.legendColor}
            />
            <Text style={styles.legendText}>Missed Goal</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                {
                  backgroundColor: "#4b0082",
                  borderWidth: 2,
                  borderColor: "#fff",
                },
              ]}
            />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>

        <View style={styles.calendarStats}>
          <LinearGradient
            colors={["rgba(138, 43, 226, 0.2)", "rgba(106, 90, 205, 0.2)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.calendarStatsGradient}
          >
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Object.values(sleepData).filter((day) => day.success).length}
              </Text>
              <Text style={styles.statLabel}>Total Success</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Object.values(sleepData)
                  .reduce(
                    (sum, day) => (day.success ? sum + day.hours : sum),
                    0
                  )
                  .toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Hours Slept</Text>
            </View>
          </LinearGradient>
        </View>
      </>
    );
  };

  return (
    <LinearGradient
      colors={["#1a0033", "#4b0082", "#290d44"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        {/* Custom celebration  */}
        {recentlyUnlocked && (
          <View style={styles.celebrationOverlay}>
            <View style={styles.celebrationContent}>
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <Ionicons name="trophy" size={60} color="#ffd700" />
              </Animated.View>
              <Text style={styles.celebrationText}>New Badge Unlocked!</Text>
            </View>
          </View>
        )}

        <View style={styles.header}>
          <Text style={styles.title}>Sleep Streak Badges</Text>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[
                styles.headerButton,
                showCalendar && styles.headerButtonActive,
              ]}
              onPress={() => {
                setShowCalendar(true);
                triggerHaptic("medium");
              }}
            >
              <Ionicons
                name={showCalendar ? "calendar" : "calendar-outline"}
                size={24}
                color={showCalendar ? "#fff" : "rgba(255,255,255,0.8)"}
              />
              <Text
                style={[
                  styles.headerButtonText,
                  showCalendar && styles.headerButtonTextActive,
                ]}
              >
                Calendar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.headerButton,
                !showCalendar && styles.headerButtonActive,
              ]}
              onPress={() => {
                setShowCalendar(false);
                triggerHaptic("medium");
              }}
            >
              <Ionicons
                name={!showCalendar ? "trophy" : "trophy-outline"}
                size={24}
                color={!showCalendar ? "#fff" : "rgba(255,255,255,0.8)"}
              />
              <Text
                style={[
                  styles.headerButtonText,
                  !showCalendar && styles.headerButtonTextActive,
                ]}
              >
                Badges
              </Text>
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[
              styles.streakContainer,
              { transform: [{ scale: recentlyUnlocked ? pulseAnim : 1 }] },
            ]}
          >
            <View style={styles.streakIconContainer}>
              <Ionicons name="moon" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.streakLabel}>CURRENT STREAK</Text>
              <Text style={styles.streakText}>{currentStreak} days</Text>
            </View>
          </Animated.View>
        </View>

        {showCalendar ? (
          <Animated.ScrollView
            contentContainerStyle={{
              paddingBottom: 30,
              paddingTop: 20,
            }}
            style={[
              styles.calendarContainer,
              {
                opacity: calendarAnim,
                transform: [
                  {
                    translateY: calendarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                  {
                    scale: calendarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {renderCalendarContent()}
          </Animated.ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={styles.badgesGrid}
            showsVerticalScrollIndicator={false}
          >
            {BADGES.map(renderBadge)}
          </ScrollView>
        )}

        {/* <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <View style={[styles.infoIcon, { backgroundColor: "#8a2be2" }]}>
              <Ionicons name="trophy" size={16} color="#fff" />
            </View>
            <Text style={styles.infoText}>Colored badges are achieved</Text>
          </View>
          <View style={styles.infoItem}>
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: "rgba(255,255,255,0.2)" },
              ]}
            >
              <Ionicons name="lock-closed" size={16} color="#fff" />
            </View>
            <Text style={styles.infoText}>Locked badges need more days</Text>
          </View>
        </View> */}

        {/* Demo controls with improved styling */}
        <View style={styles.demoControls}>
          <TouchableOpacity
            style={[styles.demoButton, styles.decrementButton]}
            onPress={() => {
              triggerHaptic("medium");
              setCurrentStreak(Math.max(0, currentStreak - 7));
            }}
          >
            <Ionicons name="remove" size={20} color="#fff" />
            <Text style={styles.demoButtonText}>7 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.demoButton, styles.incrementButton]}
            onPress={() => {
              triggerHaptic("medium");
              setCurrentStreak(Math.min(90, currentStreak + 7));
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.demoButtonText}>7 Days</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerButtonActive: {
    backgroundColor: "rgba(138, 43, 226, 0.6)",
  },
  headerButtonText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    marginLeft: 8,
  },
  headerButtonTextActive: {
    color: "#fff",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  streakIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#8a2be2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowColor: "#8a2be2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 1,
  },
  streakText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  badgeContainer: {
    width: width / 2 - 24,
    marginBottom: 24,
  },
  badgeWrapper: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  // Improved badge styling
  badgeCircle: {
    width: "90%",
    height: "90%",
    borderRadius: 1000,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeInnerCircle: {
    width: "95%",
    height: "95%",
    borderRadius: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  badgeRim: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 1000,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  badgeDays: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.9,
  },
  blurBadge: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 1000,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  lockOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 1000,
  },
  badgeInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  badgeInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4b0082",
  },
  achievedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8a2be2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  achievedTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 4,
  },
  badgeDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  badgeRemaining: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8a2be2",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  demoControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  decrementButton: {
    backgroundColor: "#4b0082",
  },
  incrementButton: {
    backgroundColor: "#8a2be2",
  },
  demoButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    pointerEvents: "none",
    alignItems: "center",
    justifyContent: "center",
  },
  celebrationContent: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 20,
    borderRadius: 20,
  },
  celebrationText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  // Enhanced Calendar styles
  calendarContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    paddingBottom: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  calendarNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  calendarDaysOfWeek: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
    paddingBottom: 8,

    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  calendarDayOfWeek: {
    width: (width - 64) / 7,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 1,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  calendarDay: {
    width: (width - 64) / 7,
    height: (width - 64) / 7,
    padding: 2,
  },
  calendarDayInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  calendarDayToday: {
    padding: 0,
  },
  calendarDayTodayInner: {
    borderWidth: 2,
    borderColor: "#fff",
  },
  calendarDaySelected: {
    transform: [{ scale: 1.1 }],
    zIndex: 1,
  },
  calendarDaySelectedInner: {
    borderWidth: 2,
    borderColor: "#ffd700",
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  calendarDayTextLight: {
    color: "#fff",
    fontWeight: "700",
  },
  calendarDayDot: {
    position: "absolute",

    bottom: 1,
  },
  // Day info styles
  dayInfoContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dayInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  dayInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  dayInfoCloseButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  dayInfoContent: {
    paddingVertical: 8,
  },
  dayInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayInfoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dayInfoTextContainer: {
    flex: 1,
  },
  dayInfoStatus: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  dayInfoHours: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  dayInfoNoData: {
    fontSize: 14,
    fontStyle: "italic",
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    padding: 8,
  },
  calendarLegend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  legendText: {
    fontSize: 12,
    color: "#fff",
  },
  calendarStats: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  calendarStatsGradient: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
});
