"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { tanaApiService } from "@/lib/services/tana-api";
import { numberToWords } from "@/lib/store/use-tana-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Printer,
  FileDown,
  Building2,
  FileText,
  CheckCircle2,
  Calendar,
  DollarSign,
  ShieldCheck,
  Percent
} from "lucide-react";

const paymentStatusColors: Record<string, string> = {
  Pending: "bg-red-500/10 text-red-600 border-red-500/20",
  "Partially Paid": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
};

export default function TanaInvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params?.id;

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["tana-pis"],
    queryFn: () => tanaApiService.getPIs()
  });

  const pi = invoices.find((i) => i.id === id || i.piNumber === id) || invoices[0];

  if (!pi) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-foreground">Tana Invoice Not Found</h2>
          <p className="text-sm text-muted-foreground mt-2">The requested Purchase Invoice ID does not exist.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/tana/invoices">Return to Invoices List</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const hsnCode = (pi as any).hsnCode || "5205";
  const cgstPercent = pi.cgstPercent || 6;
  const sgstPercent = pi.sgstPercent || 6;
  const igstPercent = (pi as any).igstPercent || 0;
  const isInterState = igstPercent > 0;

  const cgstAmount = pi.cgstAmount || pi.taxableAmount * (cgstPercent / 100);
  const sgstAmount = pi.sgstAmount || pi.taxableAmount * (sgstPercent / 100);
  const igstAmount = (pi as any).igstAmount || (isInterState ? pi.taxableAmount * (igstPercent / 100) : 0);
  const totalTaxAmount = (pi as any).totalTaxAmount || cgstAmount + sgstAmount + igstAmount;

  return (
    <PageContainer>
      <PageHeader
        title={`Purchase Invoice: ${pi.piNumber}`}
        description={`Tax Purchase Invoice document for Tana (Warp Yarn) received from ${pi.supplierName}.`}
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Tana Module", href: "/dashboard/tana/invoices" },
          { title: "Invoices", href: "/dashboard/tana/invoices" },
          { title: pi.piNumber }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="h-9 gap-1.5 cursor-pointer">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="h-9 gap-1.5 cursor-pointer">
              <Printer className="h-4 w-4" /> Print Tax Invoice
            </Button>
          </div>
        }
      />

      {/* Printable Invoice Container */}
      <Card className="border-border/40 shadow-md bg-card print:border-none print:shadow-none mb-6">
        <CardContent className="p-8 space-y-6">
          {/* Company & Supplier Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-border/40 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold font-display text-foreground uppercase tracking-wide">
                  Dhandai Textiles ERP
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Plot 18, MIDC Industrial Zone, Ichalkaranji - 416115, Maharashtra
              </p>
              <p className="text-xs text-muted-foreground">
                GSTIN: <span className="font-mono font-bold text-foreground">27AAACD9876E1Z5</span> • State: Maharashtra (27)
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <Badge className="bg-primary text-primary-foreground font-mono text-sm px-3 py-1">
                TAX PURCHASE INVOICE
              </Badge>
              <h3 className="text-base font-bold font-mono text-foreground mt-2">{pi.piNumber}</h3>
              <p className="text-xs text-muted-foreground">
                Invoice Date: <span className="font-semibold text-foreground">{pi.piDate}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Payment Status:{" "}
                <Badge
                  variant="outline"
                  className={`${paymentStatusColors[pi.paymentStatus]} font-bold text-[10px]`}
                >
                  {pi.paymentStatus}
                </Badge>
              </p>
            </div>
          </div>

          {/* Supplier & Linked References Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs bg-muted/10 p-4 rounded-xl border border-border/30">
            <div className="space-y-1">
              <span className="font-bold text-primary uppercase tracking-wider block">Supplier / Bill From:</span>
              <h4 className="font-bold text-sm text-foreground">{pi.supplierName}</h4>
              <p className="text-muted-foreground">Supplier Invoice #: <span className="font-mono font-bold text-foreground">{pi.supplierInvoiceNo}</span></p>
              <p className="text-muted-foreground">Supplier Invoice Date: <span className="font-semibold text-foreground">{pi.supplierInvoiceDate}</span></p>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="font-bold text-primary uppercase tracking-wider block">Linked References:</span>
              <p className="text-muted-foreground">Linked PO #: <span className="font-mono text-primary font-bold">{pi.linkedPONumber}</span></p>
              <p className="text-muted-foreground">Linked GRN #: <span className="font-mono text-foreground font-bold">{pi.linkedGRNNumber}</span></p>
              <p className="text-muted-foreground">Payment Due Date: <span className="font-bold text-red-600">{pi.dueDate}</span> ({pi.paymentTermsDays} Days Credit)</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto rounded-xl border border-border/40">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="text-xs font-bold">Item Description</TableHead>
                  <TableHead className="text-xs font-bold">HSN/SAC</TableHead>
                  <TableHead className="text-xs font-bold text-right">Net Wt (Kg)</TableHead>
                  <TableHead className="text-xs font-bold text-right">Rate / Kg (₹)</TableHead>
                  <TableHead className="text-xs font-bold text-right">Taxable Value (₹)</TableHead>
                  {!isInterState ? (
                    <>
                      <TableHead className="text-xs font-bold text-right">CGST ({cgstPercent}%)</TableHead>
                      <TableHead className="text-xs font-bold text-right">SGST ({sgstPercent}%)</TableHead>
                    </>
                  ) : (
                    <TableHead className="text-xs font-bold text-right">IGST ({igstPercent}%)</TableHead>
                  )}
                  <TableHead className="text-xs font-bold text-right">Line Total (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="text-xs">
                  <TableCell className="font-semibold text-foreground">{pi.itemDescription}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{hsnCode}</TableCell>
                  <TableCell className="text-right font-mono font-bold">{pi.totalWeightKg} kg</TableCell>
                  <TableCell className="text-right font-mono">₹{pi.ratePerKg}</TableCell>
                  <TableCell className="text-right font-mono font-bold">₹{pi.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                  {!isInterState ? (
                    <>
                      <TableCell className="text-right font-mono text-emerald-600">₹{cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right font-mono text-emerald-600">₹{sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                    </>
                  ) : (
                    <TableCell className="text-right font-mono text-emerald-600">₹{igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                  )}
                  <TableCell className="text-right font-mono font-bold text-primary">₹{(pi.taxableAmount + totalTaxAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Tax Summary Breakdown Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-border/40 bg-muted/10 space-y-1 text-xs">
                <span className="font-bold text-foreground block">HSN Tax Breakdown Summary:</span>
                <p className="text-muted-foreground text-[11px]">
                  HSN {hsnCode} @ {!isInterState ? `${cgstPercent}% CGST + ${sgstPercent}% SGST (${cgstPercent + sgstPercent}%)` : `${igstPercent}% IGST`}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Taxable Amount: ₹{pi.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} • Tax: ₹{totalTaxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>

              {(pi as any).sanctionRemarks && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Sanction & Approval Note:
                  </span>
                  <p className="italic">"{(pi as any).sanctionRemarks}"</p>
                </div>
              )}
            </div>

            {/* Totals Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/20 text-muted-foreground">
                <span>Subtotal (Taxable Value):</span>
                <span className="font-mono font-semibold text-foreground">₹{pi.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>

              {!isInterState ? (
                <>
                  <div className="flex justify-between py-1 border-b border-border/20 text-muted-foreground">
                    <span>CGST ({cgstPercent}%):</span>
                    <span className="font-mono text-emerald-600">₹{cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/20 text-muted-foreground">
                    <span>SGST ({sgstPercent}%):</span>
                    <span className="font-mono text-emerald-600">₹{sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between py-1 border-b border-border/20 text-muted-foreground">
                  <span>IGST ({igstPercent}%):</span>
                  <span className="font-mono text-emerald-600">₹{igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-border/20 text-muted-foreground">
                <span>Round Off:</span>
                <span className="font-mono">₹{(pi.roundOff || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 font-bold text-sm text-foreground bg-primary/5 p-3 rounded-xl border border-primary/20">
                <span>Grand Total Net Payable:</span>
                <span className="font-mono text-primary text-base">₹{pi.netPayable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>

              <p className="text-[11px] font-bold text-primary italic text-right pt-1">
                "{pi.amountInWords || numberToWords(Math.round(pi.netPayable))}"
              </p>
            </div>
          </div>

          <Separator />

          {/* Footer Terms & Signature Block */}
          <div className="grid grid-cols-2 gap-6 text-[11px] text-muted-foreground pt-4">
            <div>
              <span className="font-bold text-foreground block mb-1">Terms & Conditions:</span>
              <p>1. Goods once sold will not be taken back without authorization.</p>
              <p>2. Interest @ 18% p.a. will be charged if payment is delayed beyond due date.</p>
              <p>3. Subject to Ichalkaranji Jurisdiction.</p>
            </div>

            <div className="text-right space-y-12">
              <span className="font-bold text-foreground block">For Dhandai Textiles (Own Firm)</span>
              <span className="block text-xs font-semibold text-foreground border-t border-border/40 inline-block pt-1 min-w-40 text-center">
                Authorized Signatory
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
