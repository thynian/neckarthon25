import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { documentation_id } = await req.json();

    if (!documentation_id) {
      return new Response(
        JSON.stringify({ error: 'documentation_id is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch documentation
    const { data: doc, error: docError } = await supabaseClient
      .from('documentations')
      .select('*')
      .eq('id', documentation_id)
      .single();

    if (docError || !doc) {
      console.error('Error fetching documentation:', docError);
      return new Response(
        JSON.stringify({ error: 'Documentation not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate mock transcript
    const dummyTranscript = `Dies ist ein Mock-Transkript für die Dokumentation "${doc.title}" (ID: ${doc.id}).
Der Termin war am ${new Date(doc.date).toLocaleDateString('de-DE')}.
In einer echten Implementierung würde hier der von einer KI generierte Text der Audiodateien erscheinen.`;

    // Update documentation with transcript
    const updateData: {
      transcript_text: string;
      status?: string;
    } = {
      transcript_text: dummyTranscript,
    };

    // Change status to IN_REVIEW if currently OPEN
    if (doc.status === 'OPEN') {
      updateData.status = 'IN_REVIEW';
    }

    const { data: updatedDoc, error: updateError } = await supabaseClient
      .from('documentations')
      .update(updateData)
      .eq('id', documentation_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating documentation:', updateError);
      throw updateError;
    }

    console.log(`Mock transcription completed for documentation ${documentation_id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        documentation: updatedDoc 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in mock-transcribe function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
