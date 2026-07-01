import React from "react";
import { ArrowDownIcon, ArrowUpIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label?: string;
    direction: "up" | "down" | "neutral";
  };
  className?: string;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  loading = false
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className={cn("overflow-hidden border-border/40", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
          </div>
          <div className="space-y-2 mt-2">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-3 w-40 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          {Icon && (
            <div className="rounded-lg bg-primary/5 p-2 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground duration-300">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        
        <div className="mt-3 flex flex-col gap-1">
          <h3 className="text-2xl font-bold tracking-tight text-foreground font-display">
            {value}
          </h3>
          
          {(trend || description) && (
            <div className="flex items-center gap-1.5 text-xs">
              {trend && (
                <span
                  className={cn(
                    "flex items-center gap-0.5 font-medium rounded-full px-1.5 py-0.5",
                    trend.direction === "up" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    trend.direction === "down" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                    trend.direction === "neutral" && "bg-muted text-muted-foreground"
                  )}
                >
                  {trend.direction === "up" && <ArrowUpIcon className="h-3 w-3" />}
                  {trend.direction === "down" && <ArrowDownIcon className="h-3 w-3" />}
                  {trend.value}%
                </span>
              )}
              <span className="text-muted-foreground">
                {trend?.label || description}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
