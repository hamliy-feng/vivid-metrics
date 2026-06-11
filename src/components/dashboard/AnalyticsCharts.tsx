"use client";
import dynamic from "next/dynamic";
import {
  filterWechat, interactionByBucket,
  contentTypeDistribution, weekdayStats, PALETTE,
} from "@/lib/data";
import type { WechatVideo } from "@/lib/data";
import type { EChartsOption } from "echarts";

const EChart = dynamic(() => import("@/components/EChart"), { ssr: false });

interface AnalyticsProps {
  platform: "wechat" | "xhs";
  account: string;
  videos?: WechatVideo[];
}

/* ── 互动效率分组条形图 ── */
export function InteractionBucketChart({ account, videos }: AnalyticsProps) {
  const rows = videos ?? filterWechat(account as never);
  const buckets = interactionByBucket(rows);

  const option: EChartsOption = {
    grid: { top: 24, right: 16, bottom: 8, left: 8, containLabel: true },
    legend: { top: 0, right: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 9, color: "#57534e" } },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(41,37,36,0.92)",
      borderColor: "transparent",
      textStyle: { color: "#fff", fontSize: 11 },
      formatter: (params: unknown) => {
        const ps = params as { seriesName: string; value: number }[];
        return ps.map((p) => `${p.seriesName}: ${p.value}%`).join("<br/>");
      },
    },
    xAxis: {
      type: "category",
      data: buckets.map((b) => b.label),
      axisLabel: { fontSize: 9, color: "#a8a29e", interval: 0, rotate: 20 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "rgba(0,0,0,0.06)" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 9, color: "#a8a29e", formatter: (v: number) => v + "%" },
      splitLine: { lineStyle: { color: "rgba(0,0,0,0.05)", type: "dashed" } },
    },
    series: [
      {
        name: "点赞率",
        type: "bar",
        data: buckets.map((b) => b.likeRate),
        barMaxWidth: 14,
        itemStyle: { color: "#6366f1", borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "评论率",
        type: "bar",
        data: buckets.map((b) => b.commentRate),
        barMaxWidth: 14,
        itemStyle: { color: "#f59e0b", borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "分享率",
        type: "bar",
        data: buckets.map((b) => b.shareRate),
        barMaxWidth: 14,
        itemStyle: { color: "#10b981", borderRadius: [4, 4, 0, 0] },
      },
    ],
  };
  return (
    <div>
      <p className="text-[10px] text-[var(--app-text-muted)] mb-1 px-1">互动效率 · 按浏览分段</p>
      <EChart option={option} style={{ height: 220 }} />
    </div>
  );
}

/* ── 内容类型环形图 ── */
export function ContentTypeDonut({ platform, account, videos }: AnalyticsProps) {
  const rows = platform === "wechat" ? videos ?? filterWechat(account as never) : [];
  const dist = contentTypeDistribution(rows);

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(41,37,36,0.92)",
      borderColor: "transparent",
      textStyle: { color: "#fff", fontSize: 12 },
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      bottom: 0,
      left: "center",
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontSize: 10, color: "#57534e" },
    },
    series: [{
      type: "pie",
      radius: ["44%", "70%"],
      center: ["50%", "44%"],
      data: dist.map((d) => ({
        name: d.name,
        value: d.value,
        itemStyle: { color: PALETTE.content[d.name as keyof typeof PALETTE.content] },
      })),
      label: { show: false },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.3)" },
      },
    }],
  };
  return (
    <div>
      <p className="text-[10px] text-[var(--app-text-muted)] mb-1 px-1">内容类型分布</p>
      <EChart option={option} style={{ height: 220 }} />
    </div>
  );
}

/* ── 星期维度雷达图 ── */
export function WeekdayRadar({ platform, account, videos }: AnalyticsProps) {
  const rows = platform === "wechat" ? videos ?? filterWechat(account as never) : [];
  const stats = weekdayStats(rows);
  const maxPlays = Math.max(...stats.map((s) => s.avgPlays), 1);
  const maxInteract = Math.max(...stats.map((s) => s.avgInteractions), 1);
  const color = platform === "wechat" ? PALETTE.wechat : PALETTE.xhs;

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(41,37,36,0.92)",
      borderColor: "transparent",
      textStyle: { color: "#fff", fontSize: 11 },
    },
    legend: {
      bottom: 0,
      left: "center",
      icon: "circle",
      itemWidth: 8,
      textStyle: { fontSize: 10, color: "#57534e" },
    },
    radar: {
      indicator: stats.map((s) => ({ name: s.label, max: Math.max(maxPlays, maxInteract) })),
      radius: "62%",
      center: ["50%", "46%"],
      axisName: { fontSize: 10, color: "#57534e" },
      splitArea: { areaStyle: { color: ["rgba(0,0,0,0.01)", "rgba(0,0,0,0.02)"] } },
      axisLine: { lineStyle: { color: "rgba(0,0,0,0.06)" } },
      splitLine: { lineStyle: { color: "rgba(0,0,0,0.06)" } },
    },
    series: [{
      type: "radar",
      data: [
        {
          name: "平均浏览量",
          value: stats.map((s) => s.avgPlays),
          lineStyle: { color, width: 2 },
          areaStyle: { color: color + "33" },
          itemStyle: { color },
          symbol: "circle",
          symbolSize: 4,
        },
        {
          name: "平均互动量",
          value: stats.map((s) => s.avgInteractions),
          lineStyle: { color: "#6366f1", width: 2 },
          areaStyle: { color: "#6366f133" },
          itemStyle: { color: "#6366f1" },
          symbol: "circle",
          symbolSize: 4,
        },
      ],
    }],
  };
  return (
    <div>
      <p className="text-[10px] text-[var(--app-text-muted)] mb-1 px-1">星期维度分析</p>
      <EChart option={option} style={{ height: 220 }} />
    </div>
  );
}

/* ── 涨粉×流量气泡图 ── */
export function BubbleChart({ platform, account, videos }: AnalyticsProps) {
  let seriesData: { value: [number, number, number]; name: string; itemStyle: { color: string } }[] = [];

  if (platform === "wechat") {
    const rows = videos ?? filterWechat(account as never);
    seriesData = rows.map((v) => ({
      value: [v.plays, v.followers, v.likes + v.comments + v.shares],
      name: v.desc.slice(0, 20),
      itemStyle: { color: PALETTE.content[v.contentType] },
    }));
  }

  const option: EChartsOption = {
    grid: { top: 24, right: 16, bottom: 36, left: 16, containLabel: true },
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(41,37,36,0.92)",
      borderColor: "transparent",
      textStyle: { color: "#fff", fontSize: 11 },
      formatter: (params: unknown) => {
        const p = params as { name: string; value: [number, number, number] };
        return `${p.name}<br/>浏览: ${p.value[0].toLocaleString("zh-CN")}<br/>涨粉: ${p.value[1]}<br/>互动: ${p.value[2]}`;
      },
    },
    xAxis: {
      type: "value",
      name: "浏览量",
      nameTextStyle: { fontSize: 10, color: "#a8a29e" },
      axisLabel: { fontSize: 9, color: "#a8a29e", formatter: (v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v) },
      splitLine: { lineStyle: { color: "rgba(0,0,0,0.05)", type: "dashed" } },
    },
    yAxis: {
      type: "value",
      name: "涨粉数",
      nameTextStyle: { fontSize: 10, color: "#a8a29e" },
      axisLabel: { fontSize: 9, color: "#a8a29e" },
      splitLine: { lineStyle: { color: "rgba(0,0,0,0.05)", type: "dashed" } },
    },
    series: [{
      type: "scatter",
      data: seriesData,
      symbolSize: (data: [number, number, number]) => Math.max(8, Math.min(40, data[2] / 30)),
      itemStyle: { opacity: 0.82 },
    }],
    legend: {
      data: ["菌菇类", "旅行类", "虫草类", "其他"],
      bottom: 0,
      left: "center",
      icon: "circle",
      itemWidth: 8,
      textStyle: { fontSize: 10, color: "#57534e" },
    },
  };

  if (platform === "xhs") {
    return (
      <div className="flex items-center justify-center h-40 text-[var(--app-text-muted)] text-sm">
        小红书气泡图暂未支持（字段结构差异）
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] text-[var(--app-text-muted)] mb-1 px-1">涨粉 × 流量 × 互动气泡图</p>
      <EChart option={option} style={{ height: 260 }} />
    </div>
  );
}
