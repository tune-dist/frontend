"use client";

import { useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { Download, Loader2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BreakdownResponse,
  MIN_TREND_DATE,
  SupportedDspFilter,
  TrendPeriod,
} from "@/lib/api/analytics";
import { ANALYTICS_PLATFORMS } from "@/lib/platform-logos";
import { PlatformFilterButton } from "@/components/analytics/platform-icon";
import { cn } from "@/lib/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const TREND_PERIODS: Array<{ key: TrendPeriod; label: string }> = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "custom", label: "Custom" },
];

interface StreamingTrendsCardProps {
  trendsLoading: boolean;
  selectedPeriod: TrendPeriod;
  selectedDsp: SupportedDspFilter;
  customStartDate: string;
  customEndDate: string;
  maxCustomDate: string;
  onPeriodChange: (period: TrendPeriod) => void;
  onDspChange: (dsp: SupportedDspFilter) => void;
  onCustomStartChange: (date: string) => void;
  onCustomEndChange: (date: string) => void;
  onCustomApply: () => void;
  labels: string[];
  dateKeys: string[];
  values: number[];
  chartLabel: string;
  totalPlays: number;
}

const PIE_COLORS = [
  "#8b5cf6",
  "#ef4444",
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#ec4899",
  "#94a3b8",
  "#eab308",
  "#6366f1",
  "#14b8a6",
];

export function StreamingTrendsCard({
  trendsLoading,
  selectedPeriod,
  selectedDsp,
  customStartDate,
  customEndDate,
  maxCustomDate,
  onPeriodChange,
  onDspChange,
  onCustomStartChange,
  onCustomEndChange,
  onCustomApply,
  labels,
  dateKeys,
  values,
  chartLabel,
  totalPlays,
}: StreamingTrendsCardProps) {
  const chartRef = useRef<ChartJS<"bar">>(null);
  const activePlatform = ANALYTICS_PLATFORMS.find((p) => p.key === selectedDsp);
  const barColor = activePlatform?.color ?? "#8b5cf6";

  const handleDownload = () => {
    const rows = dateKeys.map((date, index) => `${date},${values[index] ?? 0}`);
    const csv = ["Date,Plays", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `streaming-trends-${selectedDsp}-${selectedPeriod}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const maxValue = Math.max(...values, 1);
  const yStep = maxValue <= 10 ? 1 : maxValue <= 100 ? 10 : maxValue <= 1000 ? 100 : 1000;
  const barCount = values.length;
  const maxBarThickness = barCount <= 7 ? 48 : barCount <= 31 ? 28 : 16;

  const chartData = {
    labels,
    datasets: [
      {
        label: chartLabel,
        data: values,
        backgroundColor: `${barColor}CC`,
        hoverBackgroundColor: barColor,
        borderColor: barColor,
        borderWidth: 0,
        borderRadius: 6,
        maxBarThickness,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          color: "#9ca3af",
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: "rectRounded",
          font: { size: 11, weight: 600 },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "#1f2937",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: (items) => dateKeys[items[0]?.dataIndex ?? 0] ?? labels[items[0]?.dataIndex ?? 0] ?? "",
          label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.parsed.y).toLocaleString()} plays`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
          color: "#9ca3af",
          font: { size: 11, weight: 600 },
        },
        grid: { display: false },
        ticks: {
          color: "#9ca3af",
          maxTicksLimit: barCount > 31 ? 15 : 12,
          font: { size: 10, weight: 600 },
        },
      },
      y: {
        title: {
          display: true,
          text: "Total Plays",
          color: "#9ca3af",
          font: { size: 11, weight: 600 },
        },
        min: 0,
        suggestedMax: maxValue + yStep,
        grid: { color: "rgba(156, 163, 175, 0.08)" },
        ticks: {
          color: "#9ca3af",
          stepSize: yStep,
          font: { size: 10, weight: 600 },
        },
      },
    },
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3 space-y-4">
        <CardTitle className="text-xl font-bold">Streaming Trends</CardTitle>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {ANALYTICS_PLATFORMS.map((platform) => (
              <PlatformFilterButton
                key={platform.key}
                platform={platform}
                isActive={selectedDsp === platform.key}
                onClick={() => onDspChange(platform.key as SupportedDspFilter)}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex rounded-xl border border-border/60 p-1 bg-secondary/20">
              {TREND_PERIODS.map((period) => (
                <button
                  key={period.key}
                  type="button"
                  onClick={() => onPeriodChange(period.key)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                    selectedPeriod === period.key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>

            <Button
              size="icon"
              variant="default"
              className="h-11 w-11 shrink-0 rounded-xl self-start sm:self-auto"
              onClick={handleDownload}
              disabled={trendsLoading || totalPlays === 0}
              title="Download CSV"
            >
              <Download className="h-5 w-5" />
            </Button>
          </div>

          {selectedPeriod === "custom" && (
            <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-secondary/10 p-4 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="trend-start-date" className="text-xs text-muted-foreground">
                  From
                </Label>
                <Input
                  id="trend-start-date"
                  type="date"
                  min={MIN_TREND_DATE}
                  max={customEndDate || maxCustomDate}
                  value={customStartDate}
                  onChange={(event) => onCustomStartChange(event.target.value)}
                  className="h-10"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="trend-end-date" className="text-xs text-muted-foreground">
                  To
                </Label>
                <Input
                  id="trend-end-date"
                  type="date"
                  min={customStartDate || MIN_TREND_DATE}
                  max={maxCustomDate}
                  value={customEndDate}
                  onChange={(event) => onCustomEndChange(event.target.value)}
                  className="h-10"
                />
              </div>
              <Button
                className="h-10 shrink-0"
                onClick={onCustomApply}
                disabled={trendsLoading || !customStartDate || !customEndDate}
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-center text-sm font-semibold text-muted-foreground">
          {chartLabel} Production Count
        </p>
        {trendsLoading ? (
          <div className="flex h-[320px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : totalPlays === 0 ? (
          <div className="flex h-[320px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
            No streams yet. Data will appear here once daily DSP reports are received.
          </div>
        ) : (
          <div className="h-[320px] w-full">
            <Bar ref={chartRef} data={chartData} options={chartOptions} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface BreakdownChartCardProps {
  title: string;
  data: BreakdownResponse | null;
  className?: string;
}

export function BreakdownChartCard({
  title,
  data,
  className,
}: BreakdownChartCardProps) {
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasStreamData = total > 0 && items.length > 0;

  const chartValues = items.map((item) => item.count);

  const pieData = {
    labels: items.map((item) => item.label),
    datasets: [
      {
        data: chartValues,
        backgroundColor: items.map((_, index) => PIE_COLORS[index % PIE_COLORS.length]),
        borderWidth: 0,
      },
    ],
  };

  const pieOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1f2937",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => {
            const item = items[ctx.dataIndex];
            if (!item) return "";
            return `${item.label}: ${item.count.toLocaleString()} (${item.percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Card className={cn("glass-card h-full", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasStreamData ? (
          <div className="flex h-[300px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
            No streams yet. Data will appear here once daily DSP reports are received.
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative mx-auto h-[260px] w-[260px] shrink-0">
              <Doughnut data={pieData} options={pieOptions} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-black text-foreground tabular-nums">
                  {total.toLocaleString()}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                  Total
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-2">
              {items.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="flex items-center gap-2"
                >
                  <span
                    className="h-3 w-6 shrink-0 rounded-sm"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
