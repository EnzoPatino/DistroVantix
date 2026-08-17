# Pendientes de seguridad - DistroVantix

Fecha del analisis: 2026-07-08  
Alcance revisado: `JS/Foro.js`, `JS/perfilGlobal.js`, `HTML/Foro.html`, `sql/foro_policies_supabase.sql`, `sql/constraints_longitud.sql`, HTML principal y carga de recursos externos.

## Resumen ejecutivo

### 🚨 SQL URGENTE PARA EJECUTAR EN SUPABASE 🚨

```sql
-- ================================================
-- SOLUCIÓN A VULNERABILIDADES SEG-001 Y SEG-002
-- ================================================

-- 1. CORRECCIÓN SEG-002: LECTURA PÚBLICA RESTRINGIDA Y VISTA SEGURA
-- Revocar la política de lectura pública directa amplia sobre public.usuario
DROP POLICY IF EXISTS "Usuarios pueden leer perfiles" ON public.usuario;

-- Permitir que un usuario autenticado lea su propio perfil completo
CREATE POLICY "Usuarios pueden leer su propio perfil"
ON public.usuario
FOR SELECT
TO authenticated
USING (id_usuario = auth.uid());

-- Crear una vista segura para perfiles públicos que solo expone campos no sensibles
-- Al crearse en el esquema público como vista estándar por el rol administrador,
-- se ejecuta con los privilegios del definidor (postgres), omitiendo el RLS de la
-- tabla base para poder listar los perfiles públicos de forma segura sin revelar
-- información sensible como emails o estados.
CREATE OR REPLACE VIEW public.perfiles_publicos AS
SELECT id_usuario, nick, avatar_url, distro_favorita, rol
FROM public.usuario;

-- Garantizar que tanto usuarios anónimos como autenticados puedan leer la vista
GRANT SELECT ON public.perfiles_publicos TO anon, authenticated;


-- 2. CORRECCIÓN SEG-001: RESTRINGIR ACTUALIZACIÓN DE COLUMNAS SENSIBLES
-- Primero, eliminamos la política de UPDATE previa
DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil" ON public.usuario;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.usuario;

-- Creamos la nueva política RLS para UPDATE que permite actualizar solo el perfil propio
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON public.usuario
FOR UPDATE
TO authenticated
USING (id_usuario = auth.uid())
WITH CHECK (id_usuario = auth.uid());

-- Como RLS en PostgreSQL opera a nivel de fila y no permite comparar columnas modificadas (OLD y NEW)
-- de forma nativa sin recurrir en problemas de recursión, implementamos un trigger BEFORE UPDATE
-- que bloquea estrictamente cualquier intento de alterar rol, estado, email o id_usuario desde el cliente.
CREATE OR REPLACE FUNCTION public.proteger_columnas_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Restringir la edición si la petición proviene de un rol de cliente (authenticated o anon).
  -- Esto permite que procesos administrativos de backend o el dashboard de Supabase (service_role) sigan funcionando.
  IF auth.role() IN ('authenticated', 'anon') THEN
    IF NEW.rol IS DISTINCT FROM OLD.rol THEN
      RAISE EXCEPTION 'No está permitido modificar la columna "rol" desde el cliente.';
    END IF;

    IF NEW.estado IS DISTINCT FROM OLD.estado THEN
      RAISE EXCEPTION 'No está permitido modificar la columna "estado" desde el cliente.';
    END IF;

    IF NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'No está permitido modificar la columna "email" desde el cliente.';
    END IF;

    IF NEW.id_usuario IS DISTINCT FROM OLD.id_usuario THEN
      RAISE EXCEPTION 'No está permitido modificar la columna "id_usuario" desde el cliente.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Vincular el trigger a la tabla public.usuario
DROP TRIGGER IF EXISTS proteger_columnas_usuario_trg ON public.usuario;
CREATE TRIGGER proteger_columnas_usuario_trg
BEFORE UPDATE ON public.usuario
FOR EACH ROW
EXECUTE FUNCTION public.proteger_columnas_usuario();
```

El proyecto depende de Supabase desde el frontend. Eso es valido si la clave publicada es anon/publishable, pero hace que la seguridad real dependa casi por completo de RLS, constraints, Auth y del renderizado seguro en el navegador.

Los riesgos principales detectados son:

- Posible escalada de privilegios por politica RLS de `usuario`.
- Exposicion publica de datos privados de perfiles, especialmente `email`.
- Posible XSS almacenado por renderizar datos editables con `innerHTML`.
- CAPTCHA visible pero no integrado de forma verificable con `signUp` / `signInWithPassword`.
- Falta de rate limiting real para registro, login y comentarios.
- Constraints incompletas o desalineadas entre HTML/JS/DB.



