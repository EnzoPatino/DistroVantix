# Mejoras y pendientes - DistroVantix

Fecha del analisis: 2026-07-08  
Proyecto analizado: DistroVantix  
Alcance: HTML, CSS, JavaScript, SQL Supabase, documentacion, assets y pendientes manuales.

## Diagnostico general

DistroVantix es una web estatica educativa sobre GNU/Linux construida con HTML, CSS y JavaScript vanilla. La mayor parte del sitio son paginas informativas por categoria y distribucion. La zona dinamica principal es el foro, conectado a Supabase Auth y tablas `usuario` / `comentario`; ademas existe un componente de perfil global (`JS/perfilGlobal.js`) que replica parte de la autenticacion y gestion de perfil en las paginas comunes.

El proyecto esta funcionalmente avanzado, pero tiene riesgos claros en seguridad, mantenimiento y rendimiento. La prioridad mas alta es cerrar brechas de Supabase/RLS, unificar la logica de autenticacion/perfil y hacer que el foro escale con paginacion, constraints coherentes y CAPTCHA real. Luego conviene ordenar HTML/CSS, optimizar imagenes y normalizar documentacion.

## Mejoras recomendadas

| Estado | Prioridad | Mejora | Motivo | Archivos / area | Fecha registro | Fecha objetivo |
|---|---|---|---|---|---|---|
| - [x] | Alta | Unificar autenticacion y perfil en un solo flujo compartido | `JS/Foro.js` y `JS/perfilGlobal.js` duplican login, registro, creacion de perfil y Supabase client. Esto aumenta errores y comportamiento inconsistente entre foro y subpaginas. | `JS/authGlobal.js`, `JS/Foro.js`, `JS/perfilGlobal.js`, `HTML/Foro.html` | 2026-07-08 | 2026-07-17 |
| - [ ] | Alta | Integrar Cloudflare Turnstile de forma real con Supabase Auth | El widget existe en `HTML/Foro.html`, pero el token no se envia en `signInWithPassword` / `signUp`. Asi puede quedar como decoracion si Supabase no lo valida. | `HTML/Foro.html`, `JS/Foro.js`, Supabase Auth | 2026-07-08 | 2026-07-15 |
| - [ ] | Alta | Restringir lectura publica de perfiles | La politica `Usuarios pueden leer perfiles` permite `using (true)` sobre toda la tabla `usuario`, exponiendo campos como `email`. Conviene usar vista publica sin datos sensibles. | `sql/foro_policies_supabase.sql`, Supabase DB | 2026-07-08 | 2026-07-15 |
| - [ ] | Alta | Alinear constraints de base de datos con HTML/JS | Comentarios: HTML limita 500, SQL limita 1000. Nick: perfil del foro permite 40, SQL 30. Esto genera errores evitables. | `HTML/Foro.html`, `JS/Foro.js`, `JS/perfilGlobal.js`, `sql/constraints_longitud.sql` | 2026-07-08 | 2026-07-16 |
| - [ ] | Alta | Agregar constraints semanticas en Supabase | Faltan checks para contenido no vacio, `estado`, `rol`, longitud de descripcion/avatar y posibles normalizaciones de nick. | `sql/constraints_longitud.sql`, Supabase DB | 2026-07-08 | 2026-07-18 |
| - [ ] | Alta | Agregar paginacion al foro | `cargarComentarios()` trae todos los comentarios publicados sin limite. Con crecimiento, impacta latencia, ancho de banda y base de datos. | `JS/Foro.js`, Supabase DB | 2026-07-08 | 2026-07-19 |
| - [ ] | Alta | Crear indice para comentarios publicados por fecha | La consulta principal filtra `estado = 'publicado'` y ordena por `fecha desc`. Necesita indice compuesto. | Supabase DB, script SQL nuevo | 2026-07-08 | 2026-07-19 |
| - [x] | Alta | Corregir cierre estructural de `index.html` | El footer no queda cerrado explicitamente antes de los scripts. Puede producir DOM inesperado y problemas de estilos/eventos. | `index.html` | 2026-07-08 | 2026-07-12 |
| - [x] | Alta | Evitar modal de login automatico para invitados en foro | `chequearSesion()` abre el modal al cargar y oculta el cierre. Esto bloquea lectura publica y genera friccion. | `JS/Foro.js`, `HTML/Foro.html` | 2026-07-08 | 2026-07-14 |
| - [x] | Media | Refactorizar `JS/Foro.js` por responsabilidades | Tiene 684 lineas y mezcla Supabase, estado, DOM, validaciones, CRUD y perfil. Separarlo facilita mantenimiento. | `JS/Foro.js`, `JS/authGlobal.js` | 2026-07-08 | 2026-07-26 |
| - [x] | Media | Evitar `innerHTML` con datos de usuario | Hay render de avatar/nick con `innerHTML` en perfil global. Si se aceptan URLs o cadenas libres, conviene construir nodos o sanitizar estrictamente. | `JS/perfilGlobal.js` | 2026-07-08 | 2026-07-20 |
| - [ ] | Media | Mejorar estados de error visibles | Varias fallas quedan solo en `console.error`, por ejemplo cargar/eliminar comentarios o cargar perfil. Debe mostrarse feedback con reintento. | `JS/Foro.js`, `JS/perfilGlobal.js`, CSS relacionado | 2026-07-08 | 2026-07-22 |
| - [x] | Media | Usar `try/catch/finally` en acciones con botones | Algunos botones se reactivan manualmente en exito/error. `finally` reduce riesgo de botones bloqueados. | `JS/Foro.js`, `JS/perfilGlobal.js` | 2026-07-08 | 2026-07-22 |
| - [ ] | Media | Actualizar comentarios incrementalmente | Despues de publicar, editar o eliminar se recarga toda la lista. Para UX y rendimiento conviene actualizar la tarjeta afectada. | `JS/Foro.js` | 2026-07-08 | 2026-07-25 |
| - [ ] | Media | Optimizar imagenes pesadas | Hay imagenes entre 1.3 MB y 2.1 MB (`SteamLinux.png`, `AnticheatLinux.png`, `Estudiante Animacion.png`, etc.). Convertir a WebP/AVIF y generar tamanos responsive. | `IMGS/`, HTML de categorias | 2026-07-08 | 2026-07-28 |
| - [ ] | Media | Definir `width` y `height` en imagenes principales | Muchas imagenes no declaran dimensiones. Esto puede generar CLS y saltos visuales. | `index.html`, `HTML/*.html`, `HTML/*.htm` | 2026-07-08 | 2026-07-28 |
| - [ ] | Media | No usar `loading="lazy"` en imagenes hero/above-the-fold | Varias imagenes principales de paginas de distro estan marcadas como lazy. Esto puede empeorar LCP. | `HTML/Debian.html`, `HTML/Ubuntu.html`, paginas de distro | 2026-07-08 | 2026-07-24 |
| - [ ] | Media | Reemplazar `@import` CSS por `<link>` directo cuando aplique | `CSS/Foro.css` importa Google Fonts y varios CSS importan `distros-base.css`. `@import` retrasa descubrimiento de recursos. | `CSS/*.css`, `HTML/*.html` | 2026-07-08 | 2026-07-27 |
| - [ ] | Media | Reducir efectos costosos en moviles | `backdrop-filter`, `background-attachment: fixed` y gradientes pesados pueden afectar scroll/FPS en celulares. | `CSS/Foro.css`, `CSS/style.css`, `CSS/distros-base.css`, `CSS/perfilGlobal.css` | 2026-07-08 | 2026-07-29 |
| - [ ] | Media | Mover estilos inline a clases CSS | Hay botones, links y modales con `style=""`. Esto dificulta CSP, mantenimiento y consistencia visual. | `HTML/Foro.html`, `index.html`, `HTML/*.html` | 2026-07-08 | 2026-07-31 |
| - [ ] | Media | Configurar Content Security Policy en despliegue | El sitio carga CDN Supabase, Turnstile, Google Fonts y conecta a Supabase. Una CSP reduce impacto ante XSS. | Vercel headers/configuracion | 2026-07-08 | 2026-07-23 |
| - [ ] | Media | Eliminar logs de produccion | Hay `console.log` en scripts de distros, perfil y secciones. Conviene usar flag de debug o retirarlos. | `JS/*.js` | 2026-07-08 | 2026-07-21 |
| - [ ] | Media | Centralizar tokens de diseno | Hay variables y patrones repetidos entre CSS global, foro y CSS por categoria. Un `tokens.css` simplifica cambios. | `CSS/style.css`, `CSS/Foro.css`, `CSS/distros-base.css`, CSS optimizados | 2026-07-08 | 2026-08-05 |
| - [ ] | Baja | Usar `data-distro` en paginas de distribucion | `JS/Distros.js` depende de titulo/path, que es fragil si cambian nombres o rutas. | `JS/Distros.js`, paginas de distro | 2026-07-08 | 2026-08-02 |
| - [ ] | Baja | Normalizar nombres de archivos con espacios y signos especiales | Archivos como `arch linux.html`, `computacion grafica.html` y `Pop!_OS.html` complican enlaces, scripts y despliegues. | `HTML/`, `CSS/`, enlaces internos | 2026-07-08 | 2026-08-08 |
| - [ ] | Baja | Unificar idioma y ortografia en documentacion/UI | Hay mezcla de español argentino, español neutro e ingles; tambien pequenos errores de texto. | `README.md`, `DOCUMENTACION.md`, `DOCUMENTATION.md`, HTML | 2026-07-08 | 2026-08-10 |
| - [x] | Baja | Agregar contenido educativo de dotfiles y shells de escritorio en Personalización | La página de Personalización cubría entornos de escritorio y temas, pero no explicaba qué son los dotfiles ni la diferencia entre shell de login y shell de escritorio. Se agregó la sección `#Shells` con tabs (dotfiles + git + gestores, aclaración login vs escritorio, comparativa Caelestia/Noctalia/Waybar+AGS-Eww sobre Quickshell y glosario), reutilizando el carrusel existente (`changeDistroSlide` con selector opcional), las cards `.distro-card` locales y rendering sin `innerHTML`. | `HTML/Personalizacion.html`, `JS/Personalizacion.js`, `CSS/Personalizacion-optimized.css` | 2026-08-23 | 2026-08-23 |
| - [x] | Media | Extraer base CSS compartida para las 6 categorías (patrón distros-base) | Los CSS de categoría duplicaban ~420 líneas de plantilla por archivo (reset, navbar, sidebar, main, hero/info/features, carrusel informativo) cambiando solo prefijos de clase y colores. Se creó `CSS/categorias-base.css` con selectores agrupados y acentos parametrizados (`--cat-primary`/`--cat-secondary`, tintes con `color-mix()`), y cada `*_optimized.css` ahora hace `@import` de la base y conserva solo tokens, footer, carrusel de distros, hovers y media queries propias. Reducción neta: ~1660 líneas (~41%). Verificación: cobertura 100% de selectores viejo→nuevo por página. | `CSS/categorias-base.css`, `CSS/Gaming-optimized.css`, `CSS/Ciberseguridad-optimized.css`, `CSS/Desarrollo-optimized.css`, `CSS/computacion grafica.css`, `CSS/Trabajo.css`, `CSS/Personalizacion-optimized.css` | 2026-08-23 | 2026-08-23 |

