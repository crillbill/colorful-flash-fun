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

    // Make request to ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': Deno.env.get('ELEVEN_LABS_API_KEY') || '',
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_sts_v2", // Using Speech-to-Speech model for better pronunciation
        voice_settings: {
          stability: 0.3, // Lower stability for more natural variations
          similarity_boost: 0.95, // Higher similarity for consistent voice
          style: 0.5, // Moderate style for expressive speech
          speed: 0.8 // Slightly slower for clearer pronunciation
        }
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('ElevenLabs API error:', errorData)
      throw new Error(`ElevenLabs API error: ${response.status} ${errorData}`)
    }

    // Get audio data and convert to base64
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    console.log('Successfully generated audio for Hebrew text:', {
      text,
      audioLength: arrayBuffer.byteLength,
      voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice - better for Hebrew
      model: "eleven_multilingual_sts_v2",
      settings: {
        stability: 0.3,
        similarity_boost: 0.95,
        style: 0.5,
        speed: 0.8
      }
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