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
9. [🐳 Levantar con Docker (Recomendado para Equipos)](#9-levantar-con-docker-recomendado-para-equipos)
10. [Guía de Instalación y Ejecución Local (Desarrollo)](#10-guía-de-instalación-y-ejecución-local-desarrollo)

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

* `backend/`
  * [api](./backend/api) - API Backend construida con NestJS.
  * [database](./backend/database) - Capa de datos con Prisma y scripts de semillas/SQL.
* `frontend/`
  * [web](./frontend/web) - Aplicación Frontend construida con Next.js.
  * [ui](./frontend/ui) - Componentes de interfaz compartidos.
* `shared/` - Utilidades y tipos comunes.
* `docker/` - Configuración para levantar servicios locales (PostgreSQL, Redis).

Consulte el archivo [KPI_ANALYSIS.md](./KPI_ANALYSIS.md) para ver la lista completa y fórmulas de los 28 indicadores de gestión logística e ingeniería clasificados por categorías.

---

## 10. Guía de Instalación y Ejecución Local (Desarrollo)

Para levantar el sistema en un entorno de desarrollo local (sin Docker para el código, ideal para programar), sigue estos pasos. Es **necesario** realizar la sincronización de Prisma con PostgreSQL la primera vez que levantas los servicios o cuando la base de datos esté limpia.

### Requisitos Previos
- [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Docker y Docker Compose](https://www.docker.com/) (solo para la base de datos)

### 1. Instalación de Dependencias
En la raíz del proyecto, instala todas las dependencias del monorepo:
```bash
pnpm install
```

### 2. Configuración de Variables de Entorno
Copia el archivo de ejemplo en la raíz para configurar tus variables locales:
```bash
cp env.example .env
```
*(Nota: Si usas Windows, puedes hacerlo manualmente o usando `copy env.example .env`). Asegúrate de que las credenciales de base de datos coincidan con las expuestas en `docker-compose.yml`.*

### 3. Levantar los Servicios (Base de Datos y Redis)
El proyecto usa contenedores Docker para PostgreSQL y Redis en modo desarrollo. Ejecuta:
```bash
cd docker
docker-compose -f docker-compose.dev.yml up -d postgres redis
cd ..
```

### 4. Migración y Preparación de la Base de Datos (Prisma)
Para que el backend funcione, es necesario sincronizar el esquema de Prisma con la base de datos de PostgreSQL recién creada y generar los artefactos del cliente Prisma. Estos comandos están configurados en la raíz mediante Turborepo:

```bash
# 1. Generar el cliente de Prisma localmente
pnpm run db:generate

# 2. Sincronizar el esquema con la base de datos (crea las tablas)
pnpm run db:push

# 3. Poblar la base de datos con datos de prueba/semilla (Seed)
pnpm run db:seed
```

### 5. Iniciar la Aplicación (Backend y Frontend)
Al ser un monorepo administrado con `turbo`, puedes arrancar todos los entornos de desarrollo con un solo comando desde la raíz:
```bash
pnpm run dev
```

Esto iniciará el **Backend (NestJS)** y el **Frontend (Next.js)** al mismo tiempo con hot-reload.

---

## 9. 🐳 Levantar con Docker (Recomendado para Equipos)

Este es el método más sencillo para que cualquier integrante del equipo levante el sistema completo sin instalar Node.js, pnpm ni configurar nada manualmente.

### Prerrequisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.

### Paso 1 — Configurar variables de entorno (¡Muy importante!)

El sistema requiere un archivo de configuración `.env` en la carpeta `docker/`. Copia el archivo de ejemplo y edítalo:
```bash
cp docker/.env.example docker/.env
```

Abre el archivo `docker/.env` recién creado y configura lo siguiente:

1. **`GROQ_API_KEY` (Inteligencia Artificial):**
   Para que el botón mágico (✨) de interpretación de gráficas y análisis automático funcione, debes conseguir una API Key gratuita en [console.groq.com/keys](https://console.groq.com/keys) y pegarla aquí. Sin esta clave, la IA simplemente no responderá.
2. **`JWT_SECRET` (Seguridad de Sesiones):**
   Asegúrate de que este valor sea una cadena larga y segura. **Nota:** Si modificas esta clave maestra con el servidor ya corriendo y los usuarios logueados, todas las sesiones activas se cerrarán automáticamente (error `401 Unauthorized`) y los usuarios tendrán que volver a iniciar sesión para generar una cookie válida.

### Paso 2 — Construir y levantar todos los servicios

```bash
cd docker
docker-compose up -d --build
```

Esto construirá las imágenes de la API y el frontend, levantará PostgreSQL, Redis, el Backend, el Frontend y el proxy Nginx.

> **Primera vez:** El proceso de build puede tardar 5-10 minutos. Las ejecuciones siguientes son mucho más rápidas.

### Paso 3 — Acceder al sistema

Abre tu navegador en **[http://localhost:8080](http://localhost:8080)**

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin@demo.local` | `demo123` | Administrador |
| `analista@demo.local` | `demo123` | Analista |

> **Nota importante sobre los datos de prueba:** Para popular la base de datos con los KPIs, usuarios y todo el catálogo de demostración inicial, debes correr el seed **manualmente** luego de levantar los servicios. Ejecuta el siguiente comando en la terminal:
> ```bash
> docker-compose exec api npx tsx backend/database/prisma/seed.ts
> ```
> *(Este comando descargará `tsx` e inyectará toda la información en PostgreSQL. Solo necesitas ejecutarlo la primera vez o cuando limpies los volúmenes).*

### Comandos útiles de Docker

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs solo de la API
docker-compose logs -f api

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (borra la base de datos)
docker-compose down -v

# Reconstruir solo la API tras cambios de código
docker-compose up -d --build api
```
