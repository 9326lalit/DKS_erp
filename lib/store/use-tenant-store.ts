import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useERPStore, BusinessDetails, FactoryDetails, FinancialYearDetails } from "./use-erp-store";

export interface TenantUnit {
  id: string;
  name: string;
  code: string;
  type: string;
  location: string;
  status: "Operational" | "Maintenance" | "Planning Phase";
  totalLooms: number;
}

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: "Global Super Admin" | "Super Admin" | "Owner" | "Mill Manager" | "Production Head" | "Accountant" | "Supervisor";
  avatarUrl: string;
  phone: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo: string;
  tagline: string;
  cluster: string;
  plan: "Enterprise" | "Pro" | "Standard";
  status: "Active" | "Trial" | "Suspended";
  currency: string;
  businessDetails: BusinessDetails;
  factoryDetails: FactoryDetails;
  financialYearDetails: FinancialYearDetails;
  units: TenantUnit[];
  users: TenantUser[];
}

export const GLOBAL_SUPER_ADMIN_USER: TenantUser = {
  id: "global-super-admin-01",
  name: "DKS SaaS Super Admin",
  email: "superadmin@dks-erp.com",
  role: "Global Super Admin",
  avatarUrl: "/images/avatars/01.png",
  phone: "+91 99999 00000"
};

