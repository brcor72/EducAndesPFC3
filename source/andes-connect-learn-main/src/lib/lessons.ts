// Plan de clases por curso. Cada curso tiene 12 clases (= lessons_total por
// defecto en course_progress). Cada clase incluye una breve descripción, un
// mini cuestionario de 2-3 preguntas y, en los puntos medios y final, un
// "caso práctico" de mayor dificultad para aplicar lo aprendido.

export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number; // index de la opción correcta
};

export type PracticeCase = {
  title: string;
  scenario: string;
  hint: string;
};

export type Lesson = {
  index: number; // 1-based
  title: string;
  summary: string;
  detail: string;
  quiz: QuizQuestion[];
  practice?: PracticeCase; // sólo en mitad y final del curso
};

const TOTAL_LESSONS = 12;

/* Helpers para construir cuestionarios consistentes y simples */
const baseQuiz = (
  topic: string,
  correctIdea: string,
  wrong1: string,
  wrong2: string,
): QuizQuestion[] => [
  {
    q: `¿Para qué sirve principalmente la clase de "${topic}"?`,
    options: [correctIdea, wrong1, wrong2],
    answer: 0,
  },
  {
    q: `¿Cuál de estas opciones describe mejor "${topic}"?`,
    options: [wrong1, correctIdea, wrong2],
    answer: 1,
  },
  {
    q: `Si tu vecino te pregunta sobre "${topic}", ¿qué le dirías?`,
    options: [wrong2, wrong1, correctIdea],
    answer: 2,
  },
];

/* Plan base reutilizable: cada curso lo personaliza con su contexto */
type CoursePlan = {
  themes: { title: string; summary: string; detail: string; key: string }[];
  midCase: PracticeCase;
  finalCase: PracticeCase;
  distractors: [string, string];
};

