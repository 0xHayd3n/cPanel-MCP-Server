# cPanel MCP Server

Un servidor integral de Model Context Protocol (MCP) para gestionar cuentas de hosting de cPanel a través de asistentes de IA. Se conecta directamente a UAPI y API2 de cPanel, permitiendo la gestión en lenguaje natural del alojamiento web: DNS, DNSSEC, correo electrónico (con DKIM/SPF), bases de datos, dominios, SSL/AutoSSL, PHP, tareas cron, seguridad (WAF, bloqueador de IP, escáner de virus, 2FA), despliegue de Git, aplicaciones Node.js/Python y más.

## Características

### Gestión de Archivos
- **Listar, crear, leer, editar y eliminar archivos** en su cuenta de hosting.

### Uso de Disco
- **Información de cuota de la cuenta**: verifique el consumo y los límites de espacio en disco.

### Gestión de Bases de Datos MySQL
- **CRUD completo** para bases de datos, usuarios y privilegios.
- **Información del servidor**: detalles de la versión y restricciones.
- **Gestión de privilegios**: conceder/revocar por base de datos.

### Gestión de Bases de Datos PostgreSQL
- **CRUD completo** para bases de datos, usuarios y privilegios.
- **Conceder/revocar acceso** por base de datos.

### Gestión de Correo Electrónico
- **Cuentas de correo**: crear, eliminar, cambiar contraseña, establecer cuotas, listar con uso de disco.
- **Reenviadores**: crear, listar y eliminar reglas de reenvío de correo.
- **Autorespondedores**: crear, listar y eliminar mensajes de fuera de la oficina / respuestas automáticas.
- **Enrutamiento de correo**: ver la configuración del dominio de correo.

### Autenticación de Correo (DKIM/SPF)
- **DKIM**: habilitar, deshabilitar, validar y asegurar que las claves existan para todos los dominios.
- **SPF**: validar e instalar/actualizar registros SPF.
- **PTR**: validar registros DNS inversos.

### Filtros de Correo y Spam
- **Filtros de correo**: listar, eliminar y rastrear/probar filtros.
- **SpamAssassin**: habilitar/deshabilitar, configurar la carpeta de spam, obtener ajustes, limpiar spam.
- **Greylisting**: habilitar/deshabilitar para todos los dominios.

### Gestión de DNS
- **Obtener registros de zona** para cualquier dominio (vía API2 ZoneEdit).
- **Añadir, editar y eliminar** registros DNS (A, AAAA, CNAME, MX, TXT, SRV, CAA).

### DNSSEC
- **Habilitar/deshabilitar** DNSSEC para dominios.
- **Registros DS**: obtener para la configuración del registrador.
- **Exportación de DNSKEY**: exportar claves de zona.
- **NSEC3**: habilitar/deshabilitar (evita la enumeración de zonas).

### Gestión de Dominios
- **Listar todos los dominios**: principales, addon, subdominios y aparcados.
- **Dominios addon**: crear y eliminar.
- **Subdominios**: crear y eliminar con raíces de documentos personalizadas.
- **Dominios aparcados (alias)**: aparcar y desaparcar.
- **Redirecciones**: crear y eliminar redirecciones de URL (301/302).

### Gestión de Tareas Cron
- **Listar, crear, editar y eliminar** tareas cron (vía API2).
- **Email de notificación**: obtener y establecer la dirección de notificación de cron.

### Gestión de PHP
- **Listar versiones de PHP instaladas** disponibles en el servidor.
- **Obtener/establecer versión de PHP** por dominio.
- **Directivas PHP INI**: leer y modificar (`memory_limit`, `upload_max_filesize`, etc.).

### Gestión de SSL/TLS
- **Listar certificados** y **estado de SSL** por dominio.
- **Instalar y eliminar** certificados SSL.
- **Generar CSR** para solicitudes de certificados.
- **AutoSSL**: verificar estado y activar renovación.
- **Listar claves privadas**.

### Seguridad
- **Bloqueador de IP**: listar, bloquear y desbloquear direcciones/rangos de IP.
- **Claves SSH**: listar, importar, eliminar, autorizar y desautorizar claves.
- **Protección Hotlink**: obtener estado, habilitar con ajustes personalizados, deshabilitar.
- **Privacidad de Directorios**: listar directorios protegidos y añadir usuarios.

