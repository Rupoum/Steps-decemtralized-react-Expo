import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory-native";

const HealthStats = () => {
  // Sample data - you would replace this with your actual data
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

  // Generate sample data for the current month
  const generateMonthData = (month) => {
    const daysInMonth = new Date(2023, month + 1, 0).getDate();
    const stepData = [];
    const sleepData = [];

    for (let i = 1; i <= daysInMonth; i++) {
      // Random step data between 2000 and 12000
      stepData.push({
        day: i,
        steps: Math.floor(Math.random() * 10000) + 2000,
        label: `Day ${i}: ${Math.floor(Math.random() * 10000) + 2000} steps`,
      });

      // Random sleep data between 4 and 9 hours
      sleepData.push({
        day: i,
        hours: Math.random() * 5 + 4,
        label: `Day ${i}: ${(Math.random() * 5 + 4).toFixed(1)} hours`,
      });
    }

    return { stepData, sleepData };
  };

  const { stepData, sleepData } = generateMonthData(selectedMonth);

  return (
    <LinearGradient
      colors={["#1a0033", "#4b0082", "#8a2be2"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Month selector */}
        <View style={styles.monthSelector}>
          {months.map((month, index) => (
            <TouchableOpacity
              key={month}
              style={[
                styles.monthButton,
                selectedMonth === index && styles.selectedMonth,
              ]}
              onPress={() => setSelectedMonth(index)}
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
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Health Statistics - {months[selectedMonth]} 2023
        </Text>

        {/* Steps Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Daily Steps</Text>
          <VictoryChart
            width={350}
            height={250}
            theme={VictoryTheme.material}
            domainPadding={{ x: 10 }}
            containerComponent={
              <VictoryVoronoiContainer
                voronoiDimension="x"
                labels={({ datum }) => datum.label}
                labelComponent={
                  <VictoryTooltip
                    cornerRadius={5}
                    flyoutStyle={{
                      fill: "rgba(255, 255, 255, 0.9)",
                      stroke: "#8a2be2",
                    }}
                  />
                }
              />
            }
          >
            <VictoryAxis
              tickFormat={(t) => `${t}`}
              style={{
                axis: { stroke: "#ffffff" },
                tickLabels: { fill: "#ffffff", fontSize: 10 },
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => `${Math.round(t / 1000)}k`}
              style={{
                axis: { stroke: "#ffffff" },
                tickLabels: { fill: "#ffffff", fontSize: 10 },
              }}
            />
            <VictoryBar
              data={stepData}
              x="day"
              y="steps"
              style={{
                data: {
                  fill: ({ datum }) => {
                    return datum.steps > 8000
                      ? "#4CAF50"
                      : datum.steps > 5000
                      ? "#FFC107"
                      : "#F44336";
                  },
                  width: 8,
                },
              }}
              animate={{
                duration: 500,
                onLoad: { duration: 500 },
              }}
            />
          </VictoryChart>
        </View>

        {/* Sleep Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Sleep Duration</Text>
          <VictoryChart
            width={350}
            height={250}
            theme={VictoryTheme.material}
            domainPadding={{ x: 10 }}
            containerComponent={
              <VictoryVoronoiContainer
                voronoiDimension="x"
                labels={({ datum }) => datum.label}
                labelComponent={
                  <VictoryTooltip
                    cornerRadius={5}
                    flyoutStyle={{
                      fill: "rgba(255, 255, 255, 0.9)",
                      stroke: "#5e35b1",
                    }}
                  />
                }
              />
            }
          >
            <VictoryAxis
              tickFormat={(t) => `${t}`}
              style={{
                axis: { stroke: "#ffffff" },
                tickLabels: { fill: "#ffffff", fontSize: 10 },
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => `${t}h`}
              style={{
                axis: { stroke: "#ffffff" },
                tickLabels: { fill: "#ffffff", fontSize: 10 },
              }}
            />
            <VictoryLine
              data={sleepData}
              x="day"
              y="hours"
              style={{
                data: {
                  stroke: "#64b5f6",
                  strokeWidth: 3,
                },
              }}
              animate={{
                duration: 500,
                onLoad: { duration: 500 },
              }}
            />
          </VictoryChart>
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Avg. Steps</Text>
            <Text style={styles.summaryValue}>
              {Math.round(
                stepData.reduce((sum, item) => sum + item.steps, 0) /
                  stepData.length
              ).toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Avg. Sleep</Text>
            <Text style={styles.summaryValue}>
              {(
                sleepData.reduce((sum, item) => sum + item.hours, 0) /
                sleepData.length
              ).toFixed(1)}
              h
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 30,
  },
  monthSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  monthButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 3,
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
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
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
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginTop: 15,
  },
  summaryItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 15,
    width: "45%",
    alignItems: "center",
  },
  summaryLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginBottom: 5,
  },
  summaryValue: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default HealthStats;