## Pendientes

| Estado | Prioridad | Pendiente | Accion necesaria | Responsable sugerido | Fecha registro | Fecha objetivo |
|---|---|---|---|---|---|---|
| - [ ] | Alta | Reemplazar Site Key de prueba de Turnstile | Crear widget en Cloudflare Turnstile y reemplazar `0x4AAAAAAA0-V7k6yBdBcFMG` por la key real. | Administrador del proyecto | 2026-07-08 | 2026-07-12 |
| - [ ] | Alta | Activar CAPTCHA en Supabase Auth | En Supabase Dashboard activar Cloudflare Turnstile y validar que login/registro envien el token correcto. | Administrador Supabase | 2026-07-08 | 2026-07-15 |
| - [ ] | Alta | Ejecutar SQL de constraints en Supabase | Aplicar constraints de longitud corregidas y nuevos checks. Probar antes si hay datos existentes fuera de rango. | Administrador Supabase | 2026-07-08 | 2026-07-18 |
| - [ ] | Alta | Revisar y aplicar politicas RLS endurecidas | Cambiar lectura publica de `usuario`, limitar updates y validar admin desde DB. | Administrador Supabase | 2026-07-08 | 2026-07-15 |
| - [ ] | Alta | Confirmar claves Supabase | Verificar que solo se use anon/publishable key en frontend y que no exista service role key en archivos publicos. | Administrador del proyecto | 2026-07-08 | 2026-07-11 |
| - [ ] | Alta | Verificar confirmacion de email | Decidir si queda activada para produccion o desactivada solo para pruebas. Documentar la decision. | Administrador Supabase | 2026-07-08 | 2026-07-14 |
| - [ ] | Alta | Probar registro/login/logout en todas las paginas | Validar sesion compartida entre `index.html`, paginas de categoria y foro despues de unificar auth. | QA / Desarrollo | 2026-07-08 | 2026-07-20 |
| - [ ] | Media | Medir performance con Lighthouse | Medir antes y despues de optimizar imagenes, CSS y carga de scripts. Guardar resultados. | Desarrollo | 2026-07-08 | 2026-07-30 |
| - [ ] | Media | Crear checklist de despliegue Vercel | Incluir headers/CSP, cache de assets, rutas, dominios permitidos en Supabase y variables/configuracion externa. | Desarrollo | 2026-07-08 | 2026-07-27 |
| - [ ] | Media | Validar HTML de paginas principales | Revisar `index.html`, `HTML/Foro.html`, categorias y distros con validador HTML. Corregir cierres, nesting y atributos. | Desarrollo | 2026-07-08 | 2026-07-24 |
| - [ ] | Media | Revisar enlaces internos y externos | Confirmar que todas las rutas funcionen, especialmente archivos con espacios o signos especiales. | QA / Desarrollo | 2026-07-08 | 2026-07-26 |
| - [ ] | Media | Documentar esquema real de Supabase | Agregar tablas, columnas, constraints, indices, triggers y politicas definitivas. | Desarrollo | 2026-07-08 | 2026-07-29 |
| - [ ] | Media | Definir politica de moderacion | Decidir si eliminar comentarios sera delete real o cambio de estado (`eliminado`/`oculto`) para auditoria. | Producto / Desarrollo | 2026-07-08 | 2026-07-25 |
| - [ ] | Baja | Actualizar `README.md` con instrucciones locales | Incluir como abrir el proyecto, dependencias externas, Supabase requerido y estructura actual. | Desarrollo | 2026-07-08 | 2026-08-03 |
| - [ ] | Baja | Consolidar `DOCUMENTACION.md` y `DOCUMENTATION.md` | Mantener una fuente principal y, si se conserva ingles/español, asegurar que ambas esten sincronizadas. | Documentacion | 2026-07-08 | 2026-08-07 |
| - [ ] | Baja | Revisar nombres de categorias y textos visibles | Corregir acentos, mayusculas y consistencia: "Informacion", "Comparacion", "Hyprland/Hyperland", etc. | Documentacion / UI | 2026-07-08 | 2026-08-10 |

