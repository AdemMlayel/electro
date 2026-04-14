"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Crosshair, Search } from "lucide-react";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

// Default center: Tunis, Tunisia
const TUNISIA_CENTER = {
  lat: 36.8065,
  lng: 10.1815,
};

export default function LocationPicker({
  onLocationSelect,
  initialLat = TUNISIA_CENTER.lat,
  initialLng = TUNISIA_CENTER.lng,
  initialAddress = "",
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [address, setAddress] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current).setView([initialLat, initialLng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add initial marker if location provided
    if (initialLat && initialLng) {
      markerRef.current = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);

      markerRef.current.on("dragend", function (e) {
        const marker = e.target;
        const position = marker.getLatLng();
        setSelectedLocation({ lat: position.lat, lng: position.lng });
        reverseGeocode(position.lat, position.lng);
      });
    }

    // Handle map click
    map.on("click", function (e) {
      const { lat, lng } = e.latlng;
      setSelectedLocation({ lat, lng });

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current.on("dragend", function (ev) {
          const marker = ev.target;
          const position = marker.getLatLng();
          setSelectedLocation({ lat: position.lat, lng: position.lng });
          reverseGeocode(position.lat, position.lng);
        });
      }

      reverseGeocode(lat, lng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [initialLat, initialLng]);

  // Update parent when location changes
  useEffect(() => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.lat, selectedLocation.lng, address);
    }
  }, [selectedLocation, address, onLocationSelect]);

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error("Failed to reverse geocode:", error);
    }
  };

  // Search for location by address
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setIsSearching(true);
    try {
      // Add Tunisia to search query for better results
      const searchWithCountry = searchQuery.toLowerCase().includes('tunisia') || searchQuery.toLowerCase().includes('tunisie')
        ? searchQuery
        : `${searchQuery}, Tunisia`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchWithCountry)}&limit=1&countrycodes=tn`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lon);

        mapInstanceRef.current.setView([latNum, lngNum], 15);
        setSelectedLocation({ lat: latNum, lng: lngNum });
        setAddress(display_name);

        if (markerRef.current) {
          markerRef.current.setLatLng([latNum, lngNum]);
        } else {
          markerRef.current = L.marker([latNum, lngNum], { draggable: true }).addTo(mapInstanceRef.current);
          markerRef.current.on("dragend", function (ev) {
            const marker = ev.target;
            const position = marker.getLatLng();
            setSelectedLocation({ lat: position.lat, lng: position.lng });
            reverseGeocode(position.lat, position.lng);
          });
        }
      } else {
        alert("Location not found. Try a more specific address.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapInstanceRef.current!.setView([latitude, longitude], 15);
        setSelectedLocation({ lat: latitude, lng: longitude });

        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        } else {
          markerRef.current = L.marker([latitude, longitude], { draggable: true }).addTo(mapInstanceRef.current!);
          markerRef.current.on("dragend", function (ev) {
            const marker = ev.target;
            const pos = marker.getLatLng();
            setSelectedLocation({ lat: pos.lat, lng: pos.lng });
            reverseGeocode(pos.lat, pos.lng);
          });
        }

        reverseGeocode(latitude, longitude);
        setGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please allow location access or search for an address.");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for an address..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-ink-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-frosted-500 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2.5 bg-frosted-500 text-white rounded-xl hover:bg-frosted-600 transition disabled:opacity-50 text-sm font-medium"
        >
          {isSearching ? "..." : "Search"}
        </button>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={gettingLocation}
          className="px-4 py-2.5 bg-slate-blue-500 text-white rounded-xl hover:bg-slate-blue-600 transition disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
          title="Use my current location"
        >
          <Crosshair className={`w-4 h-4 ${gettingLocation ? "animate-spin" : ""}`} />
        </button>
      </form>

      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <div ref={mapRef} className="w-full h-80" style={{ minHeight: "320px" }} />

        {/* Instructions Overlay */}
        {!selectedLocation && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-center">
              <p className="text-sm text-ink-600 flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-frosted-500" />
                Click on the map to select your location
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="bg-green-50 rounded-xl p-3 border border-green-200">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-green-800 font-medium">Location Selected</p>
              {address && <p className="text-xs text-green-700 mt-1 line-clamp-2">{address}</p>}
              <p className="text-xs text-green-600 mt-1">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
