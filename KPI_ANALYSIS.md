# Análisis de KPIs - Sistema de BI Logístico

Este documento detalla los 28 Indicadores de Gestión Logística (KPIs) clasificados según la Taxonomía de Ingeniería (Capítulo 4).

## 1. Compras y Abastecimiento

| Código | Indicador | Clase | Fórmula |
|--------|-----------|-------|---------|
| NOR_DIS_IND_01 | Certificación de Proveedores | Rendimiento | (Proveedores Certificados / Total Proveedores) * 100 |
| NOR_DIS_IND_02 | Calidad de los Pedidos Generados | Rendimiento | (Pedidos sin problemas / Total Pedidos) * 100 |
| NOR_DIS_IND_03 | Entregas Perfectamente Recibidas | Rendimiento | (Pedidos Rechazados / Total Pedidos Recibidos) * 100 |
| NOR_DIS_IND_04 | Volumen de Compra | Productividad | (Valor Compras / Valor Ventas Totales) * 100 |

## 2. Inventarios y Producción

| Código | Indicador | Clase | Fórmula |
|--------|-----------|-------|---------|
| NOR_DIS_IND_05 | Capacidad de Producción Utilizada | Utilización | (Capacidad Utilizada / Capacidad Disponible) * 100 |
| NOR_DIS_IND_06 | Rendimiento de Máquinas | Rendimiento | (Producción Real / Capacidad Estándar) * 100 |
| NOR_DIS_IND_07 | Nivel de Cumplimiento de Despacho | Rendimiento | (Pedidos Despachados / Pedidos Solicitados) * 100 |
| NOR_DIS_IND_08 | Rotación de Mercancía | Productividad | (Ventas Acumuladas / Inventario Promedio) |
| NOR_DIS_IND_09 | Duración del Inventario | Productividad | (Inventario Final / Ventas Promedio) * 30 días |
| NOR_DIS_IND_10 | Vejez del Inventario | Rendimiento | (Unidades obsoletas / Total Unidades) * 100 |
| NOR_DIS_IND_11 | Exactitud del Inventario | Rendimiento | (Valor Diferencia / Valor Inventario Físico) * 100 |

## 3. Almacenamiento y Bodegaje

| Código | Indicador | Clase | Fórmula |
|--------|-----------|-------|---------|
| NOR_DIS_IND_12 | Costo de Almacenamiento por Unidad | Productividad | (Costo Bodegaje / Unidades Almacenadas) |
| NOR_DIS_IND_13 | Costo por Metro Cuadrado | Productividad | (Costo Total Bodega / Área Total Utilizable) |
| NOR_DIS_IND_14 | Unidades Despachadas por Empleado | Productividad | (Unidades Despachadas / Total Empleados Bodega) |
| NOR_DIS_IND_15 | Costo de Despacho por Empleado | Productividad | (Costo Operativo Bodega / Total Empleados Bodega) |
| NOR_DIS_IND_16 | Nivel de Cumplimiento en Despacho | Rendimiento | (Pedidos Despachados a Tiempo / Total Pedidos) * 100 |
| NOR_DIS_IND_17 | Costo por Unidad Despachada | Productividad | (Costo Operativo Bodega / Unidades Despachadas) |

## 4. Transporte y Distribución

| Código | Indicador | Clase | Fórmula |
|--------|-----------|-------|---------|
| NOR_DIS_IND_18 | Costo de Transporte vs Ventas | Productividad | (Costo Transporte / Ventas Totales) * 100 |
| NOR_DIS_IND_19 | Costo Operativo por Conductor | Productividad | (Costo Transporte / Número Conductores) |
| NOR_DIS_IND_20 | Comparativo de Transporte (Propio vs 3PL) | Rendimiento | (Costo Propio por Unidad / Costo 3PL por Unidad) |

## 5. Servicio al Cliente

| Código | Indicador | Clase | Fórmula |
|--------|-----------|-------|---------|
| NOR_DIS_IND_21 | Entregas Recibidas a Tiempo | Rendimiento | (Pedidos Entregados a Tiempo / Total Pedidos) * 100 |
| NOR_DIS_IND_22 | Entregas Completas | Rendimiento | (Pedidos Completos / Total Pedidos) * 100 |
| NOR_DIS_IND_23 | Calidad de la Documentación | Rendimiento | (Facturas sin Errores / Total Facturas Generadas) * 100 |
| NOR_DIS_IND_24 | Entregas Perfectas | Rendimiento | (Entregas a Tiempo * Entregas Completas * Doc. OK) |
| NOR_DIS_IND_25 | Costo Logístico vs Ventas | Productividad | (Costos Logísticos Totales / Ventas Totales) * 100 |
| NOR_DIS_IND_26 | Costo Logístico vs Utilidad Bruta | Productividad | (Costos Logísticos Totales / Utilidad Bruta) * 100 |
| NOR_DIS_IND_27 | Costo de CEDI vs Ventas | Productividad | (Costo Operativo CEDI / Ventas Totales) * 100 |

## 6. Importaciones y Exportaciones

| Código | Indicador | Clase | Fórmula |
|--------|-----------|-------|---------|
| NOR_DIS_IND_28 | Costo Unitario de Importación/Exportación | Productividad | (Costo Total Operación / Unidades Importadas/Exportadas) |
