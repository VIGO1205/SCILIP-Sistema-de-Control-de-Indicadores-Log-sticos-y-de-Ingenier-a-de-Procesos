# SCILIP - Manual de Usuario

## BI Logistico - Sistema de Control de Indicadores Logisticos y de Ingenieria de Procesos

---

## 1. Acceso al Sistema

### 1.1 Inicio de Sesion

Desde esta pantalla el usuario puede ingresar sus credenciales para acceder al sistema. Cuenta con campos de correo electronico y contrasena, asi como un enlace para registrarse si aun no tiene cuenta.

**URL:** `http://localhost:3002/login`

- Campo **Correo electronico** (obligatorio)
- Campo **Contrasena** (obligatorio, minimo 6 caracteres)
- Boton **Entrar al Sistema**
- Link **Registrate ahora** (si no tiene cuenta)

> Credenciales demo: `admin@demo.local` / `demo123`

<!-- CAPTURA AQUI DEL LOGIN -->


### 1.2 Registro de Usuario

Permite a un nuevo usuario crear su cuenta y, opcionalmente, registrar la empresa a la que pertenece. El registro se realiza en un solo paso con dos pestañas.

**URL:** `http://localhost:3002/register`

**Pestaña 1 - Tus Datos:**
- Nombre Completo
- Correo electronico
- Contrasena / Confirmar contrasena
- Telefono (opcional)

**Pestaña 2 - Tu Empresa:**
- Nombre de la Empresa (obligatorio)
- NIT / RUT
- Pais, Ciudad, Direccion
- Telefono de la empresa
- Email de la empresa

> Al registrarse con nombre de empresa, se crea la empresa automaticamente y se asigna el rol ADMIN.

<!-- CAPTURA AQUI DEL REGISTRO -->


### 1.3 Verificacion por Codigo OTP (2FA)

Si el usuario tiene autenticacion de dos factores habilitada, se le solicitara el codigo de verificacion de 6 digitos enviado a su correo electronico. Cuenta con un boton para reenviar el codigo en caso de no haberlo recibido.

- Campo para ingresar el **codigo de 6 digitos**
- Boton **Verificar Codigo**
- Boton **Reenviar Codigo** (con countdown de 60 segundos)

<!-- CAPTURA AQUI DEL OTP -->

---

## 2. Layout Principal

### 2.1 Barra Lateral de Navegacion (Sidebar)

Panel izquierdo fijo que contiene el menu principal de navegacion. Se puede colapsar o expandir con el boton superior. En la parte inferior muestra el avatar, nombre y rol del usuario actual.

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

<!-- CAPTURA AQUI DEL SIDEBAR -->


### 2.2 Barra Superior (Header)

Barra fija en la parte superior que contiene el buscador general, el centro de notificaciones con contador y el menu desplegable del usuario con acceso a Configuracion, Mi Perfil y Cerrar Sesion.

- **Buscador** a la izquierda
- **Centro de notificaciones** (campana con contador de no leidas)
- **Menu del usuario** (dropdown): nombre, email, links a Configuracion y Mi Perfil, boton Cerrar Sesion

<!-- CAPTURA AQUI DEL HEADER -->

---

## 3. Panel de Control (Dashboard)

### 3.1 Vista Principal del Dashboard

Pagina principal que muestra un resumen consolidado de todos los indicadores de gestion logistica. Permite filtrar por mes y por clase de indicador. Incluye graficos de donut, barras, tendencias y un catalogo completo de KPIs.

**URL:** `http://localhost:3002/dashboard`

**Filtros superiores:**
- Selector de mes (Ene 2026 - Jun 2026)
- Filtro por clase de indicador: Todas las Clases, Utilizacion, Rendimiento, Productividad

**Secciones:**
1. **Indicadores Principales** - 4 tarjetas KPI con valor, tendencia, sparkline y barra de progreso
2. **Panel de Analisis** - Grafico de donut (Desempeño Global) + Grafico de barras (Cumplimiento por Categoria) + Panel de alertas
3. **Insight IA** - Tarjetas de insight con estadisticas: Optimos, Alerta, Criticos, Sin Meta, Pendientes
4. **Tendencia Mensual** - Grafico de linea con selector de KPI
5. **Catalogo Completo de Indicadores** - Grid de todos los indicadores filtrables

