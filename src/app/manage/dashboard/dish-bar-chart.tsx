"use client";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardIndicatorResType } from "@/schemaValidations/indicator.schema";
import { useMemo } from "react";

const colors = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA07A", // Light Salmon
  "#98D8C8", // Mint
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#85C1E2", // Sky Blue
  "#FF8C94", // Pink
  "#95E1D3", // Aqua
  "#F38181", // Coral
  "#AA96DA", // Lavender
  "#FCBAD3", // Light Pink
  "#A8E6CF", // Light Green
  "#FFD3B6", // Peach
  "#FFAAA5", // Salmon Pink
  "#6C5CE7", // Indigo
  "#00B894", // Green
  "#FDCB6E", // Orange
  "#E17055", // Terra Cotta
];

const chartConfig = {
  chrome: {
    label: "Chrome",
    color: "#FF6B6B",
  },
  safari: {
    label: "Safari",
    color: "#4ECDC4",
  },
  firefox: {
    label: "Firefox",
    color: "#45B7D1",
  },
  edge: {
    label: "Edge",
    color: "#FFA07A",
  },
  other: {
    label: "Other",
    color: "#98D8C8",
  },
} satisfies ChartConfig;

export function DishBarChart({
  chartData,
}: {
  chartData: Pick<DashboardIndicatorResType["data"]["dishIndicator"][0], "name" | "successOrders">[];
}) {
  const chartDateColors = useMemo(
    () =>
      chartData.map((data, index) => {
        return {
          ...data,
          fill: colors[index] ?? colors[colors.length - 1],
        };
      }),
    [chartData]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xếp hạng món ăn</CardTitle>
        <CardDescription>Được gọi nhiều nhất</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartDateColors}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={2}
              axisLine={false}
              tickFormatter={(value) => {
                return value;
              }}
            />
            <XAxis dataKey="successOrders" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="successOrders" name={"Đơn thanh toán"} layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
