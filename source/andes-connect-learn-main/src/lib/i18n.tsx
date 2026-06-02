import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "es" | "qu" | "ay" | "shp";

type LangMap = Record<Lang, string>;
type Dict = Record<string, LangMap>;

// Helper to build a LangMap quickly; missing langs fall back to es.
const L = (es: string, qu: string, ay: string, shp: string): LangMap => ({ es, qu, ay, shp });

export const t: Dict = {
  // Header / nav
  navCourses: L("Cursos", "Yachaykuna", "Yatiqañanaka", "Onanti"),
  navForums: L("Foros", "Rimanakuna", "Aruskipawi", "Yoiti maa"),
  navGoals: L("Metas", "Suyaykuna", "Amtawi", "Shinaibo"),
  navTutorial: L("Tutorial", "Yachachiy", "Yatichäwi", "Onanti yoitai"),
  navLogin: L("Inicio de sesión", "Yaykuy", "Mantaña", "Jiska"),
  navLogout: L("Cerrar sesión", "Lluqsiy", "Mistuña", "Bena ka"),
  ongLine: L("ONG · Sierra del Perú", "ONG · Perú urqu", "ONG · Perú qullu", "ONG · Perú maxan"),

  // Common UI
  back: L("Volver", "Kutiy", "Kuttʼaña", "Bena"),
  backHome: L("Regresar a vista principal", "Qallariyman kutiy", "Qalltawiru kuttʼaña", "Bena onanti"),
  backCourses: L("Regresar a Cursos", "Yachaykunaman kutiy", "Yatiqañanakaru kuttʼaña", "Onanti bena"),
  loading: L("Cargando…", "Apamuchkani…", "Apnaqasiski…", "Bewa…"),
  enterCourse: L("Entrar al curso", "Yachayman yaykuy", "Yatiqañar mantaña", "Onanti jiska"),
  goToCourse: L("Ir al curso", "Yachayman riy", "Yatiqañar saraña", "Onanti riki"),
  seeAllCourses: L("Ver todos los cursos", "Tukuy yachaykunata qhaway", "Taqi yatiqañanak uñjaña", "Westiora onanti oinai"),
  startLabel: L("Empezar", "Qallariy", "Qalltaña", "Riki onanti"),
  courseTag: L("Curso", "Yachay", "Yatiqaña", "Onanti"),

  // Hero / index
  heroEyebrow: L("ONG Allin Yachay · Tecnología para la sierra", "Allin Yachay · Sierrapaq tecnología", "Allin Yachay · Qullasuyu tecnología", "Allin Yachay · Manxan jonibo"),
  heroTitle: L("Aprende tecnología en tu idioma, desde el campo", "Tecnologíata yachay, qan rimasqaykipi, chakramanta", "Tecnología yatiqañani, jumana arumampi, yapuna", "Onanti tecnologia, mia joi keska, wai keska"),
  heroDesc: L(
    "Cursos sencillos de automatización y herramientas digitales para mejorar tu ganadería, cultivo y alquiler de tierras. Hechos para ti, paso a paso, con voz e imágenes.",
    "Yachaykuna llamkayniykita allinyachinapaq: uywakuna, chakra, allpa qhatuy. Sapa kuti, rimaywan, siqikunawan.",
    "Yatiqañanaka uywanakana, yapuna, uraqi alquilañataki. Aru, jakhuwi, jamuqanakana yatiqañani.",
    "Onanti jakon: yoyo, wai, mai banaibo. Joi, kené, jakon shinai keska."
  ),
  ctaStart: L("Empezar ahora", "Kunan qallariy", "Jichha qalltaña", "Riki onanti"),
  ctaWatch: L("Ver cómo funciona", "Imayna ruwakun qhaway", "Kunjamasa luraski uñjaña", "Oinkinbi"),
  freeTag: L("100% Gratuito", "Mana qullqipi", "Inakipuni", "Yamake"),
  audioTag: L("Con audio", "Rimaywan", "Arumpi", "Joimabi"),
  visualTag: L("Muy visual", "Siqikunawan", "Jamuqampi", "Oinai"),

  // Course catalog headers
  coursesTitle: L("Cursos hechos para tu vida en el campo", "Chakraykipaq yachaykuna", "Yapuma yatiqañanaka", "Wai jakon onanti"),
  coursesDesc: L(
    "Elige el área que más te ayudará. Cada curso usa dibujos, voz y videos cortos.",
    "Akllay imapas yanapasunkiman. Sapa yachay siqikunawan, rimaywan, pisi videowan.",
    "Ajllita kuna yanapaspa. Sapa yatiqaña jamuqampi, arumpi, jisk'a videompi.",
    "Akinti jakon. Westiora onanti kené, joi, jisma video."
  ),
  catalogEyebrow: L("Pasarela de cursos", "Yachaykuna pasarela", "Yatiqañanaka pasarela", "Onanti pasarela"),
  catalogTitle: L("Cursos para tu vida altoandina", "Andinopi kawsayniykipaq yachaykuna", "Andina jakawimataki yatiqañanaka", "Andes jakon onanti"),
  catalogDesc: L(
    "Cada curso tiene su propio foro para preguntar y compartir.",
    "Sapa yachaypin foronpi tapuy, willanakuy.",
    "Sapa yatiqañana foropawa, jisktʼañataki, lakiñataki.",
    "Westiora onanti foro iki, yoiti, beika."
  ),
  coursesCountOne: L("curso", "yachay", "yatiqaña", "onanti"),
  coursesCountMany: L("cursos", "yachaykuna", "yatiqañanaka", "onanti maa"),

  // Categories
  catCampoLabel: L("Vida en el campo", "Chakra kawsay", "Yapuna jakawi", "Wai jakon"),
  catCampoDesc: L("Ganadería, cultivo y clima para tu chacra.", "Uywakuna, chakra, pacha chakraykipaq.", "Uywanaka, yapu, pacha yapumataki.", "Yoyo, wai, niwe."),
  catNegocioLabel: L("Negocio y dinero", "Qhatuy, qullqi", "Alxaña, qullqi", "Banai, koriki"),
  catNegocioDesc: L("Vende tus productos y lleva cuentas claras.", "Ruwasqaykita qhatuy, qullqita yupachay.", "Lurawinakam alxaña, qullqi jakhuña.", "Mia bewa banai, koriki shinai."),
  catTecnologiaLabel: L("Primeros pasos digitales", "Ñawpaq purikuy digitalpi", "Nayrïr sarawi digitalana", "Beno onanti digital"),
  catTecnologiaDesc: L("Aprende a usar la computadora y el celular.", "Computadorata, celulartapas yachay.", "Computadora ukhamarak celular apnaqaña yatiqaña.", "Computadora, celular onanti."),
  catEnergiaLabel: L("Energía y recursos", "Kallpa, kawsay imaymana", "Ch'amani, suma yänaka", "Kané, jakon yanaibo"),
  catEnergiaDesc: L("Energía solar y manejo del agua.", "Inti kallpa, yaku apaykachay.", "Inti ch'amani, uma apnaqaña.", "Bari kané, jene shinai."),

  // Why section
  whyTitle: L("Hecho con respeto a tu cultura", "Yachayniykita respetawan", "Sarnaqawimaru respetampi", "Mia jakon shinai"),
  why1: L("En tu idioma", "Rimasqaykipi", "Aruma", "Mia joi"),
  why1d: L("Español, quechua, aymara y shipibo. Con audio en cada lección.", "Tawa simipi rimaywan.", "Pusi arumpi.", "Tawa joi joimabi."),
  why2: L("Laboratorios comunitarios", "Ayllu laboratoriokuna", "Marka laboratorionaka", "Jema laboratorio"),
  why2d: L(
    "Tablets y computadoras compartidas en cada centro Allin Yachay. Aprende con un facilitador que habla tu idioma.",
    "Tablet, computadoras sapa Allin Yachay wasipi. Yanapaqwan, simiykipi rimaqwan yachay.",
    "Tablet ukat computadora sapa Allin Yachay utana. Yanapirimpi, arumpi parlirimpi yatiqaña.",
    "Tablet, computadora westiora Allin Yachay xobo. Yanapakon, mia joi yoitai onanti."
  ),
  why3: L("Genera ingresos reales", "Cheqaq qullqita ruway", "Chiqa qullqi apthapiña", "Koriki jakon bewa"),
  why3d: L("Conecta tu producción con compradores en la ciudad y mejora tus precios.", "Llamkayniykita llaqtawan tinkichiy.", "Lurawima markampi tinkuyaña.", "Mia bewa jema banaibo."),

  // Testimonials
  testTitle: L("Voces de la comunidad", "Ayllumanta rimaykuna", "Markana arunaka", "Jonibo joi"),
  test1: L("“Antes perdía mis alpacas. Ahora con el curso las controlo desde mi celular.”", "“Ñawpaqqa paquchakunata chinkachiq kani. Kunanqa celularniypi rikuni.”", "“Nayraxa allpachunaka chhaqayiritaxa. Jichhaxa celularajana uñjta.”", "“Beno yoyo bekamai. Riki celular oinai.”"),
  test1n: L("— María Q., Puno", "— María Q., Puno", "— María Q., Puno", "— María Q., Puno"),
  test2: L("“Aprendí a regar mis papas con sensores. Cosecha más grande este año.”", "“Sensorkunawan papata qarpayta yacharqani.”", "“Sensorampi papa qarpaña yatiqta.”", "“Sensores keska papa jene onanti.”"),
  test2n: L("— Julián M., Cusco", "— Julián M., Cusco", "— Julián M., Cusco", "— Julián M., Cusco"),

  // CTA
  ctaTitle: L("Únete a la red de aprendices andinos", "Andesmanta yachaqkunawan tinkikuy", "Andinos yatiqirinakampi mayachasiña", "Andes jonibo bewa"),
  ctaDesc: L("Inscríbete gratis. Te llamamos por radio o WhatsApp para ayudarte a empezar.", "Mana qullqipi qillqakuy. Radiopi otaq WhatsApp-pi waqyasqayki.", "Inaki qillqasiña. Radio jan ukax WhatsApp jawsapxasma.", "Yamake qillqai. Radio o WhatsApp bewa."),
  ctaButton: L("Inscribirme gratis", "Mana qullqipi qillqakuy", "Inaki qillqasiña", "Yamake qillqai"),
  ctaForums: L("Ir a los foros", "Rimanakunaman riy", "Aruskipäwiru saraña", "Yoiti maa riki"),
  footerNote: L("ONG Allin Yachay — Tecnología con identidad andina.", "ONG Allin Yachay — Andesmanta yachay.", "ONG Allin Yachay — Andina yatiqaña.", "ONG Allin Yachay — Manxan onanti."),

  // Tutorial
  tutLangTitle: L("Bienvenida / Bienvenido", "Allin hamusqayki", "Suma jutawi", "Jakon raoma"),
  tutLangDesc: L(
    "Antes de empezar, elige el idioma en el que quieres aprender. Podrás cambiarlo cuando quieras.",
    "Manaraq qallarispa, akllay ima simipi yachayta munanki. Mayqin kutipas tikrachiyta atinki.",
    "Janira qalltkasa, ajllita kawkir arumpi yatiqañ munta. Kunapachas mayjtʼayasma.",
    "Beno onanti, akinti mia joi. Riki bewa kayabi."
  ),
  tutContinue: L("Continuar", "Catiy", "Sarantaña", "Riki"),
  tutSkip: L("Saltar tutorial", "Yachachiyta saqiy", "Yatichäwi jaytaña", "Onanti yamake"),
  tutBack: L("Atrás", "Qhipa", "Qhipa", "Bena"),
  tutNext: L("Siguiente", "Qhipan", "Qhipa", "Joneki"),
  tutStart: L("Empezar", "Qallariy", "Qalltaña", "Riki onanti"),
  tut1Title: L("1. Elige tu idioma", "1. Simiykita akllay", "1. Aruma ajllita", "1. Mia joi akinti"),
  tut1Desc: L(
    "Arriba a la derecha hay botones con cada idioma: español, runasimi, aymar aru o shipibo. Toda la página cambia al instante.",
    "Hawa pañapi sapa simipi botonkuna kachkan. Tukuy páginan utqayllan tikran.",
    "Patxa kupixaru aru ch'iqtañanaka utji. Taqi yänakax mä jak'ata mayjtʼi.",
    "Bewa pañabi joibo iki. Joneki kayabi."
  ),
  tut2Title: L("2. Mira los cursos", "2. Yachaykunata qhaway", "2. Yatiqäwinak uñjam", "2. Onanti oinkin"),
  tut2Desc: L(
    "Entra a 'Cursos' y elige el que más te ayude: ganadería, riego, alquiler de tierras, energía solar, venta de textiles y más.",
    "'Yachaykuna' nisqaman yaykuy: uywakuna, qarpay, allpa qhatuy, inti kallpa, away qhatuy.",
    "'Yatiqañanaka' mantam: uywanaka, qarpaña, uraqi alquilaña, inti ch'amani, sawu aljaña.",
    "'Onanti' bewa: yoyo, jene, mai banai, bari kané, kené aljaña."
  ),
  tut3Title: L("3. Pregunta en el foro", "3. Forupi tapuy", "3. Forona jisktʼaña", "3. Foro yoiti"),
  tut3Desc: L(
    "Cada curso tiene su propio foro. Pregunta y lee respuestas de otros aprendices y profesores cuando vuelvas al laboratorio.",
    "Sapa yachaypi forun kachkan. Tapuy, kutichiykunata ñawiriy laboratorioman kutimuspa.",
    "Sapa yatiqañana foropawa utji. Jisktʼam, jaysañanak liytʼam laboratorior kuttʼkasin.",
    "Westiora onanti foro iki. Yoiti, oinai laboratoriobi."
  ),
  tut4Title: L("4. Pide ayuda a Yachay", "4. Yachayta yanapata mañakuy", "4. Yachayar yanapt'a mayisima", "4. Yachay bewa"),
  tut4Desc: L(
    "El botón naranja de abajo a la derecha abre a Yachay, tu asistente. Te responde en tu idioma cualquier duda básica.",
    "Uray pañapi naranja botón Yachayta kichan. Simiykipi uchuy tapuykunata kutichin.",
    "Aynach kupax naranja butuna Yachayar jistʼari. Aruma jisktʼanak jaysi.",
    "Mai pañabi naranja botón Yachay jiska. Mia joi yoiti."
  ),

  // Chat floating
  chatTitle: L("Pregunta a Yachay", "Yachayta tapuy", "Yachayar jisktʼaña", "Yachay yoiti"),
  chatSubtitle: L("Tu asistente · 4 idiomas", "Yanapayniyki · 4 simi", "Yanapt'iri · 4 aru", "Mia bewa · 4 joi"),
  chatClose: L("Cerrar", "Wisqʼay", "Jistʼantaña", "Bena ka"),
  chatPlaceholder: L("Escribe tu pregunta…", "Tapuyniykita qillqay…", "Jisktʼawima qillqaña…", "Mia yoiti qillqai…"),
  chatErrorReply: L("No pude responder. Intenta de nuevo.", "Mana kutichiyta atinichu. Watiqmanta ruway.", "Janiw jaysayatti. Maytarak luram.", "Yamake jaysai. Bena bewa."),
  chatErrorNet: L("Hubo un problema de conexión.", "Internetpi sasachakuy karqan.", "Internetana jan walt'awi utjawi.", "Internet janiki."),

  // Levels & duration
  levelInicial: L("Inicial", "Qallariq", "Qalltir", "Beno"),
  levelIntermedio: L("Intermedio", "Chawpi", "Taypi", "Napon"),
  levelAvanzado: L("Avanzado", "Yachasqaña", "Sarantata", "Joneki"),
  weeksUnit: L("semanas", "simanakuna", "semananaka", "semana"),
  weekUnit: L("semana", "simana", "semana", "semana"),

  // Course detail
  courseNotFoundTitle: L("Curso no encontrado", "Yachay mana tarisqachu", "Yatiqaña jan jikxatatati", "Onanti yamake"),
  courseNotFoundDesc: L("El curso que buscas no existe o fue movido.", "Maskasqayki yachay mana kanchu.", "Thaqkat yatiqañax janiw utjkiti.", "Mia oinai onanti yamake."),
  yourProgress: L("Tu avance", "Purisqayki", "Sarantawima", "Mia onanti"),
  ofClasses: L("de", "yapakuna", "yatiyäwinaka", "maa"),
  classesWord: L("clases", "yachaykuna", "yatiyäwinaka", "onanti"),
  loginToSave: L("Inicia sesión para guardar tu progreso y desbloquear las clases.", "Yaykuy purisqaykita waqaychanapaq, yachaykunata kichanapaqpas.", "Mantaña sarantawi imañataki, yatiyäwinak jistʼarayañataki.", "Jiska mia onanti bewa, onanti jiska."),
  loginShort: L("Iniciar sesión", "Yaykuy", "Mantaña", "Jiska"),
  courseCompleted: L("¡Curso completado!", "¡Yachay tukusqa!", "¡Yatiqaña tukuyata!", "¡Onanti jakon!"),
  goToForumOfCourse: L("Ir al foro del curso", "Yachay forunman riy", "Yatiqañan foropar saraña", "Onanti foro riki"),
  coursePlanEyebrow: L("Plan del curso", "Yachay plan", "Yatiqaña plan", "Onanti plan"),
  classesStepByStep: L("clases paso a paso", "yachaykuna sapa kuti", "yatiyäwinaka jakhuwi", "onanti jakon"),
  classesOrderHint: L("Las clases se desbloquean en orden. Termina el cuestionario para pasar a la siguiente.", "Yachaykuna sapa kutin kichakun. Cuestionariota tukuy hukmanñataq.", "Yatiyäwinakax jakhuwi jistʼarasi. Cuestionario tukuyañataki maytaru.", "Onanti jakon kayabi. Cuestionario tukuibi joneki."),
  lockedHint: L("Termina la clase anterior para desbloquearla.", "Ñawpaq yachayta tukuy kichanapaq.", "Nayrïr yatiyäwi tukuyañ jistʼarayañataki.", "Beno onanti tukui jiska."),
  practiceTag: L("Caso práctico", "Ruway sasachay", "Lurañ k'uskipa", "Onanti bewa"),
  hint: L("Pista", "Yanapay", "Yanapt'a", "Yanapakon"),
  doTopic: L("Realizar tema", "Yachayta ruway", "Yatxatäwi luraña", "Onanti bewa"),
  quizBtn: L("Cuestionario", "Tapukuna", "Jisktʼawi", "Yoiti maa"),
  doTopicFirst: L("Primero realiza el tema", "Ñawpaqta yachayta ruway", "Nayraqat yatxatäwi luram", "Beno onanti bewa"),
  doQuiz: L("Hacer el cuestionario", "Tapukunata ruway", "Jisktʼawi luraña", "Yoiti maa bewa"),
  topicThenQuiz: L("Realiza primero el tema, luego responde el cuestionario para avanzar.", "Ñawpaqta yachayta ruway, hinaspa cuestionariota kutichi.", "Nayraqat yatxatäwi luram, ukatx cuestionario jaysam.", "Beno onanti bewa, joneki yoiti maa bewa."),
  goToQuiz: L("Ir al cuestionario", "Tapukunaman riy", "Jisktʼawiru saraña", "Yoiti maa riki"),
  shortQuiz: L("Cuestionario corto", "Pisi tapukuna", "Jisk'a jisktʼawi", "Jisma yoiti"),
  answerToFinish: L("Responde las preguntas para terminar la clase.", "Tapukunata kutichi yachayta tukunapaq.", "Jisktʼanak jaysam yatiyäwi tukuyañataki.", "Yoiti jaysai onanti tukui."),
  sendAnswers: L("Enviar respuestas", "Kutichiykunata kachay", "Jaysañanak khitaña", "Jaysai khitai"),
  tryAgain: L("Volver a intentar", "Watiqmanta ruway", "Maytarak luraña", "Bewa bena"),
  classCompleted: L("Clase completada", "Yachay tukusqa", "Yatiyäwi tukuyata", "Onanti jakon"),
  excellentPassed: L("¡Excelente! correctas. Clase completada.", "¡Sumaq! cheqankunam. Yachay tukusqa.", "¡Suma! chiqa. Yatiyäwi tukuyata.", "¡Jakon! shinai. Onanti jakon."),
  reviewRetry: L("correctas. Revisa y vuelve a intentarlo.", "cheqankunam. Qhaway, watiqmanta ruway.", "chiqa. Uñjam, maytarak luram.", "shinai. Oinai, bewa bena."),

  // Cursos page extra
  coursesInCategoryTitle: L("Cursos", "Yachaykuna", "Yatiqañanaka", "Onanti"),

  // Metas page
  metasEyebrow: L("Tu camino de aprendizaje", "Yachay ñanniyki", "Yatiqäwi thaki", "Mia onanti jonen"),
  metasTitle: L("Metas alcanzadas", "Aypasqa suyaykuna", "Aypatäwinaka", "Shinaibo jakon"),
  metasDesc: L("Aquí ves cuánto has avanzado y cuántos días te faltan para terminar según las clases que hagas cada día.", "Kaypi qhawanki imayna purisqaykita, hayka punchawñataq tukunaykipaq.", "Akax uñjta kunja sarantta, qawqha urunakas pisi tukuyañataki.", "Nokon oinai mia onanti, jawe nete tukui."),
  loginPromptTitle: L("Entra a tu cuenta", "Cuentaykiman yaykuy", "Cuentamar mantaña", "Mia cuenta jiska"),
  loginPromptDesc: L("Para guardar tu progreso y trazar tus metas, necesitas tener tu cuenta abierta.", "Purisqaykita waqaychanapaq, suyaykita rurakunapaq, cuentaykita kichay.", "Sarantawi imañataki, amtawinak luräñataki, cuentama jistʼarayam.", "Mia onanti bewa, shinaibo bewa, mia cuenta jiska."),
  loginOrCreate: L("Entrar o crear cuenta", "Yaykuy otaq cuenta paqarichiy", "Mantaña jan ukax cuenta luraña", "Jiska o cuenta bewa"),
  loadingProgress: L("Cargando tu progreso…", "Purisqaykita apamuchkani…", "Sarantawima apnaqasiski…", "Mia onanti bewa…"),
  statAdvance: L("Avance total", "Llapan puriy", "Taqi sarantawi", "Westiora onanti"),
  statClasses: L("Clases hechas", "Ruwasqa yachaykuna", "Lurat yatiyäwinaka", "Onanti bewa"),
  statFinished: L("Cursos terminados", "Tukusqa yachaykuna", "Tukuyat yatiqañanaka", "Onanti jakon"),
  statStarted: L("Cursos empezados", "Qallarisqa yachaykuna", "Qalltat yatiqañanaka", "Onanti riki"),
  overallProgress: L("Tu avance general", "Llapan purisqayki", "Taqpach sarantawi", "Westiora mia onanti"),
  yachayGuide: L("Yachay, tu guía", "Yachay, ñanniykita rikuchiq", "Yachay, thakima uñachʼayiri", "Yachay, mia jonen"),
  allDone: L("¡Felicidades! Has terminado todos los cursos.", "¡Allin! Tukuy yachaykunata tukusqankim.", "¡Walikiwa! Taqi yatiqañanak tukuytaxa.", "¡Jakon! Westiora onanti tukui."),
  remainingClasses: L("Te faltan {n} clases para terminar todo.", "{n} yachaykuna pisi tukunaykipaq.", "{n} yatiyäwinaka pisi taqi tukuyañataki.", "{n} onanti pisi westiora tukui."),
  paceLine: L("Si haces {p} clase(s) al día, terminarás en aproximadamente {d} días ({w} semana(s)).", "Sapa punchaw {p} yachayta ruwaspa, {d} punchawpi tukunki ({w} simana).", "Sapa uru {p} yatiyäwi lurasaxa, {d} urun tukuñ ({w} semana).", "Westiora nete {p} onanti bewa, {d} nete tukui ({w} semana)."),
  tip1: L("¡Excelente! Si haces 1 clase al día, mantienes el ritmo del campo.", "¡Allin! Sapa punchaw 1 yachayta ruwaspa, chakra ritmoyki sumaq.", "¡Walikiwa! Sapa uru 1 yatiyäwi lurasax, yapuna sumawa.", "¡Jakon! Westiora nete 1 onanti, wai jakon."),
  tip2: L("Con 2 clases al día avanzas el doble. Aprovecha los descansos del trabajo.", "Sapa punchaw 2 yachaywan iskayniqman puriwanki.", "Sapa uru 2 yatiyäwi lurasax payak sarantta.", "Westiora nete 2 onanti, joneki onanti."),
  tip3: L("3 clases al día es un ritmo fuerte. Ideal para días de lluvia.", "Sapa punchaw 3 yachay sinchi puriy. Para punchawkunapaq allin.", "Sapa uru 3 yatiyäwi ch'amaniwa. Jallu urunakatakix walikiwa.", "Westiora nete 3 onanti, ouin nete jakon."),
  myPace: L("Mi ritmo:", "Purisqay:", "Sartʼa:", "Nokon kayabi:"),
  perDay: L("/ día", "/ punchaw", "/ uru", "/ nete"),
  suggestedGoal: L("Meta sugerida: traza objetivos pequeños cada semana.", "Suyaqi: huchuy suyaykunata sapa simana churay.", "Amtawi: jisk'a amtawinak sapa semana luram.", "Shinaibo: jisma shinaibo westiora semana."),
  yourCoursesH: L("Tus cursos", "Yachaykuniyki", "Yatiqañanakama", "Mia onanti"),
  markYourClass: L("Marca tu clase", "Yachayniykita marcay", "Yatiyäwima marcaña", "Mia onanti shinai"),
  addOnFinish: L("Suma cuando termines una", "Hukta tukuspa yapay", "Mä tukuyasax yapaña", "Westiora tukui bewa"),
  removeClass: L("Quitar una clase", "Hukta yachayta urquy", "Mä yatiyäwi apsuña", "Westiora onanti bena"),
  addClass: L("Sumar una clase", "Hukta yachayta yapay", "Mä yatiyäwi yapaña", "Westiora onanti bewa"),
  myDailyGoal: L("Mi meta diaria:", "Sapa punchaw suyay:", "Sapa uru amtawi:", "Nete shinaibo:"),
  finishedShort: L("¡Curso terminado!", "¡Yachay tukusqa!", "¡Yatiqaña tukuyata!", "¡Onanti jakon!"),
  readyInDays: L("Listo en {d} día(s)", "{d} punchawpi listo", "{d} urun wakichata", "{d} nete jakon"),

  // Foros
  forosEyebrow: L("Foros", "Rimanakuna", "Aruskipawi", "Yoiti maa"),
  forosTitle: L("Conversa con tu comunidad de aprendizaje", "Yachaq ayllu masiykiwan rimanakuy", "Yatiqir markamampi aruskipaña", "Mia onanti jonibo yoiti"),
  forosDesc: L("Cada curso tiene su propio foro. Así no se mezclan los temas: las preguntas de ganadería con las de riego, por ejemplo. Puedes participar cuando vuelvas al laboratorio comunal.", "Sapa yachaypi forun kachkan. Mana chaqrukunchu temapikuna.", "Sapa yatiqañana foropawa utji. Janiw temanaka chhaxruñkiti.", "Westiora onanti foro iki. Yamake chaxruai."),
  courseForumLabel: L("Foro del curso", "Yachay foro", "Yatiqañan foropa", "Onanti foro"),
  allForums: L("Todos los foros", "Tukuy forukuna", "Taqi foronaka", "Westiora foro"),
  noThreads: L("Aún no hay temas en este curso. ¡Comparte tu pregunta o experiencia!", "Manaraq temakuna kanchu. Tapuyta otaq experienciaykita willay.", "Janira temanak utjkiti. Jisktʼama jan ukax yatiqäwima lakim.", "Yamake yoiti iki. Mia yoiti o onanti beika."),
  beFirstAsk: L("Sé el primero en preguntar", "Ñawpaq tapuq kay", "Nayrïrïma jisktʼaña", "Beno yoiti riki"),
  newThread: L("Nuevo tema", "Mosoq tema", "Machaqa tema", "Bena yoiti"),
  newQuestionTitle: L("Nueva pregunta o tema", "Mosoq tapuy otaq tema", "Machaqa jisktʼa jan ukax tema", "Bena yoiti o joi"),
  shortTitle: L("Título corto", "Pisi suti", "Jisk'a suti", "Jisma jane"),
  tellQuestion: L("Cuenta tu pregunta o experiencia con detalle…", "Tapuyniykita allinta willay…", "Jisktʼama suma qhanañchawimpi sam…", "Mia yoiti shinai…"),
  publish: L("Publicar", "Riqsichiy", "Uñachayaña", "Bewa"),
  publishing: L("Publicando…", "Riqsichichkani…", "Uñachayaski…", "Bewa…"),
  hideReplies: L("Ocultar respuestas", "Kutichiykunata pakay", "Jaysañanak imantaña", "Yoiti maa imai"),
  seeReplies: L("Ver respuestas", "Kutichiykunata qhaway", "Jaysañanak uñjaña", "Yoiti maa oinai"),
  noReplies: L("Aún no hay respuestas. ¡Sé el primero!", "Manaraq kutichikuna kanchu. ¡Ñawpaq kay!", "Janira jaysañanak utjkiti. ¡Nayrïrïma!", "Yamake yoiti maa. ¡Beno riki!"),
  loadingReplies: L("Cargando respuestas…", "Kutichiykunata apamuchkani…", "Jaysañanak apnaqasiski…", "Yoiti maa bewa…"),
  loadingThreads: L("Cargando temas…", "Temakunata apamuchkani…", "Temanak apnaqasiski…", "Yoiti bewa…"),
  writeReply: L("Escribe tu respuesta…", "Kutichiyniykita qillqay…", "Jaysawima qillqaña…", "Mia yoiti qillqai…"),
  replyBtn: L("Responder", "Kutichiy", "Jaysaña", "Yoiti"),
  loginToWriteForum: L("Para escribir en el foro,", "Foruwan qillqanapaq,", "Foroyan qillqañataki,", "Foro qillqai bewa,"),
  loginFreeLink: L("inicia sesión gratis", "mana qullqipi yaykuy", "inaki mantaña", "yamake jiska"),
  readingFree: L(". Leer es libre para todos.", ". Ñawiriy llapanpaq kichkasqa.", ". Liyañax taqitakiwa.", ". Oinai westiora."),
  loginToReply: L("para responder.", "kutichinapaq.", "jaysañataki.", "yoiti bewa."),
  aprendiz: L("Aprendiz", "Yachakuq", "Yatiqiri", "Onantai"),
  agoNow: L("ahora", "kunan", "jichha", "riki"),
  agoMin: L("hace {n} min", "{n} min kanan", "{n} min nayra", "{n} min beno"),
  agoH: L("hace {n} h", "{n} hora kanan", "{n} hora nayra", "{n} hora beno"),
  agoD: L("hace {n} d", "{n} punchaw kanan", "{n} uru nayra", "{n} nete beno"),

  // Auth extra
  exampleUser: L("Usuario de ejemplo", "Riqsichiy runa", "Uñacht'awi jaqi", "Onantai akinti"),
  changeLang: L("Cambiar idioma", "Simita tikray", "Aru mayjt'aña", "Joi kayabi"),
  loadingDemo: L("Datos de ejemplo cargados. Solo presiona Entrar.", "Riqsichiy datokuna listoña. Entrar ñiy.", "Uñacht'äw datunaka wakichata. Entrar ñam.", "Akinti datos jakon. Entrar bewa."),
  oneMoment: L("Un momento…", "Pisi pacha…", "Mä rato…", "Jisma…"),
};

