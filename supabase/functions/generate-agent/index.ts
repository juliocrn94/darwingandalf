import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { baseAgentId, adaptations, selectedPrompt, clientUrl } = await req.json();
    
    console.log("Generating final agent configuration");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get base agent
    const { data: baseAgent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", baseAgentId)
      .single();

    if (agentError) throw agentError;

    // Use AI to generate final configuration
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an AI agent configuration expert. Generate a complete agent configuration in JSON format."
          },
          {
            role: "user",
            content: `Base agent: ${JSON.stringify(baseAgent)}. Adaptations: ${JSON.stringify(adaptations)}. Selected prompt: ${selectedPrompt}. Client URL: ${clientUrl}. Generate final configuration with: id, name, status, configuration (mission, context, intents), summary.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI request failed");
    }

    const aiData = await aiResponse.json();
    const generatedAgent = JSON.parse(aiData.choices[0].message.content);

    console.log("Agent generated successfully:", generatedAgent.id);

    return new Response(
      JSON.stringify({ success: true, agent: generatedAgent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating agent:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
