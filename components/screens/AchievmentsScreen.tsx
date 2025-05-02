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

const BADGES = [
  {
    id: 1,
    days: 7,
    description: "One week of consistent sleep",
    icon: "moon",
    color: "#8a2be2",
    tier: "Bronze",
    theme: {
      background: ["#2c3e50", "#4a69bd"],
      icon: "moon",
      name: "Moon & Stars",
    },
  },
  {
    id: 2,
    days: 14,
    description: "Two weeks of healthy sleep habits",
    icon: "bed",
    color: "#7b68ee",
    tier: "Bronze",
    theme: {
      background: ["#6a5acd", "#9370db"],
      icon: "bed",
      name: "Comfy Bed",
    },
  },
  {
    id: 3,
    days: 21,
    description: "Three weeks of quality rest",
    icon: "star",
    color: "#9370db",
    tier: "Silver",
    theme: {
      background: ["#4b0082", "#8a2be2"],
      icon: "star",
      name: "Shooting Star",
    },
  },
  {
    id: 4,
    days: 30,
    description: "One month sleep master",
    icon: "trophy",
    color: "#6a5acd",
    tier: "Silver",
    theme: {
      background: ["#1a0033", "#4b0082"],
      icon: "trophy",
      name: "Trophy",
    },
  },
  {
    id: 5,
    days: 45,
    description: "A month and a half of dedication",
    icon: "ribbon",
    color: "#5e4fa2",
    tier: "Gold",
    theme: {
      background: ["#5e4fa2", "#3a0066"],
      icon: "ribbon",
      name: "Ribbon",
    },
  },
  {
    id: 6,
    days: 60,
    description: "Two months sleep champion",
    icon: "medal",
    color: "#4b0082",
    tier: "Gold",
    theme: {
      background: ["#4b0082", "#3a0066"],
      icon: "medal",
      name: "Medal",
    },
  },
  {
    id: 7,
    days: 75,
    description: "Consistent sleep warrior",
    icon: "shield",
    color: "#3a0066",
    tier: "Platinum",
    theme: {
      background: ["#3a0066", "#1a0033"],
      icon: "shield",
      name: "Shield",
    },
  },
  {
    id: 8,
    days: 90,
    description: "Sleep transformation complete!",
    icon: "diamond",
    color: "#1a0033",
    tier: "Platinum",
    theme: {
      background: ["#1a0033", "#000"],
      icon: "diamond",
      name: "Crown",
    },
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
    if (i <= 21) {
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
const getDaysInMonth = (year:any, month:any) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year:any, month:any) => {
  return new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
};

const getMonthName = (month:any) => {
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

// New Calendar Component
const SleepCalendar = ({
  currentDate,
  onChangeDate,
  sleepData,
  selectedDay,
  onSelectDay,
  currentStreak,
}:any) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  // Get days in month and first day of month
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // Calculate days from previous month to show
  const daysFromPrevMonth = firstDayOfMonth;

  // Calculate total rows needed (including days from prev/next month)
  const totalDays = daysFromPrevMonth + daysInMonth;
  const rows = Math.ceil(totalDays / 7);

  // Generate calendar data
  const generateCalendarDays = () => {
    const days = [];

    // Previous month days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

    for (let i = 0; i < daysFromPrevMonth; i++) {
      const day = daysInPrevMonth - daysFromPrevMonth + i + 1;
      const date = new Date(prevMonthYear, prevMonth, day);
      const dateStr = date.toISOString().split("T")[0];

      days.push({
        day,
        month: prevMonth,
        year: prevMonthYear,
        dateStr,
        isCurrentMonth: false,
        data: sleepData[dateStr],
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];

      const isToday =
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year;

      days.push({
        day,
        month,
        year,
        dateStr,
        isCurrentMonth: true,
        isToday,
        data: sleepData[dateStr],
      });
    }

    // Next month days to fill the last row
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const remainingDays = rows * 7 - days.length;

    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(nextMonthYear, nextMonth, day);
      const dateStr = date.toISOString().split("T")[0];

      days.push({
        day,
        month: nextMonth,
        year: nextMonthYear,
        dateStr,
        isCurrentMonth: false,
        data: sleepData[dateStr],
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Render weekday headers
  const renderWeekdayHeaders = () => {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <View style={styles.weekdayHeaderRow}>
        {weekdays.map((weekday, index) => (
          <View key={`weekday-${index}`} style={styles.weekdayHeaderCell}>
            <Text style={styles.weekdayHeaderText}>{weekday}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const rows = [];
    const days = [...calendarDays];

    // Create rows of 7 days
    while (days.length) {
      rows.push(days.splice(0, 7));
    }

    return rows.map((row, rowIndex) => (
      <View key={`row-${rowIndex}`} style={styles.calendarRow}>
        {row.map((day, dayIndex) => {
          const isSelected =
            selectedDay &&
            selectedDay.day === day.day &&
            selectedDay.month === day.month &&
            selectedDay.year === day.year;

          const isSuccess = day.data && day.data.success;
          const isMissed = day.data && !day.data.success;

          return (
            <TouchableOpacity
              key={`day-${rowIndex}-${dayIndex}`}
              style={[
                styles.calendarDayCell,
                !day.isCurrentMonth && styles.calendarDayNotCurrentMonth,
                day.isToday && styles.calendarDayToday,
                isSelected && styles.calendarDaySelected,
              ]}
              onPress={() => {
                if (day.isCurrentMonth) {
                  triggerHaptic("light");
                  onSelectDay(isSelected ? null : day);
                }
              }}
              activeOpacity={day.isCurrentMonth ? 0.7 : 1}
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
                  !day.isCurrentMonth && styles.calendarDayInnerNotCurrentMonth,
                  day.isToday && styles.calendarDayInnerToday,
                  isSelected && styles.calendarDayInnerSelected,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    !day.isCurrentMonth &&
                      styles.calendarDayTextNotCurrentMonth,
                    (isSuccess || day.isToday || isMissed) &&
                      styles.calendarDayTextHighlight,
                  ]}
                >
                  {day.day}
                </Text>
                {day.data && day.isCurrentMonth && (
                  <View style={styles.calendarDayIndicator}>
                    {isSuccess ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={12}
                        color="#fff"
                      />
                    ) : (
                      <Ionicons name="close-circle" size={12} color="#fff" />
                    )}
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  // Render month navigation
  const renderMonthNavigation = () => {
    return (
      <View style={styles.monthNavigationContainer}>
        <TouchableOpacity
          style={styles.monthNavigationButton}
          onPress={() => {
            const newDate = new Date(year, month - 1, 1);
            onChangeDate(newDate);
            triggerHaptic("medium");
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.monthYearText}>
          {getMonthName(month)} {year}
        </Text>

        <TouchableOpacity
          style={styles.monthNavigationButton}
          onPress={() => {
            const newDate = new Date(year, month + 1, 1);
            onChangeDate(newDate);
            triggerHaptic("medium");
          }}
        >
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render calendar stats
  const renderCalendarStats = () => {
    // Count successful days in current month
    const successfulDaysThisMonth = calendarDays.filter(
      (day) => day.isCurrentMonth && day.data && day.data.success
    ).length;

    // Total days with data in current month
    const daysWithDataThisMonth = calendarDays.filter(
      (day) => day.isCurrentMonth && day.data
    ).length;

    // Success rate
    const successRate =
      daysWithDataThisMonth > 0
        ? Math.round((successfulDaysThisMonth / daysWithDataThisMonth) * 100)
        : 0;

    return (
      <View style={styles.calendarStatsContainer}>
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
            <Text style={styles.statValue}>{successfulDaysThisMonth}</Text>
            <Text style={styles.statLabel}>Success This Month</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{successRate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // Render calendar legend
  const renderCalendarLegend = () => {
    return (
      <View style={styles.calendarLegendContainer}>
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
    );
  };

  return (
    <View style={styles.calendarContainer}>
      {renderMonthNavigation()}
      {renderWeekdayHeaders()}
      {renderCalendarGrid()}
      {renderCalendarLegend()}
      {renderCalendarStats()}
    </View>
  );
};

// Day Info Component
const DayInfoPanel = ({ day, onClose }:any) => {
  if (!day) return null;

  return (
    <View style={styles.dayInfoContainer}>
      <View style={styles.dayInfoHeader}>
        <Text style={styles.dayInfoTitle}>
          {day.day} {getMonthName(day.month)} {day.year}
        </Text>
        <TouchableOpacity
          style={styles.dayInfoCloseButton}
          onPress={() => {
            triggerHaptic("light");
            onClose();
          }}
        >
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {day.data ? (
        <View style={styles.dayInfoContent}>
          <View style={styles.dayInfoRow}>
            <View style={styles.dayInfoIconContainer}>
              <Ionicons
                name={day.data.success ? "checkmark-circle" : "close-circle"}
                size={24}
                color={day.data.success ? "#8a2be2" : "#ff6b6b"}
              />
            </View>
            <View style={styles.dayInfoTextContainer}>
              <Text style={styles.dayInfoStatus}>
                {day.data.success ? "Sleep Goal Met" : "Sleep Goal Missed"}
              </Text>
              <Text style={styles.dayInfoHours}>
                {day.data.hours.toFixed(1)} hours of sleep
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
    </View>
  );
};

// Badge Card Component
const BadgeCard = ({
  badge,
  isAchieved,
  onPress,
  isSelected,
  currentStreak,
  isNewlyUnlocked,
}:any) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isNewlyUnlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isNewlyUnlocked, pulseAnim]);

  return (
    <TouchableOpacity
      style={styles.badgeCardContainer}
      onPress={() => {
        triggerHaptic("light");
        onPress(badge.id);
      }}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.badgeCardInner,
          isSelected && styles.badgeCardSelected,
          isNewlyUnlocked && { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <LinearGradient
          colors={badge.theme.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badgeCardGradient}
        >
          {isAchieved ? (
            <View style={styles.badgeWrapper}>
              {/* <View style={styles.badgeTierTag}>
                <Text style={styles.badgeTierText}>{badge.tier}</Text>
              </View> */}
              <View style={styles.badgeIconContainer}>
                <Ionicons name={badge.icon} size={40} color="#fff" />
              </View>
              <Text style={styles.badgeThemeName}>{badge.theme.name}</Text>
              <Text style={styles.badgeDays}>{badge.days}</Text>
              <Text style={styles.badgeLabel}>DAYS</Text>
              {isNewlyUnlocked && (
                <View style={styles.newBadgeTag}>
                  <Text style={styles.newBadgeText}>NEW!</Text>
                </View>
              )}
            </View>
          ) : (
            <BlurView intensity={80} tint="dark" style={styles.blurBadge}>
              <View style={styles.badgeWrapper}>
                <View style={styles.badgeTierTag}>
                  <Text style={[styles.badgeTierText, { opacity: 0.5 }]}>
                    {badge.tier}
                  </Text>
                </View>
                <View style={[styles.badgeIconContainer, { opacity: 0.5 }]}>
                  <Ionicons
                    name={`${badge.icon}-outline`}
                    size={40}
                    color="#fff"
                  />
                </View>
                <Text style={[styles.badgeThemeName, { opacity: 0.5 }]}>
                  {badge.theme.name}
                </Text>
                <Text style={[styles.badgeDays, { opacity: 0.5 }]}>
                  {badge.days}
                </Text>
                <Text style={[styles.badgeLabel, { opacity: 0.5 }]}>DAYS</Text>
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
        </LinearGradient>
      </Animated.View>

      {isSelected && (
        <View style={styles.badgeDetailCard}>
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
        </View>
      )}
    </TouchableOpacity>
  );
};

// Milestone Timeline Component
const MilestoneTimeline = ({ currentStreak, badges }:any) => {
  // Find the next milestone
  const nextMilestone = badges.find((badge:any) => badge.days > currentStreak);

  // Get all achieved milestones
  const achievedMilestones = badges.filter(
    (badge:any) => badge.days <= currentStreak
  );
  const lastAchievedMilestone =
    achievedMilestones.length > 0
      ? achievedMilestones[achievedMilestones.length - 1]
      : null;

  // Calculate progress to next milestone - FIXED CALCULATION
  const progressPercentage = nextMilestone
    ? Math.min(100, (currentStreak / nextMilestone.days) * 100)
    : 100;

  return (
    <View style={styles.milestoneContainer}>
      <View style={styles.milestoneHeader}>
        {nextMilestone && (
          <Text style={styles.nextMilestoneText}>
            Next milestone: {nextMilestone.days} Days
          </Text>
        )}
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercentage}%` },
            ]}
          />
        </View>

        <View style={styles.milestoneMarkers}>
          {/* Show only achieved milestones and the next one */}
          {achievedMilestones.map((badge:any) => (
            <View
              key={badge.id}
              style={[
                styles.milestoneMarker,
                {
                  left: `${(badge.days / (nextMilestone?.days || 90)) * 100}%`,
                },
                styles.milestoneMarkerAchieved,
              ]}
            >
              <Ionicons name={badge.icon} size={16} color="#fff" />
              <Text style={styles.milestoneMarkerText}>{badge.days}</Text>
            </View>
          ))}

          {/* Show the next milestone */}
          {nextMilestone && (
            <View
              style={[
                styles.milestoneMarker,
                {
                  left: `${Math.min(
                    100,
                    (nextMilestone.days / (nextMilestone.days || 90)) * 100
                  )}%`,
                },
              ]}
            >
              <Ionicons
                name={nextMilestone.icon}
                size={16}
                color="rgba(255,255,255,0.5)"
              />
              <Text style={styles.milestoneMarkerText}>
                {nextMilestone.days}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.userFeedbackCard}>
        <LinearGradient
          colors={["rgba(138, 43, 226, 0.3)", "rgba(106, 90, 205, 0.3)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userFeedbackGradient}
        >
          <Ionicons name="star" size={24} color="#ffd700" />
          <Text style={styles.userFeedbackText}>
            You've slept well for {currentStreak} days! That's better than 95%
            of users!
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
};

export default function AchievementsScreen() {
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

  // Separate unlocked and locked badges
  const unlockedBadges = BADGES.filter((badge) => currentStreak >= badge.days);
  const lockedBadges = BADGES.filter((badge) => currentStreak < badge.days);

  // Pulse animation for newly unlocked badges
  useEffect(() => {
    if (recentlyUnlocked) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Just set a timeout to clear the celebration
      setTimeout(() => {
        setRecentlyUnlocked(null);
      }, 3000);
    } else {
      // Stop animation
      pulseAnim.setValue(1);
    }
  }, [recentlyUnlocked, pulseAnim]);

  useEffect(() => {
    // Generate mock sleep data
    setSleepData(generateMockSleepData());

    // Simple fade-in for badges
    badgeAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 50, // Staggered animation
        useNativeDriver: true,
      }).start();
    });
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

  const handleBadgePress = (badgeId:any) => {
    setSelectedBadge(selectedBadge === badgeId ? null : badgeId);
  };

  return (
    <LinearGradient
      colors={["#1a0033", "#4b0082", "#290d44"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        {/* Custom celebration */}
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
          {/* <Text style={styles.title}>Sleep Achievements</Text> */}

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
          <Animated.View
            style={[
              styles.calendarWrapper,
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
            <ScrollView showsVerticalScrollIndicator={false}>
              <SleepCalendar
                currentDate={currentDate}
                onChangeDate={setCurrentDate}
                sleepData={sleepData}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                currentStreak={currentStreak}
              />

              {selectedDay && (
                <Animated.View
                  style={[
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
                  <DayInfoPanel
                    day={selectedDay}
                    onClose={() => setSelectedDay(null)}
                  />
                </Animated.View>
              )}
            </ScrollView>
          </Animated.View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.badgesContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Milestone tracker */}
            <MilestoneTimeline currentStreak={currentStreak} badges={BADGES} />

            {/* Unlocked badges section */}
            <View style={styles.badgeSection}>
              <Text style={styles.badgeSectionTitle}>Unlocked Badges</Text>
              <View style={styles.badgesGrid}>
                {unlockedBadges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    isAchieved={true}
                    onPress={handleBadgePress}
                    isSelected={selectedBadge === badge.id}
                    currentStreak={currentStreak}
                    isNewlyUnlocked={recentlyUnlocked === badge.id}
                  />
                ))}
              </View>
            </View>

            {/* Locked badges section */}
            <View style={styles.badgeSection}>
              <Text style={styles.badgeSectionTitle}>Locked Badges</Text>
              <View style={styles.badgesGrid}>
                {lockedBadges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    isAchieved={false}
                    onPress={handleBadgePress}
                    isSelected={selectedBadge === badge.id}
                    currentStreak={currentStreak}
                    isNewlyUnlocked={false}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        {/* Demo controls */}
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
  badgesContainer: {
    paddingBottom: 20,
  },
  badgeSection: {
    marginBottom: 24,
  },
  badgeSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    paddingLeft: 8,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  badgeCardContainer: {
    width: width / 2 - 24,
    marginBottom: 16,
  },
  badgeCardInner: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeCardSelected: {
    borderWidth: 2,
    borderColor: "#ffd700",
  },
  badgeCardGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  badgeWrapper: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badgeTierTag: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTierText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  badgeIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  badgeThemeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  badgeDays: {
    fontSize: 28,
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
  newBadgeTag: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#ffd700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  blurBadge: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  lockOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  badgeDetailCard: {
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
  // Calendar Styles
  calendarWrapper: {
    flex: 1,
    marginBottom: 20,
  },
  calendarContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  monthNavigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthNavigationButton: {
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
  monthYearText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  weekdayHeaderRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  weekdayHeaderCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 1,
  },
  calendarRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  calendarDayCell: {
    flex: 1,
    aspectRatio: 1,
    padding: 2,
  },
  calendarDayNotCurrentMonth: {
    opacity: 0.4,
  },
  calendarDayToday: {
    padding: 0,
  },
  calendarDaySelected: {
    transform: [{ scale: 1.1 }],
    zIndex: 1,
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
  calendarDayInnerNotCurrentMonth: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  calendarDayInnerToday: {
    borderWidth: 2,
    borderColor: "#fff",
  },
  calendarDayInnerSelected: {
    borderWidth: 2,
    borderColor: "#ffd700",
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  calendarDayTextNotCurrentMonth: {
    color: "rgba(255, 255, 255, 0.4)",
  },
  calendarDayTextHighlight: {
    color: "#fff",
    fontWeight: "700",
  },
  calendarDayIndicator: {
    position: "absolute",
    bottom: 2,
  },
  calendarLegendContainer: {
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
  calendarStatsContainer: {
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
  // Day Info Styles
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
  // Milestone Timeline Styles
  milestoneContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  milestoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  nextMilestoneText: {
    fontSize: 14,
    color: "#ffd700",
    fontWeight: "600",
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#8a2be2",
    borderRadius: 4,
  },
  milestoneMarkers: {
    position: "relative",
    height: 40,
    marginTop: 8,
  },
  milestoneMarker: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -8 }],
  },
  milestoneMarkerAchieved: {
    transform: [{ translateX: -8 }],
  },
  milestoneMarkerText: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
    marginRight: 4,
  },
  userFeedbackCard: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  userFeedbackGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  userFeedbackText: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 12,
  },
});
