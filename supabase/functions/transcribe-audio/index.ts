import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { audioFileId } = await req.json();

    if (!audioFileId) {
      return new Response(
        JSON.stringify({ error: 'audioFileId is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Fetch audio file info from database
    const { data: audioFile, error: fetchError } = await supabaseClient
      .from('audio_files')
      .select('*')
      .eq('id', audioFileId)
      .single();

    if (fetchError || !audioFile) {
      console.error('Error fetching audio file:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Audio file not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Downloading audio file from storage:', audioFile.file_path);

    // Download audio file from storage
    const { data: audioData, error: downloadError } = await supabaseClient.storage
      .from('audio-files')
      .download(audioFile.file_path);

    if (downloadError || !audioData) {
      console.error('Error downloading audio file:', downloadError);
      return new Response(
        JSON.stringify({ error: 'Failed to download audio file' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Audio file downloaded, size:', audioData.size);

    // Prepare form data for OpenAI Whisper API
    const formData = new FormData();
    formData.append('file', audioData, audioFile.file_name);
    formData.append('model', 'whisper-1');
    formData.append('language', 'de'); // German language

    console.log('Sending to OpenAI Whisper API...');

    // Send to OpenAI Whisper API
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('OpenAI API error:', whisperResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${whisperResponse.status}` }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const whisperResult = await whisperResponse.json();
    const transcript = whisperResult.text;

    console.log('Transcription received, length:', transcript.length);

    // Update audio file with transcript
    const { error: updateError } = await supabaseClient
      .from('audio_files')
      .update({ transcript_text: transcript })
      .eq('id', audioFileId);

    if (updateError) {
      console.error('Error updating audio file:', updateError);
      throw updateError;
    }

    console.log('Audio file updated with transcript');

    return new Response(
      JSON.stringify({ 
        success: true,
        transcript: transcript
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
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
