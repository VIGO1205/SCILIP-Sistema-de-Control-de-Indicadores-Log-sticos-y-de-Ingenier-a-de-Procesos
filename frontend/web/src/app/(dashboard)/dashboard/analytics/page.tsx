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
  Flex,
  AreaChart,
  BarChart,
  Select,
  SelectItem,
  DateRangePicker,
  DateRangePickerValue,
} from '@tremor/react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Filter,
  Calendar
} from 'lucide-react';
import { es } from 'date-fns/locale';

export default function AnalyticsPage() {
  const [value, setValue] = useState<DateRangePickerValue>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });

  const chartData = [
    { date: "Ene 24", Compras: 2890, Inventario: 2338, Transporte: 2181 },
    { date: "Feb 24", Compras: 2756, Inventario: 2103, Transporte: 2109 },
    { date: "Mar 24", Compras: 3322, Inventario: 2194, Transporte: 2451 },
    { date: "Abr 24", Compras: 3470, Inventario: 2108, Transporte: 2402 },
    { date: "May 24", Compras: 3475, Inventario: 1812, Transporte: 3121 },
  ];

  return (
    <main className="p-4 sm:p-6 lg:p-10">
      <Flex justifyContent="between" alignItems="center" flexDirection="col" className="sm:flex-row space-y-4 sm:space-y-0 mb-8">
        <div className="text-center sm:text-left">
          <Title className="text-2xl font-bold">Análisis Avanzado</Title>
          <Text className="text-gray-500">Exploración profunda de datos y tendencias logísticas.</Text>
        </div>
        <div className="w-full sm:w-auto">
          <DateRangePicker 
            className="max-w-md mx-auto" 
            value={value} 
            onValueChange={setValue}
            locale={es}
            placeholder="Seleccionar periodo"
          />
        </div>
      </Flex>

      <Grid numItemsSm={1} numItemsLg={3} className="gap-6 mt-6">
        <Card className="lg:col-span-2">
          <Title>Comparativa de Rendimiento por Módulo</Title>
          <Text>Evolución de la eficiencia operativa en los últimos meses.</Text>
          <AreaChart
            className="h-80 mt-4"
            data={chartData}
            index="date"
            categories={["Compras", "Inventario", "Transporte"]}
            colors={["indigo", "cyan", "amber"]}
            valueFormatter={(number) => `$${(number / 1000).toFixed(1)}k`}
          />
        </Card>

        <Card>
          <Title>Distribución de Costos</Title>
          <Text>Impacto porcentual por categoría.</Text>
          <BarChart
            className="h-80 mt-4"
            data={[
              { name: "Fletes", value: 45 },
              { name: "Almacenaje", value: 30 },
              { name: "Personal", value: 15 },
              { name: "Otros", value: 10 },
            ]}
            index="name"
            categories={["value"]}
            colors={["blue"]}
            valueFormatter={(number) => `${number}%`}
            layout="vertical"
          />
        </Card>
      </Grid>

      <TabGroup className="mt-8">
        <TabList variant="line" className="overflow-x-auto">
          <Tab icon={TrendingUp}>Tendencias</Tab>
          <Tab icon={PieChart}>Proyecciones</Tab>
          <Tab icon={Filter}>Filtros Avanzados</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card className="mt-6 h-96 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
               <Flex flexDirection="col" alignItems="center">
                  <BarChart3 className="h-12 w-12 text-gray-300 mb-2" />
                  <Text className="text-gray-400">Motor de analítica predictiva en desarrollo.</Text>
               </Flex>
            </Card>
          </TabPanel>
          
          <TabPanel>
            <Card className="mt-6 h-96 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
               <Text className="text-gray-400">Proyecciones de demanda y stock de seguridad.</Text>
            </Card>
          </TabPanel>

          <TabPanel>
             <Card className="mt-6">
                <Title>Constructor de Consultas Personalizadas</Title>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                   <div>
                      <Text className="mb-2">Agrupar por</Text>
                      <Select defaultValue="region">
                         <SelectItem value="region">Región</SelectItem>
                         <SelectItem value="branch">Sucursal</SelectItem>
                         <SelectItem value="category">Categoría</SelectItem>
                      </Select>
                   </div>
                   <div>
                      <Text className="mb-2">Métrica</Text>
                      <Select defaultValue="cost">
                         <SelectItem value="cost">Costo Total</SelectItem>
                         <SelectItem value="volume">Volumen</SelectItem>
                         <SelectItem value="time">Tiempo de Ciclo</SelectItem>
                      </Select>
                   </div>
                </div>
             </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
