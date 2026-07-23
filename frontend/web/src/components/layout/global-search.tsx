'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Factory,
  Truck,
  Users,
  Globe,
  FileText,
  Bell,
  Settings,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { clsx } from 'clsx';

interface SearchItem {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ElementType;
  category: 'modulo' | 'indicador' | 'reporte';
}

const navigationItems: SearchItem[] = [
  { id: 'nav-dashboard', name: 'Dashboard', description: 'Panel principal de indicadores', href: '/dashboard', icon: LayoutDashboard, category: 'modulo' },
  { id: 'nav-purchasing', name: 'Compras', description: 'Órdenes de compra y proveedores', href: '/dashboard/purchasing', icon: ShoppingCart, category: 'modulo' },
  { id: 'nav-inventory', name: 'Inventarios', description: 'Productos, movimientos y auditorías', href: '/dashboard/inventory', icon: Package, category: 'modulo' },
  { id: 'nav-production', name: 'Producción', description: 'Máquinas, registros y mantenimiento', href: '/dashboard/admin', icon: Factory, category: 'modulo' },
  { id: 'nav-transport', name: 'Transporte', description: 'Flota, conductores y costos', href: '/dashboard/transport', icon: Truck, category: 'modulo' },
  { id: 'nav-customer', name: 'Servicio al Cliente', description: 'Despachos y entregas', href: '/dashboard/customer-service', icon: Users, category: 'modulo' },
  { id: 'nav-international', name: 'Comercio Exterior', description: 'Importaciones y exportaciones', href: '/dashboard/international', icon: Globe, category: 'modulo' },
  { id: 'nav-reports', name: 'Reportes', description: 'Generación y descarga de informes', href: '/reports', icon: FileText, category: 'modulo' },
  { id: 'nav-notifications', name: 'Notificaciones', description: 'Centro de notificaciones', href: '/notifications', icon: Bell, category: 'modulo' },
  { id: 'nav-settings', name: 'Configuración', description: 'Perfil, empresa y seguridad', href: '/settings', icon: Settings, category: 'modulo' },
];

const kpiItems: SearchItem[] = [
  { id: 'kpi-01', name: 'Cumplimiento de Tiempo de Entrega', description: 'NOR_DIS_IND_01 — Compras', href: '/dashboard/purchasing', icon: Zap, category: 'indicador' },
  { id: 'kpi-02', name: 'Calidad de Pedidos', description: 'NOR_DIS_IND_02 — Compras', href: '/dashboard/purchasing', icon: Zap, category: 'indicador' },
  { id: 'kpi-03', name: 'Entregas Perfectas', description: 'NOR_DIS_IND_03 — Compras / Serv. Cliente', href: '/dashboard/purchasing', icon: Zap, category: 'indicador' },
  { id: 'kpi-05', name: 'Rotación de Mercancía', description: 'NOR_DIS_IND_05 — Inventarios', href: '/dashboard/inventory', icon: Zap, category: 'indicador' },
  { id: 'kpi-06', name: 'Duración del Inventario', description: 'NOR_DIS_IND_06 — Inventarios', href: '/dashboard/inventory', icon: Zap, category: 'indicador' },
  { id: 'kpi-08', name: 'Valor Económico / Rotación', description: 'NOR_DIS_IND_08 — Inventarios', href: '/dashboard/inventory', icon: Zap, category: 'indicador' },
  { id: 'kpi-09', name: 'Exactitud de Inventario', description: 'NOR_DIS_IND_09 — Inventarios', href: '/dashboard/inventory', icon: Zap, category: 'indicador' },
  { id: 'kpi-11', name: 'Exactitud del Inventario', description: 'NOR_DIS_IND_11 — Inventarios', href: '/dashboard/inventory', icon: Zap, category: 'indicador' },
  { id: 'kpi-12', name: 'Costo por Unidad Almacenada', description: 'NOR_DIS_IND_12 — Almacenamiento', href: '/dashboard/inventory', icon: Zap, category: 'indicador' },
  { id: 'kpi-13', name: 'Costo por Metro Cuadrado', description: 'NOR_DIS_IND_13 — Almacenamiento', href: '/dashboard/inventory', icon: Zap, category: 'indicador' },
  { id: 'kpi-14', name: 'Unidades por Empleado', description: 'NOR_DIS_IND_14 — Almacenamiento', href: '/dashboard/inventory', icon: Zap, category: 'indicador' },
  { id: 'kpi-16', name: 'Transporte vs Ventas', description: 'NOR_DIS_IND_16 — Transporte', href: '/dashboard/transport', icon: Zap, category: 'indicador' },
  { id: 'kpi-17', name: 'Costo por Conductor', description: 'NOR_DIS_IND_17 — Transporte', href: '/dashboard/transport', icon: Zap, category: 'indicador' },
  { id: 'kpi-18', name: 'Comparativo de Transporte', description: 'NOR_DIS_IND_18 — Transporte', href: '/dashboard/transport', icon: Zap, category: 'indicador' },
  { id: 'kpi-19', name: 'Entregas Perfectas (SC)', description: 'NOR_DIS_IND_19 — Servicio al Cliente', href: '/dashboard/customer-service', icon: Zap, category: 'indicador' },
  { id: 'kpi-20', name: 'Entregas a Tiempo', description: 'NOR_DIS_IND_20 — Servicio al Cliente', href: '/dashboard/customer-service', icon: Zap, category: 'indicador' },
  { id: 'kpi-21', name: 'Pedidos Completos', description: 'NOR_DIS_IND_21 — Servicio al Cliente', href: '/dashboard/customer-service', icon: Zap, category: 'indicador' },
  { id: 'kpi-22', name: 'Documentación OK', description: 'NOR_DIS_IND_22 — Servicio al Cliente', href: '/dashboard/customer-service', icon: Zap, category: 'indicador' },
  { id: 'kpi-26', name: 'Utilización de Capacidad', description: 'NOR_DIS_IND_26 — Producción', href: '/dashboard/admin', icon: Zap, category: 'indicador' },
  { id: 'kpi-27', name: 'Rendimiento de Máquinas', description: 'NOR_DIS_IND_27 — Producción', href: '/dashboard/admin', icon: Zap, category: 'indicador' },
  { id: 'kpi-28', name: 'Costo Unitario Importación/Exportación', description: 'NOR_DIS_IND_28 — Comercio Exterior', href: '/dashboard/international', icon: Zap, category: 'indicador' },
];

