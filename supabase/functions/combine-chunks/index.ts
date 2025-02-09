import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileId, fileName, totalChunks } = await req.json()
    
    // Crear cliente de Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Descargar todos los chunks
    const chunks = []
    for (let i = 1; i <= totalChunks; i++) {
      const { data, error } = await supabaseClient.storage
        .from('videos')
        .download(`${fileName}_chunk_${i}`)
      
      if (error) {
        throw error
      }

      chunks.push(await data.arrayBuffer())
    }

    // Combinar los chunks
    const combinedArray = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0)
    )

    let offset = 0
    for (const chunk of chunks) {
      combinedArray.set(new Uint8Array(chunk), offset)
      offset += chunk.byteLength
    }

    // Subir el archivo combinado
    const { error: uploadError } = await supabaseClient.storage
      .from('videos')
      .upload(fileName, combinedArray, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      throw uploadError
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
