"use client";

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
  Button,
  Flex,
  Badge,
  DonutChart,
} from '@tremor/react';
import { 
  Warehouse, 
  Layout, 
  DollarSign, 
  PlusCircle,
  Users,
  Box,
  MapPin,
  Maximize2
} from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { KPICard } from '@/components/ui/kpi-card';
import { OperationalCostModal } from '@/components/warehousing/operational-cost-modal';

export default function WarehousingPage() {
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [selectedPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });

  const utils = trpc.useUtils();

  // Consultas a tRPC
  const { data: warehouses, isLoading: loadingWarehouses } = trpc.warehousing.getWarehouses.useQuery();
  const { data: costs, isLoading: loadingCosts } = trpc.warehousing.getOperationalCosts.useQuery();
  
  // Usamos la primera bodega para los KPIs de ejemplo si no hay una seleccionada
  const activeWarehouseId = warehouses?.[0]?.id;

  const costPerM2 = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_13',
    ...selectedPeriod,
    warehouseId: activeWarehouseId,
  }, { enabled: !!activeWarehouseId });

  const storedUnitCost = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_12',
    ...selectedPeriod,
    warehouseId: activeWarehouseId,
  }, { enabled: !!activeWarehouseId });

  const unitsPerEmployee = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_14',
    ...selectedPeriod,
  });

  const handleCostSuccess = () => {
    utils.kpi.getKpiData.invalidate();
    utils.warehousing.getOperationalCosts.invalidate();
  };

  return (
    <main className="p-4 sm:p-6 lg:p-10">
      <Flex justifyContent="between" alignItems="center" flexDirection="col" className="sm:flex-row space-y-4 sm:space-y-0">
        <div className="text-center sm:text-left">
          <Title className="text-2xl font-bold">Almacenamiento y Bodegaje</Title>
          <Text className="text-gray-500">Gestión de espacios, costos operativos y eficiencia de almacenamiento.</Text>
        </div>
        <Button 
          icon={PlusCircle} 
          size="sm" 
          className="w-full sm:w-auto"
          onClick={() => setIsCostModalOpen(true)}
        >
          Registrar Costo Operativo
        </Button>
      </Flex>

      <OperationalCostModal
        isOpen={isCostModalOpen}
        onClose={() => setIsCostModalOpen(false)}
        onSuccess={handleCostSuccess}
      />

      {/* KPIs Responsivos */}
      <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6 mt-8">
        <KPICard
          title="Costo por Metro Cuadrado"
          value={costPerM2.data?.costPerM2 ?? 0}
          unit="COP/m2"
          status="neutral"
          subtitle="NOR_DIS_IND_13"
          loading={costPerM2.isLoading}
        />
        <KPICard
          title="Costo Unidad Almacenada"
          value={storedUnitCost.data?.costPerUnit ?? 0}
          unit="COP/und"
          status="neutral"
          subtitle="NOR_DIS_IND_12"
          loading={storedUnitCost.isLoading}
        />
        <KPICard
          title="Unidades por Empleado"
          value={unitsPerEmployee.data?.unitsPerEmployee ?? 0}
          unit="und/emp"
          status="good"
          subtitle="NOR_DIS_IND_14"
          loading={unitsPerEmployee.isLoading}
        />
      </Grid>

      <TabGroup className="mt-10">
        <TabList className="overflow-x-auto">
          <Tab icon={Warehouse}>Bodegas</Tab>
          <Tab icon={DollarSign}>Costos Operativos</Tab>
          <Tab icon={Box}>Capacidad</Tab>
          <Tab icon={Users}>Personal</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Grid numItemsMd={1} numItemsLg={2} className="gap-6 mt-6">
              <Card>
                <Title>Distribución de Espacios</Title>
                <DonutChart
                  className="h-72 mt-4"
                  data={[
                    { name: 'Ocupado', value: 78 },
                    { name: 'Disponible', value: 22 },
                  ]}
                  category="value"
                  index="name"
                  colors={["blue", "gray"]}
                />
              </Card>
              <Card>
                <Title>Centros de Distribución</Title>
                <div className="mt-4 space-y-4">
                  {loadingWarehouses ? (
                    <Text className="text-center py-10 text-gray-400 italic">Cargando bodegas...</Text>
                  ) : warehouses?.length === 0 ? (
                    <Text className="text-center py-10 text-gray-400 italic">No hay bodegas registradas.</Text>
                  ) : (
                    warehouses?.map((warehouse) => (
                      <div key={warehouse.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <Flex justifyContent="between">
                          <Text className="font-bold text-gray-900">{warehouse.name}</Text>
                          <Badge color="emerald">Activo</Badge>
                        </Flex>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Flex justifyContent="start" className="space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <Text className="text-xs text-gray-500">{warehouse.city || 'N/A'}</Text>
                          </Flex>
                          <Flex justifyContent="start" className="space-x-2">
                            <Maximize2 className="h-4 w-4 text-gray-400" />
                            <Text className="text-xs text-gray-500">{warehouse.totalAreaM2} m2</Text>
                          </Flex>
                        </div>
                        <Text className="text-xs text-gray-400 mt-2 italic">{warehouse.address}</Text>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </Grid>
          </TabPanel>

          {/* Nueva Pestaña de Costos Operativos */}
          <TabPanel>
            <Card className="mt-6 p-0 sm:p-6 overflow-hidden">
              <div className="p-4 sm:p-0">
                <Title>Historial de Costos Operativos</Title>
                <Text className="mb-4">Gastos registrados asociados al mantenimiento y operación de bodegas.</Text>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-gray-50 text-gray-500 uppercase text-xs font-medium">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Bodega</th>
                      <th className="px-4 py-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loadingCosts ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-gray-400 italic">
                          Cargando costos...
                        </td>
                      </tr>
                    ) : costs?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-gray-400 italic">
                          No hay costos registrados.
                        </td>
                      </tr>
                    ) : (
                      costs?.map((cost) => (
                        <tr key={cost.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {new Date(cost.costDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge color="blue" variant="light">{cost.costType}</Badge>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {cost.warehouse?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">
                            ${Number(cost.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabPanel>
          
          <TabPanel>
            <Card className="mt-6 h-72 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
               <Text className="text-gray-400 text-center px-4">Mapa de calor de ocupación por estantería en desarrollo.</Text>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card className="mt-6">
              <Title>Productividad del Personal (NOR_DIS_IND_14)</Title>
              <div className="h-40 mt-4 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                 <Text className="text-gray-400 text-center px-4">Unidades despachadas por empleado: 125 und/día</Text>
              </div>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
