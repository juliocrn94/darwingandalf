import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      throw new Error("No audio file provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Convertir el audio a base64 para enviarlo a la API
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    // Usar Lovable AI para transcribir (simulado - en producción usar Whisper API o similar)
    // Por ahora, usar el modelo de AI para "simular" transcripción
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Eres un sistema de transcripción de audio. Tu tarea es simular una transcripción de audio a texto."
          },
          {
            role: "user",
            content: `Simula una transcripción de este audio. El usuario está hablando sobre su negocio para configurar un agente de IA. 
            
Genera una transcripción realista de ejemplo como si el usuario dijera algo relacionado con:
- Su sitio web
- Para qué quiere el agente
- Con qué plataformas integrar
- O cualquier información relevante para un discovery

Ejemplo: "Hola, mi sitio web es miempresa.com y quiero un agente para atención al cliente que se integre con WhatsApp"

Genera una variación diferente cada vez.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const transcription = aiData.choices?.[0]?.message?.content || 
      "No se pudo transcribir el audio. Por favor, intenta de nuevo.";

    console.log("Audio transcribed successfully");

    return new Response(
      JSON.stringify({
        transcription,
        audioSize: audioFile.size,
        audioType: audioFile.type
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in transcribe-audio:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
