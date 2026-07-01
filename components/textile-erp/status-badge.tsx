import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type BadgeType = "loom" | "beam" | "invoice" | "lot" | "factory" | "general";

interface StatusBadgeProps {
  status: string;
  type?: BadgeType;
  className?: string;
}

export function StatusBadge({ status, type = "general", className }: StatusBadgeProps) {
  const cleanStatus = status.toLowerCase().trim();

  let styles = "bg-muted text-muted-foreground border-transparent";
  
  if (type === "loom") {
    switch (cleanStatus) {
      case "running":
        styles = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
        break;
      case "idle":
        styles = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
        break;
      case "maintenance":
        styles = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
        break;
    }
  } else if (type === "beam") {
    switch (cleanStatus) {
      case "available":
        styles = "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20";
        break;
      case "running":
        styles = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
        break;
      case "completed":
        styles = "bg-muted text-muted-foreground border-transparent";
        break;
      case "sizing":
        styles = "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
        break;
    }
  } else if (type === "invoice") {
    switch (cleanStatus) {
      case "paid":
        styles = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
        break;
      case "dispatched":
        styles = "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20";
        break;
      case "draft":
        styles = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
        break;
    }
  } else if (type === "lot") {
    switch (cleanStatus) {
      case "active":
        styles = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
        break;
      case "exhausted":
        styles = "bg-muted text-muted-foreground border-transparent";
        break;
    }
  } else if (type === "factory") {
    switch (cleanStatus) {
      case "active":
        styles = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
        break;
      case "inactive":
        styles = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
        break;
    }
  } else {
    // General styles
    if (["active", "success", "completed", "paid", "yes", "true"].includes(cleanStatus)) {
      styles = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    } else if (["pending", "warning", "idle", "draft", "sizing"].includes(cleanStatus)) {
      styles = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    } else if (["failed", "error", "inactive", "maintenance", "no", "false"].includes(cleanStatus)) {
      styles = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
    }
  }

  // Capitalize first letter
  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Badge
      variant="outline"
      className={cn("px-2.5 py-0.5 text-xs font-semibold rounded-md transition-colors", styles, className)}
    >
      {formattedStatus}
    </Badge>
  );
}
export type { BadgeType };
