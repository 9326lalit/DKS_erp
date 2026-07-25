"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface DetailField {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  mono?: boolean;
  badge?: boolean;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  badgeClass?: string;
  colSpan?: 1 | 2 | 3 | 4;
}

export interface DetailSection {
  title: string;
  icon?: React.ReactNode;
  fields: DetailField[];
}

export interface DetailViewCardProps {
  title: string;
  subtitle?: string;
  statusBadge?: React.ReactNode;
  sections: DetailSection[];
  children?: React.ReactNode;
}

export function DetailViewCard({
  title,
  subtitle,
  statusBadge,
  sections,
  children
}: DetailViewCardProps) {
  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Top Banner Card */}
      <div className="p-4 bg-muted/30 border border-border/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold font-mono tracking-tight text-primary">{title}</h3>
            {statusBadge}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Structured Sections */}
      {sections.map((section, idx) => (
        <Card key={idx} className="border-border/40 shadow-2xs overflow-hidden">
          <CardHeader className="py-2.5 px-4 bg-muted/20 border-b border-border/20 flex flex-row items-center gap-2">
            {section.icon && <span className="text-primary">{section.icon}</span>}
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {section.fields.map((field, fIdx) => {
                const spanClass =
                  field.colSpan === 2
                    ? "sm:col-span-2"
                    : field.colSpan === 3
                    ? "sm:col-span-3"
                    : field.colSpan === 4
                    ? "sm:col-span-3 md:col-span-4"
                    : "col-span-1";

                return (
                  <div
                    key={fIdx}
                    className={cn(
                      "p-2.5 rounded-lg bg-card border border-border/30 flex flex-col justify-between gap-1",
                      spanClass
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      {field.label}
                    </span>
                    <div className="text-xs font-semibold text-foreground">
                      {field.badge ? (
                        <Badge
                          variant={field.badgeVariant || "outline"}
                          className={cn("text-[10px] font-bold", field.badgeClass)}
                        >
                          {field.value}
                        </Badge>
                      ) : (
                        <span
                          className={cn(
                            field.highlight && "text-primary font-bold text-sm",
                            field.mono && "font-mono"
                          )}
                        >
                          {field.value || "—"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Optional Extra Content (e.g., Tables or Financial Summaries) */}
      {children}
    </div>
  );
}
