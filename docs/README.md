# DistroVantix - Encuentra tu Linux Ideal

![DistroVantix Logo](<IMGS/Logo%20futurista%20de%20DistroVantix(1).png>)

**DistroVantix** es una plataforma interactiva diseñada para romper las barreras del desconocimiento sobre Linux. Durante años, ha existido el mito de que Linux es exclusivo para hackers o expertos en programación; este proyecto nace para demostrar que Linux es para todos.

Nuestra misión es guiarte en la transición hacia un sistema operativo libre, ofreciéndote documentación clara, recomendaciones personalizadas según tu perfil (Gaming, Trabajo, Seguridad, etc.) y una comunidad activa.

## Objetivos

- **Facilitar la entrada:** Simplificar el proceso de adopción de un nuevo sistema operativo.
- **Claridad de beneficios:** Explicar de forma entendible las ventajas de las distintas distribuciones.
- **Documentación Centralizada:** Proporcionar guías de instalación, comandos esenciales y áreas de información técnica.
- **Empoderamiento del Usuario:** Demostrar que Linux permite el control total sobre tu propio ecosistema digital.

## Características Principales

- **Categorización por Perfil:** Secciones dedicadas a Gaming, Desarrollo, Ciberseguridad, Computación Gráfica y Personalización (con guía de dotfiles y shells de escritorio).
- **Manual de Usuario:** Guía detallada para dar los primeros pasos en Linux.
- **Gestión de Perfil Global:** Modal interactivo integrado con Supabase Auth y Database para iniciar sesión, registrarse y editar perfil (avatar y descripción) con persistencia en todas las subpáginas de categorías.
- **Foro Comunitario:** Espacio integrado con **Supabase** para compartir dudas, soluciones y experiencias.
- **Interfaz Moderna:** Diseño optimizado y amigable enfocado en la experiencia de usuario.

## Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS).
- **Backend/Base de Datos:** [Supabase](https://supabase.com/) (Autenticación, Row Level Security, Base de Datos PostgreSQL).
- **Estilos:** CSS personalizado para cada categoría y diseño responsive.

## Estructura del Proyecto

- `index.html`: Punto de entrada principal.
- `HTML/`: Contiene todas las páginas de categorías y distribuciones específicas.
- `CSS/`: Estilos optimizados para cada sección temática.
- `JS/`: Lógica interactiva y conexión con servicios externos.
- `IMGS/`: Recursos visuales y logos de distribuciones.
- `sql/`: Scripts de configuración para la base de datos Supabase.

## Cómo Encontrarnos

1. Copia esta URL en tu navegador de preferencia desde tu PC o Celular:
   ```bash
   https://distro-vantix.vercel.app/
   ```
2. Abre el boton superior a la izquierda.
3. Y selecciona una categoria y navega en la misma.
4. Bajando vas a tener las distros con sus despectivas documentaciones.

## Creador

**Enzo Lautaro Patiño** - _Desarrollador y entusiasta del código abierto._

---

_DistroVantix: Tu PC, tu libertad._