const reportItems: SearchItem[] = [
  { id: 'rpt-transport', name: 'Reporte de Transporte', description: 'Análisis de costos y eficiencia de flota', href: '/reports', icon: FileText, category: 'reporte' },
  { id: 'rpt-kpi', name: 'Resumen de KPIs', description: 'Consolidado de indicadores logísticos', href: '/reports', icon: FileText, category: 'reporte' },
  { id: 'rpt-international', name: 'Comercio Exterior', description: 'Operaciones de importación y exportación', href: '/reports', icon: FileText, category: 'reporte' },
  { id: 'rpt-purchasing', name: 'Órdenes de Compra', description: 'Historial y estado de órdenes', href: '/reports', icon: FileText, category: 'reporte' },
];

const allItems: SearchItem[] = [...navigationItems, ...kpiItems, ...reportItems];

const categoryLabels: Record<string, string> = {
  modulo: 'MÓDULOS',
  indicador: 'INDICADORES',
  reporte: 'REPORTES',
};

const categoryIcons: Record<string, React.ElementType> = {
  modulo: LayoutDashboard,
  indicador: Zap,
  reporte: FileText,
};

function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = normalize(query);
    return allItems.filter(
      (item) =>
        normalize(item.name).includes(q) ||
        normalize(item.description).includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {};
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filtered]);

  const flatResults = useMemo(() => filtered, [filtered]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex, open]);

  const navigateTo = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
      setQuery('');
      inputRef.current?.blur();
    },
    [router]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flatResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === 'Enter' && flatResults[activeIndex]) {
      e.preventDefault();
      navigateTo(flatResults[activeIndex].href);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  let globalIndex = -1;

  return (
    <div className="relative w-full max-w-md">
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400 dark:text-dark-tremor-content-subtle" />
      </span>
      <input
        ref={inputRef}
        className="block w-full pl-10 pr-16 py-2 border-none rounded-xl leading-5 bg-gray-50 dark:bg-dark-tremor-background-subtle placeholder-gray-400 dark:placeholder-dark-tremor-content-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content-strong transition-all sm:text-sm"
        placeholder="Buscar módulos, indicadores..."
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (query.trim()) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <kbd className="hidden sm:inline-flex h-4 items-center gap-1 rounded border bg-white dark:bg-dark-tremor-background-subtle border-gray-200 dark:border-dark-tremor-border px-1 font-sans text-[9px] font-medium text-gray-400 dark:text-dark-tremor-content-subtle">
          ⌘K
        </kbd>
      </div>

      {open && query.trim() && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-tremor-background rounded-xl shadow-xl border border-gray-200 dark:border-dark-tremor-border py-2 z-50 max-h-80 overflow-y-auto"
        >
          {flatResults.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <Search className="h-8 w-8 text-gray-300 dark:text-dark-tremor-content-subtle mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-dark-tremor-content">Sin resultados para &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-gray-400 dark:text-dark-tremor-content-subtle mt-1">Intentá con otro término</p>
            </div>
          ) : (
            <div ref={listRef}>
              {(['modulo', 'indicador', 'reporte'] as const).map((cat) => {
                const items = grouped[cat];
                if (!items || items.length === 0) return null;
                const CatIcon = categoryIcons[cat];
                return (
                  <div key={cat}>
                    <div className="px-3 py-1.5 flex items-center gap-2">
                      <CatIcon className="h-3 w-3 text-gray-400 dark:text-dark-tremor-content-subtle" />
                      <span className="text-[10px] font-semibold text-gray-400 dark:text-dark-tremor-content-subtle uppercase tracking-wider">
                        {categoryLabels[cat]}
                      </span>
                    </div>
                    {items.map((item) => {
                      globalIndex++;
                      const idx = globalIndex;
                      const isActive = idx === activeIndex;
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.id}
                          data-active={isActive}
                          onClick={() => navigateTo(item.href)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={clsx(
                            'w-full text-left px-3 py-2 flex items-center gap-3 transition-colors',
                            isActive ? 'bg-gray-100 dark:bg-dark-tremor-background-subtle' : 'hover:bg-gray-50 dark:hover:bg-dark-tremor-background-muted'
                          )}
                        >
                          <div
                            className={clsx(
                              'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0',
                              isActive ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-dark-tremor-background-muted text-gray-500 dark:text-dark-tremor-content-subtle'
                            )}
                          >
                            <ItemIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-dark-tremor-content-strong truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle truncate">
                              {item.description}
                            </p>
                          </div>
                          <ArrowRight
                            className={clsx(
                              'h-3.5 w-3.5 flex-shrink-0 transition-opacity',
                              isActive ? 'text-primary opacity-100' : 'opacity-0'
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
