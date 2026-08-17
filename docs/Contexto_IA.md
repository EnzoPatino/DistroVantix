# Contexto_IA - DistroVantix

> Guia completa de contexto del proyecto para asistentes de IA.
> Ultima actualizacion: Agosto 2026

---

## 1. Identificacion del Proyecto

| Atributo | Detalle |
|---|---|
| **Nombre** | DistroVantix |
| **Slogan** | "Tu PC, tu libertad" / "Encuentra tu Linux Ideal" |
| **Descripcion** | Plataforma educativa interactiva para ayudar a hispanohablantes a descubrir, elegir y migrar a distribuciones GNU/Linux. Incluye recomendaciones por categoria, documentacion de distros, manual de usuario y foro comunitario. |
| **Tipo** | Sitio web estatico Multi-Pagina (MPA) |
| **Idioma** | Espanol (principal), documentacion en ingles |
| **Autor** | Enzo Lautaro Patino |
| **Licencia** | MIT License (2026 EnzoPatino) |
| **URL Live** | https://distro-vantix.vercel.app/ |
| **GitHub** | https://github.com/EnzoPatino/DistroVantix.git |
| **Branch principal** | `main` |

---

## 2. Stack Tecnologico

### Frontend
- **HTML5** -- Markup semantico, arquitectura MPA estatica
- **CSS3** -- Custom properties (design tokens), animaciones, flexbox, grid, responsive
- **JavaScript vanilla (ES6+)** -- Manipulacion del DOM, async/await, modulos IIFE, IntersectionObserver, rendering seguro con `textContent`

### Backend / BaaS
- **Supabase** (PostgreSQL + Auth + Row Level Security)
  - URL: `https://hagcsftbwbglyjdtvrnz.supabase.co`
  - SDK: `@supabase/supabase-js@2` (cargado desde CDN, version sin fijar)
  - Solo se usa la clave anon/publica en el frontend

### Integraciones de Terceros
- **Cloudflare Turnstile** -- Widget CAPTCHA (en Foro.html, integracion con Auth pendiente)
- **Google Fonts** -- Cargado via `@import` en Foro.css

### Hosting
- **Vercel** -- Despliegue de sitio estatico

### NO usa
- Sin `package.json`, `node_modules`, npm, webpack, vite ni bundler
- Sin TypeScript
- Sin framework (Angular, React, Vue, Ionic)
- Sin ESLint, Prettier ni configuracion de linting
- Sin Docker ni CI/CD

---

## 3. Arquitectura del Proyecto

### 3.1 Aplicacion Multi-Pagina (MPA)
NO es una SPA. Es un sitio web estatico clasico donde cada archivo HTML es una pagina independiente con su propio `<head>` que carga CSS y JS especificos. Las paginas comparten la sesion de Supabase via localStorage del navegador.

### 3.2 Estructura de Directorios

