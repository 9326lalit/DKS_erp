import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function ChartCard({
  title,
  description,
  children,
  actions,
  className,
  loading = false
}: ChartCardProps) {
  return (
    <Card className={cn("overflow-hidden border-border/40 hover:shadow-sm transition-all duration-300", className)}>
      <CardHeader className="flex flex-col items-start gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/10 bg-muted/5">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-bold tracking-tight font-display">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-xs">
              {description}
            </CardDescription>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {actions}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex h-[300px] w-full items-center justify-center bg-muted/10 rounded-lg border border-dashed border-border/40 animate-pulse">
            <div className="space-y-3 flex flex-col items-center justify-center w-full px-12">
              <div className="h-4 w-48 bg-muted rounded" />
              <div className="h-[200px] w-full bg-muted rounded mt-2" />
            </div>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
