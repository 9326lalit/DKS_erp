// Modules / Sizing / Types

export interface SizingBatch {
  id: string;
  batchNumber: string;
  dateIssuedToSizing: string;
  bagsIssued: number;
  weightIssuedKg: number;
  bhimCount: number;
  cutPerBhim: number;
  totalCuts: number;
  totalPipes: number;

  materialUsedKg: number;
  sizingChemicalAddedKg?: number;
  gainPercent?: number;

  ratePerKg: number;
  sizingChargesRs: number;
  cgstPercent?: number;
  sgstPercent?: number;
  totalAmountRs?: number;

  sizingDoneBy: "In-house" | "Outsourced";
  outsourcedPartyId?: string;
  outsourcedPartyName?: string;

  status: "In Process" | "Completed" | "Dispatched";
  remarks?: string;
}

export interface OpeningStockEntry {
  id: string;
  date: string;
  sizingName: string;
  materialOwner: string;
  poNumber: string;
  tanaNumber: string;
  itemName: string;
  totalBags: number;
  totalWeightKg: number;
  setNumber: string;
  totalTaar: number;
  totalPipes: number;
  weightPerPipeKg: number;
  totalSetWeightKg?: number;
  materialUsedKg: number;
  sizingChemicalAddedKg?: number;
  remainingStockKg: number;
  remarks?: string;
}

export interface PipeItem {
  id: string;
  pipeNumber: string;
  setNumber: string;
  poNumber: string;
  tanaNumber: string;
  itemName: string;
  weightKg: number;
  status: "Available" | "Mounted on Loom" | "Empty Pipe" | "In Transit";
  currentLocation: string;
  date: string;
}

export interface FactoryReceivingEntry {
  id: string;
  date: string;
  sizingName: string;
  poNumber: string;
  setNumber: string;
  bhimReceived: number;
  pipesReceived: number;
  remarks?: string;
  status: "Received" | "Partial" | "Pending";
}