```
proyecto_DistroVantix/
|-- index.html                       # Pagina principal (landing)
|-- LICENSE                          # Licencia MIT
|-- README.md                        # Presentacion del proyecto
|-- BLACKBOX.md                      # Resumen para IA (ingles)
|-- DOCUMENTACION.md                 # Documentacion tecnica (espanol)
|-- DOCUMENTATION.md                 # Documentacion tecnica (ingles)
|-- Mejoras.md                       # Hoja de ruta de mejoras
|-- PENDIENTES.md                    # Rastreador de vulnerabilidades
|-- .gitignore
|
|-- HTML/                            # 23 paginas
|   |-- Gaming.html                  # Categoria: Gaming
|   |-- Personalizacion.html         # Categoria: Personalizacion
|   |-- Trabajo.html                 # Categoria: Trabajo
|   |-- Ciberseguridad.html          # Categoria: Ciberseguridad
|   |-- Desarrollo.html              # Categoria: Desarrollo
|   |-- computacion grafica.html     # Categoria: Computacion Grafica
|   |-- Foro.html                    # Foro comunitario (Supabase)
|   |-- Manual.html                  # Manual de usuario (libro interactivo)
|   |-- Debian.html                  # Paginas de distribuciones...
|   |-- Ubuntu.html
|   |-- Fedora.html
|   |-- arch linux.html
|   |-- Garuda.html
|   |-- CachyOS.html
|   |-- Pop!_OS.html
|   |-- Bazzite.htm                  # NOTA: extension .htm (inconsistencia)
|   |-- Kali.html
|   |-- ParrotOS.html
|   |-- BlackArch.html
|   |-- Gnome.html                   # Entornos de escritorio
|   |-- KDE.html
|   |-- Hyperland.html
|   |-- Corazon.html                 # Easter egg (corazon animado)
|
|-- JS/                              # 16 archivos JavaScript
|   |-- authGlobal.js                # Fuente unica de Auth, sesion y perfil (288 lineas)
|   |-- perfilGlobal.js              # Modal global de login/registro/perfil (412 lineas)
|   |-- Foro.js                      # Logica del foro: CRUD comentarios, auth, moderacion (616 lineas)
|   |-- script.js                    # Toggle sidebar global (28 lineas)
|   |-- Distros.js                   # Logica unificada para paginas de distros (257 lineas)
|   |-- Gaming.js                    # Carrusel Gaming (53 lineas)
|   |-- Personalizacion.js           # Carrusel Personalizacion (57 lineas)
|   |-- Trabajo.js                   # Carrusel Trabajo (60 lineas)
|   |-- Trabajos.js                  # Carrusel unificado de secciones (92 lineas)
|   |-- Manual.js                    # Libro interactivo (38 lineas)
|   |-- Debian.js                    # Interactividad Debian (126 lineas)
|   |-- Kali.js                      # Interactividad Kali con tarjetas (194 lineas)
|   |-- BlackArch.js                 # Interactividad BlackArch (103 lineas)
|   |-- Hyperland.js                 # Interactividad Hyprland (85 lineas)
|   |-- computacion grafica.js       # Logica seccion CG (12 lineas)
|   |-- Corazon.js                   # Easter egg: corazon en canvas (79 lineas)
|
|-- CSS/                             # 24 archivos CSS
|   |-- style.css                    # Estilos globales, tokens, navbar, sidebar, footer (762 lineas)
|   |-- perfilGlobal.css             # Modal de perfil y formularios (383 lineas)
|   |-- Foro.css                     # Tema oscuro del foro
|   |-- distros-base.css             # Estilos base compartidos para todas las paginas de distros (803 lineas)
|   |-- Gaming-optimized.css         # Estilos optimizados por seccion
|   |-- (otros *_optimized.css)
|
|-- IMGS/                            # 50 assets de imagen (PNG, JPG, WEBP)
|-- sql/                             # 2 scripts SQL de Supabase
|   |-- foro_policies_supabase.sql   # Politicas RLS + trigger de creacion de perfil (113 lineas)
|   |-- constraints_longitud.sql     # Restricciones de longitud en BD (14 lineas)
|
|-- backups/                         # 7 directorios de respaldo historicos
|-- docs/                            # Documentacion y contexto para IA
```

---

## 4. Sistema de Autenticacion (Patron Single Source)

### Arquitectura

```
authGlobal.js  (Fuente unica de verdad)
  |-- Inicializa cliente Supabase
  |-- Maneja signIn / signUp / signOut
  |-- Mantiene sesion, perfil, listeners
  |-- Expone API publica: window.DistroVantixAuth
       |
       +---> perfilGlobal.js  (Capa UI para paginas no-foro)
       |     - Modal login/registro
       |     - Edicion de perfil (avatar, descripcion)
       |     - Renderizado de avatar en navbar
       |
       +---> Foro.js  (UI especifica del foro)
             - CRUD de comentarios
             - Feed de comentarios
             - Moderacion visual (editar/eliminar para propietarios y admins)
```

