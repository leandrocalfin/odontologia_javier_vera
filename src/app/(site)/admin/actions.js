"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { getAdminUser, getSupabaseServer } from "@/lib/supabaseServer";

const limpiar = (v) => String(v ?? "").trim();
const maxLen = (name, value, max) => {
  const v = limpiar(value);
  if (!v) throw new Error(`${name} es requerido`);
  if (v.length > max) throw new Error(`${name}: máximo ${max} caracteres`);
  return v;
};
const opcional = (name, value, max) => {
  const v = limpiar(value);
  if (v && v.length > max) throw new Error(`${name}: máximo ${max} caracteres`);
  return v || null;
};
const urlSegura = (v) => {
  const t = limpiar(v);
  if (!t) return null;
  const valida = /^(\/([^\/]|$)|https:\/\/)/;
  if (!valida.test(t) || t.length > 500) throw new Error("URL inválida o demasiado larga");
  return t;
};

async function requireAdmin() {
  const { sb, user, isAdmin } = await getAdminUser();
  if (!user || !isAdmin) throw new Error("No autorizado");
  return sb;
}

function ok(datos = null) {
  return { ok: true, datos };
}

// Las Server Actions del panel devuelven { ok:false, error } en vez de lanzar:
// en producción Next reemplaza el mensaje de los throw por uno genérico, así
// que las validaciones/avisos llegarían irreconocibles al usuario.
function fallo(error) {
  const mensaje = error instanceof Error ? error.message : String(error ?? "Error inesperado");
  return { ok: false, error: mensaje };
}

// ============ AUTH ============
async function verificarTurnstile(token) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Sin clave: solo en desarrollo se permite el pase directo.
  // En producción se cierra (fail closed).
  if (!secret) return process.env.NODE_ENV !== "production";
  if (typeof token !== "string" || !token) return false;
  const body = new URLSearchParams({ secret, response: token });
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim();
  if (ip) body.set("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    return (await r.json()).success === true;
  } catch {
    return false;
  }
}

