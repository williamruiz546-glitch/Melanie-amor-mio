/* ============================================================
   CONTENIDO DEL CALENDARIO — edita aquí los mensajes
   ------------------------------------------------------------
   • Cambia solo lo que está entre comillas "...".
   • Si escribes comillas dentro de un texto, usa « » en vez de " ".
   • {DIAS} en el día 24 se reemplaza solo por los días que llevan juntos.
   • Después de guardar, sube el cambio a GitHub y Render lo publica solo.
   ============================================================ */

const YEAR = 2026;            // año del calendario
const SIGN = "Tu amorcito bello";

// ====== CONTENIDO DE CADA DÍA (edítalo a tu gusto) ======
// tipo: carta | cupon | recuerdo | pregunta | reto | final
const DAYS = {
  1:{tipo:"carta",emoji:"🎁",titulo:"¡Empezamos!",texto:"Hoy arranca nuestra cuenta regresiva a Navidad. Cada día, hasta el 24, aquí te espera una puertita nueva solo para ti. Algunas te van a hacer sonreír, otras te van a dar regalitos y otras te van a poner a pensar. Lo único que tienen en común es que todas las hice pensando en ti."},
  2:{tipo:"recuerdo",emoji:"📱",titulo:"Donde todo empezó",texto:"1 de octubre de 2023. Un Facebook, una prima tuya con muy buen ojo y un primer mensaje. Nunca pensé que algo tan pequeño me iba a cambiar tanto la vida. Le debo un agradecimiento eterno a esa prima."},
  3:{tipo:"cupon",emoji:"🤗",titulo:"Cupón de hoy",cupon:"Vale por un abrazo largo",texto:"De esos que no se sueltan aunque pasen cinco minutos. Canjeable en cualquier momento, sin fecha de vencimiento."},
  4:{tipo:"pregunta",emoji:"🤔",titulo:"Pregunta del día",texto:"¿En qué momento exacto te diste cuenta de que te gustaba? Respóndeme por WhatsApp, quiero saberlo con detalles 😏"},
  5:{tipo:"carta",emoji:"😊",titulo:"Razón #1 por la que te quiero",texto:"Tu risa. Esa que se te sale aunque quieras aguantarla. Podría escucharla todo el día y no me cansaría nunca."},
  6:{tipo:"cupon",emoji:"🍗",titulo:"Cupón de hoy",cupon:"Vale por un seco de pollo",texto:"Nuestra comida favorita, invito yo. Tú pones el día y yo pongo el seco."},
  7:{tipo:"reto",emoji:"📸",titulo:"Reto del día",texto:"Mándame una foto tuya ahora mismo, tal como estés. Sin filtros, sin peinarte, sin excusas. Para mí siempre te ves hermosa."},
  8:{tipo:"recuerdo",emoji:"💞",titulo:"Nuestro día",texto:"15 de octubre de 2023: el día que dejaste de ser «la chica con la que hablaba» y te convertiste en mi novia. Desde entonces cada 15 tiene algo especial para mí."},
  9:{tipo:"carta",emoji:"🌙",titulo:"Razón #2 por la que te quiero",texto:"Porque contigo puedo ser yo mismo. No tengo que fingir nada, ni ser más ni ser menos. Contigo estoy en casa."},
  10:{tipo:"cupon",emoji:"🎬",titulo:"Cupón de hoy",cupon:"Vale por una tarde de películas",texto:"Tú eliges la película (aunque sea romántica), yo pongo las cobijas y los snacks."},
  11:{tipo:"pregunta",emoji:"✈️",titulo:"Pregunta del día",texto:"Si mañana pudiéramos viajar juntos a cualquier lugar del mundo, ¿a dónde me llevarías? Piénsalo bien, porque lo voy a anotar."},
  12:{tipo:"carta",emoji:"💭",titulo:"Un pensamiento",texto:"Hoy, mientras estés leyendo esto, es muy probable que yo esté pensando en ti. Y si no, es porque ya terminé de pensarte hace un ratito y voy a volver a empezar."},
  13:{tipo:"cupon",emoji:"🏳️",titulo:"Cupón de hoy",cupon:"Vale por un «tienes razón»",texto:"Úsalo en cualquier discusión y gano la paz automáticamente. Solo hay uno, así que úsalo con sabiduría 😂"},
  14:{tipo:"recuerdo",emoji:"💍",titulo:"Una promesa",texto:"15 de septiembre de 2026. El anillo que te di no es solo un detalle: es mi promesa de que quiero seguir eligiéndote todos los días. Y lo sigo cumpliendo."},
  15:{tipo:"carta",emoji:"🌻",titulo:"Razón #3 por la que te quiero",texto:"Porque me haces querer ser mejor. Mejor estudiante, mejor persona, mejor novio. Todo lo que construyo, en el fondo también lo construyo pensando en nosotros."},
  16:{tipo:"reto",emoji:"✍️",titulo:"Reto del día",texto:"Escríbeme tres cosas que te gusten de nosotros dos. No de mí, de NOSOTROS. Yo ya tengo mi lista lista."},
  17:{tipo:"cupon",emoji:"💆‍♀️",titulo:"Cupón de hoy",cupon:"Vale por un masaje",texto:"Espalda, pies o cabeza, tú eliges. Duración: hasta que digas «ya»."},
  18:{tipo:"pregunta",emoji:"🎄",titulo:"Pregunta del día",texto:"¿Qué tradición navideña te gustaría que empecemos a tener juntos cada año? La que digas, la hacemos."},
  19:{tipo:"carta",emoji:"🫂",titulo:"Para un día difícil",texto:"Si hoy no es tu mejor día, quiero que sepas esto: no estás sola. Estoy contigo aunque no esté a tu lado. Respira, que todo pasa, y yo sigo aquí."},
  20:{tipo:"cupon",emoji:"🌹",titulo:"Cupón de hoy",cupon:"Vale por una cita sorpresa",texto:"Yo la planeo de principio a fin. Tú solo te arreglas y te dejas llevar."},
  21:{tipo:"carta",emoji:"✨",titulo:"Razón #4 por la que te quiero",texto:"Porque eres mi niña hermosa, mi guapita, mi Melancho. Tienes muchos nombres en mi boca, pero todos significan lo mismo: te amo."},
  22:{tipo:"reto",emoji:"📞",titulo:"Reto del día",texto:"Llámame hoy y cuéntame tu día completito, desde que te levantaste. Prometo escuchar todo sin interrumpir (bueno, casi)."},
  23:{tipo:"carta",emoji:"⭐",titulo:"Mañana es Nochebuena",texto:"Ya casi llegamos. Gracias por abrir cada puertita conmigo. Mañana te espera la última, y es la más importante. No la abras antes de tiempo 😉"},
  24:{tipo:"final",emoji:"🎄",titulo:"Feliz Navidad, mi amor",texto:"Llegamos al último día. Si sumo todo lo que hemos vivido, son {DIAS} días desde que somos novios, y no cambiaría ni uno solo. Gracias por quererme como me quieres, por aguantarme, por reírte conmigo y por elegirme también. Esta Navidad mi deseo no es un regalo: es seguir a tu lado en todas las que vengan. Te amo, Melancho."}
};
// Etiqueta que aparece arriba de cada carta según su tipo
const LABEL = {carta:"💌 Carta",cupon:"🎟️ Cupón",recuerdo:"📸 Recuerdo",pregunta:"❓ Pregunta",reto:"🎯 Reto",final:"🎄 Nochebuena"};

