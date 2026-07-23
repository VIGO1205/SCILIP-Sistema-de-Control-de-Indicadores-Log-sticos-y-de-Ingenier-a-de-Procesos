'use client';

import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Users,
  Globe,
  Factory,
  Settings,
  FileText,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../providers/auth-provider';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Compras', href: '/dashboard/purchasing', icon: ShoppingCart },
  { name: 'Inventarios', href: '/dashboard/inventory', icon: Package },
  { name: 'Producción', href: '/dashboard/admin', icon: Factory },
  { name: 'Transporte', href: '/dashboard/transport', icon: Truck },
  { name: 'Servicio al Cliente', href: '/dashboard/customer-service', icon: Users },
  { name: 'Comercio Exterior', href: '/dashboard/international', icon: Globe },
  { name: 'Reportes', href: '/reports', icon: FileText },
  { name: 'Notificaciones', href: '/notifications', icon: Bell },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export default function Sidebar({
  onNavigate,
  currentPath,
  collapsed,
  onToggleCollapse,
  open,
  onToggleOpen,
  onClose,
}: {
  onNavigate: (href: string) => void;
  currentPath: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  open: boolean;
  onToggleOpen: () => void;
  onClose: () => void;
}) {
  const { user } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const roleLabel = user?.role
    ? user.role
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Usuario';

  const sidebarContent = (
    <div className="flex flex-col flex-grow pt-5 overflow-y-auto overflow-x-hidden">
      {/* Logo */}
      <div
        className={clsx(
          'flex items-center flex-shrink-0 mb-6 transition-all duration-300',
          collapsed ? 'justify-center px-2' : 'px-5'
        )}
      >
        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md flex-shrink-0">
          <LayoutDashboard className="h-6 w-6 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight ml-3 whitespace-nowrap">
            BI Logístico
          </span>
        )}
      </div>

      {/* Collapse Toggle - desktop only */}
      <div className={clsx('mb-3', collapsed ? 'px-2' : 'px-3')}>
        <button
          onClick={onToggleCollapse}
          className={clsx(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs font-medium',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span>Colapsar</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className={clsx('flex-1 space-y-0.5', collapsed ? 'px-2' : 'px-3')}>
        {navigation.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.href)}
              className={clsx(
                isActive
                  ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5',
                'group flex items-center w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon
                className={clsx(
                  isActive ? 'text-white' : 'text-white/40 group-hover:text-white',
                  'flex-shrink-0 h-[18px] w-[18px] transition-colors'
                )}
              />
              {!collapsed && (
                <>
                  <span className="ml-3 truncate">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className={clsx('mt-auto pb-3', collapsed ? 'px-2' : 'px-3')}>
        <div
          className={clsx(
            'bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 transition-all duration-300',
            collapsed ? 'p-2' : 'p-3'
          )}
        >
          <div
            className={clsx(
              'flex items-center',
              collapsed ? 'justify-center' : 'space-x-3'
            )}
          >
            <div className="h-8 w-8 rounded-full bg-primary border-2 border-white/30 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-xs font-semibold truncate leading-tight">
                  {user?.fullName || 'Usuario'}
                </p>
                <p className="text-[9px] text-white/40 uppercase tracking-widest truncate mt-0.5">
                  {roleLabel}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Mobile: Drawer */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-bi-dark to-bi-blue text-white shadow-2xl z-50 md:hidden transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-3 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </div>

      {/* Desktop: Fixed sidebar */}
      <div
        className={clsx(
          'hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-gradient-to-b from-bi-dark to-bi-blue text-white shadow-2xl transition-all duration-300 ease-in-out z-30',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
}