<!-- CAPTURA AQUI DEL DASHBOARD -->

---

## 4. Gestion de Compras

### 4.1 Pagina de Compras

Modulo para el control de suministros, proveedores e indicadores de abastecimiento. Permite crear y gestionar ordenes de compra, administrar proveedores y monitorear indicadores clave como calidad de pedidos y entregas perfectas.

**URL:** `http://localhost:3002/dashboard/purchasing`

**KPIs superiores:**
- Entregas Perfectas (NOR_DIS_IND_03)
- Calidad de Pedidos (NOR_DIS_IND_02)
- Proveedores Activos
- Ordenes Pendientes

**Botones de accion:** Nueva Orden de Compra

<!-- CAPTURA AQUI DE LA PAGINA DE COMPRAS -->


### 4.2 Tab de Indicadores

Muestra un resumen visual del estado de las ordenes de compra con tarjetas de colores, una tabla de aprobaciones pendientes y un grafico de barras con la calidad de pedidos por proveedor.

- **Resumen de Ordenes** - Tarjetas de estado: Pendientes, Aprobadas, Recibidas, Completadas, Rechazadas
- **Tabla de Aprobaciones Pendientes** - Ordenes que requieren aprobacion
- **Grafico de Calidad de Pedidos** - Barras de calidad por proveedor

<!-- CAPTURA AQUI DEL TAB INDICADORES DE COMPRAS -->


### 4.3 Tab de Ordenes de Compra

Tabla completa con todas las ordenes de compra registradas. Permite buscar, filtrar y realizar acciones como ver detalles, editar o aprobar/rechazar cada orden.

- Columnas: Codigo, Proveedor, Fecha, Estado, Total, Acciones
- Botones de accion por fila: Ver, Editar, Aprobar/Rechazar

<!-- CAPTURA AQUI DEL TAB ORDENES DE COMPRA -->


### 4.4 Tab de Proveedores

Administracion del directorio de proveedores. Permite crear nuevos proveedores, editar la informacion existente y calificar el desempeño de cada uno.

- **Boton:** Nuevo Proveedor
- Tabla de proveedores: Nombre, Contacto, Email, Telefono, Calificacion, Estado, Acciones

<!-- CAPTURA AQUI DEL TAB PROVEEDORES -->


### 4.5 Modal: Nueva Orden de Compra

Formulario para crear una nueva orden de compra. Permite seleccionar el proveedor, establecer fecha de entrega y agregar una lista dinamica de productos con cantidades y precios.

- Proveedor (select)
- Fecha de entrega requerida (date picker)
- Items de la orden (lista dinamica):
  - Producto (select)
  - Cantidad
  - Precio unitario
- Observaciones
- Botones: Cancelar / Guardar

<!-- CAPTURA AQUI DEL MODAL NUEVA ORDEN DE COMPRA -->


### 4.6 Modal: Nuevo Proveedor

Formulario para registrar un nuevo proveedor en el sistema con toda su informacion de contacto y datos comerciales.

- Nombre de la empresa
- Persona de contacto
- Email
- Telefono
- Direccion
- Calificacion (1-5)
- Estado (Activo/Inactivo)

<!-- CAPTURA AQUI DEL MODAL NUEVO PROVEEDOR -->

---

## 5. Gestion de Inventarios

### 5.1 Pagina de Inventarios

Modulo para el control de existencias, movimientos de stock y auditoria de inventario. Permite registrar productos, controlar entradas y salidas, y realizar conteos fisicos.

**URL:** `http://localhost:3002/dashboard/inventory`

**KPIs superiores:**
- Rotacion de Mercancia (NOR_DIS_IND_05)
- Duracion del Inventario (NOR_DIS_IND_06)
- Exactitud de Inventario (NOR_DIS_IND_09)
- Valor Economico (NOR_DIS_IND_08)