// Initial 4 Multi-Tenant Seed Organizations with rich real-world Textile Mill data
export const SEED_TENANTS: Tenant[] = [
  {
    id: "dhandai-textiles",
    name: "Dhandai Textiles",
    slug: "dhandai-textiles",
    logo: "🏭",
    tagline: "24x7 Cotton Powerloom & Airjet Weaving Mill",
    cluster: "Ichalkaranji, Maharashtra",
    plan: "Enterprise",
    status: "Active",
    currency: "INR",
    businessDetails: {
      businessName: "Dhandai Textiles",
      ownerName: "Bhushan Khairnar",
      gstNumber: "27AAIPK1234F1Z5",
      panNumber: "AAIPK1234F",
      businessType: "Proprietorship",
      industry: "100% Cotton Weaving",
      phone: "+91 98230 11223",
      alternativePhone: "+91 98765 43210",
      email: "owner@dhandaitextiles.com",
      website: "www.dhandaitextiles.com",
      addressLine1: "Plot No. 18, MIDC Industrial Zone",
      addressLine2: "Textile Park",
      city: "Ichalkaranji",
      district: "Kolhapur",
      state: "Maharashtra",
      country: "India",
      pincode: "416115",
      currency: "INR",
      timezone: "Asia/Kolkata",
      logoUrl: "",
      businessDescription: "High-efficiency powerloom & airjet weaving mill specializing in 100% cotton warp and weft fabric manufacturing operating 24x7."
    },
    factoryDetails: {
      factoryName: "Ichalkaranji Unit-I (Main Shed)",
      factoryCode: "DT-01",
      factoryType: "Airjet & Rapier Weaving Shed",
      factoryAddress: "Plot No. 18, MIDC Industrial Zone, Ichalkaranji",
      city: "Ichalkaranji",
      district: "Kolhapur",
      state: "Maharashtra",
      country: "India",
      pincode: "416115",
      latitude: "16.6978",
      longitude: "74.4649",
      factoryManager: "Bhushan Khairnar",
      phone: "+91 98230 11223",
      email: "owner@dhandaitextiles.com",
      factoryImageUrl: "",
      workingHours: "24 Hours (Continuous Run)",
      shiftSystem: "2-Shift System (12 Hours each)",
      morningShiftStart: "08:00 AM",
      morningShiftEnd: "08:00 PM",
      nightShiftStart: "08:00 PM",
      nightShiftEnd: "08:00 AM",
      totalLooms: 24,
      factoryStatus: "Active"
    },
    financialYearDetails: {
      financialYear: "2026-2027",
      openingDate: "2026-04-01",
      closingDate: "2027-03-31",
      openingStockDate: "2026-04-01",
      currency: "INR",
      defaultTax: 5
    },
    units: [
      {
        id: "dt-unit-1",
        name: "Ichalkaranji Unit-I (Main Weaving Shed)",
        code: "DT-U1",
        type: "Airjet & Rapier Shed",
        location: "Plot 18, MIDC Ichalkaranji",
        status: "Operational",
        totalLooms: 24
      },
      {
        id: "dt-unit-2",
        name: "Kolhapur Sizing-II & Beam Processing",
        code: "DT-U2",
        type: "Sizing & Warping Plant",
        location: "Plot 42, Textile Park, Kolhapur",
        status: "Operational",
        totalLooms: 0
      }
    ],
    users: [
      {
        id: "user-1",
        name: "Bhushan Khairnar",
        email: "owner@dhandaitextiles.com",
        role: "Super Admin",
        avatarUrl: "/images/avatars/01.png",
        phone: "+91 98230 11223"
      },
      {
        id: "user-1b",
        name: "Sanjay Jobber",
        email: "jobber@dhandaitextiles.com",
        role: "Supervisor",
        avatarUrl: "/images/avatars/02.png",
        phone: "+91 98230 44556"
      }
    ]
  },
  {
    id: "royal-fabrics",
    name: "Royal Fabrics & Weaving",
    slug: "royal-fabrics",
    logo: "🧵",
    tagline: "High-Speed Electronic Jacquard Fabric Mill",
    cluster: "Surat, Gujarat",
    plan: "Pro",
    status: "Active",
    currency: "INR",
    businessDetails: {
      businessName: "Royal Fabrics & Weaving Pvt Ltd",
      ownerName: "Rajesh Shah",
      gstNumber: "24ABBCR5678G1ZP",
      panNumber: "ABBCR5678G",
      businessType: "Private Limited",
      industry: "Jacquard & Synthetic Fabrics",
      phone: "+91 98980 22334",
      email: "admin@royalfabrics.com",
      website: "www.royalfabricssurat.com",
      addressLine1: "B-405, GIDC Industrial Estate",
      addressLine2: "Sachin Area",
      city: "Surat",
      district: "Surat",
      state: "Gujarat",
      country: "India",
      pincode: "394230",
      currency: "INR",
      timezone: "Asia/Kolkata",
      businessDescription: "Premier Jacquard fabric weaving plant with 36 high-speed electronic Jacquard rapier looms for dress material and fancy sarees."
    },
    factoryDetails: {
      factoryName: "Surat Jacquard Hub - Unit A",
      factoryCode: "RF-01",
      factoryType: "Electronic Jacquard Shed",
      factoryAddress: "B-405, GIDC Industrial Estate, Sachin, Surat",
      city: "Surat",
      district: "Surat",
      state: "Gujarat",
      country: "India",
      pincode: "394230",
      factoryManager: "Rajesh Shah",
      phone: "+91 98980 22334",
      email: "admin@royalfabrics.com",
      workingHours: "24 Hours (3 Shifts)",
      shiftSystem: "3-Shift System (8 Hours each)",
      morningShiftStart: "07:00 AM",
      morningShiftEnd: "03:00 PM",
      nightShiftStart: "11:00 PM",
      nightShiftEnd: "07:00 AM",
      totalLooms: 36,
      factoryStatus: "Active"
    },
    financialYearDetails: {
      financialYear: "2026-2027",
      openingDate: "2026-04-01",
      closingDate: "2027-03-31",
      openingStockDate: "2026-04-01",
      currency: "INR",
      defaultTax: 12
    },
    units: [
      {
        id: "rf-unit-1",
        name: "Surat Jacquard Hub (GIDC Sachin)",
        code: "RF-U1",
        type: "Jacquard Rapier Plant",
        location: "GIDC Sachin, Surat",
        status: "Operational",
        totalLooms: 36
      }
    ],
    users: [
      {
        id: "user-2",
        name: "Rajesh Shah",
        email: "admin@royalfabrics.com",
        role: "Mill Manager",
        avatarUrl: "/images/avatars/03.png",
        phone: "+91 98980 22334"
      }
    ]
  },
  {
    id: "silverthread-denim",
    name: "SilverThread Denim Mills",
    slug: "silverthread-denim",
    logo: "👖",
    tagline: "Heavy Denim & Canvas Weaving Specialist",
    cluster: "Bhiwandi, Maharashtra",
    plan: "Standard",
    status: "Active",
    currency: "INR",
    businessDetails: {
      businessName: "SilverThread Denim Mills",
      ownerName: "Amit Patel",
      gstNumber: "27AACCB9988H1Z1",
      panNumber: "AACCB9988H",
      businessType: "Partnership",
      industry: "Heavy Denim & Canvas",
      phone: "+91 97654 33221",
      email: "manager@silverthread.com",
      website: "www.silverthreaddenim.com",
      addressLine1: "Shed 12, Sonale Warehousing Complex",
      addressLine2: "Bhiwandi Bypass",
      city: "Bhiwandi",
      district: "Thane",
      state: "Maharashtra",
      country: "India",
      pincode: "421302",
      currency: "INR",
      timezone: "Asia/Kolkata",
      businessDescription: "Specialized manufacturer of 12oz to 16oz indigo slub denim warp and heavy cotton twill canvas fabric."
    },
    factoryDetails: {
      factoryName: "Bhiwandi Denim Shed-1",
      factoryCode: "ST-01",
      factoryType: "Heavy Shuttleless Loom Plant",
      factoryAddress: "Sonale Industrial Zone, Bhiwandi",
      city: "Bhiwandi",
      district: "Thane",
      state: "Maharashtra",
      country: "India",
      pincode: "421302",
      factoryManager: "Amit Patel",
      phone: "+91 97654 33221",
      email: "manager@silverthread.com",
      workingHours: "24 Hours Continuous",
      shiftSystem: "2-Shift System (12 Hours each)",
      morningShiftStart: "08:00 AM",
      morningShiftEnd: "08:00 PM",
      nightShiftStart: "08:00 PM",
      nightShiftEnd: "08:00 AM",
      totalLooms: 18,
      factoryStatus: "Active"
    },
    financialYearDetails: {
      financialYear: "2026-2027",
      openingDate: "2026-04-01",
      closingDate: "2027-03-31",
      openingStockDate: "2026-04-01",
      currency: "INR",
      defaultTax: 5
    },
    units: [
      {
        id: "st-unit-1",
        name: "Bhiwandi Denim Complex",
        code: "ST-U1",
        type: "Shuttleless Heavy Shed",
        location: "Sonale Zone, Bhiwandi",
        status: "Operational",
        totalLooms: 18
      }
    ],
    users: [
      {
        id: "user-3",
        name: "Amit Patel",
        email: "manager@silverthread.com",
        role: "Production Head",
        avatarUrl: "/images/avatars/04.png",
        phone: "+91 97654 33221"
      }
    ]
  },
  {
    id: "mahadev-weaving",
    name: "Mahadev Spinning & Weaving",
    slug: "mahadev-weaving",
    logo: "🌐",
    tagline: "Export Quality Fine Cotton & Grey Sheeting Mill",
    cluster: "Coimbatore, Tamil Nadu",
    plan: "Enterprise",
    status: "Active",
    currency: "INR",
    businessDetails: {
      businessName: "Mahadev Spinning & Weaving Mills Ltd",
      ownerName: "Suresh Kumar",
      gstNumber: "33AAACM1122K1Z9",
      panNumber: "AAACM1122K",
      businessType: "Public Limited",
      industry: "Fine Cotton Export Fabrics",
      phone: "+91 94430 88776",
      email: "admin@mahadevweaving.com",
      website: "www.mahadevweaving.com",
      addressLine1: "105, Avinashi Road, Peelamedu",
      addressLine2: "Textile Cluster",
      city: "Coimbatore",
      district: "Coimbatore",
      state: "Tamil Nadu",
      country: "India",
      pincode: "641004",
      currency: "INR",
      timezone: "Asia/Kolkata",
      businessDescription: "State-of-the-art export-oriented mill running 80s and 100s superfine combed cotton yarn weaving high thread count bed linen."
    },
    factoryDetails: {
      factoryName: "Coimbatore Export Shed Alpha",
      factoryCode: "MW-01",
      factoryType: "Export Airjet Plant",
      factoryAddress: "105 Avinashi Road, Peelamedu, Coimbatore",
      city: "Coimbatore",
      district: "Coimbatore",
      state: "Tamil Nadu",
      country: "India",
      pincode: "641004",
      factoryManager: "Suresh Kumar",
      phone: "+91 94430 88776",
      email: "admin@mahadevweaving.com",
      workingHours: "24 Hours Continuous",
      shiftSystem: "3-Shift System (8 Hours each)",
      morningShiftStart: "06:00 AM",
      morningShiftEnd: "02:00 PM",
      nightShiftStart: "10:00 PM",
      nightShiftEnd: "06:00 AM",
      totalLooms: 30,
      factoryStatus: "Active"
    },
    financialYearDetails: {
      financialYear: "2026-2027",
      openingDate: "2026-04-01",
      closingDate: "2027-03-31",
      openingStockDate: "2026-04-01",
      currency: "INR",
      defaultTax: 5
    },
    units: [
      {
        id: "mw-unit-1",
        name: "Coimbatore Main Airjet Plant",
        code: "MW-U1",
        type: "High-speed Airjet",
        location: "Peelamedu, Coimbatore",
        status: "Operational",
        totalLooms: 30
      },
      {
        id: "mw-unit-2",
        name: "Quality Control & Fabric Inspection Lab",
        code: "MW-U2",
        type: "Inspection & Folding",
        location: "Peelamedu, Coimbatore",
        status: "Operational",
        totalLooms: 0
      }
    ],
    users: [
      {
        id: "user-4",
        name: "Suresh Kumar",
        email: "admin@mahadevweaving.com",
        role: "Super Admin",
        avatarUrl: "/images/avatars/05.png",
        phone: "+91 94430 88776"
      }
    ]
  }
];

