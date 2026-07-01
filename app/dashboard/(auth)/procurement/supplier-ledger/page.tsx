"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Building,
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

import { procurementApiService } from "@/lib/services/procurement-api";
import { mastersApiService } from "@/lib/services/masters-api";
import { SupplierLedgerTransaction } from "@/lib/store/use-procurement-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SupplierLedgerPage() {
  const router = useRouter();

  // Selected supplier state
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Queries
  const { data: ledgerTransactions = [], isLoading } = useQuery({
    queryKey: ["supplierLedger"],
    queryFn: () => procurementApiService.getSupplierLedger()
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      const parties = await mastersApiService.getParties();
      return parties.filter((p) => p.partyType === "Supplier");
    }
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(val);
  };

  // Filter Logic
  const filteredTxs = ledgerTransactions.filter((tx) => {
    const matchesSupplier = selectedSupplierId === "all" || tx.supplierId === selectedSupplierId;
    
    let matchesDates = true;
    if (startDate) {
      matchesDates = matchesDates && new Date(tx.date) >= new Date(startDate);
    }
    if (endDate) {
      matchesDates = matchesDates && new Date(tx.date) <= new Date(endDate);
    }

    return matchesSupplier && matchesDates;
  });

  // Calculate summary stats
  const totalCredit = filteredTxs.reduce((acc, curr) => acc + curr.credit, 0);
  const totalDebit = filteredTxs.reduce((acc, curr) => acc + curr.debit, 0);
  const closingBalance = totalCredit - totalDebit;

  const handleExport = () => {
    toast.success("Ledger statement exported to PDF/Excel sheet successfully.");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Supplier double-entry Ledgers"
        description="Audit billing transaction balances. View invoices posted against payments processed to compute net outstanding supplier liabilities."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Procurement Control", href: "/dashboard/procurement/dashboard" },
          { title: "Supplier Ledger Statement" }
        ]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/procurement/dashboard")} className="h-9 gap-1 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 border-b border-border/40 pb-4 mb-6 items-end justify-between">
        <div className="flex flex-wrap gap-4 items-center flex-1 max-w-2xl">
          <div className="w-[240px] space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select Supplier Mill *</label>
            <Select onValueChange={setSelectedSupplierId} value={selectedSupplierId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.partyName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[160px] space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="w-[160px] space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {(selectedSupplierId !== "all" || startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedSupplierId("all");
                setStartDate("");
                setEndDate("");
              }}
              className="h-9 text-xs mt-5 cursor-pointer font-bold"
            >
              Reset Filters
            </Button>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={handleExport} className="h-9 gap-1.5 cursor-pointer font-bold text-xs shrink-0 self-end sm:self-auto">
          <Download className="h-4 w-4" />
          Export Statement
        </Button>
      </div>

      {/* Summary KPI grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
        <Card className="border-border/40 overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Purchases (Credit)</span>
              <h3 className="text-xl font-bold tracking-tight text-foreground font-display">
                {formatCurrency(totalCredit)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Payments (Debit)</span>
              <h3 className="text-xl font-bold tracking-tight text-foreground font-display">
                {formatCurrency(totalDebit)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Outstanding Net Liability Balance</span>
              <h3 className="text-xl font-bold tracking-tight text-primary font-display">
                {formatCurrency(closingBalance)}
              </h3>
            </div>
            <div className={`p-2.5 rounded-xl border ${closingBalance > 0 ? "border-amber-500/20 bg-amber-500/10 text-amber-600" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"}`}>
              <Building className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ledger statement list */}
      <Card className="border-border/40 overflow-hidden bg-card">
        <CardHeader className="p-5 pb-3 border-b border-border/10 bg-muted/5 flex flex-row items-center gap-1.5">
          <FileText className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold font-display">Ledger transaction statement</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground font-semibold">
              Loading ledger statement...
            </div>
          ) : filteredTxs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground font-semibold flex flex-col items-center justify-center gap-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <span>No transactions found for the selected supplier/date range.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader className="bg-muted/10 border-b border-border/10 font-bold">
                  <TableRow>
                    <TableHead className="font-bold w-[120px]">Post Date</TableHead>
                    <TableHead className="font-bold w-[160px]">Voucher type</TableHead>
                    <TableHead className="font-bold w-[160px]">Voucher No.</TableHead>
                    <TableHead className="font-bold w-[180px]">Reference PO/Invoice</TableHead>
                    <TableHead className="font-bold text-right w-[140px]">Debit (Paid Out) (-)</TableHead>
                    <TableHead className="font-bold text-right w-[140px]">Credit (Invoice Amount) (+)</TableHead>
                    <TableHead className="font-bold text-right w-[160px]">Liability Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTxs.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/5 font-semibold">
                      <TableCell className="text-muted-foreground flex items-center gap-1.5 py-3.5"><Calendar className="h-3.5 w-3.5" />{tx.date}</TableCell>
                      <TableCell>
                        <Badge variant={tx.voucherType === "Payment" ? "outline" : tx.voucherType === "Opening Balance" ? "secondary" : "default"} className="text-[10px] font-bold">
                          {tx.voucherType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-foreground">{tx.voucherNumber}</TableCell>
                      <TableCell className="text-muted-foreground">{tx.reference}</TableCell>
                      <TableCell className="text-right text-rose-500">
                        {tx.debit > 0 ? `₹${tx.debit.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell className="text-right text-emerald-600 dark:text-emerald-400">
                        {tx.credit > 0 ? `₹${tx.credit.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground">
                        {formatCurrency(tx.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
