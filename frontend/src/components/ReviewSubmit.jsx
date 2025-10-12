import React, { useState } from "react";
import axiosInstance from "../api/axios";
import { useApartment } from "../context/ApartmentContext";

const ReviewSubmit = ({ prevStep }) => {
  const { formData, resetForm } = useApartment();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ POST all data (including files)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data = new FormData();

      // Apartment details (text fields)
      data.append("name", formData.name);
      data.append("university", formData.university);
      data.append("address", formData.address);
      data.append("monthly_rent", formData.monthly_rent);
      data.append("amenities", formData.amenities);
      data.append("latitude", formData.latitude);
      data.append("longitude", formData.longitude);
      data.append("description", formData.description || "");

      // Cover image
      if (formData.coverImage) {
        data.append("cover_image", formData.coverImage);
      }

      // Room types with video
      (formData.roomTypes || []).forEach((type, idx) => {
        data.append(`room_types[${idx}][type]`, type.type);
        if (type.video) {
          data.append(`room_types[${idx}][video]`, type.video);
        }
      });

      // Individual rooms
      (formData.rooms || []).forEach((room, idx) => {
        data.append(`rooms[${idx}][label]`, room.label);
        data.append(`rooms[${idx}][status]`, room.status);
      });

      await axiosInstance.post("/apartments/apartments/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("🎉 Apartment listing created successfully!");
      resetForm(); // clear data & go back to Step 1
    } catch (error) {
      console.error(error);
      alert("❌ Failed to create apartment listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-step p-4 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-center mb-4">
        Step 3: Review & Submit
      </h2>

      {/* Apartment Details */}
      <section className="mb-4">
        <h3 className="font-bold mb-2">🏢 Apartment Details</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li><strong>Name:</strong> {formData.name}</li>
          <li><strong>University:</strong> {formData.university}</li>
          <li><strong>Address:</strong> {formData.address}</li>
          <li><strong>Monthly Rent:</strong> {formData.monthly_rent} KES</li>
          <li><strong>Amenities:</strong> {formData.amenities}</li>
          <li><strong>Coordinates:</strong> {formData.latitude}, {formData.longitude}</li>
        </ul>
      </section>

      {/* Cover Image */}
      {formData.coverImage && (
        <section className="mb-4">
          <h3 className="font-bold mb-2">🖼️ Cover Image</h3>
          <img
            src={URL.createObjectURL(formData.coverImage)}
            alt="Cover"
            className="w-full max-w-md rounded-lg shadow"
          />
        </section>
      )}

      {/* Room Types */}
      {(formData.roomTypes || []).length > 0 && (
        <section className="mb-4">
          <h3 className="font-bold mb-2">🎥 Room Types & Videos</h3>
          {formData.roomTypes.map((type, idx) => (
            <div key={idx} className="mb-3">
              <p className="font-semibold">Type: {type.type}</p>
              {type.video && (
                <video controls width="300" className="rounded">
                  <source src={URL.createObjectURL(type.video)} type="video/mp4" />
                </video>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Rooms */}
      {(formData.rooms || []).length > 0 && (
        <section className="mb-4">
          <h3 className="font-bold mb-2">🏘️ Rooms</h3>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Label</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {formData.rooms.map((room, idx) => (
                <tr key={idx}>
                  <td className="p-2 border">{room.label}</td>
                  <td className="p-2 border">
                    {room.status === "Vacant" ? "🟢" : "🔴"} {room.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? "Submitting..." : "✅ Confirm Listing"}
        </button>
      </div>
    </div>
  );
};

export default ReviewSubmit;
