/**
 * 📊 CHART COMPONENTS - Analytics and Data Visualization
 * Reusable chart components for attendance, payroll, and leave analytics
 */

import { THEME } from "@/src/theme";
import React from "react";
import { Text, useColorScheme, View } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

interface AttendanceChartProps {
  data: {
    dates: string[];
    attendanceRates: number[];
  };
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({ data }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const chartData: ChartData = {
    labels: data.dates,
    datasets: [
      {
        data: data.attendanceRates,
        color: () => THEME.colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <LineChart
      data={chartData}
      width={350}
      height={220}
      chartConfig={{
        backgroundColor: isDark
          ? THEME.dark.background.main
          : THEME.light.background.main,
        backgroundGradientFrom: isDark
          ? THEME.dark.background.main
          : THEME.light.background.main,
        backgroundGradientTo: isDark
          ? THEME.dark.background.main
          : THEME.light.background.main,
        decimalPlaces: 1,
        color: () => THEME.colors.primary,
        labelColor: () =>
          isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
        style: { borderRadius: THEME.borderRadius.md },
        propsForDots: {
          r: "5",
          strokeWidth: "2",
          stroke: THEME.colors.primary,
        },
      }}
      bezier
    />
  );
};

interface PayrollChartProps {
  data: {
    departments: string[];
    payrolls: number[];
  };
}

export const PayrollChart: React.FC<PayrollChartProps> = ({ data }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const chartData: ChartData = {
    labels: data.departments,
    datasets: [
      {
        data: data.payrolls,
        color: () => THEME.colors.success,
        strokeWidth: 0,
      },
    ],
  };

  return (
    <BarChart
      data={chartData}
      width={350}
      height={220}
      yAxisLabel="₹"
      yAxisSuffix=""
      chartConfig={{
        backgroundColor: isDark
          ? THEME.dark.background.main
          : THEME.light.background.main,
        backgroundGradientFrom: isDark
          ? THEME.dark.background.main
          : THEME.light.background.main,
        backgroundGradientTo: isDark
          ? THEME.dark.background.main
          : THEME.light.background.main,
        decimalPlaces: 0,
        color: () => THEME.colors.success,
        labelColor: () =>
          isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
        style: { borderRadius: THEME.borderRadius.md },
      }}
    />
  );
};

interface LeaveChartProps {
  data?: {
    approved?: number;
    pending?: number;
    rejected?: number;
  };
}

export const LeaveChart: React.FC<LeaveChartProps> = ({ data }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Handle undefined or empty data
  if (
    !data ||
    (data.approved === undefined &&
      data.pending === undefined &&
      data.rejected === undefined)
  ) {
    return (
      <View
        style={{
          width: 350,
          height: 220,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDark
            ? THEME.dark.background.alt
            : THEME.light.background.alt,
          borderRadius: THEME.borderRadius.lg,
        }}
      >
        <Text
          style={{
            color: isDark
              ? THEME.dark.text.secondary
              : THEME.light.text.secondary,
          }}
        >
          No leave data available
        </Text>
      </View>
    );
  }

  const legendFontColor = isDark
    ? THEME.dark.text.secondary
    : THEME.light.text.secondary;

  const chartData = [
    {
      name: "Approved",
      value: Number(data.approved ?? 0),
      color: THEME.colors.success,
      legendFontColor,
      legendFontSize: 12,
    },
    {
      name: "Pending",
      value: Number(data.pending ?? 0),
      color: THEME.colors.warning,
      legendFontColor,
      legendFontSize: 12,
    },
    {
      name: "Rejected",
      value: Number(data.rejected ?? 0),
      color: THEME.colors.danger,
      legendFontColor,
      legendFontSize: 12,
    },
  ];

  return (
    <PieChart
      data={chartData}
      width={350}
      height={220}
      paddingLeft="0"
      chartConfig={{
        backgroundColor: isDark
          ? THEME.dark.background.main
          : THEME.light.background.main,
        backgroundGradientFrom: isDark
          ? THEME.dark.background.main
          : THEME.light.background.main,
        backgroundGradientTo: isDark
          ? THEME.dark.background.main
          : THEME.light.background.main,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: () =>
          isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
      }}
      accessor="value"
      backgroundColor="transparent"
    />
  );
};

export default {
  AttendanceChart,
  PayrollChart,
  LeaveChart,
};