**Botones de accion:** Auditoria, Nuevo Producto, Nuevo Movimiento

<!-- CAPTURA AQUI DE LA PAGINA DE INVENTARIOS -->


### 5.2 Tab de Indicadores

Resumen visual de los movimientos de inventario con tarjetas de estadisticas y grafico de rotacion.

- **Resumen de Movimientos** - Tarjetas: Total Productos, Total Movimientos, Entradas, Salidas
- **Grafico de Rotacion de Inventario**

<!-- CAPTURA AQUI DEL TAB INDICADORES DE INVENTARIOS -->


### 5.3 Tab de Movimientos

Historial completo de todos los movimientos de entrada, salida y transferencia de productos entre bodegas.

- Tabla de movimientos: Fecha, Tipo (Entrada/Salida), Producto, Cantidad, Bodega, Referencia, Acciones

<!-- CAPTURA AQUI DEL TAB MOVIMIENTOS -->


### 5.4 Tab de Productos

Directorio de todos los productos registrados en el sistema con su informacion de stock, categoria y estado.

- Tabla de productos: Nombre, SKU, Categoria, Stock Actual, Stock Minimo, Estado, Acciones

<!-- CAPTURA AQUI DEL TAB PRODUCTOS -->


### 5.5 Tab de Auditorias

Registro de todos los conteos fisicos realizados. Muestra las diferencias entre el conteo sistematico y el fisico para cada producto auditado.

- Tabla de auditorias: Fecha, Producto, Conteo Sistematico, Conteo Fisico, Diferencia, Estado, Auditor

<!-- CAPTURA AQUI DEL TAB AUDITORIAS -->


### 5.6 Modal: Nuevo Producto

Formulario para registrar un nuevo producto con toda su informacion: nombre, SKU, categoria, bodega, rangos de stock y precio.

- Nombre del producto
- SKU
- Categoria (select)
- Bodega (select)
- Stock minimo
- Stock maximo
- Unidad de medida
- Precio unitario

<!-- CAPTURA AQUI DEL MODAL NUEVO PRODUCTO -->


### 5.7 Modal: Nuevo Movimiento

Formulario para registrar un movimiento de inventario. Permite seleccionar entre entrada, salida o transferencia de productos entre bodegas.

- Tipo de movimiento (Entrada/Salida/Transferencia)
- Producto (select)
- Cantidad
- Bodega origen (select)
- Bodega destino (select, si es transferencia)
- Referencia
- Observaciones

<!-- CAPTURA AQUI DEL MODAL NUEVO MOVIMIENTO -->


### 5.8 Modal: Auditoria de Inventario

Formulario para registrar un conteo fisico de un producto. Permite comparar el conteo del sistema con el conteo fisico real.

- Producto (select)
- Conteo fisico
- Observaciones

<!-- CAPTURA AQUI DEL MODAL AUDITORIA -->

---

## 6. Produccion e Ingenieria

### 6.1 Pagina de Produccion

Modulo para el monitoreo de eficiencia de planta, estado de maquinas, registros de produccion y ordenes de mantenimiento. Incluye filtros por maquina individual.

**URL:** `http://localhost:3002/dashboard/admin`

**KPIs superiores:**
- Utilizacion de Capacidad (NOR_DIS_IND_26)
- Rendimiento de Maquinas (NOR_DIS_IND_27)
- Tasa de Calidad
- OEE Estimado

**Filtro:** Selector de maquina individual

**Botones de accion:** Nueva Maquina, Registrar Produccion

<!-- CAPTURA AQUI DE LA PAGINA DE PRODUCCION -->


### 6.2 Tab de Lineas de Produccion

Vista visual del estado de todas las maquinas con tarjetas de resumen y un grafico de rendimiento. Muestra la eficiencia y capacidad de cada maquina.

- **Resumen de Estado de Maquinas** - Tarjetas: Total Maquinas, Operativas, Mantenimiento, Averias
- Tarjetas de maquinas con: nombre, codigo, tipo, marca, modelo, estado, carga %, capacidad, eficiencia %
- **Grafico de Rendimiento de Maquinas** - Barras duales: Eficiencia % + Capacidad Max

