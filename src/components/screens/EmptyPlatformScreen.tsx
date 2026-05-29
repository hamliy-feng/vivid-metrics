"use client";

import React from "react";

interface ChartPlaceholder {
  label: string;
  type: "bar" | "line" | "pie" | "radar" | "bubble" | "multi";
  size: "full" | "half" | "third";
}

const DOUYIN_CHARTS: ChartPlaceholder[] = [
  { label: "每日播放趋势", type: "line",   size: "full"  },
  { label: "前10播放排行", type: "bar",    size: "half"  },
  { label: "互动数据概览", type: "multi",  size: "half"  },
  { label: "互动效率分段", type: "bar",    size: "third" },
  { label: "内容类型分布", type: "pie",    size: "third" },
  { label: "发布时段分析", type: "radar",  size: "third" },
  { label: "爆款视频矩阵", type: "bubble", size: "full"  },
];

const KUAISHOU_CHARTS: ChartPlaceholder[] = [
  { label: "每日曝光趋势",   type: "line",   size: "full"  },
  { label: "前10作品排行",   type: "bar",    size: "half"  },
  { label: "流量来源分析",   type: "multi",  size: "half"  },
  { label: "互动效率分段",   type: "bar",    size: "third" },
  { label: "内容类型分布",   type: "pie",    size: "third" },
  { label: "发布规律雷达",   type: "radar",  size: "third" },
  { label: "涨粉×流量气泡",  type: "bubble", size: "full"  },
];

interface Props {
  platform: "douyin" | "kuaishou";
}

const CONFIG = {
  douyin: {
    name: "抖音",
    color: "#1a1a1a",
    accent: "#fe2c55",
    gradient: "from-gray-900 via-gray-800 to-gray-900",
    glowColor: "rgba(254,44,85,0.15)",
    bgBlob1: "rgba(254,44,85,0.08)",
    bgBlob2: "rgba(105,201,208,0.06)",
    icon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
      </svg>
    ),
    charts: DOUYIN_CHARTS,
    accounts: ["账号A", "账号B", "账号C", "账号D"],
    metrics: ["播放量", "点赞数", "评论量", "分享量", "涨粉数", "完播率"],
  },
  kuaishou: {
    name: "快手",
    color: "#FF6600",
    accent: "#FF6600",
    gradient: "from-orange-950 via-orange-900 to-amber-900",
    glowColor: "rgba(255,102,0,0.15)",
    bgBlob1: "rgba(255,102,0,0.08)",
    bgBlob2: "rgba(255,200,50,0.06)",
    icon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      </svg>
    ),
    charts: KUAISHOU_CHARTS,
    accounts: ["主号", "矩阵号1", "矩阵号2"],
    metrics: ["播放量", "点赞数", "评论量", "分享量", "涨粉数", "作品数"],
  },
};

