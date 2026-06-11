"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { TrendChart } from "./TrendChart";
import { Top10BarChart, Top10MultiBar } from "./RankingCharts";
import { InteractionBucketChart, ContentTypeDonut, WeekdayRadar, BubbleChart } from "./AnalyticsCharts";
import { GenreCompareChart } from "./GenreCompare";
import {
  filterWechat, filterWechatTraffic, filterXhs, wechatKpi, xhsKpi,
  DATE_END, DATE_SPAN, DATE_START,
  WECHAT_ACCOUNTS, XHS_ACCOUNTS, PALETTE,
} from "@/lib/data";
import { accountSummaries } from "@/lib/data/account-summaries";

type Platform = "wechat" | "xhs";
type TimeWindow = "1d" | "7d" | "30d";

const TIME_WINDOWS: Array<{ value: TimeWindow; label: string; days: number }> = [
  { value: "1d", label: "最新一日", days: 1 },
  { value: "7d", label: "近7天", days: 7 },
  { value: "30d", label: "近30天", days: 30 },
];
const WECHAT_DELTA_START = "2026-06-11";

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

function subtractDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function shortDateLabel(dateStr: string): string {
  const [, month, day] = dateStr.split("-").map(Number);
  return `${month}月${day}日`;
}

function previousDate(dateStr: string): string {
  return subtractDays(dateStr, 1);
}

function resolveTimeWindow(window: TimeWindow) {
  const config = TIME_WINDOWS.find((item) => item.value === window) ?? TIME_WINDOWS[0];
  const start = subtractDays(DATE_END, config.days - 1);
  return {
    ...config,
    label: config.value === "1d" ? shortDateLabel(DATE_END) : config.label,
    start: start < DATE_START ? DATE_START : start,
    end: DATE_END,
  };
}

function metricDate(row: { publishDate: string; metricDate?: string }): string {
  return row.metricDate || row.publishDate;
}

function filterByDate<T extends { publishDate: string; metricDate?: string }>(rows: T[], start: string, end: string): T[] {
  return rows.filter((row) => {
    const date = metricDate(row);
    return date >= start && date <= end;
  });
}

function rangeText(start: string, end: string, label: string): string {
  return start === end ? `${label} · ${end}` : `${label} · ${start} — ${end}`;
}

function resolveWechatWindowRows({
  window,
  start,
  end,
  publishedRows,
  trafficRows,
}: {
  window: TimeWindow;
  start: string;
  end: string;
  publishedRows: ReturnType<typeof filterWechat>;
  trafficRows: ReturnType<typeof filterWechatTraffic>;
}) {
  const publishedWindow = filterByDate(publishedRows, start, end);
  const trafficWindow = filterByDate(trafficRows, start, end);

  if (window === "1d") {
    return {
      rows: trafficWindow.length ? trafficWindow : publishedWindow,
      mode: trafficWindow.length ? "区间差值增量" : "按发布时间",
    };
  }

  if (window === "7d") {
    const backfillEnd = previousDate(WECHAT_DELTA_START);
    const backfillRows = start <= backfillEnd
      ? filterByDate(publishedRows, start, backfillEnd < end ? backfillEnd : end)
      : [];
    const deltaRows = end >= WECHAT_DELTA_START
      ? filterByDate(trafficRows, WECHAT_DELTA_START > start ? WECHAT_DELTA_START : start, end)
      : [];

    if (deltaRows.length) {
      return {
        rows: [...backfillRows, ...deltaRows],
        mode: `${shortDateLabel(WECHAT_DELTA_START)}起差值累加`,
      };
    }
  }

  return {
    rows: publishedWindow,
    mode: window === "30d" ? "30天总和" : "按发布时间",
  };
}

