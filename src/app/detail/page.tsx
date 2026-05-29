import { Suspense } from "react";
import { DetailScreen } from "@/components/screens/DetailScreen";

export const metadata = {
  title: "视频详情 · VividMetrics",
};

export default function DetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--app-text-muted)]">加载中…</div>}>
      <DetailScreen />
    </Suspense>
  );
}