interface TenantState {
  tenants: Tenant[];
  activeTenantId: string;
  activeUnitId: string;
  currentUser: TenantUser | null;
  isAuthenticated: boolean;
  isGlobalSuperAdmin: boolean;
  isHydrated: boolean;

  // Actions
  setActiveTenant: (tenantId: string) => void;
  setActiveUnit: (unitId: string) => void;
  login: (email: string, password?: string) => { success: boolean; tenantName?: string; isSuperAdmin?: boolean; error?: string };
  loginSuperAdmin: () => void;
  logout: () => void;
  addTenant: (tenant: Tenant) => void;
  deleteTenant: (tenantId: string) => void;
  updateTenantStatus: (tenantId: string, status: "Active" | "Trial" | "Suspended") => void;
  updateTenantPlan: (tenantId: string, plan: "Enterprise" | "Pro" | "Standard") => void;
  updateTenantBusinessDetails: (tenantId: string, details: Partial<BusinessDetails>) => void;
  updateActiveTenantDetails: (business: Partial<BusinessDetails>, factory?: Partial<FactoryDetails>) => void;
  setHydrated: (val: boolean) => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      tenants: SEED_TENANTS,
      activeTenantId: "dhandai-textiles",
      activeUnitId: "dt-unit-1",
      currentUser: SEED_TENANTS[0].users[0],
      isAuthenticated: true,
      isGlobalSuperAdmin: false,
      isHydrated: false,

