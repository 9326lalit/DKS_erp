// Masters API Service — Phase 1 Textile ERP

import { useMastersStore, Factory, Loom, Fabric, Party, Labour, Employee, ExpenseCategory, Yarn, Shift, Warehouse, Unit } from "@/lib/store/use-masters-store";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mastersApiService = {
  // ---------- FACTORIES ----------
  async getFactories(): Promise<Factory[]> {
    await delay(200);
    return useMastersStore.getState().factories;
  },
  async createFactory(factory: Factory): Promise<Factory> {
    await delay(300);
    useMastersStore.getState().createFactory(factory);
    return factory;
  },
  async updateFactory(factory: Factory): Promise<Factory> {
    await delay(300);
    useMastersStore.getState().updateFactory(factory);
    return factory;
  },
  async deleteFactory(id: string): Promise<void> {
    await delay(200);
    useMastersStore.getState().deleteFactory(id);
  },

  // ---------- LOOMS ----------
  async getLooms(): Promise<Loom[]> {
    await delay(200);
    return useMastersStore.getState().looms;
  },
  async createLoom(loom: Loom): Promise<Loom> {
    await delay(300);
    useMastersStore.getState().createLoom(loom);
    return loom;
  },
  async updateLoom(loom: Loom): Promise<Loom> {
    await delay(300);
    useMastersStore.getState().updateLoom(loom);
    return loom;
  },
  async deleteLoom(id: string): Promise<void> {
    await delay(200);
    useMastersStore.getState().deleteLoom(id);
  },

  // ---------- FABRICS ----------
  async getFabrics(): Promise<Fabric[]> {
    await delay(200);
    return useMastersStore.getState().fabrics;
  },
  async createFabric(fabric: Fabric): Promise<Fabric> {
    await delay(300);
    useMastersStore.getState().createFabric(fabric);
    return fabric;
  },
  async updateFabric(fabric: Fabric): Promise<Fabric> {
    await delay(300);
    useMastersStore.getState().updateFabric(fabric);
    return fabric;
  },
  async deleteFabric(id: string): Promise<void> {
    await delay(200);
    useMastersStore.getState().deleteFabric(id);
  },

  // ---------- PARTIES ----------
  async getParties(): Promise<Party[]> {
    await delay(200);
    return useMastersStore.getState().parties;
  },
  async createParty(party: Party): Promise<Party> {
    await delay(300);
    useMastersStore.getState().createParty(party);
    return party;
  },
  async updateParty(party: Party): Promise<Party> {
    await delay(300);
    useMastersStore.getState().updateParty(party);
    return party;
  },
  async deleteParty(id: string): Promise<void> {
    await delay(200);
    useMastersStore.getState().deleteParty(id);
  },
  

  // ---------- LABOUR ----------
  async getLabour(): Promise<Labour[]> {
    await delay(200);
    return useMastersStore.getState().labour;
  },
  async createLabour(labour: Labour): Promise<Labour> {
    await delay(300);
    useMastersStore.getState().createLabour(labour);
    return labour;
  },
  async updateLabour(labour: Labour): Promise<Labour> {
    await delay(300);
    useMastersStore.getState().updateLabour(labour);
    return labour;
  },
  async deleteLabour(id: string): Promise<void> {
    await delay(200);
    useMastersStore.getState().deleteLabour(id);
  }
  ,
  // ---------- EMPLOYEES ----------
  async getEmployees(): Promise<Employee[]> {
    await delay(200);
    return useMastersStore.getState().employees;
  },
  async createEmployee(employee: Employee): Promise<Employee> {
    await delay(300);
    useMastersStore.getState().createEmployee(employee);
    return employee;
  },
  async updateEmployee(employee: Employee): Promise<Employee> {
    await delay(300);
    useMastersStore.getState().updateEmployee(employee);
    return employee;
  },
  async deleteEmployee(id: string): Promise<void> {
    await delay(200);
    useMastersStore.getState().deleteEmployee(id);
  },

  // ---------- EXPENSE CATEGORIES ----------
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    await delay(200);
    return useMastersStore.getState().expenseCategories;
  },
  async createExpenseCategory(expenseCategory: ExpenseCategory): Promise<ExpenseCategory> {
    await delay(300);
    useMastersStore.getState().createExpenseCategory(expenseCategory);
    return expenseCategory;
  },
  async updateExpenseCategory(expenseCategory: ExpenseCategory): Promise<ExpenseCategory> {
    await delay(300);
    useMastersStore.getState().updateExpenseCategory(expenseCategory);
    return expenseCategory;
  },
  async deleteExpenseCategory(id: string): Promise<void> {
    await delay(200);
    useMastersStore.getState().deleteExpenseCategory(id);
  },

  // ---------- YARNS ----------
  async getYarns(): Promise<Yarn[]> {
    await delay(200);
    return useMastersStore.getState().yarns;
  },
  async createYarn(yarn: Yarn): Promise<Yarn> {
    await delay(300);
    useMastersStore.getState().createYarn(yarn);
    return yarn;
  },
  async updateYarn(yarn: Yarn): Promise<Yarn> {
    await delay(300);
    useMastersStore.getState().updateYarn(yarn);
    return yarn;
  },
  async deleteYarn(id: string): Promise<void> {
    await delay(200);
    useMastersStore.getState().deleteYarn(id);
  },

  // ---------- SHIFTS ----------
  async getShifts(): Promise<Shift[]> {
    await delay(200);
    return useMastersStore.getState().shifts;
  },
  async createShift(shift: Shift): Promise<Shift> {
    await delay(300);
    useMastersStore.getState().createShift(shift);
    return shift;
  },
  async updateShift(shift: Shift): Promise<Shift> {
    await delay(300);
    useMastersStore.getState().updateShift(shift);
    return shift;
  },
  async deleteShift(id: string): Promise<void> {
    await delay(200);
    useMastersStore.getState().deleteShift(id);
  },

  // ---------- WAREHOUSES ----------
  async getWarehouses(): Promise<Warehouse[]> {
    await delay(200);
    return useMastersStore.getState().warehouses;
  },
  async createWarehouse(warehouse: Warehouse): Promise<Warehouse> {
    await delay(300);
    useMastersStore.getState().createWarehouse(warehouse);
    return warehouse;
  },
  async updateWarehouse(warehouse: Warehouse): Promise<Warehouse> {
    await delay(300);
    useMastersStore.getState().updateWarehouse(warehouse);
    return warehouse;
  },
  async deleteWarehouse(id: string): Promise<void> {
    await delay(200);
    useMastersStore.getState().deleteWarehouse(id);
  },

  // ---------- UNITS ----------
  async getUnits(): Promise<Unit[]> {
    await delay(200);
    return useMastersStore.getState().units;
  },
  async createUnit(unit: Unit): Promise<Unit> {
    await delay(300);
    useMastersStore.getState().createUnit(unit);
    return unit;
  },
  async updateUnit(unit: Unit): Promise<Unit> {
    await delay(300);
    useMastersStore.getState().updateUnit(unit);
    return unit;
  },
  async deleteUnit(id: string): Promise<void> {
    await delay(200);
    useMastersStore.getState().deleteUnit(id);
  }
};
