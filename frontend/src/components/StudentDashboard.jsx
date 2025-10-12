import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axios";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [universities, setUniversities] = useState([]);
  const [filteredUnis, setFilteredUnis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUni, setSelectedUni] = useState(null);

  const [apartments, setApartments] = useState([]);
  const [filteredApartments, setFilteredApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedApartment, setSelectedApartment] = useState(null);
  const dropdownRef = useRef(null);
  const [sortOption, setSortOption] = useState("");

  // Fetch universities
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await axiosInstance.get("/universities/universities/");
        const uniData = res.data.results || res.data.universities || res.data;
        setUniversities(uniData);
        setFilteredUnis(uniData);
      } catch (err) {
        console.error("Error fetching universities", err);
      }
    };
    fetchUniversities();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilteredUnis([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter universities dynamically
  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = universities.filter((uni) =>
      uni.name.toLowerCase().includes(term) ||
      (uni.alias && uni.alias.toLowerCase().includes(term)) // optional: check alias or related fields
    );
    setFilteredUnis(filtered);
  };

  // Select university
  const handleSelectUniversity = (uni) => {
    setSelectedUni(uni);
    setSearchTerm(uni.name);
    setFilteredUnis([]);
    fetchApartments(uni.id);
  };

  // Fetch apartments for selected university
  const fetchApartments = async (uniId) => {
    if (!uniId) return;
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(
        `/universities/universities/${uniId}/apartments/`
      );
      const approved = (res.data.results || []).filter((apt) => apt.is_approved);
      setApartments(approved);
      setFilteredApartments(approved);
    } catch (err) {
      console.error("Error fetching apartments", err);
      setError("Failed to load apartments.");
    } finally {
      setLoading(false);
    }
  };

  // Sort apartments
  useEffect(() => {
    let sorted = [...apartments];
    if (sortOption === "distance") {
      sorted.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    } else if (sortOption === "rent_low") {
      sorted.sort((a, b) => (a.monthly_rent || 0) - (b.monthly_rent || 0));
    } else if (sortOption === "rent_high") {
      sorted.sort((a, b) => (b.monthly_rent || 0) - (a.monthly_rent || 0));
    }
    setFilteredApartments(sorted);
  }, [sortOption, apartments]);

  const handleBookRoom = async (roomId) => {
    try {
      await axiosInstance.post(`/bookings/book-room/${roomId}/`);
      alert("Room booked successfully!");
      fetchApartments(selectedUni.id);
      setSelectedApartment(null);
    } catch (err) {
      console.error("Booking failed", err);
      alert("Booking failed. Please try again.");
    }
  };

  return (
    <div className="student-dashboard" style={{ padding: "20px" }}>
      <h2>Find Apartments Near Your University</h2>

      {/* University Search */}
      <div className="search-box" ref={dropdownRef} style={{ position: "relative", width: "300px", marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Search university..."
          value={searchTerm}
          onChange={handleSearchChange}
          onClick={(e) => e.stopPropagation()}
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
        />
        {filteredUnis.length > 0 && searchTerm && (
          <div className="dropdown-list" style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #ccc",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 1000
          }}>
            {filteredUnis.map((uni) => (
              <div
                key={uni.id}
                onClick={() => handleSelectUniversity(uni)}
                style={{ padding: "8px", cursor: "pointer" }}
              >
                {uni.name} {uni.total_apartments !== undefined ? `(${uni.total_apartments})` : ""}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected University Info */}
      {selectedUni && (
        <div style={{ marginTop: "20px" }}>
          <h3>
            {selectedUni.name} -{" "}
            {apartments.length > 0
              ? `${apartments.length} approved apartment(s)`
              : `No apartments yet, will be uploaded soon`}
          </h3>
        </div>
      )}

      {/* Sort & Filter */}
      {selectedUni && apartments.length > 0 && (
        <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
          <label>Sort by: </label>
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="">Default</option>
            <option value="distance">Nearest</option>
            <option value="rent_low">Rent: Low → High</option>
            <option value="rent_high">Rent: High → Low</option>
          </select>
        </div>
      )}

      {/* Apartments Grid */}
      <div className="apartments-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginTop: "20px"
      }}>
        {loading && <p>Loading apartments...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && filteredApartments.length === 0 && selectedUni && apartments.length > 0 && (
          <p>No approved apartments found for {selectedUni.name}.</p>
        )}

        {!loading &&
          filteredApartments.map((apt) => (
            <div
              key={apt.id}
              className="apartment-card"
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
              onClick={() => setSelectedApartment(apt)}
            >
              <img
                src={apt.images[0]?.image || "/placeholder.png"}
                alt={apt.name}
                style={{ width: "100%", height: "150px", objectFit: "cover" }}
              />
              <div style={{ padding: "10px" }}>
                <h3>{apt.name}</h3>
                <p>💸 {apt.monthly_rent} Ksh / month</p>
                <p>📍 {apt.distance_km || "N/A"} km from university</p>
                <p>⭐ {apt.average_rating || "N/A"}</p>
              </div>
            </div>
          ))}
      </div>

      {/* Modal for Apartment Detail */}
      {selectedApartment && (
        <div className="modal-overlay" style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999
        }}>
          <div className="modal-content" style={{
            background: "#fff",
            width: "90%",
            maxWidth: "800px",
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: "10px",
            padding: "20px",
            position: "relative"
          }}>
            <button
              onClick={() => setSelectedApartment(null)}
              style={{
                position: "absolute",
                top: "10px",
                right: "15px",
                fontSize: "18px",
                background: "none",
                border: "none",
                cursor: "pointer"
              }}
            >
              ❌
            </button>

            <h2>{selectedApartment.name}</h2>
            <p>{selectedApartment.description}</p>
            <p><b>Amenities:</b> {selectedApartment.amenities.join(", ")}</p>

            {/* Room Videos */}
            {selectedApartment.room_types?.map((room, idx) => (
              <div key={idx} style={{ marginBottom: "10px" }}>
                <h4>{room.name} Video:</h4>
                {room.video ? (
                  <video width="100%" controls>
                    <source src={room.video} type="video/mp4" />
                  </video>
                ) : (
                  <p>No video available</p>
                )}
              </div>
            ))}

            {/* Rooms Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #ccc" }}>
                  <th style={{ padding: "8px" }}>Room Label</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedApartment.rooms?.map((room) => (
                  <tr key={room.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px" }}>{room.label}</td>
                    <td>{room.is_vacant ? "🟢 Vacant" : "🔴 Booked"}</td>
                    <td>
                      {room.is_vacant ? (
                        <button onClick={() => handleBookRoom(room.id)}>Book Now</button>
                      ) : (
                        <span>Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
