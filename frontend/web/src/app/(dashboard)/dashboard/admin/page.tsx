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
  Factory,
  Settings,
  Activity,
  PlusCircle,
  AlertCircle,
  Zap,
  TrendingUp,
  BarChart3,
  ClipboardList,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Gauge,
} from 'lucide-react';
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
} from 'recharts';
import { trpc } from '@/lib/trpc/react';
import { KPICard } from '@/components/ui/kpi-card';
import { AiOverlay } from '@/components/ui/ai-interpretation';
import { MachinesTable } from '@/components/production/machines-table';
import { ProductionRecordsTable } from '@/components/production/production-records-table';
import { MaintenanceOrdersTable } from '@/components/production/maintenance-orders-table';
import { MachineModal } from '@/components/production/machine-modal';
import { ProductionRecordModal } from '@/components/production/production-record-modal';
import { MaintenanceOrderModal } from '@/components/production/maintenance-order-modal';

export default function ProductionPage() {
  const [selectedPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');

  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedMaintenanceOrder, setSelectedMaintenanceOrder] = useState<any>(null);

  const utils = trpc.useUtils();

  // KPIs
  const capacityUtilization = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_26',
    ...selectedPeriod,
    machineId: selectedMachineId || undefined,
  });
  const machinePerformance = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_27',
    ...selectedPeriod,
    machineId: selectedMachineId || undefined,
  });

  // Datos
  const { data: machines } = trpc.inventory.getMachines.useQuery();
  const { data: records } = trpc.inventory.getProductionRecords.useQuery();
  const { data: maintenanceOrders } = trpc.inventory.getMaintenanceOrders.useQuery();

  const handleMachineSuccess = () => {
    utils.inventory.getMachines.invalidate();
    utils.inventory.getProductionRecords.invalidate();
  };

  const handleRecordSuccess = () => {
    utils.inventory.getProductionRecords.invalidate();
  };

  const handleEditMachine = (machine: any) => {
    setSelectedMachine(machine);
    setIsMachineModalOpen(true);
  };

  const handleCloseMachineModal = () => {
    setIsMachineModalOpen(false);
    setSelectedMachine(null);
  };

  const handleEditRecord = (record: any) => {
    setSelectedRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleCloseRecordModal = () => {
    setIsRecordModalOpen(false);
    setSelectedRecord(null);
  };

  const handleMaintenanceSuccess = () => {
    utils.inventory.getMaintenanceOrders.invalidate();
    utils.inventory.getMachines.invalidate();
  };

  const handleEditMaintenance = (order: any) => {
    setSelectedMaintenanceOrder(order);
    setIsMaintenanceModalOpen(true);
  };

  const handleCloseMaintenanceModal = () => {
    setIsMaintenanceModalOpen(false);
    setSelectedMaintenanceOrder(null);
  };

  // Métricas derivadas
  const totalMachines = machines?.length ?? 0;
  const operationalMachines = machines?.filter((m: any) => m.status === 'operational').length ?? 0;
  const inMaintenance = machines?.filter((m: any) => m.status === 'maintenance').length ?? 0;
  const breakdownMachines = machines?.filter((m: any) => m.status === 'breakdown').length ?? 0;

  const totalProduced = records?.reduce((sum: number, r: any) => sum + (r.quantityProduced || 0), 0) ?? 0;
  const totalDefective = records?.reduce((sum: number, r: any) => sum + (r.quantityDefective || 0), 0) ?? 0;
  const qualityRate = totalProduced > 0 ? (((totalProduced - totalDefective) / totalProduced) * 100).toFixed(1) : '0.0';

  // OEE estimado = rendimiento * calidad (asumiendo disponibilidad del 90%)
  const oee = (Number(machinePerformance.data?.performancePercentage || 0) * Number(qualityRate) * 0.9 / 100).toFixed(1);

  return (
    <main className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header estilo Dashboard */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-dark-tremor-content-strong">Producción e Ingeniería</h1>
            <p className="text-gray-500 dark:text-dark-tremor-content-subtle mt-0.5 text-xs">Monitoreo de eficiencia de planta, máquinas y registros de producción.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedMachine(null); setIsMachineModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors shadow-sm"
            >
              <Factory className="h-4 w-4" />
              Nueva Máquina
            </button>
            <button
              onClick={() => { setSelectedRecord(null); setIsRecordModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              Registrar Producción
            </button>
          </div>
        </div>
        <Divider className="mt-4" />
      </div>

      <MachineModal
        isOpen={isMachineModalOpen}
        onClose={handleCloseMachineModal}
        onSuccess={handleMachineSuccess}
        machine={selectedMachine}
      />
      <ProductionRecordModal
        isOpen={isRecordModalOpen}
        onClose={handleCloseRecordModal}
        onSuccess={handleRecordSuccess}
        record={selectedRecord}
      />
      <MaintenanceOrderModal
        isOpen={isMaintenanceModalOpen}
        onClose={handleCloseMaintenanceModal}
        onSuccess={handleMaintenanceSuccess}
        order={selectedMaintenanceOrder}
      />

      {/* KPI Cards estilo Dashboard con IA */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-3">
        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_26"
          kpiName="Utilización de Capacidad"
          value={capacityUtilization.data?.utilizationPercentage ?? 0}
          target={80}
          direction="up"
          unit="%"
          status={(capacityUtilization.data?.utilizationPercentage ?? 0) > 80 ? 'good' : 'warning'}
        >
          <KPICard
            title="Utilización de Capacidad"
            value={capacityUtilization.data?.utilizationPercentage ?? 0}
            unit="%"
            status={(capacityUtilization.data?.utilizationPercentage ?? 0) > 80 ? 'good' : 'warning'}
            direction="up"
            subtitle="NOR_DIS_IND_26"
            loading={capacityUtilization.isLoading}
          />
        </AiOverlay>

        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_27"
          kpiName="Rendimiento de Máquinas"
          value={machinePerformance.data?.performancePercentage ?? 0}
          target={90}
          direction="up"
          unit="%"
          status={(machinePerformance.data?.performancePercentage ?? 0) > 90 ? 'good' : 'warning'}
        >
          <KPICard
            title="Rendimiento de Máquinas"
            value={machinePerformance.data?.performancePercentage ?? 0}
            unit="%"
            status={(machinePerformance.data?.performancePercentage ?? 0) > 90 ? 'good' : 'warning'}
            direction="up"
            subtitle="NOR_DIS_IND_27"
            loading={machinePerformance.isLoading}
          />
        </AiOverlay>

        <KPICard
          title="Tasa de Calidad"
          value={Number(qualityRate)}
          unit="%"
          status={Number(qualityRate) > 95 ? 'good' : 'warning'}
          direction="up"
          subtitle="Producción Limpia"
          loading={!records}
        />

        <KPICard
          title="OEE Estimado"
          value={Number(oee)}
          unit="%"
          status={Number(oee) > 85 ? 'good' : 'warning'}
          direction="up"
          subtitle="Overall Equipment Effectiveness"
          loading={capacityUtilization.isLoading || machinePerformance.isLoading}
        />
      </Grid>

      {/* Selector de máquina para KPIs */}
      {machines && machines.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <Settings className="h-4 w-4 text-gray-400 dark:text-dark-tremor-content-subtle" />
          <span className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle">Filtrar KPIs por máquina:</span>
          <select
            value={selectedMachineId}
            onChange={(e) => setSelectedMachineId(e.target.value)}
            className="text-xs px-2 py-1 border border-gray-200 dark:border-dark-tremor-border rounded-lg bg-white dark:bg-dark-tremor-background focus:outline-none focus:ring-1 focus:ring-primary/30"
          >
            <option value="">Todas las máquinas</option>
            {machines.map((m: any) => (
              <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs estilo Dashboard */}
      <TabGroup className="mt-6">
        <TabList className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-t-xl border border-indigo-100/50 dark:border-indigo-900/30 border-b-0 shadow-sm p-1.5 gap-1.5">
          <Tab
            icon={Activity}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-dark-tremor-content-subtle hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/60 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-all duration-300 data-[selected]:bg-white dark:data-[selected]:bg-dark-tremor-background data-[selected]:text-indigo-600 dark:data-[selected]:text-indigo-400 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-indigo-100 dark:data-[selected]:shadow-indigo-900/20 data-[selected]:border-b-[3px] data-[selected]:border-indigo-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Líneas de Producción
          </Tab>
          <Tab
            icon={ClipboardList}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-dark-tremor-content-subtle hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/60 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-all duration-300 data-[selected]:bg-white dark:data-[selected]:bg-dark-tremor-background data-[selected]:text-emerald-600 dark:data-[selected]:text-emerald-400 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-emerald-100 dark:data-[selected]:shadow-emerald-900/20 data-[selected]:border-b-[3px] data-[selected]:border-emerald-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Registros
          </Tab>
          <Tab
            icon={Factory}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-dark-tremor-content-subtle hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white/60 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-all duration-300 data-[selected]:bg-white dark:data-[selected]:bg-dark-tremor-background data-[selected]:text-amber-600 dark:data-[selected]:text-amber-400 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-amber-100 dark:data-[selected]:shadow-amber-900/20 data-[selected]:border-b-[3px] data-[selected]:border-amber-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Máquinas
          </Tab>
          <Tab
            icon={Wrench}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-dark-tremor-content-subtle hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/60 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-all duration-300 data-[selected]:bg-white dark:data-[selected]:bg-dark-tremor-background data-[selected]:text-purple-600 dark:data-[selected]:text-purple-400 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-purple-100 dark:data-[selected]:shadow-purple-900/20 data-[selected]:border-b-[3px] data-[selected]:border-purple-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Mantenimiento
          </Tab>
        </TabList>
        <TabPanels className="bg-white dark:bg-dark-tremor-background border border-gray-200 dark:border-dark-tremor-border rounded-b-xl shadow-sm">
          {/* Líneas de Producción */}
          <TabPanel>
            <div className="p-5 space-y-5">
              {/* Resumen de Máquinas */}
                <div className="rounded-xl border border-gray-200 dark:border-dark-tremor-border shadow-sm p-4 bg-white dark:bg-dark-tremor-background">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Resumen de Estado de Máquinas</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatusCard label="Total Máquinas" count={totalMachines} color="blue" icon={<Factory className="h-4 w-4" />} />
                  <StatusCard label="Operativas" count={operationalMachines} color="emerald" icon={<CheckCircle2 className="h-4 w-4" />} />
                  <StatusCard label="Mantenimiento" count={inMaintenance} color="amber" icon={<Wrench className="h-4 w-4" />} />
                  <StatusCard label="Averías" count={breakdownMachines} color="red" icon={<AlertTriangle className="h-4 w-4" />} />
                </div>
              </div>

              {/* Cards de máquinas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {machines?.map((machine: any) => {
                  const statusMap: Record<string, { label: string; color: string; barColor: string }> = {
                    operational: { label: 'En Marcha', color: 'emerald', barColor: 'blue' },
                    maintenance: { label: 'Mantenimiento', color: 'amber', barColor: 'amber' },
                    breakdown: { label: 'Detenida', color: 'red', barColor: 'gray' },
                    inactive: { label: 'Inactiva', color: 'gray', barColor: 'gray' },
                  };
                  const s = statusMap[machine.status || ''] || statusMap.inactive;
                  const eff = Number(machine.efficiencyRate || 0);
                  const load = machine.status === 'operational' ? Math.min(100, eff) : 0;

                  return (
                    <div key={machine.id} className="p-4 border rounded-xl bg-white dark:bg-dark-tremor-background shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <Text className="font-bold text-gray-900 dark:text-dark-tremor-content-strong">{machine.name}</Text>
                          <Text className="text-xs text-gray-400 dark:text-dark-tremor-content-subtle font-mono">{machine.code}</Text>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          s.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/30' :
                          s.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/30' :
                          s.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700/30' :
                          'bg-gray-50 dark:bg-dark-tremor-background-muted text-gray-700 dark:text-dark-tremor-content border border-gray-200 dark:border-dark-tremor-border'
                        }`}>
                          {s.label}
                        </span>
                      </div>
                      <Text className="text-xs text-gray-400 dark:text-dark-tremor-content-subtle mt-1">
                        {machine.type || 'Sin tipo'} · {machine.brand || '-'} {machine.model || ''}
                      </Text>
                      <div className="mt-4 space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500 dark:text-dark-tremor-content-subtle">Carga de trabajo</span>
                            <span className="font-semibold text-gray-700 dark:text-dark-tremor-content">{load}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-dark-tremor-background-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${s.barColor === 'blue' ? 'bg-blue-500' : s.barColor === 'amber' ? 'bg-amber-500' : 'bg-gray-300'}`}
                              style={{ width: `${load}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-dark-tremor-content-subtle">
                          <span>Capacidad: {Number(machine.maxCapacity || 0).toLocaleString('en-US')} {machine.capacityUnit || ''}</span>
                          <span>Eficiencia: {eff}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!machines || machines.length === 0) && (
                  <div className="col-span-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white dark:from-dark-tremor-background to-gray-50/50 dark:to-dark-tremor-background-subtle rounded-lg border border-dashed border-gray-200 dark:border-dark-tremor-border">
                    <Factory className="h-12 w-12 text-gray-300 dark:text-dark-tremor-content-subtle mb-4" />
                    <p className="text-gray-500 dark:text-dark-tremor-content-subtle font-medium">No hay máquinas registradas</p>
                    <p className="text-gray-400 dark:text-dark-tremor-content-subtle text-xs mt-1">Registra máquinas para monitorear su rendimiento</p>
                  </div>
                )}
              </div>

              {/* Gráfico placeholder */}
              <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border">
                  <BarChart3 className="h-4 w-4 text-gray-400 dark:text-dark-tremor-content-subtle" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Rendimiento de Máquinas</h3>
                  <span className="ml-auto text-[10px] font-medium text-gray-400 dark:text-dark-tremor-content-subtle bg-gray-100 dark:bg-dark-tremor-background-muted px-2 py-0.5 rounded">
                    NOR_DIS_IND_06
                  </span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={machines?.map((m: any) => ({
                        name: m.name,
                        eficiencia: Number(m.efficiencyRate || 0),
                        capacidad: Number(m.maxCapacity || 0),
                        estado: m.status || 'inactive',
                      })) || []}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        label={{ value: 'Eficiencia %', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6b7280' } }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        label={{ value: 'Capacidad', angle: 90, position: 'insideRight', style: { fontSize: 11, fill: '#6b7280' } }}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '10px', border: 'var(--tooltip-border, 1px solid #e5e7eb)', fontSize: '12px', backgroundColor: 'var(--tooltip-bg, #ffffff)', color: 'var(--tooltip-color, #374151)' }}
                        formatter={(value: any, name: string) => [
                          name === 'eficiencia' ? `${Number(value).toFixed(1)}%` : Number(value).toLocaleString('en-US'),
                          name === 'eficiencia' ? 'Eficiencia' : 'Capacidad Máx',
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar yAxisId="left" dataKey="eficiencia" name="Eficiencia %" radius={[4, 4, 0, 0]} maxBarSize={50}>
                        {(machines || []).map((m: any, index: number) => {
                          const status = m.status || 'inactive';
                          const color =
                            status === 'operational' ? '#10b981' :
                            status === 'maintenance' ? '#f59e0b' :
                            status === 'breakdown' ? '#ef4444' : '#9ca3af';
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                      <Bar yAxisId="right" dataKey="capacidad" name="Capacidad Máx" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} opacity={0.7} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </TabPanel>

          {/* Registros de Producción */}
          <TabPanel>
            <div className="p-5">
              <ProductionRecordsTable records={records || []} onEdit={handleEditRecord} />
            </div>
          </TabPanel>

          {/* Máquinas */}
          <TabPanel>
            <div className="p-5">
              <MachinesTable machines={machines || []} onEdit={handleEditMachine} />
            </div>
          </TabPanel>

          {/* Mantenimiento */}
          <TabPanel>
            <div className="p-5 space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => { setSelectedMaintenanceOrder(null); setIsMaintenanceModalOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/30 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors shadow-sm"
                >
                  <Wrench className="h-4 w-4" />
                  Nueva Orden de Mantenimiento
                </button>
              </div>

              <MaintenanceOrdersTable orders={maintenanceOrders || []} onEdit={handleEditMaintenance} />

              <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
                  <Wrench className="h-4 w-4 text-gray-400 dark:text-dark-tremor-content-subtle" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Calendario de Mantenimiento</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50/80 dark:bg-dark-tremor-background-muted border-b border-gray-100 dark:border-dark-tremor-border">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Máquina</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Último Mantenimiento</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Próximo Mantenimiento</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {machines?.map((machine: any) => {
                        const last = machine.lastMaintenance ? new Date(machine.lastMaintenance).toLocaleDateString('es-CO') : '-';
                        const next = machine.nextMaintenance ? new Date(machine.nextMaintenance).toLocaleDateString('es-CO') : '-';
                        const isOverdue = machine.nextMaintenance && new Date(machine.nextMaintenance) < new Date();
                        return (
                          <tr key={machine.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-tremor-background-subtle transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Settings className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900 dark:text-dark-tremor-content-strong block">{machine.name}</span>
                                  <span className="text-[10px] text-gray-400 dark:text-dark-tremor-content-subtle font-mono">{machine.code}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-dark-tremor-content text-xs">{last}</td>
                            <td className="px-4 py-3 text-xs">
                              <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-600 dark:text-dark-tremor-content'}>
                                {next}
                              </span>
                              {isOverdue && <span className="ml-2 text-[10px] text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded font-bold">VENCIDO</span>}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                machine.status === 'operational' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/30' :
                                machine.status === 'maintenance' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/30' :
                                'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700/30'
                              }`}>
                                {machine.status === 'operational' ? 'Operativa' : machine.status === 'maintenance' ? 'Mantenimiento' : 'Avería'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {(!machines || machines.length === 0) && (
                        <tr>
                            <td colSpan={4} className="px-4 py-12 text-center text-gray-400 dark:text-dark-tremor-content-subtle text-sm">
                            No hay máquinas registradas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Alertas */}
              <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Alertas de Operación</h3>
                </div>
                <div className="px-5 pb-5 space-y-2">
                  {breakdownMachines > 0 ? (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">{breakdownMachines} máquina(s) en avería</p>
                        <p className="text-xs text-red-500 dark:text-red-400/80 mt-0.5">Revisa la pestaña Máquinas para ver detalles.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Todas las máquinas operativas</p>
                        <p className="text-xs text-emerald-500 dark:text-emerald-400/80 mt-0.5">No hay alertas críticas en este momento.</p>
                      </div>
                    </div>
                  )}
                  {inMaintenance > 0 && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg">
                      <Wrench className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{inMaintenance} máquina(s) en mantenimiento</p>
                        <p className="text-xs text-amber-500 dark:text-amber-400/80 mt-0.5">Programadas para mantenimiento preventivo.</p>
                      </div>
                    </div>
                  )}
                  {Number(qualityRate) < 90 && (
                    <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/30 rounded-lg">
                      <Gauge className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Tasa de calidad baja: {qualityRate}%</p>
                        <p className="text-xs text-orange-500 dark:text-orange-400/80 mt-0.5">Revisa los registros de producción para identificar el problema.</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}

function StatusCard({ label, count, color, icon }: { label: string; count: number; color: string; icon: React.ReactNode }) {
  const colors: Record<string, { bg: string; border: string; text: string; darkBg?: string; darkBorder?: string; darkText?: string }> = {
    blue: { bg: 'bg-blue-50/50', border: 'border-blue-200/50', text: 'text-blue-700', darkBg: 'dark:bg-blue-900/20', darkBorder: 'dark:border-blue-700/30', darkText: 'dark:text-blue-400' },
    primary: { bg: 'bg-primary/5', border: 'border-primary/20', text: 'text-primary', darkBg: 'dark:bg-primary/10', darkBorder: 'dark:border-primary/20', darkText: 'dark:text-primary' },
    emerald: { bg: 'bg-emerald-50/50', border: 'border-emerald-200/50', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-900/20', darkBorder: 'dark:border-emerald-700/30', darkText: 'dark:text-emerald-400' },
    amber: { bg: 'bg-amber-50/50', border: 'border-amber-200/50', text: 'text-amber-700', darkBg: 'dark:bg-amber-900/20', darkBorder: 'dark:border-amber-700/30', darkText: 'dark:text-amber-400' },
    red: { bg: 'bg-red-50/50', border: 'border-red-200/50', text: 'text-red-700', darkBg: 'dark:bg-red-900/20', darkBorder: 'dark:border-red-700/30', darkText: 'dark:text-red-400' },
  };
  const c = colors[color] || colors.primary;

  return (
    <div className={`flex items-center gap-2.5 p-3 rounded-lg ${c.bg} ${c.darkBg} border ${c.border} ${c.darkBorder}`}>
      <span className={`${c.text} ${c.darkText}`}>{icon}</span>
      <div>
        <p className="text-[11px] text-gray-500 dark:text-dark-tremor-content-subtle">{label}</p>
        <p className={`text-base font-bold ${c.text} ${c.darkText}`}>{count}</p>
      </div>
    </div>
  );
}
