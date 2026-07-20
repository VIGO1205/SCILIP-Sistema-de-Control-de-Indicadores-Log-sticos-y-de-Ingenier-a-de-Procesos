-- ============================================================
-- SEED: Datos de Negocio para SCILIP
-- Company: 87c92070-970b-414a-9617-d386c9c1e7bc
-- User: 1e776a61-afe1-408c-abc6-e2e77d792670
-- Existing warehouse: ebed5770-edfa-4f7f-8f28-e39494543114
-- Existing suppliers: 2f74b446-... (SUP-001), 24392f14-... (SUP-002)
-- Existing products: dc9a81f1-... (SKU-001), f28a9af7-... (SKU-002)
-- ============================================================

DO $$
DECLARE
  v_company uuid := '87c92070-970b-414a-9617-d386c9c1e7bc';
  v_user uuid := '1e776a61-afe1-408c-abc6-e2e77d792670';
  v_warehouse uuid := 'ebed5770-edfa-4f7f-8f28-e39494543114';
  v_supplier1 uuid := '2f74b446-78e2-4e02-9d35-dd2f967d7df8';
  v_supplier2 uuid := '24392f14-21e2-4d98-b598-4aab30c5e522';
  v_product1 uuid := 'dc9a81f1-7a68-4ab6-92be-c884622e87a2';
  v_product2 uuid := 'f28a9af7-9813-4ab6-a783-40977de2e5b1';
  v_product3 uuid; v_product4 uuid; v_product5 uuid;
  v_supplier3 uuid; v_supplier4 uuid;
  v_machine1 uuid; v_machine2 uuid; v_machine3 uuid;
  v_employee1 uuid; v_employee2 uuid; v_employee3 uuid; v_employee4 uuid; v_employee5 uuid; v_employee6 uuid;
  v_driver1 uuid; v_driver2 uuid;
  v_vehicle1 uuid; v_vehicle2 uuid; v_vehicle3 uuid;
  v_customer1 uuid; v_customer2 uuid; v_customer3 uuid;
  v_sale1 uuid; v_sale2 uuid; v_sale3 uuid; v_sale4 uuid; v_sale5 uuid;
  v_dispatch1 uuid; v_dispatch2 uuid; v_dispatch3 uuid; v_dispatch4 uuid; v_dispatch5 uuid;
  v_po1 uuid; v_po2 uuid; v_po3 uuid; v_po4 uuid; v_po5 uuid;
  v_branch uuid;