### Flujo de Inicializacion
1. `perfilGlobal.js` carga en todas las paginas
2. Llama a `ensureAuthModule()` que carga dinamicamente `authGlobal.js`
3. `authGlobal.js` inicializa cliente Supabase, recupera sesion, crea/recupera perfil
4. `perfilGlobal.js` se suscribe via `auth.onChange()` para reaccionar a cambios de sesion
5. Actualizacion de UI: navbar muestra avatar/nick o boton de invitado

### Archivos de Auth
| Archivo | Funcion |
|---|---|
| `JS/authGlobal.js` | Modulo core: init Supabase, signIn, signUp, signOut, sesion, CRUD perfil, sistema de listeners. API: `window.DistroVantixAuth` |
| `JS/perfilGlobal.js` | UI global: modal login/registro, edicion de perfil, avatar en navbar, carga dinamica de CSS/JS |
| `JS/Foro.js` | UI del foro: modal de login separado, modal de edicion de perfil, renderizado de estado auth en contexto foro |
| `HTML/Foro.html` | Pagina del foro con widget Cloudflare Turnstile CAPTCHA |
| `sql/foro_policies_supabase.sql` | Trigger SQL `crear_perfil_usuario_auth()` para auto-crear perfiles al registrarse |

---

## 5. Base de Datos (Supabase)

### Tabla `usuario` (Identidad de Usuario)

| Columna | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id_usuario` | UUID (PK) | FK a `auth.users.id` | Identificador de usuario |
| `email` | text | | Correo electronico |
| `nick` | text | 3-30 caracteres | Nombre visible |
| `avatar_url` | text | | Emoji o URL de imagen `https:` |
| `descripcion` | text | max 200 caracteres | Biografia del usuario |
| `distro_favorita` | text | | Distribucion favorita |
| `estado` | text | 'activo' o 'suspendido' | Estado de cuenta |
| `rol` | text | 'usuario' o 'ADMIN' | Rol del usuario |

**Trigger:** `crear_perfil_usuario_auth()` -- Crea perfil automaticamente al registrarse via funcion PL/pgSQL con `SECURITY DEFINER`.

### Tabla `comentario` (Comentarios del Foro)

| Columna | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id_comentario` | UUID (PK) | | Identificador unico |
| `id_usuario` | UUID (FK) | FK a `usuario` | Referencia al autor |
| `contenido` | text | 1-500 (cliente), 1-1000 (SQL) | Texto del comentario |
| `fecha` | timestamp | | Fecha de publicacion |
| `estado` | text | 'publicado', 'oculto', 'eliminado' | Estado |

### Politicas RLS (Row Level Security)

| Operacion | Tabla | Politica | Condicion |
|---|---|---|---|
| SELECT | usuario | Lectura publica | `using (true)` |
| INSERT | usuario | Solo autenticados | `with check (id_usuario = auth.uid())` |
| UPDATE | usuario | Solo propietario | `using (id_usuario = auth.uid())` |
| SELECT | comentario | Publico si esta publicado | `using (estado = 'publicado')` |
| INSERT | comentario | Solo autenticados | `with check (id_usuario = auth.uid() AND estado = 'publicado')` |
| UPDATE | comentario | Propietario o ADMIN | `using (id_usuario = auth.uid() OR EXISTS (...rol = 'ADMIN'))` |
| DELETE | comentario | Propietario o ADMIN | Igual que UPDATE |

---

## 6. Features Principales

### 6.1 Pagina Principal (`index.html`)
- Seccion hero con mision del proyecto
- Secciones tipo FAQ (gaming, programacion, seguridad, instalacion, archivos)
- Sidebar de navegacion con categorias
- Navbar sticky con area de usuario

### 6.2 Paginas de Categoria (6 categorias)
| Categoria | Archivo |
|---|---|
| Gaming | `HTML/Gaming.html` |
| Personalizacion | `HTML/Personalizacion.html` |
| Trabajo | `HTML/Trabajo.html` |
| Ciberseguridad | `HTML/Ciberseguridad.html` |
| Desarrollo | `HTML/Desarrollo.html` |
| Computacion Grafica | `HTML/computacion grafica.html` |

