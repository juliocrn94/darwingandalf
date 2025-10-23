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
    const { agentId, agentName, discoveryData } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener configuración del agente base
    const { data: baseAgent } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .single();

    if (!baseAgent) {
      throw new Error("Base agent not found");
    }

    // Crear configuración final del agente adaptada
    const finalAgentConfig = {
      name: agentName,
      industry: discoveryData.agentPurpose || baseAgent.industry,
      description: `Agente conversacional para ${discoveryData.companyWebsite}`,
      mission: baseAgent.mission,
      context: `${baseAgent.context}\n\nAdaptado para: ${discoveryData.companyWebsite}\nIntegraciones: ${discoveryData.integrations?.join(", ") || "Ninguna"}`,
      intents: baseAgent.intents,
      examples_count: baseAgent.examples_count,
      slots_count: baseAgent.slots_count,
      metadata: {
        baseAgentId: agentId,
        discoveryData,
        createdInDarwin: true,
        createdAt: new Date().toISOString()
      }
    };

    // Simular creación en Darwin (en producción, aquí irían las llamadas a la API de Darwin)
    const darwinId = `darwin_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    console.log("Creating agent in Darwin:", {
      darwinId,
      config: finalAgentConfig
    });

    // Guardar el agente creado en la base de datos
    const { data: newAgent, error: insertError } = await supabase
      .from("agents")
      .insert({
        ...finalAgentConfig,
        id: darwinId
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting agent:", insertError);
      throw insertError;
    }

    // Registrar la creación
    await supabase
      .from("handoffs")
      .insert({
        type: "darwin_deployment",
        content: JSON.stringify(finalAgentConfig),
        metadata: {
          darwinId,
          baseAgentId: agentId,
          agentName,
          discoveryData
        },
        processed_data: {
          success: true,
          deployedAt: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        darwinId,
        agent: newAgent,
        message: `Agente ${agentName} creado exitosamente en Darwin`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in create-in-darwin:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