export function DashboardScreen() {
  const [platform, setPlatform] = useState<Platform>("wechat");
  const [wAccount, setWAccount] = useState<string>("全部");
  const [xAccount, setXAccount] = useState<string>("全部");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("1d");

  const selectedRange = useMemo(() => resolveTimeWindow(timeWindow), [timeWindow]);
  const selectedRangeText = rangeText(selectedRange.start, selectedRange.end, selectedRange.label);

  const wBaseVideos = useMemo(() => filterWechat(wAccount as never), [wAccount]);
  const wBaseTrafficVideos = useMemo(() => filterWechatTraffic(wAccount as never), [wAccount]);
  const xBaseNotes = useMemo(() => filterXhs(xAccount as never), [xAccount]);
  const wechatWindow = useMemo(
    () => resolveWechatWindowRows({
      window: timeWindow,
      start: selectedRange.start,
      end: selectedRange.end,
      publishedRows: wBaseVideos,
      trafficRows: wBaseTrafficVideos,
    }),
    [timeWindow, selectedRange.start, selectedRange.end, wBaseVideos, wBaseTrafficVideos],
  );
  const wVideos = wechatWindow.rows;
  const xNotes = useMemo(
    () => filterByDate(xBaseNotes, selectedRange.start, selectedRange.end),
    [xBaseNotes, selectedRange.start, selectedRange.end],
  );
  const wKpi = wechatKpi(wVideos);
  const xKpi = xhsKpi(xNotes);
  const totalWechatViews = wVideos.reduce((sum, video) => sum + video.plays, 0);
  const totalXhsViews = xNotes.reduce((sum, note) => sum + note.views, 0);
  const wechatRangeText = `${selectedRangeText} · ${wechatWindow.mode}`;

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
            <p className="text-xs text-[var(--app-text-muted)]">{DATE_START} — {DATE_END} · 共 {DATE_SPAN} 天</p>
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
              {/* 时间与账号筛选 */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <TimeWindowBar active={timeWindow} onChange={setTimeWindow} color={PALETTE.wechat} />
                <AccountBar accounts={["全部", ...WECHAT_ACCOUNTS]} active={wAccount} onChange={setWAccount} color={PALETTE.wechat} />
              </div>

                  {/* KPI */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <KpiCard label="总浏览量" value={fmt(totalWechatViews)} sub={wechatRangeText} trend={14} color={PALETTE.wechat} />
                    <KpiCard label="总点赞数" value={fmt(wKpi.totalLikes)} sub="当前窗口喜欢汇总" trend={9} color="#6366f1" />
                    <KpiCard label="总关注量" value={fmt(wKpi.totalFollowers)} sub="当前窗口涨粉合计" trend={6} color="#f59e0b" />
                    <CompletionProgressCard value={wKpi.avgCompletion} />
                  </div>

                  {/* 趋势图 */}
                  <div className="glass-card rounded-2xl p-4">
                    <h3 className="text-sm font-bold text-[var(--app-text)] mb-3">每日浏览趋势</h3>
                    <TrendChart platform="wechat" account={wAccount} videos={wVideos} startDate={selectedRange.start} endDate={selectedRange.end} />
                  </div>

                  {/* 排行 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="glass-card rounded-2xl p-4">
                      <Top10BarChart platform="wechat" account={wAccount} videos={wVideos} />
                    </div>
                    <div className="glass-card rounded-2xl p-4">
                      <Top10MultiBar platform="wechat" account={wAccount} videos={wVideos} />
                    </div>
                  </div>

                  {/* 分析三列 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card rounded-2xl p-4">
                      <InteractionBucketChart platform="wechat" account={wAccount} videos={wVideos} />
                    </div>
                    <div className="glass-card rounded-2xl p-4">
                      <ContentTypeDonut platform="wechat" account={wAccount} videos={wVideos} />
                    </div>
                    <div className="glass-card rounded-2xl p-4">
                      <WeekdayRadar platform="wechat" account={wAccount} videos={wVideos} />
                    </div>
                  </div>

                  {/* 气泡图 */}
                  <div className="glass-card rounded-2xl p-4">
                    <h3 className="text-sm font-bold text-[var(--app-text)] mb-2">涨粉 × 流量 × 互动气泡图</h3>
                    <BubbleChart platform="wechat" account={wAccount} videos={wVideos} />
                  </div>

                  {/* 账号运营总结 */}
                  <AccountSummaryCard platform="wechat" account={wAccount} />
            </motion.div>
          )}

          {platform === "xhs" && (
            <motion.div key="xhs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <TimeWindowBar active={timeWindow} onChange={setTimeWindow} color={PALETTE.xhs} />
                <AccountBar accounts={["全部", ...XHS_ACCOUNTS]} active={xAccount} onChange={setXAccount} color={PALETTE.xhs} />
              </div>

              {/* KPI */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard label="总观看量" value={fmt(totalXhsViews)} sub={selectedRangeText} trend={11} color={PALETTE.xhs} />
                <KpiCard label="总点赞数" value={fmt(xKpi.totalLikes)} sub="当前窗口笔记点赞" trend={8} color="#6366f1" />
                <KpiCard label="总涨粉数" value={fmt(xKpi.totalFollowers)} sub="当前窗口涨粉合计" trend={5} color="#f59e0b" />
                <KpiCard label="平均封面点击率" value={xKpi.avgCtr + "%"} sub="封面点击率均值" trend={1} color="#10b981" />
              </div>

              {/* 趋势图 */}
              <div className="glass-card rounded-2xl p-4">
                <h3 className="text-sm font-bold text-[var(--app-text)] mb-3">每日观看趋势</h3>
                <TrendChart platform="xhs" account={xAccount} notes={xNotes} startDate={selectedRange.start} endDate={selectedRange.end} />
              </div>

              {/* 排行 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-4">
                  <Top10BarChart platform="xhs" account={xAccount} notes={xNotes} />
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <Top10MultiBar platform="xhs" account={xAccount} notes={xNotes} />
                </div>
              </div>

              {/* 体裁对比 */}
              <div className="glass-card rounded-2xl p-4">
                <h3 className="text-sm font-bold text-[var(--app-text)] mb-2">图文 vs 视频体裁对比</h3>
                <GenreCompareChart account={xAccount} notes={xNotes} />
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
const COMPLETION_BANDS = [
  { min: 0, max: 20, color: "#ef4444", label: "<20%" },
  { min: 20, max: 30, color: "#f59e0b", label: "20-30%" },
  { min: 30, max: 40, color: "#10b981", label: "30-40%" },
  { min: 40, max: 50, color: "#0ea5e9", label: "40-50%" },
  { min: 50, max: 60, color: "#8b5cf6", label: "50-60%" },
];

function completionColor(value: number): string {
  if (value < 20) return "#ef4444";
  if (value < 30) return "#f59e0b";
  if (value < 40) return "#10b981";
  if (value < 50) return "#0ea5e9";
  return "#8b5cf6";
}

function CompletionProgressCard({ value }: { value: number }) {
  const color = completionColor(value);
  const width = Math.max(0, Math.min(100, value));

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 16px 48px rgba(0,0,0,0.10)" }}
      whileTap={{ scale: 0.97 }}
      className="glass-card rounded-2xl p-4 flex flex-col gap-2 cursor-pointer overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--app-text-muted)]">平均完播率</span>
        <div className="flex items-center gap-1">
          {COMPLETION_BANDS.map((band) => {
            const active = (value >= band.min && value < band.max) || (band.max === 60 && value >= band.max);
            return (
              <span
                key={band.label}
                title={band.label}
                className={`h-2.5 w-2.5 rounded-full border border-white/70 shadow-sm transition-opacity ${active ? "opacity-100" : "opacity-35"}`}
                style={{ background: band.color, boxShadow: active ? `0 0 12px ${band.color}77` : undefined }}
              />
            );
          })}
        </div>
      </div>
      <div className="text-2xl font-black tracking-tight" style={{ color }}>{value}%</div>
      <div className="h-2 rounded-full bg-white/55 border border-white/70 overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            boxShadow: `0 0 18px ${color}77`,
          }}
        />
      </div>
      <p className="text-[10px] text-[var(--app-text-muted)]">空值行已排除 · 100%进度</p>
    </motion.div>
  );
}

function TimeWindowBar({ active, onChange, color }: {
  active: TimeWindow;
  onChange: (value: TimeWindow) => void;
  color: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-1 flex w-fit gap-1">
      {TIME_WINDOWS.map((item) => (
        <motion.button
          key={item.value}
          whileTap={{ scale: 0.94 }}
          onClick={() => onChange(item.value)}
          className={`relative min-w-[84px] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
            active === item.value ? "text-white" : "text-[var(--app-text-secondary)] hover:text-[var(--app-text)]"
          }`}
        >
          {active === item.value && (
            <motion.div
              layoutId="time-window-pill"
              className="absolute inset-0 rounded-xl"
              style={{ background: color }}
              transition={{ type: "spring", bounce: 0.28, duration: 0.35 }}
            />
          )}
          <CalendarDays size={12} className="relative z-10" />
          <span className="relative z-10">{item.value === "1d" ? shortDateLabel(DATE_END) : item.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

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
