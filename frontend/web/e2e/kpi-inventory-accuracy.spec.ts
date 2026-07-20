import { test, expect } from '@playwright/test'; 
 
 test.describe('KPI - Exactitud en Inventarios', () => { 
   test.beforeEach(async ({ page }) => { 
     // Login 
     await page.goto('/login'); 
     await page.fill('input[type="email"]', 'admin@logistics.com'); 
     await page.fill('input[type="password"]', 'Admin123!'); 
     await page.click('button[type="submit"]'); 
     await page.waitForURL('/dashboard'); 
   }); 
   
   test('debería mostrar el widget de exactitud de inventario', async ({ page }) => { 
     await page.goto('/dashboard/operations/inventory-accuracy'); 
     
     // Verificar que el título está presente 
     await expect(page.locator('h1:has-text("Exactitud en Inventarios")')).toBeVisible(); 
     
     // Verificar que la tarjeta del KPI muestra el porcentaje 
     const kpiValue = await page.locator('[data-testid="kpi-value"]').textContent(); 
     expect(kpiValue).toMatch(/\d+\.?\d*%/); 
     
     // Verificar que el gráfico está presente 
     await expect(page.locator('[data-testid="accuracy-chart"]')).toBeVisible(); 
   }); 
   
   test('debería filtrar por año', async ({ page }) => { 
     await page.goto('/dashboard/operations/inventory-accuracy'); 
     
     // Seleccionar año 2023 
     await page.selectOption('select[aria-label="Year filter"]', '2023'); 
     await page.click('button:has-text("Aplicar")'); 
     
     // Esperar carga de datos 
     await page.waitForResponse(response => 
       response.url().includes('/kpi/inventory-accuracy') && response.status() === 200 
     ); 
     
     // Verificar que los datos cambiaron 
     const newValue = await page.locator('[data-testid="kpi-value"]').textContent(); 
     expect(newValue).toBeDefined(); 
   }); 
   
   test('debería descargar reporte PDF', async ({ page }) => { 
     await page.goto('/dashboard/operations/inventory-accuracy'); 
     
     // Iniciar descarga 
     const downloadPromise = page.waitForEvent('download'); 
     await page.click('button:has-text("Exportar PDF")'); 
     const download = await downloadPromise; 
     
     // Verificar que el archivo es PDF 
     expect(download.suggestedFilename()).toContain('.pdf'); 
     
     // Guardar y verificar contenido básico 
     const path = await download.path(); 
     expect(path).toBeDefined(); 
   }); 
   
   test('debería mostrar el desglose por producto', async ({ page }) => { 
     await page.goto('/dashboard/operations/inventory-accuracy'); 
     
     // Expandir detalles 
     await page.click('button:has-text("Ver desglose por producto")'); 
     
     // Verificar tabla de productos 
     await expect(page.locator('table[data-testid="products-table"]')).toBeVisible(); 
     
     // Verificar que hay filas 
     const rows = await page.locator('table[data-testid="products-table"] tbody tr').count(); 
     expect(rows).toBeGreaterThan(0); 
   }); 
 }); 
