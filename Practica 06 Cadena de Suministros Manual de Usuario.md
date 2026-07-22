  
**FACULTAD DE INGENIERÍA**  
**PROGRAMA DE ESTUDIOS DE INGENIERÍA DE SISTEMAS**

 

**“Manual de usuario”** 

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

**Trujillo \- Perú**

**2026-I** 

**Índice**

[**1\. Presentación	3**](#presentación)

[**2\. Requisitos del Sistema	3**](#requisitos-del-sistema)

[**3\. Acceso al Sistema	3**](#acceso-al-sistema)

[3.1. Inicio de Sesión:	4](#inicio-de-sesión:)

[3.2. Recuperación de Contraseña:	4](#recuperación-de-contraseña:)

[3.3. Cierre de Sesión:	4](#cierre-de-sesión:)

[**4\. Menú Principal	4**](#menú-principal)

[**5\. Procedimientos Operativos	4**](#procedimientos-operativos)

[**6\. Gestión de Usuarios	4**](#gestión-de-usuarios)

[**7\. Solución de Problemas Frecuentes	5**](#solución-de-problemas-frecuentes)

[**8\. Soporte Técnico	6**](#soporte-técnico)

[8.1. Correo Electrónico:	6](#correo-electrónico:)

[8.2. Administrador del Sistema:	6](#administrador-del-sistema:)

[8.3. Documentación Interna:	6](#documentación-interna:)

# 

1. # **Presentación** {#presentación}

   SCILIP (Sistema de Control de Indicadores Logísticos y de Ingeniería de Procesos) es una plataforma de Business Intelligence desarrollada para centralizar, procesar y supervisar los indicadores clave de rendimiento (KPIs) asociados a la cadena de suministro. El sistema integra información procedente de diferentes áreas operativas y automatiza su validación, procesamiento y análisis, permitiendo disponer de métricas confiables para el seguimiento del desempeño logístico.

   La plataforma gestiona 28 KPIs agrupados en seis categorías funcionales: compras y abastecimiento, inventario y producción, almacén y bodegaje, transporte y distribución, comercio internacional y servicio al cliente. Para ello, incorpora mecanismos de ingestión y validación de datos, cálculo automatizado de indicadores, visualización mediante dashboards interactivos y generación de reportes ejecutivos.

   Asimismo, SCILIP implementa controles de acceso basados en roles, registros de auditoría y sistemas de alertas en tiempo real, garantizando la trazabilidad de las operaciones y la integridad de la información. Estas funcionalidades permiten consolidar en una única plataforma el monitoreo de los procesos logísticos y el control sistemático de los indicadores de desempeño.

   

2. # **Requisitos del Sistema**  {#requisitos-del-sistema}

   Dado que SCILIP es una plataforma empresarial moderna basada en la nube (aplicación web), no requiere instalación de software local. Los requisitos para acceder al sistema desde el lado del usuario (cliente) son ligeros y accesibles:

* Sistema Operativo Compatible: Al ser una plataforma basada en la web, SCILIP es completamente multiplataforma. Es compatible con Windows 10/11, macOS, distribuciones de Linux con interfaz gráfica, así como sistemas operativos móviles modernos (iOS y Android) para consultas rápidas.  
* Navegador Web Recomendado: Para una experiencia óptima y correcta visualización de gráficos interactivos, se recomienda el uso de Google Chrome (versión 100 o superior). También tiene soporte oficial para Mozilla Firefox (versión 100+), Microsoft Edge basado en Chromium y Apple Safari (versión 15+).  
* Requisitos de Hardware (Cliente):  
  * Procesador: Intel Core i3 / AMD Ryzen 3 o superior (equivalente).  
  * Memoria RAM: 4 GB de RAM (se recomiendan 8 GB para una visualización más fluida al cargar grandes volúmenes de datos en los paneles de control).  
  * Resolución de Pantalla: Mínima de 1366x768 píxeles. Se recomienda encarecidamente una resolución Full HD (1920x1080) para visualizar correctamente múltiples indicadores y tablas extensas sin tener que desplazar la pantalla en exceso.  
  * Conectividad: Conexión a Internet de banda ancha (Mínimo recomendado de 5 Mbps para asegurar la carga fluida de archivos CSV pesados y la descarga de reportes PDF).

3. # **Acceso al Sistema** {#acceso-al-sistema}

   Para ingresar a SCILIP, el usuario debe abrir su navegador web recomendado e ingresar la URL proporcionada por el administrador de su organización. A continuación se describen los procedimientos disponibles en esta sección.

   1. ## **Inicio de Sesión:** {#inicio-de-sesión:}

      En la pantalla de inicio, el usuario debe ingresar su correo electrónico institucional y la contraseña asignada previamente por el administrador. Una vez validadas las credenciales, el sistema redirige automáticamente al Dashboard Global correspondiente al rol del usuario. Por ejemplo, un analista de Compras verá directamente los indicadores de su área, mientras que un usuario con rol de Alta Gerencia tendrá acceso al resumen ejecutivo completo.

   2. ## **Recuperación de Contraseña:** {#recuperación-de-contraseña:}

      En caso de olvidar la contraseña, el usuario debe hacer clic en la opción "¿Olvidaste tu contraseña?" ubicada en la pantalla de inicio de sesión. El sistema solicitará el correo electrónico institucional registrado y enviará automáticamente un enlace de recuperación con validez temporal. Al acceder al enlace, el usuario podrá establecer una nueva contraseña cumpliendo los requisitos de seguridad que el sistema indique.

   3. ## **Cierre de Sesión:** {#cierre-de-sesión:}

      Para cerrar sesión de manera segura, el usuario debe dirigirse al ícono de perfil ubicado en la esquina superior derecha de la pantalla, donde aparece su nombre y rol asignado, y seleccionar la opción "Cerrar sesión". Se recomienda siempre cerrar sesión al finalizar el uso del sistema, especialmente cuando se trabaja en equipos compartidos o de uso público.

4. # **Menú Principal** {#menú-principal}

   El Menú Principal es la barra lateral fija que permite navegar por todas las secciones del sistema SCILIP de manera rápida y organizada. Esta barra permanece visible en pantallas medianas y grandes, y se oculta automáticamente en dispositivos móviles para optimizar el espacio de visualización.

   1. **Estructura del Menú**  
      El menú se divide en dos secciones. La primera, ubicada en la parte superior, contiene las opciones de navegación hacia los módulos funcionales del sistema: Dashboard (resumen general de KPIs), Compras (control de proveedores y calidad de abastecimiento), Inventarios (stock y movimientos), Producción (rendimiento de maquinaria), Transporte (flota y costos de distribución), Servicio al Cliente (entregas perfectas, a tiempo y completas), Comercio Exterior (importaciones y exportaciones), Reportes (generación de informes en PDF) y Configuración (usuarios, permisos y ajustes del sistema). La segunda sección, ubicada en la parte inferior, muestra la información del usuario activo: su avatar con las iniciales del nombre, el nombre o rol con el que inició sesión, y la etiqueta del nivel de acceso correspondiente.  
   2. **Comportamiento Visual**  
      La opción correspondiente a la sección en la que el usuario se encuentra actualmente se resalta con un fondo azul degradado y un punto blanco indicador en el lado derecho. Al pasar el cursor sobre cualquier opción, el icono y el texto se iluminan y la opción se desplaza ligeramente hacia la derecha, indicando que es interactiva.  
   3. **Cómo navegar**  
      Para utilizar el menú, basta con iniciar sesión en el sistema, identificar en la barra lateral el módulo al que se desea acceder y hacer clic sobre su nombre o icono. El sistema redirigirá automáticamente a la sección correspondiente.

5. # **Procedimientos Operativos** {#procedimientos-operativos}

   El sistema SCILIP guiará al usuario interactivo a través de los siguientes flujos operativos estándar integrados en la interfaz:

* **Registrar Información (Ingestión de Datos):** El usuario debe dirigirse al módulo correspondiente a su jefatura (ej. Compras, Almacén). Al hacer clic en "Cargar Datos", la plataforma despliega una interfaz responsiva donde se pueden digitar las variables del mes o arrastrar un archivo estructurado en formato CSV o JSON. El sistema validará los campos en tiempo real antes de permitir la inserción.  
* **Editar / Modificar Registros:** En caso de requerir correcciones en los datos crudos cargados, el usuario con los atributos de edición (ABAC) podrá modificar los valores desde las tablas dinámicas de la interfaz. Cualquier cambio guardado disparará de forma transparente una inserción automática en la bitácora inmutable de auditoría (AuditLog).  
* **Eliminar / Descartar Registros:** Si un bloque transaccional es erróneo, el usuario autorizado podrá ejecutar el descarte del registro. Al igual que la edición, esta acción no borra físicamente la trazabilidad, sino que guarda un log con el timestamp, IP y usuario que efectuó la remoción.  
* **Consultar Información (Visualización Interactiva):** Al ingresar al "Dashboard Principal", el usuario visualizará inmediatamente gráficos dinámicos (líneas de tendencia, barras comparativas horizontales/verticales y diagramas de radar) que renderizan de manera fluida la evolución de las métricas desde enero a diciembre.  
* **Generar Reportes / Exportar Datos:** En la esquina superior derecha del panel ejecutivo, se encuentra habilitado el botón "**Exportar Informe Ejecutivo**". Al presionarlo, el sistema procesa de forma asíncrona mediante colas de fondo la compilación de las fichas técnicas y gráficos, descargando automáticamente un archivo PDF estructurado de alta fidelidad para su presentación directa ante la Dirección Administrativa.


6. # **Gestión de Usuarios**  {#gestión-de-usuarios}

   SCILIP implementa un sistema de gestión de usuarios basado en roles (RBAC), orientado a garantizar el acceso controlado, seguro y diferenciado a las funcionalidades del sistema según el perfil organizacional del usuario. Este módulo permite administrar cuentas, asignar permisos y delimitar el alcance de visualización y operación dentro de la plataforma.

   Los usuarios del sistema se clasifican en distintos niveles, entre los que destacan: Alta Gerencia, Analistas de Área y Administradores del Sistema, cada uno con accesos específicos a módulos, dashboards y funcionalidades. La Alta Gerencia dispone de una vista global de los indicadores estratégicos, mientras que los usuarios operativos acceden únicamente a los KPIs relacionados con su área funcional.

   El sistema integra autenticación mediante credenciales institucionales (correo y contraseña), junto con mecanismos de recuperación de acceso y políticas de seguridad para el cambio periódico de contraseñas. Asimismo, SCILIP registra todas las acciones realizadas por los usuarios mediante un sistema de auditoría (AuditLog), permitiendo la trazabilidad completa de operaciones como creación, edición y eliminación de datos.

   La administración de usuarios contempla también la asignación dinámica de permisos (ABAC/RBAC híbrido), lo que permite definir restricciones específicas sobre módulos como ingestión de datos, visualización de dashboards, generación de reportes y configuración del sistema. De esta manera, se asegura que cada usuario interactúe únicamente con las funcionalidades autorizadas según su rol.

   

7. # **Solución de Problemas Frecuentes** {#solución-de-problemas-frecuentes}

   A continuación, se detallan los errores más comunes que un usuario puede experimentar al interactuar con el sistema SCILIP y las pautas para resolverlos rápidamente:

   1. **Problema: Error de "Acceso Denegado" o credenciales incorrectas al iniciar sesión.**  
      *Posible Solución:* Verifique que no tenga activada la tecla de Bloqueo de Mayúsculas y que su correo electrónico esté bien escrito. Si el problema persiste y olvidó su contraseña, utilice la opción "Recuperar Contraseña". Si el sistema indica "Usuario inactivo", contacte a su administrador de área para que reactive su cuenta.  
   2. **Problema: Al intentar cargar datos mensuales, el sistema arroja "El archivo CSV no pudo ser procesado" o "Errores de formato encontrados".**  
      *Posible Solución:* Este error se debe a la validación estricta de la plataforma. Asegúrese de lo siguiente:  
* Está utilizando la plantilla CSV oficial descargada del sistema.  
* No ha dejado celdas obligatorias vacías (ej. Códigos de producto o fechas).  
* Las columnas numéricas (ej. Costos, Cantidades) no contienen letras ni símbolos de moneda (como "$"). Revise el panel de errores que el sistema arroja, el cual le indicará exactamente en qué fila de su archivo Excel/CSV se encuentra el error para corregirlo.

  3. **Problema: Los paneles de indicadores (Dashboards) se muestran vacíos o con datos en cero.**  
     *Posible Solución:* Verifique en la parte superior del panel que los filtros de "Periodo" (Mes/Año) y "Sucursal" estén seleccionados correctamente. Si la vista sigue vacía, significa que su departamento aún no ha cargado los datos logísticos correspondientes a ese mes.

8. # **Soporte Técnico** {#soporte-técnico}

   Si durante el uso de SCILIP se presenta algún inconveniente técnico, error inesperado o consulta sobre el funcionamiento de algún módulo, el usuario puede comunicarse con el equipo de soporte a través de los siguientes canales:

   1. ## **Correo Electrónico:** {#correo-electrónico:}

      Para reportar errores, el usuario debe describir detalladamente el problema indicando el módulo donde ocurrió, el mensaje de error mostrado en pantalla y, de ser posible, adjuntar una captura de pantalla. El equipo de soporte responderá en un plazo máximo de 24 horas hábiles.

   2. ## **Administrador del Sistema:** {#administrador-del-sistema:}

      Para solicitudes relacionadas con creación de usuarios, cambio de roles, asignación de permisos o cualquier configuración administrativa, el usuario debe contactar directamente al administrador asignado por su organización.

   3. ## **Documentación Interna:** {#documentación-interna:}

      Ante dudas sobre el uso de alguna funcionalidad específica, se recomienda consultar primero este Manual de Usuario, donde se describen paso a paso todos los procedimientos disponibles en el sistema.

   Se recomienda al usuario no compartir sus credenciales de acceso con terceros y reportar de inmediato cualquier acceso no autorizado o comportamiento inusual del sistema al administrador correspondiente.