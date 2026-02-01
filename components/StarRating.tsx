"use client";

import { Star } from "lucide-react";
import { QuickScore } from "@/types";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  score: QuickScore;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const SCORE_LABELS: Record<QuickScore, string> = {
  3: "高い可能性",
  2: "中程度",
  1: "低い",
};

const SIZE_CONFIG = {
  sm: { star: "h-3 w-3", gap: "gap-0.5" },
  md: { star: "h-4 w-4", gap: "gap-1" },
  lg: { star: "h-5 w-5", gap: "gap-1" },
};

export function StarRating({ score, size = "md", showLabel = false }: StarRatingProps) {
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex", sizeConfig.gap)}>
        {[1, 2, 3].map((i) => (
          <Star
            key={i}
            className={cn(
              sizeConfig.star,
              i <= score
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {SCORE_LABELS[score]}
        </span>
      )}
    </div>
  );
}
