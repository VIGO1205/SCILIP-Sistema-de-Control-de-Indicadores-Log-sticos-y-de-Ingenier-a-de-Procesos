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

El módulo de autenticación (backend/api/src/modules/auth) es el encargado de gestionar el acceso seguro a la plataforma SCILIP, implementando mecanismos como JWT y cifrado de contraseñas con bcrypt. Los componentes de lógica principales son:

- **Servicio de Autenticación (auth.service.ts):** Contiene la lógica central de validación de usuarios. Consulta la información en la base de datos, compara la contraseña ingresada con el hash registrado y genera el token JWT.
  _[Captura de pantalla sugerida: Lógica del auth.service.ts validando credenciales y comparando el hash de la contraseña usando bcrypt.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/auth/auth.service.ts)

- **Control de Acceso por Roles y Permisos (casl-ability.factory.ts):** Implementa las reglas de autorización utilizando CASL. Define centralmente las acciones permitidas para cada rol sobre los distintos módulos del sistema.
  _[Captura de pantalla sugerida: Código definiendo las habilidades (abilities) can y cannot según el rol del usuario.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/auth/casl-ability.factory.ts)

#### 2.2 Módulos de gestión de datos

El módulo de Ingestión (backend/api/src/modules/ingest) actúa como el motor automatizado (Pipeline ETL) para procesar, validar y almacenar grandes volúmenes de datos operativos. La lógica se concentra en:

- **Servicio de Negocio (ingest.service.ts):** Coordina todo el flujo de ingesta. Recibe el archivo, ejecuta el procesador, aplica la validación y utiliza el PrismaService en modo de transacción ($transaction) para insertar datos válidos mediante comandos upsert (actualizar/crear).
  _[Captura de pantalla sugerida: Fragmento relevante de IngestService coordinando el flujo y utilizando transacciones de Prisma.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/ingest/ingest.service.ts)

- **Procesador de Archivos (csv-parser.service.ts):** Servicio responsable de transformar el buffer del archivo en objetos JSON estructurados y estandarizar dinámicamente las cabeceras.
  _[Captura de pantalla sugerida: Lógica de transformación de CSV a JSON dentro del CsvParserService.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/ingest/csv-parser.service.ts)

#### 2.3 Módulos de reportes

El módulo de reportes es el encargado de calcular indicadores logísticos y generar automáticamente los informes ejecutivos en formato PDF. La lógica de negocio recae en:

- **Servicio de Reportes (reports.service.ts):** Contiene toda la lógica matemática y de negocio para construir los reportes (Transporte vs Ventas, Completo de KPIs y Comparativo), calculando estados críticos y resúmenes de cumplimiento.
  _[Captura de pantalla sugerida: Método principal de generación (ej. generateFullKpiReport) iterando categorías y calculando alertas.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/reports/reports.service.ts)

- **Renderizador de PDF (pdf-renderer.service.ts):** Encargado de tomar los datos procesados, generar los gráficos de barras y líneas como imágenes base64, y compilar la plantilla HTML final usando Handlebars y Puppeteer.
  _[Captura de pantalla sugerida: Lógica de Puppeteer y Handlebars renderizando la plantilla HTML a PDF.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/reports/pdf-renderer.service.ts)

- **Procesador Asíncrono (report-processor.service.ts):** Servicio (worker) de BullMQ que ejecuta de forma segura la generación de reportes en segundo plano para no bloquear el hilo principal de la aplicación.
  _[Captura de pantalla sugerida: Switch principal del procesador manejando los distintos tipos de reportes de la cola.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/modules/reports/jobs/report-processor.service.ts)

#### 2.4 Conexión con la base de datos (Daniel)

La persistencia de datos del sistema SCILIP se gestiona de forma centralizada y tipo-segura mediante Prisma ORM.

- **Esquema de Base de Datos (schema.prisma):** Archivo central donde se declaran todos los modelos relacionales (empresas, inventarios, costos, KPIs) y se delega la cadena de conexión a variables de entorno para mayor seguridad.
  _[Captura de pantalla sugerida: Fragmento de schema.prisma mostrando modelos clave o la conexión al datasource de PostgreSQL.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/database/prisma/schema.prisma)

- **Servicio Global (prisma.service.ts):** Servicio inyectable que automatiza el ciclo de vida de la conexión (apertura y cierre ordenado de sockets) interceptando los eventos principales de la aplicación NestJS.
  _[Captura de pantalla sugerida: Clase PrismaService implementando OnModuleInit y OnModuleDestroy.]_ [Ver en GitHub](https://github.com/VIGO1205/SCILIP-Sistema-de-Control-de-Indicadores-Log-sticos-y-de-Ingenier-a-de-Procesos/blob/main/backend/api/src/prisma/prisma.service.ts)

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