// ── 图表骨架图形 ─────────────────────────────────────────
function ChartSkeleton({ type, accent }: { type: ChartPlaceholder["type"]; accent: string }) {
  const bar = accent + "40";
  const barFull = accent + "70";

  if (type === "line") {
    const pts = [60,45,55,30,48,25,40,20,35,28,22,30,18,25,15,20,25,12,18,15].map((y,i) => `${i*26+10},${y+10}`).join(" ");
    return (
      <svg viewBox="0 0 520 80" className="w-full h-full opacity-40">
        <defs>
          <linearGradient id={`lg-${type}-${accent}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.4"/>
            <stop offset="100%" stopColor={accent} stopOpacity="0.05"/>
          </linearGradient>
        </defs>
        <polygon points={`10,70 ${pts} 500,70`} fill={`url(#lg-${type}-${accent})`}/>
        <polyline points={pts} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }
  if (type === "bar") {
    const heights = [65,42,55,30,48,38,50];
    return (
      <svg viewBox="0 0 280 80" className="w-full h-full opacity-40">
        {heights.map((h,i) => (
          <rect key={i} x={i*38+10} y={80-h} width="28" height={h} rx="4"
            fill={i===0 ? barFull : bar}/>
        ))}
      </svg>
    );
  }
  if (type === "pie") {
    const slices = [
      { start: 0,   end: 150, color: accent+"cc" },
      { start: 150, end: 240, color: accent+"80" },
      { start: 240, end: 300, color: accent+"50" },
      { start: 300, end: 360, color: accent+"30" },
    ];
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
        {slices.map((s,i) => {
          const r = 40, cx = 50, cy = 50;
          const a1 = (s.start-90)*Math.PI/180, a2 = (s.end-90)*Math.PI/180;
          const x1=cx+r*Math.cos(a1), y1=cy+r*Math.sin(a1);
          const x2=cx+r*Math.cos(a2), y2=cy+r*Math.sin(a2);
          const large = s.end-s.start > 180 ? 1 : 0;
          return <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill={s.color}/>;
        })}
        <circle cx="50" cy="50" r="22" fill="white" opacity="0.15"/>
      </svg>
    );
  }
  if (type === "radar") {
    const n = 7, r = 35, cx = 50, cy = 50;
    const pts = Array.from({length:n},(_,i)=>{
      const a=(i/n*360-90)*Math.PI/180;
      const v = [0.8,0.6,0.9,0.5,0.7,0.4,0.75][i];
      return `${cx+r*v*Math.cos(a)},${cy+r*v*Math.sin(a)}`;
    }).join(" ");
    const grid = Array.from({length:n},(_,i)=>{
      const a=(i/n*360-90)*Math.PI/180;
      return `${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`;
    }).join(" ");
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
        <polygon points={grid} fill="none" stroke={accent} strokeOpacity="0.2" strokeWidth="0.5"/>
        <polygon points={pts} fill={accent+"40"} stroke={accent} strokeWidth="1.5"/>
      </svg>
    );
  }
  if (type === "bubble") {
    const bubbles = [{x:80,y:40,r:18},{x:200,y:55,r:12},{x:330,y:25,r:22},{x:440,y:45,r:8},{x:150,y:30,r:10},{x:280,y:50,r:15}];
    return (
      <svg viewBox="0 0 520 80" className="w-full h-full opacity-40">
        {bubbles.map((b,i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={bar} stroke={accent+"60"} strokeWidth="1"/>
        ))}
      </svg>
    );
  }
  // multi
  const h1=[40,60,35,55,45,65,30]; const h2=[25,40,20,38,28,45,18];
  return (
    <svg viewBox="0 0 280 80" className="w-full h-full opacity-40">
      {h1.map((h,i)=>(
        <rect key={`a${i}`} x={i*38+10} y={80-h} width="13" height={h} rx="3" fill={barFull}/>
      ))}
      {h2.map((h,i)=>(
        <rect key={`b${i}`} x={i*38+25} y={80-h} width="13" height={h} rx="3" fill={bar}/>
      ))}
    </svg>
  );
}

// ── 单个图表占位卡 ────────────────────────────────────────
function ChartCard({ chart, accent }: { chart: ChartPlaceholder; accent: string }) {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-3 min-h-[180px] relative overflow-hidden">
      {/* 顶部标题行 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--app-text-secondary)]">{chart.label}</span>
        <div className="flex gap-1">
          {[1,2,3].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: accent, opacity: 0.3+i*0.15}}/>
          ))}
        </div>
      </div>
      {/* 图表骨架区域 */}
      <div className="flex-1 flex items-end">
        <ChartSkeleton type={chart.type} accent={accent}/>
      </div>
      {/* 底部水印 */}
      <div className="text-[10px] text-[var(--app-text-muted)] text-center tracking-wide">
        数据接入后自动渲染
      </div>
      {/* 右下角装饰 */}
      <div className="absolute bottom-0 right-0 w-16 h-16 rounded-tl-full opacity-5"
           style={{backgroundColor: accent}}/>
    </div>
  );
}

