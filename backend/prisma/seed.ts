import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de EducAndes...\n');

  // ── Roles ─────────────────────────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: { name: 'admin', description: 'Administrador del sistema con acceso total' },
    }),
    prisma.role.upsert({
      where: { name: 'docente' },
      update: {},
      create: { name: 'docente', description: 'Docente que puede gestionar cursos y contenido' },
    }),
    prisma.role.upsert({
      where: { name: 'estudiante' },
      update: {},
      create: { name: 'estudiante', description: 'Estudiante que accede a cursos y foros' },
    }),
  ]);
  console.log('✅ Roles creados:', roles.map((r) => r.name).join(', '));

  // ── Permissions ───────────────────────────────────────────────────────────
  const permDefs = [
    { resource: 'users', action: 'create' }, { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' }, { resource: 'users', action: 'delete' },
    { resource: 'courses', action: 'create' }, { resource: 'courses', action: 'read' },
    { resource: 'courses', action: 'update' }, { resource: 'courses', action: 'delete' },
    { resource: 'lessons', action: 'create' }, { resource: 'lessons', action: 'read' },
    { resource: 'lessons', action: 'update' }, { resource: 'lessons', action: 'delete' },
    { resource: 'forums', action: 'create' }, { resource: 'forums', action: 'read' },
    { resource: 'forums', action: 'update' }, { resource: 'forums', action: 'delete' },
    { resource: 'audit', action: 'read' },
    { resource: 'dashboard', action: 'read' },
  ];

  const perms = await Promise.all(
    permDefs.map((p) =>
      prisma.permission.upsert({
        where: { resource_action: p },
        update: {},
        create: p,
      }),
    ),
  );
  console.log('✅ Permisos creados:', perms.length);

  // Assign all permissions to admin
  const adminRole = roles.find((r) => r.name === 'admin')!;
  const docenteRole = roles.find((r) => r.name === 'docente')!;

  await Promise.all(
    perms.map((p) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: p.id },
      }),
    ),
  );

  // Docente: courses CRUD + lessons CRUD + forums read + dashboard read
  const docentePerms = perms.filter((p) =>
    ['courses', 'lessons', 'forums'].includes(p.resource) ||
    (p.resource === 'dashboard' && p.action === 'read'),
  );
  await Promise.all(
    docentePerms.map((p) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: docenteRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: docenteRole.id, permissionId: p.id },
      }),
    ),
  );
  console.log('✅ Permisos asignados a roles');

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin2025!', 12);
  const demoHash = await bcrypt.hash('andes2025', 12);
  const docenteHash = await bcrypt.hash('Docente2025!', 12);

  const [adminUser, demoUser, docenteUser] = await Promise.all([
    prisma.user.upsert({
      where: { dni: '00000001' },
      update: {},
      create: {
        dni: '00000001', displayName: 'Administrador Sistema',
        community: 'EducAndes HQ', passwordHash: adminHash,
        preferredLang: 'es', roleId: adminRole.id,
      },
    }),
    prisma.user.upsert({
      where: { dni: '12345678' },
      update: {},
      create: {
        dni: '12345678', displayName: 'María Quispe Demo',
        community: 'Puno - Azángaro', passwordHash: demoHash,
        preferredLang: 'qu', roleId: roles.find((r) => r.name === 'estudiante')!.id,
      },
    }),
    prisma.user.upsert({
      where: { dni: '87654321' },
      update: {},
      create: {
        dni: '87654321', displayName: 'Prof. Carlos Mamani',
        community: 'Cusco', passwordHash: docenteHash,
        preferredLang: 'es', roleId: docenteRole.id,
      },
    }),
  ]);
  console.log('✅ Usuarios creados:', [adminUser, demoUser, docenteUser].map((u) => u.displayName).join(', '));

  // ── Courses ───────────────────────────────────────────────────────────────
  const coursesData = [
    {
      slug: 'ganaderia', title: 'Ganadería inteligente', titleQu: 'Uywakuna yachay',
      short: 'Registra llamas y alpacas en tu celular: salud, vacunas, crías y peso.',
      long: 'Aprende a llevar un cuaderno digital de tu rebaño. Te enseñamos a anotar vacunas, controlar el peso y predecir las pariciones, todo con tu celular o una tableta del laboratorio comunal.',
      level: 'INICIAL' as const, durationWeeks: 4, category: 'CAMPO' as const,
      iconName: 'Tractor', isPublished: true, sortOrder: 1,
      imageUrl: 'https://images.unsplash.com/photo-1541971875076-8f970d573be6?w=800',
    },
    {
      slug: 'cultivo', title: 'Cultivo y riego automático', titleQu: 'Tarpuy yachay',
      short: 'Sensores simples para regar papa, maíz y quinua sin desperdiciar agua.',
      long: 'Construye con materiales locales un sistema de riego que se enciende solo cuando la tierra está seca. Ideal para parcelas pequeñas y medianas.',
      level: 'INTERMEDIO' as const, durationWeeks: 6, category: 'CAMPO' as const,
      iconName: 'Sprout', isPublished: true, sortOrder: 2,
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    },
    {
      slug: 'tierras', title: 'Alquiler de tierras digital',
      short: 'Publica tus parcelas, recibe pagos seguros y lleva un registro claro.',
      long: 'Mostramos cómo poner tu tierra en plataformas confiables, redactar contratos sencillos y cobrar por Yape, Plin o transferencia, sin perder dinero.',
      level: 'INICIAL' as const, durationWeeks: 3, category: 'NEGOCIO' as const,
      iconName: 'MapPin', isPublished: true, sortOrder: 3,
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    },
    {
      slug: 'textiles', title: 'Venta de textiles por internet',
      short: 'Toma fotos, pon precio justo y vende tus tejidos a la ciudad.',
      long: 'Aprende a fotografiar tus mantas, chullos y tapices, escribir descripciones que se entiendan y publicar en marketplaces nacionales sin caer en estafas.',
      level: 'INICIAL' as const, durationWeeks: 4, category: 'NEGOCIO' as const,
      iconName: 'Scissors', isPublished: true, sortOrder: 4,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    },
    {
      slug: 'solar', title: 'Energía solar para la casa',
      short: 'Instala un panel solar pequeño para iluminar y cargar el celular.',
      long: 'Curso práctico para instalar paneles solares de bajo costo, conectar baterías y proteger tus equipos. Pensado para zonas sin red eléctrica estable.',
      level: 'INTERMEDIO' as const, durationWeeks: 5, category: 'ENERGIA' as const,
      iconName: 'Sun', isPublished: true, sortOrder: 5,
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
    },
    {
      slug: 'clima', title: 'Lectura del clima andino',
      short: 'Usa apps gratuitas para saber cuándo va a llover o helar.',
      long: 'Combina las señales del cielo con apps confiables del Senamhi para decidir cuándo sembrar, cosechar o proteger al ganado de la helada.',
      level: 'INICIAL' as const, durationWeeks: 2, category: 'CAMPO' as const,
      iconName: 'CloudRain', isPublished: true, sortOrder: 6,
      imageUrl: 'https://images.unsplash.com/photo-1504608524841-42584120d693?w=800',
    },
    {
      slug: 'finanzas', title: 'Cuentas claras de la chacra',
      short: 'Lleva tus ingresos y gastos con plantillas simples en el celular.',
      long: 'Aprende a anotar lo que vendes, lo que gastas en semilla y lo que ganas. Te enseñamos a ahorrar y acceder a microcréditos formales.',
      level: 'INICIAL' as const, durationWeeks: 3, category: 'NEGOCIO' as const,
      iconName: 'Coins', isPublished: true, sortOrder: 7,
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    },
    {
      slug: 'basico', title: 'Primeros pasos con la computadora',
      short: 'Encender, escribir, buscar y cuidarse de estafas en internet.',
      long: 'Para personas que nunca usaron computadora. Vamos paso a paso: encender, mover el mouse, escribir, buscar en internet y reconocer mensajes engañosos.',
      level: 'INICIAL' as const, durationWeeks: 4, category: 'TECNOLOGIA' as const,
      iconName: 'Monitor', isPublished: true, sortOrder: 8,
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    },
    // ── Cursos adicionales de vida alto andina ────────────────────────────────
    {
      slug: 'tejido', title: 'Tejido andino y bordado',
      short: 'Recupera y vende tus tejidos tradicionales con valor cultural y precio justo.',
      long: 'Aprende a documentar tus tejidos con fotos de calidad, calcular el precio justo considerando horas de trabajo, y venderlos en mercados digitales y ferias locales. Incluye técnicas de bordado quechua y aymaras.',
      level: 'INICIAL' as const, durationWeeks: 4, category: 'NEGOCIO' as const,
      iconName: 'Scissors2', isPublished: true, sortOrder: 9,
      imageUrl: 'https://images.unsplash.com/photo-1558171813-c62a7e16e0f3?w=800',
    },
    {
      slug: 'cuyes', title: 'Crianza de cuyes y gallinas',
      short: 'Mejora la salud y el rendimiento de tus cuyes y gallinas con técnicas simples.',
      long: 'Guía práctica para criar cuyes y gallinas en el altiplano: alimentación balanceada con recursos locales, control de enfermedades comunes, registro de producción y cómo vender en mercados locales con mejores precios.',
      level: 'INICIAL' as const, durationWeeks: 3, category: 'CAMPO' as const,
      iconName: 'Leaf', isPublished: true, sortOrder: 10,
      imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800',
    },
    {
      slug: 'plantas', title: 'Plantas medicinales andinas',
      short: 'Identifica, cultiva y usa las plantas medicinales de tu comunidad.',
      long: 'Conoce las plantas medicinales del ande: muña, maca, hercampuri, uña de gato, y más. Aprende a cultivarlas, prepararlas para uso familiar y cómo registrar y vender preparados naturales de forma responsable.',
      level: 'INICIAL' as const, durationWeeks: 3, category: 'CAMPO' as const,
      iconName: 'Leaf', isPublished: true, sortOrder: 11,
      imageUrl: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=800',
    },
    {
      slug: 'cocina', title: 'Cocina andina saludable',
      short: 'Prepara platos nutritivos con quinua, chuño, papa y productos locales.',
      long: 'Redescubre la riqueza nutritiva de los alimentos andinos: quinua, cañihua, maca, chuño, papa nativa y más. Aprende recetas nutritivas, técnicas de conservación tradicional y cómo emprender vendiendo comida saludable.',
      level: 'INICIAL' as const, durationWeeks: 3, category: 'NEGOCIO' as const,
      iconName: 'Utensils', isPublished: true, sortOrder: 12,
      imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800',
    },
    {
      slug: 'turismo', title: 'Turismo vivencial en tu comunidad',
      short: 'Recibe visitantes en tu casa y comunidad generando ingresos adicionales.',
      long: 'Aprende a ofrecer experiencias auténticas a turistas: preparar alojamiento sencillo, cocinar platos típicos, mostrar actividades como pastoreo y tejido, fijar precios justos y registrar tu emprendimiento turístico.',
      level: 'INTERMEDIO' as const, durationWeeks: 4, category: 'NEGOCIO' as const,
      iconName: 'Mountain', isPublished: true, sortOrder: 13,
      imageUrl: 'https://images.unsplash.com/photo-1531761535209-180857e963b9?w=800',
    },
    {
      slug: 'agua', title: 'Manejo de agua y acequias',
      short: 'Conserva y aprovecha mejor el agua de lluvia y los manantiales.',
      long: 'Técnicas prácticas para el manejo del agua en zonas altoandinas: mantenimiento de acequias, construcción de reservorios pequeños, cosecha de agua de lluvia y uso eficiente para riego y consumo familiar.',
      level: 'INTERMEDIO' as const, durationWeeks: 5, category: 'CAMPO' as const,
      iconName: 'Droplets', isPublished: true, sortOrder: 14,
      imageUrl: 'https://images.unsplash.com/photo-1470010762743-1fa2363f65ca?w=800',
    },
  ];

  for (const cd of coursesData) {
    const course = await prisma.course.upsert({
      where: { slug: cd.slug },
      update: { isPublished: true },
      create: cd,
    });

    // Create 12 lessons per course
    for (let i = 1; i <= 12; i++) {
      const isMid = i === 6;
      const isFinal = i === 12;

      const lesson = await prisma.lesson.upsert({
        where: { courseId_index: { courseId: course.id, index: i } },
        update: {},
        create: {
          courseId: course.id,
          index: i,
          title: `${i}. Clase ${i} — ${course.title}`,
          summary: `Clase ${i} del curso ${course.title}. Aprende conceptos clave y pon en práctica lo aprendido.`,
          detail: `En esta clase ${i} del curso "${course.title}", exploraremos conceptos fundamentales con ejemplos de la vida andina. Incluye ejercicios prácticos y casos reales de comunidades de la sierra peruana.`,
          isPractice: isMid || isFinal,
          practiceTitle: isMid ? `Caso práctico intermedio — ${course.title}` : isFinal ? `Caso final — ${course.title}` : null,
          practiceScenario: isMid
            ? `Aplica lo aprendido en las clases 1 a 6 del curso "${course.title}" a una situación real de tu comunidad.`
            : isFinal
            ? `Diseña una propuesta completa integrando todo lo aprendido en "${course.title}" para mejorar tu chacra.`
            : null,
          practiceHint: isMid
            ? 'Usa lo visto en clases 1 a 6 y justifica cada decisión.'
            : isFinal
            ? 'Conecta todas las clases del curso en un único plan de acción.'
            : null,
        },
      });

      // Create 3 quiz questions per lesson
      const quizThemes = [
        { q: `¿Cuál es el objetivo principal de la clase ${i} del curso "${course.title}"?`, opts: ['Aprender conceptos prácticos aplicables a la chacra', 'Memorizar fechas y datos', 'Hacer tareas en papel'], ans: 0 },
        { q: `¿Qué herramienta es más útil para lo que aprendiste en la clase ${i}?`, opts: ['Una aplicación en el celular', 'Un libro muy grueso', 'Un televisor'], ans: 0 },
        { q: `Si le explicas a tu vecino la clase ${i}, ¿qué le dirías primero?`, opts: ['Le hablaría de los beneficios económicos', 'Le contaría una historia sin relación', 'No sabría cómo explicarlo'], ans: 0 },
      ];

      for (let q = 0; q < quizThemes.length; q++) {
        await prisma.quizQuestion.upsert({
          where: { id: `${lesson.id}-q${q}` },
          update: {},
          create: {
            id: `${lesson.id}-q${q}`,
            lessonId: lesson.id,
            order: q,
            question: quizThemes[q].q,
            options: quizThemes[q].opts,
            answer: quizThemes[q].ans,
          },
        });
      }
    }
    console.log(`✅ Curso "${course.title}" con lecciones creado`);
  }

  // ── Demo progress for demo user ───────────────────────────────────────────
  const ganaderiaC = await prisma.course.findUnique({ where: { slug: 'ganaderia' } });
  const cultivoC = await prisma.course.findUnique({ where: { slug: 'cultivo' } });

  if (ganaderiaC) {
    await prisma.courseProgress.upsert({
      where: { userId_courseId: { userId: demoUser.id, courseId: ganaderiaC.id } },
      update: {},
      create: { userId: demoUser.id, courseId: ganaderiaC.id, lessonsDone: 7, lessonsTotal: 12, dailyGoal: 1 },
    });
  }
  if (cultivoC) {
    await prisma.courseProgress.upsert({
      where: { userId_courseId: { userId: demoUser.id, courseId: cultivoC.id } },
      update: {},
      create: { userId: demoUser.id, courseId: cultivoC.id, lessonsDone: 3, lessonsTotal: 12, dailyGoal: 2 },
    });
  }

  // ── Demo forum thread ─────────────────────────────────────────────────────
  if (ganaderiaC) {
    const existingThread = await prisma.forumThread.findFirst({
      where: { courseId: ganaderiaC.id, authorId: demoUser.id },
    });
    if (!existingThread) {
      await prisma.forumThread.create({
        data: {
          courseId: ganaderiaC.id,
          authorId: demoUser.id,
          title: '¿Cómo registro el peso de mis alpacas sin balanza?',
          body: 'Tengo 30 alpacas y no tengo balanza. Vi en la clase 4 que se puede estimar con cinta métrica, ¿alguien lo ha probado? ¿funciona bien?',
        },
      });
    }
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  const settings = [
    { key: 'platform_name', value: 'Allin Yachay', type: 'string', group: 'general', label: 'Nombre de la plataforma' },
    { key: 'platform_description', value: 'Plataforma educativa para comunidades andinas del Perú', type: 'string', group: 'general', label: 'Descripción' },
    { key: 'default_lessons_per_course', value: '12', type: 'number', group: 'learning', label: 'Lecciones por defecto por curso' },
    { key: 'max_daily_goal', value: '5', type: 'number', group: 'learning', label: 'Meta diaria máxima' },
    { key: 'registration_open', value: 'true', type: 'boolean', group: 'auth', label: 'Registro abierto' },
    { key: 'supported_languages', value: 'es,qu,ay,shp', type: 'string', group: 'i18n', label: 'Idiomas soportados' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📋 Credenciales de prueba:');
  console.log('   Admin:    DNI 00000001 / Admin2025!');
  console.log('   Docente:  DNI 87654321 / Docente2025!');
  console.log('   Estudiante: DNI 12345678 / andes2025\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
