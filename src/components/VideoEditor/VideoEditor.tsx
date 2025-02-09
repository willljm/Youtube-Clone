'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  PlayCircle, 
  PauseCircle, 
  Plus,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'

interface Advertisement {
  id: string
  timestamp: number
  duration: number
  title: string
  description: string
  type: 'overlay' | 'midroll' | 'audio'
  url?: string
  position?: 'top' | 'bottom' | 'center'
  backgroundColor?: string
  textColor?: string
  fontSize?: number
  audioUrl?: string
}

interface VideoEditorProps {
  videoUrl: string
  onSave?: (ads: Advertisement[]) => void
}

const VideoEditor: React.FC<VideoEditorProps> = ({ videoUrl, onSave }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [adType, setAdType] = useState<'overlay' | 'midroll' | 'audio'>('overlay')
  const [showAdForm, setShowAdForm] = useState(false)

  useEffect(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }, [videoRef.current?.duration])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSliderChange = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const addAdvertisement = () => {
    const newAd: Advertisement = {
      id: Date.now().toString(),
      timestamp: currentTime,
      duration: 15,
      title: 'Nuevo Anuncio',
      description: 'Descripción del anuncio',
      type: adType,
      position: 'bottom',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      fontSize: 16
    }
    setAdvertisements([...advertisements, newAd])
    setSelectedAd(newAd)
    setShowAdForm(true)
  }

  const updateAdvertisement = (ad: Advertisement) => {
    setAdvertisements(advertisements.map(a => 
      a.id === ad.id ? ad : a
    ))
  }

  const removeAdvertisement = (adId: string) => {
    setAdvertisements(advertisements.filter(ad => ad.id !== adId))
    if (selectedAd?.id === adId) {
      setSelectedAd(null)
    }
  }

  const renderAdForm = () => {
    if (!selectedAd || !showAdForm) return null;

    return (
      <Card className="w-full mt-4">
        <CardHeader>
          <CardTitle>Editar Anuncio</CardTitle>
          <CardDescription>Configura los detalles del anuncio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Tipo de Anuncio</Label>
              <select 
                className="w-full p-2 border rounded"
                value={selectedAd.type}
                onChange={(e) => updateAdvertisement({
                  ...selectedAd,
                  type: e.target.value as Advertisement['type']
                })}
              >
                <option value="overlay">Texto Superpuesto</option>
                <option value="midroll">Anuncio a Mitad del Video</option>
                <option value="audio">Audio</option>
              </select>
            </div>

            <div>
              <Label>Título</Label>
              <Input
                value={selectedAd.title}
                onChange={(e) => updateAdvertisement({
                  ...selectedAd,
                  title: e.target.value
                })}
              />
            </div>

            <div>
              <Label>Descripción</Label>
              <Input
                value={selectedAd.description}
                onChange={(e) => updateAdvertisement({
                  ...selectedAd,
                  description: e.target.value
                })}
              />
            </div>

            <div>
              <Label>Duración (segundos)</Label>
              <Input
                type="number"
                value={selectedAd.duration}
                onChange={(e) => updateAdvertisement({
                  ...selectedAd,
                  duration: Number(e.target.value)
                })}
              />
            </div>

            {selectedAd.type === 'overlay' && (
              <>
                <div>
                  <Label>Posición</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedAd.position}
                    onChange={(e) => updateAdvertisement({
                      ...selectedAd,
                      position: e.target.value as 'top' | 'bottom' | 'center'
                    })}
                  >
                    <option value="top">Arriba</option>
                    <option value="center">Centro</option>
                    <option value="bottom">Abajo</option>
                  </select>
                </div>

                <div>
                  <Label>Color de Fondo</Label>
                  <Input
                    type="color"
                    value={selectedAd.backgroundColor}
                    onChange={(e) => updateAdvertisement({
                      ...selectedAd,
                      backgroundColor: e.target.value
                    })}
                  />
                </div>

                <div>
                  <Label>Color de Texto</Label>
                  <Input
                    type="color"
                    value={selectedAd.textColor}
                    onChange={(e) => updateAdvertisement({
                      ...selectedAd,
                      textColor: e.target.value
                    })}
                  />
                </div>

                <div>
                  <Label>Tamaño de Fuente</Label>
                  <Input
                    type="number"
                    value={selectedAd.fontSize}
                    onChange={(e) => updateAdvertisement({
                      ...selectedAd,
                      fontSize: Number(e.target.value)
                    })}
                  />
                </div>
              </>
            )}

            {selectedAd.type === 'audio' && (
              <div>
                <Label>URL del Audio</Label>
                <Input
                  value={selectedAd.audioUrl || ''}
                  onChange={(e) => updateAdvertisement({
                    ...selectedAd,
                    audioUrl: e.target.value
                  })}
                  placeholder="https://ejemplo.com/audio.mp3"
                />
              </div>
            )}

            {selectedAd.type === 'midroll' && (
              <div>
                <Label>URL del Anuncio</Label>
                <Input
                  value={selectedAd.url || ''}
                  onChange={(e) => updateAdvertisement({
                    ...selectedAd,
                    url: e.target.value
                  })}
                  placeholder="https://ejemplo.com/anuncio"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render overlay ads during video playback
  const renderOverlayAds = () => {
    if (!previewMode) return null;

    return advertisements
      .filter(ad => ad.type === 'overlay' && 
        currentTime >= ad.timestamp && 
        currentTime <= (ad.timestamp + ad.duration)
      )
      .map(ad => (
        <div
          key={ad.id}
          style={{
            position: 'absolute',
            [ad.position === 'top' ? 'top' : ad.position === 'bottom' ? 'bottom' : 'top']: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: ad.backgroundColor,
            color: ad.textColor,
            padding: '10px',
            borderRadius: '5px',
            fontSize: `${ad.fontSize}px`,
            zIndex: 1000
          }}
        >
          {ad.title}
        </div>
      ))
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const jumpToAd = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp
      setCurrentTime(timestamp)
    }
  }

  return (
    <div className="w-full h-[calc(100vh-200px)] flex flex-col space-y-4 overflow-y-auto">
      <div className="relative flex-shrink-0">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full"
          onTimeUpdate={handleTimeUpdate}
        />
        {renderOverlayAds()}
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <Button onClick={togglePlay}>
          {isPlaying ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
        </Button>
        <Slider
          value={[currentTime]}
          min={0}
          max={duration}
          step={0.1}
          onValueChange={handleSliderChange}
        />
      </div>

      <div className="flex justify-between items-center flex-shrink-0">
        <div className="flex gap-2">
          <select
            className="p-2 border rounded"
            value={adType}
            onChange={(e) => setAdType(e.target.value as Advertisement['type'])}
          >
            <option value="overlay">Texto Superpuesto</option>
            <option value="midroll">Anuncio a Mitad</option>
            <option value="audio">Audio</option>
          </select>
          <Button onClick={addAdvertisement}>
            <Plus className="h-4 w-4 mr-2" /> Añadir Anuncio
          </Button>
        </div>
        <Button
          variant={previewMode ? "default" : "outline"}
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? "Editar" : "Vista Previa"}
        </Button>
      </div>

      {/* Lista de anuncios */}
      <div className="space-y-2 flex-1 overflow-y-auto min-h-[200px]">
        {advertisements.map(ad => (
          <Card key={ad.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{ad.title}</h4>
                <p className="text-sm text-gray-500">
                  {ad.type === 'overlay' ? 'Texto Superpuesto' : 
                   ad.type === 'midroll' ? 'Anuncio a Mitad' : 'Audio'} - 
                  {Math.floor(ad.timestamp)}s
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedAd(ad)
                    setShowAdForm(true)
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeAdvertisement(ad.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {renderAdForm()}
    </div>
  )
}

export default VideoEditor
