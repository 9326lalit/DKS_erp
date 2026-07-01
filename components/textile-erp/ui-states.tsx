import React from "react";
import { Loader2, AlertTriangle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 1. LOADING STATE
interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Fetching data, please wait...", className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[300px] w-full p-8 space-y-4 rounded-xl border border-dashed border-border/40 bg-muted/5 animate-in fade-in duration-300",
        className
      )}
    >
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="text-xs font-medium text-muted-foreground animate-pulse">
        {message}
      </p>
    </div>
  );
}

// 2. EMPTY STATE
interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = "No data found",
  description = "There are no records to display matching your request.",
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[300px] w-full p-8 text-center rounded-xl border border-dashed border-border/40 bg-muted/5 animate-in fade-in duration-300",
        className
      )}
    >
      <div className="p-3 bg-muted rounded-full text-muted-foreground/60 mb-3.5">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-foreground font-display">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          className="mt-4 shadow"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// 3. ERROR STATE
interface ErrorStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while attempting to fetch your requested data. Please try again.",
  actionLabel = "Retry Request",
  onAction,
  className
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[300px] w-full p-8 text-center border border-dashed border-destructive/20 rounded-xl bg-destructive/5 animate-in fade-in duration-300",
        className
      )}
    >
      <div className="p-3 bg-destructive/10 rounded-full text-destructive mb-3.5 animate-bounce">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-destructive font-display">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>
      {onAction && (
        <Button
          onClick={onAction}
          variant="destructive"
          size="sm"
          className="mt-4 shadow"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
