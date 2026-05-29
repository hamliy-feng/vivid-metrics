"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  wechatVideos, xhsNotes, filterWechat, filterXhs,
  contentTypeDistribution, PALETTE, WECHAT_ACCOUNTS, XHS_ACCOUNTS,
} from "@/lib/data";
import type { EChartsOption } from "echarts";

const EChart = dynamic(() => import("@/components/EChart"), { ssr: false });

type Source = "wechat" | "xhs";

export function MatrixScreen() {
  const [source, setSource] = useState<Source>("wechat");
  const [account, setAccount] = useState("全部");

  const accountList = ["全部", ...(source === "wechat" ? [...WECHAT_ACCOUNTS] : [...XHS_ACCOUNTS])];

  const bubbleData = source === "wechat"
    ? filterWechat(account as never).map((v) => ({
        value: [v.plays, v.followers, v.likes + v.comments + v.shares],
        name: v.desc.slice(0, 16) + (v.desc.length > 16 ? "…" : ""),
        itemStyle: { color: PALETTE.content[v.contentType] + "cc" },
      }))
    : filterXhs(account as never).map((n) => ({
        value: [n.views, n.followers, n.likes + n.comments + n.saves],
        name: `${n.account} · ${n.genre}`,
        itemStyle: { color: PALETTE.xhs + "cc" },
      }));

  const bubbleOption: EChartsOption = {
    grid: { top: 24, right: 24, bottom: 48, left: 16, containLabel: true },
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(41,37,36,0.92)",
      borderColor: "transparent",
      textStyle: { color: "#fff", fontSize: 11 },
      formatter: (params: unknown) => {
        const p = params as { name: string; value: [number, number, number] };
        return `<b>${p.name}</b><br/>播放/观看: ${p.value[0].toLocaleString("zh-CN")}<br/>涨粉: ${p.value[1]}<br/>互动: ${p.value[2]}`;
      },
    },
    xAxis: {
      type: "value", name: "播放量 →", nameLocation: "end",
      nameTextStyle: { fontSize: 10, color: "#a8a29e" },
      axisLabel: { fontSize: 9, color: "#a8a29e", formatter: (v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v) },
      splitLine: { lineStyle: { color: "rgba(0,0,0,0.05)", type: "dashed" } },
    },
    yAxis: {
      type: "value", name: "↑ 涨粉数",
      nameTextStyle: { fontSize: 10, color: "#a8a29e" },
      axisLabel: { fontSize: 9, color: "#a8a29e" },
      splitLine: { lineStyle: { color: "rgba(0,0,0,0.05)", type: "dashed" } },
    },
    series: [{
      type: "scatter", data: bubbleData, itemStyle: { opacity: 0.85 },
      symbolSize: (data: [number, number, number]) => Math.max(10, Math.min(48, data[2] / 25)),
    }],
  };

  const dist = contentTypeDistribution(wechatVideos).sort((a, b) => b.value - a.value);
  const total = dist.reduce((s, d) => s + d.value, 0);

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute bottom-1/4 left-[-60px] w-80 h-80 rounded-full blob-wechat animate-blob-slow opacity-35" />
        <div className="absolute top-1/3 right-[-40px] w-64 h-64 rounded-full blob-amber animate-blob-slower opacity-30" />
      </div>
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 pt-6 pb-8 space-y-5">
        {/* 头部 */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-[var(--app-text)]">互动矩阵</h1>
            <p className="text-xs text-[var(--app-text-muted)]">气泡大小 = 互动总量 · 颜色 = 内容类型</p>
          </div>
          <div className="glass-card rounded-xl p-0.5 flex">
            {(["wechat", "xhs"] as Source[]).map((s) => (
              <button key={s} onClick={() => { setSource(s); setAccount("全部"); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${source === s ? "text-white shadow-sm" : "text-[var(--app-text-secondary)]"}`}
                style={source === s ? { background: s === "wechat" ? PALETTE.wechat : PALETTE.xhs } : {}}
              >
                {s === "wechat" ? "微信视频号" : "小红书"}
              </button>
            ))}
          </div>
        </div>

        {/* 账号筛选 */}
        <div className="flex flex-wrap gap-2">
          {accountList.map((a) => (
            <motion.button key={a} whileTap={{ scale: 0.93 }} onClick={() => setAccount(a)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                account === a ? "text-white border-transparent" : "glass-card text-[var(--app-text-secondary)] border-white/60"
              }`}
              style={account === a ? { background: source === "wechat" ? PALETTE.wechat : PALETTE.xhs } : {}}
            >
              {a}
            </motion.button>
          ))}
        </div>

        {/* 气泡图 */}
        <div className="glass-card rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-[var(--app-text)]">涨粉 × 流量 × 互动气泡矩阵</h3>
              <p className="text-[10px] text-[var(--app-text-muted)]">悬停气泡查看详情</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PALETTE.content).map(([name, color]) => (
                <div key={name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-[9px] text-[var(--app-text-muted)]">{name}</span>
                </div>
              ))}
            </div>
          </div>
          <EChart option={bubbleOption} style={{ height: 360 }} />
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-[9px] text-[var(--app-text-muted)]">点击气泡可深挖单条作品详情</span>
            <Link href="/detail">
              <motion.button whileHover={{ x: 2 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-1 text-[10px] font-bold text-[var(--app-primary)]">
                进入作品详情 <ChevronRight size={12} />
              </motion.button>
            </Link>
          </div>
        </div>

        {/* 象限分析 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-4">
            <span className="text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">内容类型分布</span>
            <h4 className="text-sm font-black text-[var(--app-text)] mt-1">{dist[0]?.name}占 {total ? Math.round(dist[0]?.value / total * 100) : 0}%</h4>
            <div className="mt-3 space-y-1.5">
              {dist.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--app-text-muted)] w-12 shrink-0">{d.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-black/5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${total ? (d.value / total) * 100 : 0}%` }}
                      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                      className="h-full rounded-full" style={{ background: PALETTE.content[d.name as keyof typeof PALETTE.content] }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--app-text-secondary)] w-8 text-right">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <span className="text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">账号互动对比</span>
            <h4 className="text-sm font-black text-[var(--app-text)] mt-1">旅行类互动偏强</h4>
            <div className="mt-3 space-y-2">
              {(source === "wechat" ? [...WECHAT_ACCOUNTS] : [...XHS_ACCOUNTS]).map((acct) => {
                const interact = source === "wechat"
                  ? wechatVideos.filter((v) => v.account === acct).reduce((s, v) => s + v.likes + v.comments + v.shares, 0)
                  : xhsNotes.filter((n) => n.account === acct).reduce((s, n) => s + n.likes + n.comments + n.saves, 0);
                return (
                  <div key={acct} className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--app-text-muted)] w-20 shrink-0 truncate">{acct}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-black/5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (interact / 15000) * 100)}%` }}
                        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                        className="h-full rounded-full" style={{ background: source === "wechat" ? PALETTE.wechat : PALETTE.xhs }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--app-text-secondary)] w-12 text-right">
                      {interact >= 1000 ? `${(interact/1000).toFixed(1)}k` : interact}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
