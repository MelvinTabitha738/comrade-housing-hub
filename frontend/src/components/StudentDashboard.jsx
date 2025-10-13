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
  const [sortOption, setSortOption] = useState("");
  const [userName, setUserName] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const dropdownRef = useRef(null);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Fetch user info
  useEffect(() => {
    const fetchUserInfo = () => {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          setUserName(parsed.first_name || parsed.username || "Student");
        } catch {
          setUserName("Student");
        }
      } else {
        setUserName("Student");
      }
    };
    fetchUserInfo();
  }, []);

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
    const filtered = universities.filter(
      (uni) =>
        uni.name.toLowerCase().includes(term) ||
        (uni.alias && uni.alias.toLowerCase().includes(term))
    );
    setFilteredUnis(filtered);
  };

  // Select university
  const handleSelectUniversity = (uni) => {
    setSelectedUni(uni);
    setSearchTerm(uni.name);
    setFilteredUnis([]);
    setCurrentPage(1);
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
    setCurrentPage(1);
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

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApartments = filteredApartments.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="student-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🎓 {getGreeting()}, {userName}!</h1>
          <p className="welcome-text">
            Find your perfect student accommodation near your campus. Search by university and explore verified apartments.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-header">
            <i className="fas fa-university"></i>
            <h2>Search for Your University</h2>
          </div>
          <p className="search-description">
            Enter your university name to discover available apartments nearby
          </p>
          
          <div className="search-box" ref={dropdownRef}>
            <div className="search-input-wrapper">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Type university name (e.g., University of Nairobi)..."
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {filteredUnis.length > 0 && searchTerm && (
              <div className="dropdown-list">
                {filteredUnis.map((uni) => (
                  <div
                    key={uni.id}
                    onClick={() => handleSelectUniversity(uni)}
                    className="dropdown-item"
                  >
                    <i className="fas fa-university"></i>
                    <div className="uni-info">
                      <span className="uni-name">{uni.name}</span>
                      {uni.total_apartments !== undefined && (
                        <span className="uni-count">
                          {uni.total_apartments} apartment{uni.total_apartments !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected University Info */}
      {selectedUni && (
        <div className="selected-university">
          <div className="uni-banner">
            <i className="fas fa-graduation-cap"></i>
            <div>
              <h3>{selectedUni.name}</h3>
              <p>
                {apartments.length > 0
                  ? `${apartments.length} verified apartment${apartments.length !== 1 ? 's' : ''} available`
                  : "No apartments listed yet. Check back soon!"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sort & Filter */}
      {selectedUni && apartments.length > 0 && (
        <div className="filter-section">
          <div className="filter-controls">
            <div className="filter-info">
              <i className="fas fa-filter"></i>
              <span>Sort & Filter Results</span>
            </div>
            <div className="sort-dropdown">
              <label htmlFor="sort-select">
                <i className="fas fa-sort"></i>
                Sort by:
              </label>
              <select 
                id="sort-select"
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">Default</option>
                <option value="distance">📍 Nearest First</option>
                <option value="rent_low">💸 Price: Low to High</option>
                <option value="rent_high">💰 Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Apartments Grid */}
      <div className="apartments-container">
        {loading && (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading apartments...</p>
          </div>
        )}
        
        {error && (
          <div className="error-state">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
          </div>
        )}
        
        {!loading && !error && currentApartments.length === 0 && selectedUni && (
          <div className="empty-state">
            <i className="fas fa-home"></i>
            <h3>No Apartments Found</h3>
            <p>There are no apartments available for this university yet. Please check back later!</p>
          </div>
        )}

        {!loading && currentApartments.length > 0 && (
          <div className="apartments-grid">
            {currentApartments.map((apt) => {
              const amenitiesArray = Array.isArray(apt.amenities)
                ? apt.amenities
                : apt.amenities
                ? apt.amenities.split(",").map((a) => a.trim())
                : [];

              const distance =
                apt.distance_km !== null && apt.distance_km !== undefined
                  ? parseFloat(apt.distance_km).toFixed(2)
                  : "N/A";

              const university = apt.university_name
                ? apt.university_name
                : apt.university
                ? typeof apt.university === "string"
                  ? apt.university
                  : apt.university.name || "-"
                : "-";

              return (
                <div
                  key={apt.id}
                  className="apartment-card"
                  onClick={() => setSelectedApartment(apt)}
                >
                  <div className="card-image">
                    <img
                      src={apt.images?.[0]?.image || "/placeholder.png"}
                      alt={apt.name}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80";
                      }}
                    />
                    <div className="card-badge">
                      <i className="fas fa-star"></i>
                      {apt.average_rating || "New"}
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <h3 className="card-title">{apt.name}</h3>
                    
                    <div className="card-details">
                      <div className="detail-item">
                        <i className="fas fa-university"></i>
                        <span>{university}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{distance} km away</span>
                      </div>
                      <div className="detail-item price">
                        <i className="fas fa-money-bill-wave"></i>
                        <span>Ksh {apt.monthly_rent?.toLocaleString() || "N/A"} /month</span>
                      </div>
                    </div>

                    {amenitiesArray.length > 0 && (
                      <div className="card-amenities">
                        {amenitiesArray.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="amenity-tag">
                            {amenity}
                          </span>
                        ))}
                        {amenitiesArray.length > 3 && (
                          <span className="amenity-tag more">
                            +{amenitiesArray.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <button className="view-details-btn">
                      <i className="fas fa-eye"></i>
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredApartments.length > itemsPerPage && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            <i className="fas fa-chevron-left"></i>
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {Math.ceil(filteredApartments.length / itemsPerPage)}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                prev < Math.ceil(filteredApartments.length / itemsPerPage)
                  ? prev + 1
                  : prev
              )
            }
            disabled={currentPage === Math.ceil(filteredApartments.length / itemsPerPage)}
            className="pagination-btn"
          >
            Next
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Modal for Apartment Detail */}
      {selectedApartment && (
        <div className="modal-overlay" onClick={() => setSelectedApartment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedApartment(null)}
              className="modal-close"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="modal-header">
              <h2>{selectedApartment.name}</h2>
              <div className="modal-rating">
                <i className="fas fa-star"></i>
                <span>{selectedApartment.average_rating || "N/A"}</span>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h3><i className="fas fa-info-circle"></i> Description</h3>
                <p>{selectedApartment.description || "No description available."}</p>
              </div>

              <div className="modal-section">
                <h3><i className="fas fa-th-large"></i> Amenities</h3>
                <div className="amenities-grid">
                  {(Array.isArray(selectedApartment.amenities)
                    ? selectedApartment.amenities
                    : selectedApartment.amenities
                    ? selectedApartment.amenities.split(",").map((a) => a.trim())
                    : []
                  ).map((amenity, idx) => (
                    <span key={idx} className="amenity-badge">
                      <i className="fas fa-check-circle"></i>
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Room Videos */}
              {selectedApartment.room_types?.some(room => room.video) && (
                <div className="modal-section">
                  <h3><i className="fas fa-video"></i> Room Videos</h3>
                  {selectedApartment.room_types.map((room, idx) => (
                    room.video && (
                      <div key={idx} className="video-container">
                        <h4>{room.name}</h4>
                        <video width="100%" controls>
                          <source src={room.video} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Available Rooms */}
              <div className="modal-section">
                <h3><i className="fas fa-door-open"></i> Available Rooms</h3>
                {selectedApartment.rooms && selectedApartment.rooms.length > 0 ? (
                  <div className="rooms-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Room Label</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedApartment.rooms.map((room) => (
                          <tr key={room.id}>
                            <td className="room-label">{room.label}</td>
                            <td>
                              {room.is_vacant ? (
                                <span className="status-badge vacant">
                                  <i className="fas fa-check-circle"></i>
                                  Available
                                </span>
                              ) : (
                                <span className="status-badge booked">
                                  <i className="fas fa-times-circle"></i>
                                  Booked
                                </span>
                              )}
                            </td>
                            <td>
                              {room.is_vacant ? (
                                <button 
                                  onClick={() => handleBookRoom(room.id)}
                                  className="book-btn"
                                >
                                  <i className="fas fa-calendar-check"></i>
                                  Book Now
                                </button>
                              ) : (
                                <span className="unavailable-text">Unavailable</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-rooms">No rooms available at the moment.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;