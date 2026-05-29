"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KpiCard } from "./KpiCard";
import { TrendChart } from "./TrendChart";
import { Top10BarChart, Top10MultiBar } from "./RankingCharts";
import { InteractionBucketChart, ContentTypeDonut, WeekdayRadar, BubbleChart } from "./AnalyticsCharts";
import { GenreCompareChart } from "./GenreCompare";
import {
  filterWechat, filterXhs, wechatKpi, xhsKpi,
  WECHAT_ACCOUNTS, XHS_ACCOUNTS, PALETTE,
} from "@/lib/data";
import { accountSummaries } from "@/lib/data/account-summaries";

type Platform = "wechat" | "xhs";

const PLATFORM_LABELS: Record<Platform, string> = {
  wechat:   "微信",
  xhs:      "小红书",
};
const PLATFORM_COLORS: Record<Platform, string> = {
  wechat:   PALETTE.wechat,
  xhs:      PALETTE.xhs,
};

function fmt(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  if (n >= 1000)  return (n / 1000).toFixed(1) + "k";
  return n.toLocaleString("zh-CN");
}

export function DashboardScreen() {
  const [platform, setPlatform] = useState<Platform>("wechat");
  const [wAccount, setWAccount] = useState<string>("全部");
  const [xAccount, setXAccount] = useState<string>("全部");

  const wVideos = filterWechat(wAccount as never);
  const xNotes  = filterXhs(xAccount as never);
  const wKpi = wechatKpi(wVideos);
  const xKpi = xhsKpi(xNotes);

  const isActive = (p: Platform) => platform === p;

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      {/* 背景色彩球 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-80px] left-[-80px] w-96 h-96 rounded-full blob-wechat animate-blob-slow opacity-60" />
        <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full blob-xhs animate-blob-slower opacity-50" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full blob-indigo animate-blob-slow opacity-30" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 pt-6 pb-8 space-y-5">

        {/* 标题行 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[var(--app-text)] tracking-tight">内容运营大屏</h1>
            <p className="text-xs text-[var(--app-text-muted)]">2026-04-01 — 2026-05-28 · 共 58 天</p>
          </div>
          {/* 平台切换 */}
          <div className="glass-card rounded-2xl p-1 flex gap-1">
            {(["wechat", "xhs"] as Platform[]).map((p) => (
              <motion.button
                key={p}
                whileTap={{ scale: 0.94 }}
                onClick={() => setPlatform(p)}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                  isActive(p) ? "text-white" : "text-[var(--app-text-secondary)] hover:text-[var(--app-text)]"
                }`}
              >
                {isActive(p) && (
                  <motion.div
                    layoutId="platform-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: PLATFORM_COLORS[p] }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{PLATFORM_LABELS[p]}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {platform === "wechat" && (
            <motion.div key="wechat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-5">
              {/* 账号筛选 */}
              <AccountBar accounts={["全部", ...WECHAT_ACCOUNTS]} active={wAccount} onChange={setWAccount} color={PALETTE.wechat} />

                  {/* KPI */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <KpiCard label="单日平均播放" value={fmt(wKpi.avgDailyPlays)} sub="播放量 ÷ 58天" trend={14} color={PALETTE.wechat} />
                    <KpiCard label="总点赞数" value={fmt(wKpi.totalLikes)} sub="喜欢字段汇总" trend={9} color="#6366f1" />
                    <KpiCard label="总关注量" value={fmt(wKpi.totalFollowers)} sub="视频号涨粉合计" trend={6} color="#f59e0b" />
                    <KpiCard label="平均完播率" value={wKpi.avgCompletion + "%"} sub="空值行已排除" trend={2} color="#10b981" />
                  </div>

                  {/* 趋势图 */}
                  <div className="glass-card rounded-2xl p-4">
                    <h3 className="text-sm font-bold text-[var(--app-text)] mb-3">每日播放趋势</h3>
                    <TrendChart platform="wechat" account={wAccount} />
                  </div>

                  {/* 排行 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="glass-card rounded-2xl p-4">
                      <Top10BarChart platform="wechat" account={wAccount} />
                    </div>
                    <div className="glass-card rounded-2xl p-4">
                      <Top10MultiBar platform="wechat" account={wAccount} />
                    </div>
                  </div>

                  {/* 分析三列 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card rounded-2xl p-4">
                      <InteractionBucketChart platform="wechat" account={wAccount} />
                    </div>
                    <div className="glass-card rounded-2xl p-4">
                      <ContentTypeDonut platform="wechat" account={wAccount} />
                    </div>
                    <div className="glass-card rounded-2xl p-4">
                      <WeekdayRadar platform="wechat" account={wAccount} />
                    </div>
                  </div>

                  {/* 气泡图 */}
                  <div className="glass-card rounded-2xl p-4">
                    <h3 className="text-sm font-bold text-[var(--app-text)] mb-2">涨粉 × 流量 × 互动气泡图</h3>
                    <BubbleChart platform="wechat" account={wAccount} />
                  </div>

                  {/* 账号运营总结 */}
                  <AccountSummaryCard platform="wechat" account={wAccount} />
            </motion.div>
          )}

          {platform === "xhs" && (
            <motion.div key="xhs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-5">
              <AccountBar accounts={["全部", ...XHS_ACCOUNTS]} active={xAccount} onChange={setXAccount} color={PALETTE.xhs} />

              {/* KPI */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard label="单日平均曝光" value={fmt(xKpi.avgDailyExposure)} sub="曝光量 ÷ 58天" trend={11} color={PALETTE.xhs} />
                <KpiCard label="总点赞数" value={fmt(xKpi.totalLikes)} sub="全量笔记点赞" trend={8} color="#6366f1" />
                <KpiCard label="总涨粉数" value={fmt(xKpi.totalFollowers)} sub="涨粉字段汇总" trend={5} color="#f59e0b" />
                <KpiCard label="平均封面点击率" value={xKpi.avgCtr + "%"} sub="封面点击率均值" trend={1} color="#10b981" />
              </div>

              {/* 趋势图 */}
              <div className="glass-card rounded-2xl p-4">
                <h3 className="text-sm font-bold text-[var(--app-text)] mb-3">每日曝光趋势</h3>
                <TrendChart platform="xhs" account={xAccount} />
              </div>

              {/* 排行 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-4">
                  <Top10BarChart platform="xhs" account={xAccount} />
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <Top10MultiBar platform="xhs" account={xAccount} />
                </div>
              </div>

              {/* 体裁对比 */}
              <div className="glass-card rounded-2xl p-4">
                <h3 className="text-sm font-bold text-[var(--app-text)] mb-2">图文 vs 视频体裁对比</h3>
                <GenreCompareChart account={xAccount} />
              </div>

              {/* 雷达 + 内容类型 (xhs用空状态) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-[10px] text-[var(--app-text-muted)] mb-1">星期维度分析</p>
                  <EmptyChartState label="小红书星期雷达暂时计算中…" />
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-[10px] text-[var(--app-text-muted)] mb-1">涨粉 × 流量气泡图</p>
                  <EmptyChartState label="小红书气泡图暂时计算中…" />
                </div>
              </div>

              {/* 账号运营总结 */}
              <AccountSummaryCard platform="xhs" account={xAccount} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── 账号筛选条 ── */
function AccountBar({ accounts, active, onChange, color }: {
  accounts: string[];
  active: string;
  onChange: (a: string) => void;
  color: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {accounts.map((a) => (
        <motion.button
          key={a}
          whileTap={{ scale: 0.93 }}
          onClick={() => onChange(a)}
          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
            active === a
              ? "text-white border-transparent shadow-sm"
              : "glass-card text-[var(--app-text-secondary)] border-white/60 hover:border-white"
          }`}
          style={active === a ? { background: color } : {}}
        >
          {a}
        </motion.button>
      ))}
    </div>
  );
}

