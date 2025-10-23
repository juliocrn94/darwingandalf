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
    const { handoffId, searchQuery } = await req.json();
    
    console.log("Searching agents for handoff:", handoffId);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all agents
    const { data: agents, error } = await supabase
      .from("agents")
      .select("*");

    if (error) throw error;

    // Use AI to find most similar agents
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (lovableApiKey && handoffId) {
      // Get handoff data
      const { data: handoff } = await supabase
        .from("handoffs")
        .select("*")
        .eq("id", handoffId)
        .single();

      if (handoff) {
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
                content: "You are an AI agent matching assistant. Analyze the handoff data and rank agents by relevance."
              },
              {
                role: "user",
                content: `Handoff data: ${JSON.stringify(handoff.processed_data)}. Agents: ${JSON.stringify(agents)}. Return the agent IDs ranked by relevance as a JSON array of IDs.`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const rankedIds = JSON.parse(aiData.choices[0].message.content);
          
          // Reorder agents based on AI ranking
          const rankedAgents = rankedIds
            .map((id: string) => agents.find(a => a.id === id))
            .filter(Boolean);

          console.log("Agents ranked by AI:", rankedAgents.length);

          return new Response(
            JSON.stringify({ success: true, agents: rankedAgents }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Fallback: return all agents
    return new Response(
      JSON.stringify({ success: true, agents }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error searching agents:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
