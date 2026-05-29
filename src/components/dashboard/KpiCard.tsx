"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: number; // 正数=上升，负数=下降
  color?: string;
}

export function KpiCard({ label, value, sub, trend, color = "var(--app-secondary)" }: KpiCardProps) {
  const isUp = trend === undefined ? null : trend >= 0;
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 16px 48px rgba(0,0,0,0.10)" }}
      whileTap={{ scale: 0.97 }}
      className="glass-card rounded-2xl p-4 flex flex-col gap-2 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--app-text-muted)]">{label}</span>
        {trend !== undefined && isUp !== null && (
          <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
            {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-black tracking-tight" style={{ color }}>{value}</div>
      {sub && <p className="text-[10px] text-[var(--app-text-muted)]">{sub}</p>}
    </motion.div>
  );
}
