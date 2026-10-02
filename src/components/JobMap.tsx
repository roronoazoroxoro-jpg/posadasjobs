"use client";

import dynamic from "next/dynamic";
import { useTheme } from "./theme";

export type JobMapItem = {
  id: string;
  title: string;
  company: string;
  zone: string;
  modality: string;
  lat: number;
  lng: number;
  match?: number;
};

const Inner = dynamic(() => import("./JobMapInner"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[300px] w-full animate-pulse bg-gradient-to-br from-forest-50 to-river-50" />,
});

export function JobMap({ jobs, height }: { jobs: JobMapItem[]; height?: number }) {
  const { theme } = useTheme();
  return (
    <div className="overflow-hidden rounded-3xl border border-forest-100 shadow-soft">
      <Inner jobs={jobs} height={height} dark={theme === "dark"} />
    </div>
  );
}
