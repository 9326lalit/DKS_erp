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
  // Sort State
  const [sortKey, setSortKey] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  if (isLoading) {
    return <LoadingState message="Fetching master details table..." />;
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

  // Sort logic
  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    
    let aVal = (a as any)[sortKey];
    let bVal = (b as any)[sortKey];
    
    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalEntries = sortedData.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Selection toggle
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedData.map((item) => item.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectRow = (id: string, checked: boolean) => {
    const updated = new Set(selectedIds);
    if (checked) {
      updated.add(id);
    } else {
      updated.delete(id);
    }
    setSelectedIds(updated);
  };

  const isAllSelected = paginatedData.length > 0 && paginatedData.every((item) => selectedIds.has(item.id));
  const isSomeSelected = paginatedData.length > 0 && paginatedData.some((item) => selectedIds.has(item.id)) && !isAllSelected;

  const handleBulkDeleteClick = () => {
    if (onBulkDelete) {
      const selectedItems = data.filter((item) => selectedIds.has(item.id));
      onBulkDelete(selectedItems);
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk actions banner */}
      {selectedIds.size > 0 && onBulkDelete && (
        <div className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/[0.02] text-xs font-semibold animate-in slide-in-from-top-1.5 duration-200">
          <div className="text-foreground">
            {selectedIds.size} row(s) selected
          </div>
          <Button variant="destructive" size="sm" onClick={handleBulkDeleteClick} className="h-8 py-1 cursor-pointer">
            Bulk Delete Selected
          </Button>
        </div>
      )}

      {/* Main Table Layout */}
      <div className="rounded-xl border border-border/40 overflow-hidden shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border/10">
              <TableHead className="w-12 h-11 text-center">
                <Checkbox
                  checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                  onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                  aria-label="Select all"
                />
              </TableHead>
              
              {columns.map((col) => (
                <TableHead key={col.key} className="text-xs font-bold text-muted-foreground h-11 select-none">
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 hover:text-foreground cursor-pointer focus:outline-none"
                    >
                      {col.header}
                      <ArrowUpDown className="h-3 w-3 shrink-0 opacity-70" />
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
              
              <TableHead className="w-16 h-11 text-right text-muted-foreground text-xs font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody className="text-xs">
            {paginatedData.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length + 2} className="h-[200px] text-center text-muted-foreground font-semibold">
                  No records matching standard filter settings.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/5 border-b border-border/10">
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={(checked) => toggleSelectRow(item.id, !!checked)}
                      aria-label={`Select row ${item.id}`}
                    />
                  </TableCell>
                  
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
                              View Details
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer gap-2">
                              <Pencil className="h-3.5 w-3.5 opacity-80" />
                              Edit Details
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
                                Delete
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

      {/* Pagination Controls */}
      {totalEntries > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <div className="text-xs text-muted-foreground font-semibold">
            Showing <span className="font-bold text-foreground">{startIndex + 1}</span> to{" "}
            <span className="font-bold text-foreground">{endIndex}</span> of{" "}
            <span className="font-bold text-foreground">{totalEntries}</span> entries
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
