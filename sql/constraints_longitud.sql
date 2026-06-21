-- ================================================
-- Constraints de longitud para seguridad (Defense in Depth)
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ================================================

-- Limitar longitud de comentarios a 1000 caracteres
ALTER TABLE public.comentario
ADD CONSTRAINT comentario_longitud
CHECK (char_length(contenido) <= 1000);

-- Limitar longitud del nick de usuario (entre 3 y 30 caracteres)
ALTER TABLE public.usuario
ADD CONSTRAINT nick_longitud
CHECK (char_length(nick) BETWEEN 3 AND 30);