### ModSecurity (WAF)
- **Estado**: verificar si ModSecurity está instalado, listar estado del dominio.
- **Habilitar/deshabilitar** globalmente o por dominio.

### Autenticación de Dos Factores
- **Estado**: verificar si 2FA está configurado.
- **Configuración**: generar secreto/código QR, habilitar con verificación.
- **Eliminar**: deshabilitar 2FA.

### Escáner de Virus (ClamAV) *requiere plugin ClamAV*
- **Escanear**: iniciar escaneo de virus en un directorio.
- **Estado**: verificar progreso del escaneo.
- **Resultados**: listar archivos infectados, cuarentena/desinfectar.

### Métricas y Logs
- Estadísticas de **uso de ancho de banda**.
- **Uso de recursos**: CPU, memoria, I/O, procesos de entrada.
- **Logs de error**: entradas de error recientes.
- **Estadísticas de visitantes**: estadísticas de acceso por dominio.
- **Estadísticas de cuenta**: resumen de cuentas de correo, bases de datos, dominios, disco, ancho de banda.

### Gestión de Backups
- **Backup completo de cuenta** al directorio home.
- **Backups parciales**: directorio home, bases de datos y correo por separado.
- **Restaurar**: restauración de base de datos y archivos desde backup.
- **Listar backups disponibles**.

### Gestión de FTP
- **Listar cuentas FTP** con uso de disco.
- **Crear y eliminar** cuentas FTP.
- **Cambiar contraseña y cuota**.
- **Sesiones activas**: listar y terminar.
- Información del **puerto del servidor**.

### Aplicaciones y Despliegue
- **WordPress**: listar instalaciones *(requiere WP Toolkit / Instance Manager)*.
- **Apps Node.js/Python/Ruby**: registrar, anular registro, habilitar, deshabilitar, instalar dependencias *(requiere Phusion Passenger)*.
- **Repositorios Git**: crear, listar, actualizar, eliminar y desplegar vía `.cpanel.yml` *(requiere la función Git Version Control)*.

### Gestión de la Cuenta
- **Tokens de API**: listar, crear, renombrar y revocar.
- **Funciones (Features)**: listar funciones disponibles, verificar si funciones específicas están habilitadas.
- **Información de la cuenta**: información del usuario, detalles del servidor.

## Instalación y Configuración

### Requisitos Previos
- Node.js 18+
- Una cuenta de cPanel con acceso a token de API

### Construcción (Build)

```bash
npm install
npm run build
```

### Configuración

Añada lo siguiente a su configuración de ajustes de MCP (por ejemplo, `claude_desktop_config.json`, `cline_mcp_settings.json` o la configuración de MCP de su IDE):

```json
{
  "mcpServers": {
    "cpanel": {
      "command": "node",
      "args": ["/path/to/cPanel-MCP-Server/build/index.js"],
      "env": {
        "CPANEL_USERNAME": "su_usuario_de_cpanel",
        "CPANEL_API_TOKEN": "su_token_de_api_de_cpanel",
        "CPANEL_SERVER_URL": "https://su-dominio.com:2083"
      }
    }
  }
}
```

Reemplace los valores marcadores por sus credenciales reales de cPanel.

### Variables de Entorno

| Variable | Requerido | Predeterminado | Descripción |
|----------|-----------|----------------|-------------|
| `CPANEL_USERNAME` | Sí | — | Nombre de usuario de la cuenta de cPanel |
| `CPANEL_API_TOKEN` | Sí | — | Token de API para autenticación |
| `CPANEL_SERVER_URL` | Sí | — | URL del servidor de cPanel (ej. `https://example.com:2083`) |
| `CPANEL_TIMEOUT_MS` | No | `30000` | Tiempo de espera de la solicitud en milisegundos |
| `CPANEL_VERIFY_SSL` | No | `true` | Establecer en `false` para deshabilitar la verificación de certificado SSL (para certificados autofirmados) |

### Cómo obtener un Token de API de cPanel

1. Inicie sesión en cPanel.
2. Vaya a **Seguridad** > **Gestionar Tokens de API**.
3. Cree un nuevo token con un nombre descriptivo.
4. Copie el token; no se volverá a mostrar.

## Herramientas Disponibles (164 en total)