### 6.3 Paginas de Distribuciones (13 distribuciones + 3 entornos de escritorio)
| Distribucion | Color Tema |
|---|---|
| Debian | `rgba(168, 0, 48, 0.4)` |
| Ubuntu | `rgba(233, 84, 32, 0.4)` |
| Fedora | `rgba(41, 92, 178, 0.4)` |
| Arch Linux | `rgba(23, 147, 209, 0.4)` |
| Garuda Linux | `rgba(233, 30, 99, 0.4)` |
| CachyOS | `rgba(0, 255, 204, 0.4)` |
| Pop!_OS | `rgba(76, 175, 80, 0.4)` |
| Bazzite | `rgba(0, 191, 255, 0.4)` |
| Kali Linux | `rgba(85, 112, 255, 0.4)` |
| Parrot OS | `rgba(0, 229, 255, 0.4)` |
| BlackArch | `rgba(255, 0, 85, 0.4)` |
| GNOME | `rgba(74, 144, 226, 0.4)` |
| KDE Plasma | `rgba(0, 120, 212, 0.4)` |
| Hyprland | `rgba(0, 242, 255, 0.4)` |

Cada pagina de distribucion usa `Distros.js` (auto-deteccion via titulo de pagina) mas JS dedicado opcional (ej: `Kali.js`, `BlackArch.js`) y un archivo CSS dedicado.

**Nota sobre Kali.html (actualizado Ago 2026):** La pagina de Kali Linux fue actualizada con informacion de herramientas 2025-2026: 8 categorias de herramientas (Reconocimiento, Vulnerabilidades, Explotacion, Wireless, Cracking, Ingenieria Inversa, Red, IA), 15 herramientas destacadas (incluyendo nuevas como AdaptixC2, shell-gpt, Fluxion, Caido, arsenal-ng), integracion con IA/LLMs, y features de NetHunter Pro y GNOME 50/KDE 6.6.

### 6.4 Foro Comunitario (`HTML/Foro.html`)
- CRUD de comentarios (crear, leer, actualizar, eliminar)
- Autenticacion via Supabase Auth
- Integracion Cloudflare Turnstile CAPTCHA (parcial)
- Moderacion de admin (editar/eliminar cualquier comentario)
- Edicion de perfil desde el foro
- Contador de caracteres (max 500)
- Fechas relativas

### 6.5 Sistema de Perfil Global (`perfilGlobal.js`)
- Inyeccion dinamica de modal (auto-inyecta HTML si no existe)
- Carga dinamica de CSS/JS bajo demanda
- Funciona en todas las paginas (index + 23 subpaginas)
- Tabs de login/registro con validacion
- Edicion de perfil (avatar emoji/URL, descripcion)

### 6.6 Manual de Usuario (`HTML/Manual.html`)
- Metafora de libro/careta interactivo con navegacion por paginas
- Sistema de apertura/cierre de libro
- Sistema de paginas por spreads

### 6.7 Easter Egg (`HTML/Corazon.html`)
- Corazon animado en canvas usando curva matematica
- Animacion secuencial asincrona

---

## 7. Sistema de Diseno (Design Tokens)

```css
:root {
  --bg-main: #0f1f3d;           /* Fondo principal nocturno */
  --accent: #22c55e;            /* Verde esmeralda acento */
  --transition-fast: 0.3s ease;
  --transition-cubic: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  --padding-card: clamp(20px, 5vw, 40px);
}
```

### Arquitectura CSS
- **`style.css`** -- Tokens de diseno globales, navbar, sidebar, footer, componentes base
- **`distros-base.css`** -- Estilos base compartidos para todas las paginas de distribuciones
- **`perfilGlobal.css`** -- Modal de perfil y overlay de auth
- **`Foro.css`** -- Tema oscuro del foro
- **`*_optimized.css`** -- Overrides especificos por categoria/distribucion

---

## 8. Seguridad

