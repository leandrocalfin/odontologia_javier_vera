-- ================================================================
-- Consultorio Odontológico Javier Vera — Esquema + políticas (hardened)
-- Correr UNA VEZ en el SQL Editor de Supabase como OWNER (postgres).
--
-- Antes de darle acceso al Panel de administración:
--   a) Authentication → Settings → desactivar "Allow new users to sign up".
--   b) Authentication → Users → Add user (mail del dueño).
--   c) Copiar el UUID de ese usuario y correr (una sola vez):
--        insert into public.admins (user_id) values ('<uuid-del-usuario>');
--      (el dueño es el único admin: el public.admins no tiene políticas
--       para clientes; solo el owner vía SQL o el service-role pueden
--       modificarlo.)
-- ================================================================

-- Nota: el script es idempotente (usa create * if not exists + on conflict).

-- ================================================================
-- 0) ADMINS: whitelist explícita de usuarios editores
-- ================================================================
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- Permitir a cada usuario leer solo su propio registro (si existe).
-- Sin esta policy el endpoint público de login no puede consultarla desde el cliente.
-- Permite a cada usuario leer solo su propia fila (si existe).
-- El grant es necesario: sin él Postgres bloquea la lectura antes de RLS.
grant select on public.admins to authenticated;
drop policy if exists "admin_read_own" on public.admins;
create policy "admin_read_own" on public.admins
  for select to authenticated using (auth.uid() = user_id);

-- Sin otras policies de cliente.

-- Sin policies de cliente: solo el owner (SQL Editor) o la service-role key
-- (service_role) pueden administrar la lista de admins.
alter table public.admins enable row level security;
-- Sin policies → los clientes (anon / authenticated) no pueden leerla
-- ni escribirla por la API.

-- Función SECURITY DEFINER: permite verificar membership sin exponer la tabla.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ================================================================
-- 1) AUDIT LOG + trigger function
-- ================================================================
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  action text not null,
  row_id text,
  actor uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

-- Solo el owner / service-role puede revisarla; los clientes no tienen acceso.
alter table public.audit_log enable row level security;
revoke all on public.audit_log from anon, authenticated;

create or replace function public.log_audit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  actor uuid;
  rid text;
begin
  actor := auth.uid();
  rid := case tg_op
    when 'DELETE' then (to_jsonb(OLD) ->> 'id')
    else (to_jsonb(NEW) ->> 'id')
  end;

  insert into public.audit_log (table_name, action, row_id, actor, old_data, new_data)
  values (
    tg_table_name,
    tg_op,
    rid,
    actor,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(OLD) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(NEW) else null end
  );

  return coalesce(NEW, OLD);
end;
$$;

