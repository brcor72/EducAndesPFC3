import courseGanaderia from "@/assets/course-ganaderia.jpg";
import courseCultivo from "@/assets/course-cultivo.jpg";
import courseTierras from "@/assets/course-tierras.jpg";
import courseTextiles from "@/assets/course-textiles.jpg";
import courseSolar from "@/assets/course-solar.jpg";
import courseWeather from "@/assets/course-weather.jpg";
import courseFinance from "@/assets/course-finance.jpg";
import courseBasics from "@/assets/course-basics.jpg";
import {
  Tractor,
  Sprout,
  MapPin,
  Scissors,
  Sun,
  CloudRain,
  Coins,
  Monitor,
  type LucideIcon,
} from "lucide-react";

export type CourseCategory = "campo" | "negocio" | "tecnologia" | "energia";

export const CATEGORY_META: Record<
  CourseCategory,
  { label: string; desc: string; tone: string }
> = {
  campo: {
    label: "Vida en el campo",
    desc: "Ganadería, cultivo y clima para tu chacra.",
    tone: "bg-puna text-puna-foreground",
  },
  negocio: {
    label: "Negocio y dinero",
    desc: "Vende tus productos y lleva cuentas claras.",
    tone: "bg-sun text-sun-foreground",
  },
  tecnologia: {
    label: "Primeros pasos digitales",
    desc: "Aprende a usar la computadora y el celular.",
    tone: "bg-primary text-primary-foreground",
  },
  energia: {
    label: "Energía y recursos",
    desc: "Energía solar y manejo del agua.",
    tone: "bg-earth text-earth-foreground",
  },
};

export type Course = {
  id: string;
  title: string;
  short: string;
  long: string;
  image: string;
  icon: LucideIcon;
  level: "Inicial" | "Intermedio" | "Avanzado";
  duration: string;
  tone: string;
  category: CourseCategory;
};

export const COURSES: Course[] = [
  {
    id: "ganaderia",
    title: "Ganadería inteligente",
    short:
      "Registra llamas y alpacas en tu celular: salud, vacunas, crías y peso.",
    long: "Aprende a llevar un cuaderno digital de tu rebaño. Te enseñamos a anotar vacunas, controlar el peso y predecir las pariciones, todo con tu celular o una tableta del laboratorio comunal.",
    image: courseGanaderia,
    icon: Tractor,
    level: "Inicial",
    duration: "4 semanas",
    tone: "bg-primary text-primary-foreground",
    category: "campo",
  },
  {
    id: "cultivo",
    title: "Cultivo y riego automático",
    short: "Sensores simples para regar papa, maíz y quinua sin desperdiciar agua.",
    long: "Construye con materiales locales un sistema de riego que se enciende solo cuando la tierra está seca. Ideal para parcelas pequeñas y medianas.",
    image: courseCultivo,
    icon: Sprout,
    level: "Intermedio",
    duration: "6 semanas",
    tone: "bg-puna text-puna-foreground",
    category: "campo",
  },
  {
    id: "tierras",
    title: "Alquiler de tierras digital",
    short: "Publica tus parcelas, recibe pagos seguros y lleva un registro claro.",
    long: "Mostramos cómo poner tu tierra en plataformas confiables, redactar contratos sencillos y cobrar por Yape, Plin o transferencia, sin perder dinero.",
    image: courseTierras,
    icon: MapPin,
    level: "Inicial",
    duration: "3 semanas",
    tone: "bg-sun text-sun-foreground",
    category: "negocio",
  },
  {
    id: "textiles",
    title: "Venta de textiles por internet",
    short: "Toma fotos, pon precio justo y vende tus tejidos a la ciudad.",
    long: "Aprende a fotografiar tus mantas, chullos y tapices, escribir descripciones que se entiendan y publicar en marketplaces nacionales sin caer en estafas.",
    image: courseTextiles,
    icon: Scissors,
    level: "Inicial",
    duration: "4 semanas",
    tone: "bg-accent text-accent-foreground",
    category: "negocio",
  },
  {
    id: "solar",
    title: "Energía solar para la casa",
    short: "Instala un panel solar pequeño para iluminar y cargar el celular.",
    long: "Curso práctico para instalar paneles solares de bajo costo, conectar baterías y proteger tus equipos. Pensado para zonas sin red eléctrica estable.",
    image: courseSolar,
    icon: Sun,
    level: "Intermedio",
    duration: "5 semanas",
    tone: "bg-sun text-sun-foreground",
    category: "energia",
  },
  {
    id: "clima",
    title: "Lectura del clima andino",
    short: "Usa apps gratuitas para saber cuándo va a llover o helar.",
    long: "Combina las señales del cielo (mama Pacha) con apps confiables del Senamhi para decidir cuándo sembrar, cosechar o proteger al ganado de la helada.",
    image: courseWeather,
    icon: CloudRain,
    level: "Inicial",
    duration: "2 semanas",
    tone: "bg-sky text-sky-foreground",
    category: "campo",
  },
  {
    id: "finanzas",
    title: "Cuentas claras de la chacra",
    short: "Lleva tus ingresos y gastos con plantillas simples en el celular.",
    long: "Aprende a anotar lo que vendes, lo que gastas en semilla y lo que ganas. Te enseñamos a ahorrar y acceder a microcréditos formales.",
    image: courseFinance,
    icon: Coins,
    level: "Inicial",
    duration: "3 semanas",
    tone: "bg-earth text-earth-foreground",
    category: "negocio",
  },
  {
    id: "basico",
    title: "Primeros pasos con la computadora",
    short: "Encender, escribir, buscar y cuidarse de estafas en internet.",
    long: "Para personas que nunca usaron computadora. Vamos paso a paso: encender, mover el mouse, escribir, buscar en internet y reconocer mensajes engañosos.",
    image: courseBasics,
    icon: Monitor,
    level: "Inicial",
    duration: "4 semanas",
    tone: "bg-primary text-primary-foreground",
    category: "tecnologia",
  },
];

export const getCourse = (id: string) => COURSES.find((c) => c.id === id);
