import realData from "./real-wechat-data.json";
import xhsRealData from "./xhs-real.json";
import kuaishouRealData from "./kuaishou-real.json";
import douyinRealData from "./douyin-real.json";
import mpRealData from "./mp-real.json";

// ── 日期工具
function dateToWeekday(dateStr: string): number {
  return new Date(dateStr + "T00:00:00Z").getUTCDay();
}

// ── 内容类型打标
export type ContentType = "菌菇类" | "旅行类" | "虫草类" | "其他";

const CORDYCEPS = ["虫草", "冬虫夏草"];
const TRAVEL = ["冈仁波齐", "转山", "布达拉宫", "拉萨", "西藏", "高原", "羊卓雍错", "浪措"];
const MUSHROOM = ["荔枝菌", "菌", "野生菌", "牛肝菌", "松茸", "竹荪", "见手青", "青头菌", "鸡枞", "红菇", "月子菇", "干巴菌", "羊肚菌"];

function tagContent(text: string): ContentType {
  if (CORDYCEPS.some((k) => text.includes(k))) return "虫草类";
  if (TRAVEL.some((k) => text.includes(k))) return "旅行类";
  if (MUSHROOM.some((k) => text.includes(k))) return "菌菇类";
  return "其他";
}

// ── 类型定义
export interface WechatVideo {
  account: string;
  desc: string;
  plays: number;
  likes: number;
  comments: number;
  shares: number;
  followers: number;
  completion: number | null;
  avgDuration: number;
  publishDate: string;
  weekday: number;
  contentType: ContentType;
}

export interface XhsNote {
  account: string;
  exposure: number;
  views: number;
  ctr: number;
  likes: number;
  comments: number;
  saves: number;
  followers: number;
  shares: number;
  avgDuration: number;
  genre: "图文" | "视频";
  publishDate: string;
  weekday: number;
  contentType: ContentType;
}

type WechatVideoSource = {
  account: string; desc: string; publishDate: string;
  plays: number; likes: number; comments: number;
  shares: number; followers: number;
  completion: number | null; avgDuration: number;
};

type XhsNoteSource = {
  account: string; title: string; publishDate: string; exposure: number; views: number;
  ctr: number; likes: number; comments: number; saves: number;
  followers: number; shares: number; avgDuration: number; genre: "图文" | "视频";
};

const wechatSourceRows = realData as WechatVideoSource[];
const xhsSourceRows = xhsRealData as XhsNoteSource[];

const WECHAT_ACCOUNT_ORDER = ["滋元堂滋补", "滋元堂专注", "老黄", "菌语", "此山中", "cheat-视频号-未匹配01"];
const XHS_ACCOUNT_ORDER = ["黄师傅", "18", "菇菇", "二胎妈"];

function orderedAccounts(rows: { account: string }[], preferred: string[]): string[] {
  const names = new Set(rows.map((r) => r.account));
  const ordered = preferred.filter((name) => names.has(name));
  const extra = [...names].filter((name) => !preferred.includes(name)).sort((a, b) => a.localeCompare(b, "zh-CN"));
  return [...ordered, ...extra];
}

function daysInclusive(start: string, end: string): number {
  const startMs = new Date(start + "T00:00:00Z").getTime();
  const endMs = new Date(end + "T00:00:00Z").getTime();
  return Math.max(1, Math.round((endMs - startMs) / 86400000) + 1);
}

function dateWindow(rows: { publishDate: string }[]): { start: string; end: string; span: number } {
  const dates = rows.map((r) => r.publishDate).filter(Boolean).sort();
  const start = dates[0] || "2026-04-01";
  const end = dates[dates.length - 1] || start;
  return { start, end, span: daysInclusive(start, end) };
}

// ── 真实微信数据
export const wechatVideos: WechatVideo[] = wechatSourceRows.map((r) => ({
  ...r,
  weekday: dateToWeekday(r.publishDate),
  contentType: tagContent(r.desc),
}));

