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
  Package,
  Truck,
  PlusCircle,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Clock,
  FileCheck,
  Users,
  AlertTriangle,
  ThumbsUp,
  XCircle,
  Navigation,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { KPICard } from '@/components/ui/kpi-card';
import { AiOverlay } from '@/components/ui/ai-interpretation';
import { DispatchesTable } from '@/components/customer-service/dispatches-table';
import { DispatchModal } from '@/components/customer-service/dispatch-modal';
import Swal from 'sweetalert2';
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

export default function CustomerServicePage() {
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<any>(null);
  const [selectedPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });

  const utils = trpc.useUtils();

  // KPIs con códigos CORRECTOS
  const perfectDeliveries = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_19',
    ...selectedPeriod,
  });
  const onTimeDeliveries = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_20',
    ...selectedPeriod,
  });
  const completeDeliveries = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_21',
    ...selectedPeriod,
  });
  const documentationAccuracy = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_22',
    ...selectedPeriod,
  });

  // Datos
  const { data: dispatches } = trpc.customerService.getDispatches.useQuery();
  const { data: monthlyData } = trpc.customerService.getDispatchMonthlyData.useQuery({
    year: new Date().getFullYear(),
  });

  const handleDispatchSuccess = () => {
    utils.customerService.getDispatches.invalidate();
    utils.customerService.getDispatchMonthlyData.invalidate();
    utils.kpi.getKpiData.invalidate();
  };

  const handleEditDispatch = (dispatch: any) => {
    setSelectedDispatch(dispatch);
    setIsDispatchModalOpen(true);
  };

  const handleCloseDispatchModal = () => {
    setIsDispatchModalOpen(false);
    setSelectedDispatch(null);
  };

  const handleUpdateStatus = (dispatch: any, status: string) => {
    const statusDetails: Record<string, any> = {
      delivered: { deliveredOnTime: true, deliveredComplete: true, documentationOk: true, perfectDelivery: true },
      in_transit: {},
      pending: {},
      cancelled: {},
    };
    
    updateDispatch.mutate({
      id: dispatch.id,
      status,
      ...statusDetails[status],
    });
  };

  const updateDispatch = trpc.customerService.updateDispatchStatus.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Estado actualizado', text: 'El despacho se actualizó exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.customerService.getDispatches.invalidate();
      utils.kpi.getKpiData.invalidate();
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo actualizar el estado.', confirmButtonColor: '#4F46E5' });
    },
  });

  // Métricas derivadas
  const totalDispatches = dispatches?.length ?? 0;
  const deliveredCount = dispatches?.filter((d: any) => d.dispatchStatus?.toLowerCase() === 'delivered').length ?? 0;
  const pendingCount = dispatches?.filter((d: any) => d.dispatchStatus?.toLowerCase() === 'pending').length ?? 0;
  const inTransitCount = dispatches?.filter((d: any) => d.dispatchStatus?.toLowerCase() === 'in_transit').length ?? 0;
  const cancelledCount = dispatches?.filter((d: any) => d.dispatchStatus?.toLowerCase() === 'cancelled').length ?? 0;

  // Datos para gráfico de composición de entregas
  const deliveryPieData = [
    { name: 'Entregados', value: deliveredCount, color: '#10b981' },
    { name: 'Pendientes', value: pendingCount, color: '#6b7280' },
    { name: 'En Camino', value: inTransitCount, color: '#3b82f6' },
    { name: 'Cancelados', value: cancelledCount, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  return (
    <main className="p-4 sm:p-5 bg-gray-50 min-h-screen">
      {/* Header estilo Dashboard */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Servicio al Cliente</h1>
            <p className="text-gray-500 mt-0.5 text-xs">Satisfacción del cliente, calidad en entregas y seguimiento de despachos.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedDispatch(null); setIsDispatchModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              Nuevo Despacho
            </button>
          </div>
        </div>
        <Divider className="mt-4" />
      </div>

      <DispatchModal
        isOpen={isDispatchModalOpen}
        onClose={handleCloseDispatchModal}
        onSuccess={handleDispatchSuccess}
        dispatch={selectedDispatch}
      />

      {/* KPI Cards estilo Dashboard con IA */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-3">
        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_19"
          kpiName="Entregas Perfectas"
          value={perfectDeliveries.data?.perfectDeliveriesPercentage ?? 0}
          target={90}
          direction="up"
          unit="%"
          status={(perfectDeliveries.data?.perfectDeliveriesPercentage ?? 0) > 90 ? 'good' : 'warning'}
        >
          <KPICard
            title="Entregas Perfectas"
            value={perfectDeliveries.data?.perfectDeliveriesPercentage ?? 0}
            unit="%"
            status={(perfectDeliveries.data?.perfectDeliveriesPercentage ?? 0) > 90 ? 'good' : 'warning'}
            direction="up"
            subtitle="NOR_DIS_IND_19"
            loading={perfectDeliveries.isLoading}
          />
        </AiOverlay>

        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_20"
          kpiName="Entregas a Tiempo"
          value={onTimeDeliveries.data?.onTimePercentage ?? 0}
          target={95}
          direction="up"
          unit="%"
          status={(onTimeDeliveries.data?.onTimePercentage ?? 0) > 95 ? 'good' : 'warning'}
        >
          <KPICard
            title="Entregas a Tiempo"
            value={onTimeDeliveries.data?.onTimePercentage ?? 0}
            unit="%"
            status={(onTimeDeliveries.data?.onTimePercentage ?? 0) > 95 ? 'good' : 'warning'}
            direction="up"
            subtitle="NOR_DIS_IND_20"
            loading={onTimeDeliveries.isLoading}
          />
        </AiOverlay>

        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_21"
          kpiName="Pedidos Completos"
          value={completeDeliveries.data?.completePercentage ?? 0}
          target={95}
          direction="up"
          unit="%"
          status={(completeDeliveries.data?.completePercentage ?? 0) > 95 ? 'good' : 'warning'}
        >
          <KPICard
            title="Pedidos Completos"
            value={completeDeliveries.data?.completePercentage ?? 0}
            unit="%"
            status={(completeDeliveries.data?.completePercentage ?? 0) > 95 ? 'good' : 'warning'}
            direction="up"
            subtitle="NOR_DIS_IND_21"
            loading={completeDeliveries.isLoading}
          />
        </AiOverlay>

        <AiOverlay
          type="kpi"
          kpiCode="NOR_DIS_IND_22"
          kpiName="Documentación sin Problemas"
          value={documentationAccuracy.data?.accuracyPercentage ?? 0}
          target={98}
          direction="up"
          unit="%"
          status={(documentationAccuracy.data?.accuracyPercentage ?? 0) > 98 ? 'good' : 'warning'}
        >
          <KPICard
            title="Documentación OK"
            value={documentationAccuracy.data?.accuracyPercentage ?? 0}
            unit="%"
            status={(documentationAccuracy.data?.accuracyPercentage ?? 0) > 98 ? 'good' : 'warning'}
            direction="up"
            subtitle="NOR_DIS_IND_22"
            loading={documentationAccuracy.isLoading}
          />
        </AiOverlay>
      </Grid>

      {/* Tabs estilo Dashboard */}
      <TabGroup className="mt-6">
        <TabList className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-t-xl border border-indigo-100/50 border-b-0 shadow-sm p-1.5 gap-1.5">
          <Tab
            icon={Truck}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-indigo-600 hover:bg-white/60 rounded-lg transition-all duration-300 data-[selected]:bg-white data-[selected]:text-indigo-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-indigo-100 data-[selected]:border-b-[3px] data-[selected]:border-indigo-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Despachos
          </Tab>
          <Tab
            icon={CheckCircle2}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-emerald-600 hover:bg-white/60 rounded-lg transition-all duration-300 data-[selected]:bg-white data-[selected]:text-emerald-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-emerald-100 data-[selected]:border-b-[3px] data-[selected]:border-emerald-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Entregas
          </Tab>
          <Tab
            icon={BarChart3}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-purple-600 hover:bg-white/60 rounded-lg transition-all duration-300 data-[selected]:bg-white data-[selected]:text-purple-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-purple-100 data-[selected]:border-b-[3px] data-[selected]:border-purple-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Análisis
          </Tab>
        </TabList>
        <TabPanels className="bg-white border border-gray-200 rounded-b-xl shadow-sm">
          {/* Despachos */}
          <TabPanel>
            <div className="p-5 space-y-5">
              <div className="rounded-xl border border-gray-200 shadow-sm p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-gray-900">Resumen de Despachos</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatusCard label="Total Despachos" count={totalDispatches} color="blue" icon={<Package className="h-4 w-4" />} />
                  <StatusCard label="Entregados" count={deliveredCount} color="emerald" icon={<CheckCircle2 className="h-4 w-4" />} />
                  <StatusCard label="En Camino" count={inTransitCount} color="blue" icon={<Navigation className="h-4 w-4" />} />
                  <StatusCard label="Pendientes" count={pendingCount} color="amber" icon={<Clock className="h-4 w-4" />} />
                </div>
              </div>

              <DispatchesTable
                dispatches={dispatches || []}
                onEdit={handleEditDispatch}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          </TabPanel>

          {/* Entregas */}
          <TabPanel>
            <div className="p-5 space-y-5">
              {/* Composición de entregas */}
              <AiOverlay
                type="chart"
                chartType="donut"
                title="Composición de Despachos"
                data={deliveryPieData}
              >
                <Card className="border border-gray-200 shadow-sm rounded-xl">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-bold text-gray-900">Composición de Despachos</h3>
                  </div>
                  <div className="h-72 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deliveryPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {deliveryPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                          formatter={(value: any, name: string) => [value, name]}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </AiOverlay>

              {/* Detalle de calidad de entregas */}
              <Card className="border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 px-5 pt-5">
                  <FileCheck className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-900">Detalle de Calidad de Entregas</h3>
                </div>
                <div className="px-5 pb-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <QualityCard
                      icon={<Clock className="h-5 w-5" />}
                      label="A Tiempo"
                      value={onTimeDeliveries.data?.onTimeOrders ?? 0}
                      total={onTimeDeliveries.data?.totalOrders ?? 0}
                      percentage={onTimeDeliveries.data?.onTimePercentage ?? 0}
                      color="emerald"
                    />
                    <QualityCard
                      icon={<Package className="h-5 w-5" />}
                      label="Completos"
                      value={completeDeliveries.data?.completeOrders ?? 0}
                      total={completeDeliveries.data?.totalOrders ?? 0}
                      percentage={completeDeliveries.data?.completePercentage ?? 0}
                      color="blue"
                    />
                    <QualityCard
                      icon={<FileCheck className="h-5 w-5" />}
                      label="Documentación OK"
                      value={documentationAccuracy.data?.docsOkOrders ?? 0}
                      total={documentationAccuracy.data?.totalOrders ?? 0}
                      percentage={documentationAccuracy.data?.accuracyPercentage ?? 0}
                      color="purple"
                    />
                  </div>
                </div>
              </Card>

              {/* Alertas de entregas */}
              <Card className="border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 px-5 pt-5">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h3 className="text-sm font-bold text-gray-900">Alertas de Entregas</h3>
                </div>
                <div className="px-5 pb-5 space-y-2">
                  {pendingCount > 0 && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-amber-700">{pendingCount} despacho(s) pendiente(s)</p>
                        <p className="text-xs text-amber-500 mt-0.5">Revisa los despachos pendientes para asegurar entregas a tiempo.</p>
                      </div>
                    </div>
                  )}
                  {(perfectDeliveries.data?.perfectDeliveriesPercentage ?? 0) < 80 && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-700">Tasa de entregas perfectas baja: {(perfectDeliveries.data?.perfectDeliveriesPercentage ?? 0).toFixed(1)}%</p>
                        <p className="text-xs text-red-500 mt-0.5">Revisa puntualidad, completitud y documentación.</p>
                      </div>
                    </div>
                  )}
                  {(perfectDeliveries.data?.perfectDeliveriesPercentage ?? 0) >= 90 && (
                    <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <ThumbsUp className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-700">Excelente calidad de entregas</p>
                        <p className="text-xs text-emerald-500 mt-0.5">{(perfectDeliveries.data?.perfectDeliveriesPercentage ?? 0).toFixed(1)}% de entregas perfectas. ¡Sigue así!</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabPanel>

          {/* Análisis */}
          <TabPanel>
            <div className="p-5 space-y-5">
              {/* Gráfico mensual de despachos */}
              <AiOverlay
                type="chart"
                chartType="bar"
                title="Despachos Mensuales"
                data={monthlyData || []}
              >
                <Card className="border border-gray-200 shadow-sm rounded-xl">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-bold text-gray-900">Despachos Mensuales</h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="delivered" name="Entregados" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="inTransit" name="En Camino" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="pending" name="Pendientes" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="cancelled" name="Cancelados" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </AiOverlay>
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
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
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

function QualityCard({ icon, label, value, total, percentage, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
  percentage: number;
  color: string;
}) {
  const colors: Record<string, { bg: string; border: string; text: string; bar: string }> = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', bar: 'bg-blue-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', bar: 'bg-purple-500' },
  };
  const c = colors[color] || colors.emerald;

  return (
    <div className={`p-4 rounded-xl border ${c.border} ${c.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={c.text}>{icon}</span>
        <span className={`text-sm font-semibold ${c.text}`}>{label}</span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold text-gray-900">{percentage.toFixed(1)}%</span>
        <span className="text-xs text-gray-500">{value} / {total}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${Math.min(100, percentage)}%` }} />
      </div>
    </div>
  );
}
