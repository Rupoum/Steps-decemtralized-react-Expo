"use client"

import { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Image } from "react-native"
import React from "react"
import axios from "axios"
import { BACKEND_URL } from "@/Backendurl"
import { LinearGradient } from "expo-linear-gradient"
import AnimatedStarsBackground from "../utils/background"
const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface ActivityData {
  username: string
  Hours?: string
  Steps?:string
  day: string
}

interface ChallengeInfo {
  startdate: string
  enddate: string
  result: ActivityData[]
  user: string[]
}

interface ParticipantStats {
  username: string
  dailyHours: Record<string, string>
  avatar?: string
}

const GamifiedActivityTable = (challengeid:string) => {
  const horizontalScrollRef = useRef<ScrollView>(null)
  const contentScrollRefs = useRef<ScrollView[]>([])
  const [days, setDays] = useState<string[]>([])
  const [participants, setParticipants] = useState<ParticipantStats[]>([])
  const [loading, setLoading] = useState(true)
  const [challengeType, setChallengeType] = useState<'sleep' | 'step'>('step')
  const [challengeTitle, setChallengeTitle] = useState("Moonwalk Shrimp Shred")
  const[sampleData,setadata]=useState<ChallengeInfo>()
  // const sampleData = {
  //   result: [
  //     {
  //       username: "Ross",
  //       Hours: "0h 0m",
  //       day: "2025-05-09",
  //     },
  //     {
  //       username: "Rupoum",
  //       Hours: "1h 0m",
  //       day: "2025-05-09",
  //     },
  //     {
  //       username: "shubh340",
  //       Hours: "0h 0m",
  //       day: "2025-05-09",
  //     },
  //   ],
  //   startdate: "2025-05-09",
  //   enddate: "2025-05-14",
  //   user: ["Ross", "Rupoum", "shubh340"],
  // }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await axios.get(`${BACKEND_URL}/challenge/info/${challengeid}`)
        setadata(data.data)
        console.log(data.data)
        const { startdate, enddate, result, user } = data.data

        // Check if the data contains Hours or Steps
        const hasHours = result.some((item: ActivityData) => item.Hours !== undefined)
        setChallengeType(hasHours ? 'sleep' : 'step')

        const datesInRange = getDatesBetween(new Date(startdate), new Date(enddate))
        setDays(datesInRange)
    
        // Process data to create participant stats
        const participantMap = new Map<string, ParticipantStats>()

        // Initialize all users from the user array
        user.forEach((username:any) => {
          participantMap.set(username, {
            username,
            dailyHours: {},
            // In a real app, you would have a way to get avatars
            avatar: Math.random() > 0.7 ? `https://i.pravatar.cc/150?u=${username}` : undefined,
          })
        })

        // Fill in the hours data
        result.forEach((item: ActivityData) => {
          if (participantMap.has(item.username)) {
            const participant = participantMap.get(item.username)!
            participant.dailyHours[item.day] = item.Hours || "0h 0m"
          }
        })

        // Convert to array
        const participantsArray = Array.from(participantMap.values())

        setParticipants(participantsArray)
      } catch (error) {
        console.error("Error processing data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
      month: "numeric",
      day: "numeric",
    })
  }

  const getDayNumber = (index: number): string => {
    return `Day${index + 1}`
  }

  const hasActivity = (hours: string): boolean => {
    return hours !== "0h 0m" && hours !== undefined && hours !== ""
  }

  // Add scroll handler
  const handleHorizontalScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x
    if (horizontalScrollRef.current) {
      horizontalScrollRef.current.scrollTo({ x: offsetX, animated: false })
    }
    contentScrollRefs.current.forEach((ref) => {
      if (ref) {
        ref.scrollTo({ x: offsetX, animated: false })
      }
    })
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7FD4E4" />
        <Text style={styles.loadingText}>Loading challenge data...</Text>
      </View>
    )
  }

  return (
    <LinearGradient colors={["#1a0033", "#4b0082", "#290d44"]} style={styles.gradient}>
      <AnimatedStarsBackground />
      {/* Simple Header */}
      <View style={styles.simpleHeader}>
        <Text style={styles.simpleHeaderText}>
          {challengeType === 'sleep' ? 'Sleep Challenge' : 'Step Challenge'}
        </Text>
      </View>

      {/* Table Container */}
      <View style={styles.tableContainer}>
        {/* Header Row - Days */}
        <View style={styles.tableHeaderContainer}>
          <View style={styles.userHeaderCell}>
            <Text style={styles.headerText}>User</Text>
            {/* <Text style={styles.sortIcon}>⋮⋮⋮</Text> */}
          </View>

          <ScrollView
            horizontal
            ref={horizontalScrollRef}
            contentContainerStyle={styles.headerRow}
            showsHorizontalScrollIndicator={false}
            onScroll={handleHorizontalScroll}
            scrollEventThrottle={16}
          >
            {days.map((day, index) => (
              <View key={`day-${index}`} style={styles.dayHeaderCell}>
                <Text style={styles.headerText}>{getDayNumber(index)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* User Rows */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {participants.map((participant, index) => (
            <View key={`user-${index}`} style={styles.userRow}>
              <View style={styles.userCell}>
                {participant.avatar ? (
                  <Image source={{ uri: participant.avatar }} style={styles.userAvatar} />
                ) : (
                  <View style={styles.defaultAvatar}>
                    <Text style={styles.defaultAvatarText}>👤</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.userText,
                    participant.username === "Tomas1988" || participant.username === "dallas"
                      ? styles.highlightedUserText
                      : null,
                  ]}
                >
                  {participant.username}
                </Text>
              </View>

              <ScrollView
                horizontal
                ref={(ref) => {
                  if (ref) {
                    contentScrollRefs.current[index] = ref
                  }
                }}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.daysContainer}
                onScroll={handleHorizontalScroll}
                scrollEventThrottle={16}
              >
                {days.map((day, dayIndex) => {
                  const hours = participant.dailyHours[day] || "0h 0m"
                  return (
                    <View
                      key={`hours-${index}-${dayIndex}`}
                      style={[styles.dayCell, hasActivity(hours) ? styles.activeCell : styles.emptyCell]}
                    >
                      {hasActivity(hours) && <Text style={styles.hourText}>{hours}</Text>}
                    </View>
                  )
                })}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
    </LinearGradient> 
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  simpleHeader: {
    padding: 16,
  },
  simpleHeaderText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7FD4E4",
    textAlign: "center",
  },
  tableContainer: {
    flex: 1,
    backgroundColor: 'rgba(26, 34, 44, 0.7)',
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
    overflow: "hidden",
  },
  tableHeaderContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#2A3642",
    backgroundColor: 'rgba(26, 34, 44, 0.8)',
  },
  headerRow: {
    flexDirection: "row",
  },
  userHeaderCell: {
    width: 120,
    padding: 12,
    backgroundColor: 'rgba(26, 34, 44, 0.8)',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sortIcon: {
    color: "#7FD4E4",
    fontSize: 16,
  },
  dayHeaderCell: {
    width: 100,
    padding: 12,
    backgroundColor: 'rgba(26, 34, 44, 0.8)',
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#2A3642",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  userRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#2A3642",
  },
  userCell: {
    width: 120,
    padding: 12,
    backgroundColor: 'rgba(26, 34, 44, 0.8)',
    flexDirection: "row",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#2A3642",
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  defaultAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#2A3642",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  defaultAvatarText: {
    fontSize: 16,
    color: "#8A9AA9",
  },
  userText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  highlightedUserText: {
    color: "#7FD4E4",
  },
  daysContainer: {
    flexDirection: "row",
  },
  dayCell: {
    width: 100,
    height: 54,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#2A3642",
    flex: 1,
  },
  emptyCell: {
    backgroundColor: 'rgba(26, 34, 44, 0.8)',
    minHeight: 54,
  },
  activeCell: {
    backgroundColor: 'rgba(26, 34, 44, 0.8)',
    minHeight: 54,
  },
  hourText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E2630",
    padding: 20,
  },
  loadingText: {
    color: "#7FD4E4",
    marginTop: 10,
    fontSize: 16,
  },
})

export default GamifiedActivityTable
