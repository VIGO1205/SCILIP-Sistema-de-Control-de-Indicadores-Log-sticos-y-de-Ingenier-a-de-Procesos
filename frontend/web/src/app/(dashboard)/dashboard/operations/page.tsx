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
  Button,
  Flex,
  Badge,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '@tremor/react';
import { 
  PlusCircle, 
  Package, 
  History, 
  BarChart3,
  Search,
  ClipboardCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ArrowRightLeft
} from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { KPICard } from '@/components/ui/kpi-card';
import { MovementModal } from '@/components/inventory/movement-modal';
import { AuditModal } from '@/components/inventory/audit-modal';

export default function OperationsPage() {
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });

  // Consultas a tRPC
  const utils = trpc.useUtils();
  const inventoryAccuracy = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_11',
    ...selectedPeriod,
  });

  const merchandiseRotation = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_08',
    ...selectedPeriod,
  });

  const inventoryDuration = trpc.kpi.getKpiData.useQuery({
    code: 'NOR_DIS_IND_09',
    ...selectedPeriod,
  });

  const { data: products, isLoading: loadingProducts } = trpc.inventory.getProducts.useQuery();
  const { data: movements, isLoading: loadingMovements } = trpc.inventory.getMovements.useQuery();
  const { data: audits, isLoading: loadingAudits } = trpc.inventory.getPhysicalInventories.useQuery();

  const handleMovementSuccess = () => {
    utils.inventory.getMovements.invalidate();
    utils.inventory.getProducts.invalidate();
    utils.kpi.getKpiData.invalidate({ code: 'NOR_DIS_IND_11' });
  };

  const handleAuditSuccess = () => {
    utils.inventory.getPhysicalInventories.invalidate();
    utils.kpi.getKpiData.invalidate({ code: 'NOR_DIS_IND_11' });
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN': return <ArrowDownLeft className="h-4 w-4 text-emerald-500" />;
      case 'OUT': return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'ADJUSTMENT': return <RefreshCw className="h-4 w-4 text-amber-500" />;
      case 'TRANSFER': return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
      default: return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'IN': return <Badge color="emerald">Entrada</Badge>;
      case 'OUT': return <Badge color="red">Salida</Badge>;
      case 'ADJUSTMENT': return <Badge color="amber">Ajuste</Badge>;
      case 'TRANSFER': return <Badge color="blue">Traslado</Badge>;
      default: return <Badge color="gray">{type}</Badge>;
    }
  };

  return (
    <main className="p-4 sm:p-6 lg:p-10">
      <Flex justifyContent="between" alignItems="center" flexDirection="col" className="sm:flex-row space-y-4 sm:space-y-0">
        <div className="text-center sm:text-left">
          <Title className="text-2xl font-bold">Gestión de Inventarios</Title>
          <Text className="text-gray-500">Control de existencias, movimientos y auditoría de stock.</Text>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button 
            icon={ClipboardCheck} 
            size="sm" 
            variant="secondary" 
            className="flex-1 sm:flex-none"
            onClick={() => setIsAuditModalOpen(true)}
          >
            Auditoría Física
          </Button>
          <Button 
            icon={PlusCircle} 
            size="sm" 
            className="flex-1 sm:flex-none"
            onClick={() => setIsMovementModalOpen(true)}
          >
            Nuevo Movimiento
          </Button>
        </div>
      </Flex>

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

      {/* KPIs Responsivos */}
      <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6 mt-8">
        <KPICard
          title="Exactitud del Inventario"
          value={inventoryAccuracy.data?.accuracyPercentage ?? 0}
          unit="%"
          status={(inventoryAccuracy.data?.accuracyPercentage ?? 0) > 95 ? 'good' : 'warning'}
          direction="up"
          subtitle="NOR_DIS_IND_11"
          loading={inventoryAccuracy.isLoading}
        />
        <KPICard
          title="Rotación de Mercancía"
          value={merchandiseRotation.data?.rotationRate ?? 0}
          unit="veces"
          status={(merchandiseRotation.data?.rotationRate ?? 0) > 5 ? 'good' : 'warning'}
          direction="up"
          subtitle="NOR_DIS_IND_08"
          loading={merchandiseRotation.isLoading}
        />
        <KPICard
          title="Duración del Inventario"
          value={inventoryDuration.data?.durationDays ?? 0}
          unit="días"
          status={(inventoryDuration.data?.durationDays ?? 0) < 30 ? 'good' : 'warning'}
          direction="down"
          subtitle="NOR_DIS_IND_09"
          loading={inventoryDuration.isLoading}
        />
      </Grid>

      <TabGroup className="mt-10">
        <TabList className="overflow-x-auto">
          <Tab icon={Package}>Productos</Tab>
          <Tab icon={History}>Movimientos</Tab>
          <Tab icon={Search}>Auditorías</Tab>
        </TabList>
        <TabPanels>
          {/* Pestaña de Productos */}
          <TabPanel>
            <Card className="mt-6 p-0 sm:p-6 overflow-hidden">
              <div className="p-4 sm:p-0">
                <Title>Catálogo de Existencias</Title>
                <Text className="mb-4">Listado de productos con stock actual por bodega.</Text>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Producto</TableHeaderCell>
                      <TableHeaderCell>SKU</TableHeaderCell>
                      <TableHeaderCell>Stock Mínimo</TableHeaderCell>
                      <TableHeaderCell>Categoría</TableHeaderCell>
                      <TableHeaderCell>Estado</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingProducts ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-400 italic">
                          Cargando productos...
                        </TableCell>
                      </TableRow>
                    ) : products?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-400 italic">
                          No hay productos registrados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products?.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>{product.minStock ?? 0} {product.unitOfMeasure ?? ''}</TableCell>
                          <TableCell>{product.category || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge color="emerald">Activo</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabPanel>
          
          {/* Pestaña de Movimientos */}
          <TabPanel>
            <Card className="mt-6 p-0 sm:p-6 overflow-hidden">
              <div className="p-4 sm:p-0">
                <Title>Historial de Entradas y Salidas</Title>
                <Text className="mb-4">Registro cronológico de movimientos de stock.</Text>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Fecha</TableHeaderCell>
                      <TableHeaderCell>Tipo</TableHeaderCell>
                      <TableHeaderCell>Producto</TableHeaderCell>
                      <TableHeaderCell>Cantidad</TableHeaderCell>
                      <TableHeaderCell>Referencia</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingMovements ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-400 italic">
                          Cargando movimientos...
                        </TableCell>
                      </TableRow>
                    ) : movements?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-400 italic">
                          No hay movimientos registrados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      movements?.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {new Date(movement.movementDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Flex justifyContent="start" className="space-x-2">
                              {getMovementIcon(movement.movementType)}
                              {getMovementBadge(movement.movementType)}
                            </Flex>
                          </TableCell>
                          <TableCell className="font-medium">
                            {movement.product?.name}
                          </TableCell>
                          <TableCell>
                            {movement.movementType === 'OUT' ? '-' : '+'}{movement.quantity}
                          </TableCell>
                          <TableCell>{movement.referenceType || movement.referenceId || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabPanel>

          {/* Pestaña de Auditorías */}
          <TabPanel>
            <Card className="mt-6 p-0 sm:p-6 overflow-hidden">
              <div className="p-4 sm:p-0">
                <Title>Resultados de Inventarios Físicos</Title>
                <Text className="mb-4">Comparativa entre stock de sistema y conteo físico.</Text>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Fecha</TableHeaderCell>
                      <TableHeaderCell>Producto</TableHeaderCell>
                      <TableHeaderCell>Sistema</TableHeaderCell>
                      <TableHeaderCell>Físico</TableHeaderCell>
                      <TableHeaderCell>Diferencia</TableHeaderCell>
                      <TableHeaderCell>Estado</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingAudits ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-gray-400 italic">
                          Cargando auditorías...
                        </TableCell>
                      </TableRow>
                    ) : audits?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-gray-400 italic">
                          No hay auditorías registradas.
                        </TableCell>
                      </TableRow>
                    ) : (
                      audits?.map((audit) => {
                        const diff = audit.difference;
                        return (
                          <TableRow key={audit.id}>
                            <TableCell>
                              {new Date(audit.inventoryDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium">
                              {audit.product?.name}
                            </TableCell>
                            <TableCell>{audit.theoreticalQuantity}</TableCell>
                            <TableCell>{audit.physicalQuantity}</TableCell>
                            <TableCell>
                              <span className={diff === 0 ? 'text-gray-500' : diff > 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {diff > 0 ? '+' : ''}{diff}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge color={diff === 0 ? 'emerald' : 'amber'}>
                                {diff === 0 ? 'Exacto' : 'Discrepancia'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
