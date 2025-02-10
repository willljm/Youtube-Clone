'use client'

import { useSubscription } from '@/hooks/useSubscription'

export default function SubscribeButton({ 
  channelId,
  size = 'default'
}: { 
  channelId: string
  size?: 'small' | 'default' | 'large'
}) {
  const { isSubscribed, isLoading, handleSubscribe } = useSubscription(channelId)

  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    default: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        rounded-full
        font-medium
        transition-all
        duration-200
        ${isSubscribed 
          ? 'bg-zinc-700 hover:bg-zinc-600 text-white' 
          : 'bg-white text-black hover:bg-zinc-200'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
      `}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin" />
          Cargando...
        </span>
      ) : (
        isSubscribed ? 'Suscrito' : 'Suscribirse'
      )}
    </button>
  )
}
