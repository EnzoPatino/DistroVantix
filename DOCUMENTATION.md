# Pro Technical Documentation - DistroVantix

## 1. Project Overview

**DistroVantix** is a digital educational ecosystem designed to democratize access to and knowledge of GNU/Linux. The platform goes beyond mere distribution recommendations; it educates users through profile-based suggestions, simplified technical documentation, and an interactive community forum.

### 1.1 Technical Fact Sheet

| Attribute | Detail |
|----------|---------|
| **Core** | Frontend Vanilla JS (Single Page Interaction Pattern) |
| **BaaS** | Supabase (Database, Auth, RLS) |
| **Design** | Custom CSS with Design Tokens System (Variables) |
| **Architecture** | Modular by categories and distributions |
| **Official URL** | [https://distro-vantix.vercel.app/](https://distro-vantix.vercel.app/) |

---

## 2. Software Architecture and Design

### 2.1 Design System (UI/UX)
The project implements a **Design Token System** using CSS variables, ensuring visual consistency throughout the site:

- **Color Palette:** Based on a night-primary tone (`--bg-main: #0f1f3d`) with emerald accents for interaction (`--accent: #22c55e`).
- **Layout:** Heavy use of `clamp()` for responsive typography and paddings.
- **Interactivity:** `fadeInDown` animations and `cubic-bezier` transitions for a modern, fluid feel.

### 2.2 Data Structure (Supabase)

#### `usuario` Table (Identity)
Manages the extended user profile linked to Supabase Auth.
- **RLS:** `id_usuario = auth.uid()` ensures only the owner can edit their profile.
- **Trigger:** Automatic profile creation via a PL/pgSQL function upon registration.

#### `comentario` Table (Interaction)
The engine behind the community forum.
- **Integrity:** `id_usuario` FK linked to profiles.
- **Moderation:** A `rol` column in the `usuario` table allows an edit bypass for users with the `ADMIN` role.

---

## 3. Forum Implementation (Backend-as-a-Service)

### 3.1 Authentication Flow
1. **Frontend:** Captures data via `loginForm` / `registerForm`.
2. **Supabase Auth:** Validates credentials and generates a JWT.
3. **Session Management:** Persistence in LocalStorage handled by the Supabase client.

### 3.2 Moderation and CRUD Logic
The logic in `JS/Foro.js` implements dual-layer validation:
- **Client Layer:** `esAdmin` check to show/hide edit buttons.
- **Server Layer:** RLS policies that verify the role directly in the database before allowing an `UPDATE` or `DELETE` operation.

---

## 4. Security and Best Practices

### 4.1 Row Level Security (RLS)
The project does not expose an open API. All database interaction is governed by policies:
- **Read:** Public for comments in `publicado` (published) status.
- **Write:** Restricted to valid JWTs.
- **Privileges:** `EXISTS` logic in SQL to securely validate administrator roles.

### 4.2 Resource Optimization
- **Images:** Modern formats (`.webp`) used to reduce Largest Contentful Paint (LCP).
- **CSS:** Category-optimized style separation to prevent downloading unnecessary CSS.

---

## 5. Maintenance and Scalability Guide

### 5.1 Adding a New Distribution
1. Create the `HTML/distro-name.html` file based on `distros-base.css`.
2. Add specific styling in `CSS/distro-name-optimized.css`.
3. Update the navigation script if necessary.

### 5.2 Administrator Management
To promote a user to ADMIN, execute the following in the Supabase SQL Editor:
```sql
update public.usuario set rol = 'ADMIN' where nick = 'username';
```

---

## 6. Credits and License

This project is an open-source initiative led by **Enzo Lautaro Patiño**.

- **License:** MIT License
- **Philosophy:** "Your PC, your freedom."

---
*Last update: June 2026*
