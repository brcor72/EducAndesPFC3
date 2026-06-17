# Technical Breakdown: Generic AI Practice Engine

This document provides a comprehensive technical breakdown of the **Generic AI Practice Engine** implemented in the EducAndes platform.

---

## 1. Engine Architecture & Flow

The Generic AI Practice Engine is a data-driven, stateful conversation coordinator that connects the NestJS backend, Google's Gemini API, and the React frontend. 

Instead of hardcoding individual courses or lesson scenarios, the engine loads all context dynamically from the database.

```
┌─────────────────┐       GET Lesson practice details       ┌──────────┐
│  React Frontend ├────────────────────────────────────────>│ Postgres │
└────────┬────────┘                                         └────┬─────┘
         │                                                       │
         │ POST /api/v1/ai/practice { lessonId, history }         │ (Loads Scenario
         ▼                                                       │  & Solution Criteria)
┌─────────────────┐                                              │
│  NestJS Backend ├<─────────────────────────────────────────────┘
└────────┬────────┘
         │
         │ Build Socratic System Instructions & Send Chat History
         ▼
┌─────────────────┐
│ Gemini 2.5 API  │ (Generates next dialogue turn + optional COSTS_DATA)
└────────┬────────┘
         │
         │ Returns text response
         ▼
┌─────────────────┐       Update Chat UI & Cost Calculator
│  React Frontend ├────────────────────────────────────────> [ 📊 Visual Sandbox ]
└─────────────────┘
```

---

## 2. Prompt Engineering & The Socratic Method

The backend (`ai.service.ts`) constructs a system instruction dynamically. The core of this system prompt is the **Socratic Method** combined with the database metadata:

```markdown
Eres "Yachaq", un sabio y paciente tutor y evaluador de la plataforma EducAndes...
Responde siempre en el idioma solicitado: {preferredLang}.

DATOS DEL CASO PRÁCTICO:
* TÍTULO: {lesson.practiceTitle}
* ESCENARIO: {lesson.practiceScenario}
* CRITERIOS DE SOLUCIÓN: {lesson.practiceHint}

INSTRUCCIONES DE DIÁLOGO:
1. Adopta el rol que el escenario sugiera (por ejemplo, comprador acopiador, estafador, etc.).
2. NO des la respuesta correcta directamente. Haz preguntas cortas y reflexivas (Método Socrático).
3. Evalúa si el estudiante cumple con los "CRITERIOS DE SOLUCIÓN".
4. Cuando supere el caso, felicítalo y di la frase clave "¡Caso completado con éxito!".
```

This dynamic construction allows the engine to scale to any lesson simply by seeding the `Lesson` table with `isPractice = true` and filling in the scenario/hints.

---

## 3. Real-Time Frontend Synchronization (Cost Sandbox)

For financial and business lessons (e.g., calculating pricing), we built a **visual cost sandbox widget** next to the chat screen. 

To keep the frontend synchronized without complex webhook listeners, we engineered a simple tag-based parser:

1. **System Directive:** The AI is instructed:
   ```markdown
   Si el estudiante menciona costos (semillas, abono, transporte, etc.), agrégalos al final de tu respuesta usando este formato de etiqueta especial:
   [COSTS_DATA: {"Semillas": 120, "Transporte": 50}]
   ```
2. **Regex Parser:** In `PracticePanel.tsx`, when a response is received, the client runs a regular expression:
   ```typescript
   const match = res.message.match(/\[COSTS_DATA:\s*({.*?})\]/);
   if (match) {
     const parsed = JSON.parse(match[1]);
     setCosts(parsed); // Updates visual spreadsheet widget
   }
   ```
3. **Clean Display:** Before rendering the chat bubble to the student, the `[COSTS_DATA: ...]` tag is stripped from the string, ensuring a clean, natural conversational experience.

---

## 4. Resilience & Fallback Simulator

To guarantee high availability and prevent crashes during offline testing or in case the `GEMINI_API_KEY` is missing/exhausted, the engine has a built-in **Offline Rule-Based Simulator**:

* **Condition:** If `GEMINI_API_KEY` is not set in `.env`, the service automatically defaults to local simulation.
* **Mechanism:**
  * *Turn 1-2:* Greets the user, repeats the scenario, and asks what they would do.
  * *Turn 3+:* If the response is short, asks for more detail based on the solution hint. If detailed, congratulates the user and yields `isCompleted = true` to unlock the lesson.
  * *Benefit:* Developers can test and run end-to-end integration tests without having to purchase or configure real LLM credentials.

---

## 5. Security & Cost Protection Controls

* **JWT Auth Gate:** Rejects calls from unauthenticated clients. Only registered users with active DNI profiles can consume tokens.
* **Rate Limiter:** Restricts users to **10 requests per minute** to prevent brute-force script calls.
* **Session Capping:** Limits active practice conversations to a maximum of **30 messages (15 turns)** per session to stop infinite loops.
* **Single Context Lock:** Users are restricted to one active practice session context at any time.

---

## 6. Pending Actions & Next Steps

Based on the latest updates and stability fixes, the following items remain open for validation and production readiness:

1. **Production Hosting Credentials:**
   * Ensure `GEMINI_API_KEY` is configured as a environment variable secret in the target cloud environments (e.g., Railway, Render, or AWS).
   * Confirm that the selected Gemini model (`gemini-2.5-flash`) is supported in the deployment region.

2. **CI/CD Integration:**
   * Configure the GitHub Actions workflow to run E2E tests using the mock/offline simulator configuration if a real API key is not available in the CI pipeline.

3. **Multi-language Prompt Validation:**
   * Manually test and verify that Yachaq guides students correctly and responds in local languages (Quechua, Aymara, Shipibo-Konibo) when chosen by the user profile.

4. **Speech-to-Text / Text-to-Speech Compatibility:**
   * Verify audio/voice features on mobile browsers (Safari iOS, Chrome Android) to ensure microphone permissions and browser SpeechSynthesis APIs are properly handled.

