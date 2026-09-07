import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/site/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Navigation, Loader2, Search, Crosshair } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path issues with Webpack/Vite
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const Route = createFileRoute("/hospitals")({
  head: () => ({ meta: [{ title: "Hospital Finder — SehatSaathi AI" }] }),
  component: HospitalFinder,
});

const PAKISTAN_CITIES = [
  { name: "Lahore", lat: 31.5204, lon: 74.3587 },
  { name: "Karachi", lat: 24.8607, lon: 67.0011 },
  { name: "Islamabad", lat: 33.6844, lon: 73.0479 },
  { name: "Rawalpindi", lat: 33.5973, lon: 73.0479 },
  { name: "Faisalabad", lat: 31.4504, lon: 73.1350 },
  { name: "Multan", lat: 30.1968, lon: 71.4697 },
  { name: "Peshawar", lat: 34.0151, lon: 71.5249 },
  { name: "Quetta", lat: 30.1798, lon: 66.9750 },
];

type HospitalData = {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    amenity?: string;
    phone?: string;
    contact_phone?: string;
    "contact:phone"?: string;
    "addr:street"?: string;
    "addr:full"?: string;
    address?: string;
    operator?: string;
  };
};

function ChangeMapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

function HospitalFinder() {
  const [selectedCity, setSelectedCity] = useState<{name: string, lat: number, lon: number}>(PAKISTAN_CITIES[0]);
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHospital, setSelectedHospital] = useState<HospitalData | null>(null);

  // Default to Pakistan center initially, will update to city
  const [mapCenter, setMapCenter] = useState<[number, number]>([selectedCity.lat, selectedCity.lon]);

  const fetchHospitals = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      // Nominatim search in a ~10km bounding box around the coordinates. EXTREMELY fast and reliable.
      const searchUrl = `https://nominatim.openstreetmap.org/search?q=hospital&format=json&addressdetails=1&limit=50&viewbox=${lon-0.1},${lat-0.1},${lon+0.1},${lat+0.1}&bounded=1`;
      const res = await fetch(searchUrl, { headers: { 'User-Agent': 'SehatSaathi/1.0' } });
      const data = await res.json();
      
      const parsedHospitals = data.map((el: any) => ({
        id: el.place_id,
        lat: parseFloat(el.lat),
        lon: parseFloat(el.lon),
        tags: {
          name: el.name || el.address?.hospital || el.address?.clinic || "Unnamed Hospital",
          amenity: el.type || "hospital",
          address: el.display_name,
          phone: "Not available" // Nominatim doesn't provide phone directly in standard search, but we show the full real address.
        },
      }));
      setHospitals(parsedHospitals);
    } catch (error) {
      console.error("Failed to fetch real hospitals:", error);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setSelectedCity({ name: "My Location", lat, lon });
      },
      (err) => {
        setLoading(false);
        alert("Unable to retrieve your location. Please check browser permissions.");
      }
    );
  };

  useEffect(() => {
    setMapCenter([selectedCity.lat, selectedCity.lon]);
    fetchHospitals(selectedCity.lat, selectedCity.lon);
    setSelectedHospital(null);
  }, [selectedCity]);

  const getPhone = (tags: any) => tags.phone || tags["contact:phone"] || tags.contact_phone || "Not available";
  const getAddress = (tags: any) => tags["addr:full"] || tags["addr:street"] || tags.address || "Address not available";

  const filteredHospitals = hospitals.filter(h => 
    (h.tags.name || h.tags.operator || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageShell
      eyebrow="Module 08"
      title="Hospital Finder"
      description="Instantly locate hospitals and clinics near you. Get directions, contact numbers, and complete addresses."
    >
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-16rem)] min-h-[600px]">
        
        {/* Sidebar */}
        <Card className="w-full lg:w-96 flex flex-col rounded-3xl border-border/60 shadow-lift overflow-hidden shrink-0 h-full">
          <div className="p-5 border-b border-border/60 bg-secondary/30">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <MapPin className="size-4 text-primary" /> Location
              </h2>
              <Button size="sm" variant="secondary" onClick={detectLocation} className="h-7 text-xs rounded-full shadow-soft bg-primary/10 text-primary hover:bg-primary/20">
                <Crosshair className="size-3 mr-1" /> My Location
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {PAKISTAN_CITIES.map(c => (
                <Badge
                  key={c.name}
                  variant={selectedCity.name === c.name ? "default" : "outline"}
                  className="cursor-pointer rounded-full px-3 py-1 text-xs transition-colors"
                  onClick={() => setSelectedCity(c)}
                >
                  {c.name}
                </Badge>
              ))}
              {selectedCity.name === "My Location" && (
                <Badge variant="default" className="cursor-pointer rounded-full px-3 py-1 text-xs">My Location</Badge>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search hospitals..." 
                className="pl-9 rounded-full h-10 bg-background border-border/60"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Loader2 className="size-6 animate-spin mb-2" />
                <p className="text-sm">Locating hospitals in {selectedCity.name}...</p>
              </div>
            ) : filteredHospitals.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No hospitals found. Try another search.
              </div>
            ) : (
              filteredHospitals.map(h => (
                <div 
                  key={h.id} 
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedHospital?.id === h.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border/60 hover:border-primary/40 bg-card'}`}
                  onClick={() => {
                    setSelectedHospital(h);
                    setMapCenter([h.lat, h.lon]);
                  }}
                >
                  <h3 className="font-bold text-sm mb-1 text-foreground/90">{h.tags.name || h.tags.operator || "Unnamed Hospital"}</h3>
                  <Badge variant="secondary" className="mb-2 text-[10px] rounded-sm">{h.tags.amenity === "clinic" ? "Clinic" : "Hospital"}</Badge>
                  
                  <div className="space-y-1.5 mt-2">
                    <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <MapPin className="size-3.5 shrink-0 mt-0.5 text-primary" />
                      <span className="line-clamp-2">{getAddress(h.tags)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Phone className="size-3.5 shrink-0 text-primary" />
                      {getPhone(h.tags)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Map Area */}
        <Card className="flex-1 rounded-3xl border-border/60 shadow-lift overflow-hidden relative min-h-[400px]">
          <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }}>
            <ChangeMapCenter center={mapCenter} />
            <TileLayer
              attribution=""
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredHospitals.map(h => (
              <Marker 
                key={h.id} 
                position={[h.lat, h.lon]} 
                icon={customIcon}
                eventHandlers={{
                  click: () => setSelectedHospital(h)
                }}
              >
                <Popup className="rounded-xl overflow-hidden">
                  <div className="p-1 min-w-[200px]">
                    <h3 className="font-bold text-base mb-1">{h.tags.name || h.tags.operator || "Unnamed Hospital"}</h3>
                    <p className="text-xs text-gray-500 mb-3">{getAddress(h.tags)}</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 rounded-full text-xs h-8"
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`, '_blank')}
                      >
                        <Navigation className="size-3 mr-1" /> Directions
                      </Button>
                      {getPhone(h.tags) !== "Not available" && (
                        <Button size="sm" variant="outline" className="flex-1 rounded-full text-xs h-8">
                          <Phone className="size-3 mr-1" /> Call
                        </Button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating Mobile Details Panel */}
          {selectedHospital && (
            <div className="absolute bottom-6 left-6 right-6 lg:hidden bg-card/95 backdrop-blur-md border border-border/60 rounded-2xl p-4 shadow-xl z-[1000] animate-in slide-in-from-bottom-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-base">{selectedHospital.tags.name || selectedHospital.tags.operator || "Unnamed Hospital"}</h3>
                <Button variant="ghost" size="icon" className="size-6 rounded-full -mr-2 -mt-2" onClick={() => setSelectedHospital(null)}>
                  <span className="text-lg leading-none">&times;</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground flex items-start gap-1.5 mb-1">
                <MapPin className="size-3.5 shrink-0 mt-0.5 text-primary" />
                <span className="line-clamp-2">{getAddress(selectedHospital.tags)}</span>
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
                <Phone className="size-3.5 shrink-0 text-primary" />
                {getPhone(selectedHospital.tags)}
              </p>
              <Button 
                className="w-full rounded-full text-sm h-10 shadow-soft"
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lon}`, '_blank')}
              >
                <Navigation className="size-4 mr-2" /> Get Directions
              </Button>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