// ====== FOTOS DE CADA DÍA (opcional) ======
// Pon el nombre del archivo que está en la carpeta fotos/.
// Para quitar una foto, borra su línea. El día 24 usa la lista FOTOS_FINAL.
const FOTOS = {
  1:  {src:"fotos/navidad-luces.webp",       pie:"Nuestra primera Navidad de luces"},
  2:  {src:"fotos/recuerdo-videollamada.webp",pie:"Todo empezó con una pantalla de por medio"},
  5:  {src:"fotos/risa.webp",                pie:"Esa sonrisa"},
  8:  {src:"fotos/recuerdo-nuestro-dia.webp", pie:"Mi novia, desde el 15 de octubre"},
  9:  {src:"fotos/en-casa.webp",             pie:"Mi lugar favorito"},
  14: {src:"fotos/recuerdo-anillo.webp",     pie:"15 · 09 · 2026"},
  15: {src:"fotos/la-u.webp",                pie:"Construyendo juntos"},
  19: {src:"fotos/abrazo.webp",              pie:"Aquí estoy"},
  21: {src:"fotos/hermosa.webp",             pie:"Mi Melancho"}
};
const FOTOS_FINAL = [
  "fotos/navidad-arbol.webp",
  "fotos/recuerdo-nuestro-dia.webp",
  "fotos/la-estacion.webp",
  "fotos/navidad-reno.webp",
  "fotos/recuerdo-anillo.webp",
  "fotos/tus-19.webp",
  "fotos/juntitos.webp",
  "fotos/cumple.webp"
];
