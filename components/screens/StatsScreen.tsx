// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Dimensions,
//   ScrollView,
//   Animated as RNAnimated,
//   Easing,
// } from "react-native";
// import {
//   Moon,
//   Award,
//   TrendingUp,
//   Heart,
//   Zap,
//   Star,
//   Trophy,
//   Clock,
//   Smile,
//   Fire,
// } from "react-native-feather";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSequence,
//   withDelay,
//   withSpring,
//   withRepeat,
//   Easing as REasing,
//   interpolateColor,
// } from "react-native-reanimated";
// import { LinearGradient } from "expo-linear-gradient";
// import { BlurView } from "expo-blur";
// import * as Haptics from 'expo-haptics';
// import { MotiView } from 'moti';

// // Mock data for development
// const MOCK_STEP_DATA = [
//   { day: "MON", steps: 8500, date: "2023-05-01", goal: 10000, streak: 2 },
//   { day: "TUE", steps: 12200, date: "2023-05-02", goal: 10000, streak: 3 },
//   { day: "WED", steps: 7800, date: "2023-05-03", goal: 10000, streak: 0 },
//   { day: "THU", steps: 15000, date: "2023-05-04", goal: 10000, streak: 1 },
//   { day: "FRI", steps: 9300, date: "2023-05-05", goal: 10000, streak: 2 },
//   { day: "SAT", steps: 11600, date: "2023-05-06", goal: 10000, streak: 3 },
//   { day: "SUN", steps: 14200, date: "2023-05-07", goal: 10000, streak: 4 },
// ];

// const MOCK_SLEEP_DATA = [
//   { day: "MON", hours: 7.2, quality: 85, date: "2023-05-01", deepSleep: 2.1, remSleep: 1.8 },
//   { day: "TUE", hours: 6.5, quality: 75, date: "2023-05-02", deepSleep: 1.8, remSleep: 1.5 },
//   { day: "WED", hours: 8.0, quality: 90, date: "2023-05-03", deepSleep: 2.5, remSleep: 2.2 },
//   { day: "THU", hours: 7.8, quality: 88, date: "2023-05-04", deepSleep: 2.3, remSleep: 2.0 },
//   { day: "FRI", hours: 6.8, quality: 78, date: "2023-05-05", deepSleep: 1.9, remSleep: 1.6 },
//   { day: "SAT", hours: 8.5, quality: 92, date: "2023-05-06", deepSleep: 2.7, remSleep: 2.3 },
//   { day: "SUN", hours: 7.5, quality: 84, date: "2023-05-07", deepSleep: 2.2, remSleep: 1.9 },
// ];

// // Achievements data
// const ACHIEVEMENTS = [
//   { id: 1, title: "Step Master", description: "Reach 50,000 total steps", icon: <TrendingUp width={20} height={20} color="#fff" />, maxProgress: 50000, type: "steps" },
//   { id: 2, title: "Dream Weaver", description: "Get 7 nights of quality sleep", icon: <Moon width={20} height={20} color="#fff" />, maxProgress: 7, type: "sleep" },
//   { id: 3, title: "Streak Keeper", description: "Maintain a 5-day step goal streak", icon: <Fire width={20} height={20} color="#fff" />, maxProgress: 5, type: "streak" },
//   { id: 4, title: "Early Bird", description: "Wake up before 7 AM for 3 days", icon: <Clock width={20} height={20} color="#fff" />, maxProgress: 3, type: "wake" },
//   { id: 5, title: "Marathon Ready", description: "Walk 20,000 steps in a day", icon: <Trophy width={20} height={20} color="#fff" />, maxProgress: 20000, type: "max_steps" },
// ];

// // User level calculation
// const calculateLevel = (totalSteps) => {
//   return Math.floor(totalSteps / 25000) + 1;
// };

// // XP calculation
// const calculateXP = (totalSteps) => {
//   const level = calculateLevel(totalSteps);
//   const xpForCurrentLevel = (level - 1) * 25000;
//   const currentXP = totalSteps - xpForCurrentLevel;
//   const xpForNextLevel = 25000;
//   return { currentXP, xpForNextLevel, percentage: (currentXP / xpForNextLevel) * 100 };
// };

// // Activity Bar Component with enhanced animations
// const ActivityBar = ({
//   day,
//   steps,
//   maxSteps,
//   goal,
//   streak,
//   onHover,
//   isSelected,
// }:any) => {
//   const animatedHeight = useSharedValue(0);
//   const scale = useSharedValue(1);
//   const rotation = useSharedValue(0);
//   const goalLineOpacity = useSharedValue(0);
//   const pulseAnim = useSharedValue(1);
  
//   // Determine if goal is reached
//   const goalReached = steps >= goal;
  
//   useEffect(() => {
//     // Animate height
//     animatedHeight.value = withTiming((steps / maxSteps) * 100, {
//       duration: 1200,
//       easing: REasing.bezierFn(0.25, 0.1, 0.25, 1),
//     });
    
//     // Animate goal line
//     goalLineOpacity.value = withDelay(
//       1000,
//       withTiming(1, { duration: 500 })
//     );
    
//     // Pulse animation for streak
//     if (streak > 0) {
//       pulseAnim.value = withRepeat(
//         withSequence(
//           withTiming(1.1, { duration: 1000 }),
//           withTiming(1, { duration: 1000 })
//         ),
//         -1,
//         true
//       );
//     }
    
