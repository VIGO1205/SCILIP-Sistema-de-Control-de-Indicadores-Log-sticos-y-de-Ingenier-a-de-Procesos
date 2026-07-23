'use client';

import React, { useState } from 'react';
import {
  Card,
  Grid,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Divider,
  Text,
} from '@tremor/react';
import {
  Globe,
  Ship,
  Plane,
  PlusCircle,
  Anchor,
  TrendingUp,
  BarChart3,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { KPICard } from '@/components/ui/kpi-card';
import { AiOverlay } from '@/components/ui/ai-interpretation';
import { OperationsTable } from '@/components/international/operations-table';
import { ImportExportModal } from '@/components/international/import-export-modal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export default function InternationalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<any>(null);
  const [selectedPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });

  const utils = trpc.useUtils();

  // KPIs
  const importUnitCost = trpc.internationalTrade.getUnitCost.useQuery({
    ...selectedPeriod,
    type: 'IMPORT',
  });
  const exportUnitCost = trpc.internationalTrade.getUnitCost.useQuery({
    ...selectedPeriod,
    type: 'EXPORT',
  });

  // Datos
  const { data: operations, isLoading: loadingOperations } = trpc.internationalTrade.getOperations.useQuery();
  const { data: monthlyData } = trpc.internationalTrade.getMonthlyData.useQuery({
    year: new Date().getFullYear(),
  });

  const handleSuccess = () => {
    utils.internationalTrade.getOperations.invalidate();
    utils.internationalTrade.getUnitCost.invalidate();
    utils.internationalTrade.getMonthlyData.invalidate();
  };

  const handleEdit = (operation: any) => {
    setSelectedOperation(operation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOperation(null);
  };

  // Métricas derivadas
  const importOps = operations?.filter((o: any) => o.operationType === 'IMPORT') || [];
  const exportOps = operations?.filter((o: any) => o.operationType === 'EXPORT') || [];
  const totalImportCost = importOps.reduce((sum: number, o: any) => sum + Number(o.totalCostUsd || 0), 0);
  const totalExportCost = exportOps.reduce((sum: number, o: any) => sum + Number(o.totalCostUsd || 0), 0);

  // Datos para gráfico de composición
  const compositionData = [
    { name: 'Importaciones', value: importOps.length, color: '#06b6d4' },
    { name: 'Exportaciones', value: exportOps.length, color: '#8b5cf6' },
  ].filter((d) => d.value > 0);

  return (
    <main className="p-4 sm:p-5 bg-gray-50 min-h-screen">
      {/* Header estilo Dashboard */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Comercio Exterior</h1>
            <p className="text-gray-500 mt-0.5 text-xs">Gestión de importaciones, exportaciones y costos DDP/EXW.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedOperation(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              Registrar Operación
            </button>
          </div>
        </div>
        <Divider className="mt-4" />
      </div>

      <ImportExportModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        operation={selectedOperation}
      />

      {/* KPI Cards estilo Dashboard con IA */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-3">
        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_28"
          kpiName="Costo Unitario Importación"
          value={importUnitCost.data?.unitCost ?? 0}
          target={50}
          direction="down"
          unit="USD/und"
          status={(importUnitCost.data?.unitCost ?? 0) < 50 ? 'good' : 'warning'}
        >
          <KPICard
            title="Costo Unitario Importación"
            value={importUnitCost.data?.unitCost ?? 0}
            unit="USD/und"
            status={(importUnitCost.data?.unitCost ?? 0) < 50 ? 'good' : 'warning'}
            direction="down"
            subtitle="NOR_DIS_IND_28"
            loading={importUnitCost.isLoading}
          />
        </AiOverlay>

        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_28"
          kpiName="Costo Unitario Exportación"
          value={exportUnitCost.data?.unitCost ?? 0}
          target={50}
          direction="down"
          unit="USD/und"
          status={(exportUnitCost.data?.unitCost ?? 0) < 50 ? 'good' : 'warning'}
        >
          <KPICard
            title="Costo Unitario Exportación"
            value={exportUnitCost.data?.unitCost ?? 0}
            unit="USD/und"
            status={(exportUnitCost.data?.unitCost ?? 0) < 50 ? 'good' : 'warning'}
            direction="down"
            subtitle="NOR_DIS_IND_28 (EXPORT)"
            loading={exportUnitCost.isLoading}
          />
        </AiOverlay>

        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_28"
          kpiName="Total Importaciones"
          value={totalImportCost}
          target={100000}
          direction="up"
          unit="USD"
          status="neutral"
        >
          <KPICard
            title="Total Importaciones"
            value={totalImportCost}
            unit="USD"
            status="neutral"
            direction="up"
            subtitle={`${importOps.length} operaciones`}
            loading={loadingOperations}
          />
        </AiOverlay>

        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_28"
          kpiName="Total Exportaciones"
          value={totalExportCost}
          target={100000}
          direction="up"
          unit="USD"
          status="neutral"
        >
          <KPICard
            title="Total Exportaciones"
            value={totalExportCost}
            unit="USD"
            status="neutral"
            direction="up"
            subtitle={`${exportOps.length} operaciones`}
            loading={loadingOperations}
          />
        </AiOverlay>
      </Grid>

      {/* Tabs estilo Dashboard */}
      <TabGroup className="mt-6">
        <TabList className="bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 rounded-t-xl border border-cyan-100/50 border-b-0 shadow-sm p-1.5 gap-1.5">
          <Tab
            icon={Ship}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-cyan-600 hover:bg-white/60 rounded-lg transition-all duration-300 data-[selected]:bg-white data-[selected]:text-cyan-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-cyan-100 data-[selected]:border-b-[3px] data-[selected]:border-cyan-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Importaciones
          </Tab>
          <Tab
            icon={Plane}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-violet-600 hover:bg-white/60 rounded-lg transition-all duration-300 data-[selected]:bg-white data-[selected]:text-violet-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-violet-100 data-[selected]:border-b-[3px] data-[selected]:border-violet-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Exportaciones
          </Tab>
          <Tab
            icon={BarChart3}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-blue-600 hover:bg-white/60 rounded-lg transition-all duration-300 data-[selected]:bg-white data-[selected]:text-blue-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-blue-100 data-[selected]:border-b-[3px] data-[selected]:border-blue-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Análisis
          </Tab>
        </TabList>

        <TabPanels className="bg-white border border-gray-200 rounded-b-xl shadow-sm">
          {/* Importaciones */}
          <TabPanel>
            <div className="p-5 space-y-5">
              <div className="rounded-xl border border-gray-200 shadow-sm p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-gray-900">Resumen de Importaciones</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatusCard label="Total Importaciones" count={importOps.length} color="cyan" icon={<Ship className="h-4 w-4" />} />
                  <StatusCard label="En Tránsito" count={importOps.filter((o: any) => o.status === 'IN_TRANSIT').length} color="blue" icon={<Anchor className="h-4 w-4" />} />
                  <StatusCard label="En Aduana" count={importOps.filter((o: any) => o.status === 'CUSTOMS').length} color="amber" icon={<Package className="h-4 w-4" />} />
                  <StatusCard label="Entregadas" count={importOps.filter((o: any) => o.status === 'DELIVERED').length} color="emerald" icon={<ArrowDownRight className="h-4 w-4" />} />
                </div>
              </div>

              <OperationsTable
                operations={operations || []}
                type="IMPORT"
                onEdit={handleEdit}
              />
            </div>
          </TabPanel>

          {/* Exportaciones */}
          <TabPanel>
            <div className="p-5 space-y-5">
              <div className="rounded-xl border border-gray-200 shadow-sm p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-gray-900">Resumen de Exportaciones</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatusCard label="Total Exportaciones" count={exportOps.length} color="violet" icon={<Plane className="h-4 w-4" />} />
                  <StatusCard label="En Tránsito" count={exportOps.filter((o: any) => o.status === 'IN_TRANSIT').length} color="blue" icon={<Anchor className="h-4 w-4" />} />
                  <StatusCard label="En Aduana" count={exportOps.filter((o: any) => o.status === 'CUSTOMS').length} color="amber" icon={<Package className="h-4 w-4" />} />
                  <StatusCard label="Entregadas" count={exportOps.filter((o: any) => o.status === 'DELIVERED').length} color="emerald" icon={<ArrowUpRight className="h-4 w-4" />} />
                </div>
              </div>

              <OperationsTable
                operations={operations || []}
                type="EXPORT"
                onEdit={handleEdit}
              />
            </div>
          </TabPanel>

          {/* Análisis */}
          <TabPanel>
            <div className="p-5 space-y-5">
              {/* Gráfico mensual import/export */}
              <AiOverlay
                type="chart"
                chartType="bar"
                title="Importaciones vs Exportaciones Mensuales"
                data={monthlyData || []}
              >
                <Card className="border border-gray-200 shadow-sm rounded-xl">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-bold text-gray-900">Importaciones vs Exportaciones Mensuales</h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '12px', backgroundColor: '#ffffff', color: '#374151' }}
                          formatter={(value: any) => [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, '']}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="importCost" name="Importaciones" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="exportCost" name="Exportaciones" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </AiOverlay>

              {/* Gráfico de composición */}
              <Card className="border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 px-5 pt-5">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-900">Composición de Operaciones</h3>
                </div>
                <div className="h-72 flex items-center justify-center px-5 pb-5">
                  {compositionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={compositionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {compositionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '12px', backgroundColor: '#ffffff', color: '#374151' }}
                          formatter={(value: any, name: string) => [value, name]}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Globe className="h-12 w-12 mb-3 text-gray-300" />
                      <p className="text-sm">No hay operaciones registradas</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Costo total acumulado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-gray-200 shadow-sm rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Ship className="h-4 w-4 text-cyan-500" />
                    <h3 className="text-sm font-bold text-gray-900">Costo Total Importaciones</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">${totalImportCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-xs text-gray-500">USD acumulado</span>
                  </div>
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.min(100, totalImportCost > 0 ? (totalImportCost / (totalImportCost + totalExportCost || 1)) * 100 : 0)}%` }} />
                  </div>
                </Card>

                <Card className="border border-gray-200 shadow-sm rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Plane className="h-4 w-4 text-violet-500" />
                    <h3 className="text-sm font-bold text-gray-900">Costo Total Exportaciones</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">${totalExportCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-xs text-gray-500">USD acumulado</span>
                  </div>
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.min(100, totalExportCost > 0 ? (totalExportCost / (totalImportCost + totalExportCost || 1)) * 100 : 0)}%` }} />
                  </div>
                </Card>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}

function StatusCard({ label, count, color, icon }: { label: string; count: number; color: string; icon: React.ReactNode }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    primary: { bg: 'bg-primary/5', border: 'border-primary/20', text: 'text-primary' },
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