## Vulnerabilidades y pendientes prioritarios


| Estado | ID      | Vulnerabilidad / pendiente                                               | Importancia | Riesgo explotable o escalable                                                                                                                                                                                                  | Accion requerida                                                                                                                                                                                                                         | Fecha registro | Fecha objetivo |
| ------ | ------- | ------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | -------------- |
| - [x]  | SEG-001 | Usuarios pueden modificar columnas sensibles de su perfil                | Critica     | La politica `Usuarios pueden actualizar su perfil` solo valida `id_usuario = auth.uid()`. Si la tabla permite actualizar `rol` o `estado`, un usuario podria intentar elevarse a `ADMIN` o reactivar estados desde el cliente. | Restringir updates a columnas permitidas. Separar datos publicos editables (`nick`, `avatar_url`, `descripcion`) de columnas administrativas (`rol`, `estado`, `email`). Crear politicas o RPC controladas para cambios administrativos. | 2026-07-08     | 2026-07-10     |
| - [x]  | SEG-002 | Lectura publica completa de `usuario`                                    | Critica     | `using (true)` permite a anon/authenticated leer toda la tabla `usuario`. Si contiene `email`, `estado` u otros campos privados, cualquiera podria enumerar perfiles y correos.                                                | Revocar lectura directa amplia. Crear vista `perfiles_publicos` con solo `id_usuario`, `nick`, `avatar_url`, `distro_favorita`, `rol` si hace falta. Ajustar joins del foro para usar campos publicos.                                   | 2026-07-08     | 2026-07-10     |
| - [x]  | SEG-003 | XSS almacenado por `innerHTML` con datos de perfil                       | Critica     | `JS/perfilGlobal.js` renderiza `nick` y `avatar_url` con `innerHTML`. Como esos valores son editables por usuarios, un dato malicioso podria ejecutarse al cargar la barra de perfil o modal en otras paginas.                 | Reemplazar render con `textContent`, `createElement`, `setAttribute` y validacion estricta de avatar. No insertar nick/avatar como HTML. Sanitizar y limitar URLs a `https:` e imagenes validas.                                         | 2026-07-08     | 2026-07-11     |
| - [ ]  | SEG-004 | CAPTCHA Turnstile no integrado de forma verificable                      | Alta        | El widget aparece en `HTML/Foro.html`, pero el token no se pasa en las llamadas `signUp` / `signInWithPassword`. Esto deja expuestos registro/login a abuso automatizado si Supabase no recibe token.                          | Reemplazar site key de prueba, activar CAPTCHA en Supabase Auth y enviar el token esperado por Supabase en login/registro. Probar bloqueo con token ausente/invalido.                                                                    | 2026-07-08     | 2026-07-12     |
| - [ ]  | SEG-005 | Falta de rate limiting para comentarios                                  | Alta        | Un usuario autenticado podria publicar muchos comentarios en poco tiempo, generando spam, abuso de DB y degradacion del foro.                                                                                                  | Implementar limite por usuario/IP mediante Edge Function, trigger SQL con ventana temporal, tabla de auditoria o reglas server-side. Mantener validacion de cliente solo como UX.                                                        | 2026-07-08     | 2026-07-15     |
| - [ ]  | SEG-006 | Falta de rate limiting para login/registro mas alla de Supabase defaults | Alta        | Si CAPTCHA/email settings no estan fuertes, puede haber fuerza bruta, creacion masiva de cuentas o enumeracion de usuarios.                                                                                                    | Confirmar protecciones Auth en Supabase: CAPTCHA, limites de email, confirmacion de correo en produccion y politicas anti-abuso.                                                                                                         | 2026-07-08     | 2026-07-15     |
| - [ ]  | SEG-007 | Constraints incompletas en base de datos                                 | Alta        | La DB no valida todo lo que el cliente asume. Un atacante puede usar la API directamente con la anon key y saltear HTML/JS.                                                                                                    | Agregar checks: comentario no vacio y longitud real, `rol in ('usuario','ADMIN')`, `estado` permitido, `nick` 3-30, descripcion limitada, avatar limitado, email coherente.                                                              | 2026-07-08     | 2026-07-16     |
| - [ ]  | SEG-008 | Duplicacion de creacion de perfil                                        | Alta        | Hay trigger SQL, `insert` tras signup y `upsert` fallback. Puede generar errores, carreras, perfiles inconsistentes o bypass accidental de reglas esperadas.                                                                   | Elegir una sola fuente: trigger SQL con `security definer` bien limitado o `upsert` idempotente controlado. Eliminar inserts duplicados en cliente.                                                                                      | 2026-07-08     | 2026-07-17     |
| - [ ]  | SEG-009 | Dependencia de rol del cliente para UI de moderacion                     | Media       | El frontend decide mostrar botones por `usuarioLogueado.rol`, pero la proteccion real debe estar en RLS. Si RLS falla, la UI no protege nada.                                                                                  | Mantener UI solo como comodidad. Endurecer RLS para admin y agregar pruebas manuales intentando update/delete sin permisos.                                                                                                              | 2026-07-08     | 2026-07-17     |
| - [ ]  | SEG-010 | Deletes reales de comentarios                                            | Media       | El borrado fisico dificulta auditoria ante abuso, moderacion o investigacion.                                                                                                                                                  | Evaluar soft delete con `estado = 'eliminado'`/`oculto`, registrar `deleted_by`, `deleted_at` y mantener politicas de lectura.                                                                                                           | 2026-07-08     | 2026-07-19     |
| - [ ]  | SEG-011 | Falta Content Security Policy                                            | Alta        | Al usar scripts externos y posible XSS, una CSP reduce impacto de inyecciones. Actualmente no se ve configuracion de headers.                                                                                                  | Configurar CSP en Vercel: `script-src` limitado a self, Supabase CDN y Turnstile; `connect-src` a Supabase; `frame-src` Turnstile; `img-src` controlado; evitar inline si es posible.                                                    | 2026-07-08     | 2026-07-20     |
| - [ ]  | SEG-012 | Scripts externos sin version fijada estricta ni SRI                      | Media       | `cdn.jsdelivr.net/npm/@supabase/supabase-js@2` carga la ultima v2. Un cambio de supply chain o version puede afectar seguridad/funcionamiento.                                                                                 | Fijar version exacta del SDK o empaquetar localmente. Evaluar SRI donde sea compatible.                                                                                                                                                  | 2026-07-08     | 2026-07-22     |
| - [x]  | SEG-013 | Modal de login automatico en invitados                                   | Media       | No es una vulnerabilidad directa, pero favorece abuso de flujo de auth y mala UX. Tambien oculta lectura publica esperada del foro.                                                                                            | No abrir modal automaticamente. Mostrar CTA y abrir solo por accion del usuario.                                                                                                                                                         | 2026-07-08     | 2026-07-14     |
| - [ ]  | SEG-014 | Mensajes y logs de error en cliente                                      | Baja        | `console.error` y mensajes directos pueden filtrar detalles tecnicos o facilitar enumeracion segun configuracion.                                                                                                              | Normalizar errores visibles y quitar logs de produccion. Registrar errores sensibles solo en backend/Supabase.                                                                                                                           | 2026-07-08     | 2026-07-24     |
| - [ ]  | SEG-015 | Falta de pruebas negativas de RLS                                        | Alta        | Sin pruebas intentando acciones no autorizadas, es facil romper politicas al cambiar SQL.                                                                                                                                      | Crear checklist/manual o scripts para probar: anon leyendo `usuario`, usuario editando `rol`, usuario editando comentario ajeno, admin moderando, comentario vacio/largo.                                                                | 2026-07-08     | 2026-07-18     |




