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
    const { agentId, message, conversationHistory, currentNode } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener configuración del agente
    const { data: agent } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .single();

    if (!agent) {
      throw new Error("Agent not found");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Construir el contexto del agente
    const intentsArray = Array.isArray(agent.intents) ? agent.intents : [];
    const intentsDescription = intentsArray.map((intent: any, idx: number) => 
      `Intent ${idx + 1} (ID: intent_${idx}): ${intent.name || intent.description}`
    ).join("\n");

    const systemPrompt = `Eres ${agent.name}, un agente conversacional.

MISIÓN: ${agent.mission}
CONTEXTO: ${agent.context || "No especificado"}
INDUSTRIA: ${agent.industry}

INTENTS DISPONIBLES:
${intentsDescription}

Tu tarea es:
1. Responder al usuario de forma natural según tu misión y contexto
2. Identificar qué intent está activado según la conversación
3. Devolver el ID del nodo actual (start, intent_0, intent_1, etc., o end)

Nodo actual: ${currentNode}`;

    // Llamar a Lovable AI para generar respuesta
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
          ...conversationHistory.map((m: any) => ({ 
            role: m.role, 
            content: m.content 
          })),
          { role: "user", content: message }
        ],
        tools: [{
          type: "function",
          function: {
            name: "update_conversation_state",
            description: "Actualizar el estado de la conversación con el nodo actual",
            parameters: {
              type: "object",
              properties: {
                currentNode: { 
                  type: "string",
                  description: "ID del nodo actual (start, intent_0, intent_1, ..., end)"
                },
                intentActivated: { 
                  type: "string",
                  description: "Nombre del intent activado si aplica"
                }
              },
              required: ["currentNode"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "update_conversation_state" } }
      }),
    });

    if (!response.ok) {
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let nextNode = currentNode;
    if (toolCall?.function?.arguments) {
      const parsedArgs = JSON.parse(toolCall.function.arguments);
      nextNode = parsedArgs.currentNode || currentNode;
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
          ...conversationHistory.map((m: any) => ({ 
            role: m.role, 
            content: m.content 
          })),
          { role: "user", content: message }
        ],
      }),
    });

    const conversationData = await conversationResponse.json();
    const responseText = conversationData.choices?.[0]?.message?.content || "¿En qué más puedo ayudarte?";

    return new Response(
      JSON.stringify({
        response: responseText,
        node: nextNode
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in test-agent:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
