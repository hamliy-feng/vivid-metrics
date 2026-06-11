"use client";
import dynamic from "next/dynamic";
import { filterWechat, filterXhs, PALETTE } from "@/lib/data";
import type { WechatVideo, XhsNote } from "@/lib/data";
import type { EChartsOption } from "echarts";

const EChart = dynamic(() => import("@/components/EChart"), { ssr: false });

interface TopBarProps {
  platform: "wechat" | "xhs";
  account: string;
  videos?: WechatVideo[];
  notes?: XhsNote[];
}

export function Top10BarChart({ platform, account, videos, notes }: TopBarProps) {
  let items: Array<{ label: string; plays: number; extra: string }> = [];
  if (platform === "wechat") {
    const rows = videos ?? (filterWechat(account as never) as WechatVideo[]);
    items = [...rows]
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 10)
      .map((v) => {
        const isDelta = Boolean(v.metricDate);
        const valueLabel = isDelta ? "当日新增浏览" : "浏览量";
        const cumulative = isDelta && v.cumulativePlays !== undefined
          ? `<br/>最新累计: ${v.cumulativePlays.toLocaleString("zh-CN")}`
          : "";
        return {
          label: v.desc.length > 18 ? v.desc.slice(0, 18) + "…" : v.desc,
          plays: v.plays,
          extra: `${valueLabel}: ${v.plays.toLocaleString("zh-CN")}<br/>完播率: ${v.completion !== null ? v.completion + "%" : "—"}${cumulative}<br/>${isDelta ? `增量日 ${v.metricDate} · ` : ""}发布 ${v.publishDate}`,
        };
      });
  } else {
    const rows = notes ?? (filterXhs(account as never) as XhsNote[]);
    items = [...rows]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map((n) => ({
        label: n.account + " · " + n.genre,
        plays: n.views,
        extra: `点赞: ${n.likes.toLocaleString("zh-CN")} · ${n.publishDate}`,
      }));
  }

  const color = platform === "wechat" ? PALETTE.wechat : PALETTE.xhs;
  const metricLabel = platform === "wechat" ? "浏览量" : "观看量";

  const option: EChartsOption = {
    grid: { top: 8, right: 16, bottom: 8, left: 8, containLabel: true },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(41,37,36,0.92)",
      borderColor: "transparent",
      textStyle: { color: "#fff", fontSize: 12 },
      formatter: (params: unknown) => {
        const p = (params as { name: string; value: number; dataIndex: number }[])[0];
        return `${items[p.dataIndex]?.extra || ""}`;
      },
    },
    xAxis: { type: "value", axisLabel: { fontSize: 10, color: "#a8a29e", formatter: (v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v) }, splitLine: { lineStyle: { color: "rgba(0,0,0,0.05)", type: "dashed" } } },
    yAxis: { type: "category", data: items.map((i) => i.label).reverse(), axisLabel: { fontSize: 10, color: "#57534e", width: 120, overflow: "truncate" }, axisTick: { show: false }, axisLine: { show: false } },
    series: [{
      type: "bar",
      data: items.map((i) => i.plays).reverse(),
      barMaxWidth: 20,
      itemStyle: {
        color: {
          type: "linear", x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [{ offset: 0, color: color + "55" }, { offset: 1, color }],
        },
        borderRadius: [0, 6, 6, 0],
      },
      label: { show: false },
    }],
  };

  return (
    <div>
      <p className="text-[10px] text-[var(--app-text-muted)] mb-1 px-1">Top 10 · {metricLabel}</p>
      <EChart option={option} style={{ height: 280 }} />
    </div>
  );
}

/* ── 多维柱图 ── */
export function Top10MultiBar({ platform, account, videos, notes }: TopBarProps) {
  let items: Array<{ label: string; plays: number; likes: number; comments: number }> = [];
  if (platform === "wechat") {
    const rows = videos ?? (filterWechat(account as never) as WechatVideo[]);
    items = [...rows].sort((a, b) => b.plays - a.plays).slice(0, 10).map((v, i) => ({
      label: `#${i + 1}`,
      plays: v.plays,
      likes: v.likes,
      comments: v.comments,
    }));
  } else {
    const rows = notes ?? (filterXhs(account as never) as XhsNote[]);
    items = [...rows].sort((a, b) => b.views - a.views).slice(0, 10).map((n, i) => ({
      label: `#${i + 1}`,
      plays: n.views,
      likes: n.likes,
      comments: n.comments,
    }));
  }

  const option: EChartsOption = {
    grid: { top: 24, right: 48, bottom: 24, left: 16, containLabel: true },
    legend: { top: 0, right: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 10, color: "#57534e" } },
    tooltip: { trigger: "axis", backgroundColor: "rgba(41,37,36,0.92)", borderColor: "transparent", textStyle: { color: "#fff", fontSize: 11 } },
    xAxis: { type: "category", data: items.map((i) => i.label), axisLabel: { fontSize: 10, color: "#a8a29e" }, axisTick: { show: false }, axisLine: { lineStyle: { color: "rgba(0,0,0,0.06)" } } },
    yAxis: [
      { type: "value", name: platform === "wechat" ? "浏览量" : "观看量", axisLabel: { fontSize: 9, color: "#a8a29e", formatter: (v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v) }, splitLine: { lineStyle: { color: "rgba(0,0,0,0.05)", type: "dashed" } } },
      { type: "value", name: "互动", axisLabel: { fontSize: 9, color: "#a8a29e", formatter: (v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v) }, splitLine: { show: false } },
    ],
    series: [
      {
        name: platform === "wechat" ? "浏览量" : "观看量",
        type: "bar",
        yAxisIndex: 0,
        data: items.map((i) => i.plays),
        itemStyle: { color: platform === "wechat" ? PALETTE.wechat : PALETTE.xhs, borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 14,
      },
      {
        name: "点赞",
        type: "bar",
        yAxisIndex: 1,
        data: items.map((i) => i.likes),
        itemStyle: { color: "#f59e0b", borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 14,
      },
      {
        name: "评论",
        type: "bar",
        yAxisIndex: 1,
        data: items.map((i) => i.comments),
        itemStyle: { color: "#8b5cf6", borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 14,
      },
    ],
  };

  return (
    <div>
      <p className="text-[10px] text-[var(--app-text-muted)] mb-1 px-1">Top 10 多维指标</p>
      <EChart option={option} style={{ height: 280 }} />
    </div>
  );
}
