# Documentación Técnica Pro - DistroVantix

## 1. Visión General del Proyecto

**DistroVantix** es un ecosistema educativo digital diseñado para democratizar el acceso y conocimiento de GNU/Linux. La plataforma no solo recomienda distribuciones, sino que educa al usuario a través de perfiles de uso, documentación técnica simplificada y una comunidad interactiva.

### 1.1 Ficha Técnica

| Atributo | Detalle |
|----------|---------|
| **Core** | Frontend Vanilla JS (Single Page Interaction Pattern) |
| **BaaS** | Supabase (Database, Auth, RLS) |
| **Diseño** | Custom CSS con Sistema de Tokens (Variables CSS) |
| **Arquitectura** | Modular por categorías y distribuciones |
| **Seguridad** | Render seguro con DOM API, RLS en base de datos, sin `innerHTML` para datos de usuario |
| **URL Oficial** | [https://distro-vantix.vercel.app/](https://distro-vantix.vercel.app/) |
| **Última actualización** | Julio 2026 |

---

## 2. Arquitectura de Software y Diseño

### 2.1 Sistema de Diseño (UI/UX)

El proyecto implementa un **Sistema de Tokens de Diseño** mediante variables CSS, permitiendo consistencia visual en todo el sitio:

- **Paleta de Colores:** Tono primario nocturno (`--bg-main: #0f1f3d`) con acentos esmeralda (`--accent: #22c55e`).
- **Layout:** Uso intensivo de `clamp()` para tipografías y paddings responsivos.
- **Interactividad:** Animaciones `fadeInDown` y transiciones `cubic-bezier` para sensación de fluidez moderna.
- **Componentes:** Modales flotantes, tarjetas de perfil, badges de rol, formularios con feedback en tiempo real.

### 2.2 Arquitectura de Autenticación

La autenticación sigue un patrón de **fuente única** con separación de responsabilidades:

```
┌─────────────────────────────────────────────────────┐
│  authGlobal.js  (Fuente única de estado y sesión)   │
│  - Inicializa cliente Supabase                      │
│  - Gestiona signIn / signUp / signOut                │
│  - Mantiene sesión, perfil y listeners              │
│  - Expone API pública: window.DistroVantixAuth      │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐    ┌──────────────────────────┐
│ perfilGlobal.js  │    │ Foro.js                  │
│ (UI de perfil)   │    │ (UI del foro)            │
│ - Modal login/   │    │ - CRUD comentarios       │
│   registro       │    │ - Feed de comentarios    │
│ - Edición perfil │    │ - Moderación visual      │
│ - Navbar avatar  │    │                          │
└──────────────────┘    └──────────────────────────┘
```

**Flujo de inicialización:**
1. `perfilGlobal.js` se carga en cada página.
2. Llama a `ensureAuthModule()` que carga `authGlobal.js` si no está disponible.
3. `authGlobal.js` inicializa el cliente Supabase, obtiene la sesión activa y crea/recupera el perfil.
4. `perfilGlobal.js` se suscribe con `auth.onChange()` para reaccionar a cambios de sesión.
5. La UI se actualiza: navbar muestra avatar/nick o botón de invitado.

### 2.3 Estructura de Datos (Supabase)

#### Tabla `usuario` (Identidad)

Gestiona el perfil extendido del usuario vinculado a Supabase Auth.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_usuario` | UUID (PK) | FK a `auth.users.id` |
| `email` | text | Correo electrónico del usuario |
| `nick` | text (3-30 chars) | Nombre de usuario visible |
| `avatar_url` | text | Emoji simple o URL de imagen `https:` |
| `descripcion` | text (max 200) | Biografía del usuario |
| `distro_favorita` | text | Distribución favorita |
| `estado` | text | `'activo'` o `'suspendido'` |
| `rol` | text | `'usuario'` o `'ADMIN'` |

- **RLS:** `id_usuario = auth.uid()` garantiza que solo el dueño edite su perfil.
- **Trigger:** Creación automática mediante función PL/pgSQL `crear_perfil_usuario_auth()` en el registro.
- **Permitido en actualización del cliente:** Solo `nick`, `avatar_url`, `descripcion`, `distro_favorita`.

#### Tabla `comentario` (Interacción)

Motor del foro comunitario.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_comentario` | UUID (PK) | Identificador único |
| `id_usuario` | UUID (FK) | Referencia a `usuario` |
| `contenido` | text (1-500) | Texto del comentario |
| `fecha` | timestamp | Fecha de publicación |
| `estado` | text | `'publicado'`, `'oculto'` o `'eliminado'` |

- **Integridad:** FK `id_usuario` vinculada a perfiles.
- **Moderación:** Políticas RLS permiten update/delete al dueño O a un ADMIN.

---

## 3. Seguridad y Renderizado Seguro

### 3.1 Protección contra XSS (SEG-003 - Resuelto)

El proyecto implementa renderizado seguro para todos los datos provenientes de la base de datos que se muestran en la interfaz. **No se utiliza `innerHTML` con datos de usuario.**

**Técnicas aplicadas en `perfilGlobal.js`:**

```javascript
// ✅ SEGURO - Limpieza con textContent
container.textContent = "";

// ✅ SEGURO - Creación programática de elementos DOM
const img = document.createElement("img");
img.src = value;
img.alt = altText;
img.onerror = () => { img.src = "fallback.png"; };
container.appendChild(img);

// ✅ SEGURO - Asignación de texto plano
name.textContent = profile.nick;
```

**Función `renderAvatar()`:** Punto central del renderizado seguro:
1. Limpia el contenedor con `textContent = ""`.
2. Valida si el valor es un emoji con `esEmoji()` (longitud ≤ 8, sin `.` ni `/`).
3. Si es emoji: lo asigna como texto plano.
4. Si es URL: crea elemento `<img>` con `document.createElement()` y `setAttribute()`.
5. Incluye fallback con `onerror` para URLs rotas.

**Función `esEmoji()`:** Valida entrada para distinguir emojis de URLs:
```javascript
function esEmoji(str) {
  return Boolean(str) && str.length <= 8 && !str.includes(".") && !str.includes("/");
}
```

### 3.2 Row Level Security (RLS)

Toda interacción con la base de datos está regida por políticas:

| Operación | Política | Condición |
|-----------|----------|-----------|
| SELECT `usuario` | Lectura pública | `using (true)` |
| INSERT `usuario` | Solo autenticado | `with check (id_usuario = auth.uid())` |
| UPDATE `usuario` | Solo el dueño | `using (id_usuario = auth.uid())` |
| SELECT `comentario` | Público si publicado | `using (estado = 'publicado')` |
| INSERT `comentario` | Solo autenticado | `with check (id_usuario = auth.uid() AND estado = 'publicado')` |
| UPDATE `comentario` | Dueño o ADMIN | `using (id_usuario = auth.uid() OR EXISTS (...rol = 'ADMIN'))` |
| DELETE `comentario` | Dueño o ADMIN | Misma condición que UPDATE |

### 3.3 Restricciones de Base de Datos (Constraints)

Archivos SQL en `sql/constraints_longitud.sql`:

```sql
-- Comentarios: no vacíos, máximo 500 caracteres
ALTER TABLE public.comentario
ADD CONSTRAINT comentario_contenido_longitud
CHECK (char_length(trim(contenido)) BETWEEN 1 AND 500);

-- Estados permitidos en comentario
ALTER TABLE public.comentario
ADD CONSTRAINT comentario_estado_valido
CHECK (estado IN ('publicado', 'oculto', 'eliminado'));

-- Estados permitidos en usuario
ALTER TABLE public.usuario
ADD CONSTRAINT usuario_estado_valido
CHECK (estado IN ('activo', 'suspendido'));

-- Roles permitidos
ALTER TABLE public.usuario
ADD CONSTRAINT usuario_rol_valido
CHECK (rol IN ('usuario', 'ADMIN'));

-- Nick: 3-30 caracteres
ALTER TABLE public.usuario
ADD CONSTRAINT usuario_nick_longitud
CHECK (char_length(trim(nick)) BETWEEN 3 AND 30));

-- Descripción: máximo 200 caracteres
ALTER TABLE public.usuario
ADD CONSTRAINT usuario_descripcion_longitud
CHECK (descripcion IS NULL OR char_length(descripcion) <= 200);
```

---

## 4. Implementación del Foro (Backend-as-a-Service)

### 4.1 Flujo de Autenticación

1. **Frontend:** Captura de datos vía `loginForm` / `registerForm`.
2. **Supabase Auth:** Validación de credenciales y generación de JWT.
3. **Session Management:** Persistencia en LocalStorage manejada por el cliente de Supabase.
4. **Perfil:** `authGlobal.js` crea el perfil automáticamente via `ensureProfile()` después del login/registro.

### 4.2 Lógica de Moderación y CRUD

La lógica implementa validaciones de doble capa:
- **Capa Cliente:** Verificación de `esAdmin` para mostrar/ocultar botones de edición/eliminación.
- **Capa Servidor:** Políticas RLS que verifican el rol directamente en la base de datos antes de permitir `UPDATE` o `DELETE`.

---

## 5. Gestión de Perfil y Autenticación Global (Modal Autogestionado)

### 5.1 Comportamiento Dinámico por Estado de Sesión

- **Invitado (No logueado):** Al hacer clic en `.user-area`, se abre un modal flotante con pestañas "Iniciar Sesión" y "Crear Cuenta". Las credenciales se procesan contra Supabase Auth.
- **Logueado:** La barra de navegación se actualiza instantáneamente (sin recarga) mostrando nick y avatar. Al hacer clic en el perfil, se despliega la tarjeta interactiva con datos actuales desde la tabla `usuario`.

### 5.2 Edición de Perfil Interactiva

- **Avatar:** URL de imagen o emoji. Previsualización en tiempo real. Accesos rápidos: 🐧 🚀 💻 🔥 👾.
- **Biografía:** Texto de hasta 200 caracteres.
- **Persistencia:** `.update()` en tabla `usuario` filtrando por ID actual.
- **Cierre de Sesión:** Finaliza sesión en Supabase Auth y devuelve la interfaz a estado Invitado.

### 5.3 Arquitectura Plug-and-Play

- **Inyección HTML Dinámica:** El script inyecta la estructura del modal automáticamente si no está en el DOM.
- **Carga Dinámica:** Carga `authGlobal.js` y `perfilGlobal.css` bajo demanda.
- **Distribución:** Integrado en `index.html` y en las 23 subpáginas de `HTML/`, compartiendo la sesión de Supabase en todo el dominio.

---

## 6. Estructura de Archivos del Proyecto

```
proyecto_DistroVantix/
├── index.html                     # Punto de entrada principal
├── HTML/                          # 23 páginas de categorías y distribuciones
│   ├── Foro.html                  # Foro comunitario
│   ├── Gaming.html                # Categoría Gaming
│   ├── Personalizacion.html       # Categoría Personalización (+ sección Dotfiles y Shells de Escritorio)
│   ├── Trabajo.html               # Categoría Trabajo
│   ├── Ciberseguridad.html        # Categoría Ciberseguridad
│   ├── Desarrollo.html            # Categoría Desarrollo
│   ├── Manual.html                # Manual de usuario
│   ├── Debian.html                # Distribución Debian
│   ├── Ubuntu.html                # Distribución Ubuntu
│   ├── Fedora.html                # Distribución Fedora
│   ├── Arch.html                  # Distribución Arch Linux
│   ├── Kali.html                  # Distribución Kali Linux
│   ├── ParrotOS.html              # Distribución Parrot OS
│   ├── BlackArch.html             # Distribución BlackArch
│   ├── Garuda.html                # Distribución Garuda Linux
│   ├── CachyOS.html               # Distribución CachyOS
│   ├── Pop!_OS.html               # Distribución Pop!_OS
│   ├── Bazzite.htm                # Distribución Bazzite
│   ├── Hyperland.html             # DE Hyprland
│   ├── Gnome.html                 # DE GNOME
│   ├── KDE.html                   # DE KDE Plasma
│   ├── Corazon.html               # Easter egg
│   └── ...
├── JS/                            # 16 archivos JavaScript
│   ├── authGlobal.js              # Fuente única de auth y estado de sesión
│   ├── perfilGlobal.js            # UI de login, registro y perfil global
│   ├── Foro.js                    # Lógica del foro (CRUD comentarios)
│   ├── script.js                  # Funcionalidad global (sidebar toggle)
│   ├── Distros.js                 # Lógica de navegación de distribuciones
│   ├── Gaming.js                  # Lógica de la sección Gaming
│   ├── Personalizacion.js         # Carruseles y tabs de la sección Personalización
│   ├── Trabajo.js / Trabajos.js   # Lógica de la sección Trabajo
│   ├── Manual.js                  # Lógica del manual
│   ├── Debian.js / Kali.js / ...  # Lógica por distribución
│   ├── BlackArch.js               # Lógica de BlackArch
│   ├── Hyperland.js               # Lógica de Hyprland
│   └── Corazon.js                 # Easter egg
├── CSS/                           # 24 archivos de estilos
│   ├── style.css                  # Estilos globales y tokens de diseño
│   ├── Foro.css                   # Estilos del foro
│   ├── perfilGlobal.css           # Estilos del modal de perfil
│   ├── distros-base.css           # Estilos base para páginas de distros
│   ├── Gaming-optimized.css       # Estilos optimizados por categoría
│   ├── *_optimized.css            # Estilos optimizados por distribución
│   └── ...
├── IMGS/                          # Recursos visuales
├── sql/                           # Scripts de base de datos
│   ├── foro_policies_supabase.sql # Políticas RLS y trigger de perfil
│   └── constraints_longitud.sql   # Constraints de validación
├── PENDIENTES.md                  # Vulnerabilidades y pendientes de seguridad
├── Mejoras.md                     # Mejoras generales y roadmap
├── DOCUMENTACION.md               # Esta documentación (español)
├── DOCUMENTATION.md               # Documentación técnica (inglés)
├── BLACKBOX.md                    # Resumen para herramientas de IA
├── README.md                      # Presentación del proyecto
└── LICENSE                        # Licencia MIT
```

---

## 7. Proceso de Desarrollo y Seguridad

### 7.1 Documentación de Seguridad

El proyecto mantiene dos documentos clave para el seguimiento de mejoras:

- **`PENDIENTES.md`:** Tabla de vulnerabilidades identificadas (SEG-001 a SEG-015), clasificadas por importancia (Crítica/Alta/Media/Baja), con fecha de registro, fecha objetivo y estado.
- **`Mejoras.md`:** Tabla de mejoras generales de seguridad, rendimiento, UX y mantenimiento, con prioridades y roadmaps por etapas.

### 7.2 Vulnerabilidades Cerradas (Etapa 1)

| ID | Vulnerabilidad | Estado |
|----|---------------|--------|
| SEG-003 | XSS almacenado por `innerHTML` con datos de perfil | **Resuelto** - Render con `textContent`/`createElement` |
| Estructural | Footer no cerrado antes de scripts en `index.html` | **Resuelto** - Agregado `</footer>` correcto |
| Unificación | Auth duplicada entre `Foro.js` y `perfilGlobal.js` | **Resuelto** - `authGlobal.js` como fuente única |

### 7.3 Roadmap de Desarrollo

| Etapa | Objetivo | Fecha Objetivo |
|-------|----------|---------------|
| **Etapa 1** | Seguridad y funcionamiento base | 2026-07-20 |
| **Etapa 2** | Escalabilidad del foro (paginación, índices) | 2026-07-31 |
| **Etapa 3** | Rendimiento y calidad visual (imágenes, CSS) | 2026-08-08 |
| **Etapa 4** | Documentación y mantenimiento | 2026-08-15 |

---

## 8. Guía de Mantenimiento y Escalabilidad

### 8.1 Agregar una nueva Distribución

1. Crear `HTML/nombre-distro.html` basándose en `distros-base.css`.
2. Crear `CSS/nombre-distro-optimized.css` con estilos específicos.
3. Crear `JS/nombre-distro.js` si necesita lógica interactiva.
4. Actualizar la navegación en `JS/Distros.js` si es necesario.

### 8.2 Gestión de Administradores

Para promover a un usuario a ADMIN, ejecutar en el SQL Editor de Supabase:
```sql
UPDATE public.usuario SET rol = 'ADMIN' WHERE nick = 'nombre_usuario';
```

### 8.3 Verificación de Seguridad

Antes de cada despliegue, verificar:
- [ ] Nick, avatar y descripción no ejecutan HTML/JS al mostrarse
- [ ] Un usuario anónimo no puede consultar emails de `usuario`
- [ ] Un usuario autenticado no puede cambiar su `rol` ni `estado`
- [ ] Un usuario normal no puede editar ni eliminar comentarios ajenos
- [ ] El registro falla sin CAPTCHA válido (si está activado)
- [ ] La anon/publishable key es la única clave presente en frontend

---

## 9. Créditos y Licencia

Este proyecto es una iniciativa de código abierto liderada por **Enzo Lautaro Patiño**.

- **Licencia:** MIT License
- **Filosofía:** "Tu PC, tu libertad."

---

*Última actualización: Julio 2026*
