# 📍 Ruteo Agrofield

App web para registrar el **ruteo diario de los vendedores mayoristas** de Ventas Externas: jornadas, visitas a clientes con GPS, cumplimiento de visitas, geolocalización de clientes y cálculo de **km recorridos y viático de combustible**.

- **Costo:** G. 0. Usa servicios gratuitos de Google (Apps Script + Google Sheets) y GitHub Pages.
- **Usuarios:** vendedores (celular Android con Chrome), supervisores de canal y administrador.
- **Funciona sin señal:** los registros se guardan en el celular y se envían solos cuando vuelve la conexión.

---

## Índice

1. [Cómo funciona](#1-cómo-funciona)
2. [Archivos del proyecto](#2-archivos-del-proyecto)
3. [Instalación desde cero](#3-instalación-desde-cero)
4. [Planillas de supervisores](#4-planillas-de-supervisores)
5. [Uso diario](#5-uso-diario)
6. [Estructura de la planilla central](#6-estructura-de-la-planilla-central)
7. [Parámetros (hoja Config)](#7-parámetros-hoja-config)
8. [Mantenimiento y actualizaciones](#8-mantenimiento-y-actualizaciones)
9. [Solución de problemas](#9-solución-de-problemas)
10. [Límites y consideraciones](#10-límites-y-consideraciones)

---

## 1. Cómo funciona

```
📱 App en el celular (esta página, publicada en GitHub Pages)
        │  envía jornadas y visitas (con GPS)
        ▼
☁️ Servidor: Google Apps Script (Code.gs)
        │  valida código + PIN, guarda, calcula km con Google Maps
        ▼
📘 PLANILLA CENTRAL (Google Sheets) ── solo Administrador y Gerente Comercial
        │  cada 5 minutos copia los datos de cada equipo y lee lo que cargó cada supervisor
        ▼
📗 Supermercados   📗 Ferreterías   📗 Veterinarias   ← una planilla por supervisor
```

**Flujo del vendedor en un día:**

1. **Iniciar jornada:** se guarda su ubicación de partida.
2. En cada cliente, **"Llegué"** (check-in): se guarda la ubicación y la app calcula la distancia al cliente.
   - Hasta 200 m → **Válida**.
   - Más de 200 m → **Fuera de rango**.
   - Cliente sin coordenadas → se guarda la ubicación del vendedor como la del cliente, **pendiente de validación**.
3. Elige el **resultado** de la visita y toca **"Terminar visita"** (check-out). Queda registrado el tiempo de permanencia.
4. **Finalizar jornada:** el servidor suma la distancia **por calle** (Google Maps) entre todos los puntos del día: inicio → clientes → fin.

**Viático = km del día × precio por km** (configurable, hoy G. 1.400).

> 🔒 La app **solo registra la ubicación cuando el vendedor toca un botón**. Nunca rastrea en segundo plano.

**Quién ve qué:**

| | Vendedor | Supervisor | Administrador |
|---|---|---|---|
| Clientes en la app | Solo los asignados | Los de su canal | Todos |
| Cantidad de visitas | ✅ | ✅ | ✅ |
| Km y viático | ❌ | ✅ (su equipo, en su planilla) | ✅ (todo, en la central) |
| Corregir ubicación de un cliente | Propone (requiere aprobación) | Corrige directo / aprueba | Corrige directo / aprueba |
| Alta, baja y PIN de vendedores | ❌ | ✅ (su equipo) | ✅ (todos) |

---

## 2. Archivos del proyecto

| Archivo | Dónde va | Para qué |
|---|---|---|
| `index.html` | GitHub (este repo) | La app completa: pantallas y lógica |
| `config.js` | GitHub | **Único archivo que se edita:** la URL del servidor |
| `sw.js` | GitHub | Guarda la app en el celular para que abra sin señal |
| `manifest.json` | GitHub | Permite instalar la app con ícono en el celular |
| `icon-192.png`, `icon-512.png` | GitHub | Íconos |
| `README.md` | GitHub | Este documento |
| `Code.gs` | **Apps Script** (dentro de la planilla central) | El servidor. **No hace falta subirlo al repo** |

> ⚠️ Este repositorio es **público**: el código de la app se puede ver, pero **los datos no**. Los datos están en la planilla de Google, que es privada, y el servidor rechaza cualquier pedido sin código de vendedor y PIN válidos. **Nunca subas al repo** planillas, listas de vendedores ni PIN.

---

## 3. Instalación desde cero

### Paso 1: Cuenta de Google de la empresa
1. Entra a **accounts.google.com/signup** y crea una cuenta exclusiva para la app (ej: `ruteo.agrofield@gmail.com`).
2. Guarda la contraseña en un lugar seguro y compártela con tu jefe. La app no puede depender de una cuenta personal.
3. Todos los pasos siguientes se hacen con esa cuenta. Si tienes otra cuenta de Google abierta, usa una ventana de incógnito (**Ctrl+Shift+N**).

### Paso 2: Planilla central
1. **drive.google.com** → **+ Nuevo** → **Hojas de cálculo de Google** → **Hoja de cálculo en blanco**.
2. Nómbrala **`APP_Ruteo_DB`**.

### Paso 3: Pegar el servidor
1. En la planilla: **Extensiones → Apps Script**.
2. Nombra el proyecto **`Ruteo Agrofield Servidor`**.
3. En el editor borra todo (**Ctrl+A**, **Supr**).
4. Abre `Code.gs` con el Bloc de notas, copia todo (**Ctrl+A**, **Ctrl+C**) y pégalo en el editor (**Ctrl+V**).
5. Guarda con **Ctrl+S**.
6. En **⚙️ Configuración del proyecto**, pon la **Zona horaria** en **(GMT-03:00) Asunción**.

### Paso 4: Crear las hojas
1. Vuelve a la planilla y recárgala (**F5**). Aparece el menú **🛰️ Ruteo**.
2. **🛰️ Ruteo → 1. Crear / verificar hojas**.
3. La primera vez Google pide permisos: **Continuar → elige la cuenta → Configuración avanzada → Ir a Ruteo Agrofield Servidor (no seguro) → Permitir**. Es normal, porque el código es propio y Google no lo revisó.
4. Ejecuta el menú otra vez. Debe aparecer **"✅ Hojas listas"**.

### Paso 5: Cargar datos
- **Vendedores:** una fila por persona, **con el código del ERP** en `ID_Vendedor`. Ver [estructura](#6-estructura-de-la-planilla-central).
- **Clientes:** exporta del ERP código, razón social, **canal**, dirección y ciudad. Si hay coordenadas, van en `Latitud` y `Longitud`, en columnas separadas.
- **Asignaciones:** qué vendedor atiende qué cliente (una fila por par cliente-vendedor; la marca es opcional).

> 💡 **Coordenadas desde Google Maps:** clic derecho sobre el local → clic en el primer renglón (los números). Se copian como `-25.2867, -57.6470`.

### Paso 6: Probar Google Maps
**🛰️ Ruteo → 2. Probar conexión con Google Maps.** Debe mostrar la distancia en línea recta y por calle.

También puedes usar estas fórmulas en cualquier celda (en planillas en español se separa con `;`):
```
=DISTANCIA_CALLE(-25,2823; -57,6350; -25,2925; -57,5800)
=DISTANCIA_RECTA(-25,2823; -57,6350; -25,2925; -57,5800)
```

### Paso 7: Publicar el servidor
1. En Apps Script: **Implementar → Nueva implementación**.
2. ⚙️ **Tipo: Aplicación web**.
3. **Ejecutar como: Yo**. **Quién tiene acceso: Cualquier persona**.
4. **Implementar** y copia la **URL que termina en `/exec`**.
5. Prueba: abre esa URL en el navegador. Debe responder `{"ok":true,"mensaje":"API Ruteo Agrofield funcionando",...}`.

### Paso 8: Conectar la app con el servidor
Edita `config.js` y pega la URL entre las comillas:
```js
API_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec',
```

### Paso 9: Publicar la app en GitHub Pages
1. Sube a este repo: `index.html`, `config.js`, `sw.js`, `manifest.json`, `icon-192.png`, `icon-512.png` y `README.md` (**Add file → Upload files → Commit changes**).
2. **Settings → Pages → Branch: `main` / `(root)` → Save**.
3. En 1 o 2 minutos aparece la URL: `https://USUARIO.github.io/NOMBRE-DEL-REPO/`.

### Paso 10: Instalar en el celular
1. Abre la URL de GitHub Pages en **Chrome** (Android).
2. Ingresa con el **código de vendedor** y el **PIN**.
3. Cuando lo pida, **permite la ubicación**.
4. **⋮ → Instalar aplicación** (o "Agregar a la pantalla principal").

---

## 4. Planillas de supervisores

Cada supervisor tiene **su propia planilla** con solo los datos de **su canal**. No ve los otros canales ni la planilla central.

### Crear una planilla de supervisor
1. En la central, carga al supervisor en **Vendedores** con `Rol = Supervisor`. Sus vendedores deben tener su código en `ID_Supervisor`.
2. Verifica que la columna **Canal** de **Clientes** esté completa.
3. **🛰️ Ruteo → 👥 Crear planilla de supervisor** → escribe el **ID del supervisor** y luego su **canal**.
4. El link de la planilla nueva queda en la hoja **Satelites**.

### Darle acceso al supervisor
El supervisor necesita una **cuenta de Google con su correo de Outlook**. No hace falta un Gmail nuevo:
1. **accounts.google.com/signup** → nombre → en el correo elige **"Usar tu dirección de correo electrónico actual"**.
2. Escribe su correo de Outlook y verifica con el código que le llega.
3. Tú abres su planilla → **Compartir** → su correo → **Editor** → **Enviar**.

> No compartas nunca las planillas "con cualquier persona que tenga el enlace".

### Activar la sincronización automática
**🛰️ Ruteo → ⏱️ Activar sincronización automática (cada 5 min).** Corre en los servidores de Google, aunque tu PC esté apagada. Por defecto, de 6:00 a 21:00.

- **Sincronizar ya:** 🛰️ Ruteo → 🔄 Sincronizar planillas de supervisores ahora.
- **Estado de cada canal:** hoja **Satelites**, columnas `Ultima_Sync` y `Resultado_Sync`.

### Pestañas de la planilla del supervisor

| Pestaña | Tipo | Contenido |
|---|---|---|
| Instrucciones | 🔒 lectura | Guía rápida y fecha de la última sincronización |
| Resumen | 🔒 lectura | Por día y vendedor: visitas, válidas, fuera de rango, % de cumplimiento, minutos promedio, **km y viático** |
| **Solicitudes_Vendedores** | ✏️ edita | Alta / Baja / Reactivar / Cambiar PIN |
| **Asignaciones** | ✏️ edita | Cliente ↔ vendedor (↔ marca) de su canal |
| **Correcciones_Ubicacion** | ✏️ edita | Aprobar o rechazar ubicaciones informadas por vendedores |
| Mi_Equipo | 🔒 lectura | Vendedores, PIN y estado |
| Clientes | 🔒 lectura | Clientes del canal con ubicación y vendedores asignados |
| Jornadas / Visitas | 🔒 lectura | Detalle de los últimos 35 días |

---

## 5. Uso diario

### Vendedor
| Acción | Cómo |
|---|---|
| Empezar el día | **▶ Iniciar jornada** (al salir a ruta) |
| Buscar un cliente | Buscador, o **📍 Ordenar por cercanía** |
| Llegar al cliente | Ficha del cliente → **✅ Llegué — registrar visita** |
| Ir hasta el cliente | Ficha → **🧭 Cómo llegar** (abre Google Maps) |
| Terminar la visita | Elegir resultado → **🏁 Terminar visita** ("Otro" exige observación) |
| La ubicación del cliente está mal | En una visita "Fuera de rango" → **📍 Informar ubicación correcta** (parado en la entrada del local) |
| Terminar el día | **⏹ Finalizar jornada** |
| Sin señal | Seguir trabajando. Arriba se ve "⏳ N pendientes" |
| Al volver la señal | **Abrir la app** hasta ver **"✓ Al día"** |

**Resultados de visita:** Pedido tomado · Sin pedido – tiene stock · Sin pedido – no le interesa · Cliente cerrado · Solo cobranza · Otro.

### Supervisor (en su planilla)
- **Alta de vendedor:** `Solicitudes_Vendedores` → `Accion = Alta`, `ID_Vendedor` = **código del ERP**, `Nombre`, `Telefono`, `Nuevo_PIN` (4 a 6 números).
- **Baja / Reactivar:** `Accion` + `ID_Vendedor`.
- **Cambiar PIN:** `Accion = Cambiar PIN` + `ID_Vendedor` + `Nuevo_PIN`.
- **Asignar clientes:** pestaña `Asignaciones`, una fila por cliente-vendedor. Para quitar una asignación, borra la fila. La columna `Observacion` indica ✅ o el error.
- **Correcciones de ubicación:** abre `Mapa_Actual` y `Mapa_Propuesta`, compara y elige **Aprobar** o **Rechazar** en `Decision`.

Los cambios se aplican en **hasta 5 minutos**. La columna `Estado` confirma cada solicitud o explica por qué se rechazó.

### Administrador (en la central)
| Menú 🛰️ Ruteo | Para qué |
|---|---|
| 1. Crear / verificar hojas | Crea las hojas o columnas que falten (no borra nada) |
| 2. Probar conexión con Google Maps | Verifica el cálculo de distancias |
| Recalcular km de la jornada seleccionada | En la hoja Jornadas, con una fila seleccionada |
| Cerrar jornadas olvidadas | Cierra jornadas "Abiertas" de días anteriores |
| ✅ Aprobar / ❌ Rechazar ubicación | En la hoja Clientes, con una fila seleccionada |
| 👥 Crear planilla de supervisor | Ver [sección 4](#4-planillas-de-supervisores) |
| 🔄 / ⏱️ / ⏸️ Sincronización | Forzar, activar o desactivar la sincronización |

---

## 6. Estructura de la planilla central

| Hoja | Columnas principales | La completa |
|---|---|---|
| **Vendedores** | `ID_Vendedor` (código ERP), `Nombre`, `PIN`, `Rol` (Vendedor / Supervisor / Admin), `ID_Supervisor`, `Telefono`, `Activo` | Admin + supervisores |
| **Clientes** | `ID_Cliente`, `Razon_Social`, `Canal`, `Direccion`, `Ciudad`, `Latitud`, `Longitud`, `Estado_Ubicacion`, … | Admin (ERP) + app |
| **Asignaciones** | `ID_Cliente`, `ID_Vendedor`, `Marca` | Supervisores (por canal) |
| **Jornadas** | Inicio, fin, `Cant_Visitas`, `Km_Total`, `Monto_Viatico`, `Estado` | App |
| **Visitas** | Check-in, check-out, `Minutos`, `Distancia_Cliente_m`, `Estado_Visita`, `Resultado`, `Observacion` | App |
| **Tramos** | Cada tramo del día: `Km_Linea_Recta`, `Km_Calle`, `Metodo` (para auditar el cálculo) | App |
| **Satelites** | Planillas de supervisores y resultado de la última sincronización | Sistema |
| **Config** | Parámetros | Admin |
| **Log** | Errores y acciones de supervisores | Sistema |

**Estados de ubicación del cliente:** `Importada ERP` · `Sin ubicación` · `Pendiente validación` (cargada en la primera visita) · `Corrección pendiente` (propuesta por un vendedor) · `Validada` · `Corrección rechazada`.

**Estados de visita:** `Válida` · `Válida (ubicación corregida)` · `Fuera de rango` · `Ubicación registrada` · `Sin ubicación cliente` · `Sin GPS`.

> ⚠️ **Asignaciones de un canal con planilla de supervisor:** se editan **solo en la planilla del supervisor**. Si se cambian en la central, se reemplazan en la siguiente modificación del supervisor.

---

## 7. Parámetros (hoja Config)

| Parámetro | Valor inicial | Qué controla |
|---|---|---|
| `PRECIO_KM` | 1400 | Guaraníes por km recorrido |
| `RADIO_VALIDO_M` | 200 | Metros máximos al cliente para que la visita sea válida |
| `FACTOR_RODEO` | 1.3 | Multiplicador de la línea recta si Google Maps no responde |
| `PRECISION_MAX_UBICAR_M` | 100 | Precisión GPS mínima exigida para guardar o corregir la ubicación de un cliente |
| `KM_MIN_PARA_MAPS` | 0.15 | Tramos más cortos que esto no consultan a Google Maps |
| `SYNC_HORA_INICIO` | 6 | Hora de inicio de la sincronización |
| `SYNC_HORA_FIN` | 21 | Hora de fin de la sincronización |
| `DIAS_HISTORIAL_SATELITE` | 35 | Días de historial copiados a cada supervisor |

Los cambios aplican desde la siguiente jornada o sincronización.

---

## 8. Mantenimiento y actualizaciones

### Actualizar el servidor (`Code.gs`)
1. Apps Script → borra todo → pega el `Code.gs` nuevo → **Ctrl+S**.
2. **Implementar → Gestionar implementaciones → ✏️ → Versión: Nueva versión → Implementar.**
3. ⚠️ **No uses "Nueva implementación"**: genera otra URL y la app deja de conectarse.
4. Recarga la planilla y ejecuta **🛰️ Ruteo → 1. Crear / verificar hojas** (agrega las columnas nuevas, si las hay).

### Actualizar la app (`index.html`, etc.)
1. Sube los archivos modificados al repo.
2. **Siempre** cambia en `sw.js` el número de versión (`ruteo-v3` → `ruteo-v4`, etc.). Si no, los celulares siguen mostrando la versión guardada.
3. En el celular: cerrar y abrir la app dos veces.

### Respaldo
- La planilla central guarda su historial: **Archivo → Historial de versiones**.
- Recomendado: una vez por mes, **Archivo → Descargar → Microsoft Excel**.

### Si un supervisor cambia o deja la empresa
1. Su planilla → **Compartir** → quita su acceso y agrega al nuevo.
2. En la central, actualiza `ID_Supervisor` de sus vendedores (o carga al nuevo supervisor con el mismo código).

---

## 9. Solución de problemas

| Problema | Causa probable | Solución |
|---|---|---|
| "Código o PIN incorrecto" | Error al tipear, o el PIN perdió el cero inicial | Revisar en Vendedores; la columna PIN debe estar en formato texto (se corrige con 🛰️ Ruteo → 1) |
| "Usuario inactivo" | `Activo` en FALSE | Reactivar desde la planilla del supervisor o en la central |
| "Falta configurar la URL del servidor" | `config.js` sin la URL | Paso 8 |
| "No hay conexión con el servidor" al ingresar | Sin señal, o URL `/exec` incorrecta | El primer ingreso requiere señal; abrir la URL `/exec` en el navegador para verificar |
| "Permiso de ubicación denegado" | Chrome bloqueó el GPS | Chrome → ⋮ → Configuración → Configuración de sitios → Ubicación → permitir el sitio |
| "Señal GPS débil" | Interior de un edificio | Salir a la vereda y reintentar |
| "⏳ N pendientes" no baja | Sin señal o servidor ocupado | Con señal: menú ⋮ → **Enviar pendientes ahora**. Ver ⋮ → **Ver errores de envío** |
| Siempre "Fuera de rango" en un cliente | Coordenadas del ERP incorrectas | "Informar ubicación correcta" → aprobar ([sección 5](#5-uso-diario)) |
| Km en 0 o muy bajos | Jornada sin inicio o fin, o sin GPS | Revisar la hoja **Tramos** de esa jornada y usar **Recalcular km** |
| La app muestra una versión vieja | No se cambió la versión de `sw.js` | [Sección 8](#8-mantenimiento-y-actualizaciones) |
| El menú 🛰️ Ruteo no aparece | La planilla no terminó de cargar, o el código no se guardó | F5 y esperar; revisar que Apps Script tenga el código y esté guardado |
| `Resultado_Sync` con ❌ | Planilla de supervisor borrada o sin acceso | Leer el mensaje; revisar que la planilla exista y sea de la cuenta de la empresa |
| La planilla del supervisor no se actualiza | Sincronización desactivada o fuera de horario | ⏱️ Activar sincronización, o 🔄 Sincronizar ahora |

---

## 10. Límites y consideraciones

- **Sin rastreo continuo:** los km se calculan por la **ruta más corta por calle** entre los puntos marcados. No captan desvíos, y eso es intencional para el viático. Si el vendedor olvida iniciar o finalizar la jornada, los km quedan incompletos.
- **Cuotas gratuitas de Google** (cuentas @gmail.com): 1.000 consultas de rutas por día (con 25 vendedores se usan unas 400) y 90 minutos por día de procesos automáticos (la sincronización está optimizada y solo corre en horario laboral).
- **Envíos pendientes:** se mandan solos cuando la app está abierta y hay señal. Cerrar la app con pendientes no los pierde, pero no se envían hasta volver a abrirla.
- **Privacidad:** los vendedores deben estar informados, por escrito, de que la app registra su ubicación **solo al tocar los botones**, con fines de viático y control de visitas.