-- ================================================================
-- 2) touch_updated_at(): el cliente no puede mentir sobre el tiempo
-- ================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ================================================================
-- 3) TABLAS
-- ================================================================
create table if not exists public.site_hero (
  id smallint primary key default 1 check (id = 1),
  image_url text not null
    check (image_url ~ '^(/[^/]|https://)' and char_length(image_url) <= 500),
  titulo text not null
    check (char_length(titulo) between 1 and 100),
  subtitulo text not null
    check (char_length(subtitulo) between 1 and 150),
  descripcion text not null
    check (char_length(descripcion) between 1 and 500),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_nosotros (
  id smallint primary key default 1 check (id = 1),
  descripcion text not null
    check (char_length(descripcion) between 1 and 5000),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_galeria (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in ('foto', 'video')),
  src text not null
    check (src ~ '^(/[^/]|https://)' and char_length(src) <= 500),
  alt text not null
    check (char_length(alt) between 1 and 255),
  orden int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_especialistas (
  id bigint generated always as identity primary key,
  nombre text not null
    check (char_length(nombre) between 2 and 100),
  matricula text not null
    check (char_length(matricula) between 1 and 40),
  foto_url text
    check (foto_url is null or (foto_url ~ '^(/[^/]|https://)' and char_length(foto_url) <= 500)),
  orden int not null default 0,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_tratamientos (
  id bigint generated always as identity primary key,
  nombre text not null
    check (char_length(nombre) between 2 and 120),
  descripcion text not null
    check (char_length(descripcion) between 10 and 500),
  imagen_url text
    check (imagen_url is null or (imagen_url ~ '^(/[^/]|https://)' and char_length(imagen_url) <= 500)),
  alt text not null
    check (char_length(alt) between 1 and 255),
  orden int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_preguntas (
  id bigint generated always as identity primary key,
  pregunta text not null
    check (char_length(pregunta) between 5 and 255),
  respuesta text not null
    check (char_length(respuesta) between 10 and 1000),
  orden int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_contacto (
  id smallint primary key default 1 check (id = 1),
  direccion text not null
    check (char_length(direccion) between 5 and 255),
  mapa_url text
    check (mapa_url is null or mapa_url ~ '^https://www\.google\.com/maps'),
  horario text not null
    check (char_length(horario) between 5 and 100),
  telefono_turnos text not null
    check (telefono_turnos ~ '^[0-9][0-9+\-\s]{5,23}$'),
  telefono_urgencias text not null
    check (telefono_urgencias ~ '^[0-9][0-9+\-\s]{5,23}$'),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  instagram text
    check (instagram is null or instagram ~ '^https://(www\.)?instagram\.com/'),
  facebook text
    check (facebook is null or facebook ~ '^https://(www\.)?facebook\.com/'),
  whatsapp text
    check (whatsapp is null or whatsapp ~ '^[0-9]{8,15}$'),
  updated_at timestamptz not null default now()
);

-- ================================================================
-- 4) RLS: lectura pública anónima, escritura solo admins
-- ================================================================
alter table public.site_hero enable row level security;
alter table public.site_nosotros enable row level security;
alter table public.site_galeria enable row level security;
alter table public.site_especialistas enable row level security;
alter table public.site_tratamientos enable row level security;
alter table public.site_preguntas enable row level security;
alter table public.site_contacto enable row level security;

-- Lecturas: todos (sitio público)
create policy "anon_read_hero" on public.site_hero for select to anon, authenticated using (true);
create policy "anon_read_nosotros" on public.site_nosotros for select to anon, authenticated using (true);
create policy "anon_read_galeria" on public.site_galeria for select to anon, authenticated using (true);
create policy "anon_read_especialistas" on public.site_especialistas for select to anon, authenticated using (true);
create policy "anon_read_tratamientos" on public.site_tratamientos for select to anon, authenticated using (true);
create policy "anon_read_preguntas" on public.site_preguntas for select to anon, authenticated using (true);
create policy "anon_read_contacto" on public.site_contacto for select to anon, authenticated using (true);

-- Escrituras: solo admins (verificados por whitelist), una policy por operación
create policy "admin_insert_hero" on public.site_hero for insert to authenticated with check ((select public.is_admin()));
create policy "admin_update_hero" on public.site_hero for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
-- Sin DELETE: site_hero / site_nosotros / site_contacto son singletons, no se pueden borrar.

create policy "admin_insert_nosotros" on public.site_nosotros for insert to authenticated with check ((select public.is_admin()));
create policy "admin_update_nosotros" on public.site_nosotros for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin_insert_galeria" on public.site_galeria for insert to authenticated with check ((select public.is_admin()));
create policy "admin_update_galeria" on public.site_galeria for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin_delete_galeria" on public.site_galeria for delete to authenticated using ((select public.is_admin()));

create policy "admin_insert_especialistas" on public.site_especialistas for insert to authenticated with check ((select public.is_admin()));
create policy "admin_update_especialistas" on public.site_especialistas for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin_delete_especialistas" on public.site_especialistas for delete to authenticated using ((select public.is_admin()));

create policy "admin_insert_tratamientos" on public.site_tratamientos for insert to authenticated with check ((select public.is_admin()));
create policy "admin_update_tratamientos" on public.site_tratamientos for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin_delete_tratamientos" on public.site_tratamientos for delete to authenticated using ((select public.is_admin()));

create policy "admin_insert_preguntas" on public.site_preguntas for insert to authenticated with check ((select public.is_admin()));
create policy "admin_update_preguntas" on public.site_preguntas for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin_delete_preguntas" on public.site_preguntas for delete to authenticated using ((select public.is_admin()));

create policy "admin_insert_contacto" on public.site_contacto for insert to authenticated with check ((select public.is_admin()));
create policy "admin_update_contacto" on public.site_contacto for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ================================================================
-- 5) Triggers: updated_at automático + auditoría
-- ================================================================
create trigger trg_touch_site_hero before update on public.site_hero for each row execute function public.touch_updated_at();
create trigger trg_touch_site_nosotros before update on public.site_nosotros for each row execute function public.touch_updated_at();
create trigger trg_touch_site_galeria before update on public.site_galeria for each row execute function public.touch_updated_at();
create trigger trg_touch_site_especialistas before update on public.site_especialistas for each row execute function public.touch_updated_at();
create trigger trg_touch_site_tratamientos before update on public.site_tratamientos for each row execute function public.touch_updated_at();
create trigger trg_touch_site_preguntas before update on public.site_preguntas for each row execute function public.touch_updated_at();
create trigger trg_touch_site_contacto before update on public.site_contacto for each row execute function public.touch_updated_at();

create trigger trg_audit_site_hero after insert or update or delete on public.site_hero for each row execute function public.log_audit();
create trigger trg_audit_site_nosotros after insert or update or delete on public.site_nosotros for each row execute function public.log_audit();
create trigger trg_audit_site_galeria after insert or update or delete on public.site_galeria for each row execute function public.log_audit();
create trigger trg_audit_site_especialistas after insert or update or delete on public.site_especialistas for each row execute function public.log_audit();
create trigger trg_audit_site_tratamientos after insert or update or delete on public.site_tratamientos for each row execute function public.log_audit();
create trigger trg_audit_site_preguntas after insert or update or delete on public.site_preguntas for each row execute function public.log_audit();
create trigger trg_audit_site_contacto after insert or update or delete on public.site_contacto for each row execute function public.log_audit();

-- ================================================================
-- 6) Grants explícitos (defensa en profundidad además de RLS):
--    lectura pública limitada a las 7 tablas site_*; los clientes nunca
--    reciben permisos directos sobre admins ni audit_log.
-- ================================================================
revoke all on
  public.site_hero, public.site_nosotros, public.site_galeria,
  public.site_especialistas, public.site_tratamientos,
  public.site_preguntas, public.site_contacto
from anon, authenticated;

revoke all on public.admins from anon, authenticated;
revoke all on public.audit_log from anon, authenticated;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.touch_updated_at() from public, anon;
revoke all on function public.log_audit() from public, anon;

grant usage on schema public to anon, authenticated;
grant select on
  public.site_hero,
  public.site_nosotros,
  public.site_galeria,
  public.site_especialistas,
  public.site_tratamientos,
  public.site_preguntas,
  public.site_contacto
  to anon, authenticated;

grant insert, update, delete on
  public.site_hero,
  public.site_nosotros,
  public.site_galeria,
  public.site_especialistas,
  public.site_tratamientos,
  public.site_preguntas,
  public.site_contacto
  to authenticated;

-- ================================================================
-- 7) Storage: bucket site-images (público de lectura, escritura solo
--    admins) con 5 MB de límite por archivo y sin SVG.
-- ================================================================
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

-- Videos livianos contenidos por el sitio: tope 5 MB (el panel también
-- rechaza MP4 >5 MB e imágenes >4 MB; este tope es la última barrera).
update storage.buckets
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4'
  ]
