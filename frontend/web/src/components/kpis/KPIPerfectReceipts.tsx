'use client';

import React, { useState } from 'react';
import { Card, Title, Text, Metric, Flex, Grid, AreaChart, Badge } from '@tremor/react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useKPI } from '@/hooks/use-kpi';

export const KPIPerfectReceipts: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const startDate = new Date(selectedYear, 0, 1);
  const endDate = new Date(selectedYear, 11, 31);

  const { data, timeSeries, isLoading, error } = useKPI({
    code: 'NOR_DIS_IND_03',
    startDate,
    endDate,
  });

  const kpiData = data || {
    totalOrdersReceived: 0,
    rejectedOrders: 0,
    rejectedPercentage: 0,
  };

  const chartData = timeSeries?.map(d => ({
    month: new Date(d.period).toLocaleDateString('es-ES', { month: 'short' }),
    'Tasa de Rechazo (%)': Number(d.value ?? 0),
  })) || []; 

  const getRejectionColor = (percentage: number): string => { 
    if (percentage <= 5) return 'text-emerald-600'; 
    if (percentage <= 10) return 'text-yellow-600'; 
    return 'text-red-600'; 
  }; 

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <Card className="bg-red-50 border-red-200">
          <Flex alignItems="center" className="space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <Text className="text-red-700">Error al cargar datos del KPI: {error.message}</Text>
          </Flex>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center"> 
        <div> 
          <Title>Entregas Perfectamente Recibidas</Title> 
          <Text>KPI - Control de calidad en recepciones</Text> 
        </div> 
        
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
          className="rounded-md border border-gray-300 px-3 py-2 text-black" 
        > 
          <option value={2023}>2023</option> 
          <option value={2024}>2024</option> 
          <option value={2025}>2025</option> 
        </select> 
      </div> 

      <Grid numItemsMd={3} numItemsLg={3} className="gap-6"> 
        <Card> 
          <Flex alignItems="baseline"> 
            <div> 
              <Text>Órdenes Recibidas</Text> 
              <Metric>{kpiData.totalOrdersReceived}</Metric> 
            </div> 
          </Flex> 
        </Card> 

        <Card> 
          <Flex alignItems="baseline"> 
            <div> 
              <Text>Órdenes Rechazadas</Text> 
              <Metric>{kpiData.rejectedOrders}</Metric> 
            </div> 
          </Flex> 
        </Card> 

        <Card> 
          <Flex alignItems="baseline"> 
            <div> 
              <Text>Tasa de Rechazo</Text> 
              <Metric className={getRejectionColor(kpiData.rejectedPercentage)}>{kpiData.rejectedPercentage}%</Metric> 
            </div> 
          </Flex> 
        </Card> 
      </Grid> 

      <Card> 
        <Title>Tendencia Mensual</Title> 
        <AreaChart 
          className="h-80 mt-4" 
          data={chartData} 
          index="month" 
          categories={['Tasa de Rechazo (%)']} 
          colors={['blue']} 
          valueFormatter={(number) => `${number}%`} 
        /> 
      </Card> 

      <div className="flex gap-4"> 
        {kpiData.rejectedPercentage <= 5 && (
          <Badge className="text-green-700 bg-green-50">
            Estado: Óptimo ✓
          </Badge>
        )}
        {kpiData.rejectedPercentage > 5 && kpiData.rejectedPercentage <= 10 && (
          <Badge className="text-yellow-700 bg-yellow-50">
            Estado: Precaución
          </Badge>
        )}
        {kpiData.rejectedPercentage > 10 && (
          <Badge className="text-red-700 bg-red-50">
            Estado: Crítico
          </Badge>
        )}
      </div>
    </div> 
  ); 
} 
