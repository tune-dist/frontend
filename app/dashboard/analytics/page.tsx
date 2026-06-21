"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PageLoading from "@/components/dashboard/page-loading";
import {
  createDefaultTrendFilters,
  TrendFilters,
  useAnalyticsData,
} from "@/hooks/use-analytics-data";
import {
  BreakdownChartCard,
  StreamingTrendsCard,
} from "@/components/analytics/analytics-charts";
import {
  getTodayDateKey,
  SupportedDspFilter,
  TrendPeriod,
} from "@/lib/api/analytics";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45 },
  },
};

function formatChartDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function AnalyticsPage() {
  const [trendFilters, setTrendFilters] = useState<TrendFilters>(createDefaultTrendFilters);
  const [customDraft, setCustomDraft] = useState({
    startDate: trendFilters.startDate,
    endDate: trendFilters.endDate,
  });

  const {
    trends,
    languages,
    genres,
    loading,
    trendsLoading,
  } = useAnalyticsData(trendFilters);

  const maxCustomDate = getTodayDateKey();

  const handlePeriodChange = (period: TrendPeriod) => {
    if (period === "custom") {
      setCustomDraft({
        startDate: trendFilters.startDate,
        endDate: trendFilters.endDate,
      });
    }
    setTrendFilters((current) => ({ ...current, period }));
  };

  const handleDspChange = (dsp: SupportedDspFilter) => {
    setTrendFilters((current) => ({ ...current, dsp }));
  };

  const handleCustomApply = () => {
    setTrendFilters((current) => ({
      ...current,
      period: "custom",
      startDate: customDraft.startDate,
      endDate: customDraft.endDate,
    }));
  };

  if (loading) {
    return <PageLoading />;
  }

  const trendDateKeys = trends?.dataPoints.map((point) => point.date) ?? [];
  const trendLabels = trendDateKeys.map(formatChartDate);
  const trendValues = trends?.dataPoints.map((point) => point.plays) ?? [];
  const chartLabel = trends?.label ?? "Total";

  return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold mb-2">
            <span className="animated-gradient">Analytics</span> Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track streaming performance across platforms, languages, and genres.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <StreamingTrendsCard
            trendsLoading={trendsLoading}
            selectedPeriod={trendFilters.period}
            selectedDsp={trendFilters.dsp}
            customStartDate={customDraft.startDate}
            customEndDate={customDraft.endDate}
            maxCustomDate={maxCustomDate}
            onPeriodChange={handlePeriodChange}
            onDspChange={handleDspChange}
            onCustomStartChange={(startDate) =>
              setCustomDraft((current) => ({ ...current, startDate }))
            }
            onCustomEndChange={(endDate) =>
              setCustomDraft((current) => ({ ...current, endDate }))
            }
            onCustomApply={handleCustomApply}
            labels={trendLabels}
            dateKeys={trendDateKeys}
            values={trendValues}
            chartLabel={chartLabel}
            totalPlays={trends?.totalPlays ?? 0}
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div variants={itemVariants}>
            <BreakdownChartCard title="Top Languages" data={languages} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <BreakdownChartCard title="Top Genres" data={genres} />
          </motion.div>
        </div>
      </motion.div>
  );
}
