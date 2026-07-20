# SCILIP: Sistema de Control de Indicadores Logísticos y de Ingeniería de Procesos

Bienvenido al repositorio de **SCILIP**, una plataforma empresarial de Business Intelligence (BI) y control de gestión diseñada para centralizar, automatizar y auditar los indicadores clave de rendimiento (KPIs) de las áreas de logística e ingeniería de procesos dentro de una organización.

El objetivo principal del sistema es transformar los datos operativos de la cadena de suministro en información estratégica y confiable para la toma de decisiones por parte de la alta dirección.

---

## Contenido

1. [¿Qué es SCILIP?](#1-qué-es-scilip)
2. [Problemas que Resuelve](#2-problemas-que-resuelve)
3. [Objetivo Principal](#3-objetivo-principal)
4. [Funcionalidades Principales](#4-funcionalidades-principales)
5. [Módulos del Sistema](#5-módulos-del-sistema)
6. [Flujo de Operación Típico](#6-flujo-de-operación-típico)
7. [Beneficio Clave](#7-beneficio-clave)
8. [Estructura del Proyecto](#8-estructura-del-proyecto)

---

## 1. ¿Qué es SCILIP?
Es una plataforma empresarial que centraliza, automatiza y audita los indicadores de gestión logística y de ingeniería de procesos de una organización. Convierte los datos operativos de la cadena de suministro en información estratégica para la toma de decisiones de la alta dirección.

## 2. Problemas que Resuelve
* **Falta de visibilidad integral** de las operaciones logísticas.
* **Dificultad para detectar** cuellos de botella y desviaciones de costos.
* **Pérdida de clientes** debido a niveles de servicio impredecibles.
* **Sobrecostos ocultos** generados por ineficiencias no detectadas a tiempo.
* **Ausencia de una única fuente de verdad** y confianza para las métricas operacionales.

## 3. Objetivo Principal
Eliminar las ineficiencias de control operativo mediante una solución automatizada que:
* **Centralice** todos los indicadores de gestión logística y de ingeniería.
* **Procese** datos en tiempo real con validación y limpieza automática.
* **Visualice** las métricas a través de paneles dinámicos e interactivos.
* **Genere** reportes ejecutivos en PDF de manera automatizada para auditorías.
* **Estandarice** la metodología de evaluación del rendimiento.

## 4. Funcionalidades Principales
* **Ingestión y Validación:** Limpieza automática de inconsistencias en los datos cargados.
* **Cálculo Automático:** Fórmulas complejas y ponderaciones mensuales sin intervención manual.
* **Reportes PDF:** Generación automatizada de reportes listos para auditorías institucionales.
* **Dashboards en Tiempo Real:** Actualización instantánea de paneles y alertas de rendimiento.
* **Control de Acceso Granular:** Gestión de usuarios con permisos específicos por área y rol.
* **Auditoría y Trazabilidad:** Historial completo de cambios para cada acción en el sistema.

## 5. Módulos del Sistema
El sistema se compone de los siguientes módulos funcionales:
1. **Compras y Abastecimiento:** Gestión de proveedores, calidad de pedidos y volumen de compras.
2. **Inventario y Producción:** Control de capacidad productiva, rendimientos de maquinaria y rotación de stock.
3. **Almacén y Bodegaje:** Indicadores de costos de almacenamiento, despachos y productividad laboral.
4. **Transporte y Distribución:** Costos de transporte, comparación (propio vs. 3PL) y despacho.
5. **Comercio Internacional:** Costos y tiempos de importaciones y exportaciones.
6. **Servicio al Cliente:** Entregas perfectas (a tiempo y completas) y análisis del costo logístico frente a ventas/utilidad.
7. **Gestión de KPIs y Reportes:** Motor de visualización y generación de reportes en PDF.
8. **Autenticación y Autorización:** Control de seguridad y permisos de usuario.

## 6. Flujo de Operación Típico
1. **Autenticación:** El analista de área inicia sesión de manera segura.
2. **Carga de Datos:** Se cargan los datos mensuales del área correspondiente (en formatos estructurados).
3. **Validación:** El sistema limpia y valida la información de forma automática.
4. **Cálculo:** Se procesan las fórmulas de los indicadores simples y compuestos.
5. **Actualización:** Los dashboards reflejan inmediatamente los nuevos datos en tiempo real.
6. **Cierre de Mes y Reporte:** Generación automática del reporte ejecutivo consolidado en PDF para la Alta Gerencia.

## 7. Beneficio Clave
**SCILIP elimina la opacidad operativa.** Al unificar y automatizar las métricas clave de la cadena de suministro bajo una única fuente confiable y auditable, empodera a los líderes y gerentes para optimizar costos, mitigar riesgos y tomar decisiones comerciales más estratégicas.

---

## 8. Estructura del Proyecto
Este proyecto está organizado como un **monorepo** gestionado con `pnpm` y `turbo`:

* `apps/`
  * [api](file:///c:/Users/Anthony%20Garcia/CadenaProyecto/cadenaSuministro/apps/api) - API Backend construida con NestJS.
  * [web](file:///c:/Users/Anthony%20Garcia/CadenaProyecto/cadenaSuministro/apps/web) - Aplicación Frontend construida con Next.js.
* `packages/`
  * [database](file:///c:/Users/Anthony%20Garcia/CadenaProyecto/cadenaSuministro/packages/database) - Capa de datos con Prisma y scripts de semillas/SQL.
  * [ui](file:///c:/Users/Anthony%20Garcia/CadenaProyecto/cadenaSuministro/packages/ui) - Componentes de interfaz compartidos.
  * [shared](file:///c:/Users/Anthony%20Garcia/CadenaProyecto/cadenaSuministro/packages/shared) - Utilidades y tipos comunes.
  * [eslint-config](file:///c:/Users/Anthony%20Garcia/CadenaProyecto/cadenaSuministro/packages/eslint-config) - Reglas de linting del proyecto.

Consulte el archivo [KPI_ANALYSIS.md](file:///c:/Users/Anthony%20Garcia/CadenaProyecto/cadenaSuministro/KPI_ANALYSIS.md) para ver la lista completa y fórmulas de los 28 indicadores de gestión logística e ingeniería clasificados por categorías.
