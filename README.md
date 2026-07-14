# Portfolio — Luciano Bordon

Portfolio personal full CMS: sitio público + panel de administración propio,
sin dependencias de un CMS externo. Construido con **Angular 22** (standalone,
zoneless, signals) y **Supabase** (Postgres, Auth, Storage). Documentado acá
como una entrada más de la sección "Proyectos" del propio sitio: es la prueba
más directa de las habilidades fullstack que el portfolio busca mostrar.

## Qué resuelve

En vez de hardcodear el contenido (proyectos, tecnologías, experiencia) en el
código y tener que redeployar por cada cambio de texto, todo el contenido vive
en una base de datos y se edita desde un panel `/admin` propio, protegido por
login. El sitio público consume esos datos en tiempo real vía la API pública
de Supabase (PostgREST), con Row Level Security como única barrera de
seguridad — no hay backend intermedio.

## Stack

- **Frontend**: Angular 22, standalone components, `provideZonelessChangeDetection`
  (sin zone.js, reactividad basada en signals), Reactive Forms, SCSS.
- **Backend as a Service**: Supabase (Postgres 17, Auth, Storage, RLS).
- **Hosting**: GitHub Pages (estático) + GitHub Actions para el keep-alive de Supabase.

## Arquitectura

```
src/app/
  core/
    models/            interfaces TypeScript por tabla
    services/
      supabase.service.ts       cliente único de Supabase
      auth.service.ts           estado de sesión (signal)
      portfolio-data.service.ts CRUD contra cada tabla
      storage.service.ts        subida a Storage (imágenes/PDFs)
      image-compression.service.ts  compresión a WebP en el navegador
    guards/
      admin.guard.ts     protege /admin verificando sesión activa
  layout/sidebar/        sidebar fija con navegación por scroll-spy
  features/
    public/              hero, about, technologies, projects, experience,
                          education, hobbies, contact — cada una recibe
                          los datos ya cargados por HomeComponent
    admin/                login, shell con nav, dashboard y un
                          formulario/listado CRUD por cada tabla
  shared/directives/
    reveal-on-scroll.directive.ts  fade-in al entrar en viewport (IntersectionObserver)
```

## Modelo de datos (Supabase Postgres)

| Tabla                    | Uso                                                             |
| ------------------------ | ---------------------------------------------------------------|
| `profile`                | Fila única: textos del Hero, "Sobre mí", datos rápidos, links   |
| `technologies`            | Tecnologías agrupadas por categoría (backend/frontend/db/tools)|
| `projects`                | Proyectos con imagen, tags, links y estado                     |
| `experience`              | Timeline de experiencia laboral/freelance                      |
| `education_certificates`  | Timeline de estudios y certificados (con archivo adjunto)       |
| `hobbies`                 | Tarjetas de hobbies (emoji + etiqueta)                          |
| `contact_messages`        | Mensajes enviados desde el formulario de contacto               |

**RLS**: lectura pública (`select`) en todas las tablas de contenido para que
el sitio público funcione sin login. Escritura (`insert`/`update`/`delete`)
restringida a usuarios autenticados — como es un portfolio personal, alcanza
con "hay sesión" (`auth.uid() is not null`), no hace falta una tabla de roles.
`contact_messages` es al revés: cualquiera puede insertar (enviar el
formulario), pero solo el admin autenticado puede leer/editar/borrar mensajes.

## Imágenes: compresión a WebP en el navegador

Como el sitio maneja pocas imágenes (no es una galería), se prioriza nitidez
sobre peso mínimo: se acepta hasta ~450KB por imagen en vez de exprimir al
máximo, para que no se vean pixeladas.

`image-compression.service.ts` resuelve esto **antes de subir el archivo**,
en el propio navegador del admin:

1. Redimensiona la imagen a un máximo de 2200px en su lado más largo.
2. La codifica a WebP vía `<canvas>.toBlob()`, arrancando en calidad 0.92.
3. Si el resultado sigue pesando más de ~450KB, baja la calidad de a 0.05 hasta 0.6 (nunca menos, para no perder nitidez).
4. Si con calidad 0.6 todavía no entra, recién ahí reduce la resolución un 10% e
   itera de nuevo, hasta bajar del límite o llegar a 800px de ancho.

Así, lo único que llega a Supabase Storage ya es un `.webp` — no se sube el
original pesado para después procesarlo server-side.