<!-- CAPTURA AQUI DEL TAB LINEAS DE PRODUCCION -->


### 6.3 Tab de Registros

Historial de todos los registros de produccion. Cada registro indica la maquina, turno, unidades producidas, defectuosas y el estado de la jornada.

- Tabla de registros de produccion: Fecha, Maquina, Turno, Unidades Producidas, Unidades Defectuosas, Estado

<!-- CAPTURA AQUI DEL TAB REGISTROS DE PRODUCCION -->


### 6.4 Tab de Maquinas

Directorio completo de todas las maquinas registradas con su informacion tecnica y estado actual.

- Tabla de maquinas: Nombre, Codigo, Tipo, Marca, Modelo, Estado, Capacidad, Acciones

<!-- CAPTURA AQUI DEL TAB MAQUINAS -->


### 6.5 Tab de Mantenimiento

Gestion de ordenes de mantenimiento preventivo y correctivo. Incluye un calendario de mantenimientos programados y alertas de operacion.

- **Boton:** Nueva Orden de Mantenimiento
- Tabla de ordenes de mantenimiento: Maquina, Tipo, Fecha Programada, Estado, Tecnico
- **Calendario de Mantenimiento** - Tabla: Maquina, Ultimo Mantenimiento, Proximo Mantenimiento, Estado
- **Alertas de Operacion**

<!-- CAPTURA AQUI DEL TAB MANTENIMIENTO -->


### 6.6 Modal: Nueva Maquina

Formulario para registrar una nueva maquina con su informacion tecnica y estado inicial.

- Nombre de la maquina
- Codigo
- Tipo (select)
- Marca
- Modelo
- Capacidad maxima
- Estado (Operativa/Mantenimiento/Averiada)

<!-- CAPTURA AQUI DEL MODAL NUEVA MAQUINA -->


### 6.7 Modal: Registrar Produccion

Formulario para registrar una jornada de produccion con los datos de la maquina, turno y unidades producidas.

- Maquina (select)
- Turno (select)
- Fecha
- Unidades producidas
- Unidades defectuosas
- Observaciones

<!-- CAPTURA AQUI DEL MODAL REGISTRAR PRODUCCION -->


### 6.8 Modal: Nueva Orden de Mantenimiento

Formulario para programar un mantenimiento preventivo o correctivo en una maquina especifica.

- Maquina (select)
- Tipo de mantenimiento (Preventivo/Correctivo)
- Fecha programada
- Tecnico asignado
- Descripcion del trabajo

<!-- CAPTURA AQUI DEL MODAL NUEVA ORDEN DE MANTENIMIENTO -->

---

## 7. Gestion de Transporte

### 7.1 Pagina de Transporte

Modulo para el monitoreo de flota vehicular, costos de distribucion, conductores y eficiencia de rutas. Permite registrar gastos por vehiculo y analizar costos por tipo.

**URL:** `http://localhost:3002/dashboard/transport`

**KPIs superiores:**
- Transporte vs Ventas (NOR_DIS_IND_16)
- Costo por Conductor (NOR_DIS_IND_17)
- Comparativo de Transporte (NOR_DIS_IND_18)
- Gasto Total del Ano

**Botones de accion:** Nuevo Conductor, Nuevo Vehiculo, Registrar Gasto

<!-- CAPTURA AQUI DE LA PAGINA DE TRANSPORTE -->


### 7.2 Tab de Flota

Resumen visual de todos los vehiculos registrados con su estado actual. Muestra tarjetas individuales de cada vehiculo con sus especificaciones tecnicas.

- **Resumen de Flota** - Tarjetas: Total Vehiculos, Activos, Mantenimiento, Conductores
- Tarjetas de vehiculos con: placa, marca, modelo, anio, tipo, combustible, peso maximo, volumen maximo
- **Tabla de Vehiculos**

<!-- CAPTURA AQUI DEL TAB FLOTA -->


### 7.3 Tab de Costos

