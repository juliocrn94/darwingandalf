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
    const HUBSPOT_ACCESS_TOKEN = Deno.env.get("HUBSPOT_ACCESS_TOKEN");
    if (!HUBSPOT_ACCESS_TOKEN) {
      throw new Error("HUBSPOT_ACCESS_TOKEN not configured");
    }

    console.log("Fetching deals from HubSpot...");

    // Obtener deals con información de company
    const dealsResponse = await fetch(
      'https://api.hubapi.com/crm/v3/objects/deals?properties=dealname,dealstage,pipeline,amount,closedate&associations=company',
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!dealsResponse.ok) {
      const errorText = await dealsResponse.text();
      console.error("HubSpot API error:", dealsResponse.status, errorText);
      throw new Error(`HubSpot API error: ${dealsResponse.status}`);
    }

    const dealsData = await dealsResponse.json();
    console.log(`Found ${dealsData.results?.length || 0} deals`);

    // Extraer company IDs únicos
    const companyIds = new Set<string>();
    dealsData.results?.forEach((deal: any) => {
      deal.associations?.companies?.results?.forEach((company: any) => {
        if (company.id) companyIds.add(company.id);
      });
    });

    // Obtener información de companies
    let companiesData: any[] = [];
    if (companyIds.size > 0) {
      console.log(`Fetching ${companyIds.size} companies from HubSpot...`);
      
      const companiesResponse = await fetch(
        'https://api.hubapi.com/crm/v3/objects/companies/batch/read',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: ['name', 'domain', 'industry', 'description', 'city', 'country'],
            inputs: Array.from(companyIds).map(id => ({ id }))
          })
        }
      );

      if (companiesResponse.ok) {
        const companiesResult = await companiesResponse.json();
        companiesData = companiesResult.results || [];
        console.log(`Fetched ${companiesData.length} companies`);
      }
    }

    // Combinar deals con company info
    const enrichedDeals = dealsData.results?.map((deal: any) => {
      const companyId = deal.associations?.companies?.results?.[0]?.id;
      const company = companiesData.find(c => c.id === companyId);

      return {
        dealId: deal.id,
        dealName: deal.properties.dealname,
        dealStage: deal.properties.dealstage,
        pipeline: deal.properties.pipeline,
        amount: deal.properties.amount,
        closeDate: deal.properties.closedate,
        company: company ? {
          id: company.id,
          name: company.properties.name,
          domain: company.properties.domain,
          industry: company.properties.industry,
          description: company.properties.description,
          city: company.properties.city,
          country: company.properties.country,
        } : null
      };
    }) || [];

    console.log("Successfully enriched deals with company data");

    return new Response(
      JSON.stringify({ deals: enrichedDeals }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in fetch-hubspot-deals:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
