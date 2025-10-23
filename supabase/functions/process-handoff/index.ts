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
    const { type, content, metadata } = await req.json();
    
    console.log("Processing handoff:", { type, metadata });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let processedData: any = {};

    // Process based on type
    if (type === "audio_recording" || type === "audio_file") {
      // For audio, we'll simulate transcription using AI
      const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
      
      if (lovableApiKey) {
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
                content: "You are a transcription assistant. Generate a realistic sample transcription for an AI agent handoff."
              },
              {
                role: "user",
                content: `Generate a sample transcription for a ${metadata?.duration || 30} second audio recording about an AI agent handoff.`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const transcription = aiData.choices[0].message.content;
          
          processedData = {
            transcription,
            summary: `Audio handoff about AI agent (${metadata?.duration || 30}s)`,
            keywords: ["ai", "agent", "handoff", "automation"]
          };
        }
      }
    } else if (type === "text") {
      processedData = {
        summary: content,
        keywords: content.split(" ").slice(0, 5)
      };
    } else if (type === "json") {
      try {
        const jsonData = typeof content === "string" ? JSON.parse(content) : content;
        processedData = {
          parsed: jsonData,
          summary: "JSON handoff data",
          keywords: Object.keys(jsonData)
        };
      } catch (e) {
        console.error("Error parsing JSON:", e);
      }
    }

    // Store in database
    const { data, error } = await supabase
      .from("handoffs")
      .insert({
        type,
        content: typeof content === "string" ? content : "binary",
        metadata: metadata || {},
        processed_data: processedData
      })
      .select()
      .single();

    if (error) throw error;

    console.log("Handoff processed successfully:", data.id);

    return new Response(
      JSON.stringify({ success: true, handoff: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing handoff:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
