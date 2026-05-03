# BLACKBOX.md - DistroVantix

## Project Overview

**DistroVantix** is a static informational website that helps users discover and choose Linux distributions (distros) tailored to their needs. The site is Spanish-language and offers guidance for users transitioning from Windows to Linux.

**Website Type:** Static HTML/CSS/JS multi-page website  
**Language:** Spanish  
**Primary Purpose:** Linux distribution education and recommendation platform  
**Target Audience:** Spanish-speaking users exploring Linux alternatives to Windows

---

## Directory Structure

```
/home/pachorra/proyecto_DistroVantix/
├── Index.html              # Main landing page
├── Gaming.html           # Gaming category page
├── Trabajo.html          # Work/Productivity category page
├── Bazzite.htm           # Bazzite distro details
├── CachyOS.html         # CachyOS distro details
├── Garuda.html          # Garuda Linux distro details
├── Pop!_OS.html        # Pop!_OS distro details
├── LICENSE             # Project license
├── README.md           # Project readme
├── CSS/
│   ├── style.css              # Main global styles
│   ├── distros-base.css       # Base styles for distro pages
│   ├── Gaming-optimized.css   # Gaming page styles
│   ├── Bazzite-optimized.css # Bazzite page styles
│   ├── CachyOS-optimized.css # CachyOS page styles
│   ├── Garuda-optimized.css# Garuda page styles
│   ├── PopOS-optimized.css  # Pop!_OS page styles
│   └── Trabajo.css         # Trabajo page styles
├── JS/
│   ├── script.js       # Main JavaScript (sidebar toggle)
│   ├── Gaming.js     # Gaming page interactivity
│   ├── Bazzite.js  # Bazzite page interactivity
│   ├── CachyOS.js  # CachyOS page interactivity
│   ├── Garuda.js   # Garuda page interactivity
│   └── Pop!_OS.js # Pop!_OS page interactivity
└── IMGS/            # Image assets
```

---

## Usage

### Viewing the Website

Open `Index.html` in any modern web browser. The site is fully client-side and requires no build process or server.

**Navigation:**
- Main landing page: `Index.html`
- Gaming category: `Gaming.html`
- Work category: `Trabajo.html`
- Distro-specific pages: `Bazzite.htm`, `CachyOS.html`, `Garuda.html`, `Pop!_OS.html`

### Development

No build tools required. Edit files directly:

- **HTML:** Page content and structure in `.html`/`.htm` files
- **CSS:** Styles in `CSS/*.css` files
- **JavaScript:** Interactivity in `JS/*.js` files

---

## Key Technologies

- **HTML5** - Semantic markup
- **CSS3** - Custom properties (variables), animations, flexbox, responsive design
- **Vanilla JavaScript** - DOM manipulation, event handling

---

## Architecture

### Styling Pattern

The project uses a centralized CSS approach:
- `style.css` contains shared variables, mixins, animations, and base component styles
- Page-specific CSS files (e.g., `Gaming-optimized.css`) add/modify page-specific styles
- `distros-base.css` provides base styles for distro detail pages

**CSS Variables (from style.css):**
```css
/* Colors */
--bg-main, --nav-dark, --text-light, --text-dark, --accent, --card-bg
/* Transitions */
--transition-fast, --transition-smooth, --transition-cubic
/* Spacing */
--gap-small, --gap-normal, --gap-large, --gap-xl
/* Border Radius */
--radius-small, --radius-normal, --radius-large
/* Shadows */
--shadow-sm, --shadow-md, --shadow-lg, --shadow-hover
```

### JavaScript Pattern

- `script.js` handles global functionality (sidebar toggle, click-outside-to-close)
- Individual JS files may handle page-specific interactivity

---

## Common Patterns

### Adding a New Category Page

1. Create `NewCategory.html` in root
2. Create `CSS/NewCategory-optimized.css` for custom styles
3. Create `JS/NewCategory.js` if needed
4. Add navigation link to sidebar in existing pages

### Adding a New Distro Page

1. Create `DistroName.html` in root
2. Create `CSS/DistroName-optimized.css`
3. Create `JS/DistroName.js` if needed
4. Link from appropriate category page

### Modifying Global Styles

Edit `CSS/style.css` to change:
- Global color scheme
- Animation keyframes
- Base component styles (cards, buttons, links)
- Responsive breakpoints

---

## Important Notes

- All paths are relative; no build tools needed
- Images stored in `IMGS/` directory
- The site uses Spanish interface text throughout
- Responsive design breakpoint at 768px (mobile)