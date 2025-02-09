import { setupStorageBuckets } from '../lib/supabase'

async function main() {
  console.log('Iniciando configuración de almacenamiento...')
  await setupStorageBuckets()
  console.log('Configuración completada')
}

main().catch(console.error)
    