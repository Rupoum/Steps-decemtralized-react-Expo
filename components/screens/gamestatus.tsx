"use client"

import { BACKEND_URL } from "@/Backendurl"
import axios from "axios"
import React from "react"
import { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated, ActivityIndicator } from "react-native"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface StepData {
  username: string
  steps: number
  day: string
}

interface ChallengeInfo {
  startdate: string
  enddate: string
  result: StepData[]
}

interface ParticipantStats {
  username: string
  totalSteps: number
  dailySteps: Record<string, number>
  streak: number
}

const GamifiedStepTable = ({ challengeId }: { challengeId: string }) => {
  const horizontalScrollRef = useRef<ScrollView>(null)
  const contentScrollRef = useRef<ScrollView>(null)
  const scrollX = useRef(new Animated.Value(0)).current
  const [days, setDays] = useState<string[]>([])
  const [participants, setParticipants] = useState<ParticipantStats[]>([])
  const [loading, setLoading] = useState(true)
  const [challengeTitle, setChallengeTitle] = useState("Step Challenge")
  const [challengeDuration, setChallengeDuration] = useState(0)
  const [currentDay, setCurrentDay] = useState(0)

  const handleContentScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/challenge/info/3133bd62-9fa9-45b9-be37-5ad524bdb493`)
        const { startdate, enddate, result } = response.data

        const datesInRange = getDatesBetween(new Date(startdate), new Date(enddate))
        setDays(datesInRange)

        const duration = datesInRange.length
        setChallengeDuration(duration)

        // Calculate current day based on today's date
        const today = new Date().toISOString().split("T")[0]
        const startDateObj = new Date(startdate)
        const todayObj = new Date(today)
        const diffTime = Math.abs(todayObj.getTime() - startDateObj.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        setCurrentDay(Math.min(diffDays + 1, duration))

        // Process data to create participant stats with gamification elements
        const participantMap = new Map<string, ParticipantStats>()

        result.forEach((item: StepData) => {
          const steps = Number(item.steps)

          if (!participantMap.has(item.username)) {
            participantMap.set(item.username, {
              username: item.username,
              totalSteps: 0,
              dailySteps: {},
              streak: 0,
            })
          }

          const participant = participantMap.get(item.username)!

          // Only add steps if they're not zero
          if (steps > 0) {
            participant.totalSteps += steps
            participant.dailySteps[item.day] = steps
          }
        })

        // Calculate streaks (consecutive days with >7000 steps)
        participantMap.forEach((participant) => {
          let currentStreak = 0
          for (const day of datesInRange) {
            if ((participant.dailySteps[day] || 0) > 7000) {
              currentStreak++
            } else {
              currentStreak = 0
            }
          }
          participant.streak = currentStreak
        })

        // Convert to array and sort by total steps (highest first)
        const participantsArray = Array.from(participantMap.values())
        participantsArray.sort((a, b) => b.totalSteps - a.totalSteps)

        setParticipants(participantsArray)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [challengeId])

  const getDatesBetween = (startDate: Date, endDate: Date): string[] => {
    const dates: string[] = []
    const currentDate = new Date(startDate)
    const end = new Date(endDate)

    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split("T")[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const syncHeaderScroll = (event: any) => {
    if (horizontalScrollRef.current) {
      horizontalScrollRef.current.scrollTo({
        x: event.nativeEvent.contentOffset.x,
        animated: false,
      })
    }
  }

  const getStepCellStyle = (steps: number) => {
    if (steps > 10000) return styles.greatDayCell
    if (steps > 7000) return styles.goodDayCell
    if (steps > 0) return styles.poorDayCell
    return styles.emptyCell
  }

  const getStepTextStyle = (steps: number) => {
    if (steps > 10000) return styles.greatDayText
    if (steps > 7000) return styles.goodDayText
    if (steps > 0) return styles.poorDayText
    return styles.emptyText
  }

  const getStreakIndicator = (streak: number) => {
    if (streak >= 3) {
      return (
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {streak}</Text>
        </View>
      )
    }
    return null
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading challenge data...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Challenge Header */}
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>👣 {challengeTitle}</Text>
          <Text style={styles.subtitleText}>
            Day {currentDay} of {challengeDuration} • {formatDate(days[0])} - {formatDate(days[days.length - 1])}
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{Math.round((currentDay / challengeDuration) * 100)}% Complete</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${(currentDay / challengeDuration) * 100}%` }]} />
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
          <Text style={styles.legendText}>10,000+ steps: Great day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
          <Text style={styles.legendText}>7,000+ steps: Good day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
          <Text style={styles.legendText}>Below 7,000: Try harder</Text>
        </View>
      </View>

      {/* Daily Progress Table */}
      <View style={styles.tableContainer}>
        {/* Header Row - Days (Horizontal) */}
        <View style={styles.tableHeaderContainer}>
          <View style={styles.cornerCell}>
            <Text style={styles.headerText}>Participant</Text>
          </View>

          <ScrollView
            horizontal
            ref={horizontalScrollRef}
            contentContainerStyle={styles.headerRow}
            showsHorizontalScrollIndicator={false}
          >
            {days.map((day, index) => (
              <View key={`day-${index}`} style={styles.dayHeaderCell}>
                <Text style={styles.headerText}>{formatDate(day)}</Text>
                <Text style={styles.subHeaderText}>Day {index + 1}</Text>
              </View>
            ))}
            <View style={styles.totalHeaderCell}>
              <Text style={styles.headerText}>Total</Text>
            </View>
          </ScrollView>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* User Column */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {participants.map((participant, index) => (
              <View key={`user-${index}`} style={styles.userRow}>
                <View style={styles.userCell}>
                  <Text style={styles.userText}>{participant.username}</Text>
                  {getStreakIndicator(participant.streak)}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Day Steps */}
          <ScrollView
            horizontal
            ref={contentScrollRef}
            onScroll={(event) => {
              handleContentScroll(event)
              syncHeaderScroll(event)
            }}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={true}
          >
            <View>
              {participants.map((participant, userIndex) => (
                <View key={`user-row-${userIndex}`} style={styles.row}>
                  {days.map((day, dayIndex) => {
                    const steps = participant.dailySteps[day] || 0
                    return (
                      <View key={`step-${userIndex}-${dayIndex}`} style={[styles.cell, getStepCellStyle(steps)]}>
                        {steps > 0 && (
                          <>
                            <Text style={[styles.cellText, getStepTextStyle(steps)]}>{steps.toLocaleString()}</Text>
                            {steps > 10000 && <Text style={styles.trendingUpIcon}>↑</Text>}
                          </>
                        )}
                      </View>
                    )
                  })}
                  <View style={styles.totalCell}>
                    <Text style={styles.totalText}>{participant.totalSteps.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Challenge Footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Challenge ends in {challengeDuration - currentDay} days</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0033",
    borderRadius: 12,
    overflow: "hidden",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a0033",
    padding: 20,
  },
  loadingText: {
    color: "#c4b5fd",
    marginTop: 10,
    fontSize: 16,
  },
  headerContainer: {
    padding: 16,
    backgroundColor: "#290d44",
    borderBottomWidth: 1,
    borderBottomColor: "#4b0082",
  },
  titleContainer: {
    marginBottom: 12,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  subtitleText: {
    fontSize: 14,
    color: "#c4b5fd",
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#c4b5fd",
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#4b0082",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#8b5cf6",
    borderRadius: 4,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    backgroundColor: "#290d44",
    borderBottomWidth: 1,
    borderBottomColor: "#4b0082",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#c4b5fd",
  },
  tableContainer: {
    flex: 1,
  },
  tableHeaderContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#4b0082",
    height: 50,
  },
  headerRow: {
    flexDirection: "row",
  },
  cornerCell: {
    width: 120,
    height: 50,
    padding: 8,
    backgroundColor: "#290d44",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#4b0082",
  },
  dayHeaderCell: {
    width: 100,
    height: 50,
    padding: 6,
    backgroundColor: "#290d44",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#4b0082",
  },
  totalHeaderCell: {
    width: 100,
    height: 50,
    padding: 6,
    backgroundColor: "#290d44",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#4b0082",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "white",
  },
  subHeaderText: {
    fontSize: 12,
    color: "#c4b5fd",
  },
  contentContainer: {
    flexDirection: "row",
    flex: 1,
  },
  userRow: {
    height: 60,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#4b0082",
  },
  userCell: {
    width: 120,
    height: 60,
    padding: 8,
    backgroundColor: "#1a0033",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#4b0082",
  },
  userText: {
    fontWeight: "500",
    fontSize: 14,
    color: "white",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#4b0082",
    height: 60,
  },
  cell: {
    width: 100,
    height: 60,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#4b0082",
  },
  cellText: {
    fontSize: 14,
  },
  emptyCell: {
    backgroundColor: "#1a0033",
  },
  emptyText: {
    color: "transparent",
  },
  greatDayCell: {
    backgroundColor: "rgba(16, 185, 129, 0.1)", // Green with opacity
  },
  goodDayCell: {
    backgroundColor: "rgba(245, 158, 11, 0.1)", // Yellow with opacity
  },
  poorDayCell: {
    backgroundColor: "rgba(239, 68, 68, 0.1)", // Red with opacity
  },
  greatDayText: {
    color: "#10b981", // Green
    fontWeight: "bold",
  },
  goodDayText: {
    color: "#f59e0b", // Yellow
    fontWeight: "bold",
  },
  poorDayText: {
    color: "#ef4444", // Red
  },
  totalCell: {
    width: 100,
    height: 60,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#4b0082",
    backgroundColor: "rgba(139, 92, 246, 0.1)", // Purple with opacity
  },
  totalText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#8b5cf6", // Purple
  },
  trendingUpIcon: {
    fontSize: 12,
    color: "#10b981",
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  streakText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "bold",
  },
  footerContainer: {
    padding: 12,
    backgroundColor: "#290d44",
    borderTopWidth: 1,
    borderTopColor: "#4b0082",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#c4b5fd",
  },
})

export default GamifiedStepTable
