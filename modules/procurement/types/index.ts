// Modules / Procurement / Types

export interface POItem {
  id: string;
  itemName: string;
  hsnCode?: string;
  totalBagsOrdered: number;
  perBagWeightKg: number;
  totalWeightKg: number;
  ratePerKg: number;
  grossAmount: number;
  cgstPercent: number;
  sgstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  totalTaxAmount: number;
  netPayable: number;
  itemRemarks?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  materialType: "Tana" | "Bana";
  poDate: string;
  purchaseFromId: string;
  purchaseFromName: string;
  purchaseToId: string;
  purchaseToName: string;
  deliveryAddress: string;
  expectedDeliveryDate: string;
  paymentTerms: string;

  items?: POItem[];
  itemName?: string;
  hsnCode?: string;
  totalBagsOrdered?: number;
  perBagWeightKg?: number;
  totalWeightKg?: number;
  ratePerKg?: number;

  grossAmount: number;
  cgstPercent: number;
  sgstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  totalTaxAmount: number;
  netPayable: number;
  amountInWords?: string;

  bagsReceivedCount: number;
  weightReceivedKg: number;
  bagsPendingCount: number;
  status: "Pending" | "Partially Delivered" | "Completed" | "Cancelled";
  remarks?: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  grnDate: string;
  linkedPOId: string;
  linkedPONumber: string;
  supplierId: string;
  supplierName: string;
  vehicleNo?: string;
  lrNo?: string;

  bagsOrdered: number;
  bagsPreviouslyReceived: number;
  bagsReceivedThisGRN: number;
  bagsPending: number;
  perBagWeightKg: number;
  totalWeightReceived: number;
  ratePerKg?: number;

  conditionCheck: "Good" | "Damaged" | "Rejected";
  receivedBy: string;
  status: "Pending" | "Partial" | "Completed";
  remarks?: string;
}

export interface PurchaseInvoice {
  id: string;
  piNumber: string;
  piDate: string;
  linkedGRNId: string;
  linkedGRNNumber: string;
  linkedPOId: string;
  linkedPONumber: string;
  supplierId: string;
  supplierName: string;
  supplierInvoiceNo: string;
  supplierInvoiceDate: string;

  itemDescription: string;
  hsnCode?: string;
  totalBags: number;
  totalWeightKg: number;
  ratePerKg: number;
  taxableAmount: number;

  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTaxAmount: number;
  roundOff: number;

  netPayable: number;
  amountInWords?: string;
  dueDate: string;
  paymentTermsDays: number;
  paymentStatus: "Pending" | "Partially Paid" | "Paid";
  sanctionRemarks?: string;
}
