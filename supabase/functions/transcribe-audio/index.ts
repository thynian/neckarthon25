import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, durationMs } = await req.json();
    
    console.log(`Transcribing audio file: ${fileName} (${durationMs}ms)`);
    
    // Mock-Transkription basierend auf der Dauer
    const mockTexts = [
      "Dies ist eine Mock-Transkription für Ihre Audiodatei. In einer echten Implementierung würde hier der transkribierte Text der Aufnahme stehen.",
      "Beispiel Meeting-Transkription: Heute haben wir die wichtigsten Punkte des Projekts besprochen. Die Deadline wurde auf Ende des Monats festgelegt.",
      "Besprechung vom Meeting: Wir haben über die nächsten Schritte diskutiert. Es wurden drei Hauptthemen behandelt: Budget, Timeline und Ressourcen.",
      "Notizen aus dem Gespräch: Der Kunde hat seine Anforderungen präzisiert. Besonders wichtig sind die Punkte zur Datensicherheit und Performance.",
    ];
    
    // Wähle zufälligen Mock-Text
    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    
    // Simuliere Verarbeitungszeit (optional)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return new Response(
      JSON.stringify({ 
        transcriptText: randomText,
        success: true,
        message: "Transkription erfolgreich erstellt"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