/* ── 账号运营总结 ── */
function AccountSummaryCard({ platform, account }: { platform: "wechat" | "xhs"; account: string }) {
  const summaries = accountSummaries.filter(
    (s) => s.platform === platform && (account === "全部" || s.account === account)
  );
  if (!summaries.length) return null;

  return (
    <div className="space-y-3">
      {summaries.map((s) => (
        <div key={s.account} className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-bold text-[var(--app-text)] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: platform === "wechat" ? PALETTE.wechat : PALETTE.xhs }} />
            {s.account} · 运营小结
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] font-bold text-green-600 mb-1.5">做得好的</p>
              <ul className="space-y-1">
                {s.good.map((t, i) => (
                  <li key={i} className="text-[11px] text-[var(--app-text-secondary)] leading-relaxed flex gap-1.5">
                    <span className="text-green-500 shrink-0">+</span>{t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-500 mb-1.5">待改进的</p>
              <ul className="space-y-1">
                {s.bad.map((t, i) => (
                  <li key={i} className="text-[11px] text-[var(--app-text-secondary)] leading-relaxed flex gap-1.5">
                    <span className="text-red-400 shrink-0">!</span>{t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-600 mb-1.5">下一步方向</p>
              <ul className="space-y-1">
                {s.next.map((t, i) => (
                  <li key={i} className="text-[11px] text-[var(--app-text-secondary)] leading-relaxed flex gap-1.5">
                    <span className="text-blue-400 shrink-0">→</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyChartState({ label }: { label: string }) {
  return (
    <div className="h-40 flex items-center justify-center">
      <span className="text-xs text-[var(--app-text-muted)]">{label}</span>
    </div>
  );
}
