import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: { title: string; description?: string }[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto px-4 overflow-x-auto scrollbar-none pb-2">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          
          return (
            <React.Fragment key={idx}>
              {/* Step bubble */}
              <div className="flex items-center gap-3 shrink-0">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isActive && "border-primary text-primary bg-primary/5 ring-4 ring-primary/10 scale-105",
                    !isCompleted && !isActive && "border-muted-foreground/30 text-muted-foreground/75"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 stroke-[3px]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                
                <div className="hidden sm:flex flex-col text-left">
                  <span
                    className={cn(
                      "text-xs font-bold uppercase tracking-wider leading-none",
                      isActive && "text-foreground",
                      isCompleted && "text-muted-foreground",
                      !isActive && !isCompleted && "text-muted-foreground/50"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-[10px] text-muted-foreground mt-0.5 max-w-[120px] truncate leading-none">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Line connector */}
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-4 min-w-[20px] transition-colors duration-300",
                    idx < currentStep ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
export type { StepperProps };
