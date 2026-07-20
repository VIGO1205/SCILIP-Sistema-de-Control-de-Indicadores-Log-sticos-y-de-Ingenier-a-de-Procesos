'use client';

import React, { useState } from 'react';
import {
  Title,
  Text,
  Card,
  Grid,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Divider,
} from '@tremor/react';
import {
  PlusCircle,
  Users,
  FileText,
  BarChart3,
  ShoppingCart,
  PackageCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { KPICard } from '@/components/ui/kpi-card';
import { AiOverlay } from '@/components/ui/ai-interpretation';
import { PendingApprovalsTable } from '@/components/dashboard/pending-approvals-table';
import { PurchaseOrderModal } from '@/components/purchasing/purchase-order-modal';
import { PurchaseOrdersTable } from '@/components/purchasing/purchase-orders-table';
import { SuppliersTable } from '@/components/purchasing/suppliers-table';
import { SupplierModal } from '@/components/purchasing/supplier-modal';
import { OrderQualityChart } from '@/components/purchasing/order-quality-chart';

export default function PurchasingPage() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [selectedPeriod] = React.useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });

  const utils = trpc.useUtils();

  // Consultas a tRPC
  const { data: suppliers } = trpc.purchasing.getSuppliers.useQuery();
  const { data: purchaseOrders } = trpc.purchasing.getPurchaseOrders.useQuery();
  const perfectReceipts = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_03',
    ...selectedPeriod,
  });
  const orderQuality = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_02',
    ...selectedPeriod,
  });

  const handleOrderSuccess = () => {
    utils.purchasing.getPurchaseOrders.invalidate();
  };

  const handleSupplierSuccess = () => {
    utils.purchasing.getSuppliers.invalidate();
  };

  const handleEditSupplier = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsSupplierModalOpen(true);
  };

  const handleCloseSupplierModal = () => {
    setIsSupplierModalOpen(false);
    setSelectedSupplier(null);
  };

  // Calcular métricas derivadas
  // Nota: los status en BD son lowercase: 'pending', 'received', 'approved', 'rejected', 'completed'
  const totalOrders = purchaseOrders?.length ?? 0;
  const statusCounts = {
    pending: purchaseOrders?.filter((o: any) => o.status?.toLowerCase() === 'pending').length ?? 0,
    approved: purchaseOrders?.filter((o: any) => o.status?.toLowerCase() === 'approved').length ?? 0,
    received: purchaseOrders?.filter((o: any) => o.status?.toLowerCase() === 'received').length ?? 0,
    completed: purchaseOrders?.filter((o: any) => o.status?.toLowerCase() === 'completed').length ?? 0,
    rejected: purchaseOrders?.filter((o: any) => o.status?.toLowerCase() === 'rejected').length ?? 0,
  };
  const pendingOrders = statusCounts.pending;
  const avgOrderValue = totalOrders > 0 && purchaseOrders
    ? purchaseOrders.reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0) / totalOrders
    : 0;

  return (
    <main className="p-4 sm:p-5 bg-gray-50 min-h-screen">
      {/* Header estilo Dashboard */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Gestión de Compras
            </h1>
            <p className="text-gray-500 mt-0.5 text-xs">
              Control de suministros, proveedores e indicadores de abastecimiento
            </p>
          </div>
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Nueva Orden de Compra
          </button>
        </div>
        <Divider className="mt-4" />
      </div>

      <PurchaseOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSuccess={handleOrderSuccess}
      />

      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={handleCloseSupplierModal}
        onSuccess={handleSupplierSuccess}
        supplier={selectedSupplier}
      />

      {/* KPI Cards estilo Dashboard con IA */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-3">
        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_03"
          kpiName="Entregas Perfectas"
          value={perfectReceipts.data?.rejectedPercentage ?? 0}
          target={5}
          direction="down"
          unit="%"
          status={(perfectReceipts.data?.rejectedPercentage ?? 0) < 5 ? 'good' : 'warning'}
        >
          <KPICard
            title="Entregas Perfectas"
            value={perfectReceipts.data?.rejectedPercentage ?? 0}
            unit="%"
            status={(perfectReceipts.data?.rejectedPercentage ?? 0) < 5 ? 'good' : 'warning'}
            direction="down"
            subtitle="NOR_DIS_IND_03"
            loading={perfectReceipts.isLoading}
          />
        </AiOverlay>

        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_02"
          kpiName="Calidad de Pedidos"
          value={orderQuality.data?.qualityPercentage ?? 0}
          target={90}
          direction="up"
          unit="%"
          status={(orderQuality.data?.qualityPercentage ?? 0) >= 90 ? 'good' : 'warning'}
        >
          <KPICard
            title="Calidad de Pedidos"
            value={orderQuality.data?.qualityPercentage ?? 0}
            unit="%"
            status={(orderQuality.data?.qualityPercentage ?? 0) >= 90 ? 'good' : 'warning'}
            direction="up"
            subtitle="NOR_DIS_IND_02"
            loading={orderQuality.isLoading}
          />
        </AiOverlay>

        <AiOverlay
          type="kpi"
          kpiCode="SUP_COUNT"
          kpiName="Proveedores Activos"
          value={suppliers?.length ?? 0}
          target={5}
          direction="up"
          unit=""
          status="neutral"
        >
          <KPICard
            title="Proveedores Activos"
            value={suppliers?.length ?? 0}
            unit=""
            status="neutral"
            subtitle="Total registrados"
          />
        </AiOverlay>

        <AiOverlay
          type="kpi"
          kpiCode="ORD_PENDING"
          kpiName="Órdenes Pendientes"
          value={pendingOrders}
          target={0}
          direction="down"
          unit=""
          status={pendingOrders === 0 ? 'good' : pendingOrders < 5 ? 'warning' : 'bad'}
        >
          <KPICard
            title="Órdenes Pendientes"
            value={pendingOrders}
            unit=""
            status={pendingOrders === 0 ? 'good' : pendingOrders < 5 ? 'warning' : 'bad'}
            subtitle={`de ${totalOrders} órdenes totales`}
          />
        </AiOverlay>
      </Grid>

      {/* Tabs estilo Dashboard */}
      <TabGroup className="mt-6">
        <TabList className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-t-xl border border-indigo-100/50 border-b-0 shadow-sm p-1.5 gap-1.5">
          <Tab
            icon={BarChart3}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-indigo-600 hover:bg-white/60 rounded-lg transition-all duration-300 data-[selected]:bg-white data-[selected]:text-indigo-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-indigo-100 data-[selected]:border-b-[3px] data-[selected]:border-indigo-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Indicadores
          </Tab>
          <Tab
            icon={ShoppingCart}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-emerald-600 hover:bg-white/60 rounded-lg transition-all duration-300 data-[selected]:bg-white data-[selected]:text-emerald-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-emerald-100 data-[selected]:border-b-[3px] data-[selected]:border-emerald-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Órdenes de Compra
          </Tab>
          <Tab
            icon={Users}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-amber-600 hover:bg-white/60 rounded-lg transition-all duration-300 data-[selected]:bg-white data-[selected]:text-amber-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-amber-100 data-[selected]:border-b-[3px] data-[selected]:border-amber-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Proveedores
          </Tab>
        </TabList>
        <TabPanels className="bg-white border border-gray-200 rounded-b-xl shadow-sm">
          <TabPanel>
            <div className="p-5 space-y-5">
              {/* Insight Card — 5 estados reales */}
              <div className="rounded-xl border border-gray-200 shadow-sm p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-gray-900">Resumen de Órdenes</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <StatusCard label="Pendientes" count={statusCounts.pending} color="amber" icon={<AlertTriangle className="h-4 w-4" />} />
                  <StatusCard label="Aprobadas" count={statusCounts.approved} color="blue" icon={<CheckCircle2 className="h-4 w-4" />} />
                  <StatusCard label="Recibidas" count={statusCounts.received} color="emerald" icon={<PackageCheck className="h-4 w-4" />} />
                  <StatusCard label="Completadas" count={statusCounts.completed} color="success" icon={<CheckCircle2 className="h-4 w-4" />} />
                  <StatusCard label="Rechazadas" count={statusCounts.rejected} color="red" icon={<AlertTriangle className="h-4 w-4" />} />
                </div>
              </div>

              <PendingApprovalsTable />

              {/* Quality Chart con IA */}
              <AiOverlay
                type="chart"
                chartType="bar"
                title="Calidad de los Pedidos Generados"
                data={{ quality: orderQuality.data?.qualityPercentage ?? 0, target: 90 }}
              >
                <OrderQualityChart 
                  quality={orderQuality.data?.qualityPercentage ?? 0}
                  target={90}
                  loading={orderQuality.isLoading}
                />
              </AiOverlay>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="p-5">
              <PurchaseOrdersTable orders={purchaseOrders || []} />
            </div>
          </TabPanel>

          <TabPanel>
            <div className="p-5 space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => { setSelectedSupplier(null); setIsSupplierModalOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm"
                >
                  <PlusCircle className="h-4 w-4" />
                  Nuevo Proveedor
                </button>
              </div>
              <SuppliersTable suppliers={suppliers || []} onEdit={handleEditSupplier} />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}

function StatusCard({ label, count, color, icon }: { label: string; count: number; color: string; icon: React.ReactNode }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    success: { bg: 'bg-success/5', border: 'border-success/20', text: 'text-success' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  };
  const c = colors[color] || colors.amber;

  return (
    <div className={`flex items-center gap-2.5 p-3 rounded-lg ${c.bg} border ${c.border}`}>
      <span className={c.text}>{icon}</span>
      <div>
        <p className="text-[11px] text-gray-500">{label}</p>
        <p className={`text-base font-bold ${c.text}`}>{count}</p>
      </div>
    </div>
  );
}