| Categoría | Cantidad |
|-----------|----------|
| Gestión de Archivos | 5 |
| Uso de Disco | 1 |
| MySQL | 9 |
| PostgreSQL | 8 |
| Email (cuentas, reenviadores, autorespondedores) | 12 |
| Autenticación de Email (DKIM/SPF/PTR) | 7 |
| Filtros de Email y Spam | 12 |
| DNS | 4 |
| DNSSEC | 6 |
| Dominios (addon, sub, aparcados, redirecciones) | 14 |
| Tareas Cron | 6 |
| PHP | 5 |
| SSL/TLS y AutoSSL | 8 |
| Seguridad (bloqueador IP, SSH, hotlink, privacidad) | 13 |
| ModSecurity (WAF) | 5 |
| Auth de Dos Factores | 4 |
| Escáner de Virus (ClamAV) | 4 |
| Métricas y Logs | 5 |
| Backups | 7 |
| FTP | 8 |
| WordPress | 1 |
| Apps Passenger (Node.js/Python/Ruby) | 6 |
| Control de Versiones Git y Despliegue | 6 |
| Tokens de API | 4 |
| Info de Cuenta y Servidor | 4 |

## Arquitectura

```
src/
├── index.ts           # Punto de entrada del servidor MCP — registra los 25 módulos de herramientas
├── cpanel-api.ts      # Cliente de API de cPanel (UAPI + API2, auth por token, manejo de errores)
└── tools/
    ├── files.ts           # Operaciones de archivos (Fileman)
    ├── disk.ts            # Uso de disco (Quota, DiskUsage)
    ├── mysql.ts           # Bases de datos MySQL (Mysql)
    ├── postgresql.ts      # Bases de datos PostgreSQL (Postgresql)
    ├── email.ts           # Cuentas de email, reenviadores, autorespondedores (Email)
    ├── email-auth.ts      # Validación DKIM, SPF, PTR (EmailAuth)
    ├── email-filters.ts   # Filtros, SpamAssassin, Greylisting
    ├── dns.ts             # Registros de zona DNS (DNS)
    ├── dnssec.ts          # Gestión de DNSSEC (DNSSEC)
    ├── domains.ts         # Dominios, subdominios, redirecciones
    ├── cron.ts            # Tareas cron (API2 Cron)
    ├── php.ts             # Versión de PHP e INI (LangPHP)
    ├── ssl.ts             # SSL/TLS y AutoSSL (SSL)
    ├── security.ts        # Bloqueador de IP, SSH, hotlink, privacidad
    ├── modsecurity.ts     # WAF ModSecurity
    ├── twofa.ts           # Autenticación de dos factores
    ├── virus-scanner.ts   # Escáner de virus ClamAV
    ├── metrics.ts         # Ancho de banda, recursos, logs, estadísticas
    ├── backups.ts         # Backups completos y parciales, restauración
    ├── ftp.ts             # Cuentas y sesiones FTP
    ├── wordpress.ts       # Instalaciones de WordPress
    ├── passenger.ts       # Apps Node.js/Python/Ruby
    ├── version-control.ts # Repos Git y despliegue
    ├── tokens.ts          # Gestión de tokens de API
    └── features.ts        # Verificación de funciones e info del servidor
```

## Compatibilidad de la API

- **UAPI** (preferido) — utilizado para la mayoría de los módulos.
- **API2** (legado) — utilizado donde cPanel no tiene un equivalente en UAPI:
  - **Tareas cron** — `Cron::fetchcron`, `add_line`, `edit_line`, `remove_line`, `get_email`, `set_email`
  - **Registros DNS** — `ZoneEdit::fetchzone_records`, `add_zone_record`, `edit_zone_record`, `remove_zone_record`
  - **Subdominios** — `SubDomain::listsubdomains`, `addsubdomain`, `delsubdomain`
  - **Dominios addon** — `AddonDomain::listaddondomains`, `addaddondomain`, `deladdondomain`
  - **Dominios aparcados** — `Park::listparkeddomains`, `park`, `unpark`
  - **Lista de bloqueo de IP** — `DenyIp::listdenyips`
- Ambas versiones de la API comparten el mismo cliente autenticado con lógica de reintentos y manejo de errores.

## Seguridad

Sus credenciales de cPanel se cargan desde variables de entorno en tiempo de ejecución y nunca se almacenan en el repositorio. El token de la API debe tratarse como un secreto; no lo incluya en el control de versiones.

## Licencia

ISC