const PLANS: Record<string, CoursePlan> = {
  ganaderia: {
    distractors: [
      "Aumentar el precio de la lana sin medir nada.",
      "Vender los animales sin registro alguno.",
    ],
    themes: [
      { key: "Bienvenida y por qué digitalizar el rebaño", title: "Bienvenida al curso", summary: "Por qué llevar un registro digital de tu rebaño cambia tu economía.", detail: "Conocemos el curso, la app del laboratorio y armamos un cuaderno digital sencillo para llamas y alpacas." },
      { key: "Identificación de animales", title: "Identificar a cada animal", summary: "Aretes, fotos y nombres para no confundir crías ni adultos.", detail: "Aprenderás a fotografiar, numerar y registrar cada animal con su edad, color y madre." },
      { key: "Control de salud y vacunas", title: "Salud y vacunas", summary: "Calendario de vacunas y signos de enfermedad comunes.", detail: "Revisamos las enfermedades más frecuentes en la sierra y armamos el calendario sanitario del rebaño." },
      { key: "Control de peso y alimentación", title: "Peso y alimentación", summary: "Cómo pesar sin balanza cara y qué pastos rinden mejor.", detail: "Métodos prácticos para estimar peso con cinta métrica y registrar el aumento mes a mes." },
      { key: "Reproducción y pariciones", title: "Reproducción y pariciones", summary: "Predecir partos y cuidar a las crías recién nacidas.", detail: "Calculamos fechas probables de parto y preparamos el espacio limpio para las crías." },
      { key: "Producción de fibra y leche", title: "Fibra y leche", summary: "Mide cuánta fibra y leche produce cada animal.", detail: "Registramos producciones individuales para identificar a tus mejores animales." },
      { key: "Control de pastos y rotación", title: "Manejo de pastos", summary: "Rotar el pastoreo para que la puna se recupere.", detail: "Diseñamos un plan simple de rotación con un mapa dibujado de tus canchas." },
      { key: "Costos y precios de venta", title: "Costos y precios", summary: "Cuánto cuesta criar un animal y cuánto cobrar por él.", detail: "Calculamos el costo real por animal y lo comparamos con el precio de mercado." },
      { key: "Venta a acopiadores y ferias", title: "Vender mejor", summary: "Cómo negociar con acopiadores y aprovechar ferias regionales.", detail: "Estrategias para no aceptar el primer precio y para vender en grupo con la comunidad." },
      { key: "Uso de WhatsApp para clientes", title: "WhatsApp para clientes", summary: "Crea un catálogo simple para tus compradores en la ciudad.", detail: "Tomamos buenas fotos y armamos un mensaje breve para enviar a clientes recurrentes." },
      { key: "Crisis: heladas y enfermedades", title: "Heladas y emergencias", summary: "Plan de acción cuando hay helada o enfermedad masiva.", detail: "Cómo proteger crías ante heladas y aislar animales enfermos rápidamente." },
      { key: "Cierre: mi plan ganadero", title: "Mi plan ganadero", summary: "Construimos juntos tu plan de manejo del próximo año.", detail: "Repasamos todo y dejas escrito tu propio plan anual con metas claras." },
    ],
    midCase: {
      title: "Caso: alpaca enferma en la madrugada",
      scenario: "Una alpaca adulta amanece sin querer comer y con la lana erizada. Tienes 30 alpacas más en la misma cancha. Usa lo aprendido en las clases 1 a 6 para decidir qué hacer en las próximas 4 horas.",
      hint: "Piensa en aislamiento, registro del caso, signos visibles y cuándo llamar al técnico veterinario.",
    },
    finalCase: {
      title: "Caso final: planifica tu campaña anual",
      scenario: "Tienes 80 alpacas, 20 llamas y dos canchas de pastos. Diseña tu calendario de vacunas, esquila, rotación de pastos y meta de venta para el próximo año.",
      hint: "Combina manejo sanitario, rotación de pastos, precios de fibra y un objetivo de ingreso.",
    },
  },
  cultivo: {
    distractors: [
      "Regar siempre todos los días sin medir.",
      "Sembrar cualquier semilla sin mirar el clima.",
    ],
    themes: [
      { key: "Bienvenida al riego inteligente", title: "Bienvenida", summary: "Qué es la automatización aplicada a tu chacra.", detail: "Veremos ejemplos reales de chacras que ahorran agua con sensores baratos." },
      { key: "Tipos de suelo y necesidad de agua", title: "Suelo y agua", summary: "Aprende a reconocer si tu tierra necesita agua o no.", detail: "Pruebas simples con la mano y un palito para medir humedad sin equipos caros." },
      { key: "Sensor de humedad casero", title: "Sensor de humedad", summary: "Construye un sensor simple con materiales locales.", detail: "Paso a paso para armar un sensor capacitivo barato que dura toda la campaña." },
      { key: "Sistema de riego por goteo", title: "Riego por goteo", summary: "Diseño básico de tuberías y goteros.", detail: "Calculamos cuántos metros de manguera y cuántos goteros necesita tu parcela." },
      { key: "Energía para el sistema (panel pequeño)", title: "Energía solar mínima", summary: "Un panelito y una batería para la bomba.", detail: "Cómo dimensionar un sistema solar pequeño que mueva tu bomba de riego." },
      { key: "Programación del riego automático", title: "Programación", summary: "Define horarios y reglas según la humedad medida.", detail: "Reglas sencillas: si la humedad baja del 30%, regar 10 minutos." },
      { key: "Calendario de cultivos andinos", title: "Calendario andino", summary: "Papa, maíz, quinua: cuándo sembrar en la sierra.", detail: "Armamos un calendario por piso ecológico y producto." },
      { key: "Control de plagas y enfermedades", title: "Plagas", summary: "Identifica gusanos y hongos comunes en la sierra.", detail: "Métodos orgánicos y de bajo costo, evitando agroquímicos peligrosos." },
      { key: "Cosecha y poscosecha", title: "Cosecha", summary: "Cuándo cosechar y cómo guardar bien.", detail: "Errores comunes en almacenamiento que pierden hasta el 30% de la cosecha." },
      { key: "Venta a mercados regionales", title: "Vender la cosecha", summary: "Cómo llevar tu cosecha al mejor precio.", detail: "Comparamos venta directa, intermediario y cooperativa." },
      { key: "Riesgos: sequía y helada", title: "Sequía y helada", summary: "Plan de contingencia ante eventos extremos.", detail: "Protección con humo, mantas, riego nocturno: qué funciona y qué no." },
      { key: "Cierre: mi parcela automatizada", title: "Mi parcela", summary: "Diseño final de tu parcela automatizada.", detail: "Dejas listo el plano, la lista de materiales y la ruta de instalación." },
    ],
    midCase: {
      title: "Caso: parcela de 1 hectárea de papa",
      scenario: "Tienes 1 hectárea de papa nativa en una ladera. Diseña con lo aprendido en las clases 1 a 6 un sistema de riego por goteo con sensor de humedad y panel solar pequeño.",
      hint: "Piensa en la pendiente, la cantidad de goteros y la programación.",
    },
    finalCase: {
      title: "Caso final: chacra mixta de la familia",
      scenario: "Tu familia maneja papa, maíz y quinua en parcelas distintas. Crea un plan completo de riego, cosecha y venta para una campaña entera.",
      hint: "Cada cultivo tiene calendario y cliente diferente.",
    },
  },
  tierras: {
    distractors: [
      "Alquilar sin contrato y por confianza.",
      "Cobrar siempre en efectivo sin recibo.",
    ],
    themes: [
      { key: "Bienvenida al alquiler digital", title: "Bienvenida", summary: "Por qué publicar tu parcela protege tus derechos.", detail: "Vemos casos reales de pérdida de tierras por mal manejo de contratos." },
      { key: "Documentar mi tierra", title: "Documentos básicos", summary: "Qué papeles necesitas para alquilar tu parcela.", detail: "Título, plano, constancia comunal: dónde sacarlos y cuánto demoran." },
      { key: "Tomar fotos profesionales", title: "Fotos para anuncios", summary: "Cómo mostrar tu parcela con buenas fotos.", detail: "Ángulos, hora del día y aplicaciones gratuitas para mejorar imágenes." },
      { key: "Escribir una descripción honesta", title: "Descripción del anuncio", summary: "Texto claro sin promesas falsas.", detail: "Plantilla con tamaño, acceso al agua, vías y servicios cercanos." },
      { key: "Plataformas confiables", title: "Dónde publicar", summary: "Marketplaces y redes seguras para alquilar.", detail: "Comparamos plataformas y evitamos páginas con muchas estafas." },
      { key: "Precio justo del alquiler", title: "Poner el precio", summary: "Cómo calcular un precio justo y competitivo.", detail: "Mira precios similares de tu zona y ajusta por servicios incluidos." },
      { key: "Contrato simple y claro", title: "Contrato simple", summary: "Modelo de contrato corto pero efectivo.", detail: "Plantilla descargable con plazos, pagos y obligaciones de ambas partes." },
      { key: "Cobro por Yape, Plin y banco", title: "Cobros digitales", summary: "Recibe pagos sin viajar a la ciudad.", detail: "Configuramos tu Yape/Plin de forma segura y aprendemos a verificar pagos." },
      { key: "Registro de inquilinos", title: "Cuaderno de inquilinos", summary: "Lleva un registro digital de quién está en tu tierra.", detail: "Ficha por inquilino con foto del DNI y firma del contrato." },
      { key: "Resolver problemas y conflictos", title: "Conflictos", summary: "Qué hacer si el inquilino no paga o no cuida.", detail: "Pasos legales y comunales para recuperar tu parcela sin violencia." },
      { key: "Impuestos y formalización", title: "Impuestos básicos", summary: "Qué declarar y qué no.", detail: "Conceptos básicos de RUS/RER aplicables al alquiler rural." },
      { key: "Cierre: mi negocio de alquiler", title: "Mi negocio", summary: "Plan completo para alquilar tus parcelas durante el año.", detail: "Calendario de alquileres, precios y metas de ingreso anual." },
    ],
    midCase: {
      title: "Caso: candidato sospechoso",
      scenario: "Un señor de la ciudad quiere alquilar 2 hectáreas por 5 años pero no quiere firmar contrato escrito. Decide qué hacer aplicando lo aprendido en las clases 1 a 6.",
      hint: "Piensa en riesgos legales, evidencia y cobros.",
    },
    finalCase: {
      title: "Caso final: cartera de 3 parcelas",
      scenario: "Tienes 3 parcelas de tamaños distintos en la comunidad. Define precios, anuncios, plataformas y contratos para alquilarlas todas en 2 meses.",
      hint: "Cada parcela puede ir a un cliente distinto: ganadero, agricultor o turismo rural.",
    },
  },
};

