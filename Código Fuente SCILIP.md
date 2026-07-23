**FACULTAD DE INGENIERÍA**  
**PROGRAMA DE ESTUDIOS DE INGENIERÍA DE SISTEMAS**

**“Código fuente”**

**AUTORES:**
Garcia Ventura Anthony
Martinez Dominguez, Mario Antonio
Ordóñez Ugarte, Jesús Daniel
Tello Fuentes, Melanie Celeste
Vigo Huayán, Alexis Gean

**DOCENTES:**
Ing. Gonzalez Vasquez Joe Alexis

**LÍNEA DE INVESTIGACIÓN:**
Cadena de Suministros

**Trujillo - Perú**
**2026-I**

---

### 1. Estructura del Proyecto (Anthony)

El sistema SCILIP está construido bajo una arquitectura de Monorepo gestionado por Turborepo y pnpm. Esto permite tener tanto el frontend como el backend y paquetes compartidos en un mismo repositorio de código, compartiendo configuraciones y tipos. La jerarquía de directorios principal es la siguiente:

```text
cadenaSuministro/
├── backend/                       # Backend y Base de datos
│   ├── api/                       # API principal (NestJS)
│   └── database/                  # Modelos de datos (Prisma schema) y migraciones
├── frontend/                      # Aplicación web Frontend (Next.js)
├── shared/                        # Tipos de TypeScript e interfaces comunes
├── docker/                        # Contenedores para despliegue local (Base de Datos)
├── scripts/                       # Scripts de utilidad y automatización
├── pnpm-workspace.yaml            # Definición del espacio de trabajo del monorepo
├── turbo.json                     # Configuración de pipelines de construcción (Turborepo)
└── package.json                   # Dependencias globales y orquestación
```

_[Captura de pantalla sugerida: Estructura de directorios del Monorepo en el explorador de archivos (VS Code), mostrando las carpetas backend, frontend y shared.]_

---

### 2. Componentes del Código

#### 2.1 Módulos de autenticación

El módulo de autenticación (backend/api/src/modules/auth) es el encargado de gestionar el acceso seguro a la plataforma SCILIP. Implementa mecanismos de autenticación mediante JWT, cifrado de contraseñas con bcrypt y autorización basada en roles y permisos granulares. Sus componentes principales son:

- **Controlador de Autenticación (auth.controller.ts):** Expone los endpoints relacionados con el acceso al sistema. Recibe las credenciales del usuario, valida los datos de entrada mediante DTOs y delega el proceso de autenticación al servicio correspondiente.
  _[Captura de pantalla sugerida: Código del auth.controller.ts mostrando el endpoint @Post('login') y la inyección de dependencias.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/auth/auth.controller.ts)

- **Servicio de Autenticación (auth.service.ts):** Contiene la lógica de validación de usuarios. Consulta la información almacenada en la base de datos, compara la contraseña ingresada con el hash registrado y genera el token JWT que será utilizado durante la sesión.
  _[Captura de pantalla sugerida: Lógica del auth.service.ts validando credenciales y comparando el hash de la contraseña usando bcrypt.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/auth/auth.service.ts)

- **Estrategia JWT (jwt.strategy.ts):** Se encarga de validar los tokens enviados en cada solicitud protegida. Extrae la información del usuario desde el token y verifica que la sesión sea válida antes de conceder acceso a los recursos del sistema.
  _[Captura de pantalla sugerida: Código de jwt.strategy.ts con el método validate verificando el payload del JWT.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/auth/jwt.strategy.ts)

- **Guard de Autenticación (jwt-auth.guard.ts):** Protege los endpoints REST de la aplicación. Antes de ejecutar cualquier operación, verifica que el usuario posea un token JWT válido y autorizado.
  _[Captura de pantalla sugerida: Definición de la clase JwtAuthGuard heredando de AuthGuard('jwt').]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/auth/jwt-auth.guard.ts)

- **Control de Acceso por Roles y Permisos (casl-ability.factory.ts):** Implementa las reglas de autorización utilizando CASL. Define las acciones permitidas para cada rol sobre los distintos módulos y recursos de la plataforma.
  _[Captura de pantalla sugerida: Código definiendo las habilidades (abilities) can y cannot según el rol del usuario.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/auth/casl-ability.factory.ts)

- **Middleware de Seguridad para tRPC (trpc-auth.middleware.ts):** Añade una capa adicional de protección a los procedimientos tRPC. Verifica la existencia de un usuario autenticado antes de permitir la ejecución de operaciones entre el frontend y el backend.
  _[Captura de pantalla sugerida: Código del middleware de tRPC lanzando un error UNAUTHORIZED si no existe sesión activa.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/common/middlewares/trpc-auth.middleware.ts)