where id = 'site-images';

-- Lectura pública dentro del bucket (el sitio sirve las imágenes sin auth).
create policy "public_read_site_images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'site-images');

-- Escritura: solo admins autenticados; reemplazo por operación.
create policy "admin_write_site_images"
  on storage.objects for all to authenticated
  using (bucket_id = 'site-images' and (select public.is_admin()))
  with check (bucket_id = 'site-images' and (select public.is_admin()));

-- ================================================================
-- 7) SEED: contenido actual del sitio
-- ================================================================
insert into public.site_hero (id, image_url, titulo, subtitulo, descripcion) values
  (1,
   '/img-portada.png',
   'Centro Odontológico',
   'Tu sonrisa, nuestra prioridad',
   'Cuidamos tu salud bucal con un equipo profesional, tecnología de última generación y un trato cercano. Reservá tu turno y empezá a sonreír con confianza.')
on conflict (id) do nothing;

insert into public.site_nosotros (id, descripcion) values
  (1,
   'Consultorio Odontológico Javier Vera nació con una idea simple: brindar atención odontológica de primera a toda la familia, sin vueltas y sin misterios. Desde el primer día apostamos a la prevención, la tecnología diagnóstica y un trato humano, de igual a igual.

Hoy somos un equipo integral en Río Gallegos que resuelve desde una limpieza de rutina hasta cirugías e implantes complejos, siempre con presupuestos claros, información transparente y un seguimiento cercano de cada paciente.

Creemos que la calidad de atención se construye en equipo. Por eso, Javier Vera impulsa la capacitación continua de cada integrante, compartiendo conocimientos y estableciendo criterios de trabajo comunes para que todos los profesionales sigan una misma línea de atención. De esta manera, buscamos ofrecer una experiencia consistente, segura y de calidad, sin importar quién esté acompañándote durante tu tratamiento.

Porque cuidar tu salud bucal es mucho más que resolver un problema: es acompañarte en cada etapa de tu bienestar.')
on conflict (id) do nothing;

insert into public.site_galeria (tipo, src, alt, orden) values
  ('foto',  '/Consultorio.png',                 'Consultorio odontológico',                 1),
  ('foto',  '/sala-espera.png',                 'Sala de espera con plantas',               2),
  ('video', '/1.mp4',                           'Video del consultorio',                    3),
  ('foto',  '/clinica-dental.png',              'Clínica dental moderna y luminosa',        4),
  ('foto',  '/instalaciones.png',               'Instalaciones del consultorio',            5)
on conflict do nothing;

insert into public.site_especialistas (nombre, matricula, foto_url, orden) values
  ('Javier Vera',    'MP 0', '/Javier_Vera.jpg',    1),
  ('Lucas Zunino',   'MP 0', '/Lucas_Zunino.jpg',   2),
  ('Gianna Moscardi','MP 0', '/Gianna_Moscardi.jpg',3)
on conflict do nothing;

insert into public.site_tratamientos (nombre, descripcion, imagen_url, alt, orden) values
  ('Ortodoncia con Brackets',
   'Dientes alineados para una sonrisa perfecta, con la técnica que mejor se adapta a vos.',
   '/ortodoncia.jpg',
   'Paciente con brackets durante su tratamiento de ortodoncia',
   1),
  ('Implantes Dentales',
   'Recuperá la confianza al sonreír con implantes de alta precisión.',
   '/implantes.jpg',
   'Procedimiento implantológico con instrumentos de precisión',
   2),
  ('Alineadores Invisibles',
   'Alineá tu sonrisa de forma práctica y discreta, sin que nadie lo note.',
   '/alineadores.jpg',
   'Sonrisa evaluada con espejo dental para alineadores invisibles',
   3),
  ('Rehabilitación Oral Integral',
   'Recuperación de la función, estética y salud bucal mediante tratamientos personalizados.',
   '/rehabilitacion.jpg',
   'Rehabilitación oral integral: recuperación de función y estética de la sonrisa',
   4),
  ('Carillas Dentales',
   'Una sonrisa impecable al instante con carillas hechas a tu medida.',
   '/carillas.jpg',
   'Paciente admirando su nueva sonrisa con carillas frente al espejo',
   5),
  ('Tratamiento de Conducto',
   'Endodoncia moderna: rescatamos tu diente sin dolor y con la mejor tecnología.',
   '/tratamientoConducto.jpg',
   'Instrumentación y tratamiento endodóntico en el sillón',
   6),
  ('Prótesis Dentales',
   'Restituí la funcionalidad y la estética con prótesis a tu medida.',
   '/protesisDentales.jpg',
   'Familias sonrientes con prótesis y salud dental recuperada',
   7),
  ('Blanqueamientos Dentales',
   'Dientes hasta 8 tonos más blancos con técnicas seguras e inmediatas.',
   '/blaqueamiento.jpg',
   'Pulido y blanqueamiento dental con micromotor',
   8),
  ('Periodoncia',
   'Cuidá tus encías y prevení la pérdida dental con terapia periodontal.',
   '/periodoncia.jpg',
   'Limpieza profesional de encías y remoción de sarro',
   9)
on conflict do nothing;

insert into public.site_preguntas (pregunta, respuesta, orden) values
  ('¿Cómo puedo pedir un turno?',
   'Podés escribirnos por WhatsApp o llamarnos al 2966-449813. Te confirmamos el día y horario según la disponibilidad del consultorio.',
   1),
  ('¿Atienden urgencias?',
   'Sí. Para urgencias odontológicas escribinos al 2966-234055, disponible las 24 hs, y te indicamos cómo proceder lo antes posible.',
   2),
  ('¿Qué obras sociales o prepagas aceptan?',
   'Trabajamos con las principales obras sociales y prepagas (Swiss Medical, OSDE, SanCor Salud, Galeno, Medifé y muchas más). Encontrá la lista completa en la sección Coberturas Médicas de la home. Consultanos por tu plan al momento de pedir el turno para confirmar la cobertura.',
   3),
  ('¿Dónde está el consultorio y en qué horario atienden?',
   'Estamos en Emilia Rodiño de Clark 795, Río Gallegos, Santa Cruz. Atendemos de lunes a sábados de 08:00 a 20:00 hs.',
   4),
  ('¿Atienden niños?',
   'Sí. Contamos con odontopediatría para acompañar a los más chicos con un trato cercano y adaptado a su edad.',
   5),
  ('¿Qué tratamientos realizan?',
   'Realizamos ortodoncia, implantes, alineadores invisibles, carillas, endodoncia, prótesis, blanqueamiento, periodoncia y rehabilitación oral integral, entre otros.',
   6),
  ('¿Cómo es la primera consulta?',
   'Evaluamos tu salud bucal, charlamos sobre tus objetivos y te damos un presupuesto claro y transparente antes de comenzar cualquier tratamiento.',
   7)
on conflict do nothing;

insert into public.site_contacto (id, direccion, mapa_url, horario, telefono_turnos, telefono_urgencias,
                                  instagram, facebook, whatsapp) values
  (1,
   'Emilia Rodiño de Clark 795, Río Gallegos, Santa Cruz 9400',
   'https://www.google.com/maps?q=Emilia%20Rodi%C3%B1o%20de%20Clark%20795%2C%20R%C3%ADo%20Gallegos%2C%20Santa%20Cruz&output=embed',
   'Lunes a sábados de 08:00 a 20:00 hs',
   '2966-449813',
   '2966-234055',
   'https://www.instagram.com/odontologojaviervera',
   'https://www.facebook.com/profile.php?id=61552208272134',
   '5492966449813')
on conflict (id) do nothing;

-- ================================================================
-- 8) NOTAS IMPORTANTES
-- ================================================================
-- a) "MP 0" son matrículas simuladas: reemplazalas por las reales antes
--    de entrega/producción.
-- b) Deshabilitar el signup público de Auth antes de habilitar el panel
--    (Authentication → Providers → Email → Disable signups).
-- c) Agregar el primer admin ejecutando:
--      insert into public.admins (user_id) values ('<uuid-de-auth.users>');
--    (sin este paso nadie puede escribir en el sitio desde el panel).
-- d) El bucket site-images admite 5 MB por archivo (imágenes ≤4 MB, videos
--    ≤5 MB — ver sección de Server Actions del panel). El panel rechaza
--    tamaños mayores antes de llegar al bucket.
-- e) La tabla public.audit_log registra to_jsonb(OLD/NEW) por operación;
--    solo el service-role / el dashboard pueden leerla; los clientes no.
-- f) Activá backups/PITR en el plan de Supabase (producción).