      setActiveTenant: (tenantId: string) => {
        const tenant = get().tenants.find((t) => t.id === tenantId);
        if (!tenant) return;

        const defaultUnit = tenant.units[0]?.id || "";
        const defaultUser = tenant.users[0] || null;

        set({
          activeTenantId: tenant.id,
          activeUnitId: defaultUnit,
          currentUser: get().isGlobalSuperAdmin ? GLOBAL_SUPER_ADMIN_USER : defaultUser
        });

        // Synchronize with ERP Store details
        const erpStore = useERPStore.getState();
        erpStore.setBusinessDetails(tenant.businessDetails);
        erpStore.setFactoryDetails(tenant.factoryDetails);
        erpStore.setFinancialYearDetails(tenant.financialYearDetails);
      },

      setActiveUnit: (unitId: string) => {
        set({ activeUnitId: unitId });
      },

      loginSuperAdmin: () => {
        set({
          currentUser: GLOBAL_SUPER_ADMIN_USER,
          isAuthenticated: true,
          isGlobalSuperAdmin: true,
          activeTenantId: get().tenants[0].id,
          activeUnitId: get().tenants[0].units[0]?.id || ""
        });
      },

      login: (email: string, _password?: string) => {
        const normalized = email.trim().toLowerCase();

        // Check for Global Super Admin login
        if (normalized === "superadmin@dks-erp.com" || normalized === "superadmin") {
          get().loginSuperAdmin();
          return { success: true, tenantName: "Global SaaS Control Center", isSuperAdmin: true };
        }

        let targetTenant: Tenant | undefined;
        let targetUser: TenantUser | undefined;

        for (const t of get().tenants) {
          const foundUser = t.users.find((u) => u.email.toLowerCase() === normalized);
          if (foundUser) {
            targetTenant = t;
            targetUser = foundUser;
            break;
          }
        }

        if (!targetTenant) {
          if (normalized.includes("royal")) targetTenant = get().tenants.find((t) => t.id === "royal-fabrics");
          else if (normalized.includes("silver")) targetTenant = get().tenants.find((t) => t.id === "silverthread-denim");
          else if (normalized.includes("mahadev")) targetTenant = get().tenants.find((t) => t.id === "mahadev-weaving");
          else targetTenant = get().tenants[0];

          targetUser = targetTenant?.users[0];
        }

        if (targetTenant && targetUser) {
          const defaultUnit = targetTenant.units[0]?.id || "";
          set({
            activeTenantId: targetTenant.id,
            activeUnitId: defaultUnit,
            currentUser: targetUser,
            isAuthenticated: true,
            isGlobalSuperAdmin: false
          });

          // Sync ERP Store
          const erpStore = useERPStore.getState();
          erpStore.setBusinessDetails(targetTenant.businessDetails);
          erpStore.setFactoryDetails(targetTenant.factoryDetails);
          erpStore.setFinancialYearDetails(targetTenant.financialYearDetails);

          return { success: true, tenantName: targetTenant.name, isSuperAdmin: false };
        }

        return { success: false, error: "Invalid credentials" };
      },

