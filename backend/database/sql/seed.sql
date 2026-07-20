-- ============================================= 
 -- SEED DE KPIs SEGÚN PDF 
 -- ============================================= 
 
 -- Insertar categorías 
 INSERT INTO kpi_categories (code, name, description, icon, color, display_order) VALUES 
 ('PURCHASING', 'Compras y Abastecimiento', 'KPIs relacionados con gestión de compras y proveedores', 'ShoppingCart', '#3b82f6', 1), 
 ('INVENTORY', 'Producción e Inventarios', 'KPIs de gestión de inventarios y producción', 'Package', '#10b981', 2), 
 ('WAREHOUSING', 'Almacenamiento y Bodegaje', 'KPIs de operaciones de almacén', 'Warehouse', '#f59e0b', 3), 
 ('TRANSPORT', 'Transporte y Distribución', 'KPIs de logística de transporte', 'Truck', '#8b5cf6', 4), 
 ('SERVICE', 'Servicio al Cliente', 'KPIs de calidad de servicio', 'Heart', '#ec4899', 5), 
 ('INTERNATIONAL', 'Importaciones/Exportaciones', 'KPIs de comercio exterior', 'Globe', '#06b6d4', 6), 
 ('ANALYTICS', 'Análisis Avanzado', 'KPIs de utilización, rendimiento y productividad', 'BarChart', '#6b7280', 7); 
 
 -- Insertar KPIs 
 INSERT INTO kpi_definitions (code, category_id, name, description, objective, formula, unit, unit_type, direction, target_value, periodicity, responsible_role, is_active) VALUES 
 -- Purchasing Module (KPIs 1-4) 
 ('KPI_001', (SELECT id FROM kpi_categories WHERE code = 'PURCHASING'), 
  'Certificación de proveedores', 
  'Número y porcentaje de proveedores certificados', 
  'Conocer y controlar la calidad de los proveedores', 
  '(Proveedores certificados / Total proveedores) * 100', 
  '%', 'percentage', 'up', 80.00, 'monthly', 'purchasing_manager', true), 
 
 ('KPI_002', (SELECT id FROM kpi_categories WHERE code = 'PURCHASING'), 
  'Calidad de los pedidos generados', 
  'Control de calidad de pedidos generados por compras', 
  'Controlar la calidad de los pedidos generados por el Área de Compras', 
  '(Pedidos sin errores / Total pedidos) * 100', 
  '%', 'percentage', 'up', 95.00, 'monthly', 'purchasing_manager', true), 
 
 ('KPI_003', (SELECT id FROM kpi_categories WHERE code = 'PURCHASING'), 
  'Volumen de compra', 
  'Porcentaje sobre ventas de pesos gastados en compras', 
  'Controlar el crecimiento en las compras', 
  '(Valor de compra / Total ventas) * 100', 
  '%', 'percentage', 'down', 40.00, 'monthly', 'purchasing_manager', true), 
 
 ('KPI_004', (SELECT id FROM kpi_categories WHERE code = 'PURCHASING'), 
  'Entregas perfectamente recibidas', 
  'Calidad de productos recibidos y puntualidad de entregas', 
  'Controlar calidad y puntualidad de entregas de proveedores', 
  '(Pedidos rechazados / Total órdenes de compra recibidas) * 100', 
  '%', 'percentage', 'down', 5.00, 'monthly', 'purchasing_manager', true), 
 
 -- Inventory Production Module (KPIs 5-11) 
 ('KPI_005', (SELECT id FROM kpi_categories WHERE code = 'INVENTORY'), 
  'Capacidad de producción utilizada', 
  'Porcentaje de capacidad productiva utilizada', 
  'Controlar la capacidad utilizada de instalaciones', 
  '(Capacidad utilizada / Capacidad máxima del recurso) * 100', 
  '%', 'percentage', 'up', 85.00, 'monthly', 'operations_manager', true), 
 
 ('KPI_006', (SELECT id FROM kpi_categories WHERE code = 'INVENTORY'), 
  'Rendimiento de máquina', 
  'Nivel de producción real vs capacidad de la máquina', 
  'Controlar cuellos de botella en producción', 
  '(Unidades producidas / Capacidad máxima de la máquina) * 100', 
  '%', 'percentage', 'up', 90.00, 'monthly', 'operations_manager', true), 
 
 ('KPI_007', (SELECT id FROM kpi_categories WHERE code = 'INVENTORY'), 
  'Rotación de mercancía', 
  'Número de veces que se recupera el capital invertido', 
  'Controlar salidas del centro de distribución', 
  'Ventas acumuladas / Inventario promedio', 
  'veces', 'number', 'up', 6.00, 'monthly', 'inventory_manager', true), 
 
 ('KPI_008', (SELECT id FROM kpi_categories WHERE code = 'INVENTORY'), 
  'Duración del Inventario', 
  'Días de inventario disponible', 
  'Controlar duración de productos en CD', 
  '(Inventario Final / Ventas promedio) * 30', 
  'días', 'days', 'down', 7.00, 'monthly', 'inventory_manager', true), 
 
 ('KPI_009', (SELECT id FROM kpi_categories WHERE code = 'INVENTORY'), 
  'Vejez del inventario', 
  'Nivel de mercancías no disponibles por obsolescencia', 
  'Controlar mercancía con mucho tiempo en inventario', 
  '((Unidades dañadas + obsoletas + vencidas) / Unidades disponibles) * 100', 
  '%', 'percentage', 'down', 5.00, 'monthly', 'inventory_manager', true), 
 
 ('KPI_010', (SELECT id FROM kpi_categories WHERE code = 'INVENTORY'), 
  'Valor económico del inventario', 
  'Porcentaje del costo del inventario dentro del costo de venta', 
  'Controlar valor de mercancía almacenada vs ventas', 
  '(Costo venta del mes / Valor inventario físico) * 100', 
  '%', 'percentage', 'down', 20.00, 'monthly', 'inventory_manager', true), 
 
 ('KPI_011', (SELECT id FROM kpi_categories WHERE code = 'INVENTORY'), 
  'Exactitud en inventarios', 
  'Confiabilidad de la mercancía almacenada', 
  'Controlar exactitud en inventarios', 
  '(Valor diferencia / Valor total inventario) * 100', 
  '%', 'percentage', 'down', 5.00, 'monthly', 'inventory_manager', true), 
 
 -- Warehousing Module (KPIs 12-17) 
 ('KPI_012', (SELECT id FROM kpi_categories WHERE code = 'WAREHOUSING'), 
  'Costo de unidad almacenada', 
  'Valor unitario del costo por almacenamiento', 
  'Controlar valor unitario del costo de almacenamiento', 
  'Costo del Almacenamiento / Número de Unidades almacenadas', 
  'moneda/unidad', 'currency', 'down', 100.00, 'monthly', 'cedi_manager', true), 
 
 ('KPI_013', (SELECT id FROM kpi_categories WHERE code = 'WAREHOUSING'), 
  'Costos de unidad despachada', 
  'Costos unitarios de la bodega respecto a despachos', 
  'Controlar costos unitarios por manejo', 
  'Costo Operación bodega / Total unidades despachadas', 
  'moneda/unidad', 'currency', 'down', 500.00, 'monthly', 'cedi_manager', true), 
 
 ('KPI_014', (SELECT id FROM kpi_categories WHERE code = 'WAREHOUSING'), 
  'Unidades despachadas por empleados', 
  'Carga laboral dentro del centro de distribución', 
  'Controlar contribución de unidades despachadas por persona', 
  'Total unidades despachadas / Total trabajadores en operación', 
  'unidades/empleado', 'number', 'up', 2000.00, 'monthly', 'cedi_manager', true), 
 
 ('KPI_015', (SELECT id FROM kpi_categories WHERE code = 'WAREHOUSING'), 
  'Costo metro cuadrado', 
  'Costo del área de almacenamiento', 
  'Cuantificar costo de área de almacenamiento', 
  'Costo total operativo bodega / Total área de almacenamiento', 
  'moneda/m²', 'currency', 'down', 6000.00, 'monthly', 'cedi_manager', true), 
 
 ('KPI_016', (SELECT id FROM kpi_categories WHERE code = 'WAREHOUSING'), 
  'Costo de despachos por empleado', 
  'Costos de despacho por empleado', 
  'Conocer contribución de cada empleado', 
  'Costo total operativo bodega / Número de empleados de bodega', 
  'moneda/empleado', 'currency', 'down', 600000.00, 'monthly', 'cedi_manager', true), 
 
 ('KPI_017', (SELECT id FROM kpi_categories WHERE code = 'WAREHOUSING'), 
  'Nivel de cumplimiento en despachos', 
  'Eficacia de los despachos', 
  'Controlar eficacia de despachos', 
  '(Número de despachos cumplidos a tiempo / Nro total despachos requeridos) * 100', 
  '%', 'percentage', 'up', 95.00, 'monthly', 'cedi_manager', true), 
 
 -- Transport Module (KPIs 18-20) 
 ('KPI_018', (SELECT id FROM kpi_categories WHERE code = 'TRANSPORT'), 
  'Costo de transporte vs Venta', 
  'Costo del transporte respecto a ventas', 
  'Controlar costo de transporte', 
  '(Costo del transporte / Valor ventas totales) * 100', 
  '%', 'percentage', 'down', 5.00, 'monthly', 'transport_manager', true), 
 
 ('KPI_019', (SELECT id FROM kpi_categories WHERE code = 'TRANSPORT'), 
  'Costo operativo por conductor', 
  'Costo por conductor en operación de transporte', 
  'Controlar contribución de cada conductor', 
  'Costo total transporte / Número de conductores', 
  'moneda/conductor', 'currency', 'down', 600000.00, 'monthly', 'transport_manager', true), 
 
 ('KPI_020', (SELECT id FROM kpi_categories WHERE code = 'TRANSPORT'), 
  'Comparativo costo de transporte', 
  'Gastos propios vs mercado de terceros', 
  'Controlar gastos de unidades transportadas', 
  '(Costo transporte propio x unidad / Costo tercerizar transporte x unidad) * 100', 
  '%', 'percentage', 'down', 95.00, 'monthly', 'transport_manager', true), 
 
 -- Customer Service Module (KPIs 21-27) 
 ('KPI_021', (SELECT id FROM kpi_categories WHERE code = 'SERVICE'), 
  'Entregas Perfectas', 
  'Pedidos entregados sin problemas', 
  'Controlar cantidad de pedidos entregados perfectamente', 
  '(Pedidos entregados perfectos / Total de pedidos entregados) * 100', 
  '%', 'percentage', 'up', 95.00, 'monthly', 'cedi_manager', true), 
 
 ('KPI_022', (SELECT id FROM kpi_categories WHERE code = 'SERVICE'), 
  'Entregas a tiempo', 
  'Pedidos entregados en fecha pactada', 
  'Controlar nivel de cumplimiento de entregas', 
  '(Pedidos entregados a tiempo / Total pedidos entregados) * 100', 
  '%', 'percentage', 'up', 95.00, 'monthly', 'cedi_manager', true), 
 
 ('KPI_023', (SELECT id FROM kpi_categories WHERE code = 'SERVICE'), 
  'Entregados Completos', 
  'Pedidos entregados completos', 
  'Controlar eficacia de despachos', 
  '(Nro de pedidos entregados completos / Total Pedidos) * 100', 
  '%', 'percentage', 'up', 95.00, 'monthly', 'cedi_manager', true), 
 
 ('KPI_024', (SELECT id FROM kpi_categories WHERE code = 'SERVICE'), 
  'Documentación sin problemas', 
  'Exactitud de información en facturas', 
  'Controlar exactitud de facturas', 
  '(Facturas generadas sin errores / Total facturas) * 100', 
  '%', 'percentage', 'up', 95.00, 'monthly', 'commercial_manager', true), 
 
 ('KPI_025', (SELECT id FROM kpi_categories WHERE code = 'SERVICE'), 
  'Costos logísticos vs ventas', 
  'Costos logísticos respecto a ventas', 
  'Controlar costos de operaciones logísticas', 
  '(Costos totales logísticos / Total ventas de la compañía) * 100', 
  '%', 'percentage', 'down', 10.00, 'monthly', 'general_manager', true), 
 
 ('KPI_026', (SELECT id FROM kpi_categories WHERE code = 'SERVICE'), 
  'Costos logísticos vs Utilidad bruta', 
  'Costos logísticos respecto a utilidades', 
  'Controlar costos logísticos vs utilidad bruta', 
  '(Costos totales logísticos / Utilidad bruta de la compañía) * 100', 
  '%', 'percentage', 'down', 50.00, 'monthly', 'general_manager', true), 
 
 ('KPI_027', (SELECT id FROM kpi_categories WHERE code = 'SERVICE'), 
  'Costos operación CEDI vs Ventas', 
  'Costos operación CD respecto a ventas', 
  'Controlar costos de operación del centro de distribución', 
  '(Costos operación centro distribución / Total ventas de la compañía) * 100', 
  '%', 'percentage', 'down', 5.00, 'monthly', 'general_manager', true), 
 
 -- International Trade Module (KPI 28) 
 ('KPI_028', (SELECT id FROM kpi_categories WHERE code = 'INTERNATIONAL'), 
  'Costo de unidad importada/exportada', 
  'Costo unitario de importación/exportación', 
  'Controlar precios según costos de importación/exportación', 
  'Costo de la mercancía importada/exportada / Total unidades importadas/exportadas', 
  'USD/unidad', 'currency', 'down', 900.00, 'monthly', 'purchasing_manager', true); 
