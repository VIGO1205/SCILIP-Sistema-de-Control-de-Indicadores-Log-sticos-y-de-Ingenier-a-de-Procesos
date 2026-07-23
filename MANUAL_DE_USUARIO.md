# SCILIP - Manual de Usuario

## BI Logistico - Sistema de Control de Indicadores Logisticos y de Ingenieria de Procesos

---

## 1. Acceso al Sistema

### 1.1 CAPTURA DEL LOGIN

**URL:** `http://localhost:3002/login`

- Campo **Correo electronico** (obligatorio)
- Campo **Contrasena** (obligatorio, minimo 6 caracteres)
- Boton **Entrar al Sistema**
- Link **Registrate ahora** (si no tiene cuenta)

> Credenciales demo: `admin@demo.local` / `demo123`

### 1.2 CAPTURA DEL REGISTRO

**URL:** `http://localhost:3002/register`

Pestaña 1 - **Tus Datos:**
- Nombre Completo
- Correo electronico
- Contrasena / Confirmar contrasena
- Telefono (opcional)

Pestaña 2 - **Tu Empresa:**
- Nombre de la Empresa (obligatorio)
- NIT / RUT
- Pais, Ciudad, Direccion
- Telefono de la empresa
- Email de la empresa

> Al registrarse con nombre de empresa, se crea la empresa automaticamente y se asigna el rol ADMIN.

### 1.3 CAPTURA DE VERIFICACION OTP (2FA)

Si el usuario tiene autenticacion de dos factores habilitada:

- Se muestra un campo para ingresar el **codigo de 6 digitos** enviado por email
- Boton **Verificar Codigo**
- Boton **Reenviar Codigo** (con countdown de 60 segundos)

---

## 2. Layout Principal

### 2.1 CAPTURA DEL SIDEBAR

El panel lateral izquierdo contiene la navegacion principal:

| Icono | Menu |
|-------|------|
| LayoutDashboard | Dashboard |
| ShoppingCart | Compras |
| Package | Inventarios |
| Factory | Produccion |
| Truck | Transporte |
| Users | Servicio al Cliente |
| Globe | Comercio Exterior |
| FileText | Reportes |
| Bell | Notificaciones |
| Settings | Configuracion |

- Boton **Colapsar/Expandir** para reducir el sidebar
- Seccion inferior: avatar con iniciales, nombre y rol del usuario

### 2.2 CAPTURA DEL HEADER

Barra superior fija:
- **Buscador** a la izquierda
- **Centro de notificaciones** (campana con contador)
- **Menu del usuario** (dropdown): nombre, email, links a Configuracion y Mi Perfil, boton Cerrar Sesion

---

## 3. Dashboard Principal

### 3.1 CAPTURA DEL DASHBOARD

**URL:** `http://localhost:3002/dashboard`
**Titulo:** Panel de Control BI Logistico

**Filtros superiores:**
- Selector de mes (Ene 2026 - Jun 2026)
- Filtro por clase de indicador: Todas las Clases, Utilizacion, Rendimiento, Productividad

**Secciones:**

1. **Indicadores Principales** - 4 tarjetas KPI con valor, tendencia, sparkline y barra de progreso
2. **Panel de Analisis** - Grafico de donut (Desempeño Global) + Grafico de barras (Cumplimiento por Categoria) + Panel de alertas
3. **Insight IA** - Tarjetas de insight con estadisticas: Optimos, Alerta, Criticos, Sin Meta, Pendientes
4. **Tendencia Mensual** - Grafico de linea con selector de KPI
5. **Catalogo Completo de Indicadores** - Grid de todos los indicadores filtrables

---

## 4. Gestion de Compras

### 4.1 CAPTURA DE LA PAGINA DE COMPRAS

**URL:** `http://localhost:3002/dashboard/purchasing`
**Titulo:** Gestion de Compras
**Botones de accion:** Nueva Orden de Compra

**KPIs superiores:**
- Entregas Perfectas (NOR_DIS_IND_03)
- Calidad de Pedidos (NOR_DIS_IND_02)
- Proveedores Activos
- Ordenes Pendientes

### 4.2 CAPTURA DEL TAB INDICADORES (Compras)

- **Resumen de Ordenes** - Tarjetas de estado: Pendientes, Aprobadas, Recibidas, Completadas, Rechazadas
- **Tabla de Aprobaciones Pendientes** - Ordenes que requieren aprobacion
- **Grafico de Calidad de Pedidos** - Barras de calidad por proveedor