const WINDOW = dateWindow([...wechatSourceRows, ...xhsSourceRows]);
export const DATE_START = WINDOW.start;
export const DATE_END   = WINDOW.end;
export const DATE_SPAN  = WINDOW.span;
export const WECHAT_ACCOUNTS = orderedAccounts(wechatSourceRows, WECHAT_ACCOUNT_ORDER);
export const XHS_ACCOUNTS    = orderedAccounts(xhsSourceRows, XHS_ACCOUNT_ORDER);
export const CONTENT_TYPES: ContentType[] = ["菌菇类", "旅行类", "虫草类", "其他"];
export const WEEKDAY_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export const PALETTE = {
  wechat: "#07C160", xhs: "#FF2442", gzh: "#07C160", douyin: "#1a1a1a", kuaishou: "#FF6600",
  echarts: ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#0ea5e9"],
  content: { "菌菇类": "#10b981", "旅行类": "#6366f1", "虫草类": "#f59e0b", "其他": "#a8a29e" } as Record<ContentType, string>,
};

// ── 工具函数
export function filterWechat(account: string): WechatVideo[] {
  if (account === "全部") return wechatVideos;
  return wechatVideos.filter((v) => v.account === account);
}
export function filterXhs(account: string): XhsNote[] {
  if (account === "全部") return xhsNotes;
  return xhsNotes.filter((n) => n.account === account);
}
export function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  for (let d = new Date(s); d <= e; d.setUTCDate(d.getUTCDate() + 1))
    dates.push(d.toISOString().slice(0, 10));
  return dates;
}
export function dailyPlays(videos: WechatVideo[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const v of videos) map[v.publishDate] = (map[v.publishDate] || 0) + v.plays;
  return map;
}
export function dailyExposure(notes: XhsNote[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const n of notes) map[n.publishDate] = (map[n.publishDate] || 0) + n.exposure;
  return map;
}
export const PLAY_BUCKETS = [
  { label: "0-100", min: 0, max: 100 },
  { label: "100-500", min: 100, max: 500 },
  { label: "500-1k", min: 500, max: 1000 },
  { label: "1k-5k", min: 1000, max: 5000 },
  { label: "5k+", min: 5000, max: Infinity },
];
export function interactionByBucket(videos: WechatVideo[]) {
  return PLAY_BUCKETS.map((b) => {
    const g = videos.filter((v) => v.plays >= b.min && v.plays < b.max);
    if (!g.length) return { label: b.label, likeRate: 0, commentRate: 0, shareRate: 0 };
    const tp = g.reduce((s, v) => s + v.plays, 0);
    return {
      label: b.label,
      likeRate:    +((g.reduce((s, v) => s + v.likes, 0) / tp) * 100).toFixed(2),
      commentRate: +((g.reduce((s, v) => s + v.comments, 0) / tp) * 100).toFixed(2),
      shareRate:   +((g.reduce((s, v) => s + v.shares, 0) / tp) * 100).toFixed(2),
    };
  });
}
export function contentTypeDistribution(videos: WechatVideo[]) {
  const map: Record<ContentType, number> = { "菌菇类": 0, "旅行类": 0, "虫草类": 0, "其他": 0 };
  for (const v of videos) map[v.contentType]++;
  return CONTENT_TYPES.map((t) => ({ name: t, value: map[t] }));
}
export function weekdayStats(videos: WechatVideo[]) {
  const days = Array.from({ length: 7 }, () => ({ count: 0, plays: 0, interactions: 0 }));
  for (const v of videos) {
    days[v.weekday].count++;
    days[v.weekday].plays += v.plays;
    days[v.weekday].interactions += v.likes + v.comments + v.shares;
  }
  return days.map((d, i) => ({
    label: WEEKDAY_LABELS[i], count: d.count,
    avgPlays: d.count ? Math.round(d.plays / d.count) : 0,
    avgInteractions: d.count ? Math.round(d.interactions / d.count) : 0,
  }));
}
export function wechatKpi(videos: WechatVideo[]) {
  const totalPlays = videos.reduce((s, v) => s + v.plays, 0);
  const validComp  = videos.filter((v) => v.completion !== null);
  return {
    avgDailyPlays:  Math.round(totalPlays / DATE_SPAN),
    totalLikes:     videos.reduce((s, v) => s + v.likes, 0),
    totalFollowers: videos.reduce((s, v) => s + v.followers, 0),
    avgCompletion:  validComp.length ? +(validComp.reduce((s, v) => s + v.completion!, 0) / validComp.length).toFixed(1) : 0,
  };
}
export function xhsKpi(notes: XhsNote[]) {
  return {
    avgDailyExposure: Math.round(notes.reduce((s, n) => s + n.exposure, 0) / DATE_SPAN),
    totalLikes:       notes.reduce((s, n) => s + n.likes, 0),
    totalFollowers:   notes.reduce((s, n) => s + n.followers, 0),
    avgCtr:           notes.length ? +(notes.reduce((s, n) => s + n.ctr, 0) / notes.length).toFixed(2) : 0,
  };
}
export function xhsGenreComparison(notes: XhsNote[]) {
  return (["图文", "视频"] as const).map((g) => {
    const group = notes.filter((n) => n.genre === g);
    if (!group.length) return { genre: g, avgViews: 0, likeRate: 0, followerRate: 0 };
    const tv = group.reduce((s, n) => s + n.views, 0);
    return {
      genre: g,
      avgViews:     Math.round(tv / group.length),
      likeRate:     tv ? +(group.reduce((s, n) => s + n.likes, 0) / tv * 100).toFixed(2) : 0,
      followerRate: tv ? +(group.reduce((s, n) => s + n.followers, 0) / tv * 100).toFixed(3) : 0,
    };
  });
}

