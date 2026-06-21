# Documentación Técnica Pro - DistroVantix

## 1. Visión General del Proyecto

**DistroVantix** es un ecosistema educativo digital diseñado para democratizar el acceso y conocimiento de GNU/Linux. La plataforma no solo recomienda distribuciones, sino que educa al usuario a través de perfiles de uso, documentación técnica simplificada y una comunidad interactiva.

### 1.1 Ficha Técnica

| Atributo | Detalle |
|----------|---------|
| **Core** | Frontend Vanilla JS (Single Page Interaction Pattern) |
| **BaaS** | Supabase (Database, Auth, RLS) |
| **Diseño** | Custom CSS con Sistema de Tokens (Variables) |
| **Arquitectura** | Modular por categorías y distribuciones |
| **URL Oficial** | [https://distro-vantix.vercel.app/](https://distro-vantix.vercel.app/) |

---

## 2. Arquitectura de Software y Diseño

### 2.1 Sistema de Diseño (UI/UX)
El proyecto implementa un **Sistema de Tokens de Diseño** mediante variables CSS, permitiendo una consistencia visual en todo el sitio:

- **Paleta de Colores:** Basada en un tono primario nocturno (`--bg-main: #0f1f3d`) con acentos esmeralda para interacción (`--accent: #22c55e`).
- **Layout:** Uso intensivo de `clamp()` para tipografías y paddings responsivos.
- **Interactividad:** Animaciones `fadeInDown` y transiciones `cubic-bezier` para una sensación de fluidez moderna.

### 2.2 Estructura de Datos (Supabase)

#### Tabla `usuario` (Identidad)
Gestiona el perfil extendido del usuario vinculado a Supabase Auth.
- **RLS:** `id_usuario = auth.uid()` garantiza que solo el dueño edite su perfil.
- **Trigger:** Creación automática mediante función PL/pgSQL en el registro.

#### Tabla `comentario` (Interacción)
Motor del foro comunitario.
- **Integridad:** FK `id_usuario` vinculada a perfiles.
- **Moderación:** Columna `rol` en la tabla `usuario` permite el bypass de edición para usuarios con rol `ADMIN`.

---

## 3. Implementación del Foro (Backend-as-a-Service)

### 3.1 Flujo de Autenticación
1. **Frontend:** Captura de datos vía `loginForm` / `registerForm`.
2. **Supabase Auth:** Validación de credenciales y generación de JWT.
3. **Session Management:** Persistencia en LocalStorage manejada por el cliente de Supabase.

### 3.2 Lógica de Moderación y CRUD
La lógica en `JS/Foro.js` implementa validaciones de doble capa:
- **Capa Cliente:** Verificación de `esAdmin` para mostrar/ocultar botones de edición.
- **Capa Servidor:** Políticas RLS que verifican el rol directamente en la base de datos antes de permitir una operación `UPDATE` o `DELETE`.

---

## 4. Seguridad y Buenas Prácticas

### 4.1 Row Level Security (RLS)
El proyecto no expone una API abierta. Toda interacción con la base de datos está regida por políticas:
- **Lectura:** Pública para comentarios en estado `publicado`.
- **Escritura:** Restringida a JWT válidos.
- **Privilegios:** Lógica de `EXISTS` en SQL para validar roles de administrador de forma segura.

### 4.2 Optimización de Recursos
- **Imágenes:** Uso de formatos modernos (`.webp`) para reducir el tiempo de carga (LCP).
- **CSS:** Separación de estilos optimizados por categoría para evitar la descarga de CSS innecesario.

---

## 5. Guía de Mantenimiento y Escalabilidad

### 5.1 Agregar una nueva Distribución
1. Crear el archivo `HTML/nombre-distro.html` basándose en `distros-base.css`.
2. Añadir el estilo específico en `CSS/nombre-distro-optimized.css`.
3. Actualizar el script de navegación si es necesario.

### 5.2 Gestión de Administradores
Para promover a un usuario a ADMIN, se debe ejecutar en el SQL Editor de Supabase:
```sql
update public.usuario set rol = 'ADMIN' where nick = 'nombre_usuario';
```

---

## 6. Créditos y Licencia

Este proyecto es una iniciativa de código abierto liderada por **Enzo Lautaro Patiño**. 

- **Licencia:** MIT License
- **Filosofía:** "Tu PC, tu libertad."

---
*Ultima actualización: Junio 2026*
