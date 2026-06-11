"use client";
import dynamic from "next/dynamic";
import {
  filterWechat, filterXhs,
  dateRange, dailyPlays,
  DATE_START, DATE_END, PALETTE,
} from "@/lib/data";
import type { WechatVideo, XhsNote } from "@/lib/data";
import type { EChartsOption } from "echarts";

const EChart = dynamic(() => import("@/components/EChart"), { ssr: false });

interface TrendChartProps {
  platform: "wechat" | "xhs";
  account: string;
  videos?: WechatVideo[];
  notes?: XhsNote[];
  startDate?: string;
  endDate?: string;
}

function dailyViews(notes: XhsNote[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const note of notes) map[note.publishDate] = (map[note.publishDate] || 0) + note.views;
  return map;
}

function rowDate(row: { publishDate: string; metricDate?: string }): string {
  return row.metricDate || row.publishDate;
}

export function TrendChart({ platform, account, videos, notes, startDate = DATE_START, endDate = DATE_END }: TrendChartProps) {
  const dates = dateRange(startDate, endDate);

  let dayMap: Record<string, number>;
  let rowCountByDate: Record<string, number>;
  if (platform === "wechat") {
    const rows = videos ?? filterWechat(account as never);
    dayMap = dailyPlays(rows);
    rowCountByDate = rows.reduce<Record<string, number>>((map, row) => {
      const date = rowDate(row);
      map[date] = (map[date] || 0) + 1;
      return map;
    }, {});
  } else {
    const rows = notes ?? filterXhs(account as never);
    dayMap = dailyViews(rows);
    rowCountByDate = rows.reduce<Record<string, number>>((map, row) => {
      map[row.publishDate] = (map[row.publishDate] || 0) + 1;
      return map;
    }, {});
  }

  const values = dates.map((d) => dayMap[d] ?? 0);
  const color = platform === "wechat" ? PALETTE.wechat : PALETTE.xhs;
  const label = platform === "wechat" ? "浏览量" : "观看量";
  const countLabel = platform === "wechat" ? "视频" : "发布";

  const option: EChartsOption = {
    grid: { top: 16, right: 16, bottom: 28, left: 48 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(41,37,36,0.92)",
      borderColor: "transparent",
      textStyle: { color: "#fff", fontSize: 12 },
      formatter: (params: unknown) => {
        const p = (params as { axisValue: string; value: number }[])[0];
        const cnt = rowCountByDate[p.axisValue] || 0;
        return `<b>${p.axisValue}</b><br/>${label}: ${p.value.toLocaleString("zh-CN")}<br/>${countLabel}: ${cnt} 条`;
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
