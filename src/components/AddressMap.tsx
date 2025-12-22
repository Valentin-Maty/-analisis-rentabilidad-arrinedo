'use client'

import { useEffect, useState } from 'react'

interface AddressMapProps {
  address: string
}

export default function AddressMap({ address }: AddressMapProps) {
  const [mapUrl, setMapUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(null)
  const [locationInfo, setLocationInfo] = useState<{displayName: string, accuracy: string} | null>(null)
  
  useEffect(() => {
    if (address && address.trim().length > 3) {
      geocodeAddress(address)
    }
  }, [address])

  const geocodeAddress = async (addressToGeocode: string) => {
    setIsLoading(true)
    try {
      // Usar múltiples estrategias para mayor precisión
      const strategies = [
        // Estrategia 1: Dirección exacta con más detalles
        `${addressToGeocode}, Chile`,
        // Estrategia 2: Con región metropolitana
        `${addressToGeocode}, Santiago, Región Metropolitana, Chile`,
        // Estrategia 3: Solo la dirección principal
        addressToGeocode.split(',')[0] + ', Chile'
      ]
      
      let bestResult = null
      let highestAccuracy = 0
      
      for (const strategy of strategies) {
        const encodedAddress = encodeURIComponent(strategy)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=3&countrycodes=cl&addressdetails=1&extratags=1`
        )
        
        const data = await response.json()
        
        if (data && data.length > 0) {
          // Buscar el resultado con mejor precisión
          for (const result of data) {
            let accuracy = 0
            
            // Dar más puntos por tipo de lugar más específico
            if (result.class === 'building') accuracy += 100
            if (result.class === 'place' && result.type === 'house') accuracy += 90
            if (result.class === 'highway' && result.type === 'residential') accuracy += 80
            if (result.class === 'place' && result.type === 'neighbourhood') accuracy += 70
            
            // Dar puntos por tener número de casa
            if (result.display_name.match(/\d+/)) accuracy += 50
            
            // Dar puntos por importancia del resultado
            if (result.importance) accuracy += result.importance * 30
            
            if (accuracy > highestAccuracy) {
              highestAccuracy = accuracy
              bestResult = result
            }
          }
          
          if (bestResult) break // Si encontramos un buen resultado, no probar más estrategias
        }
      }
      
      if (bestResult) {
        const lat = parseFloat(bestResult.lat)
        const lon = parseFloat(bestResult.lon)
        setCoordinates({ lat, lon })
        
        // Crear bbox más preciso dependiendo del tipo de ubicación
        let margin = 0.003 // Margen más pequeño para mayor precisión
        
        // Ajustar zoom según el tipo de ubicación
        if (bestResult.class === 'building' || bestResult.class === 'place') {
          margin = 0.002 // Muy cercano para edificios específicos
        } else if (bestResult.class === 'highway') {
          margin = 0.004 // Un poco más amplio para calles
        }
        
        const bbox = `${lon - margin},${lat - margin},${lon + margin},${lat + margin}`
        
        // Volver a OpenStreetMap estándar pero con mejor configuración
        setMapUrl(
          `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
        )
        
        // Establecer información de precisión para mostrar al usuario
        let accuracyText = 'Ubicación aproximada'
        if (bestResult.class === 'building') accuracyText = 'Edificio específico'
        else if (bestResult.class === 'place' && bestResult.type === 'house') accuracyText = 'Casa específica'
        else if (bestResult.class === 'highway' && bestResult.type === 'residential') accuracyText = 'Calle específica'
        else if (bestResult.display_name.match(/\d+/)) accuracyText = 'Dirección con número'
        
        setLocationInfo({
          displayName: bestResult.display_name,
          accuracy: accuracyText
        })
        
        console.log('Ubicación encontrada:', {
          address: bestResult.display_name,
          accuracy: highestAccuracy,
          accuracyText,
          class: bestResult.class,
          type: bestResult.type,
          coordinates: { lat, lon }
        })
      } else {
        // Si no encuentra la dirección, usar coordenadas por defecto de Santiago
        setCoordinates({ lat: -33.45, lon: -70.6 })
        const bbox = "-70.61,-33.46,-70.59,-33.44"
        setMapUrl(
          `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=-33.45,-70.6`
        )
      }
    } catch (error) {
      console.error('Error geocodificando dirección:', error)
      // En caso de error, usar coordenadas por defecto
      setCoordinates({ lat: -33.45, lon: -70.6 })
      const bbox = "-70.61,-33.46,-70.59,-33.44"
      setMapUrl(
        `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=-33.45,-70.6`
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!address) return null

  return (
    <div className="mt-3 border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
      <div className="mb-2">
        <h4 className="text-sm font-medium text-gray-700">📍 Ubicación en el mapa</h4>
        <p className="text-xs text-gray-600">{address}</p>
        {isLoading && (
          <p className="text-xs text-blue-600 mt-1">🔍 Buscando ubicación exacta...</p>
        )}
        {locationInfo && !isLoading && (
          <div className="mt-1">
            <p className="text-xs text-green-600">✅ {locationInfo.accuracy}</p>
            <p className="text-xs text-gray-500 truncate">{locationInfo.displayName}</p>
          </div>
        )}
        {coordinates && !locationInfo && !isLoading && (
          <p className="text-xs text-yellow-600 mt-1">⚠️ Ubicación aproximada</p>
        )}
      </div>
      
      {isLoading ? (
        <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
          <div className="text-gray-500 text-sm">
            🔍 Cargando mapa...
          </div>
        </div>
      ) : mapUrl ? (
        <iframe
          width="100%"
          height="200"
          frameBorder="0"
          style={{ border: 0, borderRadius: '8px' }}
          src={mapUrl}
          allowFullScreen
        />
      ) : (
        <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
          <div className="text-gray-500 text-sm">
            🗺️ Escribe una dirección para ver el mapa
          </div>
        </div>
      )}
      
      {!isLoading && mapUrl && (
        <>
          <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
            <span>🗺️ Mapa interactivo</span>
            <a 
              href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(address + ', Chile')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Ver ubicación exacta →
            </a>
          </div>
          
          {/* Información de zona para futuro análisis */}
          <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>💡 Análisis por zona:</strong> Esta ubicación permite identificar propiedades similares 
              y realizar análisis de precios por área geográfica específica.
              {coordinates && (
                <span className="block mt-1 text-gray-600">
                  Coordenadas: {coordinates.lat.toFixed(4)}, {coordinates.lon.toFixed(4)}
                </span>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  )
}