### 4.3 CAPTURA DEL TAB ORDENES DE COMPRA

- Tabla completa de ordenes de compra con columnas: Codigo, Proveedor, Fecha, Estado, Total, Acciones
- Botones de accion por fila: Ver, Editar, Aprobar/Rechazar
- Filtros y busqueda

### 4.4 CAPTURA DEL TAB PROVEEDORES

- **Boton:** Nuevo Proveedor
- Tabla de proveedores: Nombre, Contacto, Email, Telefono, Calificacion, Estado, Acciones

### 4.5 CAPTURA DEL MODAL NUEVA ORDEN DE COMPRA

- Proveedor (select)
- Fecha de entrega requerida (date picker)
- Items de la orden (lista dinamica):
  - Producto (select)
  - Cantidad
  - Precio unitario
- Observaciones
- Botones: Cancelar / Guardar

### 4.6 CAPTURA DEL MODAL NUEVO PROVEEDOR

- Nombre de la empresa
- Persona de contacto
- Email
- Telefono
- Direccion
- Calificacion (1-5)
- Estado (Activo/Inactivo)

---

## 5. Gestion de Inventarios

### 5.1 CAPTURA DE LA PAGINA DE INVENTARIOS

**URL:** `http://localhost:3002/dashboard/inventory`
**Titulo:** Gestion de Inventarios
**Botones de accion:** Auditoria, Nuevo Producto, Nuevo Movimiento

**KPIs superiores:**
- Rotacion de Mercancia (NOR_DIS_IND_05)
- Duracion del Inventario (NOR_DIS_IND_06)
- Exactitud de Inventario (NOR_DIS_IND_09)
- Valor Economico (NOR_DIS_IND_08)

### 5.2 CAPTURA DEL TAB INDICADORES (Inventarios)

- **Resumen de Movimientos** - Tarjetas: Total Productos, Total Movimientos, Entradas, Salidas
- **Grafico de Rotacion de Inventario**

### 5.3 CAPTURA DEL TAB MOVIMIENTOS

- Tabla de movimientos: Fecha, Tipo (Entrada/Salida), Producto, Cantidad, Bodega, Referencia, Acciones

### 5.4 CAPTURA DEL TAB PRODUCTOS

- Tabla de productos: Nombre, SKU, Categoria, Stock Actual, Stock Minimo, Estado, Acciones

### 5.5 CAPTURA DEL TAB AUDITORIAS

- Tabla de auditorias: Fecha, Producto, Conteo Sistematico, Conteo Fisico, Diferencia, Estado, Auditor

### 5.6 CAPTURA DEL MODAL NUEVO PRODUCTO

- Nombre del producto
- SKU
- Categoria (select)
- Bodega (select)
- Stock minimo
- Stock maximo
- Unidad de medida
- Precio unitario

### 5.7 CAPTURA DEL MODAL NUEVO MOVIMIENTO

- Tipo de movimiento (Entrada/Salida/Transferencia)
- Producto (select)
- Cantidad
- Bodega origen (select)
- Bodega destino (select, si es transferencia)
- Referencia
- Observaciones

### 5.8 CAPTURA DEL MODAL AUDITORIA

- Producto (select)
- Conteo fisico
- Observaciones

---

## 6. Produccion e Ingenieria

### 6.1 CAPTURA DE LA PAGINA DE PRODUCCION

**URL:** `http://localhost:3002/dashboard/admin`
**Titulo:** Produccion e Ingenieria
**Botones de accion:** Nueva Maquina, Registrar Produccion

**KPIs superiores:**
- Utilizacion de Capacidad (NOR_DIS_IND_26)
- Rendimiento de Maquinas (NOR_DIS_IND_27)
- Tasa de Calidad
- OEE Estimado

**Filtro:** Selector de maquina individual

### 6.2 CAPTURA DEL TAB LINEAS DE PRODUCCION

- **Resumen de Estado de Maquinas** - Tarjetas: Total Maquinas, Operativas, Mantenimiento, Averias
- Tarjetas de maquinas con: nombre, codigo, tipo, marca, modelo, estado, carga %, capacidad, eficiencia %
- **Grafico de Rendimiento de Maquinas** - Barras duales: Eficiencia % + Capacidad Max