/* Plan genérico para cursos sin plan dedicado: replica la estructura */
function genericPlan(courseTitle: string): CoursePlan {
  const base = `Avanzaremos paso a paso en "${courseTitle}".`;
  return {
    distractors: [
      "Hacer las cosas sin planificar nada.",
      "Copiar lo que hace el vecino sin entender.",
    ],
    themes: Array.from({ length: TOTAL_LESSONS }, (_, i) => ({
      key: `Clase ${i + 1} de ${courseTitle}`,
      title: `Clase ${i + 1}`,
      summary: `${base} Tema ${i + 1} con ejemplos prácticos de la sierra.`,
      detail: `En esta clase trabajamos el tema ${i + 1} del curso "${courseTitle}". Combinamos teoría breve, ejemplos locales, una práctica guiada y un cuestionario corto al final para confirmar lo aprendido.`,
    })),
    midCase: {
      title: `Caso intermedio de ${courseTitle}`,
      scenario: `Aplica lo aprendido en las primeras 6 clases del curso "${courseTitle}" a una situación real de tu comunidad. Documenta tus decisiones paso a paso.`,
      hint: "Usa lo visto en clases 1 a 6 y justifica cada decisión.",
    },
    finalCase: {
      title: `Caso final de ${courseTitle}`,
      scenario: `Diseña una propuesta completa que integre todo lo aprendido en el curso "${courseTitle}" para mejorar la vida en tu chacra durante el próximo año.`,
      hint: "Conecta todas las clases del curso en un único plan de acción.",
    },
  };
}

export function getLessonsForCourse(courseId: string, courseTitle: string): Lesson[] {
  const plan = PLANS[courseId] ?? genericPlan(courseTitle);
  const mid = Math.ceil(TOTAL_LESSONS / 2); // clase 6
  const last = TOTAL_LESSONS; // clase 12
  return plan.themes.slice(0, TOTAL_LESSONS).map((th, idx) => {
    const i = idx + 1;
    const lesson: Lesson = {
      index: i,
      title: `${i}. ${th.title}`,
      summary: th.summary,
      detail: th.detail,
      quiz: baseQuiz(th.key, th.summary, plan.distractors[0], plan.distractors[1]),
    };
    if (i === mid) lesson.practice = plan.midCase;
    if (i === last) lesson.practice = plan.finalCase;
    return lesson;
  });
}

export const LESSONS_PER_COURSE = TOTAL_LESSONS;
