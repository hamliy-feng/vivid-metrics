"use client";
import dynamic from "next/dynamic";
import { filterXhs, xhsGenreComparison } from "@/lib/data";
import type { XhsNote } from "@/lib/data";
import type { EChartsOption } from "echarts";

const EChart = dynamic(() => import("@/components/EChart"), { ssr: false });

interface GenreCompareProps {
  account: string;
  notes?: XhsNote[];
}

export function GenreCompareChart({ account, notes }: GenreCompareProps) {
  const rows = notes ?? filterXhs(account as never);
  const data = xhsGenreComparison(rows);

  const option: EChartsOption = {
    grid: { top: 32, right: 16, bottom: 24, left: 16, containLabel: true },
    legend: {
      top: 4,
      left: "center",
      icon: "circle",
      itemWidth: 8,
      textStyle: { fontSize: 10, color: "#57534e" },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(41,37,36,0.92)",
      borderColor: "transparent",
      textStyle: { color: "#fff", fontSize: 11 },
    },
    xAxis: {
      type: "category",
      data: ["平均观看", "点赞率(%)", "涨粉率(‰)"],
      axisLabel: { fontSize: 10, color: "#a8a29e" },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "rgba(0,0,0,0.06)" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 9, color: "#a8a29e", formatter: (v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v) },
      splitLine: { lineStyle: { color: "rgba(0,0,0,0.05)", type: "dashed" } },
    },
    series: data.map((d) => ({
      name: d.genre,
      type: "bar" as const,
      data: [d.avgViews, d.likeRate, d.followerRate * 10],
      barMaxWidth: 24,
      itemStyle: {
        color: d.genre === "图文" ? "#6366f1" : "#FF2442",
        borderRadius: [4, 4, 0, 0],
      },
    })),
  };

  return (
    <div>
      <p className="text-[10px] text-[var(--app-text-muted)] mb-1 px-1">图文 vs 视频 · 观看口径</p>
      <EChart option={option} style={{ height: 220 }} />
    </div>
  );
}