### 6.3 CAPTURA DEL TAB REGISTROS

- Tabla de registros de produccion: Fecha, Maquina, Turno, Unidades Producidas, Unidades Defectuosas, Estado

### 6.4 CAPTURA DEL TAB MAQUINAS

- Tabla de maquinas: Nombre, Codigo, Tipo, Marca, Modelo, Estado, Capacidad, Acciones

### 6.5 CAPTURA DEL TAB MANTENIMIENTO

- **Boton:** Nueva Orden de Mantenimiento
- Tabla de ordenes de mantenimiento: Maquina, Tipo, Fecha Programada, Estado, Tecnico
- **Calendario de Mantenimiento** - Tabla: Maquina, Ultimo Mantenimiento, Proximo Mantenimiento, Estado
- **Alertas de Operacion**

### 6.6 CAPTURA DEL MODAL NUEVA MAQUINA

- Nombre de la maquina
- Codigo
- Tipo (select)
- Marca
- Modelo
- Capacidad maxima
- Estado (Operativa/Mantenimiento/Averiada)

### 6.7 CAPTURA DEL MODAL REGISTRAR PRODUCCION

- Maquina (select)
- Turno (select)
- Fecha
- Unidades producidas
- Unidades defectuosas
- Observaciones

### 6.8 CAPTURA DEL MODAL NUEVA ORDEN DE MANTENIMIENTO

- Maquina (select)
- Tipo de mantenimiento (Preventivo/Correctivo)
- Fecha programada
- Tecnico asignado
- Descripcion del trabajo

---

## 7. Gestion de Transporte

### 7.1 CAPTURA DE LA PAGINA DE TRANSPORTE

**URL:** `http://localhost:3002/dashboard/transport`
**Titulo:** Gestion de Transporte
**Botones de accion:** Nuevo Conductor, Nuevo Vehiculo, Registrar Gasto

**KPIs superiores:**
- Transporte vs Ventas (NOR_DIS_IND_16)
- Costo por Conductor (NOR_DIS_IND_17)
- Comparativo de Transporte (NOR_DIS_IND_18)
- Gasto Total del Ano

### 7.2 CAPTURA DEL TAB FLOTA

- **Resumen de Flota** - Tarjetas: Total Vehiculos, Activos, Mantenimiento, Conductores
- Tarjetas de vehiculos con: placa, marca, modelo, anio, tipo, combustible, peso maximo, volumen maximo
- **Tabla de Vehiculos**

### 7.3 CAPTURA DEL TAB COSTOS

- **Resumen de Costos** - Tarjetas: Gasto Total, Combustible, Registros, Vehiculos Activos
- **Tabla de Costos de Transporte**

### 7.4 CAPTURA DEL TAB CONDUCTORES

- **Boton:** Nuevo Conductor
- **Tabla de Conductores**

### 7.5 CAPTURA DEL TAB ANALISIS

- **Grafico de Costos por Tipo** - Barras: Combustible, Mantenimiento, Peajes, Salarios, Seguros, Otros
- **Grafico de Transporte vs Ventas** - Linea mensual (NOR_DIS_IND_16)
- **Alertas de Transporte**

### 7.6 CAPTURA DEL MODAL NUEVO VEHICULO

- Placa
- Marca
- Modelo
- Anio
- Tipo de vehiculo (select)
- Tipo de combustible (select)
- Peso maximo (kg)
- Volumen maximo (m3)
- Eficiencia de combustible
- Vehiculo propio (si/no)

### 7.7 CAPTURA DEL MODAL NUEVO CONDUCTOR

- Nombre completo
- Numero de licencia
- Telefono
- Email
- Vehiculo asignado (select)
- Estado (Activo/Inactivo)

### 7.8 CAPTURA DEL MODAL REGISTRAR GASTO

- Vehiculo (select)
- Tipo de gasto (Combustible/Mantenimiento/Peajes/Seguros/Otros)
- Monto
- Fecha
- Descripcion
- Comprobante (opcional)

---

## 8. Servicio al Cliente

### 8.1 CAPTURA DE LA PAGINA DE SERVICIO AL CLIENTE

**URL:** `http://localhost:3002/dashboard/customer-service`
**Titulo:** Servicio al Cliente
**Boton de accion:** Nuevo Despacho