//     // Selection animation
//     if (isSelected) {
//       scale.value = withSequence(
//         withTiming(1.1, { duration: 200 }),
//         withTiming(1, { duration: 200 })
//       );
      
//       // Add a little wiggle for fun
//       rotation.value = withSequence(
//         withTiming(-0.05, { duration: 100 }),
//         withTiming(0.05, { duration: 100 }),
//         withTiming(0, { duration: 100 })
//       );
      
//       // Trigger haptic feedback when selected
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     }
//   }, [steps, isSelected, streak]);

//   const barStyle = useAnimatedStyle(() => ({
//     height: `${animatedHeight.value}%`,
//     transform: [
//       { scale: scale.value },
//       { rotate: `${rotation.value}rad` }
//     ],
//     backgroundColor: interpolateColor(
//       animatedHeight.value,
//       [0, 50, 100],
//       ['#5271FF', '#38CFBD', '#32CD32']
//     ),
//   }));

//   const goalLineStyle = useAnimatedStyle(() => ({
//     opacity: goalLineOpacity.value,
//   }));
  
//   const streakStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: pulseAnim.value }],
//   }));

//   return (
//     <View style={styles.barContainer}>
//       <View style={styles.barWrapperOuter}>
//         {/* Goal line */}
//         <Animated.View 
//           style={[
//             styles.goalLine, 
//             goalLineStyle,
//             { bottom: `${(goal / maxSteps) * 100}%` }
//           ]} 
//         />
        
//         <TouchableOpacity
//           style={styles.barWrapper}
//           onPress={() => {
//             onHover(day, steps, goal, streak);
//             Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//           }}
//           activeOpacity={0.7}
//         >
//           <Animated.View 
//             style={[
//               styles.bar, 
//               barStyle,
//               isSelected && styles.selectedBar
//             ]} 
//           >
//             {goalReached && (
//               <View style={styles.goalReachedIndicator}>
//                 <Star width={12} height={12} color="#FFD700" />
//               </View>
//             )}
//           </Animated.View>
//         </TouchableOpacity>
//       </View>
      
//       <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
//         {day}
//       </Text>
      
//       {/* Streak indicator */}
//       {streak > 0 && (
//         <Animated.View style={[styles.streakBadge, streakStyle]}>
//           <Fire width={10} height={10} color="#FF5E3A" />
//           <Text style={styles.streakText}>{streak}</Text>
//         </Animated.View>
//       )}
//     </View>
//   );
// };

// // Sleep Bar Component with enhanced animations
// const SleepBar = ({
//   day,
//   hours,
//   quality,
//   deepSleep,
//   remSleep,
//   maxHours,
//   onHover,
//   isSelected,
// }:any) => {
//   const animatedHeight = useSharedValue(0);
//   const animatedQuality = useSharedValue(0);
//   const animatedDeepSleep = useSharedValue(0);
//   const animatedRemSleep = useSharedValue(0);
//   const scale = useSharedValue(1);
//   const rotation = useSharedValue(0);

//   useEffect(() => {
//     // Main height animation
//     animatedHeight.value = withTiming((hours / maxHours) * 100, {
//       duration: 1200,
//       easing: REasing.bezierFn(0.25, 0.1, 0.25, 1),
//     });
    
//     // Staggered animations for sleep components
//     animatedDeepSleep.value = withDelay(
//       300,
//       withTiming((deepSleep / hours) * 100, { duration: 800 })
//     );
    
//     animatedRemSleep.value = withDelay(
//       600,
//       withTiming((remSleep / hours) * 100, { duration: 800 })
//     );
    
//     animatedQuality.value = withDelay(
//       900,
//       withTiming(quality / 100, { duration: 800 })
//     );
    
//     // Selection animation
//     if (isSelected) {
//       scale.value = withSequence(
//         withTiming(1.1, { duration: 200 }),
//         withTiming(1, { duration: 200 })
//       );
      
//       // Add a little wiggle for fun
//       rotation.value = withSequence(
//         withTiming(-0.05, { duration: 100 }),
//         withTiming(0.05, { duration: 100 }),
//         withTiming(0, { duration: 100 })
//       );
      
//       // Trigger haptic feedback when selected
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     }
//   }, [hours, quality, deepSleep, remSleep, isSelected]);

//   const barStyle = useAnimatedStyle(() => ({
//     height: `${animatedHeight.value}%`,
//     transform: [
//       { scale: scale.value },
//       { rotate: `${rotation.value}rad` }
//     ],
//   }));

//   const deepSleepStyle = useAnimatedStyle(() => ({
//     height: `${animatedDeepSleep.value}%`,
//   }));

//   const remSleepStyle = useAnimatedStyle(() => ({
//     height: `${animatedRemSleep.value}%`,
//   }));

//   const qualityStyle = useAnimatedStyle(() => ({
//     opacity: animatedQuality.value,
//   }));

//   // Determine color based on sleep quality
//   const getQualityColor = () => {
//     if (quality >= 85) return "#64DD17";
//     if (quality >= 70) return "#FFD600";
//     return "#FF3D00";
//   };

