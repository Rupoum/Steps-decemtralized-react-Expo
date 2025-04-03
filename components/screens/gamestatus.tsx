import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions,
  Animated, 
  ActivityIndicator
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StepData {
  username: string;
  steps: string;
  day: string;
}

interface ChallengeInfo {
  startdate: string;
  enddate: string;
  result: StepData[];
}

const StepTable = ({ challengeId }:any) => {
  const horizontalScrollRef = useRef<ScrollView>(null);
  const contentScrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [days, setDays] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stepData, setStepData] = useState<Map<string, Map<string, string>>>(new Map());
  const [loading, setLoading] = useState(true);

  const handleContentScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://10.5.121.76:3000/api/v1/challenge/info/${challengeId}`);
        const { startdate, enddate, result } = response.data;
        const datesInRange = getDatesBetween(new Date(startdate), new Date(enddate));
        setDays(datesInRange);
        const uniqueUsers = Array.from(new Set(result.map(item => item.username)));
        setUsers(uniqueUsers);
        const stepMap = new Map<string, Map<string, string>>();
        result.forEach(item => {
          if (!stepMap.has(item.username)) {
            stepMap.set(item.username, new Map());
          }
          stepMap.get(item.username)?.set(item.day, item.steps);
        });
        
        setStepData(stepMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [challengeId]);

  const getDatesBetween = (startDate: Date, endDate: Date): string[] => {
    const dates: string[] = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const syncHeaderScroll = (event: any) => {
    if (horizontalScrollRef.current) {
      horizontalScrollRef.current.scrollTo({
        x: event.nativeEvent.contentOffset.x,
        animated: false,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Row - Days (Horizontal) */}
      <View style={styles.headerContainer}>
        <View style={styles.cornerCell}>
          <Text style={styles.headerText}>User</Text>
        </View>
        
        <ScrollView
          horizontal
          ref={horizontalScrollRef}
          contentContainerStyle={styles.headerRow}
          showsHorizontalScrollIndicator={false}
        >
          {days.map((day, index) => (
            <View key={`day-${index}`} style={styles.dayHeaderCell}>
              <Text style={styles.headerText}>
                {new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* User Column */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {users.map((username, index) => (
            <View key={`user-${index}`} style={styles.userRow}>
              <View style={styles.userCell}>
                <Text style={styles.userText}>{username}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Day Steps */}
        <ScrollView
          horizontal
          ref={contentScrollRef}
          onScroll={(event) => {
            handleContentScroll(event);
            syncHeaderScroll(event);
          }}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={true}
        >
          <View>
            {users.map((username, userIndex) => (
              <View key={`user-row-${userIndex}`} style={styles.row}>
                {days.map((day, dayIndex) => (
                  <View key={`step-${userIndex}-${dayIndex}`} style={styles.cell}>
                    <Text style={styles.cellText}>
                      {stepData.get(username)?.get(day) || '0'}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0033',
  },
  headerContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#4b0082',
    height: 40,
  },
  headerRow: {
    flexDirection: 'row',
  },
  cornerCell: {
    width: 100,
    height: 40,
    padding: 5,
    backgroundColor: '#290d44',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#4b0082',
  },
  dayHeaderCell: {
    width: 80,
    height: 40,
    padding: 4,
    backgroundColor: '#290d44',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#4b0082',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: 'white',
  },
  contentContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  userRow: {
    height: 40,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#4b0082',
  },
  userCell: {
    width: 100,
    height: 40,
    padding: 5,
    backgroundColor: '#1a0033',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#4b0082',
  },
  userText: {
    fontWeight: '500',
    fontSize: 12,
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#4b0082',
    height: 40,
  },
  cell: {
    width: 80,
    height: 40,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#4b0082',
    backgroundColor: '#1a0033',
  },
  cellText: {
    color: '#bfbfbf',
    fontSize: 12,
  },
});

export default StepTable;