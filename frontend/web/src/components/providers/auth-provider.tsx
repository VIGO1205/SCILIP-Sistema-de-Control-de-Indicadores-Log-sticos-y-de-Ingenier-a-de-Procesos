'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subject = 
  | 'User' | 'Role' | 'Company' | 'Branch' | 'Supplier' | 'Product' 
  | 'Warehouse' | 'Location' | 'Machine' | 'Vehicle' | 'Employee' 
  | 'PurchaseOrder' | 'Sale' | 'InventoryMovement' | 'Dispatch' 
  | 'ProductionRecord' | 'OperationalCost' | 'TransportCost' | 'Kpi' | 'Report'
  | 'PhysicalInventory' | 'ImportExportRecord'
  | 'all';

export interface AuthUser {
  id: string;
  email: string;
  notificationEmail?: string | null;
  fullName: string;
  role: string;
  companyId?: string | null;
  permissions?: {
    modules?: string[];
    kpis?: string[];
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  can: (action: Action, subject: Subject) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message ?? 'No se pudo iniciar sesión');
      }
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    router.push('/login');
    router.refresh();
  }, [router]);

  const can = useCallback((action: Action, subject: Subject): boolean => {
    if (!user) return false;

    // Check dynamic permissions first (from backend role.permissions)
    const modules = user.permissions?.modules;
    if (modules) {
      if (modules.includes('*')) return true;
      if (modules.includes(subject)) return true;
    }

    // Role-based permissions (simplified version matching backend CASL)
    switch (user.role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return true; // Can do everything

      case 'PURCHASING_MANAGER':
        if (subject === 'PurchaseOrder' || subject === 'Supplier') return true;
        if (action === Action.Read && subject === 'Product') return true;
        return false;

      case 'WAREHOUSE_MANAGER':
        if (subject === 'Warehouse' || subject === 'InventoryMovement' || subject === 'Dispatch' || subject === 'PhysicalInventory') return true;
        if (action === Action.Read && subject === 'Product') return true;
        return false;

      case 'OPERATIONS_MANAGER':
        if (subject === 'ProductionRecord' || subject === 'Machine') return true;
        return false;

      default:
        // Guest/Basic user - only read access
        return action === Action.Read;
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refresh, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