// Course translations (id → lang → {title, short, long})
type CourseI18n = { title: string; short: string; long: string };
export const COURSE_TR: Record<string, Record<Lang, CourseI18n>> = {
  ganaderia: {
    es: { title: "Ganadería inteligente", short: "Registra llamas y alpacas en tu celular: salud, vacunas, crías y peso.", long: "Aprende a llevar un cuaderno digital de tu rebaño. Te enseñamos a anotar vacunas, controlar el peso y predecir las pariciones, todo con tu celular o una tableta del laboratorio comunal." },
    qu: { title: "Yachay uywakuna", short: "Llamaykita, paquchaykita celularpi qillqay: hampi, vacuna, uña, llasaynin.", long: "Uywaykipaq digital cuaderno apaykachayta yachay. Vacunata, llasayta, wachakuyta celularniykipi qillqay." },
    ay: { title: "Yatiq uywanaka", short: "Qarwa, allpachu celularan qillqaña: qullawi, wawanaka, jathi.", long: "Uywanakamatak digital cuaderno apnaqaña yatiqaña. Qullawi, jathi, wawachasiwi celularan qillqaña." },
    shp: { title: "Yoyo onanti", short: "Yoyo celular keska: jonkonti, vacuna, bake, jihui.", long: "Mia yoyo digital cuaderno bewa. Vacuna, jihui, bake nete celular qillqai." },
  },
  cultivo: {
    es: { title: "Cultivo y riego automático", short: "Sensores simples para regar papa, maíz y quinua sin desperdiciar agua.", long: "Construye con materiales locales un sistema de riego que se enciende solo cuando la tierra está seca. Ideal para parcelas pequeñas y medianas." },
    qu: { title: "Chakra qarpay automatico", short: "Pisi sensorkunawan papa, sara, kinwa qarpay yakuta mana usuchispa.", long: "Aylluyki kaqkunawan riego sistemata ruway, allpa ch'akiqtin sapan kichakun." },
    ay: { title: "Yapu qarpaña automático", short: "Jisk'a sensoranaka papa, tunqu, jiwra qarpañataki uma jan apjañ.", long: "Markamana yänakanakampi riego sistema lurañani, uraq waña ukax pachpa jistʼari." },
    shp: { title: "Wai jene automatico", short: "Jisma sensores papa, sara, kinwa jene jakon yamake.", long: "Mia jema yanaibo jene sistema bewa, mai jakon pachpa jiska." },
  },
  tierras: {
    es: { title: "Alquiler de tierras digital", short: "Publica tus parcelas, recibe pagos seguros y lleva un registro claro.", long: "Mostramos cómo poner tu tierra en plataformas confiables, redactar contratos sencillos y cobrar por Yape, Plin o transferencia, sin perder dinero." },
    qu: { title: "Allpa qhatuy red-pi", short: "Allpaykita rikuchiy, qullqita allinta chaskiy, sumaq qillqay.", long: "Allpaykita confianza platformakunapi churay, contratokunata ruway, Yape, Plin nisqakunapi chaskiy." },
    ay: { title: "Uraqi alquilaña internetana", short: "Uraqima uñstayaña, qullqi suma katuqaña, qhana qillqaña.", long: "Uraqima confiansa platformanakana uñstayaña, contratonak luraña, Yape, Plin chasqaña." },
    shp: { title: "Mai banai internet", short: "Mia mai oinmati, koriki bewa, shinai qillqai.", long: "Mia mai jakon platforma bewa, contrato bewa, Yape, Plin koriki." },
  },
  textiles: {
    es: { title: "Venta de textiles por internet", short: "Toma fotos, pon precio justo y vende tus tejidos a la ciudad.", long: "Aprende a fotografiar tus mantas, chullos y tapices, escribir descripciones que se entiendan y publicar en marketplaces nacionales sin caer en estafas." },
    qu: { title: "Away qhatuy internet-pi", short: "Foto ruway, chanin chaninchay, awasqakunata llaqtaman qhatuy.", long: "Lliqlla, chullo, tapizniykipa foton ruway, willakuyta qillqay, marketplacekunapi rikuchiy." },
    ay: { title: "Sawu aljaña internetana", short: "Foto luram, suma chani churam, sawunak markaru aljaña.", long: "Lliqlla, chullu, tapiz fotonak luram, qhanañchaw qillqam, marketplacenakana uñachayaña." },
    shp: { title: "Kené aljaña internet", short: "Foto bewa, jakon chani, kené jema banaibo.", long: "Lliqlla, chullo, tapiz foto bewa, joi qillqai, marketplace oinmati." },
  },
  solar: {
    es: { title: "Energía solar para la casa", short: "Instala un panel solar pequeño para iluminar y cargar el celular.", long: "Curso práctico para instalar paneles solares de bajo costo, conectar baterías y proteger tus equipos. Pensado para zonas sin red eléctrica estable." },
    qu: { title: "Inti kallpa wasipaq", short: "Pisi inti panelta churay, k'anchanapaq, celular cargaqkunapaq.", long: "Pisi qullqillapi inti panelkunata churay, bateriakunata tinkichiy, equipoykita amachay." },
    ay: { title: "Inti ch'amani utataki", short: "Jisk'a inti panel apsuña, k'anchañataki, celular cargañataki.", long: "Pisi chaniyat inti panelanaka apsuña, bateriyanak tinkuyaña, equiponak jark'aña." },
    shp: { title: "Bari kané xobotaki", short: "Jisma bari panel jakon, oinai, celular cargai.", long: "Jisma koriki bari panel bewa, bateria tinkui, equipo jakon shinai." },
  },
  clima: {
    es: { title: "Lectura del clima andino", short: "Usa apps gratuitas para saber cuándo va a llover o helar.", long: "Combina las señales del cielo (mama Pacha) con apps confiables del Senamhi para decidir cuándo sembrar, cosechar o proteger al ganado de la helada." },
    qu: { title: "Andina pacha qhaway", short: "Mana qullqipi apps haqay paramunqachu chiri kanqachu yachanapaq.", long: "Hanaq pacha unanchakunawan Senamhi apps tinkichiy, tarpunaykipaq, cosechanaykipaq." },
    ay: { title: "Andina pacha liyaña", short: "Inaki apps apnaqaña jallu jan ukax ch'uxña pacha yatiyañataki.", long: "Alaxpacha unanchanakampi Senamhi appsanak chika apnaqaña, satañ, llamayuñ, uywanak jark'añataki." },
    shp: { title: "Andes niwe oinai", short: "Yamake apps bewa, oun o niwe joneki shinai.", long: "Nai niwe shinai Senamhi apps tinkui, banai, oinai, yoyo jakon shinai." },
  },
  finanzas: {
    es: { title: "Cuentas claras de la chacra", short: "Lleva tus ingresos y gastos con plantillas simples en el celular.", long: "Aprende a anotar lo que vendes, lo que gastas en semilla y lo que ganas. Te enseñamos a ahorrar y acceder a microcréditos formales." },
    qu: { title: "Chakra qullqi sumaq qillqay", short: "Qhatusqaykita, gastasqaykita celularpi pisi plantillawan qillqay.", long: "Qhatusqaykita, muhupi gastasqaykita, gananciaykitapas qillqay. Microcreditokunapaq yachay." },
    ay: { title: "Yapu qullqi qhana jakhuwi", short: "Alxata, gastata celularan jisk'a plantillampi qillqaña.", long: "Alxata, jathana gasta, qullqi katuqata qillqaña. Microcrédito jikxatañ yatiqaña." },
    shp: { title: "Wai koriki shinai", short: "Mia banai, koriki jakon celular jisma plantilla.", long: "Mia banai, jath koriki, koriki katai qillqai. Microcredito bewa onanti." },
  },
  basico: {
    es: { title: "Primeros pasos con la computadora", short: "Encender, escribir, buscar y cuidarse de estafas en internet.", long: "Para personas que nunca usaron computadora. Vamos paso a paso: encender, mover el mouse, escribir, buscar en internet y reconocer mensajes engañosos." },
    qu: { title: "Computadorawan ñawpaq purikuy", short: "Kichay, qillqay, maskay, internetpi q'utukunamanta amachakuy.", long: "Manaraq computadorata apaykachaqkunapaq. Sapa kuti: kichay, mouse kuyuchiy, qillqay, internetpi maskay." },
    ay: { title: "Computadora apnaqañ nayrïr sarawi", short: "Jistʼaräña, qillqaña, thaqaña, internetana q'utuwinaka jark'asiñ.", long: "Computadora jan apnaqirinakataki. Jakhuwi: jistʼaräña, mouse kuyuyaña, qillqaña, internetan thaqaña." },
    shp: { title: "Beno onanti computadora", short: "Jiska, qillqai, oinai, internet q'utu jakon shinai.", long: "Computadora yamake jonibo. Jakon: jiska, mouse kuyui, qillqai, internet oinai." },
  },
};

