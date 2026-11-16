# Consultorio Odontológico Javier Vera

Sitio institucional + panel de administración del consultorio odontológico.
Sitio público con contenido administrable (portada, nosotros, galería, equipo,
tratamientos, preguntas frecuentes, datos de contacto).

---

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19
- **Tailwind CSS v4**
- **Supabase** (Postgres + Auth + Storage) como backend y CMS
- **ISR** en el sitio público + `updateTag("site")` en los guardados del panel

Sin dependencias de IA ni servicios pagos externos obligatorios.

---

## Requisitos

- Node.js 20.9+
- Cuenta en Supabase (gratis)
- (Opcional) Cuenta de Cloudflare para Turnstile (anti-bot del login)

---

## Instalación local

```bash
npm install
cp .env.example .env.local   # completar valores
npm run dev                    # http://localhost:3000
```

Variables de entorno: ver `.env.example`. Solo las dos de Supabase son
obligatorias. El sitio público y el panel funcionan sin más nada.

---

## Puesta en producción (resumen)

1. Crear proyecto en https://supabase.com (Free alcanza).
2. **SQL Editor** → pegar y ejecutar `supabase/schema.sql` completo.
   - Crea tablas, RLS, políticas, bucket `site-images` y el seed de contenido.
3. **Storage** se configura solo (el script crea el bucket).
4. **Authentication → Settings** → **desactivar "Allow new users to sign up"**
   (recomendado: solo el dueño se registra).
5. **Crear el primer admin**: registrar usuario (Authentication → Users → Add user),
   tomar de ahí el `id` (uuid) y ejecutar:
   ```sql
   insert into public.admins (user_id) values ('<uuid-del-usuario>');
   ```
6. **Variables de entorno en el hosting** (Vercel, Netlify, VPS...):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (dominio público; para robots.txt y sitemap.xml)
   - (Opcional) `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`
7. **Build y arranque**:
   ```bash
   npm install
   npm run build
   npm run start   # o plataforma equivalente
   ```
8. Entrar a `https://tudominio/admin` con las credenciales creadas en el paso 5.
9. Dominio + HTTPS (estándar en Vercel/Netlify). HSTS y CSP ya vienen activos.

### Verificación después del deploy

- [ ] Home carga con contenido (hero, tratamientos, equipo, etc.)
- [ ] `/admin` redirige a `/admin/login` sin sesión
- [ ] Login funciona con el usuario admin
- [ ] Guardar un cambio en el panel se ve en la home
- [ ] `robots.txt` y `sitemap.xml` responden (si no aparece `/admin`)

---

## Panel de administración

Acceder en `https://tudominio/admin`. Solo usuarios registrados como admins
en Supabase (`public.admins`). Sin sesión, el proxy redirige a `/admin/login`.

Secciones:

- **Inicio** — imagen, título, subtítulo y texto de la portada
- **Nosotros** — texto de "Quiénes somos" + galería (máx. 7 fotos y 2 videos)
- **Equipo** — profesionales (nombre, matrícula, foto; se pueden ocultar y reordenar)
- **Tratamientos** — tarjetas de servicios (imagen + nombre + descripción)
- **Preguntas** — preguntas frecuentes
- **Datos y redes** — dirección, horario, teléfonos, email, Instagram/Facebook

Los cambios hechos desde el panel se ven al instante en la web.

---

## Mantenimiento y copias de seguridad

### Backup de base de datos (contenido editado)

```bash
pg_dump "postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres" \
  --schema=public --format=custom > backup-$(date +%F).dump
# Restaurar: pg_restore -d "postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres" backup-fecha.dump
```

### Backup de archivos (imágenes subidas por el panel)

Descarga desde el Dashboard (Storage → site-images → Download all) o con la CLI:

```bash
npx supabase@latest storage cp -r site-images ./backup-storage/
```

### Backup automático (sugerido)

