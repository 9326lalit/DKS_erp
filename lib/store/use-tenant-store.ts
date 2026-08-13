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

export type UserRole =
  | "Global Super Admin"
  | "Factory Owner"
  | "Business Owner"
  | "Super Admin"
  | "Owner"
  | "Mill Manager"
  | "Production Head"
  | "Accountant"
  | "Supervisor";

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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

export interface RolePermissionConfig {
  role: UserRole;
  title: string;
  badgeColor: string;
  allowedNavGroupTitles: string[];
  description: string;
}

const FACTORY_OWNER_PERMISSION: RolePermissionConfig = {
  role: "Factory Owner",
  title: "Factory Owner / Mill Principal",
  badgeColor: "bg-emerald-600 text-white font-bold border-emerald-500",
  allowedNavGroupTitles: ["Operations", "Master Data", "Yarn (Tana & Bana)", "Weaving & Production", "Procurement & Sizing", "Financials & Reports"],
  description: "Full Mill Owner Access: Master Registries, Factory Sheds, Yarn Purchasing, Weaving Production, Financial Billing & System Controls."
};

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissionConfig> = {
  "Global Super Admin": {
    role: "Global Super Admin",
    title: "Global SaaS Platform Super Admin",
    badgeColor: "bg-amber-500 text-slate-950 font-bold border-amber-400",
    allowedNavGroupTitles: ["SaaS Control Center"],
    description: "SaaS Executive Scope: Platform Overview, Tenant Directory, Global Factories, Billing Subscriptions & Audit Logs."
  },
  "Factory Owner": FACTORY_OWNER_PERMISSION,
  "Business Owner": FACTORY_OWNER_PERMISSION,
  "Super Admin": FACTORY_OWNER_PERMISSION,
  "Owner": FACTORY_OWNER_PERMISSION,
  "Mill Manager": FACTORY_OWNER_PERMISSION,
  "Production Head": FACTORY_OWNER_PERMISSION,
  "Accountant": FACTORY_OWNER_PERMISSION,
  "Supervisor": FACTORY_OWNER_PERMISSION
};

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
        id: "user-1-owner",
        name: "Bhushan Khairnar",
        email: "owner@dhandaitextiles.com",
        role: "Factory Owner",
        avatarUrl: "/images/avatars/01.png",
        phone: "+91 98230 11223"
      }
    ]
  },
  {
    id: "lalit-textiles",
    name: "Lalit Textiles & Weaving",
    slug: "lalit-textiles",
    logo: "🧵",
    tagline: "High-Speed Rapier & Airjet Cotton Mill",
    cluster: "Ichalkaranji, Maharashtra",
    plan: "Pro",
    status: "Active",
    currency: "INR",
    businessDetails: {
      businessName: "Lalit Textiles & Weaving Works",
      ownerName: "Lalit Patil",
      gstNumber: "27AABCL5678L1ZP",
      panNumber: "AABCL5678L",
      businessType: "Proprietorship",
      industry: "Rapier & Airjet Weaving",
      phone: "+91 99220 88990",
      email: "owner@lalittextiles.com",
      website: "www.lalittextiles.com",
      addressLine1: "Plot No. 45, Powerloom Park",
      addressLine2: "Kolhapur Road",
      city: "Ichalkaranji",
      district: "Kolhapur",
      state: "Maharashtra",
      country: "India",
      pincode: "416115",
      currency: "INR",
      timezone: "Asia/Kolkata",
      businessDescription: "High-speed rapier and airjet weaving plant specializing in fine cotton fabric & export sheeting."
    },
    factoryDetails: {
      factoryName: "Lalit Textiles Weaving Shed-I",
      factoryCode: "LT-01",
      factoryType: "Rapier & Airjet Shed",
      factoryAddress: "Plot No. 45, Powerloom Park, Ichalkaranji",
      city: "Ichalkaranji",
      district: "Kolhapur",
      state: "Maharashtra",
      country: "India",
      pincode: "416115",
      factoryManager: "Lalit Patil",
      phone: "+91 99220 88990",
      email: "owner@lalittextiles.com",
      workingHours: "24 Hours Continuous",
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
        id: "lt-unit-1",
        name: "Lalit Textiles Main Shed",
        code: "LT-U1",
        type: "Rapier Shed",
        location: "Powerloom Park, Ichalkaranji",
        status: "Operational",
        totalLooms: 24
      }
    ],
    users: [
      {
        id: "user-lt-owner",
        name: "Lalit Patil",
        email: "owner@lalittextiles.com",
        role: "Factory Owner",
        avatarUrl: "/images/avatars/03.png",
        phone: "+91 99220 88990"
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
  switchRole: (role: UserRole) => void;
  login: (email: string, password?: string) => { success: boolean; tenantName?: string; isSuperAdmin?: boolean; role?: UserRole; error?: string };
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
  persist<TenantState, [], [], TenantState>(
    (set, get) => ({
      tenants: SEED_TENANTS,
      activeTenantId: "dhandai-textiles",
      activeUnitId: "dt-unit-1",
      currentUser: SEED_TENANTS[0].users[0] as TenantUser | null,
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

      switchRole: (newRole: UserRole) => {
        if (newRole === "Global Super Admin") {
          get().loginSuperAdmin();
          return;
        }

        const { activeTenantId, tenants } = get();
        const currentTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];
        const matchingUser = currentTenant.users.find((u) => u.role === newRole);

        if (matchingUser) {
          set({ currentUser: matchingUser, isGlobalSuperAdmin: false });
        } else {
          // Synthesize user for role
          set({
            currentUser: {
              id: `role-user-${newRole.toLowerCase().replace(/[^a-z]/g, "")}`,
              name: `${currentTenant.businessDetails.ownerName} (${newRole})`,
              email: `${newRole.toLowerCase().replace(/[^a-z]/g, "")}@${currentTenant.slug}.com`,
              role: newRole,
              avatarUrl: "/images/avatars/01.png",
              phone: currentTenant.businessDetails.phone
            },
            isGlobalSuperAdmin: false
          });
        }
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
          return {
            success: true,
            tenantName: "Global SaaS Control Center",
            isSuperAdmin: true, role: "Global Super Admin"
          };
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
          targetTenant = get().tenants[0];
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

          return { success: true, tenantName: targetTenant.name, isSuperAdmin: false, role: targetUser.role };
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
      name: "dks-multi-tenant-store-v5",
      onRehydrateStorage: () => (state?: TenantState) => {
        if (state) {
          state.setHydrated(true);
          state.tenants = SEED_TENANTS;
          // Sync ERP Store on hydration
          const currentTenant = SEED_TENANTS.find((t) => t.id === state.activeTenantId) || SEED_TENANTS[0];
          if (currentTenant) {
            const erpStore = useERPStore.getState();
            erpStore.setBusinessDetails(currentTenant.businessDetails);
            erpStore.setFactoryDetails(currentTenant.factoryDetails);
            erpStore.setFinancialYearDetails(currentTenant.financialYearDetails);
          }
        }
      }
    }
  ) as any
);
