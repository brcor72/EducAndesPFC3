import Groq from 'groq-sdk';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { TutorChatDto } from './tutor.dto';

const LANG_NAMES: Record<string, string> = {
  es: 'español',
  qu: 'quechua (runasimi)',
  ay: 'aymara (aymar aru)',
  shp: 'shipibo-konibo',
};

// Models ordered by speed — Groq serves them all instantly
const GROQ_MODELS = [
  'llama-3.1-8b-instant',   // fastest, 14400 RPD free
  'llama3-8b-8192',          // fallback 1
  'gemma2-9b-it',            // fallback 2
];

@Injectable()
export class TutorService {
  private readonly logger = new Logger(TutorService.name);
  private groq: Groq;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY') ?? '';
    this.groq = new Groq({ apiKey });
  }

  private buildSystemPrompt(dto: TutorChatDto): string {
    const selectedLang = LANG_NAMES[dto.lang] ?? 'español';
    const progressDesc =
      dto.lessonsDone > 0
        ? `Ha completado ${dto.lessonsDone} de ${dto.totalLessons} lecciones.`
        : 'Acaba de comenzar este curso.';

    const base = `Eres "Yachay", un tutor virtual educativo especializado en capacitación tecnológica y automatización de procesos para comunidades rurales.

CONTEXTO DEL ESTUDIANTE:
- Curso actual: "${dto.courseTitle}"
- Lección ${dto.lessonIndex} de ${dto.totalLessons}: "${dto.lessonTitle}"
- Resumen de la lección: ${dto.lessonSummary}
- Contenido completo: ${dto.lessonDetail}
- Progreso: ${progressDesc}
- Idioma preferido del estudiante: ${selectedLang}

REGLAS DE IDIOMA:
- Detecta automáticamente el idioma principal utilizado por el estudiante.
- Responde siempre en el mismo idioma utilizado por el estudiante.
- Si el estudiante habla en español, responde en español.
- Si el estudiante habla en quechua, responde en quechua.
- Si el estudiante habla en aymara, responde en aymara.
- Si el estudiante habla en shipibo-konibo, responde en shipibo-konibo.
- No traduzcas al español a menos que el estudiante lo solicite.
- Si el estudiante mezcla idiomas, responde en el idioma predominante de su consulta.
- Mantén consistencia lingüística durante toda la conversación.
- Si no estás seguro del idioma utilizado por el estudiante, solicita una aclaración breve en lugar de asumir un idioma.

REGLAS PEDAGÓGICAS:
- Utiliza lenguaje simple y fácil de entender.
- Evita tecnicismos innecesarios.
- Explica conceptos mediante ejemplos prácticos relacionados con actividades cotidianas.
- Actúa como un profesor paciente y amigable.
- Responde utilizando únicamente la información del curso, tema y lección actuales.
- Solo texto plano. Sin asteriscos, guiones ni markdown.
- Máximo 4 oraciones por respuesta para que sea fácil de escuchar en voz alta.

REGLAS OBLIGATORIAS — nunca las incumplas:
1. SIEMPRE responde. Nunca dejes una respuesta vacía. Nunca digas "no puedo responder", "ocurrió un error" ni "lo siento no sé".
2. Si la pregunta es ajena a la lección, respóndela brevemente e invita al estudiante a explorar el contenido de la clase.
3. Si el mensaje es confuso o parece mal transcrito por voz: REFORMULA lo que crees que quiso preguntar, RESPÓNDELA en el mismo mensaje y añade al final: "¿Era eso lo que querías saber?"
4. Si el estudiante responde "sí" a la reformulación: confirma brevemente y sigue disponible.
5. Si el estudiante responde "no": pídele amablemente que explique su pregunta de otra manera.
6. Si la pregunta tiene sentido aunque esté mal escrita, interpreta la intención y responde directamente SIN pedir confirmación.`;

    if (dto.mode === 'quiz') {
      return base + `

MODO EVALUACIÓN:
- El estudiante está en el cuestionario de "${dto.lessonTitle}".
${dto.quizQuestion ? `- Pregunta actual: "${dto.quizQuestion}"` : ''}
- No reveles la respuesta directa. Da pistas y guía al estudiante a razonar por sí mismo.
- Si el estudiante se equivoca, motívalo con paciencia a intentarlo de nuevo.`;
    }

    return base + `

MODO CLASE:
- Explica la lección con ejemplos prácticos del campo y la vida rural andina.
- Celebra el avance del estudiante cuando progresa.`;
  }

  async streamChat(dto: TutorChatDto, res: Response): Promise<void> {
    const systemPrompt = this.buildSystemPrompt(dto);

    // Build message history in OpenAI format (Groq is compatible)
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...dto.history.slice(-16).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: dto.message },
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    let lastError: any = null;

    for (const modelName of GROQ_MODELS) {
      try {
        const stream = await this.groq.chat.completions.create({
          model: modelName,
          messages,
          max_tokens: 1024,
          temperature: 0.75,
          stream: true,
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();
        return;
      } catch (error: any) {
        const is429 = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('rate');
        if (is429) {
          this.logger.warn(`Groq model ${modelName} rate limited, trying next...`);
          lastError = error;
          continue;
        }
        lastError = error;
        break;
      }
    }

    // All models failed
    this.logger.error('All Groq models failed: ' + lastError?.message);
    const is429 = lastError?.status === 429 || lastError?.message?.includes('rate') || lastError?.message?.includes('quota');
    const friendlyMsg = is429
      ? 'Estoy recibiendo muchas consultas. Por favor intenta en unos segundos.'
      : 'Tuve un inconveniente al procesar tu pregunta. ¿Podrías intentarlo de nuevo?';
    try {
      res.write(`data: ${JSON.stringify({ error: friendlyMsg })}\n\n`);
      res.write('data: [DONE]\n\n');
    } catch { /* already ended */ }
    res.end();
  }
}
