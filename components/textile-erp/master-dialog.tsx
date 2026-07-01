"use client";

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MasterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function MasterDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className
}: MasterDialogProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className={cn(
          "w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col h-full bg-card border-l border-border/40 focus-visible:outline-none",
          className
        )}
      >
        {/* Scrollable Container */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-border/10 shrink-0">
            <SheetTitle className="text-base font-bold font-display tracking-tight text-foreground">
              {title}
            </SheetTitle>
            {description && (
              <SheetDescription className="text-xs text-muted-foreground mt-1">
                {description}
              </SheetDescription>
            )}
          </SheetHeader>
          
          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {children}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
export type { MasterDialogProps };
