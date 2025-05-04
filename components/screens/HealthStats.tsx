import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { BACKEND_URL } from "@/Backendurl";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

const getSleepDataFromApi = (sleepData: any[], month: number) => {
  const daysInMonth = new Date(2025, month + 1, 0).getDate();
  const data = [];
  
  for (let i = 1; i <= daysInMonth; i++) {
    const record = sleepData.find((entry: any) => {
      const date = new Date(entry.day);
      return date.getDate() === i && date.getMonth() === month;
    });

    data.push({
      day: i,
      Hours: record ? parseFloat(record.Hours) : 0,
      hasData: !!record,
    });
  }
  return data;
};

const getStepsDataFromJson = (realUserSteps: any[], month: number) => {
  const daysInMonth = new Date(2025, month + 1, 0).getDate();
  const data = [];
  
  for (let i = 1; i <= daysInMonth; i++) {
    const record = realUserSteps.find((entry: any) => {
      const date = new Date(entry.day);
      return date.getDate() === i && date.getMonth() === month;
    });

    data.push({
      day: i,
      steps: record ? parseInt(record.steps) : 0,
    });
  }

  return data;
};

const HealthStats = () => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  
  const [realUserSteps, setStepData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        const userid = await AsyncStorage.getItem("userid");
        
        // Fetch both step and sleep data in parallel
        const [stepsResponse, sleepResponse] = await Promise.all([
          axios.get(`${BACKEND_URL}/step/daily/${userid}`),
          axios.get(`${BACKEND_URL}/sleep/daily/${userid}`)
        ]);
        
        setStepData(stepsResponse.data.user);
        setSleepData(sleepResponse.data.user);
      } catch (error) {
        console.error("Error fetching data:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Get all months that have either step or sleep data
  const monthsWithData = [...new Set([
    ...realUserSteps.map(entry => new Date(entry.day).getMonth()),
    ...sleepData.map(entry => new Date(entry.day).getMonth())
  ])].sort((a, b) => a - b);
  
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(
    monthsWithData.includes(currentMonth) ? currentMonth : monthsWithData[0] || 0
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const stepsData = getStepsDataFromJson(realUserSteps, selectedMonth);
  const processedSleepData = getSleepDataFromApi(sleepData, selectedMonth);

  const handleBarPress = (day: number) => {
    if (stepsData[day - 1].steps > 0) {
      setSelectedDay((prev) => (prev === day ? null : day));
    }
  };
  const handleBarSleepPress = (day: number) => {
    if (processedSleepData[day - 1].Hours > 0) {
      setSelectedDay((prev) => (prev === day ? null : day));
    }
  };
  if (isLoading) {
    return (
      <LinearGradient
        colors={["#1a0033", "#4b0082", "#8a2be2"]}
        style={styles.container}
      >
        <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: 'white' }}>Loading data...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (hasError) {
    return (
      <LinearGradient
        colors={["#1a0033", "#4b0082", "#8a2be2"]}
        style={styles.container}
      >
        <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: 'white' }}>Error loading data. Please try again.</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (realUserSteps.length === 0 && sleepData.length === 0) {
    return (
      <LinearGradient
        colors={["#1a0033", "#4b0082", "#8a2be2"]}
        style={styles.container}
      >
        <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: 'white' }}>No health data available</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#1a0033", "#4b0082", "#8a2be2"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Month Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.monthSelector}
          >
            {months.map((month, index) => (
              monthsWithData.includes(index) && (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthButton,
                    selectedMonth === index && styles.selectedMonth,
                  ]}
                  onPress={() => {
                    setSelectedMonth(index);
                    setSelectedDay(null);
                  }}
                >
                  <Text
                    style={[
                      styles.monthText,
                      selectedMonth === index && styles.selectedMonthText,
                    ]}
                  >
                    {month}
                  </Text>
                </TouchableOpacity>
              )
            ))}
          </ScrollView>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Health Statistics for</Text>
            <Text style={styles.monthTitle}>{months[selectedMonth]} 2025</Text>
          </View>

          {/* Steps Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Daily Steps</Text>
            <View style={styles.chartLegend}>
              <View style={styles.yAxis}>
                {[10000, 8000, 6000, 4000, 2000, 0].map((val) => (
                  <Text key={val} style={styles.yAxisLabel}>
                    {val === 0 ? "0" : `${val / 1000}k`}
                  </Text>
                ))}
              </View>
              <View style={styles.chartContent}>
                <View style={styles.gridLines}>
                  {[0, 2000, 4000, 6000, 8000, 10000].map((val) => (
                    <View key={val} style={styles.gridLine} />
                  ))}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.barContainer}>
                    {stepsData.map((item) => {
                      const hasData = item.steps > 0;
                      const barHeight = hasData ? (item.steps / 10000) * 180 : 5;
                      const isSelected = selectedDay === item.day;
                      let barColor = hasData ? "#F44336" : "rgba(255, 255, 255, 0.1)";
                      
                      if (hasData) {
                        if (item.steps > 8000) barColor = "#4CAF50";
                        else if (item.steps > 5000) barColor = "#FFC107";
                      }

                      return (
                        <TouchableOpacity
                          key={item.day}
                          style={styles.barWrapper}
                          onPress={() => handleBarPress(item.day)}
                          disabled={!hasData}
                        >
                          <View
                            style={[
                              styles.stepsBar,
                              { 
                                height: barHeight, 
                                backgroundColor: barColor,
                                opacity: hasData ? 1 : 0.5,
                              },
                              isSelected && styles.selectedBar,
                            ]}
                          />
                          <Text style={[
                            styles.xAxisLabel,
                            !hasData && { color: "rgba(255, 255, 255, 0.3)" }
                          ]}>
                            {item.day}
                          </Text>
                          {isSelected && hasData && (
                            <View style={styles.tooltip}>
                              <Text style={styles.tooltipText}>
                                Day {item.day}: {item.steps.toLocaleString()} steps
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Sleep Hours Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Sleep Hours</Text>
            <View style={styles.chartLegend}>
              <View style={styles.yAxis}>
                {[10, 8, 6, 4, 2, 0].map((val) => (
                  <Text key={val} style={styles.yAxisLabel}>
                    {val}h
                  </Text>
                ))}
              </View>
              <View style={styles.chartContent}>
                <View style={styles.gridLines}>
                  {[0, 2, 4, 6, 8, 10].map((val) => (
                    <View key={val} style={styles.gridLine} />
                  ))}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.barContainer}>
                    {processedSleepData.map((item) => {
                      const hasData = item.hasData;
                      const barHeight = hasData ? (item.Hours / 10) * 180 : 5;
                      const isSelected = selectedDay === item.day;
                      const barColor = hasData ? "#9C89FF" : "rgba(255, 255, 255, 0.1)";

                      return (
                        <TouchableOpacity
                          key={item.day}
                          style={styles.barWrapper}
                          onPress={() => handleBarSleepPress(item.day)}
                          disabled={!hasData}
                        >
                          <View
                            style={[
                              styles.sleepBar,
                              { 
                                height: barHeight, 
                                backgroundColor: barColor,
                                opacity: hasData ? 1 : 0.5,
                              },
                              isSelected && styles.selectedBar,
                            ]}
                          />
                          <Text style={[
                            styles.xAxisLabel,
                            !hasData && { color: "rgba(255, 255, 255, 0.3)" }
                          ]}>
                            {item.day}
                          </Text>
                          {isSelected && hasData && (
                            <View style={styles.tooltip}>
                              <Text style={styles.tooltipText}>
                                Day {item.day}: {item.Hours}h sleep
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Selected Day Summary */}
          {selectedDay && stepsData[selectedDay - 1]?.steps > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>
                Summary - Day {selectedDay}
              </Text>
              <View style={{ marginTop: 10, alignItems: "center" }}>
                <Text style={styles.totalSleepText}>
                  Steps: {stepsData[selectedDay - 1].steps.toLocaleString()}
                </Text>
                <Text style={styles.totalSleepText}>
                  Sleep: {processedSleepData[selectedDay - 1]?.Hours || 0} Hours
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 30,
  },
  monthSelector: {
    flexDirection: "row",
    marginTop: 30,
    marginBottom: 10,
    marginHorizontal: 10,
    paddingRight: 40,
  },
  monthButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 5,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  selectedMonth: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  monthText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
  },
  selectedMonthText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    height: 50,
    width: "80%",
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  title: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  monthTitle: {
    color: "#9C89FF",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 20,
  },
  chartContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    width: "90%",
  },
  chartTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  chartLegend: {
    flexDirection: "row",
    height: 220,
  },
  yAxis: {
    width: 30,
    height: 200,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 5,
  },
  yAxisLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 10,
  },
  chartContent: {
    flex: 1,
    height: 200,
  },
  gridLines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    justifyContent: "space-between",
  },
  gridLine: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    width: "100%",
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 200,
  },
  barWrapper: {
    width: 20,
    marginHorizontal: 5,
    height: 200,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  sleepBar: {
    width: 10,
    borderRadius: 4,
    marginBottom: 1,
  },
  stepsBar: {
    width: 10,
    borderRadius: 4,
    marginBottom: 1,
  },
  selectedBar: {
    width: 12,
    borderWidth: 1,
    borderColor: "white",
  },
  xAxisLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 10,
    marginTop: 2,
  },
  tooltip: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 5,
    borderRadius: 5,
    width: 120,
    zIndex: 10,
  },
  tooltipText: {
    color: "white",
    fontSize: 10,
    textAlign: "center",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    color: "white",
    fontSize: 12,
  },
  totalSleepText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  qualityText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default HealthStats;
