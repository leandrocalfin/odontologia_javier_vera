// Datos de contacto de WhatsApp y enlace con mensaje predeterminado.
// Todos los botones de "Pedir turno" y el botón flotante usan esta URL.
export const WHATSAPP_NUMBER = "5492966449813";
export const PHONE_DISPLAY = "2966-449813";
export const PHONE_TEL = "+542966449813";

export const WHATSAPP_MESSAGE =
  "Hola, quisiera pedir un turno en el Consultorio Odontológico Javier Vera. ¿Tienen disponibilidad esta semana?";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE
)}`;

// Mensaje específico para el botón de urgencias del navbar.
export const WHATSAPP_URGENCIA_NUMBER = "5492966234055";

export const WHATSAPP_URGENCIA_MESSAGE =
  "Hola, tengo una urgencia odontológica y necesito atención lo antes posible. ¿Me pueden ayudar?";

export const WHATSAPP_URGENCIA_URL = `https://wa.me/${WHATSAPP_URGENCIA_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_URGENCIA_MESSAGE
)}`;
