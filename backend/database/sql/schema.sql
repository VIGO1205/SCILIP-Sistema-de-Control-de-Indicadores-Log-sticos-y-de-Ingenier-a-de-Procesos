-- ============================================= 
 -- SISTEMA DE GESTIÓN LOGÍSTICA - ESQUEMA COMPLETO 
 -- ============================================= 
 
 -- --------------------------------------------- 
 -- 1. SEGURIDAD Y ROLES 
 -- --------------------------------------------- 
 
 CREATE TABLE roles ( 
     id SERIAL PRIMARY KEY, 
     name VARCHAR(50) UNIQUE NOT NULL, 
     description TEXT, 
     permissions JSONB NOT NULL DEFAULT '{ 
         "modules": [], 
         "kpis": [], 
         "reports": [], 
         "settings": false 
     }', 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 CREATE TABLE users ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     email VARCHAR(255) UNIQUE NOT NULL, 
     password_hash VARCHAR(255) NOT NULL, 
     full_name VARCHAR(255) NOT NULL, 
     role_id INT NOT NULL REFERENCES roles(id), 
     avatar_url TEXT, 
     department VARCHAR(100), 
     phone VARCHAR(20), 
     is_active BOOLEAN DEFAULT true, 
     email_verified BOOLEAN DEFAULT false, 
     last_login_at TIMESTAMP, 
     last_login_ip INET, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     deleted_at TIMESTAMP 
 ); 
 
 CREATE TABLE user_sessions ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
     token VARCHAR(500) NOT NULL, 
     expires_at TIMESTAMP NOT NULL, 
     ip_address INET, 
     user_agent TEXT, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 CREATE TABLE audit_logs ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     user_id UUID REFERENCES users(id), 
     action VARCHAR(100) NOT NULL, 
     entity_type VARCHAR(50), 
     entity_id VARCHAR(100), 
     old_values JSONB, 
     new_values JSONB, 
     ip_address INET, 
     user_agent TEXT, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 -- --------------------------------------------- 
 -- 2. TABLAS MAESTRAS (COMPLETAS) 
 -- --------------------------------------------- 
 
 CREATE TABLE companies ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     tax_id VARCHAR(50) UNIQUE NOT NULL, 
     legal_name VARCHAR(255) NOT NULL, 
     trade_name VARCHAR(255), 
     logo_url TEXT, 
     logo_dark_url TEXT, 
     email VARCHAR(255), 
     phone VARCHAR(50), 
     address TEXT, 
     city VARCHAR(100), 
     country VARCHAR(100), 
     website VARCHAR(255), 
     settings JSONB DEFAULT '{}', 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 CREATE TABLE branches ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     code VARCHAR(50) NOT NULL, 
     name VARCHAR(255) NOT NULL, 
     address TEXT, 
     city VARCHAR(100), 
     phone VARCHAR(50), 
     email VARCHAR(255), 
     is_main BOOLEAN DEFAULT false, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     UNIQUE(company_id, code) 
 ); 
 
 CREATE TABLE suppliers ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     code VARCHAR(50) NOT NULL, 
     name VARCHAR(255) NOT NULL, 
     tax_id VARCHAR(50), 
     email VARCHAR(255), 
     phone VARCHAR(50), 
     address TEXT, 
     contact_person VARCHAR(255), 
     contact_phone VARCHAR(50), 
     payment_terms VARCHAR(100), 
     lead_time_days INT DEFAULT 0, 
     is_certified BOOLEAN DEFAULT false, 
     certification_date DATE, 
     certification_expiry DATE, 
     certification_document_url TEXT, 
     rating DECIMAL(3,2), -- 0-5 
     status VARCHAR(20) DEFAULT 'active', 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     UNIQUE(company_id, code) 
 ); 
 
 CREATE TABLE products ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     sku VARCHAR(100) NOT NULL, 
     name VARCHAR(255) NOT NULL, 
     description TEXT, 
     category VARCHAR(100), 
     subcategory VARCHAR(100), 
     brand VARCHAR(100), 
     unit_of_measure VARCHAR(20), -- units, kg, liters, pallets 
     weight_kg DECIMAL(12,4), 
     volume_m3 DECIMAL(12,4), 
     dimensions JSONB, -- {length, width, height} 
     abc_classification CHAR(1), -- A, B, C 
     min_stock INT DEFAULT 0, 
     max_stock INT, 
     reorder_point INT, 
     unit_cost DECIMAL(15,4), 
     selling_price DECIMAL(15,4), 
     is_active BOOLEAN DEFAULT true, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     UNIQUE(company_id, sku) 
 ); 
 
 CREATE TABLE warehouses ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     branch_id UUID REFERENCES branches(id), 
     code VARCHAR(50) NOT NULL, 
     name VARCHAR(255) NOT NULL, 
     type VARCHAR(50), -- 'main', 'satellite', 'cross-dock' 
     address TEXT, 
     city VARCHAR(100), 
     total_area_m2 DECIMAL(12,2), 
     usable_area_m2 DECIMAL(12,2), 
     storage_capacity_units INT, 
     dock_doors INT, 
     operating_hours JSONB, 
     contact_person VARCHAR(255), 
     contact_phone VARCHAR(50), 
     is_active BOOLEAN DEFAULT true, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     UNIQUE(company_id, code) 
 ); 
 
 CREATE TABLE locations ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE, 
     zone VARCHAR(50), -- 'A', 'B', 'C' 
     aisle VARCHAR(50), 
     rack VARCHAR(50), 
     level VARCHAR(10), 
     position VARCHAR(10), 
     location_code VARCHAR(100) NOT NULL, 
     location_type VARCHAR(50), -- 'pallet', 'shelf', 'bulk' 
     max_weight_kg DECIMAL(12,2), 
     max_volume_m3 DECIMAL(12,2), 
     is_occupied BOOLEAN DEFAULT false, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     UNIQUE(warehouse_id, location_code) 
 ); 
 
 CREATE TABLE machines ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     branch_id UUID REFERENCES branches(id), 
     code VARCHAR(50) NOT NULL, 
     name VARCHAR(255) NOT NULL, 
     type VARCHAR(100), 
     brand VARCHAR(100), 
     model VARCHAR(100), 
     serial_number VARCHAR(100), 
     max_capacity DECIMAL(12,2), 
     capacity_unit VARCHAR(50), -- units/hour, kg/hour, etc. 
     efficiency_rate DECIMAL(5,2) DEFAULT 100.00, 
     hourly_rate DECIMAL(15,2), 
     installation_date DATE, 
     last_maintenance DATE, 
     next_maintenance DATE, 
     status VARCHAR(20) DEFAULT 'operational', 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     UNIQUE(company_id, code) 
 ); 
 
 CREATE TABLE vehicles ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     branch_id UUID REFERENCES branches(id), 
     plate_number VARCHAR(20) NOT NULL, 
     brand VARCHAR(100), 
     model VARCHAR(100), 
     year INT, 
     vehicle_type VARCHAR(50), -- 'truck', 'van', 'motorcycle' 
     max_weight_kg DECIMAL(12,2), 
     max_volume_m3 DECIMAL(12,2), 
     fuel_type VARCHAR(20), 
     fuel_efficiency DECIMAL(8,2), -- km/liter 
     insurance_expiry DATE, 
     technical_review_expiry DATE, 
     is_own_vehicle BOOLEAN DEFAULT true, 
     lease_cost DECIMAL(15,2), 
     status VARCHAR(20) DEFAULT 'active', 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     UNIQUE(company_id, plate_number) 
 ); 
 
 CREATE TABLE employees ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     branch_id UUID REFERENCES branches(id), 
     employee_code VARCHAR(50) NOT NULL, 
     full_name VARCHAR(255) NOT NULL, 
     document_id VARCHAR(50), 
     position VARCHAR(100), 
     department VARCHAR(100), 
     hire_date DATE, 
     salary DECIMAL(15,2), 
     hourly_rate DECIMAL(12,2), 
     shift VARCHAR(50), -- 'morning', 'afternoon', 'night' 
     supervisor_id UUID REFERENCES employees(id), 
     is_active BOOLEAN DEFAULT true, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     UNIQUE(company_id, employee_code) 
 ); 
 
 CREATE TABLE drivers ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     employee_id UUID NOT NULL REFERENCES employees(id), 
     license_number VARCHAR(50), 
     license_type VARCHAR(50), 
     license_expiry DATE, 
     assigned_vehicle_id UUID REFERENCES vehicles(id), 
     routes_assigned TEXT[], 
     is_active BOOLEAN DEFAULT true, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 -- --------------------------------------------- 
 -- 3. TABLAS DE TRANSACCIONES (COMPLETAS) 
 -- --------------------------------------------- 
 
 CREATE TABLE purchase_orders ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     po_number VARCHAR(100) NOT NULL, 
     supplier_id UUID NOT NULL REFERENCES suppliers(id), 
     warehouse_id UUID REFERENCES warehouses(id), 
     order_date DATE NOT NULL, 
     expected_delivery_date DATE, 
     actual_delivery_date DATE, 
     subtotal DECIMAL(15,2), 
     tax DECIMAL(15,2), 
     total_amount DECIMAL(15,2), 
     currency VARCHAR(3) DEFAULT 'COP', 
     status VARCHAR(50) DEFAULT 'pending', -- 'draft', 'sent', 'confirmed', 'received', 'rejected', 'cancelled' 
     rejection_reason TEXT, 
     created_by UUID REFERENCES users(id), 
     approved_by UUID REFERENCES users(id), 
     notes TEXT, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     UNIQUE(company_id, po_number) 
 ); 
 
 CREATE TABLE purchase_order_lines ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE, 
     product_id UUID NOT NULL REFERENCES products(id), 
     quantity_ordered INT NOT NULL, 
     quantity_received INT DEFAULT 0, 
     quantity_rejected INT DEFAULT 0, 
     unit_price DECIMAL(15,2) NOT NULL, 
     total_price DECIMAL(15,2) GENERATED ALWAYS AS (quantity_ordered * unit_price) STORED, 
     rejection_reason TEXT, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 CREATE TABLE sales ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     invoice_number VARCHAR(100) NOT NULL, 
     branch_id UUID REFERENCES branches(id), 
     customer_name VARCHAR(255), 
     customer_document VARCHAR(50), 
     sale_date DATE NOT NULL, 
     subtotal DECIMAL(15,2), 
     tax DECIMAL(15,2), 
     total_amount DECIMAL(15,2) NOT NULL, 
     total_cost DECIMAL(15,2), 
     gross_profit DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - total_cost) STORED, 
     currency VARCHAR(3) DEFAULT 'COP', 
     payment_method VARCHAR(50), 
     status VARCHAR(50) DEFAULT 'completed', 
     created_by UUID REFERENCES users(id), 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     UNIQUE(company_id, invoice_number) 
 ); 
 
 CREATE TABLE sale_lines ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE, 
     product_id UUID NOT NULL REFERENCES products(id), 
     quantity INT NOT NULL, 
     unit_price DECIMAL(15,2) NOT NULL, 
     unit_cost DECIMAL(15,2), 
     discount DECIMAL(15,2) DEFAULT 0, 
     total_price DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price - discount) STORED, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 CREATE TABLE inventory_movements ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     product_id UUID NOT NULL REFERENCES products(id), 
     warehouse_id UUID NOT NULL REFERENCES warehouses(id), 
     location_id UUID REFERENCES locations(id), 
     movement_type VARCHAR(30) NOT NULL, -- 'receipt', 'dispatch', 'adjustment_positive', 'adjustment_negative', 'return', 'transfer_in', 'transfer_out' 
     quantity INT NOT NULL, 
     unit_cost DECIMAL(15,2), 
     reference_type VARCHAR(50), -- 'purchase_order', 'sale', 'transfer', 'inventory' 
     reference_id UUID, 
     movement_date DATE NOT NULL, 
     created_by UUID REFERENCES users(id), 
     notes TEXT, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 CREATE TABLE physical_inventory ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     warehouse_id UUID NOT NULL REFERENCES warehouses(id), 
     inventory_date DATE NOT NULL, 
     product_id UUID NOT NULL REFERENCES products(id), 
     location_id UUID REFERENCES locations(id), 
     theoretical_quantity INT NOT NULL, 
     physical_quantity INT NOT NULL, 
     difference INT GENERATED ALWAYS AS (physical_quantity - theoretical_quantity) STORED, 
     difference_value DECIMAL(15,2), 
     reason_code VARCHAR(50), 
     counted_by UUID REFERENCES users(id), 
     verified_by UUID REFERENCES users(id), 
     notes TEXT, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 CREATE TABLE dispatches ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     dispatch_number VARCHAR(100) NOT NULL, 
     sale_id UUID REFERENCES sales(id), 
     warehouse_id UUID NOT NULL REFERENCES warehouses(id), 
     vehicle_id UUID REFERENCES vehicles(id), 
     driver_id UUID REFERENCES drivers(id), 
     dispatch_date DATE NOT NULL, 
     scheduled_time TIME, 
     actual_departure_time TIME, 
     actual_delivery_time TIME, 
     dispatch_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'preparing', 'loaded', 'in_transit', 'delivered', 'delayed', 'cancelled' 
     delivered_on_time BOOLEAN, 
     delivered_complete BOOLEAN, 
     documentation_ok BOOLEAN, 
     perfect_delivery BOOLEAN GENERATED ALWAYS AS ( 
         delivered_on_time AND delivered_complete AND documentation_ok 
     ) STORED, 
     delivery_address TEXT, 
     receiver_name VARCHAR(255), 
     receiver_signature_url TEXT, 
     delivery_notes TEXT, 
     created_by UUID REFERENCES users(id), 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     UNIQUE(company_id, dispatch_number) 
 ); 
 
 CREATE TABLE dispatch_lines ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     dispatch_id UUID NOT NULL REFERENCES dispatches(id) ON DELETE CASCADE, 
     product_id UUID NOT NULL REFERENCES products(id), 
     quantity_requested INT NOT NULL, 
     quantity_dispatched INT NOT NULL, 
     quantity_damaged INT DEFAULT 0, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 CREATE TABLE production_records ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     production_date DATE NOT NULL, 
     machine_id UUID NOT NULL REFERENCES machines(id), 
     product_id UUID NOT NULL REFERENCES products(id), 
     batch_number VARCHAR(100), 
     quantity_produced INT NOT NULL, 
     quantity_defective INT DEFAULT 0, 
     hours_operated DECIMAL(8,2) NOT NULL, 
     downtime_hours DECIMAL(8,2) DEFAULT 0, 
     setup_time DECIMAL(8,2) DEFAULT 0, 
     raw_material_used JSONB, 
     operator_id UUID REFERENCES employees(id), 
     notes TEXT, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 CREATE TABLE operational_costs ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     branch_id UUID REFERENCES branches(id), 
     warehouse_id UUID REFERENCES warehouses(id), 
     cost_date DATE NOT NULL, 
     cost_center VARCHAR(100), -- 'warehousing', 'transport', 'administration', 'production' 
     cost_type VARCHAR(100), -- 'labor', 'rent', 'utilities', 'maintenance', 'fuel', 'insurance' 
     amount DECIMAL(15,2) NOT NULL, 
     currency VARCHAR(3) DEFAULT 'COP', 
     description TEXT, 
     reference_document VARCHAR(100), 
     created_by UUID REFERENCES users(id), 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 CREATE TABLE transport_costs ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     vehicle_id UUID NOT NULL REFERENCES vehicles(id), 
     driver_id UUID REFERENCES drivers(id), 
     cost_date DATE NOT NULL, 
     cost_type VARCHAR(50) NOT NULL, -- 'fuel', 'maintenance', 'tolls', 'driver_salary', 'insurance', 'depreciation' 
     amount DECIMAL(15,2) NOT NULL, 
     quantity_liters DECIMAL(10,2), -- for fuel 
     price_per_liter DECIMAL(10,2), -- for fuel 
     distance_km DECIMAL(10,2), -- for route 
     hours_driven DECIMAL(8,2), 
     invoice_number VARCHAR(100), 
     notes TEXT, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 CREATE TABLE import_export_records ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     operation_type VARCHAR(20) NOT NULL, -- 'import', 'export' 
     product_id UUID NOT NULL REFERENCES products(id), 
     supplier_id UUID REFERENCES suppliers(id), 
     customer_name VARCHAR(255), 
     operation_date DATE NOT NULL, 
     quantity INT NOT NULL, 
     unit_cost_usd DECIMAL(15,2) NOT NULL, 
     total_cost_usd DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_cost_usd) STORED, 
     freight_cost_usd DECIMAL(15,2), 
     insurance_cost_usd DECIMAL(15,2), 
     customs_duties_usd DECIMAL(15,2), 
     port_of_origin VARCHAR(255), 
     port_of_destination VARCHAR(255), 
     container_number VARCHAR(50), 
     bl_number VARCHAR(100), 
     status VARCHAR(50), 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 -- --------------------------------------------- 
 -- 4. TABLAS DE KPIs (COMPLETAS) 
 -- --------------------------------------------- 
 
 CREATE TABLE kpi_categories ( 
     id SERIAL PRIMARY KEY, 
     code VARCHAR(50) UNIQUE NOT NULL, 
     name VARCHAR(255) NOT NULL, 
     description TEXT, 
     icon VARCHAR(100), 
     color VARCHAR(50), 
     display_order INT DEFAULT 0, 
     is_active BOOLEAN DEFAULT true 
 ); 
 
 CREATE TABLE kpi_definitions ( 
     id SERIAL PRIMARY KEY, 
     code VARCHAR(50) UNIQUE NOT NULL, 
     category_id INT REFERENCES kpi_categories(id), 
     name VARCHAR(255) NOT NULL, 
     description TEXT, 
     objective TEXT, 
     formula TEXT NOT NULL, 
     unit VARCHAR(50), 
     unit_type VARCHAR(20), -- 'percentage', 'currency', 'number', 'days', 'times' 
     direction VARCHAR(10) DEFAULT 'down', -- 'up' (higher is better), 'down' (lower is better) 
     target_value DECIMAL(12,4), 
     min_value DECIMAL(12,4), 
     max_value DECIMAL(12,4), 
     periodicity VARCHAR(20) DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly' 
     responsible_role VARCHAR(50), 
     data_source VARCHAR(255), 
     calculation_query TEXT, 
     is_custom BOOLEAN DEFAULT false, 
     is_active BOOLEAN DEFAULT true, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 CREATE TABLE kpi_values ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     kpi_id INT NOT NULL REFERENCES kpi_definitions(id), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     branch_id UUID REFERENCES branches(id), 
     period_date DATE NOT NULL, 
     actual_value DECIMAL(12,4), 
     target_value DECIMAL(12,4), 
     previous_value DECIMAL(12,4), 
     variance_absolute DECIMAL(12,4) GENERATED ALWAYS AS (actual_value - target_value) STORED, 
     variance_percentage DECIMAL(12,4) GENERATED ALWAYS AS 
         CASE WHEN target_value != 0 THEN ((actual_value - target_value) / target_value) * 100 ELSE NULL END STORED, 
     status VARCHAR(20) GENERATED ALWAYS AS 
         CASE 
             WHEN direction = 'up' AND actual_value >= target_value THEN 'good' 
             WHEN direction = 'down' AND actual_value <= target_value THEN 'good' 
             WHEN direction = 'up' AND actual_value < target_value THEN 'bad' 
             WHEN direction = 'down' AND actual_value > target_value THEN 'bad' 
             ELSE 'neutral' 
         END STORED, 
     data_source_metadata JSONB, 
     calculated_by UUID REFERENCES users(id), 
     calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     notes TEXT, 
     UNIQUE(kpi_id, company_id, period_date, branch_id) 
 ); 
 
 CREATE TABLE kpi_alerts ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     kpi_id INT NOT NULL REFERENCES kpi_definitions(id), 
     threshold_type VARCHAR(20), -- 'min', 'max', 'variance' 
     threshold_value DECIMAL(12,4), 
     comparison_operator VARCHAR(5), -- '>', '<', '>=', '<=', '=' 
     severity VARCHAR(20), -- 'info', 'warning', 'critical' 
     is_active BOOLEAN DEFAULT true, 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 CREATE TABLE kpi_alert_history ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     kpi_value_id UUID REFERENCES kpi_values(id), 
     kpi_alert_id UUID REFERENCES kpi_alerts(id), 
     triggered_value DECIMAL(12,4), 
     notified_to UUID REFERENCES users(id), 
     notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     acknowledged_at TIMESTAMP, 
     acknowledged_by UUID REFERENCES users(id) 
 ); 
 
 -- --------------------------------------------- 
 -- 5. TABLAS DE REPORTES Y BACKGROUND JOBS 
 -- --------------------------------------------- 
 
 CREATE TABLE report_templates ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     name VARCHAR(255) NOT NULL, 
     description TEXT, 
     template_html TEXT, 
     template_styles TEXT, 
     logo_position VARCHAR(50) DEFAULT 'top-left', 
     include_header BOOLEAN DEFAULT true, 
     include_footer BOOLEAN DEFAULT true, 
     page_size VARCHAR(20) DEFAULT 'A4', 
     orientation VARCHAR(10) DEFAULT 'portrait', 
     created_by UUID REFERENCES users(id), 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 CREATE TABLE scheduled_reports ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     company_id UUID NOT NULL REFERENCES companies(id), 
     report_template_id UUID REFERENCES report_templates(id), 
     name VARCHAR(255) NOT NULL, 
     description TEXT, 
     kpi_ids INT[] NOT NULL, 
     filters JSONB DEFAULT '{}', 
     recipient_emails TEXT[] NOT NULL, 
     schedule_cron VARCHAR(100) NOT NULL, 
     timezone VARCHAR(50) DEFAULT 'America/Bogota', 
     format VARCHAR(20) DEFAULT 'pdf', 
     include_charts BOOLEAN DEFAULT true, 
     include_tables BOOLEAN DEFAULT true, 
     is_active BOOLEAN DEFAULT true, 
     last_generated_at TIMESTAMP, 
     last_error TEXT, 
     created_by UUID REFERENCES users(id), 
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
 ); 
 
 CREATE TABLE report_history ( 
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
     scheduled_report_id UUID REFERENCES scheduled_reports(id), 
     generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
     file_url TEXT, 
     file_size_bytes INT, 
     recipient_count INT, 
     status VARCHAR(20), -- 'success', 'failed', 'processing' 
     error_message TEXT 
 ); 
 
 -- --------------------------------------------- 
 -- ÍNDICES OPTIMIZADOS 
 -- --------------------------------------------- 
 
 CREATE INDEX idx_kpi_values_lookup ON kpi_values(kpi_id, company_id, period_date, branch_id); 
 CREATE INDEX idx_kpi_values_period ON kpi_values(period_date DESC); 
 CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id, order_date DESC); 
 CREATE INDEX idx_purchase_orders_status ON purchase_orders(status, order_date); 
 CREATE INDEX idx_sales_date ON sales(sale_date DESC); 
 CREATE INDEX idx_sales_customer ON sales(customer_name); 
 CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id, movement_date DESC); 
 CREATE INDEX idx_inventory_movements_warehouse ON inventory_movements(warehouse_id, movement_type); 
 CREATE INDEX idx_dispatches_date ON dispatches(dispatch_date DESC); 
 CREATE INDEX idx_dispatches_status ON dispatches(dispatch_status); 
 CREATE INDEX idx_production_records_machine ON production_records(machine_id, production_date DESC); 
 CREATE INDEX idx_operational_costs_center ON operational_costs(cost_center, cost_date DESC); 
 CREATE INDEX idx_transport_costs_vehicle ON transport_costs(vehicle_id, cost_date DESC); 
 CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC); 
 CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id); 
 CREATE INDEX idx_physical_inventory_date ON physical_inventory(inventory_date DESC, warehouse_id); 
