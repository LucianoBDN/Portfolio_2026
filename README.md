# Portfolio - Luciano Bordon (BDN)

Portfolio personal full CMS: sitio público + panel de administración propio,
sin dependencias de un CMS externo. Construido con **Angular 22** (standalone,
zoneless, signals, router) y **Supabase** (Postgres, Auth, Storage). Documentado
acá como una entrada más de la sección "Proyectos" del propio sitio: es la
prueba más directa de las habilidades fullstack que el portfolio busca mostrar.

## Qué resuelve

En vez de hardcodear el contenido (proyectos, tecnologías, experiencia) en el
código y tener que redeployar por cada cambio de texto, todo el contenido vive
en una base de datos y se edita desde un panel `/admin` propio, protegido por
login. El sitio público consume esos datos en tiempo real vía la API pública
de Supabase (PostgREST), con Row Level Security como única barrera de
seguridad - no hay backend intermedio.

## Stack

- **Frontend**: Angular 22, standalone components, `provideZonelessChangeDetection`
  (sin zone.js, reactividad basada en signals), Angular Router (SPA multi-página,
  no scroll-spy de una sola página), Reactive Forms, SCSS.
- **Backend as a Service**: Supabase (Postgres 17, Auth, Storage, RLS).
- **Íconos**: [Phosphor Icons](https://phosphoricons.com) (webfont) para la UI,
  paquete `simple-icons` (npm, tree-shakeable) para logos de marca reales como
  GitHub, y el CDN de [simpleicons.org](https://simpleicons.org) para los
  logos de tecnologías que carga el propio admin.
- **Hosting**: GitHub Pages (estático) + GitHub Actions para el keep-alive de Supabase.

## Identidad visual

- **Logo**: marca "BDN" propia (`public/assets/bdn-*.svg`), con variantes
  clara/oscura para el mark, el lockup completo y el favicon.
- **Tema claro/oscuro**: toggle persistente (`theme.service.ts`), aplicado vía
  `data-theme` en `<html>` y variables CSS en `styles.scss`. Todo el sitio
  (público y admin) reacciona al mismo estado.
- **Color por categoría**: proyectos y tecnologías usan un color derivado del
  nombre de su categoría (`shared/category-color.ts`) para diferenciarlas
  visualmente sin tener que mantenerlas a mano.

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
      profile-store.service.ts  cachea el perfil (lo usan el shell y varias páginas)
      theme.service.ts          tema claro/oscuro persistente
      breadcrumb.service.ts     migas de pan de la página pública actual
    guards/
      admin.guard.ts     protege /admin verificando sesión activa
  layout/
    app-shell/          shell del sitio público: sidebar + topbar + <router-outlet>
  features/
    public/              resumen, proyectos-list, proyecto-detail, experiencia,
                          certificaciones, contacto - cada ruta carga sus
                          propios datos (lazy-loaded)
    admin/                login, shell con nav, dashboard y un
                          formulario/listado CRUD por cada tabla
  shared/
    brand-icon/          ícono de marca (GitHub) como SVG inline vía simple-icons
    category-color.ts    color estable derivado del nombre de una categoría
```

## Rutas

El sitio público es una SPA de verdad (no scroll de una sola página): cada
sección tiene su propia URL, breadcrumb y carga solo los datos que necesita.

| Ruta                  | Página                                              |
| ---------------------- | --------------------------------------------------- |
| `/resumen`              | Hero, sobre mí, áreas de trabajo, proyecto destacado |
| `/proyectos`             | Listado con búsqueda y filtro por categoría          |
| `/proyectos/:slug`       | Detalle de un proyecto (ver más abajo)               |
| `/experiencia`           | Timeline de experiencia laboral/freelance            |
| `/certificaciones`       | Estudios y certificados, con imagen/logo             |
| `/contacto`              | Datos de contacto + formulario                       |
| `/admin` (+ subrutas)    | Panel de administración, protegido por login         |

## Modelo de datos (Supabase Postgres)

| Tabla                    | Uso                                                             |
| ------------------------ | ---------------------------------------------------------------|
| `profile`                | Fila única: textos del Hero, "Sobre mí", datos rápidos, links   |
| `technologies`            | Tecnologías agrupadas por categoría (backend/frontend/db/tools)|
| `projects`                | Proyectos: datos básicos + detalle del trabajo (ver abajo)      |
| `experience`              | Timeline de experiencia laboral/freelance                      |
| `education_certificates`  | Timeline de estudios y certificados (con imagen y archivo)      |
| `hobbies`                 | Tarjetas de hobbies (emoji + etiqueta)                          |
| `contact_messages`        | Mensajes enviados desde el formulario de contacto               |

**`projects` en detalle** - además de título, descripción, imagen, tags,
links, estado, categoría (usada para el color y el filtro) y `slug` (para la
URL), cada proyecto tiene su propio detalle de trabajo, pensado para contar
qué se hizo y no solo qué es:

- `context`, `objective`, `participation` - en qué situación surgió, qué
  buscaba lograr, qué hizo puntualmente.
- `problem`, `process`, `solution` - del problema a la solución.
- `analysis_points`, `detection_points` - listas cortas: qué permite hacer /
  qué resuelve.

Todos estos campos son opcionales: si no se cargan, esa sección simplemente no
se muestra en `/proyectos/:slug`.

**RLS**: lectura pública (`select`) en todas las tablas de contenido para que
el sitio público funcione sin login. Escritura (`insert`/`update`/`delete`)
restringida a usuarios autenticados - como es un portfolio personal, alcanza
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

Así, lo único que llega a Supabase Storage ya es un `.webp` - no se sube el
original pesado para después procesarlo server-side.

**Reemplazo de imágenes/archivos**: cada vez que se sube un nuevo avatar, CV,
imagen de fondo del hero, imagen de proyecto o certificado, el archivo
anterior se borra de Supabase Storage (tanto si se reemplaza y se guarda,
como si se sube una imagen nueva dos veces seguidas sin guardar todavía - la
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
  Filtro por categoría en el listado para no tener que scrollear todo.
- **Proyectos**: alta/edición/baja. Datos básicos (título, slug, categoría,
  descripción, tecnologías, links, estado, destacado, imagen) más el detalle
  del trabajo completo (contexto, objetivo, participación, problema, proceso,
  solución, puntos clave) que alimenta la página de cada proyecto.
- **Experiencia**: timeline de trabajos/freelance - puesto, empresa, fechas
  (con "actualidad" si no hay fecha de fin), descripción, tecnologías.
- **Estudios y Certificados**: timeline con tipo (estudio/certificado),
  institución, fecha, imagen/logo opcional y archivo adjunto (PDF) clickeable.
- **Hobbies**: tarjetas de emoji + etiqueta.
- **Mensajes de contacto**: bandeja de los mensajes recibidos desde el
  formulario público, marcar como leído/no leído, eliminar.
- **Tema claro/oscuro**: el mismo toggle que en el sitio público, disponible
  en el login y en todo el panel.

Todo esto sin tocar código ni redeployar: los cambios se ven reflejados en el
sitio público en el siguiente refresh, porque ambos leen de la misma base.

## Qué ve un visitante (sitio público, sin login)

Sidebar fija con logo, cargo, redes (GitHub/LinkedIn/email), navegación y
botón de descarga de CV, más una topbar con breadcrumb y el toggle de tema.
Seis páginas: Resumen (hero, sobre mí, áreas de trabajo, proyecto destacado y
recientes, hobbies), Proyectos (búsqueda + filtro por categoría), detalle de
cada proyecto (contexto, del problema a la solución, qué permite hacer/
resuelve, proyectos relacionados), Experiencia y Certificaciones (timeline),
y Contacto (formulario que inserta directo en `contact_messages` vía
Supabase, sin backend intermedio). Responsive: sidebar colapsa a menú
hamburguesa por debajo de 1024px.

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
`src/environments/environment.ts` - son públicas por diseño (protegidas por
RLS), no requieren `.env`.

### Crear el usuario admin (una sola vez)

No hay pantalla de registro a propósito - el panel es de un solo usuario.
Crear la cuenta desde el Dashboard de Supabase del proyecto
(`portfolio-luciano-bordon`): **Authentication → Users → Add user**, con el
email y contraseña que vas a usar para entrar a `/admin/login`.

## Estado del desarrollo

- [x] Schema de base de datos + RLS + buckets de Storage
- [x] Sitio público como SPA multi-página (rutas propias por sección, no scroll-spy)
- [x] Detalle de proyecto con contexto/objetivo/participación y "del problema a la solución"
- [x] Panel admin: login, dashboard, CRUD completo de las 6 entidades de contenido + bandeja de mensajes
- [x] Filtro por categoría en el admin de Tecnologías
- [x] Tema claro/oscuro persistente en todo el sitio (público y admin)
- [x] Identidad de marca propia (logo BDN, favicon, ícono de GitHub real vía simple-icons)
- [x] Compresión de imágenes a WebP en el navegador antes de subir
- [x] Workflow de keep-alive de Supabase
- [ ] Terminar de cargar contenido real (proyectos, certificados) desde `/admin`
