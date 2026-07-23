'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Package,
  Warehouse,
  ShoppingCart,
  Truck,
  BarChart3,
  ArrowRight,
  Settings,
  FileSpreadsheet,
} from 'lucide-react';

const STEPS = [
  {
    icon: Warehouse,
    title: 'Registrar sucursales',
    description: 'Configura las ubicaciones fiscales de tu empresa.',
    href: '/settings',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Package,
    title: 'Agregar productos',
    description: 'Registra los productos o insumos que maneja tu empresa.',
    href: '/inventario/productos',
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: ShoppingCart,
    title: 'Crear ordenes de compra',
    description: 'Genera ordenes de compra a tus proveedores.',
    href: '/compras/ordenes',
    color: 'bg-violet-500',
    bgColor: 'bg-violet-50',
  },
  {
    icon: Truck,
    title: 'Configurar transporte',
    description: 'Registra vehiculos, conductores y rutas.',
    href: '/transporte/vehiculos',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
  },
  {
    icon: FileSpreadsheet,
    title: 'Registrar operaciones',
    description: 'Crea registros de inventario, produccion y costos operativos.',
    href: '/inventario/movimientos',
    color: 'bg-rose-500',
    bgColor: 'bg-rose-50',
  },
  {
    icon: BarChart3,
    title: 'Ver tus KPIs',
    description: 'Los indicadores apareceran automaticamente cuando tengas datos.',
    href: '/dashboard',
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50',
  },
];

export default function EmptyDashboard({ userName }: { userName?: string }) {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-100 mb-4">
          <Building2 className="h-8 w-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-tremor-content-strong mb-2">
          ¡Bienvenido{userName ? `, ${userName}` : ''}!
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-tremor-content-subtle max-w-md mx-auto">
          Tu empresa fue creada exitosamente. Para que tu dashboard muestre datos, segui estos pasos:
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <Link
              key={i}
              href={step.href}
              className="group flex items-start gap-3.5 p-4 bg-white dark:bg-dark-tremor-background rounded-xl border border-gray-200 dark:border-dark-tremor-border hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200"
            >
              <div className={`h-10 w-10 rounded-lg ${step.bgColor} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${step.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-dark-tremor-content-subtle bg-gray-100 dark:bg-dark-tremor-background-subtle rounded-full h-5 w-5 flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-tremor-content-strong group-hover:text-indigo-600 transition-colors">
                    {step.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 shrink-0 mt-0.5 transition-colors" />
            </Link>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Ir a Configuracion
        </Link>
        <Link
          href="/inventario/productos"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-dark-tremor-content bg-white dark:bg-dark-tremor-background border border-gray-200 dark:border-dark-tremor-border hover:bg-gray-50 dark:hover:bg-dark-tremor-background-subtle transition-colors"
        >
          <Package className="h-4 w-4" />
          Ver Inventario
        </Link>
      </div>
    </div>
  );
}
