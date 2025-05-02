import React, { useState } from "react";
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
import { PieChart } from "react-native-svg-charts";

const screenWidth = Dimensions.get("window").width;

const generateSleepData = (month) => {
  const daysInMonth = new Date(2025, month + 1, 0).getDate();
  const data = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const hours = 5 + Math.random() * 4; // 5-9 hours
    const quality =
      Math.random() > 0.7 ? "Deep" : Math.random() > 0.4 ? "Normal" : "Light";

    // Generate realistic sleep stage distribution
    let deepHours, lightHours, normalHours;

    if (quality === "Deep") {
      deepHours = hours * 0.6; // 60% deep sleep
      normalHours = hours * 0.3; // 30% normal
      lightHours = hours * 0.1; // 10% light
    } else if (quality === "Normal") {
      deepHours = hours * 0.3;
      normalHours = hours * 0.5;
      lightHours = hours * 0.2;
    } else {
      deepHours = hours * 0.1;
      normalHours = hours * 0.3;
      lightHours = hours * 0.6;
    }

    data.push({
      day: i,
      hours: parseFloat(hours.toFixed(1)),
      quality,
      deepHours: parseFloat(deepHours.toFixed(1)),
      lightHours: parseFloat(lightHours.toFixed(1)),
      normalHours: parseFloat(normalHours.toFixed(1)),
    });
  }
  return data;
};

const generateStepsData = (month) => {
  const daysInMonth = new Date(2025, month + 1, 0).getDate();
  const data = [];
  for (let i = 1; i <= daysInMonth; i++) {
    data.push({
      day: i,
      steps: Math.floor(Math.random() * 8000) + 2000, // 2000-10000 steps
    });
  }
  return data;
};

const HealthStats = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDay, setSelectedDay] = useState(null);

  const sleepData = generateSleepData(selectedMonth);
  const stepsData = generateStepsData(selectedMonth);

  const handleBarPress = (day) => {
    setSelectedDay((prev) => (prev === day ? null : day));
  };

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
            ))}
          </ScrollView>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Health Statistics for</Text>
            <Text style={styles.monthTitle}>{months[selectedMonth]} 2025</Text>
          </View>

          {/* Sleep Chart */}
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
                    {sleepData.map((item) => {
                      const barHeight = (item.hours / 10) * 180;
                      const isSelected = selectedDay === item.day;
                      return (
                        <TouchableOpacity
                          key={item.day}
                          style={styles.barWrapper}
                          onPress={() => handleBarPress(item.day)}
                        >
                          <View
                            style={[
                              styles.sleepBar,
                              {
                                height: barHeight,
                                backgroundColor:
                                  item.quality === "Deep"
                                    ? "#4CAF50"
                                    : item.quality === "Normal"
                                    ? "#FFC107"
                                    : "#F44336",
                              },
                              isSelected && styles.selectedBar,
                            ]}
                          />
                          <Text style={styles.xAxisLabel}>{item.day}</Text>
                          {isSelected && (
                            <View style={styles.tooltip}>
                              <Text style={styles.tooltipText}>
                                Day {item.day}: {item.hours}h
                              </Text>
                              <Text style={styles.tooltipText}>
                                Quality: {item.quality}
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
                      const barHeight = (item.steps / 10000) * 180;
                      const isSelected = selectedDay === item.day;
                      let barColor = "#F44336";
                      if (item.steps > 8000) barColor = "#4CAF50";
                      else if (item.steps > 5000) barColor = "#FFC107";

                      return (
                        <TouchableOpacity
                          key={item.day}
                          style={styles.barWrapper}
                          onPress={() => handleBarPress(item.day)}
                        >
                          <View
                            style={[
                              styles.stepsBar,
                              { height: barHeight, backgroundColor: barColor },
                              isSelected && styles.selectedBar,
                            ]}
                          />
                          <Text style={styles.xAxisLabel}>{item.day}</Text>
                          {isSelected && (
                            <View style={styles.tooltip}>
                              <Text style={styles.tooltipText}>
                                Day {item.day}: {item.steps.toLocaleString()}{" "}
                                steps
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

          {/* Sleep Stage Pie Chart for Selected Day */}
          {selectedDay && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>
                Sleep Stages - Day {selectedDay}
              </Text>
              <View style={{ height: 250, alignItems: "center" }}>
                <PieChart
                  style={{ height: 200, width: 200 }}
                  data={[
                    {
                      key: "Deep",
                      value: sleepData[selectedDay - 1].deepHours,
                      svg: { fill: "#4CAF50" },
                      arc: { outerRadius: "100%", padAngle: 0.02 },
                    },
                    {
                      key: "Normal",
                      value: sleepData[selectedDay - 1].normalHours,
                      svg: { fill: "#FFC107" },
                      arc: { outerRadius: "100%", padAngle: 0.02 },
                    },
                    {
                      key: "Light",
                      value: sleepData[selectedDay - 1].lightHours,
                      svg: { fill: "#F44336" },
                      arc: { outerRadius: "100%", padAngle: 0.02 },
                    },
                  ]}
                  innerRadius={40}
                  outerRadius={80}
                  padAngle={0.02}
                />
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: "#4CAF50" },
                      ]}
                    />
                    <Text style={styles.legendText}>
                      Deep: {sleepData[selectedDay - 1].deepHours}h
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: "#FFC107" },
                      ]}
                    />
                    <Text style={styles.legendText}>
                      Normal: {sleepData[selectedDay - 1].normalHours}h
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: "#F44336" },
                      ]}
                    />
                    <Text style={styles.legendText}>
                      Light: {sleepData[selectedDay - 1].lightHours}h
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ marginTop: 10, alignItems: "center" }}>
                <Text style={styles.totalSleepText}>
                  Total Sleep: {sleepData[selectedDay - 1].hours} hours
                </Text>
                <Text
                  style={[
                    styles.qualityText,
                    sleepData[selectedDay - 1].quality === "Deep"
                      ? { color: "#4CAF50" }
                      : sleepData[selectedDay - 1].quality === "Normal"
                      ? { color: "#FFC107" }
                      : { color: "#F44336" },
                  ]}
                >
                  Overall Quality: {sleepData[selectedDay - 1].quality}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

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
