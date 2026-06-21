# Tareas Pendientes — DistroVantix

Acciones manuales necesarias para completar la seguridad del proyecto.

---

## 1. Activar CAPTCHA con Cloudflare Turnstile

### Paso 1 — Obtener Site Key en Cloudflare

1. Andá a https://dash.cloudflare.com/sign-up (creá cuenta gratuita si no tenés)
2. En el menú lateral, entrá en **Turnstile**
3. Click en **"Add a site"**
4. Completá:
   - **Site name:** `DistroVantix`
   - **Domain:** `distro-vantix.vercel.app`
   - **Widget type:** `Managed` (recomendado) o `Non-interactive`
5. Acepta los términos y crealo
6. Te van a dar un **Site Key** y un **Secret Key**

### Paso 2 — Reemplazar la Site Key en el HTML

Abrite `HTML/Foro.html` y reemplazá la Site Key de prueba (linea 12, 161 y 182):

```
Buscar:  data-sitekey="0x4AAAAAAA0-V7k6yBdBcFMG"
Cambiar por: data-sitekey="tu-site-key-real-de-cloudflare"
```

### Paso 3 — Activar CAPTCHA en Supabase

1. Andá a https://supabase.com/dashboard/projects
2. Seleccioná tu proyecto de DistroVantix
3. En el menú de la izquierda: **Authentication** → **Settings**
4. Buscá la sección **"Security"**
5. Activá **"Enable CAPTCHA protection"**
6. En **"CAPTCHA Provider"** seleccioná **Cloudflare Turnstile**
7. Pegá el **Site Key** de Turnstile en el campo que aparece
8. Click en **"Save"**

> ✅ Con esto Supabase valida automáticamente el token del CAPTCHA del lado del servidor. No necesitás tocar el código JS.

---

## 2. Agregar Constraints de Longitud en la Base de Datos

### Ejecutar el SQL en Supabase

1. Andá a https://supabase.com/dashboard/projects
2. Seleccioná tu proyecto
3. En el menú de la izquierda: **SQL Editor**
4. Click en **"New query"**
5. Copiá y pegá este código:

```sql
-- Limitar longitud de comentarios a 1000 caracteres
ALTER TABLE public.comentario
ADD CONSTRAINT comentario_longitud
CHECK (char_length(contenido) <= 1000);

-- Limitar longitud del nick de usuario (entre 3 y 30 caracteres)
ALTER TABLE public.usuario
ADD CONSTRAINT nick_longitud
CHECK (char_length(nick) BETWEEN 3 AND 30);
```

6. Click en **"Run"** (o Ctrl+Enter)

> ⚠️ Si algún comentario existente tiene más de 1000 caracteres, la constraint va a fallar. Si pasa, ejecutá antes esta consulta para ver cuáles son:
>
> ```sql
> SELECT id_comentario, char_length(contenido) FROM public.comentario
> WHERE char_length(contenido) > 1000;
> ```
>
> Después podés truncarlos manualmente o ajustar el límite a 2000 si hace falta.

---

*Generado desde la sesión de planificación — Junio 2026*
