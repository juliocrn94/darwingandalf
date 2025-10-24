import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import templates from "./templates.json" with { type: "json" };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log(`Processing ${templates.length} templates...`);
    const results = [];

    for (const template of templates) {
      try {
        // Generate mission, context, and intents using AI
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: `Eres un experto en diseño de agentes conversacionales. Analiza la información del template y genera:
1. Una misión clara y concisa (max 200 chars)
2. Contexto operacional (max 500 chars)
3. Lista de intents (mínimo 3, máximo 8) con nombre y descripción

Template info:
Industry: ${template.industry}
Workers Goals: ${template.workers_goals}
Pain Points: ${template.pain}
Qualification Criteria: ${template.qualification_criteria}
Integrations: ${template.integrations}`
              },
              {
                role: "user",
                content: "Genera la estructura del agente"
              }
            ],
            tools: [{
              type: "function",
              function: {
                name: "generate_agent_structure",
                description: "Generate mission, context and intents for the agent template",
                parameters: {
                  type: "object",
                  properties: {
                    mission: {
                      type: "string",
                      description: "Clear mission statement (max 200 chars)"
                    },
                    context: {
                      type: "string",
                      description: "Operational context (max 500 chars)"
                    },
                    intents: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          description: { type: "string" }
                        }
                      },
                      minItems: 3,
                      maxItems: 8
                    }
                  },
                  required: ["mission", "context", "intents"]
                }
              }
            }],
            tool_choice: { type: "function", function: { name: "generate_agent_structure" } }
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`AI gateway error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        
        if (!toolCall?.function?.arguments) {
          throw new Error("No AI response for template generation");
        }

        const generated = JSON.parse(toolCall.function.arguments);

        // Create agent template in database
        const { data: agent, error } = await supabase
          .from("agents")
          .insert({
            name: `Template ${template.industry}`,
            industry: template.industry,
            description: template.workers_goals.substring(0, 200) + "...",
            mission: generated.mission,
            context: generated.context,
            intents: generated.intents,
            workers_goals: template.workers_goals,
            integrations: template.integrations,
            qualification_criteria: template.qualification_criteria,
            pain: template.pain,
            is_template: true,
            examples_count: 0,
            slots_count: 0
          })
          .select()
          .single();

        if (error) {
          console.error(`Error creating template ${template.industry}:`, error);
          results.push({ industry: template.industry, status: "error", error: error.message });
        } else {
          console.log(`✓ Created template: ${template.industry}`);
          results.push({ industry: template.industry, status: "success", id: agent.id });
        }

      } catch (error) {
        console.error(`Error processing template ${template.industry}:`, error);
        results.push({ 
          industry: template.industry, 
          status: "error", 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    const successCount = results.filter(r => r.status === "success").length;
    const errorCount = results.filter(r => r.status === "error").length;

    return new Response(
      JSON.stringify({ 
        success: true,
        summary: {
          total: templates.length,
          successful: successCount,
          failed: errorCount
        },
        details: results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in seed-templates:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
