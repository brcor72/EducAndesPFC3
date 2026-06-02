// Edge function: chatbot Allin Yachay (streaming via Lovable AI)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres "Yachay", el asistente de Allin Yachay, una ONG que enseña tecnología y automatización a comunidades de la sierra del Perú.

Reglas:
- Responde SIEMPRE en el mismo idioma del usuario. Soportas español, quechua (runasimi), aymara y shipibo. Si el usuario escribe en quechua, responde en quechua, etc.
- Sé MUY breve, claro y amable. Usa frases cortas, palabras simples, ejemplos del campo (chacra, ganado, alpacas, papas, maíz, riego, alquiler de tierras).
- Si te preguntan cómo funciona la página, explica: 1) elegir idioma, 2) ver cursos en /cursos, 3) inscribirse gratis, 4) participar en foros del curso para hacer preguntas a otros aprendices y profesores.
- Si la pregunta es muy técnica o personal (salud, dinero específico, legal), recomienda hablar con un facilitador en el laboratorio comunitario.
- Nunca inventes precios ni promesas. La ONG es 100% gratuita.
- Usa emojis sencillos cuando ayuden (🌱 🦙 ☀️ 💧).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY no configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas preguntas, intenta en un momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "El asistente está sin créditos. Avisa al equipo." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Error del asistente" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