**KPIs superiores:**
- Entregas Perfectas (NOR_DIS_IND_19)
- Entregas a Tiempo (NOR_DIS_IND_20)
- Pedidos Completos (NOR_DIS_IND_21)
- Documentacion OK (NOR_DIS_IND_22)

### 8.2 CAPTURA DEL TAB DESPACHOS

- **Resumen de Despachos** - Tarjetas: Total Despachos, Entregados, En Camino, Pendientes
- **Tabla de Despachos**

### 8.3 CAPTURA DEL TAB ENTREGAS

- **Grafico de Composicion de Despachos** (donut)
- **Detalle de Calidad de Entregas** - Tarjetas: A Tiempo, Completos, Documentacion OK
- **Alertas de Entregas** - Alertas condicionales segun porcentajes

### 8.4 CAPTURA DEL TAB ANALISIS

- **Grafico de Despachos Mensuales** - Barras apiladas: Entregados, En Camino, Pendientes, Cancelados

### 8.5 CAPTURA DEL MODAL NUEVO DESPACHO

- Cliente/Orden de compra
- Fecha de despacho
- Fecha de entrega estimada
- Direccion de entrega
- Productos (lista)
- Transporte asignado (select)
- Observaciones

---

## 9. Comercio Exterior

### 9.1 CAPTURA DE LA PAGINA DE COMERCIO EXTERIOR

**URL:** `http://localhost:3002/dashboard/international`
**Titulo:** Comercio Exterior
**Boton de accion:** Registrar Operacion

**KPIs superiores:**
- Costo Unitario Importacion (NOR_DIS_IND_28)
- Costo Unitario Exportacion
- Total Importaciones (USD)
- Total Exportaciones (USD)

### 9.2 CAPTURA DEL TAB IMPORTACIONES

- **Resumen de Importaciones** - Tarjetas: Total, En Transito, En Aduana, Entregadas
- **Tabla de Operaciones de Importacion**

### 9.3 CAPTURA DEL TAB EXPORTACIONES

- **Resumen de Exportaciones** - Tarjetas: Total, En Transito, En Aduana, Entregadas
- **Tabla de Operaciones de Exportacion**

### 9.4 CAPTURA DEL TAB ANALISIS

- **Grafico de Importaciones vs Exportaciones Mensuales** (barras)
- **Grafico de Composicion de Operaciones** (donut)
- **Resumen de Costos** - Tarjetas con barra de progreso: Costo Total Importaciones, Costo Total Exportaciones

### 9.5 CAPTURA DEL MODAL REGISTRAR OPERACION

- Tipo (Importacion/Exportacion)
- Numero de operacion
- Producto
- País de origen/destino (select)
- Incoterm (DDP/EXW/FOB/CIF)
- Peso (kg)
- Volumen (m3)
- Valor FOB (USD)
- Costos adicionales (USD)
- Fecha de embarque
- Fecha estimada de llegada
- Estado (En Transito/En Aduana/Entregada)

---

## 10. Reportes

### 10.1 CAPTURA DE LA PAGINA DE REPORTES

**URL:** `http://localhost:3002/reports`
**Titulo:** Reportes Logisticos

**KPIs superiores:**
- Reportes Disponibles (Categorias)
- Con formato PDF (Reportes)
- Con formato Excel (Reportes)
- Generados Este Ano (En historial)

### 10.2 CAPTURA DEL TAB REPORTES DISPONIBLES

- **Resumen de Reportes** - Tarjetas: Total, PDF, Excel, Generados
- **Grid de Reportes** - Tarjetas de reporte con: nombre, descripcion, categoria, formatos disponibles, botones de descarga PDF/Excel

**Reportes disponibles:**
- Resumen de KPIs
- Reporte de Transporte
- Reporte de Comercio Exterior
- Reporte de Ordenes de Compra

### 10.3 CAPTURA DEL TAB HISTORIAL

- Tabla de historial: Fecha, Reporte, Formato, Paginas, Usuario, Acciones (Descargar/Eliminar)

---

## 11. Notificaciones

### 11.1 CAPTURA DE LA PAGINA DE NOTIFICACIONES

**URL:** `http://localhost:3002/notifications`
**Titulo:** Notificaciones
**Boton:** Marcar todas leidas

**Tipos de notificacion:**
- Alerta KPI (naranja)
- Orden de Compra (azul)
- Inventario (verde)
- Reporte (morado)
- Sistema (gris)

