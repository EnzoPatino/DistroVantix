# Pro Technical Documentation - DistroVantix

## 1. Project Overview

**DistroVantix** is a digital educational ecosystem designed to democratize access to and knowledge of GNU/Linux. The platform goes beyond distribution recommendations; it educates users through usage profiles, simplified technical documentation, and an interactive community forum.

### 1.1 Technical Fact Sheet

| Attribute | Detail |
|-----------|--------|
| **Core** | Frontend Vanilla JS (Single Page Interaction Pattern) |
| **BaaS** | Supabase (Database, Auth, RLS) |
| **Design** | Custom CSS with Design Tokens System (CSS Variables) |
| **Architecture** | Modular by categories and distributions |
| **Security** | Safe rendering with DOM API, database RLS, no `innerHTML` for user data |
| **Official URL** | [https://distro-vantix.vercel.app/](https://distro-vantix.vercel.app/) |
| **Last updated** | July 2026 |

---

## 2. Software Architecture and Design

### 2.1 Design System (UI/UX)

The project implements a **Design Token System** using CSS variables, ensuring visual consistency throughout the site:

- **Color Palette:** Night-primary tone (`--bg-main: #0f1f3d`) with emerald accents (`--accent: #22c55e`).
- **Layout:** Heavy use of `clamp()` for responsive typography and paddings.
- **Interactivity:** `fadeInDown` animations and `cubic-bezier` transitions for a modern, fluid feel.
- **Components:** Floating modals, profile cards, role badges, forms with real-time feedback.

### 2.2 Authentication Architecture

Authentication follows a **single source** pattern with separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│  authGlobal.js  (Single source of state & session)  │
│  - Initializes Supabase client                      │
│  - Manages signIn / signUp / signOut                 │
│  - Maintains session, profile and listeners          │
│  - Public API: window.DistroVantixAuth              │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐    ┌──────────────────────────┐
│ perfilGlobal.js  │    │ Foro.js                  │
│ (Profile UI)     │    │ (Forum UI)               │
│ - Login/register │    │ - Comment CRUD           │
│   modal          │    │ - Comment feed           │
│ - Profile editing│    │ - Visual moderation      │
│ - Navbar avatar  │    │                          │
└──────────────────┘    └──────────────────────────┘
```

**Initialization flow:**
1. `perfilGlobal.js` loads on every page.
2. Calls `ensureAuthModule()` which loads `authGlobal.js` if not available.
3. `authGlobal.js` initializes the Supabase client, retrieves the active session, and creates/recovers the profile.
4. `perfilGlobal.js` subscribes via `auth.onChange()` to react to session changes.
5. UI updates: navbar shows avatar/nick or guest button.

### 2.3 Data Structure (Supabase)

#### `usuario` Table (Identity)

Manages the extended user profile linked to Supabase Auth.

| Column | Type | Description |
|--------|------|-------------|
| `id_usuario` | UUID (PK) | FK to `auth.users.id` |
| `email` | text | User's email address |
| `nick` | text (3-30 chars) | Visible username |
| `avatar_url` | text | Simple emoji or `https:` image URL |
| `descripcion` | text (max 200) | User biography |
| `distro_favorita` | text | Favorite distribution |
| `estado` | text | `'activo'` or `'suspendido'` |
| `rol` | text | `'usuario'` or `'ADMIN'` |

- **RLS:** `id_usuario = auth.uid()` ensures only the owner can edit their profile.
- **Trigger:** Automatic profile creation via PL/pgSQL function `crear_perfil_usuario_auth()` on registration.
- **Client-side allowed updates:** Only `nick`, `avatar_url`, `descripcion`, `distro_favorita`.

#### `comentario` Table (Interaction)

The engine behind the community forum.

| Column | Type | Description |
|--------|------|-------------|
| `id_comentario` | UUID (PK) | Unique identifier |
| `id_usuario` | UUID (FK) | Reference to `usuario` |
| `contenido` | text (1-500) | Comment text |
| `fecha` | timestamp | Publication date |
| `estado` | text | `'publicado'`, `'oculto'` or `'eliminado'` |

- **Integrity:** `id_usuario` FK linked to profiles.
- **Moderation:** RLS policies allow update/delete by owner OR an ADMIN.

---

## 3. Security and Safe Rendering

### 3.1 XSS Protection (SEG-003 - Resolved)

The project implements safe rendering for all database-sourced data displayed in the interface. **No `innerHTML` is used with user data.**

**Techniques applied in `perfilGlobal.js`:**

```javascript
// ✅ SAFE - Cleanup with textContent
container.textContent = "";

// ✅ SAFE - Programmatic DOM element creation
const img = document.createElement("img");
img.src = value;
img.alt = altText;
img.onerror = () => { img.src = "fallback.png"; };
container.appendChild(img);

// ✅ SAFE - Plain text assignment
name.textContent = profile.nick;
```

**`renderAvatar()` function:** Central point of safe rendering:
1. Clears the container with `textContent = ""`.
2. Validates if the value is an emoji with `esEmoji()` (length ≤ 8, no `.` or `/`).
3. If emoji: assigns as plain text.
4. If URL: creates `<img>` element with `document.createElement()` and `setAttribute()`.
5. Includes fallback with `onerror` for broken URLs.

**`esEmoji()` function:** Input validation to distinguish emojis from URLs:
```javascript
function esEmoji(str) {
  return Boolean(str) && str.length <= 8 && !str.includes(".") && !str.includes("/");
}
```

### 3.2 Row Level Security (RLS)

All database interactions are governed by policies:

| Operation | Policy | Condition |
|-----------|--------|-----------|
| SELECT `usuario` | Public read | `using (true)` |
| INSERT `usuario` | Authenticated only | `with check (id_usuario = auth.uid())` |
| UPDATE `usuario` | Owner only | `using (id_usuario = auth.uid())` |
| SELECT `comentario` | Public if published | `using (estado = 'publicado')` |
| INSERT `comentario` | Authenticated only | `with check (id_usuario = auth.uid() AND estado = 'publicado')` |
| UPDATE `comentario` | Owner or ADMIN | `using (id_usuario = auth.uid() OR EXISTS (...rol = 'ADMIN'))` |
| DELETE `comentario` | Owner or ADMIN | Same condition as UPDATE |

### 3.3 Database Constraints

SQL files in `sql/constraints_longitud.sql`:

```sql
-- Comments: not empty, max 500 characters
ALTER TABLE public.comentario
ADD CONSTRAINT comentario_contenido_longitud
CHECK (char_length(trim(contenido)) BETWEEN 1 AND 500);

-- Allowed comment states
ALTER TABLE public.comentario
ADD CONSTRAINT comentario_estado_valido
CHECK (estado IN ('publicado', 'oculto', 'eliminado'));

-- Allowed user states
ALTER TABLE public.usuario
ADD CONSTRAINT usuario_estado_valido
CHECK (estado IN ('activo', 'suspendido'));

-- Allowed roles
ALTER TABLE public.usuario
ADD CONSTRAINT usuario_rol_valido
CHECK (rol IN ('usuario', 'ADMIN'));

-- Nick: 3-30 characters
ALTER TABLE public.usuario
ADD CONSTRAINT usuario_nick_longitud
CHECK (char_length(trim(nick)) BETWEEN 3 AND 30));