**Reemplazo de imágenes/archivos**: cada vez que se sube un nuevo avatar, CV,
imagen de fondo del hero, imagen de proyecto o certificado, el archivo
anterior se borra de Supabase Storage (tanto si se reemplaza y se guarda,
como si se sube una imagen nueva dos veces seguidas sin guardar todavía — la
intermedia también se limpia). Al eliminar un proyecto o un certificado
también se borra su archivo asociado. Así el bucket nunca acumula huérfanos.

## Storage

Dos buckets públicos de lectura, con escritura restringida a `authenticated`:

- `portfolio-images`: solo `image/webp`, hasta 550KB por archivo (holgura
  sobre el límite de compresión de ~450KB).
- `portfolio-files`: solo `application/pdf`, hasta 5MB (CV y certificados).

## Qué puede hacer el admin (`/admin`, requiere login)

- **Perfil / Hero / Sobre mí**: editar nombre, cargo, textos del Hero,
  descripción de "Sobre mí", ubicación, disponibilidad, idiomas, intereses,
  links de GitHub/LinkedIn/email. Subir avatar (se comprime a WebP) y CV (PDF).
- **Tecnologías**: alta/edición/baja de tecnologías, asignadas a una de
  4 categorías (Backend, Frontend, Bases de datos, Herramientas), con su
  ícono (slug de [simpleicons.org](https://simpleicons.org)) y orden.
- **Proyectos**: alta/edición/baja. Título, descripción, tecnologías (tags),
  links de GitHub/demo, estado (`En producción` / `En desarrollo` /
  `Archivado`), destacado, imagen (comprimida a WebP <100KB al subir).
- **Experiencia**: timeline de trabajos/freelance — puesto, empresa, fechas
  (con "actualidad" si no hay fecha de fin), descripción, tecnologías.
- **Estudios y Certificados**: timeline con tipo (estudio/certificado),
  institución, fecha y archivo adjunto (PDF) clickeable.
- **Hobbies**: tarjetas de emoji + etiqueta.
- **Mensajes de contacto**: bandeja de los mensajes recibidos desde el
  formulario público, marcar como leído/no leído, eliminar.

Todo esto sin tocar código ni redeployar: los cambios se ven reflejados en el
sitio público en el siguiente refresh, porque ambos leen de la misma base.

## Qué ve un visitante (sitio público, sin login)

Sidebar fija con avatar, cargo, tagline, redes, botón de descarga de CV y
navegación con scroll-spy (resalta la sección visible) + scroll suave.
Ocho secciones: Hero, Sobre mí (con datos rápidos), Tecnologías (agrupadas),
Proyectos (tarjetas con estado/tags/links), Experiencia y Estudios (timeline),
Hobbies, y Contacto (formulario que inserta directo en `contact_messages` vía
Supabase, sin backend intermedio). Animaciones: fade-in al hacer scroll
(`IntersectionObserver`), hover sutil, sin efectos exagerados. Responsive:
sidebar colapsa a menú hamburguesa por debajo de 1024px.

## Keep-alive de Supabase (free tier)

Supabase pausa los proyectos free tras 7 días sin actividad. Un workflow de
GitHub Actions (`.github/workflows/keep-alive.yml`) hace un `select` liviano
contra `profile` cada 3 días, usando `SUPABASE_URL` y `SUPABASE_ANON_KEY` como
secrets del repositorio (Settings → Secrets and variables → Actions). También
se puede disparar a mano desde la pestaña Actions (`workflow_dispatch`).

## Puesta en marcha

```bash
npm install
npm start   # http://localhost:4200
```

Las credenciales de Supabase (URL + publishable/anon key) están en
`src/environments/environment.ts` — son públicas por diseño (protegidas por
RLS), no requieren `.env`.

### Crear el usuario admin (una sola vez)

No hay pantalla de registro a propósito — el panel es de un solo usuario.
Crear la cuenta desde el Dashboard de Supabase del proyecto
(`portfolio-luciano-bordon`): **Authentication → Users → Add user**, con el
email y contraseña que vas a usar para entrar a `/admin/login`.

## Estado del desarrollo

- [x] Schema de base de datos + RLS + buckets de Storage
- [x] Sitio público: 8 secciones consumiendo datos reales de Supabase
- [x] Panel admin: login, dashboard, CRUD completo de las 6 entidades de contenido + bandeja de mensajes
- [x] Compresión de imágenes a WebP <100KB en el navegador antes de subir
- [x] Workflow de keep-alive de Supabase
- [x] Cargar contenido real (hoy la base solo tiene el seed de hobbies) desde `/admin`

