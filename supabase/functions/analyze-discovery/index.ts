import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, currentData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // System prompt para extraer información estructurada
    const systemPrompt = `Eres un asistente experto en discovery para crear agentes conversacionales. 
Tu objetivo es hacer preguntas inteligentes para obtener:
1. Sitio web de la empresa (companyWebsite)
2. Para qué usarán el agente (agentPurpose)
3. Plataformas de integración (integrations - array)
4. Conversaciones ideales de ejemplo (idealConversations - array)
5. Preguntas frecuentes (faq - array)
6. Servicios que NO ofrece la AI (excludedServices - array)
7. Info que necesita del cliente (requiredCustomerInfo - array)
8. Nombre del agente (agentName)

Datos actuales: ${JSON.stringify(currentData)}

Haz preguntas de forma natural y conversacional. Cuando detectes nueva información, inclúyela en el JSON de respuesta.
Cuando tengas TODOS los campos requeridos (companyWebsite, agentPurpose, integrations, agentName), marca isComplete como true.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_discovery_data",
            description: "Extraer información del discovery de forma estructurada",
            parameters: {
              type: "object",
              properties: {
                companyWebsite: { type: "string" },
                agentPurpose: { type: "string" },
                integrations: { type: "array", items: { type: "string" } },
                idealConversations: { type: "array", items: { type: "string" } },
                faq: { type: "array", items: { type: "string" } },
                excludedServices: { type: "array", items: { type: "string" } },
                requiredCustomerInfo: { type: "array", items: { type: "string" } },
                agentName: { type: "string" },
                isComplete: { type: "boolean" }
              }
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "extract_discovery_data" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let extractedData = {};
    let isComplete = false;
    
    if (toolCall?.function?.arguments) {
      const parsedArgs = JSON.parse(toolCall.function.arguments);
      extractedData = parsedArgs;
      isComplete = parsedArgs.isComplete || false;
    }

    // Generar respuesta conversacional
    const conversationResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ],
      }),
    });

    const conversationData = await conversationResponse.json();
    const responseText = conversationData.choices?.[0]?.message?.content || "Entiendo. ¿Podrías darme más detalles?";

    // Guardar sesión en la DB
    let sessionId = "";
    const { data: handoffData, error: handoffError } = await supabase
      .from("handoffs")
      .insert({
        type: "discovery_session",
        content: JSON.stringify(messages),
        metadata: { currentData: { ...currentData, ...extractedData } },
        processed_data: { extractedData, isComplete }
      })
      .select()
      .single();

    if (!handoffError && handoffData) {
      sessionId = handoffData.id;
    }

    return new Response(
      JSON.stringify({
        response: responseText,
        extractedData,
        isComplete,
        sessionId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-discovery:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
