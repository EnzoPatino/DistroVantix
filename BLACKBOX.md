# BLACKBOX.md - DistroVantix

## Project Overview

**DistroVantix** is a modern web platform that helps users discover and choose Linux distributions (distros) tailored to their needs. It includes a community forum for discussion and support. The site is Spanish-language and offers guidance for users transitioning from Windows to Linux.

**Website Type:** Dynamic community-driven website  
**Language:** Spanish  
**Primary Purpose:** Linux distribution education, recommendation platform, and community forum  
**Target Audience:** Spanish-speaking users exploring Linux alternatives to Windows

---

## Directory Structure

```
/home/pachorra/proyecto_DistroVantix/
├── Index.html              # Main landing page
├── Gaming.html             # Gaming category page
├── Trabajo.html            # Work/Productivity category page
├── Bazzite.htm             # Bazzite distro details
├── CachyOS.html            # CachyOS distro details
├── Garuda.html             # Garuda Linux distro details
├── Pop!_OS.html            # Pop!_OS distro details
├── HTML/
│   └── Foro.html           # Community Forum page
├── LICENSE                 # Project license
├── README.md               # Project readme
├── Planificacion_Foro_DistroVantix.md # Detailed forum planning and technical docs
├── CSS/
│   ├── style.css              # Main global styles
│   ├── Foro.css               # Forum-specific styles
│   ├── distros-base.css       # Base styles for distro pages
│   └── ...                    # Other page-specific styles
├── JS/
│   ├── script.js              # Main JavaScript (sidebar toggle)
│   ├── Foro.js                # Forum logic and Supabase integration
│   └── ...                    # Other page-specific JS
├── IMGS/                      # Image assets
└── sql/
    └── foro_policies_supabase.sql # Database security policies (RLS)
```

---

## Usage

### Viewing the Website

Open `Index.html` in any modern web browser. The static content is fully client-side. The Forum requires an internet connection to connect to the Supabase backend.

**Navigation:**
- Main landing page: `Index.html`
- Community Forum: `HTML/Foro.html`
- Gaming category: `Gaming.html`
- Work category: `Trabajo.html`
- Distro-specific pages: `Bazzite.htm`, `CachyOS.html`, etc.

### Development

- **Frontend:** HTML5, CSS3, and Vanilla JavaScript (ES6+).
- **Backend:** Supabase (PostgreSQL + Auth).
- **Styling:** Custom CSS with a focus on dark mode and modern aesthetics.

---

## Key Technologies

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, animations, flexbox, responsive design
- **Vanilla JavaScript** - DOM manipulation, event handling, async/await
- **Supabase** - Backend-as-a-Service (Database, Authentication, RLS)

---

## Architecture

### Styling Pattern

The project uses a centralized CSS approach:
- `style.css` contains shared variables, animations, and base component styles.
- `Foro.css` handles the modern dark theme for the community section.
- Page-specific CSS files add/modify styles as needed.

### JavaScript Pattern

- `script.js` handles global functionality (sidebar toggle).
- `Foro.js` manages the complete CRUD lifecycle of comments, user authentication, and profile customization using Supabase client.

### Database & Security (RLS)

The project implements **Row Level Security (RLS)** in Supabase to ensure:
- **Comments:** Publicly readable; insertion allowed for authenticated users; updates/deletions restricted to the author (`auth.uid()`).
- **Profiles:** Publicly readable; users can only update their own profile data.

---

## Common Patterns

### Working with the Forum

1. **Authentication:** Uses Supabase Auth for registration and login.
2. **CRUD Operations:** Comments are handled via the `comentario` table with a `JOIN` to the `usuario` table for profile data.
3. **Security:** Always execute `sql/foro_policies_supabase.sql` when setting up a new Supabase instance.

### Modifying Global Styles

Edit `CSS/style.css` to change:
- Global color scheme
- Animation keyframes
- Base component styles (cards, buttons, links)
- Responsive breakpoints

---

## Important Notes

- All paths are relative.
- The forum requires a valid Supabase configuration (URL and API Key).
- Responsive design breakpoint at 768px (mobile).