## Plan sugerido por etapas

### Etapa 1 - Seguridad y funcionamiento base

Fecha objetivo: 2026-07-20

- [ ] Corregir RLS de `usuario`.
- [ ] Integrar Turnstile correctamente.
- [ ] Alinear constraints HTML/JS/SQL.
- [x] Corregir `index.html`.
- [x] Evitar login modal automatico en foro.
- [ ] Verificar registro, login, logout y sesion compartida.

### Etapa 2 - Escalabilidad del foro

Fecha objetivo: 2026-07-31

- [ ] Paginacion de comentarios.
- [ ] Indice `comentario(estado, fecha desc)`.
- [ ] Feedback de errores visible.
- [x] Refactor inicial de servicios para Supabase/Auth/Comentarios.
- [ ] Reducir recargas completas despues de mutaciones.

### Etapa 3 - Rendimiento y calidad visual

Fecha objetivo: 2026-08-08

- [ ] Optimizar imagenes grandes.
- [ ] Definir dimensiones de imagenes.
- [ ] Ajustar lazy loading de heroes.
- [ ] Reducir efectos costosos en moviles.
- [ ] Sacar estilos inline progresivamente.

### Etapa 4 - Documentacion y mantenimiento

Fecha objetivo: 2026-08-15

- [ ] Actualizar README.
- [ ] Consolidar documentacion tecnica.
- [ ] Documentar esquema real de Supabase.
- [ ] Normalizar nombres de archivos y rutas si el despliegue lo permite.

## Riesgos principales si no se corrige

- Exposicion innecesaria de datos de perfil por lectura publica de `usuario`.
- CAPTCHA inefectivo si el token no llega a Supabase Auth.
- Duplicacion de perfiles o errores intermitentes por trigger + inserts manuales + upserts.
- Lentitud del foro cuando aumenten comentarios por falta de paginacion e indices.
- Peor rendimiento movil por imagenes grandes y efectos CSS pesados.
- Mantenimiento mas dificil por logica duplicada, estilos inline y archivos con nombres fragiles.

## Observaciones finales

El proyecto ya tiene una base clara y usable. Las mejoras mas importantes no son agregar mas contenido, sino cerrar seguridad, simplificar la arquitectura del foro/perfil y preparar el sitio para crecer sin perder rendimiento ni consistencia.
