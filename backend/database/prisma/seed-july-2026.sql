-- Seed July 2026 data for SCILIP
DO $$
DECLARE
  v_company uuid := '87c92070-970b-414a-9617-d386c9c1e7bc';
  v_warehouse uuid := 'ebed5770-edfa-4f7f-8f28-e39494543114';
  v_supplier1 uuid := '2f74b446-78e2-4e02-9d35-dd2f967d7df8';
  v_supplier2 uuid := '24392f14-21e2-4d98-b598-4aab30c5e522';
  v_product1 uuid := 'dc9a81f1-7a68-4ab6-92be-c884622e87a2';
  v_product2 uuid := 'f28a9af7-9813-4ab6-a783-40977de2e5b1';
  v_product3 uuid; v_product4 uuid; v_product5 uuid;
  v_machine1 uuid; v_machine2 uuid;
  v_employee2 uuid; v_employee3 uuid; v_employee5 uuid;
  v_driver1 uuid; v_driver2 uuid;
  v_vehicle1 uuid; v_vehicle2 uuid; v_vehicle3 uuid;
  v_customer1 uuid; v_customer2 uuid;
  v_sale6 uuid;
  v_po6 uuid;
BEGIN
  SELECT id INTO v_product3 FROM products WHERE company_id = v_company AND sku = 'SKU-003';
  SELECT id INTO v_product4 FROM products WHERE company_id = v_company AND sku = 'SKU-004';
  SELECT id INTO v_product5 FROM products WHERE company_id = v_company AND sku = 'SKU-005';
  SELECT id INTO v_machine1 FROM machines WHERE company_id = v_company AND code = 'MAQ-001';
  SELECT id INTO v_machine2 FROM machines WHERE company_id = v_company AND code = 'MAQ-002';
  SELECT id INTO v_employee2 FROM employees WHERE company_id = v_company AND employee_code = 'EMP-002';
  SELECT id INTO v_employee3 FROM employees WHERE company_id = v_company AND employee_code = 'EMP-003';
  SELECT id INTO v_employee5 FROM employees WHERE company_id = v_company AND employee_code = 'EMP-005';
  SELECT id INTO v_vehicle1 FROM vehicles WHERE company_id = v_company AND plate_number = 'ABC-123';
  SELECT id INTO v_vehicle2 FROM vehicles WHERE company_id = v_company AND plate_number = 'DEF-456';
  SELECT id INTO v_vehicle3 FROM vehicles WHERE company_id = v_company AND plate_number = 'GHI-789';
  SELECT id INTO v_driver1 FROM drivers WHERE employee_id = v_employee2;
  SELECT id INTO v_driver2 FROM drivers WHERE employee_id = v_employee3;
  SELECT id INTO v_customer1 FROM customers WHERE company_id = v_company AND name = 'Distribuidora Norte';
  SELECT id INTO v_customer2 FROM customers WHERE company_id = v_company AND name = 'Talleres Sur SA';

  -- Purchase Order July
  INSERT INTO purchase_orders (id, company_id, po_number, supplier_id, warehouse_id, order_date, expected_delivery_date, actual_delivery_date, subtotal, tax, total_amount, status)
  VALUES (gen_random_uuid(), v_company, 'OC-2026-006', v_supplier1, v_warehouse, '2026-07-05', '2026-07-15', '2026-07-12', 2800000, 532000, 3332000, 'received')
  RETURNING id INTO v_po6;
  INSERT INTO purchase_order_lines (purchase_order_id, product_id, quantity_ordered, quantity_received, quantity_rejected, unit_price, total_price)
  VALUES (v_po6, v_product1, 50, 50, 0, 5000, 250000),
         (v_po6, v_product3, 100, 100, 0, 8000, 800000),
         (v_po6, v_product5, 200, 200, 0, 2800, 560000);

  -- Sale July
  INSERT INTO sales (id, company_id, invoice_number, customer_name, customer_document, sale_date, subtotal, tax, total_amount, total_cost, gross_profit, status)
  VALUES (gen_random_uuid(), v_company, 'FAC-2026-006', 'Distribuidora Norte', '900111222-1', '2026-07-15', 5200000, 988000, 6188000, 3100000, 3088000, 'completed')
  RETURNING id INTO v_sale6;
  INSERT INTO sale_lines (sale_id, product_id, quantity, unit_price, unit_cost, total_price)
  VALUES (v_sale6, v_product1, 100, 12000, 5000, 1200000),
         (v_sale6, v_product2, 200, 4000, 1500, 800000),
         (v_sale6, v_product5, 300, 5500, 2800, 1650000);

  -- Dispatch July
  INSERT INTO dispatches (id, company_id, dispatch_number, sale_id, warehouse_id, vehicle_id, driver_id, dispatch_date, delivered_on_time, delivered_complete, documentation_ok, perfect_delivery, dispatch_status, customer_id, promised_date)
  VALUES (gen_random_uuid(), v_company, 'DESP-2026-006', v_sale6, v_warehouse, v_vehicle3, v_driver1, '2026-07-16', true, true, true, true, 'delivered', v_customer1, '2026-07-17');

  -- Physical Inventory July
  INSERT INTO physical_inventory (company_id, warehouse_id, inventory_date, product_id, theoretical_quantity, physical_quantity, difference, difference_value)
  VALUES
    (v_company, v_warehouse, '2026-07-31', v_product1, 300, 299, -1, -5000),
    (v_company, v_warehouse, '2026-07-31', v_product2, 200, 200, 0, 0),
    (v_company, v_warehouse, '2026-07-31', v_product5, 500, 499, -1, -2800);

  -- Operational Costs July
  INSERT INTO operational_costs (company_id, warehouse_id, cost_date, cost_center, cost_type, amount, description)
  VALUES
    (v_company, v_warehouse, '2026-07-31', 'Almacenamiento', 'WAREHOUSE_OPS', 8500000, 'Arriendo bodega julio'),
    (v_company, v_warehouse, '2026-07-31', 'Almacenamiento', 'WAREHOUSE_OPS', 1200000, 'Servicios julio'),
    (v_company, v_warehouse, '2026-07-31', 'Almacenamiento', 'WAREHOUSE_OPS', 6000000, 'Nómina bodega julio'),
    (v_company, NULL, '2026-07-31', 'Transporte', 'WAREHOUSE_OPS', 3200000, 'Diesel flota julio'),
    (v_company, NULL, '2026-07-31', 'Transporte', 'WAREHOUSE_OPS', 1500000, 'Mantenimiento GHI-789');

  -- Transport Costs July
  INSERT INTO transport_costs (company_id, vehicle_id, driver_id, cost_date, cost_type, amount, quantity_liters, price_per_liter, distance_km, hours_driven)
  VALUES
    (v_company, v_vehicle1, v_driver1, '2026-07-05', 'Combustible', 850000, 180, 4722, 1200, 30),
    (v_company, v_vehicle2, v_driver2, '2026-07-12', 'Combustible', 620000, 135, 4592, 900, 22),
    (v_company, v_vehicle3, v_driver1, '2026-07-20', 'Combustible', 1200000, 250, 4800, 1800, 42);

  -- Production Records July
  INSERT INTO production_records (company_id, production_date, machine_id, product_id, quantity_produced, quantity_defective, hours_operated, downtime_hours, operator_id)
  VALUES
    (v_company, '2026-07-05', v_machine1, v_product2, 420, 5, 8, 0, v_employee5),
    (v_company, '2026-07-15', v_machine2, v_product4, 25, 1, 8, 0.5, v_employee5),
    (v_company, '2026-07-25', v_machine1, v_product5, 200, 2, 8, 0, v_employee5);

END $$;