### Proteccion XSS (Rendering Seguro)
- Todos los datos del usuario se renderizan via `textContent`, `document.createElement()`, `setAttribute()`
- NO se usa `innerHTML` con datos del usuario
- `renderAvatar()` valida inputs con `esEmoji()` y crea elementos `<img>` programaticamente
- Imagen de fallback via `onerror` para URLs rotas

### Estado de Seguridad (de PENDIENTES.md)

**Resueltos (4):**
- SEG-001 (Critico): Usuarios podian modificar columnas sensibles -- RESUELTO con trigger
- SEG-002 (Critico): Lectura publica exponia email -- RESUELTO con politicas restringidas
- SEG-003 (Critico): XSS almacenado via innerHTML -- RESUELTO con textContent/createElement
- SEG-013 (Medio): Modal auto-login para invitados -- RESUELTO

**Abiertos - Alta Prioridad (7):**
- SEG-004: CAPTCHA Turnstile no verificable con Supabase Auth
- SEG-005: Sin rate limiting para comentarios
- SEG-006: Sin rate limiting para login/registro mas alla de Supabase
- SEG-007: Restricciones de BD incompletas (HTML dice 500, SQL dice 1000)
- SEG-008: Creacion duplicada de perfil (trigger + upsert)
- SEG-011: Sin Content Security Policy configurado
- SEG-015: Sin testing de RLS negativo

**Abiertos - Medio/Baja (4):**
- SEG-009: Dependencia del rol en cliente para UI de moderacion
- SEG-010: Eliminaciones duras de comentarios (sin soft delete)
- SEG-012: Scripts externos sin versiones fijas ni SRI
- SEG-014: Logs de error del lado del cliente pueden filtrar detalles

---

## 9. Problemas Conocidos y Deuda Tecnica

1. **Inconsistencias en nombres de archivo**: `arch linux.html` (espacios), `Pop!_OS.html` (caracteres especiales), `Bazzite.htm` (extension incorrecta), `computacion grafica.js` (espacios)
2. **Duplicacion de codigo**: `Debian.js`, `Kali.js`, `BlackArch.js`, `Hyperland.js` duplican codigo casi identico que `Distros.js` maneja de forma unificada
3. **console.log en produccion**: Multiples archivos tienen `console.log` que deberian eliminarse
4. **Estilos inline en HTML**: Varios atributos `style=""` en archivos HTML
5. **CSS @import**: `Foro.css` usa `@import` para Google Fonts (descubrimiento de recursos mas lento)
6. **Imagenes pesadas**: Multiples imagenes de mas de 1MB sin conversion WebP ni tamano responsivo
7. **Sin atributos `width`/`height` en imagenes**: Causa CLS (layout shift)
8. **`loading="lazy"` en imagenes hero**: No deberian cargarse de forma lazy (perjudica LCP)
9. **Desalineacion de restricciones**: Frontend limita a 500 chars pero SQL permite 1000

---

## 10. Hoja de Ruta de Desarrollo

| Etapa | Objetivo | Fecha Objetivo | Estado |
|---|---|---|---|
| **Etapa 1** | Seguridad y funcionalidad base | 2026-07-20 | Parcialmente completa |
| **Etapa 2** | Escalabilidad del foro (paginacion, indices) | 2026-07-31 | No iniciada |
| **Etapa 3** | Rendimiento y calidad visual | 2026-08-08 | No iniciada |
| **Etapa 4** | Documentacion y mantenimiento | 2026-08-15 | No iniciada |

---

## 11. Archivos de Documentacion Existentes (en `docs/`)

| Archivo | Idioma | Lineas | Contenido |
|---|---|---|---|
| `docs/README.md` | Espanol | 55 | Presentacion, objetivos, features, stack, estructura, uso |
| `docs/BLACKBOX.md` | Ingles | 191 | Resumen orientado a IA: arquitectura, patrones, seguridad, uso |
| `docs/DOCUMENTACION.md` | Espanol | 361 | Documentacion tecnica completa: auth, BD, seguridad, foro, perfil, guia de mantenimiento |
| `docs/DOCUMENTATION.md` | Ingles | 361 | Traduccion en ingles de lo anterior |
| `docs/Mejoras.md` | Espanol | 118 | Rastreador de mejoras: 24 mejoras + 14 tareas pendientes, hoja de ruta de 4 etapas |
| `docs/PENDIENTES.md` | Espanol | 275 | Rastreador de vulnerabilidades: SEG-001 a SEG-015 con fixes SQL y checklist |
| `docs/Contexto_IA.md` | Espanol | -- | Este archivo: contexto completo del proyecto para IA |

