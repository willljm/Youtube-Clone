import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase()

  if (!query) {
    return NextResponse.json(
      { error: 'Se requiere un término de búsqueda' }, 
      { status: 400 }
    )
  }

  try {
    console.log('Iniciando búsqueda...');
    console.log('Buscando:', query)
    console.log('Consulta:', query);

    const { data: videos, error } = await supabase
      .from('videos')
      .select(`
        id,
        created_at,
        title,
        description,
        url,
        thumbnail_url,
        views,
        likes,
        dislikes,
        user_id,
        is_private,
        is_kids_content,
        hashtags,
        profile:user_id(
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .ilike('title', `%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Error de Supabase:', error);
      throw error
    }

    console.log('Datos de video:', JSON.stringify(videos, null, 2));
    console.log('Resultados encontrados:', videos?.length || 0)
    return NextResponse.json(videos || [])
  } catch (error) {
    console.error('Error detallado:', error)
    return NextResponse.json(
      { error: 'Error al procesar la búsqueda', details: error },
      { status: 500 }
    )
  }
}
