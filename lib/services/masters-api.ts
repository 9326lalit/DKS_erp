// Masters API Service — Phase 1 Textile ERP (Strict Multi-Tenant Scoping)

import { useMastersStore, Factory, Loom, Fabric, Party, Labour, Employee, ExpenseCategory, Yarn, Shift, Warehouse, Unit, SizingMill } from "@/lib/store/use-masters-store";
import { useTenantStore } from "@/lib/store/use-tenant-store";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getTenantFilter = () => {
  const state = useTenantStore.getState();
  if (state.isGlobalSuperAdmin) return null; // Global Super Admin sees all
  return state.activeTenantId || "dhandai-textiles";
};

export const mastersApiService = {
  // ---------- FACTORIES ----------
  async getFactories(): Promise<Factory[]> {
    await delay(100);
    const tenantId = getTenantFilter();
    const factories = useMastersStore.getState().factories;
    if (!tenantId) return factories;
    return factories.filter((f) => f.tenantId === tenantId);
  },
  async createFactory(factory: Factory): Promise<Factory> {
    await delay(200);
    const tenantId = useTenantStore.getState().activeTenantId;
    const scoped = { ...factory, tenantId: factory.tenantId || tenantId };
    useMastersStore.getState().createFactory(scoped);
    return scoped;
  },
  async updateFactory(factory: Factory): Promise<Factory> {
    await delay(200);
    useMastersStore.getState().updateFactory(factory);
    return factory;
  },
  async deleteFactory(id: string): Promise<void> {
    await delay(150);
    useMastersStore.getState().deleteFactory(id);
  },

  // ---------- LOOMS ----------
  async getLooms(): Promise<Loom[]> {
    await delay(100);
    const tenantId = getTenantFilter();
    const looms = useMastersStore.getState().looms;
    if (!tenantId) return looms;
    return looms.filter((l) => l.tenantId === tenantId);
  },
  async createLoom(loom: Loom): Promise<Loom> {
    await delay(200);
    const tenantId = useTenantStore.getState().activeTenantId;
    const scoped = { ...loom, tenantId: loom.tenantId || tenantId };
    useMastersStore.getState().createLoom(scoped);
    return scoped;
  },
  async updateLoom(loom: Loom): Promise<Loom> {
    await delay(200);
    useMastersStore.getState().updateLoom(loom);
    return loom;
  },
  async deleteLoom(id: string): Promise<void> {
    await delay(150);
    useMastersStore.getState().deleteLoom(id);
  },

  // ---------- FABRICS ----------
  async getFabrics(): Promise<Fabric[]> {
    await delay(100);
    const tenantId = getTenantFilter();
    const fabrics = useMastersStore.getState().fabrics;
    if (!tenantId) return fabrics;
    return fabrics.filter((f) => f.tenantId === tenantId);
  },
  async createFabric(fabric: Fabric): Promise<Fabric> {
    await delay(200);
    const tenantId = useTenantStore.getState().activeTenantId;
    const scoped = { ...fabric, tenantId: fabric.tenantId || tenantId };
    useMastersStore.getState().createFabric(scoped);
    return scoped;
  },
  async updateFabric(fabric: Fabric): Promise<Fabric> {
    await delay(200);
    useMastersStore.getState().updateFabric(fabric);
    return fabric;
  },
  async deleteFabric(id: string): Promise<void> {
    await delay(150);
    useMastersStore.getState().deleteFabric(id);
  },

  // ---------- PARTIES ----------
  async getParties(): Promise<Party[]> {
    await delay(100);
    const tenantId = getTenantFilter();
    const parties = useMastersStore.getState().parties;
    if (!tenantId) return parties;
    return parties.filter((p) => p.tenantId === tenantId);
  },
  async createParty(party: Party): Promise<Party> {
    await delay(200);
    const tenantId = useTenantStore.getState().activeTenantId;
    const scoped = { ...party, tenantId: party.tenantId || tenantId };
    useMastersStore.getState().createParty(scoped);
    return scoped;
  },
  async updateParty(party: Party): Promise<Party> {
    await delay(200);
    useMastersStore.getState().updateParty(party);
    return party;
  },
  async deleteParty(id: string): Promise<void> {
    await delay(150);
    useMastersStore.getState().deleteParty(id);
  },

  // ---------- LABOUR ----------
  async getLabour(): Promise<Labour[]> {
    await delay(100);
    const tenantId = getTenantFilter();
    const labour = useMastersStore.getState().labour;
    if (!tenantId) return labour;
    return labour.filter((l) => l.tenantId === tenantId);
  },
  async createLabour(labour: Labour): Promise<Labour> {
    await delay(200);
    const tenantId = useTenantStore.getState().activeTenantId;
    const scoped = { ...labour, tenantId: labour.tenantId || tenantId };
    useMastersStore.getState().createLabour(scoped);
    return scoped;
  },
  async updateLabour(labour: Labour): Promise<Labour> {
    await delay(200);
    useMastersStore.getState().updateLabour(labour);
    return labour;
  },
  async deleteLabour(id: string): Promise<void> {
    await delay(150);
    useMastersStore.getState().deleteLabour(id);
  },

  // ---------- EMPLOYEES ----------
  async getEmployees(): Promise<Employee[]> {
    await delay(100);
    const tenantId = getTenantFilter();
    const employees = useMastersStore.getState().employees;
    if (!tenantId) return employees;
    return employees.filter((e) => e.tenantId === tenantId);
  },
  async createEmployee(employee: Employee): Promise<Employee> {
    await delay(200);
    const tenantId = useTenantStore.getState().activeTenantId;
    const scoped = { ...employee, tenantId: employee.tenantId || tenantId };
    useMastersStore.getState().createEmployee(scoped);
    return scoped;
  },
  async updateEmployee(employee: Employee): Promise<Employee> {
    await delay(200);
    useMastersStore.getState().updateEmployee(employee);
    return employee;
  },
  async deleteEmployee(id: string): Promise<void> {
    await delay(150);
    useMastersStore.getState().deleteEmployee(id);
  },

  // ---------- EXPENSE CATEGORIES ----------
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    await delay(100);
    return useMastersStore.getState().expenseCategories;
  },
  async createExpenseCategory(expenseCategory: ExpenseCategory): Promise<ExpenseCategory> {
    await delay(200);
    useMastersStore.getState().createExpenseCategory(expenseCategory);
    return expenseCategory;
  },
  async updateExpenseCategory(expenseCategory: ExpenseCategory): Promise<ExpenseCategory> {
    await delay(200);
    useMastersStore.getState().updateExpenseCategory(expenseCategory);
    return expenseCategory;
  },
  async deleteExpenseCategory(id: string): Promise<void> {
    await delay(150);
    useMastersStore.getState().deleteExpenseCategory(id);
  },

  // ---------- YARNS ----------
  async getYarns(): Promise<Yarn[]> {
    await delay(100);
    const tenantId = getTenantFilter();
    const yarns = useMastersStore.getState().yarns;
    if (!tenantId) return yarns;
    return yarns.filter((y) => y.tenantId === tenantId);
  },
  async createYarn(yarn: Yarn): Promise<Yarn> {
    await delay(200);
    const tenantId = useTenantStore.getState().activeTenantId;
    const scoped = { ...yarn, tenantId: yarn.tenantId || tenantId };
    useMastersStore.getState().createYarn(scoped);
    return scoped;
  },
  async updateYarn(yarn: Yarn): Promise<Yarn> {
    await delay(200);
    useMastersStore.getState().updateYarn(yarn);
    return yarn;
  },
  async deleteYarn(id: string): Promise<void> {
    await delay(150);
    useMastersStore.getState().deleteYarn(id);
  },

  // ---------- SHIFTS ----------
  async getShifts(): Promise<Shift[]> {
    await delay(100);
    return useMastersStore.getState().shifts;
  },
  async createShift(shift: Shift): Promise<Shift> {
    await delay(200);
    useMastersStore.getState().createShift(shift);
    return shift;
  },
  async updateShift(shift: Shift): Promise<Shift> {
    await delay(200);
    useMastersStore.getState().updateShift(shift);
    return shift;
  },
  async deleteShift(id: string): Promise<void> {
    await delay(150);
    useMastersStore.getState().deleteShift(id);
  },

  // ---------- WAREHOUSES ----------
  async getWarehouses(): Promise<Warehouse[]> {
    await delay(100);
    const tenantId = getTenantFilter();
    const warehouses = useMastersStore.getState().warehouses;
    if (!tenantId) return warehouses;
    return warehouses.filter((w) => w.tenantId === tenantId);
  },
  async createWarehouse(warehouse: Warehouse): Promise<Warehouse> {
    await delay(200);
    const tenantId = useTenantStore.getState().activeTenantId;
    const scoped = { ...warehouse, tenantId: warehouse.tenantId || tenantId };
    useMastersStore.getState().createWarehouse(scoped);
    return scoped;
  },
  async updateWarehouse(warehouse: Warehouse): Promise<Warehouse> {
    await delay(200);
    useMastersStore.getState().updateWarehouse(warehouse);
    return warehouse;
  },
  async deleteWarehouse(id: string): Promise<void> {
    await delay(150);
    useMastersStore.getState().deleteWarehouse(id);
  },

  // ---------- UNITS ----------
  async getUnits(): Promise<Unit[]> {
    await delay(100);
    return useMastersStore.getState().units;
  },
  async createUnit(unit: Unit): Promise<Unit> {
    await delay(200);
    useMastersStore.getState().createUnit(unit);
    return unit;
  },
  async updateUnit(unit: Unit): Promise<Unit> {
    await delay(200);
    useMastersStore.getState().updateUnit(unit);
    return unit;
  },
  async deleteUnit(id: string): Promise<void> {
    await delay(150);
    useMastersStore.getState().deleteUnit(id);
  },

  // ---------- SIZING MILLS ----------
  async getSizingMills(): Promise<SizingMill[]> {
    await delay(100);
    const tenantId = getTenantFilter();
    const sizingMills = useMastersStore.getState().sizingMills;
    if (!tenantId) return sizingMills;
    return sizingMills.filter((m) => m.tenantId === tenantId);
  },
  async createSizingMill(mill: SizingMill): Promise<SizingMill> {
    await delay(200);
    const tenantId = useTenantStore.getState().activeTenantId;
    const scoped = { ...mill, tenantId: mill.tenantId || tenantId };
    useMastersStore.getState().createSizingMill(scoped);
    return scoped;
  },
  async updateSizingMill(mill: SizingMill): Promise<SizingMill> {
    await delay(200);
    useMastersStore.getState().updateSizingMill(mill);
    return mill;
  },
  async deleteSizingMill(id: string): Promise<void> {
    await delay(150);
    useMastersStore.getState().deleteSizingMill(id);
  }
};