// ── 主组件 ───────────────────────────────────────────────
export default function EmptyPlatformScreen({ platform }: Props) {
  const cfg = CONFIG[platform];
  const [activeAccount, setActiveAccount] = React.useState("全部");
  const accounts = ["全部", ...cfg.accounts];

  return (
    <div className="min-h-svh relative overflow-hidden" style={{background: "var(--app-bg)"}}>
      {/* 背景光晕 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-60"
             style={{background: cfg.bgBlob1}}/>
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-50"
             style={{background: cfg.bgBlob2}}/>
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-6 space-y-6">

        {/* ── 账号筛选条 ── */}
        <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-[var(--app-text-muted)] shrink-0">账号</span>
          {accounts.map(a => (
            <button key={a}
              onClick={() => setActiveAccount(a)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={activeAccount === a ? {
                background: cfg.accent,
                color: "#fff",
                boxShadow: `0 0 12px ${cfg.accent}50`,
              } : {
                background: "rgba(255,255,255,0.5)",
                color: "var(--app-text-secondary)",
                border: "1px solid rgba(255,255,255,0.8)",
              }}>
              {a}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 opacity-40">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{background: cfg.accent}}/>
            <span className="text-xs text-[var(--app-text-muted)]">等待数据接入</span>
          </div>
        </div>

        {/* ── 空状态主卡片 ── */}
        <div className="glass-card rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          {/* 背景大字 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="text-[180px] md:text-[240px] font-black leading-none opacity-[0.03]"
                  style={{color: cfg.accent}}>
              {cfg.name}
            </span>
          </div>

          {/* 图标区 */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
                 style={{
                   background: `linear-gradient(135deg, ${cfg.accent}20, ${cfg.accent}08)`,
                   border: `1.5px solid ${cfg.accent}30`,
                   boxShadow: `0 8px 32px ${cfg.accent}20`,
                 }}>
              <div style={{color: cfg.accent}}>{cfg.icon}</div>
              {/* 脉冲环 */}
              <div className="absolute inset-0 rounded-3xl animate-ping opacity-20"
                   style={{border: `2px solid ${cfg.accent}`}}/>
            </div>
          </div>

          {/* 文案区 */}
          <div className="flex-1 text-center md:text-left space-y-3 relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--app-text)]">
              {cfg.name}数据即将上线
            </h2>
            <p className="text-[var(--app-text-secondary)] text-base leading-relaxed max-w-md">
              数据接入完成后，以下所有图表将自动渲染真实数据。
              当前界面为预览模式，图表结构与最终效果完全一致。
            </p>

            {/* 指标预览胶囊 */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
              {cfg.metrics.map(m => (
                <span key={m}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: `${cfg.accent}12`,
                    color: cfg.accent,
                    border: `1px solid ${cfg.accent}25`,
                  }}>
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* 进度状态 */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div className="glass-card rounded-2xl px-5 py-4 text-center space-y-2 min-w-[120px]"
                 style={{border: `1px solid ${cfg.accent}20`}}>
              <div className="text-2xl font-bold" style={{color: cfg.accent}}>0</div>
              <div className="text-xs text-[var(--app-text-muted)]">已接入条目</div>
            </div>
            <div className="glass-card rounded-2xl px-5 py-4 text-center space-y-2 min-w-[120px]"
                 style={{border: `1px solid ${cfg.accent}20`}}>
              <div className="text-2xl font-bold text-[var(--app-text-secondary)]">—</div>
              <div className="text-xs text-[var(--app-text-muted)]">账号数量</div>
            </div>
          </div>
        </div>

        {/* ── KPI 占位行 ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["单日平均播放量", "总点赞数", "总涨粉数", "平均完播率"].map((label) => (
            <div key={label} className="glass-card rounded-2xl p-5 space-y-2 relative overflow-hidden">
              <div className="text-xs text-[var(--app-text-muted)]">{label}</div>
              <div className="flex items-end gap-1">
                <div className="h-8 w-24 rounded-lg animate-pulse"
                     style={{background: `${cfg.accent}15`}}/>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full opacity-10"
                   style={{background: cfg.accent}}/>
            </div>
          ))}
        </div>

        {/* ── 图表骨架区 ── */}
        {/* 全宽折线图 */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--app-text-secondary)]">每日播放趋势</span>
            <div className="flex gap-2">
              {["全部账号","单账号"].map((t,i)=>(
                <span key={t} className="px-2 py-0.5 rounded-full text-[10px]"
                  style={{
                    background: i===0 ? `${cfg.accent}20` : "transparent",
                    color: i===0 ? cfg.accent : "var(--app-text-muted)",
                    border: `1px solid ${cfg.accent}${i===0?"40":"15"}`,
                  }}>{t}</span>
              ))}
            </div>
          </div>
          <div className="h-40">
            <ChartSkeleton type="line" accent={cfg.accent}/>
          </div>
        </div>

        {/* 左右各50% */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard chart={{label:"前10播放排行", type:"bar", size:"half"}} accent={cfg.accent}/>
          <ChartCard chart={{label:"多维流量分析", type:"multi", size:"half"}} accent={cfg.accent}/>
        </div>

        {/* 三列 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ChartCard chart={{label:"互动效率分段", type:"bar", size:"third"}} accent={cfg.accent}/>
          <ChartCard chart={{label:"内容类型分布", type:"pie", size:"third"}} accent={cfg.accent}/>
          <ChartCard chart={{label:"发布规律雷达", type:"radar", size:"third"}} accent={cfg.accent}/>
        </div>

        {/* 全宽气泡图 */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--app-text-secondary)]">涨粉 × 流量 × 互动气泡矩阵</span>
            <div className="flex gap-2 items-center">
              {["菌菇类","旅行类","虫草类","其他"].map(t=>(
                <span key={t} className="w-2 h-2 rounded-full opacity-40"
                      style={{background: cfg.accent}}/>
              ))}
              <span className="text-[10px] text-[var(--app-text-muted)] ml-1">内容类型图例</span>
            </div>
          </div>
          <div className="h-40">
            <ChartSkeleton type="bubble" accent={cfg.accent}/>
          </div>
        </div>

        {/* ── 数据上传提示 ── */}
        <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 text-center md:text-left"
             style={{border: `1px dashed ${cfg.accent}30`}}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
               style={{background: `${cfg.accent}15`}}>
            <svg className="w-6 h-6" style={{color: cfg.accent}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-[var(--app-text)]">
              准备好导入{cfg.name}数据了吗？
            </div>
            <div className="text-xs text-[var(--app-text-muted)] mt-1">
              将{cfg.name}后台导出的数据表发送给 Agent，数据将自动清洗并填入以上所有图表
            </div>
          </div>
          <div className="shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all"
               style={{
                 background: `${cfg.accent}15`,
                 color: cfg.accent,
                 border: `1px solid ${cfg.accent}30`,
               }}>
            等待数据上传
          </div>
        </div>

      </div>
    </div>
  );
}
