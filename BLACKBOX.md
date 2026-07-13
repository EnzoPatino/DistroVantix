# BLACKBOX.md - DistroVantix

## Project Overview

**DistroVantix** is a modern web platform that helps users discover and choose Linux distributions tailored to their needs. It includes a community forum for discussion and support. The site is Spanish-language and offers guidance for users transitioning from Windows to Linux.

**Website Type:** Dynamic community-driven website  
**Language:** Spanish  
**Primary Purpose:** Linux distribution education, recommendation platform, and community forum  
**Target Audience:** Spanish-speaking users exploring Linux alternatives to Windows  
**Backend:** Supabase (PostgreSQL + Auth + RLS)  
**Security Model:** Safe DOM rendering, Row Level Security, database constraints  
**Last updated:** July 2026

---

## Directory Structure

```
proyecto_DistroVantix/
├── index.html                     # Main entry point
├── HTML/                          # 23 category and distribution pages
│   ├── Foro.html                  # Community forum
│   ├── Gaming.html                # Gaming category
│   ├── Personalizacion.html       # Personalization category
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
│   └── Corazon.html               # Easter egg
├── JS/                            # 16 JavaScript files
│   ├── authGlobal.js              # Single source of auth and session state
│   ├── perfilGlobal.js            # Login, register and global profile UI
│   ├── Foro.js                    # Forum logic (comment CRUD)
│   ├── script.js                  # Global functionality (sidebar toggle)
│   ├── Distros.js                 # Distribution navigation logic
│   ├── Gaming.js                  # Gaming section logic
│   ├── Personalizacion.js         # Personalization section logic
│   ├── Trabajo.js / Trabajos.js   # Work section logic
│   ├── Manual.js                  # Manual logic
│   ├── Debian.js / Kali.js / ...  # Per-distribution logic
│   └── Corazon.js                 # Easter egg
├── CSS/                           # 24 style files
│   ├── style.css                  # Global styles and design tokens
│   ├── Foro.css                   # Forum styles
│   ├── perfilGlobal.css           # Profile modal styles
│   ├── distros-base.css           # Base styles for distribution pages
│   └── *_optimized.css            # Optimized styles per category/distro
├── IMGS/                          # Visual assets
├── sql/                           # Database scripts
│   ├── foro_policies_supabase.sql # RLS policies and profile trigger
│   └── constraints_longitud.sql   # Validation constraints
├── PENDIENTES.md                  # Security vulnerabilities and pending items
├── Mejoras.md                     # General improvements and roadmap
├── DOCUMENTACION.md               # Technical documentation (Spanish)
├── DOCUMENTATION.md               # Technical documentation (English)
├── BLACKBOX.md                    # This file
├── README.md                      # Project presentation
└── LICENSE                        # MIT License
```

---

## Key Technologies

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, animations, flexbox, responsive design
- **Vanilla JavaScript (ES6+)** - DOM manipulation, event handling, async/await, IIFE modules
- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, Row Level Security)

---

## Architecture

### Authentication Pattern

The project uses a **single-source authentication architecture**:

- **`authGlobal.js`** — Initializes the Supabase client, manages session state, profile creation/recovery, and exposes `window.DistroVantixAuth` API (signIn, signUp, signOut, updateProfile, onChange).
- **`perfilGlobal.js`** — UI layer that consumes `authGlobal.js`. Handles login/register modal, profile editing, navbar avatar rendering. Loads `authGlobal.js` dynamically if not present.
- **`Foro.js`** — Forum-specific UI that also consumes `authGlobal.js` for comment CRUD and moderation.

### Styling Pattern

- `style.css` contains shared variables (design tokens), animations, and base component styles.
- `perfilGlobal.css` handles the profile modal overlay and form styles.
- `Foro.css` handles the modern dark theme for the community section.
- `distros-base.css` provides base styles for distribution pages.
- Page-specific `*_optimized.css` files add/modify styles as needed.

### Security Model

**Rendering (XSS Protection):**
- All user data (nick, avatar, description) is rendered using `textContent`, `document.createElement()`, and `setAttribute()`.
- No `innerHTML` is used with user-supplied data.
- `renderAvatar()` validates inputs with `esEmoji()` and creates `<img>` elements programmatically.
- Fallback image on `onerror` for broken URLs.

**Database (RLS):**
- `usuario` table: Only the owner can update their profile (`id_usuario = auth.uid()`).
- `comentario` table: Public read for published comments; insert for authenticated users; update/delete for owner or ADMIN.
- ADMIN role verified via `EXISTS` subquery in SQL, not trusted from frontend.

**Constraints:**
- `nick`: 3-30 characters
- `descripcion`: max 200 characters
- `contenido` (comentarios): 1-500 characters
- `estado`: restricted to allowed values per table
- `rol`: restricted to `'usuario'` or `'ADMIN'`

---

## Usage

### Viewing the Website

Open `index.html` in any modern web browser. The static content is fully client-side. The Forum requires an internet connection to connect to the Supabase backend.

**Navigation:**
- Main landing page: `index.html`
- Sidebar categories: Accessible via hamburger menu (☰)
- Community Forum: `HTML/Foro.html`
- Individual distributions: `HTML/Debian.html`, `HTML/Ubuntu.html`, etc.

### Development

- **Frontend:** HTML5, CSS3, and Vanilla JavaScript (ES6+).
- **Backend:** Supabase (PostgreSQL + Auth).
- **Styling:** Custom CSS with design tokens for consistency.
- **Security:** DOM API for safe rendering, RLS for data protection.

---

## Common Patterns

### Working with the Forum

1. **Authentication:** Uses `authGlobal.js` via `window.DistroVantixAuth` for registration and login.
2. **CRUD Operations:** Comments are handled via the `comentario` table with a `JOIN` to `usuario` for profile data.
3. **Security:** Always execute `sql/foro_policies_supabase.sql` when setting up a new Supabase instance.

### Working with Profile System

1. **Loading:** `perfilGlobal.js` dynamically loads `authGlobal.js` and `perfilGlobal.css`.
2. **State:** Subscribe to auth changes via `DistroVantixAuth.onChange(callback)`.
3. **Rendering:** Use `renderAvatar()` for safe avatar display; use `textContent` for nick/role.
4. **Editing:** Call `DistroVantixAuth.updateProfile({...})` with allowed fields only.

### Modifying Global Styles

Edit `CSS/style.css` to change:
- Global color scheme (design tokens)
- Animation keyframes
- Base component styles (cards, buttons, links)
- Responsive breakpoints

---

## Security Checklist

- [ ] Nick, avatar, and description don't execute HTML/JS when displayed
- [ ] An anonymous user cannot query `usuario` emails
- [ ] An authenticated user cannot change their `rol` or `estado`
- [ ] A normal user cannot edit or delete other users' comments
- [ ] Registration fails without a valid CAPTCHA (if activated)
- [ ] The anon/publishable key is the only key present in the frontend
- [ ] No service role key exists in public files

---

## Important Notes

- All paths are relative.
- The forum requires a valid Supabase configuration (URL and API Key).
- Responsive design breakpoint at 768px (mobile).
- The project uses vanilla JS with no build tools or bundlers.
- Documentation is maintained in Spanish (`DOCUMENTACION.md`) and English (`DOCUMENTATION.md`).
