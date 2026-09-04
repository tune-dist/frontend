"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type IsrcMode = "existing" | "generate";

interface IsrcCodeSectionProps {
  mode: IsrcMode;
  onModeChange: (mode: IsrcMode) => void;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isFreePlan?: boolean;
  onFreePlanAttempt?: () => void;
  idPrefix?: string;
}

export function IsrcCodeSection({
  mode,
  onModeChange,
  value,
  onChange,
  error,
  isFreePlan = false,
  onFreePlanAttempt,
  idPrefix = "isrc",
}: IsrcCodeSectionProps) {
  const existingId = `${idPrefix}-mode-existing`;
  const generateId = `${idPrefix}-mode-generate`;
  const inputId = `${idPrefix}-input`;

  return (
    <div className="space-y-4 pt-6 border-t border-border">
      <div className="space-y-3">
        <Label className="text-lg font-semibold">ISRC Code</Label>
        <p className="text-sm text-muted-foreground">
          How would you like to provide the ISRC?
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label
            htmlFor={existingId}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
              mode === "existing"
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-accent/50",
            )}
          >
            <input
              type="radio"
              id={existingId}
              name={`${idPrefix}-mode`}
              checked={mode === "existing"}
              onChange={() => onModeChange("existing")}
              className="h-4 w-4 border-primary text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">I already have an ISRC code</span>
          </label>

          <label
            htmlFor={generateId}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
              mode === "generate"
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-accent/50",
            )}
          >
            <input
              type="radio"
              id={generateId}
              name={`${idPrefix}-mode`}
              checked={mode === "generate"}
              onChange={() => onModeChange("generate")}
              className="h-4 w-4 border-primary text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Generate an ISRC code for me</span>
          </label>
        </div>
      </div>

      {mode === "existing" && (
        <div className="space-y-2">
          <Label htmlFor={inputId}>Enter your ISRC code</Label>
          <Input
            id={inputId}
            placeholder="IN-KTL-26-00006"
            readOnly={isFreePlan}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (isFreePlan) {
                onFreePlanAttempt?.();
              }
            }}
            className={error ? "border-red-500" : ""}
          />
          {isFreePlan && (
            <p className="text-xs text-amber-600 mt-1">
              Upgrade to a paid plan to use a custom ISRC code.
            </p>
          )}
          {error ? (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              Your ISRC code should be 12 characters long.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
