-- Policies y trigger necesarios para el foro con Supabase Auth.
-- Ejecutar este archivo en Supabase Dashboard > SQL Editor.

alter table public.usuario enable row level security;
alter table public.comentario enable row level security;

-- ================================================
-- POLÍTICAS PARA LA TABLA USUARIO
-- ================================================

drop policy if exists "Usuarios pueden leer perfiles" on public.usuario;
create policy "Usuarios pueden leer perfiles"
on public.usuario
for select
to anon, authenticated
using (true);

drop policy if exists "Usuarios pueden crear su perfil" on public.usuario;
create policy "Usuarios pueden crear su perfil"
on public.usuario
for insert
to authenticated
with check (id_usuario = auth.uid());

drop policy if exists "Usuarios pueden actualizar su perfil" on public.usuario;
create policy "Usuarios pueden actualizar su perfil"
on public.usuario
for update
to authenticated
using (id_usuario = auth.uid())
with check (id_usuario = auth.uid());

-- ================================================
-- TRIGGER DE PERFIL (CORREGIDO)
-- ================================================

create or replace function public.crear_perfil_usuario_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuario (
    id_usuario,
    email,
    nick,            -- Corregido: antes nombre_usuario
    avatar_url,      -- Corregido: antes foto_usuario
    descripcion,
    distro_favorita,
    estado,
    rol
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre_usuario', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'foto_usuario', '🐧'),
    '',
    'Distro favorita no indicada',
    'activo',
    'usuario'
  )
  on conflict (id_usuario) do nothing;

  return new;
end;
$$;

drop trigger if exists crear_perfil_usuario_auth on auth.users;
create trigger crear_perfil_usuario_auth
after insert on auth.users
for each row execute function public.crear_perfil_usuario_auth();

-- ================================================
-- POLÍTICAS PARA LA TABLA COMENTARIO (CON ADMINS)
-- ================================================

drop policy if exists "Todos pueden leer comentarios" on public.comentario;
create policy "Todos pueden leer comentarios"
on public.comentario
for select
to anon, authenticated
using (estado = 'publicado');

drop policy if exists "Usuarios pueden publicar comentarios" on public.comentario;
create policy "Usuarios pueden publicar comentarios"
on public.comentario
for insert
to authenticated
with check (id_usuario = auth.uid() and estado = 'publicado');

-- Permitir a dueños Y admins actualizar
drop policy if exists "Usuarios pueden actualizar sus comentarios" on public.comentario;
create policy "Admins y dueños pueden actualizar comentarios"
on public.comentario
for update
to authenticated
using (
  id_usuario = auth.uid() OR 
  (exists (select 1 from public.usuario where id_usuario = auth.uid() and rol = 'ADMIN'))
);

-- Permitir a dueños Y admins eliminar
drop policy if exists "Usuarios pueden eliminar sus comentarios" on public.comentario;
create policy "Admins y dueños pueden eliminar comentarios"
on public.comentario
for delete
to authenticated
using (
  id_usuario = auth.uid() OR 
  (exists (select 1 from public.usuario where id_usuario = auth.uid() and rol = 'ADMIN'))
);
