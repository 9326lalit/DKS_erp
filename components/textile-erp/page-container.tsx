import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-3 duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