Historial de costos operativos de transporte. Permite visualizar el desglose de gastos por vehiculo y tipo de costo.

- **Resumen de Costos** - Tarjetas: Gasto Total, Combustible, Registros, Vehiculos Activos
- **Tabla de Costos de Transporte**

<!-- CAPTURA AQUI DEL TAB COSTOS DE TRANSPORTE -->


### 7.4 Tab de Conductores

Directorio de todos los conductores registrados con su informacion de contacto y vehiculo asignado.

- **Boton:** Nuevo Conductor
- **Tabla de Conductores**

<!-- CAPTURA AQUI DEL TAB CONDUCTORES -->


### 7.5 Tab de Analisis

Graficos comparativos de costos por tipo y la relacion entre gastos de transporte y ventas mensuales. Incluye alertas de transportes pendientes.

- **Grafico de Costos por Tipo** - Barras: Combustible, Mantenimiento, Peajes, Salarios, Seguros, Otros
- **Grafico de Transporte vs Ventas** - Linea mensual (NOR_DIS_IND_16)
- **Alertas de Transporte**

<!-- CAPTURA AQUI DEL TAB ANALISIS DE TRANSPORTE -->


### 7.6 Modal: Nuevo Vehiculo

Formulario para registrar un nuevo vehiculo con sus especificaciones tecnicas, capacidad y tipo de combustible.

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

<!-- CAPTURA AQUI DEL MODAL NUEVO VEHICULO -->


### 7.7 Modal: Nuevo Conductor

Formulario para registrar un nuevo conductor con su informacion personal, licencia y vehiculo asignado.

- Nombre completo
- Numero de licencia
- Telefono
- Email
- Vehiculo asignado (select)
- Estado (Activo/Inactivo)

<!-- CAPTURA AQUI DEL MODAL NUEVO CONDUCTOR -->


### 7.8 Modal: Registrar Gasto de Transporte

Formulario para registrar un gasto operativo de transporte asociado a un vehiculo especifico.

- Vehiculo (select)
- Tipo de gasto (Combustible/Mantenimiento/Peajes/Seguros/Otros)
- Monto
- Fecha
- Descripcion
- Comprobante (opcional)

<!-- CAPTURA AQUI DEL MODAL REGISTRAR GASTO -->

---

## 8. Servicio al Cliente

### 8.1 Pagina de Servicio al Cliente

Modulo para la gestion de despachos, seguimiento de entregas y medicion de la calidad del servicio al cliente. Permite registrar despachos y monitorear indicadores de satisfaccion.

**URL:** `http://localhost:3002/dashboard/customer-service`

**KPIs superiores:**
- Entregas Perfectas (NOR_DIS_IND_19)
- Entregas a Tiempo (NOR_DIS_IND_20)
- Pedidos Completos (NOR_DIS_IND_21)
- Documentacion OK (NOR_DIS_IND_22)

**Boton de accion:** Nuevo Despacho

<!-- CAPTURA AQUI DE LA PAGINA DE SERVICIO AL CLIENTE -->


### 8.2 Tab de Despachos

Gestion y seguimiento de todos los despachos. Muestra el resumen por estado y la tabla detallada de cada despacho registrado.

- **Resumen de Despachos** - Tarjetas: Total Despachos, Entregados, En Camino, Pendientes
- **Tabla de Despachos**

<!-- CAPTURA AQUI DEL TAB DESPACHOS -->


### 8.3 Tab de Entregas

Analisis de la calidad de las entregas realizadas. Incluye grafico de composicion, tarjetas de calidad por dimension y alertas condicionales.

- **Grafico de Composicion de Despachos** (donut)
- **Detalle de Calidad de Entregas** - Tarjetas: A Tiempo, Completos, Documentacion OK
- **Alertas de Entregas** - Alertas condicionales segun porcentajes

<!-- CAPTURA AQUI DEL TAB ENTREGAS -->


### 8.4 Tab de Analisis

Grafico de barras apiladas que muestra la evolucion mensual de despachos por estado: entregados, en camino, pendientes y cancelados.

- **Grafico de Despachos Mensuales** - Barras apiladas: Entregados, En Camino, Pendientes, Cancelados

<!-- CAPTURA AQUI DEL TAB ANALISIS DE SERVICIO AL CLIENTE -->


### 8.5 Modal: Nuevo Despacho

Formulario para registrar un nuevo despacho con los datos del cliente, productos, transporte y fechas estimadas.

- Cliente/Orden de compra
- Fecha de despacho
- Fecha de entrega estimada
- Direccion de entrega
- Productos (lista)
- Transporte asignado (select)
- Observaciones

<!-- CAPTURA AQUI DEL MODAL NUEVO DESPACHO -->

---

## 9. Comercio Exterior

### 9.1 Pagina de Comercio Exterior

Modulo para la gestion de operaciones de importacion y exportacion. Permite registrar operaciones internacionales, controlar costos DDP/EXW y monitorear el estado de cada operacion.

**URL:** `http://localhost:3002/dashboard/international`

**KPIs superiores:**
- Costo Unitario Importacion (NOR_DIS_IND_28)
- Costo Unitario Exportacion
- Total Importaciones (USD)
- Total Exportaciones (USD)

**Boton de accion:** Registrar Operacion

<!-- CAPTURA AQUI DE LA PAGINA DE COMERCIO EXTERIOR -->


### 9.2 Tab de Importaciones

Resumen y tabla de todas las operaciones de importacion. Muestra el estado de cada operacion: en transito, en aduana o entregada.

- **Resumen de Importaciones** - Tarjetas: Total, En Transito, En Aduana, Entregadas
- **Tabla de Operaciones de Importacion**

<!-- CAPTURA AQUI DEL TAB IMPORTACIONES -->


### 9.3 Tab de Exportaciones

Resumen y tabla de todas las operaciones de exportacion con el mismo formato que importaciones.

- **Resumen de Exportaciones** - Tarjetas: Total, En Transito, En Aduana, Entregadas
- **Tabla de Operaciones de Exportacion**

<!-- CAPTURA AQUI DEL TAB EXPORTACIONES -->


### 9.4 Tab de Analisis

Graficos comparativos de importaciones vs exportaciones, composicion de operaciones y resumen de costos totales por tipo.

- **Grafico de Importaciones vs Exportaciones Mensuales** (barras)
- **Grafico de Composicion de Operaciones** (donut)
- **Resumen de Costos** - Tarjetas con barra de progreso: Costo Total Importaciones, Costo Total Exportaciones

<!-- CAPTURA AQUI DEL TAB ANALISIS DE COMERCIO EXTERIOR -->


### 9.5 Modal: Registrar Operacion

Formulario para registrar una operacion de importacion o exportacion con toda la informacion logistica y comercial.

- Tipo (Importacion/Exportacion)
- Numero de operacion
- Producto
- Pais de origen/destino (select)
- Incoterm (DDP/EXW/FOB/CIF)
- Peso (kg)
- Volumen (m3)
- Valor FOB (USD)
- Costos adicionales (USD)
- Fecha de embarque
- Fecha estimada de llegada
- Estado (En Transito/En Aduana/Entregada)

<!-- CAPTURA AQUI DEL MODAL REGISTRAR OPERACION -->

---

## 10. Reportes

### 10.1 Pagina de Reportes

Modulo para la generacion y descarga de informes logisticos en formato PDF y Excel. Incluye un historial de reportes generados previamente.

**URL:** `http://localhost:3002/reports`

**KPIs superiores:**
- Reportes Disponibles (Categorias)
- Con formato PDF (Reportes)
- Con formato Excel (Reportes)
- Generados Este Ano (En historial)

<!-- CAPTURA AQUI DE LA PAGINA DE REPORTES -->


### 10.2 Tab de Reportes Disponibles

Grid visual con todos los reportes disponibles para descarga. Cada tarjeta muestra el nombre, descripcion, categoria y formatos disponibles (PDF/Excel).