//   return (
//     <View style={styles.barContainer}>
//       <TouchableOpacity
//         style={styles.barWrapper}
//         onPress={() => {
//           onHover(day, hours, quality, deepSleep, remSleep);
//           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//         }}
//         activeOpacity={0.7}
//       >
//         <Animated.View 
//           style={[
//             styles.sleepBar, 
//             barStyle,
//             isSelected && styles.selectedSleepBar
//           ]} 
//         >
//           {/* Deep sleep section */}
//           <Animated.View 
//             style={[
//               styles.deepSleepSection, 
//               deepSleepStyle,
//               { backgroundColor: '#3A49F9' }
//             ]} 
//           />
          
//           {/* REM sleep section */}
//           <Animated.View 
//             style={[
//               styles.remSleepSection, 
//               remSleepStyle,
//               { backgroundColor: '#9C89FF' }
//             ]} 
//           />
          
//           {/* Quality indicator */}
//           <Animated.View 
//             style={[
//               styles.qualityIndicator, 
//               qualityStyle,
//               { backgroundColor: getQualityColor() }
//             ]}
//           >
//             <Moon width={10} height={10} color="#fff" />
//           </Animated.View>
//         </Animated.View>
//       </TouchableOpacity>
//       <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
//     </View>
//   );
// };

// // Enhanced Stat Card Component
// const StatCard = ({ 
//   title, 
//   value, 
//   icon, 
//   color,
//   subtitle,
//   trend,
// }:any) => {
//   const pulseAnim = useSharedValue(1);
  
//   useEffect(() => {
//     pulseAnim.value = withSequence(
//       withTiming(1.1, { duration: 500 }),
//       withTiming(1, { duration: 500 })
//     );
//   }, [value]);
  
//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: pulseAnim.value }],
//   }));

//   return (
//     <MotiView
//       from={{ opacity: 0, translateY: 20 }}
//       animate={{ opacity: 1, translateY: 0 }}
//       transition={{ type: 'timing', duration: 700 }}
//       style={styles.statCardContainer}
//     >
//       <BlurView intensity={30} style={styles.statCard}>
//         <Animated.View style={[styles.statCircle, { borderColor: color }, animatedStyle]}>
//           {icon}
//         </Animated.View>
//         <View style={styles.statTextContainer}>
//           <Text style={styles.statTitle}>{title}</Text>
//           <Text style={[styles.statValue, { color }]}>{value}</Text>
//           {subtitle && (
//             <View style={styles.subtitleContainer}>
//               <Text style={styles.statSubtitle}>{subtitle}</Text>
//               {trend && (
//                 <View style={[styles.trendIndicator, { backgroundColor: trend === 'up' ? '#32CD32' : '#FF3D00' }]}>
//                   {trend === 'up' ? 
//                     <TrendingUp width={10} height={10} color="#fff" /> : 
//                     <TrendingUp width={10} height={10} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
//                   }
//                 </View>
//               )}
//             </View>
//           )}
//         </View>
//       </BlurView>
//     </MotiView>
//   );
// }
// const AchievementBadge = ({ 
//   title, 
//   description,
//   progress, 
//   max, 
//   icon,
//   isUnlocked,
// }:any) => {
//   const percentage = (progress / max) * 100;
//   const animatedProgress = useSharedValue(0);
//   const glowOpacity = useSharedValue(isUnlocked ? 1 : 0);
  
//   useEffect(() => {
//     animatedProgress.value = withTiming(percentage, { 
//       duration: 1500,
//       easing: REasing.bezierFn(0.25, 0.1, 0.25, 1),
//     });
    
//     if (isUnlocked) {
//       glowOpacity.value = withRepeat(
//         withSequence(
//           withTiming(0.8, { duration: 1500 }),
//           withTiming(0.2, { duration: 1500 })
//         ),
//         -1,
//         true
//       );
//     }
//   }, [percentage, isUnlocked]);

//   const progressStyle = useAnimatedStyle(() => ({
//     width: `${animatedProgress.value}%`,
//   }));
  
//   const glowStyle = useAnimatedStyle(() => ({
//     opacity: glowOpacity.value,
//   }));

//   return (
//     <MotiView
//       from={{ opacity: 0, translateX: -20 }}
//       animate={{ opacity: 1, translateX: 0 }}
//       transition={{ type: 'timing', duration: 700, delay: 200 }}
//       style={styles.achievementBadge}
//     >
//       <View style={styles.badgeIconContainer}>
//         {icon}
//         {isUnlocked && (
//           <Animated.View style={[styles.badgeGlow, glowStyle]} />
//         )}
//       </View>
//       <View style={styles.badgeContent}>
//         <View style={styles.badgeTitleRow}>
//           <Text style={styles.badgeTitle}>{title}</Text>
//           {isUnlocked && (
//             <View style={styles.unlockedBadge}>
//               <Trophy width={10} height={10} color="#FFD700" />
//               <Text style={styles.unlockedText}>Unlocked!</Text>
//             </View>
//           )}
//         </View>
//         <Text style={styles.badgeDescription}>{description}</Text>
//         <View style={styles.progressBarContainer}>
//           <Animated.View 
//             style={[
//               styles.progressBar, 
//               progressStyle,
//               isUnlocked && styles.completedProgressBar
//             ]} 
//           />
//         </View>
//         <Text style={styles.progressText}>{`${Math.min(progress, max)}/${max}`}</Text>
//       </View>
//     </MotiView>
//   );
// };

// // Level Progress Component
// const LevelProgress = ({ level, xp }) => {
//   const { currentXP, xpForNextLevel, percentage } = xp;
//   const animatedProgress = useSharedValue(0);
//   const pulseAnim = useSharedValue(1);
  
