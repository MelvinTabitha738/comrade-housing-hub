import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useApartment } from "../context/ApartmentContext";

// Custom marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Location picker component
function LocationPicker() {
  const { setFormData } = useApartment();
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
    },
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

const ApartmentForm = ({ nextStep }) => {
  const { formData, setFormData } = useApartment();
  const [universities, setUniversities] = useState([]);
  const [distance, setDistance] = useState(null);
  const [loadingDistance, setLoadingDistance] = useState(false);

  // Fetch universities for dropdown
  useEffect(() => {
    axiosInstance
      .get("/universities/")
      .then((res) => setUniversities(res.data))
      .catch((err) => console.error("Error fetching universities:", err));
  }, []);

  // Calculate distance when location/university changes
  useEffect(() => {
    const { university, latitude, longitude } = formData;
    if (university && latitude && longitude) {
      setLoadingDistance(true);
      axiosInstance
        .get(`/apartments/apartments/distance/`, {
          params: { university, lat: latitude, lon: longitude },
        })
        .then((res) => setDistance(res.data.distance_km))
        .catch(() => setDistance(null))
        .finally(() => setLoadingDistance(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.university, formData.latitude, formData.longitude]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle "Next" button
  const handleNext = () => {
    // Optional: Validate required fields
    const { name, university, address, monthly_rent, latitude, longitude } = formData;
    if (!name || !university || !address || !monthly_rent || !latitude || !longitude) {
      return alert("Please fill in all required fields and select a location.");
    }

    // Step 1 data is already in context, just move to next step
    nextStep();
  };

  return (
    <div className="p-4 max-w-lg mx-auto bg-white shadow-md rounded-lg space-y-4">
      <h2 className="text-xl font-semibold text-center">🏠 Add Apartment</h2>

      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Apartment Name"
        className="w-full border p-2 rounded"
        required
      />

      <select
        name="university"
        value={formData.university}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      >
        <option value="">Select University</option>
        {Array.isArray(universities) && universities.map((uni) => (
  <option key={uni.id} value={uni.id}>
    {uni.name}
  </option>
))}

      </select>

      <input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Address"
        className="w-full border p-2 rounded"
        required
      />

      <input
        type="number"
        name="monthly_rent"
        value={formData.monthly_rent}
        onChange={handleChange}
        placeholder="Monthly Rent (KES)"
        className="w-full border p-2 rounded"
        required
      />

      <textarea
        name="amenities"
        value={formData.amenities}
        onChange={handleChange}
        placeholder="Amenities (comma-separated)"
        className="w-full border p-2 rounded"
      />

      {/* Map */}
      <div className="border rounded overflow-hidden">
        <h3 className="text-sm font-semibold p-2 bg-gray-100">
          📍 Pick Apartment Location
        </h3>
        <MapContainer
          center={[-1.286389, 36.817223]}
          zoom={10}
          style={{ height: "300px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationPicker />
        </MapContainer>
      </div>

      {/* Coordinates */}
      <div className="flex gap-2">
        <input
          type="text"
          name="latitude"
          value={formData.latitude}
          readOnly
          placeholder="Latitude"
          className="w-1/2 border p-2 rounded bg-gray-100"
        />
        <input
          type="text"
          name="longitude"
          value={formData.longitude}
          readOnly
          placeholder="Longitude"
          className="w-1/2 border p-2 rounded bg-gray-100"
        />
      </div>

      {/* Distance display */}
      {formData.latitude && formData.longitude && formData.university && (
        <p className="text-center text-sm text-gray-600">
          {loadingDistance
            ? "Calculating distance..."
            : distance !== null
            ? `📏 Distance from university: ${distance.toFixed(2)} km`
            : "Unable to calculate distance"}
        </p>
      )}

      <button
        type="button"
        onClick={handleNext}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Next: Add Rooms →
      </button>
    </div>
  );
};

export default ApartmentForm;
