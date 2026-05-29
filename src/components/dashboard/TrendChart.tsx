"use client";
import dynamic from "next/dynamic";
import {
  filterWechat, filterXhs,
  dateRange, dailyPlays, dailyExposure,
  DATE_START, DATE_END, PALETTE,
} from "@/lib/data";
import type { EChartsOption } from "echarts";

const EChart = dynamic(() => import("@/components/EChart"), { ssr: false });

interface TrendChartProps {
  platform: "wechat" | "xhs";
  account: string;
}

export function TrendChart({ platform, account }: TrendChartProps) {
  const dates = dateRange(DATE_START, DATE_END);

  let dayMap: Record<string, number>;
  if (platform === "wechat") {
    dayMap = dailyPlays(filterWechat(account as never));
  } else {
    dayMap = dailyExposure(filterXhs(account as never));
  }

  const values = dates.map((d) => dayMap[d] ?? 0);
  const color = platform === "wechat" ? PALETTE.wechat : PALETTE.xhs;
  const label = platform === "wechat" ? "播放量" : "曝光量";

  const option: EChartsOption = {
    grid: { top: 16, right: 16, bottom: 28, left: 48 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(41,37,36,0.92)",
      borderColor: "transparent",
      textStyle: { color: "#fff", fontSize: 12 },
      formatter: (params: unknown) => {
        const p = (params as { axisValue: string; value: number }[])[0];
        const cnt = (platform === "wechat" ? filterWechat(account as never) : filterXhs(account as never))
          .filter((v) => v.publishDate === p.axisValue).length;
        return `<b>${p.axisValue}</b><br/>${label}: ${p.value.toLocaleString("zh-CN")}<br/>发布: ${cnt} 条`;
      },
    },
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: {
        fontSize: 10,
        color: "#a8a29e",
        formatter: (v: string) => v.slice(5),
        interval: 6,
      },
      axisLine: { lineStyle: { color: "rgba(0,0,0,0.06)" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 10, color: "#a8a29e", formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v) },
      splitLine: { lineStyle: { color: "rgba(0,0,0,0.05)", type: "dashed" } },
    },
    series: [{
      type: "line",
      data: values,
      smooth: true,
      symbol: "circle",
      symbolSize: 5,
      lineStyle: { color, width: 2.5 },
      itemStyle: { color },
      areaStyle: {
        color: {
          type: "linear", x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: color + "55" },
            { offset: 1, color: color + "00" },
          ],
        },
      },
    }],
  };

  return <EChart option={option} style={{ height: 220 }} />;
}
