import React from "react";
import { ApartmentProvider, useApartment } from "../context/ApartmentContext";
import ApartmentForm from "../components/ApartmentForm";
import RoomSetup from "../components/RoomSetup";
import ReviewSubmit from "../components/ReviewSubmit";

const ApartmentSteps = () => {
  const { step } = useApartment();

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white shadow-md rounded-xl mt-6">
      {step === 1 && <ApartmentForm />}
      {step === 2 && <RoomSetup />}
      {step === 3 && <ReviewSubmit />}
    </div>
  );
};

const ApartmentListingFlow = () => {
  return (
    <ApartmentProvider>
      <ApartmentSteps />
    </ApartmentProvider>
  );
};

export default ApartmentListingFlow;