//   useEffect(() => {
//     animatedProgress.value = withTiming(percentage, { 
//       duration: 1500,
//       easing: REasing.bezierFn(0.25, 0.1, 0.25, 1),
//     });
    
//     pulseAnim.value = withRepeat(
//       withSequence(
//         withTiming(1.05, { duration: 2000 }),
//         withTiming(1, { duration: 2000 })
//       ),
//       -1,
//       true
//     );
//   }, [percentage]);
  
//   const progressStyle = useAnimatedStyle(() => ({
//     width: `${animatedProgress.value}%`,
//   }));
  
//   const pulseStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: pulseAnim.value }],
//   }));

//   return (
//     <MotiView
//       from={{ opacity: 0, translateY: -20 }}
//       animate={{ opacity: 1, translateY: 0 }}
//       transition={{ type: 'timing', duration: 700 }}
//       style={styles.levelContainer}
//     >
//       <BlurView intensity={40} style={styles.levelCard}>
//         <View style={styles.levelHeader}>
//           <Animated.View style={[styles.levelBadge, pulseStyle]}>
//             <Text style={styles.levelText}>{level}</Text>
//           </Animated.View>
//           <View style={styles.levelInfo}>
//             <Text style={styles.levelTitle}>Fitness Level</Text>
//             <Text style={styles.xpText}>{`${currentXP} / ${xpForNextLevel} XP`}</Text>
//           </View>
//         </View>
//         <View style={styles.levelProgressContainer}>
//           <Animated.View style={[styles.levelProgressBar, progressStyle]} />
//         </View>
//       </BlurView>
//     </MotiView>
//   );
// };

// // Daily Challenge Component
// const DailyChallenge = ({ challenge, onAccept }:any) => {
//   return (
//     <MotiView
//       from={{ opacity: 0, translateY: 20 }}
//       animate={{ opacity: 1, translateY: 0 }}
//       transition={{ type: 'timing', duration: 700, delay: 300 }}
//       style={styles.challengeContainer}
//     >
//       <LinearGradient
//         colors={['#5271FF', '#38CFBD']}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 0 }}
//         style={styles.challengeGradient}
//       >
//         <View style={styles.challengeContent}>
//           <View style={styles.challengeIconContainer}>
//             <Zap width={24} height={24} color="#fff" />
//           </View>
//           <View style={styles.challengeTextContainer}>
//             <Text style={styles.challengeTitle}>Daily Challenge</Text>
//             <Text style={styles.challengeDescription}>{challenge.description}</Text>
//           </View>
//         </View>
//         <TouchableOpacity 
//           style={styles.acceptButton}
//           onPress={() => {
//             onAccept();
//             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//           }}
//         >
//           <Text style={styles.acceptButtonText}>Accept</Text>
//         </TouchableOpacity>
//       </LinearGradient>
//     </MotiView>
//   );
// };

// // Main Component
// const EnhancedHealthTracker = () => {
//   const [stepData, setStepData] = useState([]);
//   const [sleepData, setSleepData] = useState([]);
//   const [maxSteps, setMaxSteps] = useState(15000);
//   const [maxSleepHours, setMaxSleepHours] = useState(10);
//   const [selectedDay, setSelectedDay] = useState(null);
//   const [selectedStepData, setSelectedStepData] = useState(null);
//   const [selectedSleepData, setSelectedSleepData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('steps');
//   const [showAchievements, setShowAchievements] = useState(false);
//   const [achievements, setAchievements] = useState([]);
//   const [userLevel, setUserLevel] = useState(1);
//   const [userXP, setUserXP] = useState({ currentXP: 0, xpForNextLevel: 25000, percentage: 0 });
//   const [dailyChallenge, setDailyChallenge] = useState({
//     id: 1,
//     description: "Take 12,000 steps today to earn 500 XP!",
//     reward: 500,
//     accepted: false
//   });
  
//   // Animation for tab switching
//   const tabAnimation = useRef(new RNAnimated.Value(0)).current;
  
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // In a real app, you would fetch from your API
//         // Using mock data for this example
//         setTimeout(() => {
//           setStepData(MOCK_STEP_DATA);
//           setSleepData(MOCK_SLEEP_DATA);
          
//           const maxStepsValue = Math.max(...MOCK_STEP_DATA.map(item => item.steps), 15000);
//           setMaxSteps(maxStepsValue);
          
//           const maxSleepValue = Math.max(...MOCK_SLEEP_DATA.map(item => item.hours), 9);
//           setMaxSleepHours(maxSleepValue);
          
//           // Calculate total steps for level and XP
//           const totalSteps = MOCK_STEP_DATA.reduce((sum, item) => sum + item.steps, 0);
//           const level = calculateLevel(totalSteps);
//           setUserLevel(level);
//           setUserXP(calculateXP(totalSteps));
          
//           // Process achievements
//           const processedAchievements = ACHIEVEMENTS.map(achievement => {
//             let progress = 0;
            
//             switch(achievement.type) {
//               case 'steps':
//                 progress = totalSteps;
//                 break;
//               case 'sleep':
//                 progress = MOCK_SLEEP_DATA.filter(item => item.quality >= 85).length;
//                 break;
//               case 'streak':
//                 progress = Math.max(...MOCK_STEP_DATA.map(item => item.streak));
//                 break;
//               case 'max_steps':
//                 progress = Math.max(...MOCK_STEP_DATA.map(item => item.steps));
//                 break;
//               default:
//                 progress = 0;
//             }
            