**Cada notificacion muestra:**
- Icono y tipo
- Titulo (negrita si no leida)
- Mensaje
- Timestamp relativo ("hace X min", "hace Xh")
- Botones: Marcar como leida, Eliminar

**Paginacion:** Anterior / Pagina X de Y / Siguiente

---

## 12. Configuracion del Sistema

### 12.1 CAPTURA DE LA PAGINA DE CONFIGURACION

**URL:** `http://localhost:3002/settings`
**Titulo:** Configuracion del Sistema

### 12.2 CAPTURA DEL TAB PERFIL

- **Informacion Personal** - Campos:
  - Nombre Completo
  - Correo electronico (Login) - solo lectura
  - Correo para Notificaciones
  - Cargo / Rol - solo lectura
  - Telefono
- Boton: **Guardar Cambios**

### 12.3 CAPTURA DEL TAB EMPRESA

- **CompanySettings** - Informacion de la empresa
- **BranchManager** - Gestion de sucursales (crear, editar, eliminar)

### 12.4 CAPTURA DEL TAB NOTIFICACIONES

- **Preferencias de Alerta** - Toggles:
  - Alertas de KPIs Criticos
  - Reportes Semanales
  - Aprobaciones Pendientes
  - Cambios de Inventario
  - Notificaciones por Email
- Boton: **Guardar Preferencias**

### 12.5 CAPTURA DEL TAB SEGURIDAD

- **Cambiar Contrasena** - Campos:
  - Contrasena actual
  - Nueva contrasena
  - Confirmar nueva contrasena
- Boton: **Cambiar Contrasena**
- **Autenticacion de Dos Factores (2FA)** - Toggle para habilitar/deshabilitar

### 12.6 CAPTURA DEL TAB SISTEMA

- **Parametros del Sistema** - Info: Version, Base de Datos, Ultimo Reinicio
- **Mantenimiento** - Botones: Limpiar Cache, Verificar Estado

---

## 13. Roles y Permisos

| Rol | Permisos |
|-----|----------|
| ADMIN / SUPER_ADMIN | Acceso total a todos los modulos |
| PURCHASING_MANAGER | Compras, Proveedores, Productos (lectura) |
| WAREHOUSE_MANAGER | Almacenamiento, Movimientos, Despachos, Auditorias |
| OPERATIONS_MANAGER | Produccion, Maquinas |
| USER | Solo lectura |

---

## 14. Indicadores KPI (Nomenclatura)

| Codigo | Indicador | Modulo |
|--------|-----------|--------|
| NOR_DIS_IND_01 | Cumplimiento de Tiempo de Entrega | Compras |
| NOR_DIS_IND_02 | Calidad de Pedidos | Compras |
| NOR_DIS_IND_03 | Entregas Perfectas | Compras / Servicio al Cliente |
| NOR_DIS_IND_05 | Rotacion de Mercancia | Inventarios |
| NOR_DIS_IND_06 | Duracion del Inventario | Inventarios |
| NOR_DIS_IND_08 | Valor Economico / Rotacion | Inventarios |
| NOR_DIS_IND_09 | Exactitud de Inventario | Inventarios |
| NOR_DIS_IND_11 | Exactitud del Inventario | Inventarios |
| NOR_DIS_IND_12 | Costo por Unidad Almacenada | Almacenamiento |
| NOR_DIS_IND_13 | Costo por Metro Cuadrado | Almacenamiento |
| NOR_DIS_IND_14 | Unidades por Empleado | Almacenamiento |
| NOR_DIS_IND_16 | Transporte vs Ventas | Transporte |
| NOR_DIS_IND_17 | Costo por Conductor | Transporte |
| NOR_DIS_IND_18 | Comparativo de Transporte | Transporte |
| NOR_DIS_IND_19 | Entregas Perfectas (SC) | Servicio al Cliente |
| NOR_DIS_IND_20 | Entregas a Tiempo | Servicio al Cliente |
| NOR_DIS_IND_21 | Pedidos Completos | Servicio al Cliente |
| NOR_DIS_IND_22 | Documentacion OK | Servicio al Cliente |
| NOR_DIS_IND_26 | Utilizacion de Capacidad | Produccion |
| NOR_DIS_IND_27 | Rendimiento de Maquinas | Produccion |
| NOR_DIS_IND_28 | Costo Unitario Importacion/Exportacion | Comercio Exterior |

---

*Manual generado para SCILIP v1.2.0 - BI Logistico*
