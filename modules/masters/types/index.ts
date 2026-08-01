// Modules / Masters / Types
export interface Factory {
  id: string;
  factoryName: string;
  proprietorName: string;
  contactNumber: string;
  address: string;
  city: string;
  electricityMeterNo: string;
  totalShedAreaSqFt: number;
  totalCapacityLooms: number;
  activeLoomsCount: number;
  idleLoomsCount: number;
  status: "Active" | "Inactive";
}

export interface Loom {
  id: string;
  loomId: string;
  factoryId: string;
  factoryName: string;
  loomNumber: string;
  loomType: "Power Loom" | "Handloom" | "Rapier" | "Shuttle";
  reedCount?: number;
  widthInches?: number;
  rpmSpeed?: number;
  makeBrand?: string;
  yearOfPurchase?: number;
  status: "Active" | "Idle" | "Under Repair";
  assignedLabourId?: string;
  assignedLabourName?: string;
  remarks?: string;
}

export interface SizingMill {
  id: string;
  millName: string;
  contactPerson: string;
  contactNumber: string;
  address: string;
  city: string;
  capacityPerDayKg: number;
  ratePerKgRs: number;
  status: "Active" | "Inactive";
}

export interface Party {
  id: string;
  partyName: string;
  partyType: "Supplier" | "Buyer" | "Job Worker" | "Broker";
  gstin: string;
  contactPerson: string;
  contactNumber: string;
  address: string;
  city: string;
  status: "Active" | "Inactive";
}

export interface Labour {
  id: string;
  fullName: string;
  role: "Weaver" | "Fitter" | "Helper" | "Supervisor";
  contactNumber: string;
  assignedFactoryId?: string;
  assignedFactoryName?: string;
  dailyWagesRs: number;
  status: "Active" | "Inactive";
}