- **Inicialización de Usuarios y Seguridad (seed.ts):** Genera los usuarios administrativos iniciales y almacena las contraseñas utilizando bcrypt con 10 rondas de cifrado, evitando el almacenamiento de credenciales en texto plano.
  _[Captura de pantalla sugerida: Fragmento de seed.ts generando el hash de la contraseña de los usuarios por defecto.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/database/prisma/seed.ts)

#### 2.2 Módulos de gestión de datos

El módulo principal encargado de la gestión y entrada de datos al sistema es el módulo de Ingestión (backend/api/src/modules/ingest), el cual actúa como un motor automatizado (Pipeline) de procesamiento (ETL) diseñado para recibir, validar y almacenar grandes volúmenes de datos operativos. Sus componentes de código son:

- **Controladores (IngestController):** Expone endpoints REST (ej. POST /ingest/purchase-orders/csv) que utilizan un FileInterceptor para aceptar archivos CSV o Excel (multipart/form-data) subidos por los analistas.
- **Procesadores (CsvParserService):** Un servicio genérico inyectable que toma el buffer del archivo en memoria y lo transforma en objetos JSON estructurados, estandarizando automáticamente las cabeceras (eliminando espacios y usando minúsculas).
- **Esquemas de Validación (DTOs con Zod):** Cada entidad (como Órdenes de Compra o Inventario) cuenta con un esquema estricto (ej. purchase-order.schema.ts). Antes de cualquier inserción, Zod valida que los tipos sean correctos, que los IDs de relaciones sean UUIDs válidos, y que las fechas tengan formato coherente. Las filas inválidas son apartadas para generar un reporte de errores.
- **Servicio de Negocio (IngestService):** Coordina todo el flujo. Recibe el archivo, ejecuta el procesador, aplica la validación, y finalmente utiliza el PrismaService en modo de transacción ($transaction) para insertar los datos válidos mediante comandos upsert (actualizar si existe, crear si es nuevo). Al finalizar, genera un registro automático en la tabla AuditLog para garantizar trazabilidad de la gestión de datos.

_[Captura de pantalla sugerida: Vista general de los archivos del módulo de ingestión (IngestController, IngestService, schemas) o un fragmento relevante de IngestService utilizando transacciones de Prisma.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/ingest/ingest.service.ts)

#### 2.3 Módulos de reportes

El módulo de reportes de SCILIP es el encargado de generar, programar y distribuir automáticamente los informes ejecutivos en formato PDF con los indicadores logísticos de la organización. Está compuesto por los siguientes componentes:

1.  **reports.module.ts:** Es el archivo central que registra y conecta todos los componentes del módulo. Importa el módulo de cola de trabajos BullMQ bajo el nombre reports, integra los módulos de KPIs y Transporte, y exporta los servicios principales.
    _[Captura de pantalla sugerida: Archivo reports.module.ts con los imports de BullModule, controladores y providers.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/reports/reports.module.ts)

2.  **reports.controller.ts:** Es el controlador REST que expone los endpoints protegidos con autenticación JWT para la descarga de reportes en PDF.
    _[Captura de pantalla sugerida: Endpoints GET de descarga de reportes manejando el buffer y cabeceras de respuesta HTTP.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/reports/reports.controller.ts)

3.  **reports.service.ts:** Es el servicio principal que contiene toda la lógica de negocio para construir los 3 tipos de reportes (Transporte vs Ventas, Completo de KPIs, y Comparativo).
    _[Captura de pantalla sugerida: Método principal de generación de reporte (ej. generateFullKpiReport) calculando estados críticos o enviando datos al renderer.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/reports/reports.service.ts)

4.  **pdf-generator.service.ts y pdf-renderer.service.ts:** Estos servicios se encargan de generar el PDF utilizando Puppeteer y plantillas Handlebars, y renderizan los reportes completos integrando imágenes base64 y gráficos.
    _[Captura de pantalla sugerida: Lógica de Puppeteer lanzando el navegador headless, cargando la plantilla HTML y exportando a PDF.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/reports/pdf-renderer.service.ts)

5.  **jobs/report-processor-service.ts y jobs/report-scheduler.service.ts:** Servicios de BullMQ que ejecutan la generación asíncrona en segundo plano y permiten programar reportes mediante expresiones cron.
    _[Captura de pantalla sugerida: Código del ReportProcessor procesando trabajos de la cola, y del ReportSchedulerService insertando cron jobs.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/reports/jobs/report-processor.service.ts)

#### 2.4 Conexión con la base de datos (Daniel)

La persistencia de datos del sistema SCILIP se gestiona de forma centralizada y tipo-segura mediante la integración de Prisma ORM sobre un motor relacional PostgreSQL.

1.  **Configuración del Origen de Datos (schema.prisma):** La especificación técnica del cliente generador y los parámetros de conexión de red delegan la cadena de conexión a variables de entorno para mayor seguridad de la infraestructura.
    _[Captura de pantalla sugerida: Fragmento de schema.prisma mostrando el datasource db (PostgreSQL) y el uso de env("DATABASE_URL").]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/database/prisma/schema.prisma)

