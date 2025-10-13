import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import "./LandlordDashboard.css";
import { ApartmentProvider, useApartment } from "../context/ApartmentContext";
import ApartmentForm from "./ApartmentForm";
import RoomSetup from "./RoomSetup";
import ReviewSubmit from "./ReviewSubmit";

// ------------------ MULTI-STEP FLOW ------------------
const ApartmentMultiStep = ({ onFinish }) => {
  const { step, nextStep, prevStep } = useApartment();

  return (
    <div className="multi-step-container">
      {step === 1 && <ApartmentForm nextStep={nextStep} />}
      {step === 2 && <RoomSetup nextStep={nextStep} prevStep={prevStep} />}
      {step === 3 && <ReviewSubmit prevStep={prevStep} onFinish={onFinish} />}
    </div>
  );
};

// ------------------ LANDLORD DASHBOARD ------------------
const LandlordDashboard = () => {
  const [stats, setStats] = useState({});
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [userName, setUserName] = useState("");

  // Bookings, Apartments, and Earnings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  const [apartmentsLoading, setApartmentsLoading] = useState(false);
  const [apartmentsError, setApartmentsError] = useState("");
  const [earnings, setEarnings] = useState([]);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [earningsError, setEarningsError] = useState("");

  // ------------------ Pagination State ------------------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ------------------ GET GREETING ------------------
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // ------------------ HANDLE EDIT ------------------
  const handleEdit = (apt) => {
    setShowForm(true);
    console.log("Edit apartment:", apt);
  };

  // ------------------ HANDLE DELETE ------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this apartment?")) return;

    try {
      await axiosInstance.delete(`apartments/${id}/`);
      setApartments((prev) => prev.filter((apt) => apt.id !== id));
      alert("Apartment deleted successfully!");
    } catch (err) {
      console.error("Error deleting apartment:", err);
      alert("Failed to delete apartment.");
    }
  };

  // ------------------ FETCH USER INFO ------------------
  useEffect(() => {
    const fetchUserInfo = () => {
      // Try to get user info from localStorage or context
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          setUserName(parsed.first_name || parsed.username || "Landlord");
        } catch {
          setUserName("Landlord");
        }
      } else {
        setUserName("Landlord");
      }
    };
    fetchUserInfo();
  }, []);

  // ------------------ FETCH LANDLORD DASHBOARD DATA ------------------
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axiosInstance.get("apartments/landlord/stats/");
        setStats(res.data);
        setApartments(res.data.apartments || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // ------------------ FETCH BOOKINGS ------------------
  useEffect(() => {
  if (activeTab === "bookings") {
    const fetchBookings = async () => {
      setBookingsLoading(true);
      try {
        const res = await axiosInstance.get("bookings/bookings/");
        // Ensure bookings is always an array
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setBookings(data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookingsError("Failed to load bookings.");
      } finally {
        setBookingsLoading(false);
      }
    };
    fetchBookings();
  }
}, [activeTab]);


  // ------------------ FETCH APARTMENTS ------------------
  useEffect(() => {
    if (activeTab === "apartments") {
      const fetchApartments = async () => {
        setApartmentsLoading(true);
        try {
          const res = await axiosInstance.get("apartments/apartments/");
          setApartments(Array.isArray(res.data) ? res.data : res.data.results || []);
        } catch (err) {
          console.error("Error fetching apartments:", err);
          setApartmentsError("Failed to load apartments.");
        } finally {
          setApartmentsLoading(false);
        }
      };
      fetchApartments();
    }
  }, [activeTab, showForm]);

  // ------------------ FETCH EARNINGS ------------------
  useEffect(() => {
    if (activeTab === "earnings") {
      const fetchEarnings = async () => {
        setEarningsLoading(true);
        try {
          const res = await axiosInstance.get("payments/");
          setEarnings(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error("Error fetching earnings:", err);
          setEarningsError("Failed to load earnings.");
        } finally {
          setEarningsLoading(false);
        }
      };
      fetchEarnings();
    }
  }, [activeTab]);

  if (loading) return <div className="loader">Loading your dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  // ------------------ WHEN APARTMENT IS CREATED ------------------
  const handleFinish = () => {
    setShowForm(false);
    setActiveTab("apartments");
  };

  return (
    <div className="dashboard-layout">
      {/* ------------------ SIDEBAR ------------------ */}
      <aside className="sidebar">
        <h2>Landlord Panel</h2>
        <p>Manage your properties efficiently</p>
        
        <ul>
          <li 
            onClick={() => setActiveTab("dashboard")}
            className={activeTab === "dashboard" ? "active" : ""}
          >
            🏠 Dashboard
          </li>
          <li 
            onClick={() => setActiveTab("apartments")}
            className={activeTab === "apartments" ? "active" : ""}
          >
            🏘️ My Apartments
          </li>
          <li 
            onClick={() => setActiveTab("bookings")}
            className={activeTab === "bookings" ? "active" : ""}
          >
            📦 Bookings
          </li>
          <li 
            onClick={() => setActiveTab("earnings")}
            className={activeTab === "earnings" ? "active" : ""}
          >
            💰 Earnings
          </li>
          <li 
            onClick={() => setActiveTab("settings")}
            className={activeTab === "settings" ? "active" : ""}
          >
            ⚙️ Settings
          </li>
        </ul>
      </aside>

      {/* ------------------ MAIN CONTENT ------------------ */}
      <main className="main-content">
        {/* DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <>
            <h1>🏠 {getGreeting()}, {userName}!</h1>
            <p className="welcome-text">
              Welcome back to your landlord dashboard. Here's a quick overview of your property portfolio and recent activity.
            </p>
            
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Apartments</h3>
                <p>{stats.totalApartments || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Total Rooms</h3>
                <p>{stats.totalRooms || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Pending Bookings</h3>
                <p>{stats.pendingBookings || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Confirmed Bookings</h3>
                <p>{stats.confirmedBookings || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Total Earnings (Ksh)</h3>
                <p>{stats.totalEarnings?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <p className="welcome-text">
                Get started with common tasks:
              </p>
              <div className="action-buttons">
                <button 
                  className="action-btn"
                  onClick={() => {
                    setActiveTab("apartments");
                    setShowForm(true);
                  }}
                >
                  ➕ Add New Apartment
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab("bookings")}
                >
                  📋 View Bookings
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab("earnings")}
                >
                  💵 Check Earnings
                </button>
              </div>
            </div>
          </>
        )}

        {/* MY APARTMENTS SECTION */}
        {activeTab === "apartments" && (
          <div className="apartments-section">
            <div className="apartments-header">
              <div>
                <h2>🏘️ My Apartments</h2>
                <p className="welcome-text">
                  Manage all your listed properties in one place
                </p>
              </div>
              <button className="create-btn" onClick={() => setShowForm(true)}>
                ➕ Create Apartment
              </button>
            </div>

            {showForm ? (
              <ApartmentProvider>
                <ApartmentMultiStep onFinish={handleFinish} />
              </ApartmentProvider>
            ) : apartmentsLoading ? (
              <p>Loading apartments...</p>
            ) : apartmentsError ? (
              <p className="error">{apartmentsError}</p>
            ) : apartments.length === 0 ? (
              <p>No apartments found. Click "Create Apartment" to add your first property.</p>
            ) : (
              <>
                <table className="apartments-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>University</th>
                      <th>Distance (km)</th>
                      <th>Rooms</th>
                      <th>Status</th>
                      <th>Amenities</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apartments
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((apt) => {
                        const amenitiesArray = Array.isArray(apt.amenities)
                          ? apt.amenities
                          : apt.amenities
                          ? apt.amenities.split(",").map((a) => a.trim())
                          : [];

                        let distance = "-";
                        if (
                          apt.distance_from_university !== null &&
                          apt.distance_from_university !== undefined
                        ) {
                          const parsedDistance = parseFloat(apt.distance_from_university);
                          distance = isNaN(parsedDistance) ? "-" : parsedDistance.toFixed(2);
                        }

                        let university = "-";
                        if (apt.university_name) university = apt.university_name;
                        else if (apt.university) {
                          university =
                            typeof apt.university === "string"
                              ? apt.university
                              : apt.university.name || "-";
                        }

                        const rooms = apt.rooms_count ?? "-";

                        return (
                          <tr key={apt.id}>
                            <td>{apt.name}</td>
                            <td>{university}</td>
                            <td>{distance}</td>
                            <td>{rooms}</td>
                            <td>{apt.is_approved ? "✅ Approved" : "⏳ Pending"}</td>
                            <td>{amenitiesArray.length > 0 ? amenitiesArray.join(", ") : "-"}</td>
                            <td>{apt.created_at ? new Date(apt.created_at).toLocaleDateString() : "-"}</td>
                            <td>
                              <button onClick={() => handleEdit(apt)}>✏️ Edit</button>
                              <button onClick={() => handleDelete(apt.id)}>🗑️ Delete</button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>

                {apartments.length > itemsPerPage && (
                  <div className="pagination">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      ← Prev
                    </button>
                    <span>
                      Page {currentPage} of {Math.ceil(apartments.length / itemsPerPage)}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          prev < Math.ceil(apartments.length / itemsPerPage) ? prev + 1 : prev
                        )
                      }
                      disabled={currentPage === Math.ceil(apartments.length / itemsPerPage)}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="bookings-section">
            <h2>📦 Bookings</h2>
            <p className="welcome-text">
              View and manage all booking requests from students
            </p>
            {bookingsLoading ? (
              <p>Loading bookings...</p>
            ) : bookingsError ? (
              <p className="error">{bookingsError}</p>
            ) : bookings.length === 0 ? (
              <p>No bookings found yet. Students will see your listings once approved.</p>
            ) : (
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Apartment</th>
                    <th>Room Type</th>
                    <th>Status</th>
                    <th>Date Created</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>{b.student_name || "-"}</td>
                      <td>{b.apartment_name || "-"}</td>
                      <td>{b.room_type || "-"}</td>
                      <td>
                        <span className={`status-badge status-${b.status?.toLowerCase()}`}>
                          {b.status || "-"}
                        </span>
                      </td>
                      <td>{b.created_at ? new Date(b.created_at).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* EARNINGS */}
        {activeTab === "earnings" && (
          <div className="earnings-section">
            <h2>💰 Earnings</h2>
            <p className="welcome-text">
              Track all payments and financial transactions
            </p>
            {earningsLoading ? (
              <p>Loading earnings...</p>
            ) : earningsError ? (
              <p className="error">{earningsError}</p>
            ) : earnings.length === 0 ? (
              <p>No earnings recorded yet. Earnings will appear here once students make payments.</p>
            ) : (
              <table className="earnings-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Booking ID</th>
                    <th>Amount (Ksh)</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((e) => (
                    <tr key={e.id}>
                      <td>{e.user?.username || "-"}</td>
                      <td>#{e.booking_id || "-"}</td>
                      <td>{e.amount?.toLocaleString()}</td>
                      <td>{e.payment_method || "-"}</td>
                      <td>
                        <span className={`status-badge status-${e.status?.toLowerCase()}`}>
                          {e.status || "-"}
                        </span>
                      </td>
                      <td>{e.created_at ? new Date(e.created_at).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div className="settings-section">
            <h2>⚙️ Settings</h2>
            <p className="welcome-text">
              Manage your account preferences and profile information
            </p>
            <div className="settings-content">
              <div className="setting-item">
                <h3>Account Information</h3>
                <p>Update your personal details and contact information</p>
                <button className="action-btn">Edit Profile</button>
              </div>
              <div className="setting-item">
                <h3>Notification Preferences</h3>
                <p>Choose how you want to receive updates about bookings</p>
                <button className="action-btn">Manage Notifications</button>
              </div>
              <div className="setting-item">
                <h3>Payment Settings</h3>
                <p>Configure your payment methods and payout preferences</p>
                <button className="action-btn">Payment Options</button>
              </div>
              <div className="setting-item">
                <h3>Security</h3>
                <p>Change your password and manage security settings</p>
                <button className="action-btn">Security Settings</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandlordDashboard;