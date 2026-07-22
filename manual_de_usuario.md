# Manual de Usuario - SCILIP (Actualizado)

**Sistema de Control de Indicadores Logísticos y de Ingeniería de Procesos (SCILIP)**

---

> **Nota de Asignación de Tareas:**
> Este manual ha sido estructurado y dividido para facilitar la documentación y actualización por parte del equipo. 
> - **Parte 1 (Secciones 1 a 4):** Asignada a **Melanie**
> - **Parte 2 (Secciones 5 a 8):** Asignada a **Mario**
> 
> *Instrucción para el equipo:* Por favor, reemplacen los bloques `![...](...)` con las capturas de pantalla reales del sistema según corresponda en cada una de sus secciones asignadas.

---

## PARTE 1 - Asignada a Melanie

### 1. Presentación y Requisitos del Sistema

**1.1. ¿Qué es SCILIP?**
SCILIP es una plataforma de Business Intelligence desarrollada para centralizar, procesar y supervisar los indicadores clave de rendimiento (KPIs) de la cadena de suministro. Gestiona 28 KPIs agrupados en seis categorías funcionales, ofreciendo gráficos en tiempo real, integración con Inteligencia Artificial y generación de reportes en PDF.

**1.2. Requisitos del Sistema**
* **Sistema Operativo:** Multiplataforma (Windows, macOS, Linux).
* **Navegador Web:** Google Chrome (v100+), Mozilla Firefox (v100+), Safari (15+).
* **Resolución recomendada:** 1920x1080 (Full HD) para visualizar correctamente todos los gráficos y tablas sin cortes.
* **Conectividad:** Internet de banda ancha (5 Mbps mínimo).

### 2. Acceso al Sistema

**2.1. Pantalla de Inicio de Sesión**
Para ingresar, acceda a la URL del sistema e ingrese su correo y contraseña institucional.
![Pantalla de Login](docs/images/login_screen.png)
*Figura 1: Interfaz de inicio de sesión de SCILIP.*

**2.2. Recuperación de Contraseña**
Si olvidó su contraseña, haga clic en "¿No tienes cuenta? / Olvidaste tu contraseña" y siga las instrucciones enviadas a su correo.

**2.3. Cierre de Sesión Segura**
Haga clic en su nombre en la esquina superior derecha y seleccione "Cerrar sesión" para terminar su actividad de forma segura.

### 3. Menú Principal y Navegación

El Menú Principal se ubica en el panel lateral izquierdo. Este menú colapsable le permite acceder a los distintos módulos del sistema:
![Menú Principal](docs/images/menu_principal.png)
*Figura 2: Menú lateral de navegación con módulos activos.*

* **Dashboard Global:** Vista ejecutiva de todos los KPIs.
* **Módulos Operativos:** Navegación por área (Compras, Inventario, Transporte, etc.).
* **Configuraciones:** Acceso a la gestión de usuarios (solo Administradores).

### 4. Módulos Operativos I (Compras, Inventario, Almacén)

**4.1. Compras y Abastecimiento**
Permite evaluar la calidad de los pedidos, certificaciones de proveedores y volumen de compras.
![Módulo de Compras](docs/images/modulo_compras.png)

**4.2. Inventario y Producción**
Muestra gráficos dinámicos sobre la utilización de la capacidad productiva, el rendimiento de maquinaria y el nivel de rotación de mercadería.
![Módulo de Inventario](docs/images/modulo_inventario.png)

**4.3. Almacén y Bodegaje**
Indicadores de costos de almacenamiento por metro cuadrado, despachos y productividad de los empleados del almacén.
![Módulo de Almacén](docs/images/modulo_almacen.png)

---

## PARTE 2 - Asignada a Mario

### 5. Módulos Operativos II (Transporte, Comercio Int., Servicio al Cliente)

**5.1. Transporte y Distribución**
Análisis profundo de los costos de transporte, mantenimiento de flota y comparativas (transporte propio vs subcontratado).
![Módulo de Transporte](docs/images/modulo_transporte.png)
*Figura 3: Gráfica comparativa de costos de transporte.*

**5.2. Comercio Internacional**
Monitoreo de tiempos y costos logísticos de importación y exportación de mercancías.
![Módulo Comercio Internacional](docs/images/modulo_comercio_int.png)

**5.3. Servicio al Cliente**
Visualización del porcentaje de "Entregas Perfectas" (a tiempo y completas) y los costos de logística invertidos frente a las ventas totales de la organización.
![Módulo Servicio al Cliente](docs/images/modulo_servicio_cliente.png)

### 6. Inteligencia Artificial y Reportes (Funciones Avanzadas)

**6.1. Interpretación Asistida por IA (Groq)**
En la vista de cualquier gráfica de KPIs, encontrará un botón con el icono de "Magia" (✨). Al presionarlo, la Inteligencia Artificial de SCILIP leerá los datos del gráfico y generará una interpretación ejecutiva en lenguaje natural.
![Botón de IA y Resultados](docs/images/funcion_ia_groq.png)
*Figura 4: Interpretación automática de gráficas mediante IA.*

**6.2. Exportación a PDF**
Haga clic en el botón "Exportar Informe" ubicado en la parte superior derecha de los Dashboards para descargar un PDF estructurado de alta resolución, listo para auditorías.
![Exportar PDF](docs/images/exportar_pdf.png)

### 7. Gestión de Usuarios y Permisos

SCILIP cuenta con un modelo híbrido ABAC/RBAC. Solo los administradores pueden acceder a este módulo.
* **Crear / Editar usuarios:** Asigne roles específicos (Analista de Compras, Gerente de Operaciones, etc.).
* **Restricción de vistas:** Un analista solo podrá ver los datos de su propio módulo, mientras que la Alta Gerencia tiene acceso panorámico.
![Gestión de Usuarios](docs/images/gestion_usuarios.png)

### 8. Solución de Problemas Frecuentes y Soporte

* **Error 401 (Unauthorized) en el Dashboard:** Si el sistema de repente deja de mostrar los datos, cierre su sesión e ingrese nuevamente. Esto ocurre si las llaves de seguridad del servidor se han actualizado.
* **El botón de IA (✨) no hace nada:** Reporte a soporte técnico para verificar que la configuración de la clave de Groq esté activa en el servidor.
* **Soporte Técnico:** Envíe un correo a `soporte@scilip.local` indicando el módulo, el error y una captura de pantalla.

---
*Fin del Documento*