- **Semanal**: `pg_dump` + descarga del bucket a una carpeta fechada
- **Supabase**: revisar retención de backups según el plan (PITR en Pro)

### Restaurar en un proyecto Supabase nuevo

1. Crear proyecto Supabase nuevo
2. Ejecutar `supabase/schema.sql` en SQL Editor
3. Restaurar backup con `pg_restore` (o cargar dump SQL como lo hiciste la primera vez)
4. Recrear el bucket `site-images` con el mismo contenido
5. Crear el usuario admin nuevamente en Authentication
6. Actualizar las variables de entorno en el hosting con las nuevas claves

---

## Entrega a un comprador / cliente

Transferir una web es más que dar las claves:

1. **Dominio** — transferir registrar o cambiar nameservers
2. **Hosting** — transferir la cuenta de Vercel/Netlify (o el VPS)
3. **Supabase** — transferir el proyecto a la organización del comprador
   (Dashboard → Project Settings → General → Transfer project)
4. **Claves** — el comprador recibe todas las claves nuevas que genere
5. **Documentación** — este README + `supabase/schema.sql` como referencia
6. **Credenciales del panel** — el dueño conserva o rota las de `public.admins`

### Para el cliente final

- La web funciona sin que el cliente sepa nada de esto
- El cliente ve: su web + el panel para editarla
- Cualquier cambio no soportado desde el panel, podés hacerlo con un poco de ayuda técnica
- **Nada es obligatorio técnico**: el cliente no necesita saber que existe Next.js, Supabase, ni nada más

---

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.js              # Root layout (Geist/Poppins/Inter)
│   ├── robots.js              # robots.txt
│   ├── sitemap.js             # sitemap.xml
│   ├── (site)/               # Grupo de rutas públicas
│   │   ├── layout.js         # TopBar + NavBar + Footer + WhatsApp flotante
│   │   ├── page.js           # Home
│   │   ├── aviso-legal/      # Páginas legales
│   │   ├── politica-de-privacidad/
│   │   ├── politica-de-cookies/
│   │   └── admin/            # Panel (ver abajo)
│   │       ├── page.js        # /admin (requiere sesión + admin)
│   │       ├── actions.js     # Server Actions (escrituras validadas)
│   │       ├── panel.jsx      # Tabs del panel
│   │       ├── login/         # FormularioLogin.jsx + page.js
│   │       └── *-admin.jsx    # Inicio, Nosotros, Equipo, Tratamientos, Preguntas, Datos
│   └── ...
├── components/                # NavBar, TopBar, Footer, GaleriaNosotros, ...
├── lib/
│   ├── supabase.js           # Cliente público cookieless (para ISR)
│   ├── supabaseServer.js     # Cliente SSR con cookies (para admin)
│   ├── supabaseBrowser.js    # Cliente browser (detección de sesión en NavBar)
│   ├── supabasePublic.js     # Cliente para ISR (unstable_cache)
│   ├── contenido.js          # ISR + getContenido() + DEFAULT_CONTENT
│   └── ...
├── supabase/
│   └── schema.sql            # Schema completo + seed + policies + bucket
├── public/                    # Assets estáticos servidos en /
└── .env.example               # Plantilla de variables de entorno
```

---

## Notas técnicas relevantes

- **ISR**: la home revalida como mucho una vez al día; el panel invalida al guardar.
- **Auth**: `@supabase/ssr` + `is_admin()` (Postgres SECURITY DEFINER) como puerta.
- **Panel**: noindex, no es página pública. Requiere sesión + estar en `public.admins`.
- **RLS** en todas las tablas: lectura pública, escritura solo admins.
- **Storage**: bucket `site-images` público de solo lectura; escritura solo admins.
- **Anti-bot**: Turnstile opcional; si no hay secret en producción, el login se cierra.

---

## Contacto y soporte

Proyecto entregado por Leandro Calfin — www.leandrocalfin.com.ar