---

## 12. Guia para IA que Trabajan en este Proyecto

### Reglas Generales
1. **NO usar frameworks** -- Es vanilla HTML/CSS/JS. No instalar Angular, React, Vue, etc.
2. **NO usar bundlers** -- No hay package.json ni node_modules. Todo se carga desde CDN o archivos locales.
3. **Mantener el patron MPA** -- Cada pagina HTML es independiente. No convertir a SPA.
4. **Rendering seguro** -- NUNCA usar `innerHTML` con datos del usuario. Siempre usar `textContent`, `createElement`, `setAttribute`.
5. **Respetar los design tokens** -- Usar las variables CSS existentes en `:root` de `style.css`.
6. **Idioma** -- El codigo y contenido principal esta en espanol. Los comentarios en codigo pueden ser en espanol o ingles.

### Al Modificar Distribuciones
- Usar `Distros.js` como base (auto-deteccion via titulo de pagina)
- Los archivos JS dedicados (`Kali.js`, `BlackArch.js`, etc.) son opcionales y solo para funcionalidad especifica de esa distro
- Cada distro tiene su propio `*-optimized.css` que extiende `distros-base.css`

### Al Modificar el Foro
- La logica esta en `Foro.js` (616 lineas)
- Auth se maneja via `authGlobal.js` (no duplicar logica de auth)
- Las politicas RLS estan en `sql/foro_policies_supabase.sql`
- Mantener la restriccion de 500 caracteres para comentarios

### Al Modificar Auth/Perfil
- `authGlobal.js` es la fuente unica de verdad para estado de auth
- `perfilGlobal.js` es la capa UI para todas las paginas NO-foro
- La API publica es `window.DistroVantixAuth`
- NO duplicar inicializacion de Supabase

### Al Agregar Nuevas Paginas
- Copiar la estructura de una pagina existente similar
- Incluir los archivos CSS/JS necesarios en el `<head>`
- Cargar `perfilGlobal.js` para tener auth global
- Seguir el patron de navbar/sidebar existente

### Comandos Utiles
```bash
# Ver estado del repo
git status

# Ver cambios recientes
git log --oneline -10

# Buscar en el codigo
grep -r "DistroVantixAuth" JS/
grep -r "supabase" JS/
```

---

## 13. URLs y Endpoints Importantes

| Recurso | URL |
|---|---|
| **Supabase Project** | `https://hagcsftbwbglyjdtvrnz.supabase.co` |
| **Supabase SDK** | `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2` |
| **Vercel Deploy** | `https://distro-vantix.vercel.app/` |
| **GitHub Repo** | `https://github.com/EnzoPatino/DistroVantix.git` |

---

## 14. Tabla Resumen de Archivos Clave

| Archivo | Lineas | Funcion Critica |
|---|---|---|
| `JS/authGlobal.js` | 288 | Core de autenticacion, sesion y perfil |
| `JS/perfilGlobal.js` | 412 | UI global de auth y perfil |
| `JS/Foro.js` | 616 | Logica completa del foro |
| `JS/Distros.js` | 257 | Logica unificada de paginas de distros |
| `CSS/style.css` | 762 | Estilos globales y design tokens |
| `CSS/distros-base.css` | 803 | Estilos base de distribuciones |
| `CSS/perfilGlobal.css` | 383 | Estilos del modal de perfil |
| `sql/foro_policies_supabase.sql` | 113 | Politicas RLS y triggers |
| `PENDIENTES.md` | 275 | Rastreador de seguridad |
| `DOCUMENTACION.md` | 361 | Documentacion tecnica completa |
