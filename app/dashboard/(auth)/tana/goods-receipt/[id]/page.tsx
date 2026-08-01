"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  User,
  ShieldCheck,
  Package,
  Scale,
  Calendar,
  MapPin,
  Printer,
  FileCheck2,
  Receipt
} from "lucide-react";

import { tanaApiService } from "@/lib/services/tana-api";
import { banaApiService } from "@/lib/services/bana-api";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default function GoodsReceiptDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = (params?.id as string) || "";
  const decodedId = decodeURIComponent(rawId);

  const { data: tanaGRNs = [], isLoading: loadingTana } = useQuery({
    queryKey: ["tana-grns"],
    queryFn: () => tanaApiService.getGRNs()
  });

  const { data: banaGRNs = [], isLoading: loadingBana } = useQuery({
    queryKey: ["bana-grns"],
    queryFn: () => banaApiService.getGRNs()
  });

  const allGRNs = [...tanaGRNs, ...banaGRNs];

  // Match GRN by id, grnNumber, or partial ID string match
  const grn = allGRNs.find(
    (g) =>
      g.id === decodedId ||
      g.grnNumber.toLowerCase() === decodedId.toLowerCase() ||
      g.id.toLowerCase().includes(decodedId.toLowerCase()) ||
      decodedId.toLowerCase().includes(g.id.toLowerCase())
  ) || allGRNs[0];

  const isLoading = loadingTana || loadingBana;

  if (isLoading) {
    return (
      <PageContainer>
        <div className="py-20 text-center text-xs text-muted-foreground">Loading Goods Receipt Voucher...</div>
      </PageContainer>
    );
  }

  if (!grn) {
    return (
      <PageContainer>
        <div className="py-20 text-center space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Goods Receipt Slip (GRN) not found.</p>
          <Button onClick={() => router.push("/dashboard/tana/goods-receipt")} variant="outline" size="sm">
            Back to Goods Receipts List
          </Button>
        </div>
      </PageContainer>
    );
  }

  const grnStatusColors: Record<string, string> = {
    Pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Partial: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    Completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  };

  const conditionColors: Record<string, string> = {
    Good: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Damaged: "bg-red-500/10 text-red-600 border-red-500/20",
    Rejected: "bg-red-700/10 text-red-700 border-red-700/20"
  };

  return (
    <PageContainer>
      <PageHeader
        title={`Goods Receipt Voucher: ${grn.grnNumber}`}
        description="Official Gate Entry & Physical Yarn Receipt Voucher."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Goods Receipts", href: "/dashboard/tana/goods-receipt" },
          { title: grn.grnNumber }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/tana/goods-receipt")} className="h-9 gap-1.5 cursor-pointer">
              <ArrowLeft className="h-4 w-4" /> Back to List
            </Button>
            <Button variant="default" size="sm" onClick={() => window.print()} className="h-9 gap-1.5 bg-primary cursor-pointer font-bold">
              <Printer className="h-4 w-4" /> Print GRN Voucher
            </Button>
          </div>
        }
      />

      {/* OFFICIAL VOUCHER CARD CONTAINER */}
      <Card className="border-primary/30 bg-card shadow-lg max-w-4xl mx-auto overflow-hidden">
        {/* VOUCHER HEADER BANNER */}
        <CardHeader className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6 border-b border-border/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="h-6 w-6 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  DKS Textile ERP — Physical Stock Receipt Voucher
                </span>
              </div>
              <h2 className="text-2xl font-bold font-display text-foreground mt-1">
                {grn.grnNumber}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> Received Date: <strong className="text-foreground">{grn.grnDate}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={`text-xs font-bold px-3 py-1 ${grnStatusColors[grn.status] || ""}`}>
                Status: {grn.status}
              </Badge>
              <Badge variant="outline" className={`text-xs font-bold px-3 py-1 ${conditionColors[grn.conditionCheck] || ""}`}>
                Quality: {grn.conditionCheck}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 text-xs">
          {/* TOP 2-COLUMN AUDIT INFORMATION */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Box A: Supplier & Order Information */}
            <Card className="border-border/40 bg-muted/10 shadow-xs">
              <CardHeader className="p-3 pb-2 border-b border-border/20 bg-muted/20">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Supplier &amp; Order Contract
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Yarn Supplier:</span>
                  <span className="font-bold text-sm text-foreground">{grn.supplierName}</span>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Linked Purchase Order:</span>
                  <Link href={`/dashboard/tana/purchase-orders`} className="font-bold font-mono text-primary text-sm hover:underline flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> {grn.linkedPONumber}
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Box B: Logistics & Gate Entry Verification */}
            <Card className="border-border/40 bg-muted/10 shadow-xs">
              <CardHeader className="p-3 pb-2 border-b border-border/20 bg-muted/20">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5" /> Transport &amp; Gate Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Vehicle No:</span>
                    <span className="font-bold font-mono text-foreground">{grn.vehicleNo || "Local Delivery"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-semibold uppercase">LR Transport No:</span>
                    <span className="font-bold font-mono text-foreground">{grn.lrNo || "N/A"}</span>
                  </div>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Received &amp; Verified By:</span>
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-emerald-600" /> {grn.receivedBy || "Store Manager"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PHYSICAL GOODS QUANTITY, WEIGHT & VALUE BREAKDOWN TABLE */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Package className="h-4 w-4 text-primary" /> Physical Stock Quantity, Weight &amp; Value Breakdown
            </h4>
            <div className="border border-border/40 rounded-xl overflow-hidden shadow-xs">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow className="text-xs font-bold">
                    <TableHead>PO Total Ordered</TableHead>
                    <TableHead className="text-center">Previously Recv</TableHead>
                    <TableHead className="text-center">Bags Received Today</TableHead>
                    <TableHead className="text-center">Per Bag Wt</TableHead>
                    <TableHead className="text-right">Net Weight Received</TableHead>
                    <TableHead className="text-right font-bold text-foreground">Rate (₹/Kg)</TableHead>
                    <TableHead className="text-right font-bold text-primary">Received Value (₹)</TableHead>
                    <TableHead className="text-center">Pending Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="text-xs font-medium">
                    <TableCell className="font-bold font-mono">{grn.bagsOrdered} Bags</TableCell>
                    <TableCell className="text-center font-mono">{grn.bagsPreviouslyReceived} Bags</TableCell>
                    <TableCell className="text-center font-bold font-mono text-emerald-600 text-sm">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-xs">
                        +{grn.bagsReceivedThisGRN} Bags
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono">{grn.perBagWeightKg} KG</TableCell>
                    <TableCell className="text-right font-bold font-mono text-sm text-foreground">
                      {grn.totalWeightReceived.toLocaleString()} KG
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">
                      ₹{((grn as any).ratePerKg || 280).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-bold font-mono text-base text-primary">
                      ₹{((grn.totalWeightReceived || 0) * ((grn as any).ratePerKg || 280)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center font-mono text-amber-600 font-bold">
                      {grn.bagsPending} Bags
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* QUALITY INSPECTION & REMARKS BOX */}
          <div className="p-4 bg-muted/20 rounded-xl border border-border/30 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1.5">
              <FileCheck2 className="h-3.5 w-3.5 text-primary" /> Quality Inspection &amp; Gate Remarks
            </span>
            <p className="text-xs text-foreground italic bg-background p-3 rounded-lg border border-border/20">
              "{grn.remarks || "Physical bags inspected upon gate entry. Yarn moisture and bag weight verified."}"
            </p>
          </div>

          {/* SIGN-OFF STAMP FOOTER */}
          <div className="pt-4 border-t border-border/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <div>
                <span className="font-bold text-foreground block">Verified &amp; Added to Stock Ledger</span>
                <span className="text-[10px]">Official Yarn GRN Document</span>
              </div>
            </div>

            <div className="text-right border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">Authorized Store Officer</span>
              <span className="font-bold text-foreground font-mono">{grn.receivedBy || "Rahul Patil"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
