import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useApartment } from "../context/ApartmentContext";

const kenyaBounds = [
  [-4.62, 33.91],
  [5.20, 41.89],
];

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationPicker({ latitude, longitude, onPick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPick(lat, lng);
    },
  });
  return latitude && longitude ? (
    <Marker position={[latitude, longitude]} icon={markerIcon} />
  ) : null;
}

function MapMover({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 14);
    }
  }, [coords]);
  return null;
}

export default function ApartmentForm({ nextStep }) {
  const { formData, setFormData } = useApartment();
  const [universities, setUniversities] = useState([]);
  const [locationQuery, setLocationQuery] = useState("");
  const [searchedCoords, setSearchedCoords] = useState(null);
  const [mapCenter, setMapCenter] = useState([-1.286389, 36.817223]); // Nairobi default
  const [mapZoom, setMapZoom] = useState(7);
  const [distance, setDistance] = useState(null);
  const [loadingDistance, setLoadingDistance] = useState(false);

  // ✅ Fetch all universities (handle pagination)
  useEffect(() => {
    const fetchAllUniversities = async (url = "/universities/universities/", all = []) => {
      try {
        const res = await axiosInstance.get(url);
        const data = res.data;
        const combined = [...all, ...data.results];
        if (data.next) return fetchAllUniversities(data.next, combined);
        setUniversities(combined);
      } catch (err) {
        console.error("Error fetching universities:", err);
      }
    };
    fetchAllUniversities();
  }, []);

  // ✅ Handle university select
  const handleUniversitySelect = (e) => {
  const uniId = parseInt(e.target.value);
  const uni = universities.find((u) => u.id === uniId);
  if (uni) {
    setFormData((prev) => ({
      ...prev,
      university: uni.id,
      university_name: uni.name, // ✅ store university name
      uni_lat: uni.lat,
      uni_lng: uni.lng,
    }));
    setMapCenter([uni.lat, uni.lng]);
    setMapZoom(13);
  }
};


  // ✅ Search for location (restricted to Kenya)
  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!locationQuery.trim()) return alert("Enter a place name to search");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ke&q=${encodeURIComponent(
          locationQuery
        )}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        setFormData((p) => ({ ...p, latitude: latNum, longitude: lonNum }));
        setSearchedCoords([latNum, lonNum]);
      } else {
        alert("No results found for that location.");
      }
    } catch (err) {
      console.error("Location search failed:", err);
    }
  };

  // ✅ Map click
  const handleMapPick = (lat, lon) => {
    setFormData((p) => ({ ...p, latitude: lat, longitude: lon }));
  };

  // ✅ Auto calculate distance from university
  useEffect(() => {
    const { uni_lat, uni_lng, latitude, longitude } = formData;
    if (!uni_lat || !uni_lng || !latitude || !longitude) return;

    const calculateDistance = async () => {
      setLoadingDistance(true);
      try {
        const res = await axiosInstance.get("/apartments/calculate-distance/", {
          params: {
            uni_lat,
            uni_lon: uni_lng,
            apt_lat: latitude,
            apt_lon: longitude,
          },
        });
        setDistance(res.data.distance_km);
      } catch (err) {
        console.error("Distance calculation error:", err);
      } finally {
        setLoadingDistance(false);
      }
    };
    calculateDistance();
  }, [formData.uni_lat, formData.uni_lng, formData.latitude, formData.longitude]);

  // ✅ Validation before next step
  const handleNext = () => {
    const { name, university, latitude, longitude, address } = formData;
    if (!name || !university || !latitude || !longitude || !address) {
      alert("Please fill in all required fields and pick a location.");
      return;
    }
    nextStep();
  };

  return (
    <div className="p-4 max-w-lg mx-auto bg-white shadow rounded space-y-3">
      <h2 className="text-lg font-semibold text-center">🏘️ Add Apartment</h2>

      {/* Apartment Name */}
      <input
        type="text"
        placeholder="Apartment Name"
        value={formData.name || ""}
        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
        className="w-full border p-2 rounded"
      />

      {/* University Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Select University
        </label>
        <select
          onChange={handleUniversitySelect}
          value={formData.university || ""}
          className="w-full border p-2 rounded"
        >
          <option value="">-- Choose University --</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.town})
            </option>
          ))}
        </select>
      </div>

      {/* Address */}
      <input
        type="text"
        placeholder="Apartment Address"
        value={formData.address || ""}
        onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
        className="w-full border p-2 rounded"
      />

      {/* Description */}
      <textarea
        placeholder="Apartment Description"
        value={formData.description || ""}
        onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
        className="w-full border p-2 rounded"
      />

      {/* Location Search */}
      <form onSubmit={handleLocationSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search location in Kenya"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-3 rounded">
          Search
        </button>
      </form>

      {/* Map */}
      <div className="border rounded overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "350px", width: "100%" }}
          maxBounds={kenyaBounds}
          minZoom={6}
          maxZoom={18}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <LocationPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            onPick={handleMapPick}
          />
          {searchedCoords && <MapMover coords={searchedCoords} />}
        </MapContainer>
      </div>

      {/* Distance */}
      {loadingDistance ? (
        <p className="text-center text-gray-500">Calculating distance...</p>
      ) : distance ? (
        <p className="text-center text-green-600 font-semibold">
          📏 Distance: {parseFloat(distance).toFixed(2)} km
        </p>
      ) : (
        <p className="text-center text-gray-400">Select both points to see distance.</p>
      )}

      {/* Next */}
      <button
        onClick={handleNext}
        className="w-full bg-blue-700 text-white p-2 rounded"
      >
        Next: Add Rooms →
      </button>
    </div>
  );
}