//             return {
//               ...achievement,
//               progress,
//               isUnlocked: progress >= achievement.maxProgress
//             };
//           });
          
//           setAchievements(processedAchievements);
//           setLoading(false);
//         }, 1500);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         // Fallback to mock data on error
//         setStepData(MOCK_STEP_DATA);
//         setSleepData(MOCK_SLEEP_DATA);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);
  
//   // Handle tab switching animation
//   useEffect(() => {
//     RNAnimated.timing(tabAnimation, {
//       toValue: activeTab === 'steps' ? 0 : 1,
//       duration: 300,
//       useNativeDriver: true,
//       easing: Easing.bezier(0.25, 0.1, 0.25, 1),
//     }).start();
//   }, [activeTab]);
  
//   const translateX = tabAnimation.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, 100],
//   });

//   // Calculate stats
//   const totalSteps = stepData.reduce((sum, item) => sum + item.steps, 0);
//   const avgSleepHours = sleepData.reduce((sum, item) => sum + item.hours, 0) / (sleepData.length || 1);
//   const avgSleepQuality = sleepData.reduce((sum, item) => sum + item.quality, 0) / (sleepData.length || 1);
//   const totalDeepSleep = sleepData.reduce((sum, item) => sum + item.deepSleep, 0);
//   const maxStreak = Math.max(...stepData.map(item => item.streak), 0);
  
//   const stepStats = [
//     { 
//       title: "Total Steps", 
//       value: `${(totalSteps / 1000).toFixed(1)}k`,
//       subtitle: "This Week",
//       trend: "up",
//       icon: <TrendingUp width={16} height={16} color="#5271FF" />,
//       color: "#5271FF"
//     },
//     {
//       title: "Best Streak",
//       value: `${maxStreak} days`,
//       subtitle: maxStreak > 0 ? "Keep it up!" : "Start today!",
//       trend: maxStreak > 2 ? "up" : null,
//       icon: <Fire width={16} height={16} color="#FF5E3A" />,
//       color: "#FF5E3A"
//     },
//     { 
//       title: "Daily Avg", 
//       value: `${Math.round(totalSteps / (stepData.length || 1))}`,
//       subtitle: "Steps per day",
//       trend: "up",
//       icon: <Award width={16} height={16} color="#38CFBD" />,
//       color: "#38CFBD"
//     },
//   ];
  
//   const sleepStats = [
//     { 
//       title: "Avg Sleep", 
//       value: `${avgSleepHours.toFixed(1)}h`,
//       subtitle: "Per Night",
//       trend: avgSleepHours >= 7 ? "up" : "down",
//       icon: <Moon width={16} height={16} color="#5271FF" />,
//       color: "#5271FF"
//     },
//     {
//       title: "Sleep Quality",
//       value: `${Math.round(avgSleepQuality)}%`,
//       subtitle: avgSleepQuality >= 85 ? "Excellent" : avgSleepQuality >= 70 ? "Good" : "Fair",
//       trend: avgSleepQuality >= 80 ? "up" : "down",
//       icon: <Smile width={16} height={16} color="#FF9C89" />,
//       color: "#FF9C89"
//     },
//     { 
//       title: "Deep Sleep", 
//       value: `${totalDeepSleep.toFixed(1)}h`,
//       subtitle: "This Week",
//       trend: totalDeepSleep >= 14 ? "up" : "down",
//       icon: <Heart width={16} height={16} color="#38CFBD" />,
//       color: "#38CFBD"
//     },
//   ];

//   const handleStepSelect = (day, steps, goal, streak) => {
//     setSelectedDay(day);
//     setSelectedStepData({ steps, goal, streak });
//     setSelectedSleepData(null);
//   };

//   const handleSleepSelect = (day, hours, quality, deepSleep, remSleep) => {
//     setSelectedDay(day);
//     setSelectedSleepData({ hours, quality, deepSleep, remSleep });
//     setSelectedStepData(null);
//   };
//   hours, quality, deepSleep, remSleep});
//     setSelectedStepData(null);
//   };
  
//   const handleAcceptChallenge = () => {
//     setDailyChallenge({
//       ...dailyChallenge,
//       accepted: true
//     });
//   };

//   const screenWidth = Dimensions.get('window').width;
//   const isFullPage = screenWidth > 500; // Determine if we should show full page or half page layout

//   return (
//     <ScrollView style={styles.scrollView}>
//       <LinearGradient
//         colors={["#0A1128", "#1C2541", "#3A506B"]}
//         style={[
//           styles.container,
//           isFullPage ? styles.fullPageContainer : styles.halfPageContainer
//         ]}
//       >
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>Health Tracker</Text>
//           <TouchableOpacity 
//             style={styles.achievementsButton}
//             onPress={() => {
//               setShowAchievements(!showAchievements);
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//             }}
//           >
//             <Trophy width={20} height={20} color="#FFD700" />
//           </TouchableOpacity>
//         </View>

//         {/* Level Progress */}
//         <LevelProgress level={userLevel} xp={userXP} />

//         {/* Daily Challenge */}
//         {!dailyChallenge.accepted && (
//           <DailyChallenge 
//             challenge={dailyChallenge} 
//             onAccept={handleAcceptChallenge} 
//           />
//         )}

