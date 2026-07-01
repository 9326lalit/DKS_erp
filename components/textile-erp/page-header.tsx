import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-5 border-border/40",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
            </Link>
            {breadcrumbs.map((item, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="h-3 w-3 shrink-0" />
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors font-medium"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground/80 truncate">
                    {item.title}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          {actions}
        </div>
      )}
    </div>
  );
}
export type { PageHeaderProps };