// ── 小红书真实数据 ────────────────────────────────────
export const xhsNotes: XhsNote[] = xhsSourceRows.map((r) => ({
  account: r.account,
  exposure: r.exposure, views: r.views, ctr: r.ctr,
  likes: r.likes, comments: r.comments, saves: r.saves,
  followers: r.followers, shares: r.shares, avgDuration: r.avgDuration,
  genre: r.genre, publishDate: r.publishDate,
  weekday: dateToWeekday(r.publishDate),
  contentType: tagContent(r.title),
}));

// ── 快手真实数据 ──────────────────────────────────────
export interface KuaishouPost {
  desc: string; publishDate: string; plays: number;
  completion: number | null; comments: number; likes: number;
  saves: number; followers: number; weekday: number; contentType: ContentType;
}
export const kuaishouPosts: KuaishouPost[] = (kuaishouRealData as {
  desc: string; publishDate: string; plays: number;
  completion: number | null; comments: number; likes: number;
  saves: number; followers: number;
}[]).map((r) => ({
  ...r,
  weekday: dateToWeekday(r.publishDate),
  contentType: tagContent(r.desc),
}));

// ── 抖音真实数据（日维度）────────────────────────────
export interface DouyinDay {
  date: string; plays: number; homeVisits: number; likes: number;
  shares: number; comments: number; ctr: number; netFans: number; totalFans: number;
}
export const douyinDays: DouyinDay[] = douyinRealData as DouyinDay[];

// ── 公众号真实数据（日维度）──────────────────────────
export interface MpDay {
  date: string; reads: number; shares: number; collects: number; posts: number;
}
export const mpDays: MpDay[] = mpRealData as MpDay[];

// ── 快手 KPI ──────────────────────────────────────────
export function kuaishouKpi(posts: KuaishouPost[]) {
  const totalPlays = posts.reduce((s, p) => s + p.plays, 0);
  const validComp  = posts.filter((p) => p.completion !== null);
  return {
    totalPlays,
    avgDailyPlays: Math.round(totalPlays / DATE_SPAN),
    totalLikes:    posts.reduce((s, p) => s + p.likes, 0),
    totalFollowers:posts.reduce((s, p) => s + p.followers, 0),
    avgCompletion: validComp.length
      ? +(validComp.reduce((s, p) => s + p.completion!, 0) / validComp.length).toFixed(1)
      : 0,
  };
}

// ── 抖音 KPI ──────────────────────────────────────────
export function douyinKpi(days: DouyinDay[]) {
  const activeDays = days.filter((d) => d.plays > 0);
  return {
    totalPlays:    days.reduce((s, d) => s + d.plays, 0),
    totalLikes:    days.reduce((s, d) => s + d.likes, 0),
    totalFans:     days.length ? days[days.length - 1].totalFans : 0,
    avgDailyPlays: activeDays.length
      ? Math.round(days.reduce((s, d) => s + d.plays, 0) / activeDays.length)
      : 0,
  };
}

// ── 公众号 KPI ────────────────────────────────────────
export function mpKpi(days: MpDay[]) {
  return {
    totalReads:   days.reduce((s, d) => s + d.reads, 0),
    totalShares:  days.reduce((s, d) => s + d.shares, 0),
    totalCollects:days.reduce((s, d) => s + d.collects, 0),
    totalPosts:   days.reduce((s, d) => s + d.posts, 0),
  };
}
