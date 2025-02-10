'use client'

import { useSubscription } from '@/hooks/useSubscription'

export default function SubscribeButton({ channelId }: { channelId: string }) {
  const { isSubscribed, isLoading, handleSubscribe } = useSubscription(channelId)

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={`px-4 py-2 rounded-full font-medium transition-all
        ${isSubscribed 
          ? 'bg-zinc-700 hover:bg-zinc-600 text-white' 
          : 'bg-white text-black hover:bg-zinc-200'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isLoading ? 'Cargando...' : isSubscribed ? 'Suscrito' : 'Suscribirse'}
    </button>
  )
}