export async function loginAction(email, password, turnstileToken) {
  // Validación de tipo y largo en el servidor (nunca confiar en el cliente).
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.length > 254 ||
    password.length < 1 ||
    password.length > 200
  ) {
    return { error: "Credenciales inválidas." };
  }

  if (!(await verificarTurnstile(turnstileToken))) {
    return { error: "No pudimos verificar que sos una persona. Reintentá." };
  }

  const sb = await getSupabaseServer();
  if (!sb) return { error: "Servicio no disponible." };

  const { error } = await sb.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) {
    console.error(`[admin] login falló: ${error.code}`);
    return { error: "Credenciales inválidas." }; // mismo mensaje para cualquier fallo
  }

  // Un usuario válido que NO es admin no debe quedar con sesión abierta.
  const { data: esAdmin } = await sb.rpc("is_admin");
  if (esAdmin !== true) {
    await sb.auth.signOut();
    return { error: "Credenciales inválidas." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const sb = await getSupabaseServer();
  if (sb) await sb.auth.signOut();
  redirect("/admin/login");
}

// ============ HERO ============
export async function subirImagenHero(formData) {
 try {
  const sb = await requireAdmin();
  const file = formData.get("file");
  if (!file || typeof file === "string" || !file.size) {
    throw new Error("Seleccioná una imagen");
  }
  if (file.size > 4_000_000) throw new Error("La imagen pesa más de 4 MB");
  if (!file.type || !TIPOS_FOTO.has(file.type)) {
    throw new Error("Formato no permitido (JPG, PNG o WebP)");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  // Verificación real: los bytes tienen que coincidir con el tipo declarado.
  const detectado = detectarTipoArchivo(bytes);
  if (detectado !== file.type || !TIPOS_FOTO.has(detectado)) {
    throw new Error("El archivo no es una imagen válida");
  }
  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
  const path = `hero/${crypto.randomUUID()}.${ext}`;
  // Guardar referencia a la actual para borrar su archivo al terminar.
  const { data: actual } = await sb.from("site_hero").select("image_url").eq("id", 1).maybeSingle();
  const { error } = await sb.storage.from("site-images").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const url = sb.storage.from("site-images").getPublicUrl(path).data.publicUrl;
  const { error: updError } = await sb.from("site_hero").update({ image_url: url }).eq("id", 1);
  if (updError) {
    await sb.storage.from("site-images").remove([path]);
    throw new Error(updError.message);
  }
  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images/`;
  if (actual?.image_url?.startsWith(prefix)) {
    await sb.storage.from("site-images").remove([actual.image_url.slice(prefix.length)]);
  }
  revalidatePath("/");
  updateTag("site");
  return ok({ url });
 } catch (err) {
  return fallo(err);
 }
}

export async function guardarHero(input) {
 try {
  const sb = await requireAdmin();
  const payload = {
    titulo: maxLen("Título", input.titulo, 100),
    subtitulo: maxLen("Subtítulo", input.subtitulo, 150),
    descripcion: maxLen("Descripción", input.descripcion, 500),
    image_url: urlSegura(input.image_url),
  };
  const { error } = await sb.from("site_hero").update(payload).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  updateTag("site");
  return ok();
 } catch (err) {
  return fallo(err);
 }
}

// ============ NOSOTROS (texto) ============
export async function guardarNosotros(input) {
 try {
  const sb = await requireAdmin();
  const payload = {
    descripcion: maxLen("Descripción", input.descripcion, 5000),
  };
  const { error } = await sb.from("site_nosotros").update(payload).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  updateTag("site");
  return ok();
 } catch (err) {
  return fallo(err);
 }
}

// ============ GALERÍA ============
export async function agregarFotoGaleria(formData) {
 try {
  const sb = await requireAdmin();
  const file = formData.get("file");
  if (!file || typeof file === "string" || !file.size) {
    throw new Error("Seleccioná un archivo");
  }
  if (file.size > 4_000_000 && file.type !== "video/mp4") throw new Error("La imagen pesa más de 4 MB");
  // Lista cerrada de tipos permitidos (el tipo lo declara el cliente; no confíes en él)
  const TIPOS_GALERIA = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "video/mp4": "mp4" };
  const ext = TIPOS_GALERIA[file.type];
  if (!ext) throw new Error("Formato no permitido (JPG, PNG, WebP o MP4)");
  const esVideo = file.type === "video/mp4";
  if (esVideo && file.size > 5_000_000) throw new Error("El video pesa más de 5 MB");
  const tipo = esVideo ? "video" : "foto";
  // Tope de la galería: máximo 2 videos y 7 fotos.
  const { count } = await sb
    .from("site_galeria")
    .select("id", { count: "exact", head: true })
    .eq("tipo", tipo);
  const tope = esVideo ? 2 : 7;
  if ((count ?? 0) >= tope) {
    throw new Error(esVideo ? "Máximo 2 videos en la galería" : "Máximo 7 fotos en la galería");
  }
  const path = `galeria/${crypto.randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const detectado = detectarTipoArchivo(bytes);
  if (detectado !== file.type) {
    throw new Error(esVideo ? "El video no es un MP4 válido" : "La imagen no es válida");
  }
  const { error: subError } = await sb.storage
    .from("site-images")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (subError) throw new Error(subError.message);
  const url = sb.storage.from("site-images").getPublicUrl(path).data.publicUrl;
  const { data: maxRow } = await sb
    .from("site_galeria")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await sb.from("site_galeria").insert({
    tipo,
    src: url,
    alt: limpiar(file.name.replace(/\.[a-z0-9]+$/i, "")) || (tipo === "video" ? "Video del consultorio" : "Foto del consultorio"),
    orden: (maxRow?.orden ?? 0) + 1,
  });
  if (error) {
    await sb.storage.from("site-images").remove([path]);
    throw new Error(error.message);
  }
  revalidatePath("/");
  updateTag("site");
  return ok({ url });
 } catch (err) {
  return fallo(err);
 }
}

export async function eliminarGaleria(id) {
 try {
  const sb = await requireAdmin();
  const { data, error } = await sb
    .from("site_galeria")
    .select("tipo,src")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Item inexistente");
  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images/`;
  if (data.src.startsWith(prefix)) {
    const path = data.src.slice(prefix.length);
    await sb.storage.from("site-images").remove([path]);
  }
  const { error: delError } = await sb.from("site_galeria").delete().eq("id", id);
  if (delError) throw new Error(delError.message);
  revalidatePath("/");
  updateTag("site");
  return ok();
 } catch (err) {
  return fallo(err);
 }
}

export async function reordenarGaleria(id, direccion) {
 try {
  const sb = await requireAdmin();
  const { data: items, error } = await sb
    .from("site_galeria")
    .select("id,orden")
    .order("orden", { ascending: true });
  if (error) throw new Error(error.message);
  const idx = (items ?? []).findIndex((i) => i.id === id);
  if (idx === -1) throw new Error("Item inexistente");
  const destino = direccion === "up" ? idx - 1 : idx + 1;
  if (destino < 0 || destino >= items.length) return ok();
  const a = items[idx];
  const b = items[destino];
  const ordenA = b.orden;
  const ordenB = a.orden;
  const { error: e1 } = await sb.from("site_galeria").update({ orden: ordenA }).eq("id", a.id);
  if (e1) throw new Error(e1.message);
  const { error: e2 } = await sb.from("site_galeria").update({ orden: ordenB }).eq("id", b.id);
  if (e2) throw new Error(e2.message);
  revalidatePath("/");
  updateTag("site");
  return ok();
 } catch (err) {
  return fallo(err);
 }
}

// ============ ESPECIALISTAS (equipo) ============
async function proximoOrden(sb, tabla) {
  const { data } = await sb.from(tabla).select("orden").order("orden", { ascending: false }).limit(1).maybeSingle();
  return (data?.orden ?? 0) + 1;
}

const TIPOS_FOTO = new Set(["image/jpeg", "image/png", "image/webp"]);
const TIPOS_IMAGENES = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4"]);

// Firma binaria (file.type lo declara el cliente; no se confía en él).
// Devuelve el MIME real según los primeros bytes, o null.
function detectarTipoArchivo(bytes) {
  if (!bytes || bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return "image/webp";
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return "video/mp4";
  return null;
}

export async function guardarEspecialista(formData) {
 try {
  const sb = await requireAdmin();
  const id = Number(formData.get("id")) || null;
  const nombre = maxLen("Nombre", formData.get("nombre"), 100);
  const matricula = maxLen("Matrícula", formData.get("matricula"), 40);
  const orden = Number(formData.get("orden")) > 0 ? Number(formData.get("orden")) : undefined;

  const fotoFile = formData.get("foto");
  const foto =
    fotoFile && typeof fotoFile === "object" && "size" in fotoFile
      ? fotoFile
      : null;
  if (foto && foto.size > 4_000_000) {
    throw new Error("La imagen pesa más de 4 MB");
  }
  if (foto && (!foto.type || !TIPOS_FOTO.has(foto.type))) {
    throw new Error("Formato no permitido (JPG, PNG o WebP)");
  }

  // Política: solo cambia foto si se subió una nueva
  let foto_url;
  let pathNuevo = null;
  if (foto && foto.size > 0) {
    const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[foto.type];
    if (!ext) throw new Error("Formato no permitido (JPG, PNG o WebP)");
    const path = `especialistas/${crypto.randomUUID()}.${ext}`;
    const bytes = Buffer.from(await foto.arrayBuffer());
    const detectado = detectarTipoArchivo(bytes);
    if (detectado !== foto.type) throw new Error("El archivo no es una imagen válida");
    const { error: subError } = await sb.storage
      .from("site-images")
      .upload(path, bytes, { contentType: foto.type, upsert: false });
    if (subError) throw new Error(subError.message);
    pathNuevo = path;
    foto_url = sb.storage.from("site-images").getPublicUrl(path).data.publicUrl;
  }

  // Si es edición y se subió foto nueva, guardar la referencia de la actual
  // para borrar su archivo del bucket al confirmar el guardado.
  let fotoAnterior = null;
  if (id && foto_url) {
    const { data: original } = await sb
      .from("site_especialistas")
      .select("foto_url")
      .eq("id", id)
      .maybeSingle();
    fotoAnterior = original?.foto_url ?? null;
  }

  if (id) {
    const payload = { nombre, matricula };
    if (orden) payload.orden = orden;
    if (foto_url) payload.foto_url = foto_url;
    const { error } = await sb
      .from("site_especialistas")
      .update(payload)
      .eq("id", id);
    if (error) {
      if (pathNuevo) await sb.storage.from("site-images").remove([pathNuevo]);
      throw new Error(error.message);
    }
  } else {
    const { error } = await sb.from("site_especialistas").insert({
      nombre,
      matricula,
      ...(foto_url ? { foto_url } : {}),
      orden: orden ?? (await proximoOrden(sb, "site_especialistas")),
    });
    if (error) {
      if (pathNuevo) await sb.storage.from("site-images").remove([pathNuevo]);
      throw new Error(error.message);
    }
  }

  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images/`;
  if (fotoAnterior && fotoAnterior.startsWith(prefix)) {
    await sb.storage.from("site-images").remove([fotoAnterior.slice(prefix.length)]);
  }
  revalidatePath("/");
  updateTag("site");
  return ok({ foto_url });
 } catch (err) {
  return fallo(err);
 }
}

export async function eliminarEspecialista(id) {
 try {
  const sb = await requireAdmin();
  const { data } = await sb
    .from("site_especialistas")
    .select("foto_url")
    .eq("id", id)
    .maybeSingle();
  const { error } = await sb.from("site_especialistas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (data?.foto_url) {
    const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images/`;
    if (data.foto_url.startsWith(prefix)) {
      await sb.storage.from("site-images").remove([data.foto_url.slice(prefix.length)]);
    }
  }
  revalidatePath("/");
  updateTag("site");
  return ok();
 } catch (err) {
  return fallo(err);
 }
}

export async function reordenarEspecialista(id, direccion) {
 try {
  const sb = await requireAdmin();
  const { data: items, error } = await sb
    .from("site_especialistas")
    .select("id,orden")
    .order("orden", { ascending: true });
  if (error) throw new Error(error.message);
  const idx = (items ?? []).findIndex((i) => i.id === id);
  if (idx === -1) throw new Error("Especialista inexistente");
  const destino = direccion === "up" ? idx - 1 : idx + 1;
  if (destino < 0 || destino >= items.length) return ok();
  const a = items[idx];
  const b = items[destino];
  const oA = b.orden;
  const oB = a.orden;
  const { error: e1 } = await sb.from("site_especialistas").update({ orden: oA }).eq("id", a.id);
  if (e1) throw new Error(e1.message);
  const { error: e2 } = await sb.from("site_especialistas").update({ orden: oB }).eq("id", b.id);
  if (e2) throw new Error(e2.message);
  revalidatePath("/");
  updateTag("site");
  return ok();
 } catch (err) {
  return fallo(err);
 }
}

export async function cambiarVisibleEspecialista(id, visible) {
 try {
  const sb = await requireAdmin();
  const { error } = await sb
    .from("site_especialistas")
    .update({ visible: Boolean(visible) })
    .eq("id", id);
  if (error) {
    const msg = String(error.message ?? "");
    if (error.code === "PGRST204" || /column.*visible/i.test(msg) || error.code === "42703") {
      throw new Error(
        "Falta la columna 'visible' en site_especialistas. Ejecutá el SQL de supabase/schema.sql (o el ALTER TABLE) en Supabase y volvé a intentar."
      );
    }
    throw new Error(msg || "No se pudo actualizar la visibilidad");
  }
  revalidatePath("/");
  updateTag("site");
  return ok({ visible: Boolean(visible) });
 } catch (err) {
  return fallo(err);
 }
}

// ============ TRATAMIENTOS ============
export async function guardarTratamiento(formData) {
 try {
  const sb = await requireAdmin();
  const id = Number(formData.get("id")) || null;
  const nombre = maxLen("Nombre", formData.get("nombre"), 120);
  const descripcion = maxLen("Descripción", formData.get("descripcion"), 500);
  const alt = nombre;

  const imagenFile = formData.get("imagen");
  const imagen =
    imagenFile && typeof imagenFile === "object" && "size" in imagenFile
      ? imagenFile
      : null;
  if (imagen && imagen.size > 4_000_000) {
    throw new Error("La imagen pesa más de 4 MB");
  }
  if (imagen && (!imagen.type || !TIPOS_FOTO.has(imagen.type))) {
    throw new Error("Formato no permitido (JPG, PNG o WebP)");
  }

  // Política: solo cambia la imagen si se subió una nueva
  let imagen_url;
  let pathNuevoTratamiento = null;
  if (imagen && imagen.size > 0) {
    const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[imagen.type];
    if (!ext) throw new Error("Formato no permitido (JPG, PNG o WebP)");
    const path = `tratamientos/${crypto.randomUUID()}.${ext}`;
    const bytes = Buffer.from(await imagen.arrayBuffer());
    const detectado = detectarTipoArchivo(bytes);
    if (detectado !== imagen.type) throw new Error("El archivo no es una imagen válida");
    const { error: subError } = await sb.storage
      .from("site-images")
      .upload(path, bytes, { contentType: imagen.type, upsert: false });
    if (subError) throw new Error(subError.message);
    pathNuevoTratamiento = path;
    imagen_url = sb.storage.from("site-images").getPublicUrl(path).data.publicUrl;
  }

  let imagenAnterior = null;
  if (id && imagen_url) {
    const { data: original } = await sb
      .from("site_tratamientos")
      .select("imagen_url")
      .eq("id", id)
      .maybeSingle();
    imagenAnterior = original?.imagen_url ?? null;
  }

  if (id) {
    const payload = { nombre, descripcion, alt };
    if (imagen_url) payload.imagen_url = imagen_url;
    const { error } = await sb
      .from("site_tratamientos")
      .update(payload)
      .eq("id", id);
    if (error) {
      if (pathNuevoTratamiento) await sb.storage.from("site-images").remove([pathNuevoTratamiento]);
      throw new Error(error.message);
    }
  } else {
    const { error } = await sb.from("site_tratamientos").insert({
      nombre,
      descripcion,
      alt,
      ...(imagen_url ? { imagen_url } : {}),
      orden: await proximoOrden(sb, "site_tratamientos"),
    });
    if (error) {
      if (pathNuevoTratamiento) await sb.storage.from("site-images").remove([pathNuevoTratamiento]);
      throw new Error(error.message);
    }
  }

  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images/`;
  if (imagenAnterior && imagenAnterior.startsWith(prefix)) {
    await sb.storage.from("site-images").remove([imagenAnterior.slice(prefix.length)]);
  }
  revalidatePath("/");
  updateTag("site");
  return ok({ imagen_url });
 } catch (err) {
  return fallo(err);
 }
}

export async function eliminarTratamiento(id) {
 try {
  const sb = await requireAdmin();
  const { data } = await sb
    .from("site_tratamientos")
    .select("imagen_url")
    .eq("id", id)
    .maybeSingle();
  const { error } = await sb.from("site_tratamientos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (data?.imagen_url) {
    const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images/`;
    if (data.imagen_url.startsWith(prefix)) {
      await sb.storage.from("site-images").remove([data.imagen_url.slice(prefix.length)]);
    }
  }
  revalidatePath("/");
  updateTag("site");
  return ok();
 } catch (err) {
  return fallo(err);
 }
}

export async function reordenarTratamiento(id, direccion) {
 try {
  const sb = await requireAdmin();
  const { data: items, error } = await sb
    .from("site_tratamientos")
    .select("id,orden")
    .order("orden", { ascending: true });
  if (error) throw new Error(error.message);
  const idx = (items ?? []).findIndex((i) => i.id === id);
  if (idx === -1) throw new Error("Tratamiento inexistente");
  const destino = direccion === "up" ? idx - 1 : idx + 1;
  if (destino < 0 || destino >= items.length) return ok();
  const a = items[idx];
  const b = items[destino];
  const oA = b.orden;
  const oB = a.orden;
  const { error: e1 } = await sb.from("site_tratamientos").update({ orden: oA }).eq("id", a.id);
  if (e1) throw new Error(e1.message);
  const { error: e2 } = await sb.from("site_tratamientos").update({ orden: oB }).eq("id", b.id);
  if (e2) throw new Error(e2.message);
  revalidatePath("/");
  updateTag("site");
  return ok();
 } catch (err) {
  return fallo(err);
 }
}

// ============ PREGUNTAS ============
export async function guardarPregunta(input) {
 try {
  const sb = await requireAdmin();
  const pregunta = maxLen("Pregunta", input.pregunta, 255);
  const respuesta = maxLen("Respuesta", input.respuesta, 1000);
  const orden = Number(input.orden) > 0 ? Number(input.orden) : undefined;
  if (input.id) {
    const payload = { pregunta, respuesta };
    if (orden) payload.orden = orden;
    const { error } = await sb
      .from("site_preguntas")
      .update(payload)
      .eq("id", input.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await sb.from("site_preguntas").insert({
      pregunta,
      respuesta,
      orden: orden ?? (await proximoOrden(sb, "site_preguntas")),
    });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/");
  updateTag("site");
  return ok();
 } catch (err) {
  return fallo(err);
 }
}

export async function eliminarPregunta(id) {
 try {
  const sb = await requireAdmin();
  const { error } = await sb.from("site_preguntas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  updateTag("site");
  return ok();
 } catch (err) {
  return fallo(err);
 }
}

export async function reordenarPregunta(id, direccion) {
 try {
  const sb = await requireAdmin();
  const { data: items, error } = await sb
    .from("site_preguntas")
    .select("id,orden")
    .order("orden", { ascending: true });
  if (error) throw new Error(error.message);
  const idx = (items ?? []).findIndex((i) => i.id === id);
  if (idx === -1) throw new Error("Pregunta inexistente");
  const destino = direccion === "up" ? idx - 1 : idx + 1;
  if (destino < 0 || destino >= items.length) return ok();
  const a = items[idx];
  const b = items[destino];
  const oA = b.orden;
  const oB = a.orden;
  const { error: e1 } = await sb.from("site_preguntas").update({ orden: oA }).eq("id", a.id);
  if (e1) throw new Error(e1.message);
  const { error: e2 } = await sb.from("site_preguntas").update({ orden: oB }).eq("id", b.id);
  if (e2) throw new Error(e2.message);
  revalidatePath("/");
  updateTag("site");
  return ok();
 } catch (err) {
  return fallo(err);
 }
}

// ============ CONTACTO ============
export async function guardarContacto(input) {
  try {
  const sb = await requireAdmin();
  const urlOpcional = (v) => {
    const t = limpiar(v);
    if (!t) return null;
    if (!/^https:\/\//.test(t)) throw new Error("Solo URLs https://");
    if (t.length > 500) throw new Error("URL demasiado larga");
    return t;
  };
  const telefono = (v) => {
    const t = limpiar(v);
    // Mismo criterio que el CHECK de la base (schema.sql): 6-24 caracteres.
    if (!/^[0-9][0-9+\-\s]{5,23}$/.test(t)) throw new Error("Teléfono inválido");
    return t;
  };
  const mapa_url = (v) => {
    const t = limpiar(v);
    if (!t) return null; // el campo es opcional
    if (t.length > 500) throw new Error("URL del mapa demasiado larga");
    // Mismo criterio que el CHECK de la base (schema.sql): solo Google Maps.
    if (!/^https:\/\/www\.google\.com\/maps/.test(t)) {
      throw new Error("El mapa tiene que ser un enlace de Google Maps (https://www.google.com/maps...)");
    }
    return t;
  };
  const payload = {
    direccion: maxLen("Dirección", input.direccion, 255),
    mapa_url: mapa_url(input.mapa_url),
    horario: maxLen("Horario", input.horario, 100),
    telefono_turnos: telefono(input.telefono_turnos),
    telefono_urgencias: telefono(input.telefono_urgencias),
    email: opcional("Email", input.email, 160),
    instagram: urlOpcional(input.instagram),
    facebook: urlOpcional(input.facebook),
  };
  const { error } = await sb.from("site_contacto").update(payload).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  updateTag("site");
  return ok();
  } catch (err) {
    return fallo(err);
  }
}