2.  **Implementación de la Lógica del Servicio (prisma.service.ts):** En el core del backend de NestJS, se ha encapsulado el cliente nativo de Prisma en un servicio inyectable. Este componente intercepta el ciclo de vida de la aplicación automatizando la apertura y el cierre ordenado de los sockets.
    _[Captura de pantalla sugerida: Clase PrismaService implementando OnModuleInit y OnModuleDestroy para manejar la conexión/desconexión a la base de datos.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/prisma/prisma.service.ts)

3.  **Módulo de Provisión Global (prisma.module.ts):** El servicio de conexión se registra bajo un contenedor global mediante el decorador @Global(), permitiendo compartir la misma instancia de conexión a la base de datos.
    _[Captura de pantalla sugerida: Definición de PrismaModule exportando PrismaService de manera global en toda la aplicación NestJS.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/prisma/prisma.module.ts)

#### 2.5 Validaciones y seguridad

La seguridad es implementada transversalmente en varios controladores y servicios clave:

- **auth.controller.ts:** Gestiona las solicitudes de login, implementando DTOs validados mediante class-validator para asegurar que los datos cumplan con las restricciones antes de ser procesados.
  _[Captura de pantalla sugerida: Definición del DTO de login con decoradores de validación de class-validator (ej. @IsEmail, @IsString) o el uso del Body() en el controlador.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/auth/auth.controller.ts)

- **jwt-auth.guard.ts y casl-ability.factory.ts:** Interceptan solicitudes y manejan autorizaciones multicapa exigiendo un JWT válido y validando permisos de acceso (lectura/escritura) de acuerdo con los roles en base a CASL.
  _[Captura de pantalla sugerida: Fragmento del guard verificando el token o el archivo casl-ability validando reglas detalladas sobre recursos del sistema.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/auth/jwt-auth.guard.ts)

---

### 3. Instrucciones de Instalación

Antes de proceder con la instalación, es necesario contar con las siguientes herramientas en el equipo: Node.js (v20.x+), pnpm (v9.0.0+), Docker Desktop y Git.

1.  **Clonación del repositorio:**
    - `git clone https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos.git`
    - `cd SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos`

2.  **Configuración del entorno:**
    Se debe copiar el archivo `.env.example` a `.env` utilizando `Copy-Item .env.example .env` (Windows) o `cp .env.example .env` (Linux/macOS). Revisar variables críticas como las credenciales de PostgreSQL (`DATABASE_URL`), `JWT_SECRET` y `NEXT_PUBLIC_API_URL`.
    _[Captura de pantalla sugerida: Archivo .env con las variables principales configuradas.]_

3.  **Instalación de dependencias:**
    Ejecutar el comando `pnpm install` desde la raíz del proyecto para instalar todas las dependencias del monorepo (aplicaciones y paquetes compartidos).
    _[Captura de pantalla sugerida: Terminal de comandos ejecutando pnpm install exitosamente.]_

4.  **Configuración de la base de datos:**
    Asegurarse de tener configurada la variable `DATABASE_URL` y luego ejecutar en orden:
    - `npm run db:generate` (Genera el cliente Prisma).
    - `npm run db:push` (Sincroniza el esquema con PostgreSQL).
    - `npm run db:seed` (Inserta datos iniciales de prueba como KPIs, usuarios demo, y catálogos).
      _[Captura de pantalla sugerida: Terminal mostrando la salida exitosa de npm run db:push o npm run db:seed.]_

---

### 4. Ejecución del sistema

Al utilizar Turborepo, la ejecución del sistema está orquestada de forma global, lo que permite levantar tanto la API (Backend) como la Web (Frontend) de manera simultánea.

**Para entorno de desarrollo local:**
Asegúrese de estar en la carpeta raíz del proyecto y ejecute en la terminal:
`pnpm dev`
_(Este comando iniciará NestJS en modo watch y Next.js en el puerto 3000)._

**Para entorno de producción:**

1.  Compilar aplicaciones: `pnpm build`
2.  Iniciar los servicios: `pnpm start`

_[Captura de pantalla sugerida: Consola mostrando los procesos de Turborepo ejecutando el backend y frontend en paralelo tras el comando pnpm dev.]_

---

### 5. Repositorio del Proyecto (Daniel)

El código fuente de la plataforma se encuentra alojado en un repositorio privado bajo la plataforma GitHub para el control de versiones, integración continua y mantenimiento del ciclo de vida del software.

- **Enlace al repositorio:** https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos.git
  _[Captura de pantalla sugerida: Interfaz web del repositorio en GitHub, mostrando la rama principal y la lista de carpetas del monorepo.]_