## Acciones manuales inmediatas



### 1. Corregir RLS de `usuario`

Importancia: Critica  
Fecha registro: 2026-07-08  
Fecha objetivo: 2026-07-10

Acciones:

- [x] Revocar la politica de lectura publica directa sobre `public.usuario`.
- [x] Crear una vista publica con campos no sensibles.
- [x] Impedir que usuarios normales actualicen `rol`, `estado` y `email`.
- [ ] Verificar desde el navegador o cliente Supabase que un usuario normal no puede convertirse en `ADMIN`.



### 2. Corregir XSS en perfil global

Importancia: Critica  
Fecha registro: 2026-07-08  
Fecha objetivo: 2026-07-11  
Estado: **RESUELTO** (2026-07-11)

Acciones:

- [x] Reemplazar `innerHTML` cuando renderiza datos de DB por nodos DOM seguros.
- [x] Usar `textContent` para `nick`, `rol`, descripcion y emojis.
- [x] Para avatar URL, crear `img` con `document.createElement("img")` y `setAttribute`.
- [x] Validar que avatar solo acepte emoji simple o URL `https:` permitida.
- [x] Probar que un nick/avatar con caracteres HTML se muestre como texto y no se ejecute.



### 3. Activar CAPTCHA correctamente

Importancia: Alta  
Fecha registro: 2026-07-08  
Fecha objetivo: 2026-07-12

