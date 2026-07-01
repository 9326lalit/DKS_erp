import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BusinessDetails {
  businessName: string;
  ownerName: string;
  gstNumber: string;
  panNumber: string;
  businessType: string;
  industry: string;
  phone: string;
  alternativePhone?: string;
  email: string;
  website?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  currency: string;
  timezone: string;
  logoUrl?: string;
  businessDescription?: string;
}

export interface FactoryDetails {
  factoryName: string;
  factoryCode: string;
  factoryType: string;
  factoryAddress: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  latitude?: string;
  longitude?: string;
  factoryManager: string;
  phone: string;
  email: string;
  factoryImageUrl?: string;
  workingHours: string;
  shiftSystem: string;
  morningShiftStart: string;
  morningShiftEnd: string;
  nightShiftStart: string;
  nightShiftEnd: string;
  totalLooms: number;
  factoryStatus: string;
}

export interface FinancialYearDetails {
  financialYear: string;
  openingDate: string;
  closingDate: string;
  openingStockDate: string;
  currency: string;
  defaultTax: number;
}

interface ERPState {
  isOnboardingCompleted: boolean;
  onboardingStep: number;
  businessDetails: BusinessDetails | null;
  factoryDetails: FactoryDetails | null;
  financialYearDetails: FinancialYearDetails | null;
  isHydrated: boolean;
  
  // Actions
  setBusinessDetails: (details: BusinessDetails) => void;
  setFactoryDetails: (details: FactoryDetails) => void;
  setFinancialYearDetails: (details: FinancialYearDetails) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setHydrated: (val: boolean) => void;
}

const DEFAULT_BUSINESS: BusinessDetails = {
  businessName: "Khairnar Textile Industries",
  ownerName: "Lalit Khairnar",
  gstNumber: "27AABCU1234F1Z5",
  panNumber: "AABCU1234F",
  businessType: "Proprietorship",
  industry: "Textile Manufacturing",
  phone: "+91 98765 43210",
  alternativePhone: "+91 98765 43211",
  email: "contact@khairnartextile.com",
  website: "www.khairnartextile.com",
  addressLine1: "Plot No. 45-48, MIDC Industrial Area",
  addressLine2: "Near Power House",
  city: "Ichalkaranji",
  district: "Kolhapur",
  state: "Maharashtra",
  country: "India",
  pincode: "416115",
  currency: "INR",
  timezone: "Asia/Kolkata",
  logoUrl: "",
  businessDescription: "State-of-the-art weaving mill specializing in 100% cotton grey fabric manufacturing with high efficiency airjet and rapier looms operating 24x7."
};

const DEFAULT_FACTORY: FactoryDetails = {
  factoryName: "Ichalkaranji Weaving Unit-I",
  factoryCode: "IWU-01",
  factoryType: "Powerloom Shed",
  factoryAddress: "Plot No. 45-48, MIDC Industrial Area, Ichalkaranji",
  city: "Ichalkaranji",
  district: "Kolhapur",
  state: "Maharashtra",
  country: "India",
  pincode: "416115",
  latitude: "16.6978",
  longitude: "74.4649",
  factoryManager: "Sanjay Patil",
  phone: "+91 98230 11223",
  email: "sanjay.patil@khairnartextile.com",
  factoryImageUrl: "",
  workingHours: "24 Hours (Continuous Run)",
  shiftSystem: "2-Shift System (12 Hours each)",
  morningShiftStart: "07:30 AM",
  morningShiftEnd: "07:30 PM",
  nightShiftStart: "07:30 PM",
  nightShiftEnd: "07:30 AM",
  totalLooms: 36,
  factoryStatus: "Active"
};

const DEFAULT_FY: FinancialYearDetails = {
  financialYear: "2026-2027",
  openingDate: "2026-04-01",
  closingDate: "2027-03-31",
  openingStockDate: "2026-04-01",
  currency: "INR",
  defaultTax: 5
};

export const useERPStore = create<ERPState>()(
  persist(
    (set) => ({
      isOnboardingCompleted: false,
      onboardingStep: 0,
      businessDetails: null, // Start empty so form validates, but we can seed in wizard
      factoryDetails: null,
      financialYearDetails: null,
      isHydrated: false,

      setBusinessDetails: (details) => set({ businessDetails: details }),
      setFactoryDetails: (details) => set({ factoryDetails: details }),
      setFinancialYearDetails: (details) => set({ financialYearDetails: details }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      completeOnboarding: () => set({ isOnboardingCompleted: true }),
      resetOnboarding: () =>
        set({
          isOnboardingCompleted: false,
          onboardingStep: 0,
          businessDetails: null,
          factoryDetails: null,
          financialYearDetails: null
        }),
      setHydrated: (val) => set({ isHydrated: val })
    }),
    {
      name: "dks-textile-erp-setup",
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated(true);
      }
    }
  )
);

// Helper helper to get values or fallback defaults (for easy demo seeding)
export const getSeedBusiness = () => DEFAULT_BUSINESS;
export const getSeedFactory = () => DEFAULT_FACTORY;
export const getSeedFY = () => DEFAULT_FY;
