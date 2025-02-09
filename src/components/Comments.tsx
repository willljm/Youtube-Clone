'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import Image from 'next/image'
import { formatTimeAgo } from '@/lib/utils'
import { CommentSkeleton } from '@/components/Skeleton' // Corregido: importación desde el archivo correcto

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: {
    id: string
    full_name: string
    avatar_url: string
  }
}

interface CommentsProps {
  videoId: string
}

export default function Comments({ videoId }: CommentsProps) {
  const { user } = useUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchComments = async () => {
    try {
      console.log('Fetching comments for video:', videoId);
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Raw comments data:', data);

      if (data) {
        const formattedComments = data.map(comment => ({
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          profiles: {
            id: comment.profiles?.id || 'unknown',
            full_name: comment.profiles?.full_name || 'Usuario',
            avatar_url: comment.profiles?.avatar_url || '/avatar-placeholder.png'
          }
        }));

        console.log('Formatted comments:', formattedComments);
        setComments(formattedComments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) {
      fetchComments();
    }
  }, [videoId]);

  const handleSubmitComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      if (!user) {
        toast.error('Debes iniciar sesión para comentar');
        return;
      }

      if (!newComment.trim() || !videoId) return;

      console.log('Submitting comment:', {
        video_id: videoId,
        user_id: user.id,
        content: newComment.trim()
      });

      const { data, error } = await supabase
        .from('comments')
        .insert({
          video_id: videoId,
          user_id: user.id,
          content: newComment.trim()
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Comment submitted successfully:', data);
      setNewComment('');
      fetchComments();
      toast.success('Comentario publicado');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('No se pudo publicar el comentario');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitComment()
    }
  }

  const renderSkeletons = () => (
    <div className="space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <CommentSkeleton key={i} />
      ))}
    </div>
  );

  return (
    <div className="mt-6 bg-[#1a1a1a] p-4 rounded-xl">
      <h3 className="text-xl font-medium mb-4">
        {comments.length} {comments.length === 1 ? 'comentario' : 'comentarios'}
      </h3>
      
      {/* Sección para agregar comentario */}
      {user && (
        <div className="flex gap-4 mb-6">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image
              src={user.user_metadata.avatar_url || '/avatar-placeholder.png'}
              alt="Tu avatar"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Añade un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newComment.trim()) {
                  handleSubmitComment();
                }
              }}
              className="w-full bg-transparent border-b border-zinc-700 px-2 py-1 focus:border-blue-500 outline-none"
            />
            {newComment.trim() && (
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => handleSubmitComment()}
                  className="px-4 py-2 text-sm font-medium bg-blue-500 rounded-full hover:bg-blue-600"
                >
                  Comentar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de comentarios */}
      <div className="space-y-4 mt-6">
        {isLoading ? (
          renderSkeletons()
        ) : comments.length === 0 ? (
          <p className="text-center text-zinc-400">No hay comentarios aún. ¡Sé el primero en comentar!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-3 hover:bg-[#272727] rounded-lg transition-colors">
              <div className="w-10 h-10 relative flex-shrink-0">
                <Image
                  src={comment.profiles.avatar_url}
                  alt={`Avatar de ${comment.profiles.full_name}`}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">
                    {comment.profiles.full_name}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {formatTimeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm mt-1 text-zinc-200">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
