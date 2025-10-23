import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import FirecrawlApp from "https://esm.sh/@mendable/firecrawl-js@1.11.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, clientUrl } = await req.json();
    
    console.log("Adapting agent:", agentId, "for client:", clientUrl);

    const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
    
    if (!firecrawlApiKey) {
      throw new Error("FIRECRAWL_API_KEY not configured");
    }

    // Scrape client website
    const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey });
    
    console.log("Scraping website:", clientUrl);
    
    const scrapeResult = await firecrawl.scrapeUrl(clientUrl, {
      formats: ["markdown"],
    });

    if (!scrapeResult.success) {
      throw new Error("Failed to scrape website");
    }

    const websiteContent = scrapeResult.markdown || "";

    console.log("Website scraped, content length:", websiteContent.length);

    // Use AI to adapt agent based on website content
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
            content: "You are an AI agent customization expert. Analyze the website content and suggest how to adapt the agent's mission, context, and intents."
          },
          {
            role: "user",
            content: `Website content: ${websiteContent.slice(0, 5000)}. Agent ID: ${agentId}. Provide customization suggestions as JSON with: mission, context, intents.`
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
    const adaptations = JSON.parse(aiData.choices[0].message.content);

    console.log("Agent adapted successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        adaptations,
        websiteData: {
          url: clientUrl,
          contentLength: websiteContent.length
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error adapting agent:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
