import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import FirecrawlApp from "https://esm.sh/@mendable/firecrawl-js@1.11.0";

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
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let enrichedData = { ...currentData };

    // Detectar si el último mensaje del usuario contiene una URL
    const lastUserMessage = messages[messages.length - 1];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = lastUserMessage?.content?.match(urlRegex);

    // Si se detecta una URL y Firecrawl está configurado, hacer scraping
    if (urls && urls.length > 0 && FIRECRAWL_API_KEY && !currentData.companyWebsite) {
      console.log("URL detectada, iniciando scraping con Firecrawl:", urls[0]);
      
      try {
        const firecrawl = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });
        const scrapeResult = await firecrawl.scrapeUrl(urls[0], {
          formats: ['markdown'],
        });

        if (scrapeResult.success && scrapeResult.markdown) {
          console.log("Scraping exitoso, extrayendo información con AI");

          // Usar Lovable AI para extraer datos estructurados del markdown
          const extractionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                  content: `Analiza el siguiente contenido de una página web y extrae información estructurada.
Contenido del sitio web:
${scrapeResult.markdown.slice(0, 10000)}

Extrae:
- Descripción de la empresa
- Servicios principales que ofrecen
- Plataformas/integraciones mencionadas
- Información de contacto
- Preguntas frecuentes si las hay`
                },
                {
                  role: "user",
                  content: "Extrae la información estructurada del sitio web"
                }
              ],
              tools: [{
                type: "function",
                function: {
                  name: "extract_website_data",
                  description: "Extraer información estructurada del sitio web",
                  parameters: {
                    type: "object",
                    properties: {
                      companyDescription: { type: "string" },
                      services: { type: "array", items: { type: "string" } },
                      platforms: { type: "array", items: { type: "string" } },
                      contactInfo: { type: "string" },
                      faq: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }],
              tool_choice: { type: "function", function: { name: "extract_website_data" } }
            }),
          });

          if (extractionResponse.ok) {
            const extractionData = await extractionResponse.json();
            const websiteData = extractionData.choices?.[0]?.message?.tool_calls?.[0];
            
            if (websiteData?.function?.arguments) {
              const parsed = JSON.parse(websiteData.function.arguments);
              
              // Pre-poblar discoveryData con info extraída
              enrichedData = {
                ...enrichedData,
                companyWebsite: urls[0],
                agentPurpose: parsed.companyDescription || enrichedData.agentPurpose,
                integrations: parsed.platforms || enrichedData.integrations,
                faq: parsed.faq || enrichedData.faq,
              };

              console.log("Datos extraídos del sitio web:", parsed);
            }
          }
        }
      } catch (firecrawlError) {
        console.error("Error en Firecrawl scraping:", firecrawlError);
        // Continuar sin los datos del scraping
      }
    }

    // Identificar campos ya confirmados
    const confirmedFields = Object.keys(enrichedData).filter(k => enrichedData[k] && enrichedData[k] !== '');
    const remainingFields = ['companyWebsite', 'agentPurpose', 'integrations', 'agentName'].filter(f => !confirmedFields.includes(f));

    // System prompt adaptado para confirmación única
    const systemPrompt = `Eres un asistente experto en discovery para crear agentes conversacionales. 

REGLAS CRÍTICAS DE CONFIRMACIÓN:
1. Campos YA CONFIRMADOS (NO volver a preguntar): ${confirmedFields.join(', ') || 'ninguno'}
2. Campos que FALTAN por confirmar: ${remainingFields.join(', ') || 'ninguno'}
3. Si presentas información extraída del sitio web, pide confirmación UNA SOLA VEZ
4. Una vez confirmado un campo, NUNCA lo vuelvas a mencionar
5. Avanza INMEDIATAMENTE al siguiente campo pendiente después de una confirmación

Datos actuales: ${JSON.stringify(enrichedData)}

COMPORTAMIENTO ESPERADO:
- Si el usuario confirma un campo (ej: "sí", "correcto", "exacto"), marca ese campo como completado y pasa AL SIGUIENTE CAMPO inmediatamente
- NO repitas información ya confirmada
- Pregunta SOLO por lo que falta en la lista de campos pendientes
- Usa markdown para dar formato: **negritas** para énfasis, *cursivas* para ejemplos, listas para opciones

Información requerida (solo pregunta lo que NO esté confirmado):
1. Sitio web de la empresa (companyWebsite)
2. Para qué usarán el agente (agentPurpose)
3. Plataformas de integración (integrations - array)
4. Conversaciones ideales de ejemplo (idealConversations - array)
5. Preguntas frecuentes (faq - array)
6. Servicios que NO ofrece la AI (excludedServices - array)
7. Info que necesita del cliente (requiredCustomerInfo - array)
8. Nombre del agente (agentName)

NO devuelvas JSON en tu respuesta conversacional. Usa markdown para formato.
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
    
    let extractedData = enrichedData;
    let isComplete = false;
    
    if (toolCall?.function?.arguments) {
      const parsedArgs = JSON.parse(toolCall.function.arguments);
      extractedData = { ...enrichedData, ...parsedArgs };
      isComplete = parsedArgs.isComplete || false;
    }

    // Generar respuesta conversacional LIMPIA (sin JSON)
    const conversationResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt + "\n\nIMPORTANTE: Tu respuesta debe ser SOLO texto conversacional natural. NUNCA incluyas JSON o datos técnicos en tu respuesta." },
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
        metadata: { currentData: extractedData },
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
