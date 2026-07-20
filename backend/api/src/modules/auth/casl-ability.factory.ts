import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User, Role } from '@prisma/client';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

// Define subjects for CASL to match our domain entities
type Subjects = InferSubjects<
  'User' | 'Role' | 'Company' | 'Branch' | 'Supplier' | 'Product' | 
  'Warehouse' | 'Location' | 'Machine' | 'Vehicle' | 'Employee' | 
  'PurchaseOrder' | 'Sale' | 'InventoryMovement' | 'Dispatch' | 
  'ProductionRecord' | 'OperationalCost' | 'ImportExportRecord' | 'Kpi' | 'Report'
> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User & { role: Role }) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(Ability as AbilityClass<AppAbility>);

    // Role-based logic
    switch (user.role.name) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        can(Action.Manage, 'all');
        break;

      case 'PURCHASING_MANAGER':
        can(Action.Manage, 'PurchaseOrder');
        can(Action.Manage, 'Supplier');
        can(Action.Read, 'Product');
        can(Action.Read, 'Kpi' as any, { code: { startsWith: 'NOR_DIS_IND_01' } } as any); // Compras
        can(Action.Read, 'Kpi' as any, { code: { startsWith: 'NOR_DIS_IND_02' } } as any);
        can(Action.Read, 'Kpi' as any, { code: { startsWith: 'NOR_DIS_IND_03' } } as any);
        can(Action.Read, 'Kpi' as any, { code: { startsWith: 'NOR_DIS_IND_04' } } as any);
        break;

      case 'WAREHOUSE_MANAGER':
        can(Action.Manage, 'Warehouse');
        can(Action.Manage, 'InventoryMovement');
        can(Action.Manage, 'Dispatch');
        can(Action.Read, 'Product');
        can(Action.Read, 'Kpi' as any, { code: { startsWith: 'NOR_DIS_IND_12' } } as any); // Almacenamiento
        break;

      case 'OPERATIONS_MANAGER':
        can(Action.Manage, 'ProductionRecord');
        can(Action.Manage, 'Machine');
        can(Action.Read, 'Kpi' as any, { code: { startsWith: 'NOR_DIS_IND_05' } } as any); // Producción
        break;

      default:
        // Guest/Basic user
        can(Action.Read, 'Product');
        can(Action.Read, 'Kpi' as any, { code: 'NOR_DIS_IND_21' } as any); // Entregas a tiempo (público)
        break;
    }

    // Dynamic JSON permissions override
    const permissions = user.role.permissions as any;
    if (permissions?.modules) {
      permissions.modules.forEach((module: string) => {
        can(Action.Manage, module as any);
      });
    }

    if (permissions?.kpis) {
      permissions.kpis.forEach((kpi: string) => {
        can(Action.Read, 'Kpi' as any, { code: kpi } as any);
      });
    }

    return build({
      detectSubjectType: (item) => (typeof item === 'string' ? item : (item as any).constructor.name),
    });
  }
}