**Reportes disponibles:**
- Resumen de KPIs
- Reporte de Transporte
- Reporte de Comercio Exterior
- Reporte de Ordenes de Compra

<!-- CAPTURA AQUI DEL TAB REPORTES DISPONIBLES -->


### 10.3 Tab de Historial

Registro de todos los reportes generados previamente. Permite descargar nuevamente o eliminar reportes del historial.

- Tabla de historial: Fecha, Reporte, Formato, Paginas, Usuario, Acciones (Descargar/Eliminar)

<!-- CAPTURA AQUI DEL TAB HISTORIAL DE REPORTES -->

---

## 11. Notificaciones

### 11.1 Centro de Notificaciones

Pagina que muestra todas las notificaciones del sistema en una lista ordenada cronologicamente. Permite marcar como leidas, eliminar individualmente o marcar todas como leidas de una vez.

**URL:** `http://localhost:3002/notifications`

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

<!-- CAPTURA AQUI DEL CENTRO DE NOTIFICACIONES -->

---

## 12. Configuracion del Sistema

### 12.1 Pagina de Configuracion

Area de administracion donde el usuario puede gestionar su perfil, datos de la empresa, preferencias de notificaciones, seguridad de la cuenta y parametros del sistema.

**URL:** `http://localhost:3002/settings`

<!-- CAPTURA AQUI DE LA PAGINA DE CONFIGURACION -->


### 12.2 Tab de Perfil

Formulario para actualizar la informacion personal del usuario. El correo de login y el rol son de solo lectura.

- Nombre Completo
- Correo electronico (Login) - solo lectura
- Correo para Notificaciones
- Cargo / Rol - solo lectura
- Telefono
- Boton: **Guardar Cambios**

<!-- CAPTURA AQUI DEL TAB PERFIL -->


### 12.3 Tab de Empresa

Gestion de la informacion de la empresa y administracion de sucursales. Permite crear, editar y eliminar sucursales.

- **Informacion de la Empresa** - Datos generales de la empresa
- **Gestion de Sucursales** - Crear, editar, eliminar sucursales

<!-- CAPTURA AQUI DEL TAB EMPRESA -->


### 12.4 Tab de Notificaciones

Configuracion de las preferencias de alerta del usuario. Cada preferencia se activa o desactiva con un interruptor toggle.

- Alertas de KPIs Criticos
- Reportes Semanales
- Aprobaciones Pendientes
- Cambios de Inventario
- Notificaciones por Email
- Boton: **Guardar Preferencias**

<!-- CAPTURA AQUI DEL TAB NOTIFICACIONES DE CONFIGURACION -->


### 12.5 Tab de Seguridad

Gestion de la seguridad de la cuenta: cambio de contrasena y activacion/desactivacion de autenticacion de dos factores.

- **Cambiar Contrasena** - Contrasena actual, nueva contrasena, confirmar contrasena
- **Autenticacion de Dos Factores (2FA)** - Toggle para habilitar/deshabilitar

<!-- CAPTURA AQUI DEL TAB SEGURIDAD -->


### 12.6 Tab de Sistema

Informacion tecnica del sistema y herramientas de mantenimiento basico.

- **Parametros del Sistema** - Version, Base de Datos, Estado
- **Mantenimiento** - Botones: Limpiar Cache, Verificar Estado

<!-- CAPTURA AQUI DEL TAB SISTEMA -->

---

## 13. Roles y Permisos

El sistema cuenta con un sistema de control de acceso basado en roles. Cada rol tiene permisos especificos sobre los modulos del sistema.

| Rol | Permisos |
|-----|----------|
| ADMIN / SUPER_ADMIN | Acceso total a todos los modulos |
| PURCHASING_MANAGER | Compras, Proveedores, Productos (lectura) |
| WAREHOUSE_MANAGER | Almacenamiento, Movimientos, Despachos, Auditorias |
| OPERATIONS_MANAGER | Produccion, Maquinas |
| USER | Solo lectura |

---

## 14. Indicadores KPI (Nomenclatura)

Tabla de referencia con todos los indicadores clave del sistema y su modulo de origen.

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
