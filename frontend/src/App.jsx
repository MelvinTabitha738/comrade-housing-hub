import React, { useState }  from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import PropertiesPage from "./pages/PropertiesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LandlordDashboard from "./components/LandlordDashboard";
import StudentDashboard from "./components/StudentDashboard";
import ApartmentForm from "./components/ApartmentForm";
import { ApartmentProvider } from "./context/ApartmentContext";


import RoomSetup from "./components/RoomSetup";
import ReviewSubmit from "./components/ReviewSubmit";


function App() {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  return (
    <>
    <div className="min-h-screen bg-gray-50 p-4">
      {step === 1 && <ApartmentForm nextStep={nextStep} />}
      {step === 2 && <RoomSetup nextStep={nextStep} prevStep={prevStep} />}
      {step === 3 && <ReviewSubmit prevStep={prevStep} />}
    </div>
    <Router>
      <Navbar />
      <main style={{ paddingTop: "80px", minHeight: "calc(100vh - 80px)", backgroundColor: "#F7FAFC" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
          path="/landlord-dashboard"
          element={
            <ProtectedRoute role="landlord">
              <LandlordDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/apartment-form"
          element={
            <ProtectedRoute role="landlord">
              <ApartmentProvider>
            <ApartmentForm/>
          </ApartmentProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        </Routes>
      </main>
    </Router>
    </>
  );
}

export default App;
