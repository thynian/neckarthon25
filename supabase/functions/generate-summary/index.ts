import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topics } = await req.json();
    
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return new Response(
        JSON.stringify({ error: "Keine Themen zum Zusammenfassen vorhanden" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API-Schlüssel nicht konfiguriert" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const systemPrompt = `Du bist ein professioneller Redakteur, der aus einer Liste von Themen eine strukturierte, zusammenhängende Zusammenfassung erstellt.

Anforderungen:
- Erstelle einen gut strukturierten Fließtext auf Deutsch
- Verwende professionelle, klare Sprache
- Gruppiere verwandte Themen logisch
- Füge Überschriften für verschiedene Bereiche hinzu
- Halte die Zusammenfassung prägnant aber vollständig
- Achte auf einen guten Lesefluss`;

    const userPrompt = `Erstelle eine professionelle Zusammenfassung aus folgenden Themen:

${topics.map((topic: string, idx: number) => `${idx + 1}. ${topic}`).join('\n')}

Erstelle daraus einen strukturierten Fließtext mit Überschriften und Absätzen.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate-Limit überschritten. Bitte versuchen Sie es später erneut." }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Guthaben aufgebraucht. Bitte fügen Sie Guthaben zu Ihrem Workspace hinzu." }),
          { 
            status: 402, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Fehler beim Generieren der Zusammenfassung" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content;

    if (!summary) {
      console.error("No summary generated from AI response");
      return new Response(
        JSON.stringify({ error: "Keine Zusammenfassung generiert" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ summary }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error in generate-summary function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unbekannter Fehler" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
