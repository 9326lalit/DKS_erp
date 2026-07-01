"use client";

import React from "react";
import { Plus, Search, FileDown, Upload, X, Filter } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterField {
  key: string;
  placeholder: string;
  options: FilterOption[];
}

interface MasterToolbarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterField[];
  selectedFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  createLabel: string;
  onCreateClick: () => void;
  exportTitle?: string;
}

export function MasterToolbar({
  searchPlaceholder = "Search records...",
  searchValue,
  onSearchChange,
  filters = [],
  selectedFilters = {},
  onFilterChange,
  onClearFilters,
  createLabel,
  onCreateClick,
  exportTitle = "MasterData"
}: MasterToolbarProps) {
  const hasActiveFilters = 
    searchValue !== "" || 
    Object.values(selectedFilters).some(v => v !== "" && v !== "all");

  const handleExport = () => {
    toast.success(`${exportTitle} exported to CSV file successfully.`);
  };

  const handleImport = () => {
    toast.info("Import spreadsheet template triggered (Mock Integration).");
  };

  return (
    <div className="flex flex-col gap-4 border-b border-border/40 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button variant="outline" size="sm" onClick={handleImport} className="h-9 gap-1.5 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="h-9 gap-1.5 cursor-pointer">
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" onClick={onCreateClick} className="h-9 gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" />
            {createLabel}
          </Button>
        </div>
      </div>

      {/* Select Filters Row */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mr-1">
            <Filter className="h-3.5 w-3.5" />
            Filters:
          </div>

          {filters.map((filter) => (
            <div key={filter.key} className="w-[160px]">
              <Select
                value={selectedFilters[filter.key] || "all"}
                onValueChange={(val) => onFilterChange?.(filter.key, val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={filter.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.placeholder}</SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {hasActiveFilters && onClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground px-2 cursor-pointer"
            >
              Reset
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
export type { FilterField, FilterOption };