-- Description: max 200 characters
ALTER TABLE public.usuario
ADD CONSTRAINT usuario_descripcion_longitud
CHECK (descripcion IS NULL OR char_length(descripcion) <= 200);
```

---

## 4. Forum Implementation (Backend-as-a-Service)

### 4.1 Authentication Flow

1. **Frontend:** Data capture via `loginForm` / `registerForm`.
2. **Supabase Auth:** Credential validation and JWT generation.
3. **Session Management:** LocalStorage persistence managed by the Supabase client.
4. **Profile:** `authGlobal.js` creates the profile automatically via `ensureProfile()` after login/registration.

### 4.2 Moderation and CRUD Logic

The logic implements dual-layer validation:
- **Client Layer:** `esAdmin` check to show/hide edit/delete buttons.
- **Server Layer:** RLS policies that verify the role directly in the database before allowing `UPDATE` or `DELETE`.

---

## 5. User Profile and Global Authentication (Self-Managed Modal)

### 5.1 Dynamic Behavior based on Session State

- **Guest (Logged Out):** Clicking `.user-area` opens a floating modal with "Login" and "Register" tabs. Credentials are processed against Supabase Auth.
- **Logged In:** The navbar updates instantly (no reload) showing nickname and avatar. Clicking the profile area displays the interactive card with current data from the `usuario` table.

### 5.2 Interactive Profile Editing

- **Avatar:** Image URL or emoji. Real-time preview. Quick presets: 🐧 🚀 💻 🔥 👾.
- **Biography:** Text up to 200 characters.
- **Persistence:** `.update()` on `usuario` table filtering by current user ID.
- **Sign Out:** Ends session in Supabase Auth and returns interface to Guest state.

### 5.3 Plug-and-Play Architecture

- **Dynamic HTML Injection:** The script automatically injects modal markup if not present in the DOM.
- **Dynamic Loading:** Loads `authGlobal.js` and `perfilGlobal.css` on demand.
- **Distribution:** Integrated in `index.html` and across all 23 subpages in `HTML/`, sharing the Supabase session across the entire domain.

---

## 6. Project File Structure

```
proyecto_DistroVantix/
├── index.html                     # Main entry point
├── HTML/                          # 23 category and distribution pages
│   ├── Foro.html                  # Community forum
│   ├── Gaming.html                # Gaming category
│   ├── Personalizacion.html       # Personalization category (+ Dotfiles & Desktop Shells section)
│   ├── Trabajo.html               # Work category
│   ├── Ciberseguridad.html        # Cybersecurity category
│   ├── Desarrollo.html            # Development category
│   ├── Manual.html                # User manual
│   ├── Debian.html                # Debian distribution
│   ├── Ubuntu.html                # Ubuntu distribution
│   ├── Fedora.html                # Fedora distribution
│   ├── Arch.html                  # Arch Linux distribution
│   ├── Kali.html                  # Kali Linux distribution
│   ├── ParrotOS.html              # Parrot OS distribution
│   ├── BlackArch.html             # BlackArch distribution
│   ├── Garuda.html                # Garuda Linux distribution
│   ├── CachyOS.html               # CachyOS distribution
│   ├── Pop!_OS.html               # Pop!_OS distribution
│   ├── Bazzite.htm                # Bazzite distribution
│   ├── Hyperland.html             # Hyprland DE
│   ├── Gnome.html                 # GNOME DE
│   ├── KDE.html                   # KDE Plasma DE
│   ├── Corazon.html               # Easter egg
│   └── ...
├── JS/                            # 16 JavaScript files
│   ├── authGlobal.js              # Single source of auth and session state
│   ├── perfilGlobal.js            # Login, register and global profile UI
│   ├── Foro.js                    # Forum logic (comment CRUD)
│   ├── script.js                  # Global functionality (sidebar toggle)
│   ├── Distros.js                 # Distribution navigation logic
│   ├── Gaming.js                  # Gaming section logic
│   ├── Personalizacion.js         # Personalization carousels and tabs logic
│   ├── Trabajo.js / Trabajos.js   # Work section logic
│   ├── Manual.js                  # Manual logic
│   ├── Debian.js / Kali.js / ...  # Per-distribution logic
│   ├── BlackArch.js               # BlackArch logic
│   ├── Hyperland.js               # Hyprland logic
│   └── Corazon.js                 # Easter egg
├── CSS/                           # 24 style files
│   ├── style.css                  # Global styles and design tokens
│   ├── Foro.css                   # Forum styles
│   ├── perfilGlobal.css           # Profile modal styles
│   ├── distros-base.css           # Base styles for distribution pages
│   ├── Gaming-optimized.css       # Optimized styles per category
│   ├── *_optimized.css            # Optimized styles per distribution
│   └── ...
├── IMGS/                          # Visual assets
├── sql/                           # Database scripts
│   ├── foro_policies_supabase.sql # RLS policies and profile trigger
│   └── constraints_longitud.sql   # Validation constraints
├── PENDIENTES.md                  # Security vulnerabilities and pending items
├── Mejoras.md                     # General improvements and roadmap
├── DOCUMENTACION.md               # Technical documentation (Spanish)
├── DOCUMENTATION.md               # This documentation (English)
├── BLACKBOX.md                    # AI tools summary
├── README.md                      # Project presentation
└── LICENSE                        # MIT License
```

---

## 7. Development Process and Security

### 7.1 Security Documentation

The project maintains two key documents for tracking improvements:

- **`PENDIENTES.md`:** Table of identified vulnerabilities (SEG-001 to SEG-015), classified by importance (Critical/High/Medium/Low), with registration date, target date, and status.
- **`Mejoras.md`:** Table of general improvements for security, performance, UX, and maintenance, with priorities and stage-based roadmaps.

### 7.2 Resolved Vulnerabilities (Stage 1)

| ID | Vulnerability | Status |
|----|--------------|--------|
| SEG-003 | Stored XSS via `innerHTML` with profile data | **Resolved** - Render with `textContent`/`createElement` |
| Structural | Unclosed footer before scripts in `index.html` | **Resolved** - Added correct `</footer>` |
| Unification | Duplicate auth between `Foro.js` and `perfilGlobal.js` | **Resolved** - `authGlobal.js` as single source |

### 7.3 Development Roadmap

| Stage | Objective | Target Date |
|-------|-----------|-------------|
| **Stage 1** | Security and base functionality | 2026-07-20 |
| **Stage 2** | Forum scalability (pagination, indexes) | 2026-07-31 |
| **Stage 3** | Performance and visual quality (images, CSS) | 2026-08-08 |
| **Stage 4** | Documentation and maintenance | 2026-08-15 |

---

## 8. Maintenance and Scalability Guide

### 8.1 Adding a New Distribution

1. Create `HTML/distro-name.html` based on `distros-base.css`.
2. Create `CSS/distro-name-optimized.css` with specific styles.
3. Create `JS/distro-name.js` if interactive logic is needed.
4. Update navigation in `JS/Distros.js` if necessary.

### 8.2 Administrator Management

To promote a user to ADMIN, execute in the Supabase SQL Editor:
```sql
UPDATE public.usuario SET rol = 'ADMIN' WHERE nick = 'username';
```

### 8.3 Security Checklist

Before each deployment, verify:
- [ ] Nick, avatar, and description don't execute HTML/JS when displayed
- [ ] An anonymous user cannot query `usuario` emails
- [ ] An authenticated user cannot change their `rol` or `estado`
- [ ] A normal user cannot edit or delete other users' comments
- [ ] Registration fails without a valid CAPTCHA (if activated)
- [ ] The anon/publishable key is the only key present in the frontend

---

## 9. Credits and License

This project is an open-source initiative led by **Enzo Lautaro Patiño**.

- **License:** MIT License
- **Philosophy:** "Your PC, your freedom."

---

*Last update: July 2026*
