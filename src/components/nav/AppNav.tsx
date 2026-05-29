"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, BarChart2, Grid3X3, Music, Zap, FileText } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",          label: "总览",    Icon: TrendingUp },
  { href: "/rankings",  label: "排行",    Icon: BarChart2 },
  { href: "/matrix",    label: "矩阵",    Icon: Grid3X3 },
  { href: "/douyin",    label: "抖音",    Icon: Music },
  { href: "/kuaishou",  label: "快手",    Icon: Zap },
  { href: "/gzh",       label: "公众号",  Icon: FileText },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 md:hidden glass-card border-t border-white/80 pb-[env(safe-area-inset-bottom)]">
      <div className="flex">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} prefetch={false} className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5">
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`p-1.5 rounded-xl transition-colors ${active ? "bg-[var(--app-secondary)]/10" : ""}`}
              >
                <Icon
                  size={20}
                  className={active ? "text-[var(--app-secondary)]" : "text-[var(--app-text-muted)]"}
                />
              </motion.div>
              <span className={`text-[10px] font-semibold ${active ? "text-[var(--app-secondary)]" : "text-[var(--app-text-muted)]"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 glass-card border-r border-white/80 h-svh sticky top-0 pt-6 pb-8 px-4 gap-1 overflow-y-auto">
      <div className="mb-6 px-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[var(--app-secondary)] to-[#0ea5e9] flex items-center justify-center">
            <BarChart2 size={14} className="text-white" />
          </div>
          <span className="text-sm font-black text-[var(--app-text)] tracking-tight">VividMetrics</span>
        </div>
        <p className="text-[10px] text-[var(--app-text-muted)] leading-tight">内容运营数据大屏</p>
      </div>

      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} prefetch={false}>
            <motion.div
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer
                ${active
                  ? "bg-[var(--app-secondary)]/10 text-[var(--app-secondary)]"
                  : "text-[var(--app-text-secondary)] hover:bg-white/60 hover:text-[var(--app-text)]"
                }`}
            >
              <Icon size={16} />
              <span className="text-sm font-semibold">{label}</span>
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--app-secondary)]"
                />
              )}
            </motion.div>
          </Link>
        );
      })}

      {/* 平台状态 */}
      <div className="mt-auto px-2 space-y-2">
        <p className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">平台状态</p>
        {[
          { name: "微信视频号", color: "#07C160", active: true },
          { name: "小红书",     color: "#FF2442", active: true },
          { name: "公众号",     color: "#07C160", active: true },
          { name: "抖音",       color: "#fe2c55", active: true },
          { name: "快手",       color: "#FF6600", active: true },
        ].map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${p.active ? "animate-pulse" : "opacity-40"}`} style={{ background: p.color }} />
            <span className={`text-xs ${p.active ? "text-[var(--app-text-secondary)]" : "text-[var(--app-text-muted)] opacity-60"}`}>{p.name}</span>
            {!p.active && <span className="text-[9px] text-[var(--app-text-muted)] ml-auto">接入中</span>}
          </div>
        ))}
      </div>
    </aside>
  );
}
