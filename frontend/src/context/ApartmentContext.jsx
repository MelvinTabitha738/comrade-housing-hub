import { createContext, useState, useContext } from "react";

const ApartmentContext = createContext();
/* eslint-disable react-refresh/only-export-components */

export const useApartment = () => useContext(ApartmentContext);

export const ApartmentProvider = ({ children }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    university: "",
    address: "",
    monthly_rent: "",
    amenities: "",
    description: "",
    latitude: "",
    longitude: "",
    cover_image: null,
    room_types: [],
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <ApartmentContext.Provider
      value={{ step, setStep, nextStep, prevStep, formData, setFormData }}
    >
      {children}
    </ApartmentContext.Provider>
  );
};
