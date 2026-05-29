"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  kuaishouPosts, kuaishouKpi, douyinDays, douyinKpi,
  mpDays, mpKpi, dateRange, DATE_START, DATE_END, PALETTE,
  type KuaishouPost, type DouyinDay, type MpDay,
} from "@/lib/data";

const EChart = dynamic(() => import("@/components/EChart"), { ssr: false });

// ── KPI 卡 ───────────────────────────────────────────
function KpiCard({ label, value, unit, accent }: { label: string; value: string | number; unit?: string; accent: string }) {
  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
      <div className="text-xs text-[var(--app-text-muted)] mb-2">{label}</div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold" style={{ color: accent }}>{value}</span>
        {unit && <span className="text-sm text-[var(--app-text-muted)] mb-0.5">{unit}</span>}
      </div>
      <div className="absolute top-3 right-3 w-8 h-8 rounded-full opacity-10" style={{ background: accent }} />
    </div>
  );
}

// ── 快手视图 ─────────────────────────────────────────
function KuaishouView() {
  const accent = PALETTE.kuaishou;
  const kpi = useMemo(() => kuaishouKpi(kuaishouPosts), []);
  const dates = dateRange(DATE_START, DATE_END);

  // 每日播放趋势
  const dailyMap: Record<string, number> = {};
  kuaishouPosts.forEach((p) => { dailyMap[p.publishDate] = (dailyMap[p.publishDate] || 0) + p.plays; });
  const trendData = dates.map((d) => dailyMap[d] || 0);

  // 前10播放排行
  const top10 = [...kuaishouPosts].sort((a, b) => b.plays - a.plays).slice(0, 10);

  // 内容类型分布
  const typeMap: Record<string, number> = {};
  kuaishouPosts.forEach((p) => { typeMap[p.contentType] = (typeMap[p.contentType] || 0) + 1; });
  const typePie = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  const trendOption = {
    tooltip: { trigger: "axis", formatter: (ps: any[]) => `${ps[0].name}<br/>播放量: ${ps[0].value.toLocaleString()}` },
    xAxis: { type: "category", data: dates, axisLabel: { rotate: 30, fontSize: 10, interval: 6 }, axisLine: { lineStyle: { color: "#ccc" } } },
    yAxis: { type: "value", axisLabel: { fontSize: 10 } },
    series: [{ type: "line", data: trendData, smooth: true, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent + "50" }, { offset: 1, color: accent + "05" }] } }, lineStyle: { color: accent, width: 2 }, itemStyle: { color: accent }, symbol: "none" }],
    grid: { left: 40, right: 10, top: 10, bottom: 50 },
  };

  const barOption = {
    tooltip: { trigger: "axis" },
    xAxis: { type: "value", axisLabel: { fontSize: 10 } },
    yAxis: { type: "category", data: top10.map((p) => p.desc.slice(0, 14)), axisLabel: { fontSize: 10 } },
    series: [{ type: "bar", data: top10.map((p) => p.plays), itemStyle: { color: accent, borderRadius: [0, 4, 4, 0] } }],
    grid: { left: 120, right: 20, top: 5, bottom: 20 },
  };

  const pieOption = {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    series: [{ type: "pie", radius: ["40%", "70%"], data: typePie, itemStyle: { borderRadius: 4 }, label: { fontSize: 11 } }],
    color: Object.values(PALETTE.content),
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="总播放量" value={kpi.totalPlays.toLocaleString()} accent={accent} />
        <KpiCard label="总点赞数" value={kpi.totalLikes} accent={accent} />
        <KpiCard label="涨粉总数" value={kpi.totalFollowers} accent={accent} />
        <KpiCard label="平均完播率" value={kpi.avgCompletion} unit="%" accent={accent} />
      </div>
      <div className="glass-card rounded-2xl p-4">
        <div className="text-sm font-medium text-[var(--app-text-secondary)] mb-3">每日播放趋势</div>
        <div className="h-44"><EChart option={trendOption as any} style={{ height: "100%" }} /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="text-sm font-medium text-[var(--app-text-secondary)] mb-3">前10作品播放排行</div>
          <div className="h-52"><EChart option={barOption as any} style={{ height: "100%" }} /></div>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="text-sm font-medium text-[var(--app-text-secondary)] mb-3">内容类型分布</div>
          <div className="h-52"><EChart option={pieOption as any} style={{ height: "100%" }} /></div>
        </div>
      </div>
      <div className="glass-card rounded-2xl p-4">
        <div className="text-sm font-medium text-[var(--app-text-secondary)] mb-2">作品明细（{kuaishouPosts.length} 条）</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-[var(--app-text-muted)] border-b border-white/30">
              <th className="text-left py-2 pr-3 font-medium">内容</th>
              <th className="text-right py-2 px-2 font-medium">播放</th>
              <th className="text-right py-2 px-2 font-medium">完播率</th>
              <th className="text-right py-2 px-2 font-medium">点赞</th>
              <th className="text-right py-2 px-2 font-medium">评论</th>
              <th className="text-right py-2 pl-2 font-medium">日期</th>
            </tr></thead>
            <tbody>
              {[...kuaishouPosts].sort((a, b) => b.plays - a.plays).map((p, i) => (
                <tr key={i} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="py-1.5 pr-3 max-w-[200px] truncate text-[var(--app-text)]">{p.desc}</td>
                  <td className="text-right px-2 font-medium" style={{ color: accent }}>{p.plays.toLocaleString()}</td>
                  <td className="text-right px-2 text-[var(--app-text-secondary)]">{p.completion != null ? p.completion + "%" : "—"}</td>
                  <td className="text-right px-2 text-[var(--app-text-secondary)]">{p.likes}</td>
                  <td className="text-right px-2 text-[var(--app-text-secondary)]">{p.comments}</td>
                  <td className="text-right pl-2 text-[var(--app-text-muted)]">{p.publishDate.slice(5)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 抖音视图 ─────────────────────────────────────────
function DouyinView() {
  const accent = "#fe2c55";
  const kpi = useMemo(() => douyinKpi(douyinDays), []);

  const trendOption = {
    tooltip: { trigger: "axis" },
    legend: { data: ["播放量", "总粉丝"], bottom: 0, textStyle: { fontSize: 10 } },
    xAxis: { type: "category", data: douyinDays.map((d) => d.date.slice(5)), axisLabel: { fontSize: 9, rotate: 30 } },
    yAxis: [{ type: "value", name: "播放量", axisLabel: { fontSize: 9 } }, { type: "value", name: "粉丝", axisLabel: { fontSize: 9 } }],
    series: [
      { name: "播放量", type: "bar", data: douyinDays.map((d) => d.plays), itemStyle: { color: accent + "cc", borderRadius: [3, 3, 0, 0] } },
      { name: "总粉丝", type: "line", yAxisIndex: 1, data: douyinDays.map((d) => d.totalFans), lineStyle: { color: "#6366f1" }, itemStyle: { color: "#6366f1" }, symbol: "circle", symbolSize: 4 },
    ],
    grid: { left: 40, right: 40, top: 15, bottom: 50 },
  };

  const interactionOption = {
    tooltip: { trigger: "axis" },
    legend: { data: ["点赞", "分享", "评论"], bottom: 0, textStyle: { fontSize: 10 } },
    xAxis: { type: "category", data: douyinDays.map((d) => d.date.slice(5)), axisLabel: { fontSize: 9, rotate: 30 } },
    yAxis: { type: "value", axisLabel: { fontSize: 9 } },
    series: [
      { name: "点赞", type: "line", data: douyinDays.map((d) => d.likes), lineStyle: { color: accent }, itemStyle: { color: accent }, symbol: "none", smooth: true },
      { name: "分享", type: "line", data: douyinDays.map((d) => d.shares), lineStyle: { color: "#f59e0b" }, itemStyle: { color: "#f59e0b" }, symbol: "none", smooth: true },
      { name: "评论", type: "line", data: douyinDays.map((d) => d.comments), lineStyle: { color: "#10b981" }, itemStyle: { color: "#10b981" }, symbol: "none", smooth: true },
    ],
    grid: { left: 30, right: 10, top: 10, bottom: 50 },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="总播放量" value={kpi.totalPlays.toLocaleString()} accent={accent} />
        <KpiCard label="总点赞数" value={kpi.totalLikes} accent={accent} />
        <KpiCard label="当前粉丝" value={kpi.totalFans} accent={accent} />
        <KpiCard label="日均播放（活跃日）" value={kpi.avgDailyPlays.toLocaleString()} accent={accent} />
      </div>
      <div className="glass-card rounded-2xl p-4">
        <div className="text-sm font-medium text-[var(--app-text-secondary)] mb-3">每日播放量 & 粉丝增长</div>
        <div className="h-52"><EChart option={trendOption as any} style={{ height: "100%" }} /></div>
      </div>
      <div className="glass-card rounded-2xl p-4">
        <div className="text-sm font-medium text-[var(--app-text-secondary)] mb-3">互动数据趋势（点赞 / 分享 / 评论）</div>
        <div className="h-44"><EChart option={interactionOption as any} style={{ height: "100%" }} /></div>
      </div>
      <div className="glass-card rounded-2xl p-4 overflow-x-auto">
        <div className="text-sm font-medium text-[var(--app-text-secondary)] mb-2">日明细</div>
        <table className="w-full text-xs">
          <thead><tr className="text-[var(--app-text-muted)] border-b border-white/30">
            {["日期","播放","点赞","分享","评论","净增粉","总粉丝"].map(h=><th key={h} className="text-right py-2 px-2 first:text-left font-medium">{h}</th>)}
          </tr></thead>
          <tbody>
            {[...douyinDays].reverse().map((d, i) => (
              <tr key={i} className="border-b border-white/10 hover:bg-white/10">
                <td className="py-1.5 pr-3 text-[var(--app-text-muted)]">{d.date}</td>
                <td className="text-right px-2 font-medium" style={{ color: d.plays > 0 ? accent : "var(--app-text-muted)" }}>{d.plays.toLocaleString()}</td>
                <td className="text-right px-2">{d.likes}</td>
                <td className="text-right px-2">{d.shares}</td>
                <td className="text-right px-2">{d.comments}</td>
                <td className="text-right px-2" style={{ color: d.netFans > 0 ? "#10b981" : "var(--app-text-muted)" }}>{d.netFans > 0 ? "+" + d.netFans : d.netFans}</td>
                <td className="text-right px-2">{d.totalFans}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 公众号视图 ───────────────────────────────────────
function MpView() {
  const accent = "#07C160";
  const kpi = useMemo(() => mpKpi(mpDays), []);

  const trendOption = {
    tooltip: { trigger: "axis" },
    legend: { data: ["阅读人数", "分享人数", "收藏人数"], bottom: 0, textStyle: { fontSize: 10 } },
    xAxis: { type: "category", data: mpDays.map((d) => d.date.slice(5)), axisLabel: { fontSize: 9, rotate: 30 } },
    yAxis: { type: "value", axisLabel: { fontSize: 9 } },
    series: [
      { name: "阅读人数", type: "bar", data: mpDays.map((d) => d.reads), itemStyle: { color: accent + "cc", borderRadius: [3, 3, 0, 0] } },
      { name: "分享人数", type: "line", data: mpDays.map((d) => d.shares), lineStyle: { color: "#f59e0b" }, itemStyle: { color: "#f59e0b" }, symbol: "circle", symbolSize: 4 },
      { name: "收藏人数", type: "line", data: mpDays.map((d) => d.collects), lineStyle: { color: "#6366f1" }, itemStyle: { color: "#6366f1" }, symbol: "circle", symbolSize: 4 },
    ],
    grid: { left: 35, right: 10, top: 15, bottom: 50 },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="总阅读人数" value={kpi.totalReads.toLocaleString()} accent={accent} />
        <KpiCard label="总分享人数" value={kpi.totalShares} accent={accent} />
        <KpiCard label="总收藏人数" value={kpi.totalCollects} accent={accent} />
        <KpiCard label="发文篇数" value={kpi.totalPosts} accent={accent} />
      </div>
      <div className="glass-card rounded-2xl p-4">
        <div className="text-sm font-medium text-[var(--app-text-secondary)] mb-3">公众号每日阅读 / 分享 / 收藏趋势</div>
        <div className="h-52"><EChart option={trendOption as any} style={{ height: "100%" }} /></div>
      </div>
      <div className="glass-card rounded-2xl p-4 overflow-x-auto">
        <div className="text-sm font-medium text-[var(--app-text-secondary)] mb-2">日明细</div>
        <table className="w-full text-xs">
          <thead><tr className="text-[var(--app-text-muted)] border-b border-white/30">
            {["日期","阅读","分享","收藏","发文"].map(h=><th key={h} className="text-right py-2 px-2 first:text-left font-medium">{h}</th>)}
          </tr></thead>
          <tbody>
            {[...mpDays].reverse().map((d, i) => (
              <tr key={i} className="border-b border-white/10 hover:bg-white/10">
                <td className="py-1.5 pr-3 text-[var(--app-text-muted)]">{d.date}</td>
                <td className="text-right px-2 font-medium" style={{ color: d.reads > 0 ? accent : "var(--app-text-muted)" }}>{d.reads.toLocaleString()}</td>
                <td className="text-right px-2">{d.shares}</td>
                <td className="text-right px-2">{d.collects}</td>
                <td className="text-right px-2">{d.posts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 主组件 ───────────────────────────────────────────
type Tab = "kuaishou" | "douyin" | "mp";

export default function OfficialPlatformScreen({ defaultTab }: { defaultTab?: Tab } = {}) {
  const [tab, setTab] = React.useState<Tab>(defaultTab || "kuaishou");

  const tabs: { key: Tab; label: string; color: string }[] = [
    { key: "kuaishou", label: "快手", color: PALETTE.kuaishou },
    { key: "douyin",   label: "抖音", color: "#fe2c55" },
    { key: "mp",       label: "公众号", color: "#07C160" },
  ];

  const bgBlobs: Record<Tab, [string, string]> = {
    kuaishou: ["rgba(255,102,0,0.08)", "rgba(255,200,50,0.05)"],
    douyin:   ["rgba(254,44,85,0.08)", "rgba(105,201,208,0.05)"],
    mp:       ["rgba(7,193,96,0.08)",  "rgba(100,200,150,0.05)"],
  };

  const activeColor = tabs.find((t) => t.key === tab)?.color ?? PALETTE.kuaishou;

  return (
    <div className="min-h-svh relative overflow-hidden" style={{ background: "var(--app-bg)" }}>
      {/* 背景光晕 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-60" style={{ background: bgBlobs[tab][0] }} />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-50" style={{ background: bgBlobs[tab][1] }} />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-6 space-y-5">
        {/* 平台 Tab */}
        <div className="glass-card rounded-2xl p-1 flex gap-1 w-fit">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={tab === t.key
                ? { background: t.color, color: "#fff", boxShadow: `0 2px 12px ${t.color}50` }
                : { color: "var(--app-text-secondary)" }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "kuaishou" && <KuaishouView />}
        {tab === "douyin"   && <DouyinView />}
        {tab === "mp"       && <MpView />}
      </div>
    </div>
  );
}
