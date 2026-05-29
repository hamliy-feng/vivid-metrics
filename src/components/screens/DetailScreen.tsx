"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Zap } from "lucide-react";
import { wechatVideos, xhsNotes, PALETTE } from "@/lib/data";
import type { WechatVideo, XhsNote } from "@/lib/data";

function fmt(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  if (n >= 1000)  return (n / 1000).toFixed(1) + "k";
  return n.toLocaleString("zh-CN");
}

export function DetailScreen() {
  const params = useSearchParams();
  const rank   = parseInt(params.get("rank") || "1");
  const source = (params.get("source") || "wechat") as "wechat" | "xhs";

  let video: WechatVideo | null = null;
  let note:  XhsNote | null = null;

  if (source === "wechat") {
    const sorted = [...wechatVideos].sort((a, b) => b.plays - a.plays);
    video = sorted[rank - 1] || sorted[0];
  } else {
    const sorted = [...xhsNotes].sort((a, b) => b.views - a.views);
    note = sorted[rank - 1] || sorted[0];
  }

  const title   = video ? video.desc    : note ? `${note.account} · ${note.genre}` : "";
  const primary = video ? video.plays   : note?.views ?? 0;
  const likes   = video ? video.likes   : note?.likes ?? 0;
  const comments = video ? video.comments : note?.comments ?? 0;
  const shares  = video ? video.shares  : note?.shares ?? 0;
  const follows = video ? video.followers : note?.followers ?? 0;
  const date    = video ? video.publishDate : note?.publishDate ?? "";
  const completion = video?.completion;
  const ctr     = note?.ctr;
  const color   = source === "wechat" ? PALETTE.wechat : PALETTE.xhs;

  const interactRate = primary > 0 ? ((likes + comments + shares) / primary * 100).toFixed(2) : "0";
  const followerRate = primary > 0 ? (follows / primary * 100).toFixed(3) : "0";

  const METRICS = [
    { label: source === "wechat" ? "播放量" : "观看量", value: fmt(primary), color },
    { label: "点赞",   value: fmt(likes),    color: "#6366f1" },
    { label: "评论",   value: fmt(comments), color: "#f59e0b" },
    { label: "分享",   value: fmt(shares),   color: "#10b981" },
    { label: "涨粉",   value: fmt(follows),  color: "#8b5cf6" },
    { label: source === "wechat" ? "完播率" : "封面CTR",
      value: video ? (completion !== null ? completion + "%" : "—") : (ctr + "%"),
      color: "#0ea5e9" },
  ];

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-[-60px] w-72 h-72 rounded-full blob-wechat animate-blob-slow opacity-35" />
      </div>

      <div className="relative z-10 max-w-[800px] mx-auto px-4 pt-6 pb-8 space-y-5">
        {/* 返回 */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 text-xs font-bold text-[var(--app-text-secondary)] hover:text-[var(--app-primary)]"
            >
              <ChevronLeft size={16} /> 返回仪表盘
            </motion.button>
          </Link>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: color + "20", color }}>
            排名 #{rank} · {source === "wechat" ? "微信视频号" : "小红书"}
          </span>
        </div>

        {/* 标题卡 */}
        <div className="glass-card rounded-3xl p-5">
          <p className="text-[10px] font-bold mb-1" style={{ color }}>{source === "wechat" ? "微信视频号" : "小红书"} · {video?.account || note?.account}</p>
          <h1 className="text-lg font-black text-[var(--app-text)] leading-tight">{title}</h1>
          <p className="text-xs text-[var(--app-text-muted)] mt-1">发布日期：{date}</p>
        </div>

        {/* 指标网格 */}
        <div className="grid grid-cols-3 gap-3">
          {METRICS.map((m) => (
            <motion.div key={m.label} whileHover={{ y: -2 }} className="glass-card rounded-2xl p-3 text-center">
              <div className="text-xl font-black" style={{ color: m.color }}>{m.value}</div>
              <div className="text-[10px] text-[var(--app-text-muted)] mt-0.5">{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* 互动效率 */}
        <div className="glass-card rounded-2xl p-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-[var(--app-text-muted)] uppercase font-bold">互动转化率</p>
            <div className="text-2xl font-black text-[var(--app-text)] mt-1">{interactRate}%</div>
            <div className="mt-2 h-1.5 rounded-full bg-black/5 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, parseFloat(interactRate) * 15)}%` }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                className="h-full rounded-full" style={{ background: color }}
              />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-[var(--app-text-muted)] uppercase font-bold">粉丝转化率</p>
            <div className="text-2xl font-black text-[var(--app-text)] mt-1">{followerRate}%</div>
            <div className="mt-2 h-1.5 rounded-full bg-black/5 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, parseFloat(followerRate) * 50)}%` }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                className="h-full rounded-full" style={{ background: "#8b5cf6" }}
              />
            </div>
          </div>
        </div>

        {/* 策略建议 */}
        <div className="rounded-3xl p-5 text-white relative overflow-hidden" style={{ background: "#1c1917" }}>
          <div className="absolute right-0 bottom-0 w-40 h-40 rounded-full blur-3xl" style={{ background: color + "30" }} />
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <Zap size={16} style={{ color }} />
            <span className="text-xs font-bold" style={{ color }}>策略洞察</span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed relative z-10">
            {video
              ? `该视频${completion !== null ? `完播率 ${completion}%，` : ""}互动转化率 ${interactRate}%。${
                  parseFloat(interactRate) > 5
                    ? "互动表现优秀，建议投放 DOU+ 放大曝光。"
                    : "可在15秒节点加强冲突感，提升观看完成度。"
                }`
              : `该笔记封面点击率 ${ctr}%，${
                  ctr && ctr > 5
                    ? "封面吸引力强，建议增加该账号该类型内容占比。"
                    : "建议优化封面文案和配色，提升点击率。"
                }`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
