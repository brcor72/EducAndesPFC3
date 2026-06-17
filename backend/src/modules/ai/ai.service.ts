import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessageDto {
  role: 'user' | 'model';
  parts: string[];
}

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private isKeyConfigured = false;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey && apiKey !== 'tu_clave_de_gemini_api_aqui' && apiKey.trim() !== '') {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.isKeyConfigured = true;
    } else {
      console.warn('WARNING: GEMINI_API_KEY is not configured. Falling back to simulated AI response.');
      // Initialize with mock key to prevent runtime instantiation errors
      this.genAI = new GoogleGenerativeAI('mock-key');
    }
  }

  async runPracticeSession(lessonId: string, history: ChatMessageDto[], preferredLang: string = 'es') {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, deletedAt: null },
    });

    if (!lesson) {
      throw new NotFoundException('Lección no encontrada');
    }

    if (!lesson.isPractice) {
      throw new BadRequestException('Esta lección no contiene un caso práctico interactivo');
    }

    if (history.length === 0) {
      throw new BadRequestException('La conversación no puede estar vacía');
    }

    const languageNames: Record<string, string> = {
      es: 'Español (Perú)',
      qu: 'Quechua (Runasimi)',
      ay: 'Aymara',
      shp: 'Shipibo-Konibo',
    };

    const targetLang = languageNames[preferredLang] || 'Español (Perú)';

    const systemInstruction = `
Eres "Yachaq", un sabio y paciente tutor y evaluador de la plataforma EducAndes (Allin Yachay). Tu objetivo es guiar de manera interactiva al estudiante para resolver el siguiente caso práctico.

IDIOMA DEL ESTUDIANTE:
Responde siempre en el idioma solicitado: ${targetLang}.
Adopta un tono cálido, empático, sencillo y comprensible. Usa analogías de la vida rural, el campo o el pequeño comercio. Si el estudiante te habla o responde en su lengua nativa, síguele la corriente en ese mismo idioma (por ejemplo, respondiendo en Quechua o Aymara si el estudiante escribe en ese idioma).

---
DATOS DEL CASO PRÁCTICO:
* TÍTULO: ${lesson.practiceTitle || 'Práctica interactiva'}
* ESCENARIO: ${lesson.practiceScenario || 'No hay descripción disponible.'}
* CRITERIOS DE SOLUCIÓN: ${lesson.practiceHint || 'Guía al estudiante a reflexionar sobre el tema.'}
---

INSTRUCCIONES DE DIÁLOGO:
1. Adopta el rol que el escenario sugiera si es oportuno (por ejemplo, si es una estafa por Yape, puedes simular ser el estafador enviando mensajes, o si es una negociación de precios, puedes ser el comprador intermediario acopiador).
2. NO le des la respuesta correcta de inmediato al estudiante. Guíalo mediante preguntas cortas y reflexivas (Método Socrático) para que él mismo identifique la solución.
3. Evalúa si sus aportes cumplen con los "CRITERIOS DE SOLUCIÓN".
4. Cuando el estudiante demuestre que ha resuelto el caso correctamente, felicítalo efusivamente en su idioma y dile claramente la frase clave "¡Caso completado con éxito!" o "¡Caso superado!". Esto nos servirá para marcar la práctica como completada.
5. Si el usuario intenta salirse de contexto, recuérdale amigablemente el problema que están intentando resolver.
`;

    // Capped safety turn limit
    if (history.length > 30) {
      return {
        message: 'Has alcanzado el límite de mensajes permitidos para esta práctica. Por favor, resume tu propuesta final para evaluar el caso.',
        isCompleted: false,
      };
    }

    // Fallback if key not configured
    if (!this.isKeyConfigured) {
      return this.runSimulatedPractice(lesson, history, targetLang);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction,
      });

      // Format conversation history for Gemini API
      // parts must be array of objects with { text: "string" }
      const formattedContents = history.map((h) => ({
        role: h.role,
        parts: h.parts.map((p) => ({ text: p })),
      }));

      // Extract the last message from user
      const lastUserMsg = formattedContents[formattedContents.length - 1];
      if (lastUserMsg.role !== 'user') {
        throw new BadRequestException('El último mensaje de la historia debe provenir del usuario');
      }

      const previousHistory = formattedContents.slice(0, formattedContents.length - 1);

      const chat = model.startChat({
        history: previousHistory,
      });

      const userText = lastUserMsg.parts[0]?.text || '';
      const result = await chat.sendMessage(userText);
      const responseText = result.response.text();

      return {
        message: responseText,
        isCompleted: this.checkIfCompleted(responseText),
      };
    } catch (error) {
      console.error('Gemini API Integration Error:', error);
      return this.runSimulatedPractice(lesson, history, targetLang);
    }
  }

  private checkIfCompleted(text: string): boolean {
    const normalized = text.toLowerCase();
    return (
      normalized.includes('completado con éxito') ||
      normalized.includes('caso superado') ||
      normalized.includes('caso resuelto') ||
      normalized.includes('¡caso completado!') ||
      normalized.includes('has completado con éxito')
    );
  }

  private runSimulatedPractice(lesson: any, history: ChatMessageDto[], targetLang: string) {
    // A simple rules-based simulator to make the practice work even without a valid API Key
    const lastMsg = history[history.length - 1].parts[0]?.toLowerCase() || '';
    let responseText = '';
    let isCompleted = false;

    if (history.length <= 2) {
      responseText = `[Simulador Offline - ${targetLang}] ¡Hola! Soy Yachaq. Leamos juntos el caso "${lesson.practiceTitle}". El problema es: "${lesson.practiceScenario}". Para empezar, cuéntame: ¿qué es lo primero que harías en esta situación?`;
    } else if (lastMsg.length < 10) {
      responseText = `[Simulador Offline] Tu respuesta es un poco corta. Recuerda que la pista para solucionar esto es: "${lesson.practiceHint}". Cuéntame un poco más a detalle sobre tu plan.`;
    } else {
      responseText = `[Simulador Offline] Excelente respuesta. Has analizado bien la situación considerando los criterios del caso ("${lesson.practiceHint}"). ¡Felicidades! Has completado con éxito el caso práctico de esta lección.`;
      isCompleted = true;
    }

    return {
      message: responseText,
      isCompleted,
    };
  }
}
