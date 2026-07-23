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
  Truck,
  DollarSign,
  BarChart3,
  PlusCircle,
  Users,
  Route,
  TrendingUp,
  Navigation,
  Fuel,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Wrench,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { KPICard } from '@/components/ui/kpi-card';
import { AiOverlay } from '@/components/ui/ai-interpretation';
import { VehiclesTable } from '@/components/transport/vehicles-table';
import { TransportCostsTable } from '@/components/transport/transport-costs-table';
import { DriversTable } from '@/components/transport/drivers-table';
import { VehicleModal } from '@/components/transport/vehicle-modal';
import { TransportCostModal } from '@/components/transport/transport-cost-modal';
import { DriverModal } from '@/components/transport/driver-modal';
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
  LineChart,
  Line,
} from 'recharts';

export default function TransportPage() {
  const [selectedYear] = useState(new Date().getFullYear());
  const [selectedPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedCost, setSelectedCost] = useState<any>(null);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const utils = trpc.useUtils();

  // KPIs
  const transportVsSales = trpc.transport.getTransportVsSalesSummary.useQuery({ year: selectedYear });
  const costPerDriver = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_17',
    ...selectedPeriod,
  });
  const transportComparative = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_18',
    ...selectedPeriod,
  });

  // Datos
  const { data: vehicles } = trpc.transport.getVehicles.useQuery();
  const { data: costs } = trpc.transport.getTransportCosts.useQuery();
  const { data: drivers } = trpc.transport.getDrivers.useQuery();
  const { data: monthlyData } = trpc.transport.getTransportVsSalesMonthly.useQuery({ year: selectedYear });

  const handleVehicleSuccess = () => {
    utils.transport.getVehicles.invalidate();
  };

  const handleCostSuccess = () => {
    utils.transport.getTransportCosts.invalidate();
    utils.transport.getTransportVsSalesSummary.invalidate();
    utils.transport.getTransportVsSalesMonthly.invalidate();
    utils.kpi.getKpiData.invalidate({ code: 'NOR_DIS_IND_17' });
  };

  const handleEditVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setIsVehicleModalOpen(true);
  };

  const handleCloseVehicleModal = () => {
    setIsVehicleModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleEditCost = (cost: any) => {
    setSelectedCost(cost);
    setIsCostModalOpen(true);
  };

  const handleCloseCostModal = () => {
    setIsCostModalOpen(false);
    setSelectedCost(null);
  };

  const handleDriverSuccess = () => {
    utils.transport.getDrivers.invalidate();
    utils.transport.getAvailableEmployeesForDriver.invalidate();
  };

  const handleEditDriver = (driver: any) => {
    setSelectedDriver(driver);
    setIsDriverModalOpen(true);
  };

  const handleCloseDriverModal = () => {
    setIsDriverModalOpen(false);
    setSelectedDriver(null);
  };

  // Métricas derivadas
  const totalVehicles = vehicles?.length ?? 0;
  const activeVehicles = vehicles?.filter((v: any) => v.status === 'active').length ?? 0;
  const inMaintenance = vehicles?.filter((v: any) => v.status === 'maintenance').length ?? 0;
  const totalDrivers = drivers?.length ?? 0;

  const totalCosts = costs?.reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0) ?? 0;
  const fuelCosts = costs?.filter((c: any) => c.costType === 'FUEL').reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0) ?? 0;

  // Datos para gráfico de costos por tipo
  const costByType = costs?.reduce((acc: Record<string, number>, c: any) => {
    const type = c.costType || 'OTHER';
    acc[type] = (acc[type] || 0) + Number(c.amount || 0);
    return acc;
  }, {});

  const costChartData = Object.entries(costByType || {}).map(([type, amount]) => ({
    name: type,
    amount: Number(amount),
  }));

  const costTypeColors: Record<string, string> = {
    FUEL: '#f97316',
    MAINTENANCE: '#3b82f6',
    TOLL: '#a855f7',
    SALARY: '#10b981',
    INSURANCE: '#6b7280',
    OTHER: '#f59e0b',
  };

  const costTypeLabels: Record<string, string> = {
    FUEL: 'Combustible',
    MAINTENANCE: 'Mantenimiento',
    TOLL: 'Peajes',
    SALARY: 'Salarios',
    INSURANCE: 'Seguros',
    OTHER: 'Otros',
  };

  return (
    <main className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header estilo Dashboard */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-dark-tremor-content-strong">Gestión de Transporte</h1>
            <p className="text-gray-500 dark:text-dark-tremor-content-subtle mt-0.5 text-xs">Monitoreo de flota, costos de distribución y eficiencia de rutas.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedDriver(null); setIsDriverModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors shadow-sm"
            >
              <Users className="h-4 w-4" />
              Nuevo Conductor
            </button>
            <button
              onClick={() => { setSelectedVehicle(null); setIsVehicleModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/30 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors shadow-sm"
            >
              <Truck className="h-4 w-4" />
              Nuevo Vehículo
            </button>
            <button
              onClick={() => { setSelectedCost(null); setIsCostModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              Registrar Gasto
            </button>
          </div>
        </div>
        <Divider className="mt-4" />
      </div>

      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={handleCloseVehicleModal}
        onSuccess={handleVehicleSuccess}
        vehicle={selectedVehicle}
      />
      <TransportCostModal
        isOpen={isCostModalOpen}
        onClose={handleCloseCostModal}
        onSuccess={handleCostSuccess}
        cost={selectedCost}
      />
      <DriverModal
        isOpen={isDriverModalOpen}
        onClose={handleCloseDriverModal}
        onSuccess={handleDriverSuccess}
        driver={selectedDriver}
      />

      {/* KPI Cards estilo Dashboard con IA */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-3">
        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_16"
          kpiName="Transporte vs Ventas"
          value={transportVsSales.data?.averagePercentage ?? 0}
          target={10}
          direction="down"
          unit="%"
          status={(transportVsSales.data?.averagePercentage ?? 0) < 10 ? 'good' : 'warning'}
        >
          <KPICard
            title="Transporte vs Ventas"
            value={transportVsSales.data?.averagePercentage ?? 0}
            unit="%"
            status={(transportVsSales.data?.averagePercentage ?? 0) < 10 ? 'good' : 'warning'}
            direction="down"
            subtitle="NOR_DIS_IND_16"
            loading={transportVsSales.isLoading}
          />
        </AiOverlay>

        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_17"
          kpiName="Costo por Conductor"
          value={costPerDriver.data?.costPerDriver ?? 0}
          target={5000000}
          direction="down"
          unit="$"
          status="neutral"
        >
          <KPICard
            title="Costo por Conductor"
            value={costPerDriver.data?.costPerDriver ?? 0}
            unit="$"
            status="neutral"
            subtitle="NOR_DIS_IND_17"
            loading={costPerDriver.isLoading}
          />
        </AiOverlay>

        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_18"
          kpiName="Comparativo de Transporte"
          value={transportComparative.data?.efficiencyRatio ?? 0}
          target={100}
          direction="up"
          unit="idx"
          status="neutral"
        >
          <KPICard
            title="Comparativo de Transporte"
            value={transportComparative.data?.efficiencyRatio ?? 0}
            unit="idx"
            status="neutral"
            subtitle="NOR_DIS_IND_18"
            loading={transportComparative.isLoading}
          />
        </AiOverlay>

        <KPICard
          title="Gasto Total del Año"
          value={totalCosts}
          unit="$"
          status="neutral"
          subtitle="Acumulado"
          loading={!costs}
        />
      </Grid>

      {/* Tabs estilo Dashboard */}
      <TabGroup className="mt-6">
        <TabList className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-t-xl border border-indigo-100/50 dark:border-indigo-900/30 border-b-0 shadow-sm p-1.5 gap-1.5">
          <Tab
            icon={Truck}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-dark-tremor-content-subtle hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/60 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-all duration-300 data-[selected]:bg-white dark:data-[selected]:bg-dark-tremor-background data-[selected]:text-indigo-600 dark:data-[selected]:text-indigo-400 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-indigo-100 dark:data-[selected]:shadow-indigo-900/20 data-[selected]:border-b-[3px] data-[selected]:border-indigo-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Flota
          </Tab>
          <Tab
            icon={DollarSign}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-dark-tremor-content-subtle hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/60 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-all duration-300 data-[selected]:bg-white dark:data-[selected]:bg-dark-tremor-background data-[selected]:text-emerald-600 dark:data-[selected]:text-emerald-400 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-emerald-100 dark:data-[selected]:shadow-emerald-900/20 data-[selected]:border-b-[3px] data-[selected]:border-emerald-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Costos
          </Tab>
          <Tab
            icon={Users}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-dark-tremor-content-subtle hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white/60 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-all duration-300 data-[selected]:bg-white dark:data-[selected]:bg-dark-tremor-background data-[selected]:text-amber-600 dark:data-[selected]:text-amber-400 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-amber-100 dark:data-[selected]:shadow-amber-900/20 data-[selected]:border-b-[3px] data-[selected]:border-amber-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Conductores
          </Tab>
          <Tab
            icon={BarChart3}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-dark-tremor-content-subtle hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/60 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-all duration-300 data-[selected]:bg-white dark:data-[selected]:bg-dark-tremor-background data-[selected]:text-purple-600 dark:data-[selected]:text-purple-400 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-purple-100 dark:data-[selected]:shadow-purple-900/20 data-[selected]:border-b-[3px] data-[selected]:border-purple-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Análisis
          </Tab>
        </TabList>
        <TabPanels className="bg-white dark:bg-dark-tremor-background border border-gray-200 dark:border-dark-tremor-border rounded-b-xl shadow-sm">
          {/* Flota */}
          <TabPanel>
            <div className="p-5 space-y-5">
              <div className="rounded-xl border border-gray-200 dark:border-dark-tremor-border shadow-sm p-4 bg-white dark:bg-dark-tremor-background">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Resumen de Flota</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatusCard label="Total Vehículos" count={totalVehicles} color="blue" icon={<Truck className="h-4 w-4" />} />
                  <StatusCard label="Activos" count={activeVehicles} color="emerald" icon={<CheckCircle2 className="h-4 w-4" />} />
                  <StatusCard label="Mantenimiento" count={inMaintenance} color="amber" icon={<Wrench className="h-4 w-4" />} />
                  <StatusCard label="Conductores" count={totalDrivers} color="primary" icon={<Users className="h-4 w-4" />} />
                </div>
              </div>

              {/* Cards de vehículos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles?.map((vehicle: any) => {
                  const statusMap: Record<string, { label: string; color: string }> = {
                    active: { label: 'Activo', color: 'emerald' },
                    maintenance: { label: 'Mantenimiento', color: 'amber' },
                    inactive: { label: 'Inactivo', color: 'gray' },
                  };
                  const s = statusMap[vehicle.status || ''] || statusMap.inactive;
                  return (
                    <div key={vehicle.id} className="p-4 border rounded-xl bg-white dark:bg-dark-tremor-background shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <Text className="font-bold text-gray-900 dark:text-dark-tremor-content-strong">{vehicle.plateNumber}</Text>
                          <Text className="text-xs text-gray-400 dark:text-dark-tremor-content-subtle">{vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}</Text>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          s.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/30' :
                          s.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/30' :
                          s.color === 'gray' ? 'bg-gray-50 dark:bg-dark-tremor-background-muted text-gray-700 dark:text-dark-tremor-content border border-gray-200 dark:border-dark-tremor-border' :
                          'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700/30'
                        }`}>
                          {s.label}
                        </span>
                      </div>
                      <Text className="text-xs text-gray-400 dark:text-dark-tremor-content-subtle mt-1">
                        {vehicle.vehicleType || 'Sin tipo'} · {vehicle.fuelType || '-'}
                      </Text>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="text-gray-500 dark:text-dark-tremor-content-subtle">
                          <span className="text-gray-400 dark:text-dark-tremor-content-subtle">Peso:</span> {vehicle.maxWeightKg ? Number(vehicle.maxWeightKg).toLocaleString('en-US') + ' kg' : '-'}
                        </div>
                        <div className="text-gray-500 dark:text-dark-tremor-content-subtle">
                          <span className="text-gray-400 dark:text-dark-tremor-content-subtle">Volumen:</span> {vehicle.maxVolumeM3 ? Number(vehicle.maxVolumeM3).toLocaleString('en-US') + ' m³' : '-'}
                        </div>
                        <div className="text-gray-500 dark:text-dark-tremor-content-subtle">
                          <span className="text-gray-400 dark:text-dark-tremor-content-subtle">Eficiencia:</span> {vehicle.fuelEfficiency ? Number(vehicle.fuelEfficiency).toFixed(1) + ' km/L' : '-'}
                        </div>
                        <div className="text-gray-500 dark:text-dark-tremor-content-subtle">
                          <span className="text-gray-400 dark:text-dark-tremor-content-subtle">Propiedad:</span> {vehicle.isOwnVehicle ? 'Propio' : 'Arrendado'}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!vehicles || vehicles.length === 0) && (
                  <div className="col-span-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white dark:from-dark-tremor-background to-gray-50/50 dark:to-dark-tremor-background-subtle rounded-lg border border-dashed border-gray-200 dark:border-dark-tremor-border">
                    <Truck className="h-12 w-12 text-gray-300 dark:text-dark-tremor-content-subtle mb-4" />
                    <p className="text-gray-500 dark:text-dark-tremor-content-subtle font-medium">No hay vehículos registrados</p>
                    <p className="text-gray-400 dark:text-dark-tremor-content-subtle text-xs mt-1">Registra vehículos para gestionar tu flota</p>
                  </div>
                )}
              </div>

              <VehiclesTable vehicles={vehicles || []} onEdit={handleEditVehicle} />
            </div>
          </TabPanel>

          {/* Costos */}
          <TabPanel>
            <div className="p-5 space-y-5">
              <div className="rounded-xl border border-gray-200 dark:border-dark-tremor-border shadow-sm p-4 bg-white dark:bg-dark-tremor-background">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Resumen de Costos</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatusCard label="Gasto Total" count={totalCosts} color="blue" icon={<DollarSign className="h-4 w-4" />} />
                  <StatusCard label="Combustible" count={fuelCosts} color="orange" icon={<Fuel className="h-4 w-4" />} />
                  <StatusCard label="Registros" count={costs?.length ?? 0} color="primary" icon={<Route className="h-4 w-4" />} />
                  <StatusCard label="Vehículos Activos" count={activeVehicles} color="emerald" icon={<Truck className="h-4 w-4" />} />
                </div>
              </div>

              <TransportCostsTable costs={costs || []} onEdit={handleEditCost} />
            </div>
          </TabPanel>

          {/* Conductores */}
          <TabPanel>
            <div className="p-5 space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => { setSelectedDriver(null); setIsDriverModalOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors shadow-sm"
                >
                  <Users className="h-4 w-4" />
                  Nuevo Conductor
                </button>
              </div>
              <DriversTable drivers={drivers || []} onEdit={handleEditDriver} />
            </div>
          </TabPanel>

          {/* Análisis */}
          <TabPanel>
            <div className="p-5 space-y-5">
              {/* Gráfico de costos por tipo */}
              <AiOverlay
                type="chart"
                chartType="bar"
                title="Costos por Tipo de Transporte"
                data={costChartData}
              >
                <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border">
                    <BarChart3 className="h-4 w-4 text-gray-400 dark:text-dark-tremor-content-subtle" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Costos por Tipo</h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={costChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tickFormatter={(v) => costTypeLabels[v] || v} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '10px', border: 'var(--tooltip-border, 1px solid #e5e7eb)', fontSize: '12px', backgroundColor: 'var(--tooltip-bg, #ffffff)', color: 'var(--tooltip-color, #374151)' }}
                          formatter={(value: any, name: string, props: any) => [
                            '$ ' + Number(value).toLocaleString('en-US'),
                            costTypeLabels[props.payload.name] || props.payload.name,
                          ]}
                        />
                        <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {costChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={costTypeColors[entry.name] || '#9ca3af'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </AiOverlay>

              {/* Gráfico de transporte vs ventas mensual */}
              <AiOverlay
                type="chart"
                chartType="trend"
                title="Transporte vs Ventas - Tendencia Mensual"
                data={monthlyData || []}
              >
                <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border">
                    <Navigation className="h-4 w-4 text-gray-400 dark:text-dark-tremor-content-subtle" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Transporte vs Ventas - Tendencia Mensual</h3>
                    <span className="ml-auto text-[10px] font-medium text-gray-400 dark:text-dark-tremor-content-subtle bg-gray-100 dark:bg-dark-tremor-background-muted px-2 py-0.5 rounded">
                      NOR_DIS_IND_16
                    </span>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} unit="%" />
                        <Tooltip
                          contentStyle={{ borderRadius: '10px', border: 'var(--tooltip-border, 1px solid #e5e7eb)', fontSize: '12px', backgroundColor: 'var(--tooltip-bg, #ffffff)', color: 'var(--tooltip-color, #374151)' }}
                          formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Transporte vs Ventas']}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line type="monotone" dataKey="percentage" name="% Transporte vs Ventas" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </AiOverlay>

              {/* Alertas */}
              <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Alertas de Transporte</h3>
                </div>
                <div className="px-5 pb-5 space-y-2">
                  {inMaintenance > 0 ? (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg">
                      <Wrench className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{inMaintenance} vehículo(s) en mantenimiento</p>
                        <p className="text-xs text-amber-500 dark:text-amber-400/80 mt-0.5">Verifica disponibilidad de flota antes de programar despachos.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Toda la flota operativa</p>
                        <p className="text-xs text-emerald-500 dark:text-emerald-400/80 mt-0.5">No hay alertas de vehículos en este momento.</p>
                      </div>
                    </div>
                  )}
                  {drivers?.some((d: any) => d.licenseExpiry && new Date(d.licenseExpiry) < new Date()) && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">Licencias vencidas detectadas</p>
                        <p className="text-xs text-red-500 dark:text-red-400/80 mt-0.5">Hay conductores con licencia vencida. Revisa la pestaña Conductores.</p>
                      </div>
                    </div>
                  )}
                  {(transportVsSales.data?.averagePercentage ?? 0) > 15 && (
                    <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/30 rounded-lg">
                      <Gauge className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Costo de transporte alto: {(transportVsSales.data?.averagePercentage ?? 0).toFixed(1)}%</p>
                        <p className="text-xs text-orange-500 dark:text-orange-400/80 mt-0.5">El costo de transporte supera el 15% de las ventas. Revisa rutas y eficiencia.</p>
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
    orange: { bg: 'bg-orange-50/50', border: 'border-orange-200/50', text: 'text-orange-700', darkBg: 'dark:bg-orange-900/20', darkBorder: 'dark:border-orange-700/30', darkText: 'dark:text-orange-400' },
    red: { bg: 'bg-red-50/50', border: 'border-red-200/50', text: 'text-red-700', darkBg: 'dark:bg-red-900/20', darkBorder: 'dark:border-red-700/30', darkText: 'dark:text-red-400' },
  };
  const c = colors[color] || colors.primary;

  return (
    <div className={`flex items-center gap-2.5 p-3 rounded-lg ${c.bg} ${c.darkBg} border ${c.border} ${c.darkBorder}`}>
      <span className={`${c.text} ${c.darkText}`}>{icon}</span>
      <div>
        <p className="text-[11px] text-gray-500 dark:text-dark-tremor-content-subtle">{label}</p>
        <p className={`text-base font-bold ${c.text} ${c.darkText}`}>
          {typeof count === 'number' && count > 1000 ? '$ ' + count.toLocaleString('en-US', { maximumFractionDigits: 0 }) : count}
        </p>
      </div>
    </div>
  );
}
