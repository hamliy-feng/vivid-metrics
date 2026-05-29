"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart2 } from "lucide-react";
import { wechatVideos, xhsNotes, PALETTE } from "@/lib/data";
import type { WechatVideo, XhsNote } from "@/lib/data";

type Metric = "plays" | "interaction";
type Source = "wechat" | "xhs";

function fmt(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  if (n >= 1000)  return (n / 1000).toFixed(1) + "k";
  return n.toLocaleString("zh-CN");
}

const RANK_COLORS = ["#FF2442", "#f59e0b", "#10b981"];

export default function RankingsPage() {
  const [metric, setMetric] = useState<Metric>("plays");
  const [source, setSource] = useState<Source>("wechat");

  type RankItem = { id: number; title: string; sub: string; primary: number; secondary: string; account: string };

  let items: RankItem[] = [];
  if (source === "wechat") {
    const sorted = [...wechatVideos].sort((a, b) =>
      metric === "plays" ? b.plays - a.plays : (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)
    ).slice(0, 15);
    items = sorted.map((v: WechatVideo, i) => ({
      id: i + 1,
      title: v.desc,
      sub: `${v.account} · ${v.contentType} · ${v.publishDate}`,
      primary: metric === "plays" ? v.plays : v.likes + v.comments + v.shares,
      secondary: v.completion !== null ? `完播 ${v.completion}%` : `涨粉 ${v.followers}`,
      account: v.account,
    }));
  } else {
    const sorted = [...xhsNotes].sort((a, b) =>
      metric === "plays" ? b.views - a.views : (b.likes + b.comments + b.saves) - (a.likes + a.comments + a.saves)
    ).slice(0, 15);
    items = sorted.map((n: XhsNote, i) => ({
      id: i + 1,
      title: `${n.account} · ${n.genre}`,
      sub: `${n.account} · ${n.publishDate}`,
      primary: metric === "plays" ? n.views : n.likes + n.comments + n.saves,
      secondary: `封面点击 ${n.ctr}%`,
      account: n.account,
    }));
  }

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 right-[-80px] w-80 h-80 rounded-full blob-xhs animate-blob-slow opacity-40" />
        <div className="absolute bottom-1/4 left-[-60px] w-72 h-72 rounded-full blob-wechat animate-blob-slower opacity-30" />
      </div>

      <div className="relative z-10 max-w-[900px] mx-auto px-4 pt-6 pb-8 space-y-5">
        {/* 头部 */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-black text-[var(--app-text)] flex items-center gap-2">
              <BarChart2 size={20} className="text-[var(--app-primary)]" />
              内容排行榜
            </h1>
            <p className="text-xs text-[var(--app-text-muted)]">按单项指标排序，点击条目查看详情</p>
          </div>
          {/* 控件组 */}
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            {/* 来源切换 */}
            <div className="glass-card rounded-xl p-0.5 flex">
              {(["wechat", "xhs"] as Source[]).map((s) => (
                <button key={s} onClick={() => setSource(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    source === s ? "text-white shadow-sm" : "text-[var(--app-text-secondary)]"
                  }`}
                  style={source === s ? { background: s === "wechat" ? PALETTE.wechat : PALETTE.xhs } : {}}
                >
                  {s === "wechat" ? "微信视频号" : "小红书"}
                </button>
              ))}
            </div>
            {/* 指标切换 */}
            <div className="glass-card rounded-xl p-0.5 flex">
              {([["plays", "播放量"], ["interaction", "互动总量"]] as [Metric, string][]).map(([m, label]) => (
                <button key={m} onClick={() => setMetric(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    metric === m ? "bg-white text-[var(--app-text)] shadow-sm" : "text-[var(--app-text-muted)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 排行列表 */}
        <div className="space-y-2">
          {items.map((item, idx) => (
            <motion.div
              key={`${source}-${metric}-${item.id}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.25 }}
            >
              <Link href={`/detail?rank=${item.id}&source=${source}`} className="block" prefetch={false}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card rounded-2xl p-3 flex items-center gap-3 cursor-pointer"
                >
                  {/* 排名徽章 */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                    style={{
                      background: idx < 3 ? RANK_COLORS[idx] + "20" : "rgba(0,0,0,0.04)",
                      color: idx < 3 ? RANK_COLORS[idx] : "var(--app-text-muted)",
                    }}
                  >
                    {item.id}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--app-text)] truncate">{item.title}</p>
                    <p className="text-[10px] text-[var(--app-text-muted)] truncate">{item.sub}</p>
                  </div>

                  {/* 数值 */}
                  <div className="text-right shrink-0 min-w-[56px]">
                    <div className="text-sm font-black text-[var(--app-text)]">{fmt(item.primary)}</div>
                    <div
                      className="text-[10px] font-semibold"
                      style={{ color: source === "wechat" ? PALETTE.wechat : PALETTE.xhs }}
                    >
                      {item.secondary}
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