BEGIN
  -- Branch
  SELECT id INTO v_branch FROM branches WHERE company_id = v_company LIMIT 1;
  IF v_branch IS NULL THEN
    INSERT INTO branches (id, company_id, name, code, address, city, is_main)
    VALUES (gen_random_uuid(), v_company, 'Sede Principal', 'SEDE-01', 'Calle 100 #15-20', 'Bogotá', true)
    RETURNING id INTO v_branch;
  END IF;

  -- Update suppliers to be certified
  UPDATE suppliers SET is_certified = true, certification_date = '2025-06-15', certification_expiry = '2026-06-15', rating = 4.80, lead_time_days = 5 WHERE id = v_supplier1;
  UPDATE suppliers SET is_certified = true, certification_date = '2025-09-01', certification_expiry = '2026-09-01', rating = 4.50, lead_time_days = 3 WHERE id = v_supplier2;

  -- More suppliers (not certified)
  INSERT INTO suppliers (id, company_id, code, name, tax_id, email, address, is_certified, rating, status, lead_time_days)
  VALUES
    (gen_random_uuid(), v_company, 'SUP-003', 'Importaciones Global', '900555123-4', 'ventas@globalimp.com', 'Carrera 15 #85-42, Bogotá', false, 3.20, 'active', 15),
    (gen_random_uuid(), v_company, 'SUP-004', 'Suministros Andinos', '900777888-5', 'contacto@sumandinos.com', 'Avenida El Dorado #68-10, Bogotá', false, 2.80, 'active', 10)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_supplier3 FROM suppliers WHERE company_id = v_company AND code = 'SUP-003';
  SELECT id INTO v_supplier4 FROM suppliers WHERE company_id = v_company AND code = 'SUP-004';

  -- More products
  INSERT INTO products (id, company_id, sku, name, description, category, subcategory, unit_of_measure, unit_cost, selling_price, min_stock, max_stock)
  VALUES
    (gen_random_uuid(), v_company, 'SKU-003', 'Papel Bond A4 Resma', 'Resma 500 hojas 75g', 'Papelería', 'Oficina', 'resma', 8000, 15000, 50, 500),
    (gen_random_uuid(), v_company, 'SKU-004', 'Tóner HP LaserJet', 'Cartucho tóner negro', 'Tecnología', 'Impresión', 'un', 95000, 165000, 20, 100),
    (gen_random_uuid(), v_company, 'SKU-005', 'Caja Cartón 40x30x30', 'Caja de corrugado triple', 'Empaque', 'Cajas', 'un', 2800, 5500, 200, 2000)
  ON CONFLICT (company_id, sku) DO NOTHING;
  SELECT id INTO v_product3 FROM products WHERE company_id = v_company AND sku = 'SKU-003';
  SELECT id INTO v_product4 FROM products WHERE company_id = v_company AND sku = 'SKU-004';
  SELECT id INTO v_product5 FROM products WHERE company_id = v_company AND sku = 'SKU-005';

  -- Update existing products with unit_cost
  UPDATE products SET unit_cost = 5000, selling_price = 12000 WHERE id = v_product1;
  UPDATE products SET unit_cost = 1500, selling_price = 4000 WHERE id = v_product2;

  -- Machines
  INSERT INTO machines (id, company_id, code, name, type, brand, model, max_capacity, capacity_unit, efficiency_rate, hourly_rate, status, branch_id)
  VALUES
    (gen_random_uuid(), v_company, 'MAQ-001', 'Empacadora Automática', 'Empaque', 'Bosch', 'BA-E200', 500, 'un/hora', 88.50, 150000, 'operational', v_branch),
    (gen_random_uuid(), v_company, 'MAQ-002', 'Selladora Industrial', 'Sellado', 'Ulpack', 'UL-350', 300, 'un/hora', 92.00, 250000, 'operational', v_branch),
    (gen_random_uuid(), v_company, 'MAQ-003', 'Cortadora de Cartón', 'Corte', 'Electrocut', 'EC-200', 200, 'un/hora', 95.50, 100000, 'maintenance', v_branch)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_machine1 FROM machines WHERE company_id = v_company AND code = 'MAQ-001';
  SELECT id INTO v_machine2 FROM machines WHERE company_id = v_company AND code = 'MAQ-002';
  SELECT id INTO v_machine3 FROM machines WHERE company_id = v_company AND code = 'MAQ-003';

  -- Employees
  INSERT INTO employees (id, company_id, employee_code, full_name, position, department, hire_date, salary, hourly_rate, is_active)
  VALUES
    (gen_random_uuid(), v_company, 'EMP-001', 'Carlos Martínez', 'Auxiliar de Bodega', 'Almacenamiento', '2024-03-15', 1800000, 12000, true),
    (gen_random_uuid(), v_company, 'EMP-002', 'María López', 'Despachadora', 'Despacho', '2024-06-01', 1700000, 11000, true),
    (gen_random_uuid(), v_company, 'EMP-003', 'Juan Rodríguez', 'Despachador', 'Despacho', '2025-01-10', 1600000, 10500, true),
    (gen_random_uuid(), v_company, 'EMP-004', 'Ana García', 'Supervisora de Bodega', 'Almacenamiento', '2023-08-20', 2500000, 18000, true),
    (gen_random_uuid(), v_company, 'EMP-005', 'Pedro Sánchez', 'Operario de Producción', 'Producción', '2024-11-05', 1500000, 10000, true),
    (gen_random_uuid(), v_company, 'EMP-006', 'Laura Díaz', 'Auxiliar Administrativo', 'Administración', '2025-02-01', 2000000, 14000, true)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_employee1 FROM employees WHERE company_id = v_company AND employee_code = 'EMP-001';
  SELECT id INTO v_employee2 FROM employees WHERE company_id = v_company AND employee_code = 'EMP-002';
  SELECT id INTO v_employee3 FROM employees WHERE company_id = v_company AND employee_code = 'EMP-003';
  SELECT id INTO v_employee4 FROM employees WHERE company_id = v_company AND employee_code = 'EMP-004';
  SELECT id INTO v_employee5 FROM employees WHERE company_id = v_company AND employee_code = 'EMP-005';
  SELECT id INTO v_employee6 FROM employees WHERE company_id = v_company AND employee_code = 'EMP-006';

  -- Vehicles
  INSERT INTO vehicles (id, company_id, plate_number, brand, model, year, vehicle_type, max_weight_kg, is_own_vehicle, lease_cost, status)
  VALUES
    (gen_random_uuid(), v_company, 'ABC-123', 'Chevrolet', 'NHR 8.5', 2023, 'camioneta', 3500, true, 0, 'active'),
    (gen_random_uuid(), v_company, 'DEF-456', 'Renault', 'Kangoo', 2022, 'furgon', 1200, false, 2500000, 'active'),
    (gen_random_uuid(), v_company, 'GHI-789', 'Hyundai', 'H1', 2024, 'camion', 8000, true, 0, 'active')
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_vehicle1 FROM vehicles WHERE company_id = v_company AND plate_number = 'ABC-123';
  SELECT id INTO v_vehicle2 FROM vehicles WHERE company_id = v_company AND plate_number = 'DEF-456';
  SELECT id INTO v_vehicle3 FROM vehicles WHERE company_id = v_company AND plate_number = 'GHI-789';

  -- Drivers
  INSERT INTO drivers (id, employee_id, license_number, license_type, is_active, assigned_vehicle_id)
  VALUES
    (gen_random_uuid(), v_employee2, 'LIC-98765', 'B2', true, v_vehicle1),
    (gen_random_uuid(), v_employee3, 'LIC-54321', 'B2', true, v_vehicle2)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_driver1 FROM drivers WHERE employee_id = v_employee2;
  SELECT id INTO v_driver2 FROM drivers WHERE employee_id = v_employee3;

  -- Customers
  INSERT INTO customers (id, company_id, name, tax_id, email, phone, is_active)
  VALUES
    (gen_random_uuid(), v_company, 'Distribuidora Norte', '900111222-1', 'compras@norte.com', '601-555-0101', true),
    (gen_random_uuid(), v_company, 'Talleres Sur SA', '900333444-3', 'compras@sur.com', '601-555-0202', true),
    (gen_random_uuid(), v_company, 'Repuestos Express Medellín', '900555666-5', 'pedidos@repmed.com', '604-555-0303', true)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_customer1 FROM customers WHERE company_id = v_company AND name = 'Distribuidora Norte';
  SELECT id INTO v_customer2 FROM customers WHERE company_id = v_company AND name = 'Talleres Sur SA';
  SELECT id INTO v_customer3 FROM customers WHERE company_id = v_company AND name = 'Repuestos Express Medellín';

  -- Purchase Orders (5 over 6 months)
  INSERT INTO purchase_orders (id, company_id, po_number, supplier_id, warehouse_id, order_date, expected_delivery_date, actual_delivery_date, subtotal, tax, total_amount, status)
  VALUES
    (gen_random_uuid(), v_company, 'OC-2026-001', v_supplier1, v_warehouse, '2026-01-10', '2026-01-20', '2026-01-18', 5000000, 950000, 5950000, 'received')
  RETURNING id INTO v_po1;
  INSERT INTO purchase_order_lines (purchase_order_id, product_id, quantity_ordered, quantity_received, quantity_rejected, unit_price, total_price)
  VALUES (v_po1, v_product1, 100, 100, 0, 5000, 500000),
         (v_po1, v_product2, 200, 200, 0, 1500, 300000);

  INSERT INTO purchase_orders (id, company_id, po_number, supplier_id, warehouse_id, order_date, expected_delivery_date, actual_delivery_date, subtotal, tax, total_amount, status)
  VALUES (gen_random_uuid(), v_company, 'OC-2026-002', v_supplier2, v_warehouse, '2026-02-05', '2026-02-15', '2026-02-14', 3200000, 608000, 3808000, 'received')
  RETURNING id INTO v_po2;
  INSERT INTO purchase_order_lines (purchase_order_id, product_id, quantity_ordered, quantity_received, quantity_rejected, unit_price, total_price, rejection_reason)
  VALUES (v_po2, v_product3, 200, 190, 10, 8000, 1600000, 'Daño en empaque');

  INSERT INTO purchase_orders (id, company_id, po_number, supplier_id, warehouse_id, order_date, expected_delivery_date, actual_delivery_date, subtotal, tax, total_amount, status)
  VALUES (gen_random_uuid(), v_company, 'OC-2026-003', v_supplier3, v_warehouse, '2026-03-12', '2026-04-01', '2026-03-30', 7200000, 1368000, 8568000, 'received')
  RETURNING id INTO v_po3;
  INSERT INTO purchase_order_lines (purchase_order_id, product_id, quantity_ordered, quantity_received, quantity_rejected, unit_price, total_price, rejection_reason)
  VALUES (v_po3, v_product4, 50, 45, 5, 95000, 4750000, 'Producto dañado');

  INSERT INTO purchase_orders (id, company_id, po_number, supplier_id, warehouse_id, order_date, expected_delivery_date, actual_delivery_date, subtotal, tax, total_amount, status)
  VALUES (gen_random_uuid(), v_company, 'OC-2026-004', v_supplier1, v_warehouse, '2026-04-08', '2026-04-18', '2026-04-16', 4500000, 855000, 5355000, 'received')
  RETURNING id INTO v_po4;
  INSERT INTO purchase_order_lines (purchase_order_id, product_id, quantity_ordered, quantity_received, quantity_rejected, unit_price, total_price)
  VALUES (v_po4, v_product5, 300, 300, 0, 2800, 840000);

  INSERT INTO purchase_orders (id, company_id, po_number, supplier_id, warehouse_id, order_date, expected_delivery_date, actual_delivery_date, subtotal, tax, total_amount, status)
  VALUES (gen_random_uuid(), v_company, 'OC-2026-005', v_supplier4, v_warehouse, '2026-05-20', '2026-06-10', '2026-06-08', 6100000, 1159000, 7259000, 'received')
  RETURNING id INTO v_po5;
  INSERT INTO purchase_order_lines (purchase_order_id, product_id, quantity_ordered, quantity_received, quantity_rejected, unit_price, total_price)
  VALUES (v_po5, v_product1, 150, 150, 0, 5000, 750000),
         (v_po5, v_product3, 250, 250, 0, 8000, 2000000),
         (v_po5, v_product5, 500, 500, 0, 2800, 1400000);

  -- Sales (5 over 6 months)
  INSERT INTO sales (id, company_id, invoice_number, customer_name, customer_document, sale_date, subtotal, tax, total_amount, total_cost, gross_profit, status)
  VALUES (gen_random_uuid(), v_company, 'FAC-2026-001', 'Distribuidora Norte', '900111222-1', '2026-01-25', 8500000, 1615000, 10115000, 6200000, 3915000, 'completed')
  RETURNING id INTO v_sale1;
  INSERT INTO sale_lines (sale_id, product_id, quantity, unit_price, unit_cost, total_price)
  VALUES (v_sale1, v_product1, 80, 12000, 5000, 960000),
         (v_sale1, v_product2, 150, 4000, 1500, 600000),
         (v_sale1, v_product4, 30, 165000, 95000, 4950000);

  INSERT INTO sales (id, company_id, invoice_number, customer_name, customer_document, sale_date, subtotal, tax, total_amount, total_cost, gross_profit, status)
  VALUES (gen_random_uuid(), v_company, 'FAC-2026-002', 'Talleres Sur SA', '900333444-3', '2026-02-20', 5600000, 1064000, 6664000, 3800000, 2864000, 'completed')
  RETURNING id INTO v_sale2;
  INSERT INTO sale_lines (sale_id, product_id, quantity, unit_price, unit_cost, total_price)
  VALUES (v_sale2, v_product3, 300, 15000, 8000, 4500000),
         (v_sale2, v_product5, 200, 5500, 2800, 1100000);

  INSERT INTO sales (id, company_id, invoice_number, customer_name, customer_document, sale_date, subtotal, tax, total_amount, total_cost, gross_profit, status)
  VALUES (gen_random_uuid(), v_company, 'FAC-2026-003', 'Repuestos Express Medellín', '900555666-5', '2026-03-18', 7200000, 1368000, 8568000, 4900000, 3668000, 'completed')
  RETURNING id INTO v_sale3;
  INSERT INTO sale_lines (sale_id, product_id, quantity, unit_price, unit_cost, total_price)
  VALUES (v_sale3, v_product1, 200, 12000, 5000, 2400000),
         (v_sale3, v_product4, 20, 165000, 95000, 3300000),
         (v_sale3, v_product2, 100, 4000, 1500, 400000);

  INSERT INTO sales (id, company_id, invoice_number, customer_name, customer_document, sale_date, subtotal, tax, total_amount, total_cost, gross_profit, status)
  VALUES (gen_random_uuid(), v_company, 'FAC-2026-004', 'Distribuidora Norte', '900111222-1', '2026-04-22', 9800000, 1862000, 11662000, 7100000, 4562000, 'completed')
  RETURNING id INTO v_sale4;
  INSERT INTO sale_lines (sale_id, product_id, quantity, unit_price, unit_cost, total_price)
  VALUES (v_sale4, v_product5, 400, 5500, 2800, 2200000),
         (v_sale4, v_product3, 500, 15000, 8000, 7500000);

  INSERT INTO sales (id, company_id, invoice_number, customer_name, customer_document, sale_date, subtotal, tax, total_amount, total_cost, gross_profit, status)
  VALUES (gen_random_uuid(), v_company, 'FAC-2026-005', 'Talleres Sur SA', '900333444-3', '2026-06-05', 6400000, 1216000, 7616000, 4300000, 3316000, 'completed')
  RETURNING id INTO v_sale5;
  INSERT INTO sale_lines (sale_id, product_id, quantity, unit_price, unit_cost, total_price)
  VALUES (v_sale5, v_product1, 100, 12000, 5000, 1200000),
         (v_sale5, v_product4, 15, 165000, 95000, 2475000),
         (v_sale5, v_product2, 250, 4000, 1500, 1000000);

  -- Dispatches (linked to sales)
  INSERT INTO dispatches (id, company_id, dispatch_number, sale_id, warehouse_id, vehicle_id, driver_id, dispatch_date, delivered_on_time, delivered_complete, documentation_ok, perfect_delivery, dispatch_status, customer_id, promised_date)
  VALUES (gen_random_uuid(), v_company, 'DESP-2026-001', v_sale1, v_warehouse, v_vehicle1, v_driver1, '2026-01-26', true, true, true, true, 'delivered', v_customer1, '2026-01-27')
  RETURNING id INTO v_dispatch1;
  INSERT INTO dispatch_lines (dispatch_id, product_id, quantity_requested, quantity_dispatched, quantity_damaged)
  VALUES (v_dispatch1, v_product1, 80, 80, 0), (v_dispatch1, v_product2, 150, 150, 0), (v_dispatch1, v_product4, 30, 30, 0);

  INSERT INTO dispatches (id, company_id, dispatch_number, sale_id, warehouse_id, vehicle_id, driver_id, dispatch_date, delivered_on_time, delivered_complete, documentation_ok, perfect_delivery, dispatch_status, customer_id, promised_date)
  VALUES (gen_random_uuid(), v_company, 'DESP-2026-002', v_sale2, v_warehouse, v_vehicle2, v_driver2, '2026-02-21', true, false, true, false, 'delivered', v_customer2, '2026-02-22')
  RETURNING id INTO v_dispatch2;
  INSERT INTO dispatch_lines (dispatch_id, product_id, quantity_requested, quantity_dispatched, quantity_damaged)
  VALUES (v_dispatch2, v_product3, 300, 290, 0), (v_dispatch2, v_product5, 200, 200, 0);

  INSERT INTO dispatches (id, company_id, dispatch_number, sale_id, warehouse_id, vehicle_id, driver_id, dispatch_date, delivered_on_time, delivered_complete, documentation_ok, perfect_delivery, dispatch_status, customer_id, promised_date)
  VALUES (gen_random_uuid(), v_company, 'DESP-2026-003', v_sale3, v_warehouse, v_vehicle1, v_driver1, '2026-03-19', false, true, true, false, 'delivered', v_customer3, '2026-03-18')
  RETURNING id INTO v_dispatch3;
  INSERT INTO dispatch_lines (dispatch_id, product_id, quantity_requested, quantity_dispatched, quantity_damaged)
  VALUES (v_dispatch3, v_product1, 200, 200, 0), (v_dispatch3, v_product4, 20, 20, 0), (v_dispatch3, v_product2, 100, 100, 0);

  INSERT INTO dispatches (id, company_id, dispatch_number, sale_id, warehouse_id, vehicle_id, driver_id, dispatch_date, delivered_on_time, delivered_complete, documentation_ok, perfect_delivery, dispatch_status, customer_id, promised_date)
  VALUES (gen_random_uuid(), v_company, 'DESP-2026-004', v_sale4, v_warehouse, v_vehicle3, v_driver1, '2026-04-23', true, true, false, false, 'delivered', v_customer1, '2026-04-24')
  RETURNING id INTO v_dispatch4;
  INSERT INTO dispatch_lines (dispatch_id, product_id, quantity_requested, quantity_dispatched, quantity_damaged)
  VALUES (v_dispatch4, v_product5, 400, 400, 0), (v_dispatch4, v_product3, 500, 500, 0);

  INSERT INTO dispatches (id, company_id, dispatch_number, sale_id, warehouse_id, vehicle_id, driver_id, dispatch_date, delivered_on_time, delivered_complete, documentation_ok, perfect_delivery, dispatch_status, customer_id, promised_date)
  VALUES (gen_random_uuid(), v_company, 'DESP-2026-005', v_sale5, v_warehouse, v_vehicle2, v_driver2, '2026-06-06', true, true, true, true, 'delivered', v_customer2, '2026-06-07')
  RETURNING id INTO v_dispatch5;
  INSERT INTO dispatch_lines (dispatch_id, product_id, quantity_requested, quantity_dispatched, quantity_damaged)
  VALUES (v_dispatch5, v_product1, 100, 100, 0), (v_dispatch5, v_product4, 15, 15, 0), (v_dispatch5, v_product2, 250, 250, 0);

  -- Physical Inventory
  INSERT INTO physical_inventory (company_id, warehouse_id, inventory_date, product_id, theoretical_quantity, physical_quantity, difference, difference_value)
  VALUES
    (v_company, v_warehouse, '2026-01-31', v_product1, 200, 198, -2, -10000),
    (v_company, v_warehouse, '2026-01-31', v_product2, 350, 350, 0, 0),
    (v_company, v_warehouse, '2026-02-28', v_product3, 200, 198, -2, -16000),
    (v_company, v_warehouse, '2026-02-28', v_product4, 50, 49, -1, -95000),
    (v_company, v_warehouse, '2026-03-31', v_product1, 300, 298, -2, -10000),
    (v_company, v_warehouse, '2026-03-31', v_product5, 500, 498, -2, -5600),
    (v_company, v_warehouse, '2026-04-30', v_product2, 250, 250, 0, 0),
    (v_company, v_warehouse, '2026-04-30', v_product3, 500, 500, 0, 0),
    (v_company, v_warehouse, '2026-05-31', v_product1, 350, 350, 0, 0),
    (v_company, v_warehouse, '2026-05-31', v_product4, 35, 35, 0, 0),
    (v_company, v_warehouse, '2026-06-30', v_product1, 400, 400, 0, 0),
    (v_company, v_warehouse, '2026-06-30', v_product2, 200, 199, -1, -1500),
    (v_company, v_warehouse, '2026-06-30', v_product5, 600, 600, 0, 0);

  -- Operational Costs (monthly warehouse + transport)
  INSERT INTO operational_costs (company_id, warehouse_id, cost_date, cost_center, cost_type, amount, description)
  VALUES
    (v_company, v_warehouse, '2026-01-31', 'Almacenamiento', 'WAREHOUSE_OPS', 8500000, 'Arriendo bodega enero'),
    (v_company, v_warehouse, '2026-01-31', 'Almacenamiento', 'WAREHOUSE_OPS', 1200000, 'Servicios enero'),
    (v_company, v_warehouse, '2026-01-31', 'Almacenamiento', 'WAREHOUSE_OPS', 5400000, 'Nómina bodega enero'),
    (v_company, v_warehouse, '2026-02-28', 'Almacenamiento', 'WAREHOUSE_OPS', 8500000, 'Arriendo bodega febrero'),
    (v_company, v_warehouse, '2026-02-28', 'Almacenamiento', 'WAREHOUSE_OPS', 1150000, 'Servicios febrero'),
    (v_company, v_warehouse, '2026-02-28', 'Almacenamiento', 'WAREHOUSE_OPS', 5400000, 'Nómina bodega febrero'),
    (v_company, v_warehouse, '2026-03-31', 'Almacenamiento', 'WAREHOUSE_OPS', 8500000, 'Arriendo bodega marzo'),
    (v_company, v_warehouse, '2026-03-31', 'Almacenamiento', 'WAREHOUSE_OPS', 1300000, 'Servicios marzo'),
    (v_company, v_warehouse, '2026-03-31', 'Almacenamiento', 'WAREHOUSE_OPS', 5600000, 'Nómina bodega marzo'),
    (v_company, v_warehouse, '2026-04-30', 'Almacenamiento', 'WAREHOUSE_OPS', 8500000, 'Arriendo bodega abril'),
    (v_company, v_warehouse, '2026-04-30', 'Almacenamiento', 'WAREHOUSE_OPS', 1100000, 'Servicios abril'),
    (v_company, v_warehouse, '2026-04-30', 'Almacenamiento', 'WAREHOUSE_OPS', 5600000, 'Nómina bodega abril'),
    (v_company, v_warehouse, '2026-05-31', 'Almacenamiento', 'WAREHOUSE_OPS', 8500000, 'Arriendo bodega mayo'),
    (v_company, v_warehouse, '2026-05-31', 'Almacenamiento', 'WAREHOUSE_OPS', 1250000, 'Servicios mayo'),
    (v_company, v_warehouse, '2026-05-31', 'Almacenamiento', 'WAREHOUSE_OPS', 5800000, 'Nómina bodega mayo'),
    (v_company, v_warehouse, '2026-06-30', 'Almacenamiento', 'WAREHOUSE_OPS', 8500000, 'Arriendo bodega junio'),
    (v_company, v_warehouse, '2026-06-30', 'Almacenamiento', 'WAREHOUSE_OPS', 1180000, 'Servicios junio'),
    (v_company, v_warehouse, '2026-06-30', 'Almacenamiento', 'WAREHOUSE_OPS', 5800000, 'Nómina bodega junio'),
    (v_company, NULL, '2026-01-31', 'Transporte', 'WAREHOUSE_OPS', 3200000, 'Diesel flota enero'),
    (v_company, NULL, '2026-02-28', 'Transporte', 'WAREHOUSE_OPS', 3500000, 'Diesel flota febrero'),
    (v_company, NULL, '2026-03-31', 'Transporte', 'WAREHOUSE_OPS', 3100000, 'Diesel flota marzo'),
    (v_company, NULL, '2026-04-30', 'Transporte', 'WAREHOUSE_OPS', 3800000, 'Diesel flota abril'),
    (v_company, NULL, '2026-05-31', 'Transporte', 'WAREHOUSE_OPS', 3400000, 'Diesel flota mayo'),
    (v_company, NULL, '2026-06-30', 'Transporte', 'WAREHOUSE_OPS', 3600000, 'Diesel flota junio'),
    (v_company, NULL, '2026-01-31', 'Transporte', 'WAREHOUSE_OPS', 1500000, 'Mantenimiento ABC-123'),
    (v_company, NULL, '2026-03-31', 'Transporte', 'WAREHOUSE_OPS', 2200000, 'Mantenimiento DEF-456'),
    (v_company, NULL, '2026-05-31', 'Transporte', 'WAREHOUSE_OPS', 1800000, 'Mantenimiento ABC-123');

  -- Transport Costs
  INSERT INTO transport_costs (company_id, vehicle_id, driver_id, cost_date, cost_type, amount, quantity_liters, price_per_liter, distance_km, hours_driven)
  VALUES
    (v_company, v_vehicle1, v_driver1, '2026-01-15', 'Combustible', 850000, 180, 4722, 1200, 30),
    (v_company, v_vehicle2, v_driver2, '2026-01-20', 'Combustible', 620000, 135, 4592, 900, 22),
    (v_company, v_vehicle3, v_driver1, '2026-02-05', 'Combustible', 1200000, 250, 4800, 1800, 42),
    (v_company, v_vehicle1, v_driver1, '2026-02-18', 'Combustible', 780000, 165, 4727, 1100, 28),
    (v_company, v_vehicle2, v_driver2, '2026-03-10', 'Combustible', 920000, 195, 4718, 1300, 32),
    (v_company, v_vehicle3, v_driver1, '2026-03-25', 'Mantenimiento', 2500000, NULL, NULL, NULL, NULL),
    (v_company, v_vehicle1, v_driver1, '2026-04-08', 'Combustible', 1000000, 210, 4761, 1500, 35),
    (v_company, v_vehicle2, v_driver2, '2026-04-18', 'Combustible', 680000, 145, 4689, 950, 23),
    (v_company, v_vehicle1, v_driver1, '2026-05-05', 'Combustible', 880000, 188, 4680, 1250, 31),
    (v_company, v_vehicle2, v_driver2, '2026-05-20', 'Combustible', 720000, 155, 4645, 1050, 26),
    (v_company, v_vehicle1, v_driver1, '2026-06-10', 'Combustible', 950000, 200, 4750, 1400, 34),
    (v_company, v_vehicle2, v_driver2, '2026-06-18', 'Combustible', 650000, 140, 4642, 900, 22);

  -- Production Records
  INSERT INTO production_records (company_id, production_date, machine_id, product_id, quantity_produced, quantity_defective, hours_operated, downtime_hours, operator_id)
  VALUES
    (v_company, '2026-01-15', v_machine1, v_product2, 380, 12, 8, 1, v_employee5),
    (v_company, '2026-01-25', v_machine1, v_product2, 400, 8, 8, 0, v_employee5),
    (v_company, '2026-01-20', v_machine2, v_product4, 22, 1, 8, 0.5, v_employee5),
    (v_company, '2026-02-10', v_machine1, v_product2, 420, 5, 8, 0, v_employee5),
    (v_company, '2026-02-15', v_machine2, v_product4, 25, 0, 8, 0, v_employee5),
    (v_company, '2026-02-20', v_machine1, v_product5, 350, 10, 8, 1, v_employee5),
    (v_company, '2026-03-05', v_machine1, v_product2, 390, 15, 8, 1.5, v_employee5),
    (v_company, '2026-03-10', v_machine2, v_product4, 20, 2, 8, 2, v_employee5),
    (v_company, '2026-03-20', v_machine1, v_product5, 180, 5, 8, 0, v_employee5),
    (v_company, '2026-04-05', v_machine1, v_product2, 410, 6, 8, 0, v_employee5),
    (v_company, '2026-04-15', v_machine2, v_product4, 24, 1, 8, 0.5, v_employee5),
    (v_company, '2026-04-25', v_machine1, v_product5, 370, 8, 8, 1, v_employee5),
    (v_company, '2026-05-10', v_machine1, v_product2, 430, 4, 8, 0, v_employee5),
    (v_company, '2026-05-20', v_machine2, v_product4, 26, 0, 8, 0, v_employee5),
    (v_company, '2026-06-05', v_machine1, v_product2, 440, 3, 8, 0, v_employee5),
    (v_company, '2026-06-15', v_machine2, v_product4, 23, 1, 8, 0.5, v_employee5),
    (v_company, '2026-06-25', v_machine1, v_product5, 200, 2, 8, 0, v_employee5);

END $$;