      logout: () => {
        set({ isAuthenticated: false, isGlobalSuperAdmin: false });
      },

      addTenant: (newTenant: Tenant) => {
        set((state) => ({
          tenants: [...state.tenants, newTenant],
          activeTenantId: newTenant.id,
          activeUnitId: newTenant.units[0]?.id || "",
          currentUser: state.isGlobalSuperAdmin ? GLOBAL_SUPER_ADMIN_USER : (newTenant.users[0] || null),
          isAuthenticated: true
        }));

        const erpStore = useERPStore.getState();
        erpStore.setBusinessDetails(newTenant.businessDetails);
        erpStore.setFactoryDetails(newTenant.factoryDetails);
        erpStore.setFinancialYearDetails(newTenant.financialYearDetails);
      },

      deleteTenant: (tenantId: string) => {
        set((state) => {
          const filtered = state.tenants.filter((t) => t.id !== tenantId);
          const nextActive = filtered[0] || SEED_TENANTS[0];
          return {
            tenants: filtered,
            activeTenantId: state.activeTenantId === tenantId ? nextActive.id : state.activeTenantId,
            activeUnitId: state.activeTenantId === tenantId ? (nextActive.units[0]?.id || "") : state.activeUnitId
          };
        });
      },

      updateTenantStatus: (tenantId: string, status: "Active" | "Trial" | "Suspended") => {
        set((state) => ({
          tenants: state.tenants.map((t) => (t.id === tenantId ? { ...t, status } : t))
        }));
      },

      updateTenantPlan: (tenantId: string, plan: "Enterprise" | "Pro" | "Standard") => {
        set((state) => ({
          tenants: state.tenants.map((t) => (t.id === tenantId ? { ...t, plan } : t))
        }));
      },

      updateTenantBusinessDetails: (tenantId: string, details: Partial<BusinessDetails>) => {
        set((state) => ({
          tenants: state.tenants.map((t) => {
            if (t.id === tenantId) {
              const updatedBusiness = { ...t.businessDetails, ...details };
              return {
                ...t,
                name: updatedBusiness.businessName || t.name,
                businessDetails: updatedBusiness
              };
            }
            return t;
          })
        }));
      },

      updateActiveTenantDetails: (businessUpdate, factoryUpdate) => {
        const { activeTenantId, tenants } = get();
        const updatedTenants = tenants.map((t) => {
          if (t.id === activeTenantId) {
            const updatedBusiness = { ...t.businessDetails, ...businessUpdate };
            const updatedFactory = factoryUpdate ? { ...t.factoryDetails, ...factoryUpdate } : t.factoryDetails;
            return {
              ...t,
              name: updatedBusiness.businessName || t.name,
              businessDetails: updatedBusiness,
              factoryDetails: updatedFactory
            };
          }
          return t;
        });

        set({ tenants: updatedTenants });
      },

      setHydrated: (val: boolean) => set({ isHydrated: val })
    }),
    {
      name: "dks-multi-tenant-store",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          // Sync ERP Store on hydration
          const currentTenant = state.tenants.find((t) => t.id === state.activeTenantId) || state.tenants[0];
          if (currentTenant) {
            const erpStore = useERPStore.getState();
            erpStore.setBusinessDetails(currentTenant.businessDetails);
            erpStore.setFactoryDetails(currentTenant.factoryDetails);
            erpStore.setFinancialYearDetails(currentTenant.financialYearDetails);
          }
        }
      }
    }
  )
);
