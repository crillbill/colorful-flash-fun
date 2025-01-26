import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text } = await req.json()
    
    console.log('Text-to-speech request received for Hebrew text:', { 
      text,
      textLength: text.length,
      encoding: 'UTF-8',
      // Log each character's code point to verify Hebrew characters
      codePoints: Array.from(text).map(char => char.codePointAt(0))
    })

    if (!text) {
      throw new Error('Text is required')
    }

    // Make request to OpenAI TTS API
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',  // Using HD model for higher quality audio
        input: text,
        voice: 'nova', // Using Nova voice which has good multilingual support
        speed: 0.85,  // Setting speed to 85% of normal speed
        response_format: 'mp3'
      }),
    });

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI TTS API error:', errorData)
      throw new Error(`OpenAI TTS API error: ${response.status} ${errorData}`)
    }

    // Get audio data and convert to base64
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    console.log('Successfully generated audio for Hebrew text:', {
      text,
      audioLength: arrayBuffer.byteLength,
      model: 'tts-1-hd',
      voice: 'nova',
      speed: 0.85
    })

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Text-to-speech error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})