Acciones:

- [ ] Crear widget en Cloudflare Turnstile para `distro-vantix.vercel.app`.
- [ ] Reemplazar `data-sitekey="0x4AAAAAAA0-V7k6yBdBcFMG"` en `HTML/Foro.html`.
- [ ] Activar CAPTCHA protection en Supabase Auth.
- [ ] Ajustar `JS/Foro.js` para enviar el token de Turnstile si Supabase lo requiere en Auth.
- [ ] Repetir el mismo control para `JS/perfilGlobal.js`, porque tambien registra e inicia sesion usuarios.
- [ ] Probar que registro/login fallen si el token falta o es invalido.



### 4. Agregar constraints defensivas

Importancia: Alta  
Fecha registro: 2026-07-08  
Fecha objetivo: 2026-07-16

SQL base a ajustar antes de ejecutar:

```sql
-- Comentarios: no vacios y mismo limite que el frontend
ALTER TABLE public.comentario
ADD CONSTRAINT comentario_contenido_longitud
CHECK (char_length(trim(contenido)) BETWEEN 1 AND 500);

-- Estados permitidos
ALTER TABLE public.comentario
ADD CONSTRAINT comentario_estado_valido
CHECK (estado IN ('publicado', 'oculto', 'eliminado'));

ALTER TABLE public.usuario
ADD CONSTRAINT usuario_estado_valido
CHECK (estado IN ('activo', 'suspendido'));

ALTER TABLE public.usuario
ADD CONSTRAINT usuario_rol_valido
CHECK (rol IN ('usuario', 'ADMIN'));

-- Nick coherente con formularios
ALTER TABLE public.usuario
ADD CONSTRAINT usuario_nick_longitud
CHECK (char_length(trim(nick)) BETWEEN 3 AND 30);

-- Descripcion limitada
ALTER TABLE public.usuario
ADD CONSTRAINT usuario_descripcion_longitud
CHECK (descripcion IS NULL OR char_length(descripcion) <= 200);
```

Antes de ejecutar, revisar si ya existen constraints con esos nombres o datos fuera de rango.

Acciones:

- [ ] Revisar datos existentes fuera de rango antes de aplicar constraints.
- [ ] Ejecutar el SQL de constraints en Supabase.
- [ ] Probar insercion/actualizacion invalida desde cliente para confirmar rechazo en DB.



### 5. Mantener confirmacion de email en produccion

Importancia: Alta  
Fecha registro: 2026-07-08  
Fecha objetivo: 2026-07-14

El pendiente anterior recomendaba desactivar confirmacion de email para pruebas. Para produccion, lo recomendado es mantenerla activada salvo que haya otro control fuerte de abuso. Si se desactiva, debe quedar documentado como modo de prueba y no como configuracion final.

Acciones:

- [ ] Decidir si la confirmacion de email queda activa en produccion.
- [ ] Documentar la decision en la documentacion del proyecto.



## Checklist de verificacion de cierre

Fecha objetivo general: 2026-07-20

- [ ] Un usuario anonimo no puede consultar emails de `usuario`.
- [ ] Un usuario autenticado no puede cambiar su `rol` ni `estado`.
- [ ] Un usuario normal no puede editar ni eliminar comentarios ajenos.
- [ ] Un admin puede moderar solo por politica de DB, no por confianza en el frontend.
- [ ] El registro falla sin CAPTCHA valido si CAPTCHA esta activado.
- [ ] El login falla sin CAPTCHA valido si se exige CAPTCHA para login.
- [ ] Nick, avatar y descripcion no ejecutan HTML/JS al mostrarse.
- [ ] Comentarios vacios o mayores al limite son rechazados por la DB.
- [ ] La anon/publishable key es la unica clave presente en frontend.
- [ ] No existe ninguna service role key en archivos publicos.



## Orden recomendado de trabajo

1. 2026-07-10: cerrar `SEG-001` y `SEG-002`.
2. 2026-07-11: cerrar `SEG-003`.
3. 2026-07-12: cerrar `SEG-004`.
4. 2026-07-16: cerrar `SEG-005`, `SEG-006` y `SEG-007`.
5. 2026-07-20: cerrar pruebas negativas, CSP y checklist completo.



## Nota sobre Supabase anon key

La clave anon/publishable en frontend no es una vulnerabilidad por si sola. El riesgo aparece si RLS, constraints o Auth estan mal configurados, porque cualquiera puede llamar la API de Supabase directamente desde fuera del sitio. Por eso los controles importantes deben estar en base de datos/Auth, no solo en HTML o JavaScript.