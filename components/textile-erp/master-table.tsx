"use client";

import React, { useState } from "react";
import { MoreHorizontal, Eye, Pencil, Trash, ShieldCheck, ShieldAlert, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingState } from "@/components/textile-erp/ui-states";
import { useLanguage } from "@/lib/i18n/language-context";

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface MasterTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onStatusToggle?: (item: T) => void;
  isLoading?: boolean;
  customRowActions?: (item: T) => React.ReactNode;
  onBulkDelete?: (items: T[]) => void;
}

export function MasterTable<T extends { id: string; status?: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  onStatusToggle,
  isLoading = false,
  customRowActions,
  onBulkDelete
}: MasterTableProps<T>) {
  const { t } = useLanguage();

  // Sort State - default ascending
  const [sortKey, setSortKey] = useState<string>(columns[0]?.key || "");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination state with custom page size limit selector
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sort logic (Ascending by default with natural alphanumeric comparison)
  // MUST be above any early returns to satisfy Rules of Hooks
  const sortedData = React.useMemo(() => {
    if (!data) return [];
    const key = sortKey || columns[0]?.key || "id";
    return [...data].sort((a, b) => {
      let aVal = (a as any)[key];
      let bVal = (b as any)[key];

      if (aVal === undefined || aVal === null) aVal = "";
      if (bVal === undefined || bVal === null) bVal = "";

      // Numerical comparison
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Natural alphanumeric string comparison (e.g. L-001 < L-002 < L-010)
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: "base" });
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortOrder, columns]);

  // Pagination logic
  const totalEntries = sortedData.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);
  const endIndex = Math.min(startIndex + pageSize, totalEntries);

  // Early return for loading — AFTER all hooks are declared
  if (isLoading) {
    return <LoadingState message={t("fetchingData", "Fetching master details table...")} />;
  }

  // Handle Sort Toggle
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedData.map((item) => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  const isAllSelected =
    paginatedData.length > 0 && paginatedData.every((item) => selectedIds.has(item.id));

  return (
    <div className="flex flex-col gap-4">
      {/* Bulk Action Header */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-accent/50 px-4 py-2 text-xs">
          <span className="font-semibold text-accent-foreground">
            {selectedIds.size} item(s) selected
          </span>
          {onBulkDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                const selectedItems = data.filter((item) => selectedIds.has(item.id));
                onBulkDelete(selectedItems);
                setSelectedIds(new Set());
              }}
              className="h-7 text-xs cursor-pointer gap-1"
            >
              <Trash className="h-3 w-3" />
              {t("delete", "Delete Selected")}
            </Button>
          )}
        </div>
      )}

      {/* Main Table Container with Horizontal Scroll */}
      <div className="rounded-xl border border-border/40 overflow-x-auto shadow-2xs">
        <Table className="min-w-[950px]">
          <TableHeader className="bg-muted/30">
            <TableRow>
              {onBulkDelete && (
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}

              {columns.map((col) => (
                <TableHead key={col.key} className="text-xs font-bold text-foreground py-3">
                  {col.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort(col.key)}
                      className="-ml-3 h-8 text-xs font-bold hover:bg-accent cursor-pointer"
                    >
                      {col.header}
                      <ArrowUpDown className="ml-1 h-3 w-3 opacity-70" />
                    </Button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}

              <TableHead className="w-[80px] text-right font-bold text-xs text-foreground py-3">
                {t("actions", "Actions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onBulkDelete ? 2 : 1)}
                  className="h-32 text-center text-xs text-muted-foreground"
                >
                  {t("noDataFound", "No records found.")}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-muted/20 transition-colors data-[state=selected]:bg-muted/30"
                  data-state={selectedIds.has(item.id) ? "selected" : undefined}
                >
                  {onBulkDelete && (
                    <TableCell className="py-3">
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(checked) => handleSelectOne(item.id, !!checked)}
                        aria-label={`Select row ${item.id}`}
                      />
                    </TableCell>
                  )}

                  {columns.map((col) => (
                    <TableCell key={col.key} className="py-3">
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </TableCell>
                  ))}
                  
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {customRowActions && customRowActions(item)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full cursor-pointer">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-36 rounded-lg text-xs font-semibold">
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(item)} className="cursor-pointer gap-2">
                              <Eye className="h-3.5 w-3.5 opacity-80" />
                              {t("view", "View Details")}
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer gap-2">
                              <Pencil className="h-3.5 w-3.5 opacity-80" />
                              {t("edit", "Edit Details")}
                            </DropdownMenuItem>
                          )}
                          {onStatusToggle && item.status && (
                            <DropdownMenuItem
                              onClick={() => onStatusToggle(item)}
                              className="cursor-pointer gap-2"
                            >
                              {item.status.toLowerCase() === "active" ? (
                                <>
                                  <ShieldAlert className="h-3.5 w-3.5 text-amber-500 opacity-80" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 opacity-80" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDelete(item)}
                                className="text-destructive cursor-pointer focus:bg-destructive/10! focus:text-destructive! gap-2"
                              >
                                <Trash className="h-3.5 w-3.5 opacity-80" />
                                {t("delete", "Delete")}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination & Page Limit Controls */}
      {totalEntries > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
            <span>
              Showing <span className="font-bold text-foreground">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-foreground">{endIndex}</span> of{" "}
              <span className="font-bold text-foreground">{totalEntries}</span> entries
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 px-2 text-xs font-semibold bg-background border border-border/40 rounded-md focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-xs font-bold text-foreground px-3">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