export const CATEGORY_TR: Record<string, { label: string; desc: string }> = {
  // keys 'campo','negocio','tecnologia','energia' map to translation keys
  campo_label_key: { label: "catCampoLabel", desc: "catCampoDesc" },
  negocio_label_key: { label: "catNegocioLabel", desc: "catNegocioDesc" },
  tecnologia_label_key: { label: "catTecnologiaLabel", desc: "catTecnologiaDesc" },
  energia_label_key: { label: "catEnergiaLabel", desc: "catEnergiaDesc" },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: (key: keyof typeof t) => string;
  trCourse: (id: string, field: keyof CourseI18n) => string;
  trCategory: (cat: "campo" | "negocio" | "tecnologia" | "energia", field: "label" | "desc") => string;
  trLevel: (lvl: "Inicial" | "Intermedio" | "Avanzado") => string;
  trDuration: (d: string) => string;
};
const I18nCtx = createContext<Ctx | null>(null);

const VALID: Lang[] = ["es", "qu", "ay", "shp"];

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("allinyachay.lang") as Lang | null;
      if (saved && VALID.includes(saved)) setLangState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("allinyachay.lang", l);
    } catch {
      /* ignore */
    }
  };
  const tr = (key: keyof typeof t) => t[key]?.[lang] ?? t[key]?.es ?? String(key);
  const trCourse = (id: string, field: keyof CourseI18n) =>
    COURSE_TR[id]?.[lang]?.[field] ?? COURSE_TR[id]?.es?.[field] ?? "";
  const trCategory = (cat: "campo" | "negocio" | "tecnologia" | "energia", field: "label" | "desc") => {
    const key = (field === "label"
      ? `cat${cat[0].toUpperCase() + cat.slice(1)}Label`
      : `cat${cat[0].toUpperCase() + cat.slice(1)}Desc`) as keyof typeof t;
    return tr(key);
  };
  const trLevel = (lvl: "Inicial" | "Intermedio" | "Avanzado") => {
    const key = (lvl === "Inicial" ? "levelInicial" : lvl === "Intermedio" ? "levelIntermedio" : "levelAvanzado") as keyof typeof t;
    return tr(key);
  };
  // Translate "N semanas" / "N semana" duration strings.
  const trDuration = (d: string) => {
    const m = d.match(/^(\d+)\s+semanas?$/i);
    if (!m) return d;
    const n = parseInt(m[1], 10);
    return `${n} ${n === 1 ? tr("weekUnit") : tr("weeksUnit")}`;
  };

  return (
    <I18nCtx.Provider value={{ lang, setLang, tr, trCourse, trCategory, trLevel, trDuration }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
