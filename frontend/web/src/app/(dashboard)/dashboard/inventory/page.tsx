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
  Package,
  History,
  BarChart3,
  ClipboardCheck,
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Box,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { KPICard } from '@/components/ui/kpi-card';
import { AiOverlay } from '@/components/ui/ai-interpretation';
import { MovementModal } from '@/components/inventory/movement-modal';
import { AuditModal } from '@/components/inventory/audit-modal';
import { ProductModal } from '@/components/inventory/product-modal';
import { InventoryMovementsTable } from '@/components/inventory/inventory-movements-table';
import { ProductsTable } from '@/components/inventory/products-table';
import { AuditsTable } from '@/components/inventory/audits-table';

export default function InventoryPage() {
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });

  const utils = trpc.useUtils();

  // Consultas a tRPC
  const merchandiseRotation = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_05',
    ...selectedPeriod,
  });
  const inventoryDuration = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_06',
    ...selectedPeriod,
  });
  const inventoryAccuracy = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_09',
    ...selectedPeriod,
  });
  const economicValue = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_08',
    ...selectedPeriod,
  });

  const { data: products } = trpc.inventory.getProducts.useQuery();
  const { data: movements } = trpc.inventory.getMovements.useQuery();
  const { data: audits } = trpc.inventory.getPhysicalInventories.useQuery();

  const handleMovementSuccess = () => {
    utils.inventory.getMovements.invalidate();
    utils.inventory.getProducts.invalidate();
  };

  const handleAuditSuccess = () => {
    utils.inventory.getPhysicalInventories.invalidate();
  };

  const handleProductSuccess = () => {
    utils.inventory.getProducts.invalidate();
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  // Métricas derivadas
  const totalProducts = products?.length ?? 0;
  const totalMovements = movements?.length ?? 0;
  const inMovements = movements?.filter((m: any) => m.type?.toUpperCase() === 'IN').length ?? 0;
  const outMovements = movements?.filter((m: any) => m.type?.toUpperCase() === 'OUT').length ?? 0;

  return (
    <main className="p-4 sm:p-5 bg-gray-50 min-h-screen">
      {/* Header estilo Dashboard */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Gestión de Inventarios
            </h1>
            <p className="text-gray-500 mt-0.5 text-xs">
              Control de existencias, movimientos y auditoría de stock
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
            >
              <ClipboardCheck className="h-4 w-4" />
              Auditoría
            </button>
            <button
              onClick={() => { setSelectedProduct(null); setIsProductModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg transition-colors shadow-sm"
            >
              <Package className="h-4 w-4" />
              Nuevo Producto
            </button>
            <button
              onClick={() => setIsMovementModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              Nuevo Movimiento
            </button>
          </div>
        </div>
        <Divider className="mt-4" />
      </div>

      <MovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        onSuccess={handleMovementSuccess}
      />
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onSuccess={handleAuditSuccess}
      />
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        onSuccess={handleProductSuccess}
        product={selectedProduct}
      />

      {/* KPI Cards estilo Dashboard con IA */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-3">
        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_05"
          kpiName="Rotación de Mercancía"
          value={merchandiseRotation.data?.rotationRate ?? 0}
          target={5}
          direction="up"
          unit=""
          status={(merchandiseRotation.data?.rotationRate ?? 0) > 5 ? 'good' : 'warning'}
        >
          <KPICard
            title="Rotación de Mercancía"
            value={merchandiseRotation.data?.rotationRate ?? 0}
            unit="veces"
            status={(merchandiseRotation.data?.rotationRate ?? 0) > 5 ? 'good' : 'warning'}
            direction="up"
            subtitle="NOR_DIS_IND_05"
            loading={merchandiseRotation.isLoading}
          />
        </AiOverlay>

        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_06"
          kpiName="Duración del Inventario"
          value={inventoryDuration.data?.daysOfInventory ?? 0}
          target={30}
          direction="down"
          unit="días"
          status={(inventoryDuration.data?.daysOfInventory ?? 0) < 30 ? 'good' : 'warning'}
        >
          <KPICard
            title="Duración del Inventario"
            value={inventoryDuration.data?.daysOfInventory ?? 0}
            unit="días"
            status={(inventoryDuration.data?.daysOfInventory ?? 0) < 30 ? 'good' : 'warning'}
            direction="down"
            subtitle="NOR_DIS_IND_06"
            loading={inventoryDuration.isLoading}
          />
        </AiOverlay>

        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_09"
          kpiName="Exactitud de Inventario"
          value={inventoryAccuracy.data?.accuracyPercentage ?? 0}
          target={95}
          direction="up"
          unit="%"
          status={(inventoryAccuracy.data?.accuracyPercentage ?? 0) > 95 ? 'good' : 'warning'}
        >
          <KPICard
            title="Exactitud de Inventario"
            value={inventoryAccuracy.data?.accuracyPercentage ?? 0}
            unit="%"
            status={(inventoryAccuracy.data?.accuracyPercentage ?? 0) > 95 ? 'good' : 'warning'}
            direction="up"
            subtitle="NOR_DIS_IND_09"
            loading={inventoryAccuracy.isLoading}
          />
        </AiOverlay>

        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_08"
          kpiName="Valor Económico"
          value={Number(economicValue.data?.economicInventoryValue ?? 0)}
          target={100000000}
          direction="down"
          unit="$"
          status="neutral"
        >
          <KPICard
            title="Valor Económico"
            value={Number(economicValue.data?.economicInventoryValue ?? 0)}
            unit="$"
            status="neutral"
            subtitle="NOR_DIS_IND_08"
            loading={economicValue.isLoading}
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
            icon={History}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-emerald-600 hover:bg-white/60 rounded-lg transition-all duration-300 data-[selected]:bg-white data-[selected]:text-emerald-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-emerald-100 data-[selected]:border-b-[3px] data-[selected]:border-emerald-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Movimientos
          </Tab>
          <Tab
            icon={Package}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-amber-600 hover:bg-white/60 rounded-lg transition-all duration-300 data-[selected]:bg-white data-[selected]:text-amber-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-amber-100 data-[selected]:border-b-[3px] data-[selected]:border-amber-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Productos
          </Tab>
          <Tab
            icon={ClipboardCheck}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-purple-600 hover:bg-white/60 rounded-lg transition-all duration-300 data-[selected]:bg-white data-[selected]:text-purple-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-purple-100 data-[selected]:border-b-[3px] data-[selected]:border-purple-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Auditorías
          </Tab>
        </TabList>
        <TabPanels className="bg-white border border-gray-200 rounded-b-xl shadow-sm">
          <TabPanel>
            <div className="p-5 space-y-5">
              {/* Resumen de Movimientos */}
              <div className="rounded-xl border border-gray-200 shadow-sm p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-gray-900">Resumen de Movimientos</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatusCard label="Total Productos" count={totalProducts} color="blue" icon={<Box className="h-4 w-4" />} />
                  <StatusCard label="Total Movimientos" count={totalMovements} color="primary" icon={<History className="h-4 w-4" />} />
                  <StatusCard label="Entradas" count={inMovements} color="emerald" icon={<CheckCircle2 className="h-4 w-4" />} />
                  <StatusCard label="Salidas" count={outMovements} color="red" icon={<AlertTriangle className="h-4 w-4" />} />
                </div>
              </div>

              {/* Placeholder para gráfico */}
              <Card className="border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <BarChart3 className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-900">Rotación de Inventario</h3>
                  <span className="ml-auto text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    NOR_DIS_IND_05
                  </span>
                </div>
                <div className="h-72 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                  <div className="text-center">
                    <BarChart3 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Gráfico de rotación de inventario</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="p-5">
              <InventoryMovementsTable movements={movements || []} />
            </div>
          </TabPanel>

          <TabPanel>
            <div className="p-5">
              <ProductsTable products={products || []} onEdit={handleEditProduct} />
            </div>
          </TabPanel>

          <TabPanel>
            <div className="p-5">
              <AuditsTable audits={audits || []} />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}

function StatusCard({ label, count, color, icon }: { label: string; count: number; color: string; icon: React.ReactNode }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    primary: { bg: 'bg-primary/5', border: 'border-primary/20', text: 'text-primary' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  };
  const c = colors[color] || colors.primary;

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
