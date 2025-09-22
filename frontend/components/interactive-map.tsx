"use client"

import { useState, useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Html, Box, Sphere } from "@react-three/drei"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Phone, Clock, ExternalLink, Map } from "lucide-react"
import * as THREE from "three"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { useLoadScript, GoogleMap as GoogleMapComponent } from "@react-google-maps/api"
import "leaflet/dist/leaflet.css"

// Fix Leaflet icon issue
import L from "leaflet"
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

interface InteractiveMapProps {
  latitude: number
  longitude: number
  zoom?: number
  className?: string
  position?: [number, number]
  popupText?: string
}

function MapMarker({
  position,
  onClick,
  isActive,
}: { position: [number, number, number]; onClick: () => void; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <group position={position} onClick={onClick}>
      {/* Marker Pin */}
      <mesh ref={meshRef} position={[0, 1, 0]}>
        <coneGeometry args={[0.3, 1, 8]} />
        <meshStandardMaterial color={isActive ? "#ef4444" : "#3b82f6"} />
      </mesh>

      {/* Marker Base */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color={isActive ? "#dc2626" : "#2563eb"} />
      </mesh>

      {/* Pulsing Ring */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshStandardMaterial
          color={isActive ? "#ef4444" : "#3b82f6"}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Store Label */}
      <Html position={[0, 2, 0]} center>
        <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 pointer-events-none">
          <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Karachi Phone Store</p>
        </div>
      </Html>
    </group>
  )
}

function CityBuildings() {
  const buildings = [
    { position: [-3, 0.5, -2], size: [0.8, 1, 0.8], color: "#64748b" },
    { position: [-1, 0.75, -3], size: [0.6, 1.5, 0.6], color: "#475569" },
    { position: [2, 0.4, -1], size: [1, 0.8, 1], color: "#6b7280" },
    { position: [3, 1, -3], size: [0.7, 2, 0.7], color: "#52525b" },
    { position: [-2, 0.6, 2], size: [0.9, 1.2, 0.9], color: "#71717a" },
    { position: [1, 0.3, 3], size: [1.2, 0.6, 1.2], color: "#737373" },
  ]

  return (
    <group>
      {buildings.map((building, index) => (
        <Box
          key={index}
          position={building.position as [number, number, number]}
          args={building.size as [number, number, number]}
        >
          <meshStandardMaterial color={building.color} />
        </Box>
      ))}
    </group>
  )
}

function Roads() {
  return (
    <group>
      {/* Main Road */}
      <Box position={[0, 0.01, 0]} args={[8, 0.02, 1]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#374151" />
      </Box>

      {/* Cross Road */}
      <Box position={[0, 0.01, 0]} args={[1, 0.02, 8]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#374151" />
      </Box>

      {/* Road Markings */}
      <Box position={[0, 0.02, 0]} args={[6, 0.01, 0.1]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#fbbf24" />
      </Box>
      <Box position={[0, 0.02, 0]} args={[0.1, 0.01, 6]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#fbbf24" />
      </Box>
    </group>
  )
}

function Ground() {
  return (
    <Box position={[0, -0.1, 0]} args={[20, 0.2, 20]}>
      <meshStandardMaterial color="#10b981" />
    </Box>
  )
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

function GoogleMap({ latitude, longitude, zoom = 13 }: InteractiveMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })

  if (loadError) {
    return <div>Error loading Google Maps</div>
  }

  if (!isLoaded) {
    return <div>Loading Google Maps...</div>
  }

  return (
    <GoogleMapComponent
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={{ lat: latitude, lng: longitude }}
      zoom={zoom}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      <Marker position={{ lat: latitude, lng: longitude }} title="Karachi Phone Store" />
    </GoogleMapComponent>
  )
}

function InteractiveMapLeaflet({ latitude, longitude, zoom = 13 }: InteractiveMapProps) {
  const position: [number, number] = [latitude, longitude]

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
    >
      <ChangeView center={position} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>Karachi Phone Store</Popup>
      </Marker>
    </MapContainer>
  )
}

export default function InteractiveMap({ latitude, longitude, zoom = 13 }: InteractiveMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [showGoogleMap, setShowGoogleMap] = useState(false)

  const storeInfo = {
    name: "Karachi Phone Store",
    address: "123 Shahrah-e-Faisal, Karachi, Pakistan",
    phone: "+92 300 1234567",
    hours: "9:00 AM - 8:00 PM",
    coordinates: "24.8607° N, 67.0011° E",
    lat: 24.8607,
    lng: 67.0011,
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${storeInfo.lat},${storeInfo.lng}`
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${storeInfo.lat},${storeInfo.lng}`

  const openGoogleMaps = () => {
    window.open(googleMapsUrl, "_blank")
  }

  const openDirections = () => {
    window.open(googleMapsDirectionsUrl, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Map Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <Button
          onClick={() => setShowGoogleMap(false)}
          variant={!showGoogleMap ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
          3D Interactive Map
        </Button>
        <Button
          onClick={() => setShowGoogleMap(true)}
          variant={showGoogleMap ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <Map className="h-4 w-4" />
          Google Maps
        </Button>
      </div>

      {!showGoogleMap ? (
        <div className="relative w-full h-[600px] bg-gradient-to-b from-sky-200 to-green-200 dark:from-sky-900 dark:to-green-900 rounded-3xl overflow-hidden">
          <Canvas camera={{ position: [8, 8, 8], fov: 60 }} shadows className="w-full h-full">
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <Environment preset="city" />
            <Ground />
            <Roads />
            <CityBuildings />
            <MapMarker
              position={[0, 0, 0]}
              onClick={() => {
                setSelectedLocation("store")
                setShowInfo(true)
              }}
              isActive={selectedLocation === "store"}
            />
            <Sphere position={[-4, 0.5, -4]} args={[0.3]}>
              <meshStandardMaterial color="#f59e0b" />
            </Sphere>
            <Html position={[-4, 1.2, -4]} center>
              <div className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded text-xs font-medium text-yellow-800 dark:text-yellow-200 pointer-events-none">
                Mall
              </div>
            </Html>
            <Box position={[4, 0.3, 4]} args={[0.6, 0.6, 0.6]}>
              <meshStandardMaterial color="#10b981" />
            </Box>
            <Html position={[4, 1, 4]} center>
              <div className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs font-medium text-green-800 dark:text-green-200 pointer-events-none">
                Park
              </div>
            </Html>
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={15}
              maxPolarAngle={Math.PI / 2.2}
            />
          </Canvas>

          <div className="absolute top-4 left-4 space-y-2">
            <Button
              size="sm"
              className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-800 shadow-lg"
              onClick={() => setShowInfo(!showInfo)}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Store Info
            </Button>
            <Button
              size="sm"
              className="bg-blue-500/90 hover:bg-blue-600 text-white shadow-lg"
              onClick={openDirections}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
            <Button
              size="sm"
              className="bg-green-500/90 hover:bg-green-600 text-white shadow-lg"
              onClick={openGoogleMaps}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Google Maps
            </Button>
          </div>

          {showInfo && (
            <div className="absolute bottom-4 left-4 right-4">
              <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{storeInfo.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">📍 {storeInfo.address}</p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">🌐 {storeInfo.coordinates}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowInfo(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{storeInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{storeInfo.hours}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                      <Phone className="h-3 w-3 mr-1" />
                      Call Store
                    </Button>
                    <Button size="sm" variant="outline" onClick={openDirections}>
                      <Navigation className="h-3 w-3 mr-1" />
                      Get Directions
                    </Button>
                    <Button size="sm" variant="outline" onClick={openGoogleMaps}>
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Google Maps
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="absolute top-4 right-4">
            <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="p-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Map Legend</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Our Store</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Shopping Mall</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Park</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl">
          <GoogleMap latitude={storeInfo.lat} longitude={storeInfo.lng} zoom={13} />
          <div className="absolute top-4 left-4 space-y-2">
            <Button
              size="sm"
              className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-800 shadow-lg"
              onClick={openGoogleMaps}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Full Map
            </Button>
            <Button
              size="sm"
              className="bg-blue-500/90 hover:bg-blue-600 text-white shadow-lg"
              onClick={openDirections}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{storeInfo.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{storeInfo.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" onClick={openDirections}>
                      <Navigation className="h-3 w-3 mr-1" />
                      Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Navigation className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Turn-by-Turn Directions</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Get precise navigation to our store</p>
            <Button size="sm" onClick={openDirections} className="w-full">
              Get Directions
            </Button>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Exact Location</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">View our store on Google Maps</p>
            <Button size="sm" onClick={openGoogleMaps} className="w-full">
              View on Maps
            </Button>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Call Before Visit</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Confirm availability and hours</p>
            <Button size="sm" className="w-full">
              <Phone className="h-3 w-3 mr-1" />
              {storeInfo.phone}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 h-[400px]">
        <InteractiveMapLeaflet latitude={storeInfo.lat} longitude={storeInfo.lng} zoom={13} />
      </div>
    </div>
  )
}