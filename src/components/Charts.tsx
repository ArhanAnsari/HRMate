/**
 * 📊 CHART COMPONENTS - Analytics and Data Visualization
 * Reusable chart components for attendance, payroll, and leave analytics
 */

import { THEME } from "@/src/theme";
import React from "react";
import { useColorScheme } from "react-native";
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
  data: {
    approved: number;
    pending: number;
    rejected: number;
  };
}

export const LeaveChart: React.FC<LeaveChartProps> = ({ data }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const chartData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        data: [data.approved, data.pending, data.rejected],
      },
    ],
  };

  const chartColors = [
    THEME.colors.success,
    THEME.colors.warning,
    THEME.colors.danger,
  ];

  return (
    <PieChart
      data={
        {
          labels: chartData.labels,
          datasets: chartData.datasets,
        } as any
      }
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
      accessor="data"
      backgroundColor="transparent"
    />
  );
};

export default {
  AttendanceChart,
  PayrollChart,
  LeaveChart,
};
