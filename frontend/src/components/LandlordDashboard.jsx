import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import "./LandlordDashboard.css";
import { ApartmentProvider, useApartment } from "../context/ApartmentContext";
import ApartmentForm from "./ApartmentForm";
import RoomSetup from "./RoomSetup";
import ReviewSubmit from "./ReviewSubmit";

// Inner component that handles the multi-step creation flow
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

const LandlordDashboard = () => {
  const [stats, setStats] = useState({});
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showForm, setShowForm] = useState(false); // ⬅️ for toggling multistep form

  // --- bookings states ---
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  // apartments states
  const [apartmentsLoading, setApartmentsLoading] = useState(false);
  const [apartmentsError, setApartmentsError] = useState("");

  // Earnings states
  const [earnings, setEarnings] = useState([]);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [earningsError, setEarningsError] = useState("");

  // --- Dashboard Stats ---
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

  // --- Bookings ---
  useEffect(() => {
    if (activeTab === "bookings") {
      const fetchBookings = async () => {
        setBookingsLoading(true);
        try {
          const res = await axiosInstance.get("bookings/bookings/");
          setBookings(res.data || []);
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

  // --- Apartments ---
  useEffect(() => {
    if (activeTab === "apartments") {
      const fetchApartments = async () => {
        setApartmentsLoading(true);
        setApartmentsError("");
        try {
          const res = await axiosInstance.get("apartments/apartments/");
          setApartments(Array.isArray(res.data.apartments) ? res.data.apartments : []);
        } catch (err) {
          console.error("Error fetching apartments:", err);
          setApartmentsError("Failed to load apartments.");
        } finally {
          setApartmentsLoading(false);
        }
      };
      fetchApartments();
    }
  }, [activeTab]);

  // --- Earnings ---
  useEffect(() => {
    if (activeTab === "earnings") {
      const fetchEarnings = async () => {
        setEarningsLoading(true);
        setEarningsError("");
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

  if (loading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  // when the multi-step form is submitted successfully
  const handleFinish = () => {
    setShowForm(false);
    setActiveTab("apartments");
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Landlord Panel</h2>
        <ul>
          <li onClick={() => setActiveTab("dashboard")}>🏠 Dashboard</li>
          <li onClick={() => setActiveTab("apartments")}>🏘️ My Apartments</li>
          <li onClick={() => setActiveTab("bookings")}>📦 Bookings</li>
          <li onClick={() => setActiveTab("earnings")}>💰 Earnings</li>
          <li onClick={() => setActiveTab("settings")}>⚙️ Settings</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* --- Dashboard Overview --- */}
        {activeTab === "dashboard" && (
          <>
            <h1>🏠 Landlord Dashboard</h1>
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
                <p>{stats.totalEarnings || 0}</p>
              </div>
            </div>
          </>
        )}

        {/* --- My Apartments Section --- */}
        {activeTab === "apartments" && (
          <div className="apartments-section">
            <div className="apartments-header">
              <h2>🏘️ My Apartments</h2>
              <button
                className="create-btn"
                onClick={() => setShowForm(true)}
              >
                ➕ Create Apartment
              </button>
            </div>

            {showForm ? (
              // Multi-step form flow here
              <ApartmentProvider>
                <ApartmentMultiStep onFinish={handleFinish} />
              </ApartmentProvider>
            ) : apartmentsLoading ? (
              <p>Loading apartments...</p>
            ) : apartmentsError ? (
              <p className="error">{apartmentsError}</p>
            ) : apartments.length === 0 ? (
              <p>No apartments found. Add one above.</p>
            ) : (
              <table className="apartments-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>University</th>
                    <th>Rent (Ksh)</th>
                    <th>Rooms</th>
                    <th>Status</th>
                    <th>Amenities</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {apartments.map((apt) => (
                    <tr key={apt.id}>
                      <td>{apt.name}</td>
                      <td>{apt.university}</td>
                      <td>{apt.monthly_rent}</td>
                      <td>{apt.rooms_count || "-"}</td>
                      <td>{apt.is_approved ? "✅ Approved" : "⏳ Pending"}</td>
                      <td>{apt.amenities?.join(", ") || "-"}</td>
                      <td>
                        {apt.created_at
                          ? new Date(apt.created_at).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* --- Bookings --- */}
        {activeTab === "bookings" && (
          <div className="bookings-section">
            <h2>📦 Bookings</h2>
            {bookingsLoading ? (
              <p>Loading bookings...</p>
            ) : bookingsError ? (
              <p className="error">{bookingsError}</p>
            ) : !Array.isArray(bookings) || bookings.length === 0 ? (
              <p>No bookings found.</p>
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
                      <td>{b.status || "-"}</td>
                      <td>{b.created_at ? new Date(b.created_at).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* --- Earnings --- */}
        {activeTab === "earnings" && (
          <div className="earnings-section">
            <h2>💰 Earnings</h2>
            {earningsLoading ? (
              <p>Loading earnings...</p>
            ) : earningsError ? (
              <p className="error">{earningsError}</p>
            ) : earnings.length === 0 ? (
              <p>No earnings found.</p>
            ) : (
              <table className="earnings-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Booking ID</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((e) => (
                    <tr key={e.id}>
                      <td>{e.user?.username || "-"}</td>
                      <td>{e.booking_id || "-"}</td>
                      <td>{e.amount}</td>
                      <td>{e.payment_method || "-"}</td>
                      <td>{e.status || "-"}</td>
                      <td>{e.created_at ? new Date(e.created_at).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* --- Settings --- */}
        {activeTab === "settings" && (
          <div className="settings-section">
            <h2>⚙️ Settings</h2>
            <p>Manage your account preferences here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandlordDashboard;