//         <View style={styles.tabContainer}>
//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'steps' && styles.activeTab]}
//             onPress={() => {
//               setActiveTab('steps');
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//             }}
//           >
//             <Text style={[styles.tabText, activeTab === 'steps' && styles.activeTabText]}>
//               Steps
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'sleep' && styles.activeTab]}
//             onPress={() => {
//               setActiveTab('sleep');
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//             }}
//           >
//             <Text style={[styles.tabText, activeTab === 'sleep' && styles.activeTabText]}>
//               Sleep
//             </Text>
//           </TouchableOpacity>
//           <RNAnimated.View 
//             style={[
//               styles.tabIndicator,
//               {
//                 transform: [{ translateX }]
//               }
//             ]} 
//           />
//         </View>

//         <LinearGradient
//           colors={["#5271FF", "#38CFBD"]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           style={styles.contentContainer}
//         >
//           <Text style={styles.sectionTitle}>
//             {activeTab === 'steps' ? 'Step Activity' : 'Sleep Patterns'}
//           </Text>

//           {/* Selected data display */}
//           {activeTab === 'steps' && selectedStepData && (
//             <MotiView
//               from={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ type: 'timing', duration: 400 }}
//               style={styles.dataDisplayContainer}
//             >
//               <BlurView intensity={40} style={styles.dataDisplay}>
//                 <Text style={styles.dataText}>
//                   {selectedStepData.steps.toLocaleString()} steps
//                 </Text>
//                 <View style={styles.dataMetrics}>
//                   {selectedStepData.steps >= selectedStepData.goal && (
//                     <View style={styles.achievementTag}>
//                       <Star width={14} height={14} color="#FFD700" />
//                       <Text style={styles.achievementText}>Goal Reached!</Text>
//                     </View>
//                   )}
//                   {selectedStepData.streak > 0 && (
//                     <View style={styles.streakTag}>
//                       <Fire width={14} height={14} color="#FF5E3A" />
//                       <Text style={styles.streakTagText}>{selectedStepData.streak} day streak</Text>
//                     </View>
//                   )}
//                 </View>
//               </BlurView>
//             </MotiView>
//           )}

//           {activeTab === 'sleep' && selectedSleepData && (
//             <MotiView
//               from={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ type: 'timing', duration: 400 }}
//               style={styles.dataDisplayContainer}
//             >
//               <BlurView intensity={40} style={styles.dataDisplay}>
//                 <Text style={styles.dataText}>
//                   {selectedSleepData.hours.toFixed(1)} hours
//                 </Text>
//                 <View style={styles.dataMetrics}>
//                   <View style={[
//                     styles.qualityTag,
//                     { backgroundColor: selectedSleepData.quality >= 85 
//                       ? '#64DD17' 
//                       : selectedSleepData.quality >= 70 
//                         ? '#FFD600' 
//                         : '#FF3D00' 
//                     }
//                   ]}>
//                     <Text style={styles.qualityText}>
//                       {selectedSleepData.quality}% quality
//                     </Text>
//                   </View>
//                   <View style={styles.sleepBreakdown}>
//                     <View style={styles.sleepTypeIndicator}>
//                       <View style={[styles.colorDot, { backgroundColor: '#3A49F9' }]} />
//                       <Text style={styles.sleepTypeText}>Deep: {selectedSleepData.deepSleep.toFixed(1)}h</Text>
//                     </View>
//                     <View style={styles.sleepTypeIndicator}>
//                       <View style={[styles.colorDot, { backgroundColor: '#9C89FF' }]} />
//                       <Text style={styles.sleepTypeText}>REM: {selectedSleepData.remSleep.toFixed(1)}h</Text>
//                     </View>
//                   </View>
//                 </View>
//               </BlurView>
//             </MotiView>
//           )}

//           <View style={styles.chartContainer}>
//             <View style={styles.yAxis}>
//               {activeTab === 'steps' 
//                 ? [15, 10, 5, 0].map((num) => (
//                     <Text key={num} style={styles.yAxisLabel}>
//                       {num}k
//                     </Text>
//                   ))
//                 : [8, 6, 4, 2, 0].map((num) => (
//                     <Text key={num} style={styles.yAxisLabel}>
//                       {num}h
//                     </Text>
//                   ))
//               }
//             </View>

//             <View style={styles.chartContent}>
//               {loading ? (
//                 <View style={styles.loadingContainer}>
//                   <ActivityIndicator size="large" color="#5271FF" />
//                 </View>
//               ) : activeTab === 'steps' ? (
//                 stepData.map((item, index) => (
//                   <ActivityBar
//                     key={index}
//                     day={item.day}
//                     steps={item.steps}
//                     maxSteps={maxSteps}
//                     goal={item.goal}
//                     streak={item.streak}
//                     onHover={handleStepSelect}
//                     isSelected={selectedDay === item.day}
//                   />
//                 ))
//               ) : (
//                 sleepData.map((item, index) => (
//                   <SleepBar
//                     key={index}
//                     day={item.day}
//                     hours={item.hours}
//                     quality={item.quality}
//                     deepSleep={item.deepSleep}
//                     remSleep={item.remSleep}
//                     maxHours={maxSleepHours}
//                     onHover={handleSleepSelect}
//                     isSelected={selectedDay === item.day}
//                   />
//                 ))
//               )}
//             </View>
//           </View>

//           {/* Stats cards */}
//           <View style={styles.statsContainer}>
//             {(activeTab === 'steps' ? stepStats : sleepStats).map((stat, index) => (
//               <StatCard
//                 key={index}
//                 title={stat.title}
//                 value={stat.value}
//                 subtitle={stat.subtitle}
//                 trend={stat.trend}
//                 icon={stat.icon}
//                 color={stat.color}
//               />
//             ))}
//           </View>

//           {/* Achievements section */}
//           {showAchievements && (
//             <View style={styles.achievementsContainer}>
//               <Text style={styles.achievementsTitle}>Achievements</Text>
//               {achievements.map((achievement) => (
//                 <AchievementBadge
//                   key={achievement.id}
//                   title={achievement.title}
//                   description={achievement.description}
//                   progress={achievement.progress}
//                   max={achievement.maxProgress}
//                   icon={achievement.icon}
//                   isUnlocked={achievement.isUnlocked}
//                 />
//               ))}
//             </View>
//           )}
//         </LinearGradient>
//       </LinearGradient>
//     </ScrollView>
//   )
// }
// const styles = StyleSheet.create({
//   scrollView: {
//     flex: 1,
//     backgroundColor: "#0A1128",
//   },
//   container: {
//     flex: 1,
//   },
//   fullPageContainer: {
//     minHeight: Dimensions.get('window').height,
//   },
//   halfPageContainer: {
//     minHeight: Dimensions.get('window').height / 2,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingTop: 50,
//     paddingBottom: 20,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "white",
//   },
//   achievementsButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255,255,255,0.1)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   tabContainer: {
//     flexDirection: "row",
//     backgroundColor: "rgba(255,255,255,0.1)",
//     borderRadius: 25,
//     padding: 5,
//     marginHorizontal: 20,
//     marginBottom: 20,
//     position: "relative",
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 10,
//     alignItems: "center",
//     zIndex: 1,
//   },
//   activeTab: {
//     // Active styling handled by the animated indicator
//   },
//   tabText: {
//     color: "rgba(255,255,255,0.7)",
//     fontWeight: "500",
//   },
//   activeTabText: {
//     color: "#0A1128",
//     fontWeight: "bold",
//   },
//   tabIndicator: {
//     position: "absolute",
//     width: "50%",
//     height: "100%",
//     backgroundColor: "white",
//     borderRadius: 20,
//     top: 0,
//     left: 0,
//     zIndex: 0,
//   },
//   contentContainer: {
//     flex: 1,
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     padding: 20,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "white",
//     marginBottom: 20,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//   },
//   dataDisplayContainer: {
//     marginBottom: 15,
//     alignItems: "center",
//   },
//   dataDisplay: {
//     backgroundColor: "rgba(255,255,255,0.2)",
//     padding: 15,
//     borderRadius: 20,
//     minWidth: 200,
//     alignItems: "center",
//     overflow: "hidden",
//   },
//   dataText: {
//     color: "white",
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   dataMetrics: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     gap: 8,
//   },
//   achievementTag: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255, 215, 0, 0.3)",
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 12,
//   },
//   achievementText: {
//     color: "#FFD700",
//     fontSize: 12,
//     fontWeight: "bold",
//     marginLeft: 4,
//   },
//   streakTag: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255, 94, 58, 0.3)",
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 12,
//   },
//   streakTagText: {
//     color: "#FF5E3A",
//     fontSize: 12,
//     fontWeight: "bold",
//     marginLeft: 4,
//   },
//   qualityTag: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 12,
//   },
//   qualityText: {
//     color: "white",
//     fontSize: 12,
//     fontWeight: "bold",
//   },
//   sleepBreakdown: {
//     flexDirection: "row",
//     gap: 10,
//     marginTop: 5,
//   },
//   sleepTypeIndicator: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   colorDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginRight: 4,
//   },
//   sleepTypeText: {
//     color: "white",
//     fontSize: 10,
//   },
//   chartContainer: {
//     height: 300,
//     backgroundColor: "rgba(10, 17, 40, 0.7)",
//     borderRadius: 20,
//     flexDirection: "row",
//     paddingVertical: 20,
//     paddingRight: 10,
//     marginBottom: 20,
//   },
//   yAxis: {
//     width: 40,
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 10,
//   },
//   yAxisLabel: {
//     color: "rgba(255,255,255,0.7)",
//     fontSize: 12,
//   },
//   chartContent: {
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     alignItems: "flex-end",
//     paddingLeft: 10,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   barContainer: {
//     alignItems: "center",
//     position: "relative",
//   },
//   barWrapperOuter: {
//     height: "90%",
//     justifyContent: "flex-end",
//     position: "relative",
//   },
//   barWrapper: {
//     width: 30,
//     height: "100%",
//     justifyContent: "flex-end",
//   },
//   bar: {
//     width: "100%",
//     borderRadius: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//     elevation: 5,
//   },
//   selectedBar: {
//     shadowColor: "#ffffff",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.5,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   goalLine: {
//     position: "absolute",
//     width: "120%",
//     height: 2,
//     backgroundColor: "rgba(255,255,255,0.5)",
//     left: -10,
//     zIndex: 1,
//   },
//   goalReachedIndicator: {
//     position: "absolute",
//     top: -10,
//     left: "50%",
//     marginLeft: -10,
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   streakBadge: {
//     position: "absolute",
//     top: -5,
//     right: -5,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.5)",
//     paddingHorizontal: 5,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   streakText: {
//     color: "#FF5E3A",
//     fontSize: 8,
//     fontWeight: "bold",
//     marginLeft: 2,
//   },
//   sleepBar: {
//     width: "100%",
//     borderRadius: 15,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     position: "relative",
//     overflow: "hidden",
//   },
//   selectedSleepBar: {
//     shadowColor: "#ffffff",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.5,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   deepSleepSection: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//   },
//   remSleepSection: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//   },
//   qualityIndicator: {
//     position: "absolute",
//     top: 5,
//     left: "50%",
//     marginLeft: -10,
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   dayText: {
//     color: "rgba(255,255,255,0.7)",
//     fontSize: 12,
//     marginTop: 8,
//   },
//   selectedDayText: {
//     color: "white",
//     fontWeight: "bold",
//   },
//   statsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//     gap: 10,
//   },
//   statCardContainer: {
//     flex: 1,
//   },
//   statCard: {
//     backgroundColor: "rgba(10, 17, 40, 0.5)",
//     borderRadius: 20,
//     padding: 15,
//     alignItems: "center",
//     overflow: "hidden",
//   },
//   statCircle: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     borderWidth: 2,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 10,
//     backgroundColor: "rgba(255,255,255,0.1)",
//   },
//   statTextContainer: {
//     alignItems: "center",
//   },
//   statValue: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginTop: 4,
//   },
//   statTitle: {
//     color: "white",
//     fontSize: 12,
//     textAlign: "center",
//   },
//   subtitleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 4,
//   },
//   statSubtitle: {
//     color: "rgba(255,255,255,0.7)",
//     fontSize: 10,
//   },
//   trendIndicator: {
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 5,
//   },
//   achievementsContainer: {
//     backgroundColor: "rgba(10, 17, 40, 0.7)",
//     borderRadius: 20,
//     padding: 15,
//     marginTop: 10,
//   },
//   achievementsTitle: {
//     color: "white",
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },
//   achievementBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//     backgroundColor: "rgba(255,255,255,0.1)",
//     borderRadius: 15,
//     padding: 10,
//   },
//   badgeIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#5271FF",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 15,
//     position: "relative",
//   },
//   badgeGlow: {
//     position: "absolute",
//     width: "100%",
//     height: "100%",
//     borderRadius: 20,
//     backgroundColor: "transparent",
//     borderWidth: 2,
//     borderColor: "#FFD700",
//     shadowColor: "#FFD700",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.8,
//     shadowRadius: 10,
//   },
//   badgeContent: {
//     flex: 1,
//   },
//   badgeTitleRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 5,
//   },
//   badgeTitle: {
//     color: "white",
//     fontSize: 14,
//     fontWeight: "bold",
//   },
//   unlockedBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255, 215, 0, 0.3)",
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 10,
//   },
//   unlockedText: {
//     color: "#FFD700",
//     fontSize: 10,
//     fontWeight: "bold",
//     marginLeft: 3,
//   },
//   badgeDescription: {
//     color: "rgba(255,255,255,0.7)",
//     fontSize: 12,
//     marginBottom: 8,
//   },
//   progressBarContainer: {
//     height: 6,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     borderRadius: 3,
//     marginBottom: 5,
//     overflow: "hidden",
//   },
//   progressBar: {
//     height: "100%",
//     backgroundColor: "#5271FF",
//     borderRadius: 3,
//   },
//   completedProgressBar: {
//     backgroundColor: "#FFD700",
//   },
//   progressText: {
//     color: "rgba(255,255,255,0.7)",
//     fontSize: 10,
//   },
//   levelContainer: {
//     marginHorizontal: 20,
//     marginBottom: 20,
//   },
//   levelCard: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     borderRadius: 20,
//     padding: 15,
//     overflow: "hidden",
//   },
//   levelHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   levelBadge: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: "#5271FF",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 15,
//     borderWidth: 2,
//     borderColor: "#FFD700",
//   },
//   levelText: {
//     color: "white",
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   levelInfo: {
//     flex: 1,
//   },
//   levelTitle: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   xpText: {
//     color: "rgba(255,255,255,0.7)",
//     fontSize: 12,
//   },
//   levelProgressContainer: {
//     height: 8,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     borderRadius: 4,
//     overflow: "hidden",
//   },
//   levelProgressBar: {
//     height: "100%",
//     backgroundColor: "#FFD700",
//     borderRadius: 4,
//   },
//   challengeContainer: {
//     marginHorizontal: 20,
//     marginBottom: 20,
//   },
//   challengeGradient: {
//     borderRadius: 20,
//     overflow: "hidden",
//   },
//   challengeContent: {
//     flexDirection: "row",
//     padding: 15,
//     alignItems: "center",
//   },
//   challengeIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 15,
//   },
//   challengeTextContainer: {
//     flex: 1,
//   },
//   challengeTitle: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   challengeDescription: {
//     color: "white",
//     fontSize: 14,
//   },
//   acceptButton: {
//     backgroundColor: "rgba(255,255,255,0.2)",
//     padding: 10,
//     alignItems: "center",
//   },
//   acceptButtonText: {
//     color: "white",
//     fontWeight: "bold",
//   },
// });

// export default EnhancedHealthTracker;