import React, { useState } from "react";
import axiosInstance from "../api/axios";
import { useApartment } from "../context/ApartmentContext";

const ReviewSubmit = ({ prevStep }) => {
  const { formData, resetForm } = useApartment();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // ---------------- 1️⃣ Create Apartment ----------------
      const apartmentForm = new FormData();
apartmentForm.append("name", formData.name);
apartmentForm.append("university", formData.university);
apartmentForm.append("address", formData.address);
apartmentForm.append("description", formData.description || "");
apartmentForm.append("amenities", JSON.stringify(formData.amenities || []));
apartmentForm.append("roomTypes", JSON.stringify(formData.roomTypes || []));
if (formData.coverImage) apartmentForm.append("coverImage", formData.coverImage);

const res = await axiosInstance.post("/apartments/apartments/", apartmentForm, {
  headers: { "Content-Type": "multipart/form-data" },
});


      const apartmentId = res.data.id;

      // ---------------- 2️⃣ Upload Cover Image ----------------
      if (formData.coverImage) {
        const imageForm = new FormData();
        imageForm.append("apartment", apartmentId);
        imageForm.append("image", formData.coverImage);
        imageForm.append("caption", "Cover Image");

        await axiosInstance.post("/apartments/apartment-images/", imageForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // ---------------- 3️⃣ Create Rooms ----------------
      for (const room of formData.rooms || []) {
        const roomForm = new FormData();
        roomForm.append("apartment", apartmentId);
        roomForm.append("label", room.label);
        roomForm.append("room_type", room.type);
        roomForm.append("single", room.single || 1); // optional, adjust if needed
        roomForm.append("monthly_rent", room.monthly_rent);
        roomForm.append("is_vacant", room.status === "Vacant");

        await axiosInstance.post("/apartments/rooms/", roomForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // ---------------- 4️⃣ Upload Room Videos ----------------
      for (const type of formData.roomTypes || []) {
        if (type.video) {
          const videoForm = new FormData();
          videoForm.append("apartment", apartmentId);
          videoForm.append("room_type", type.type);
          videoForm.append("video", type.video);

          await axiosInstance.post("/apartments/room-videos/", videoForm, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }

      alert("🎉 Apartment listing created successfully! Wait for admin approval.");
      resetForm();
    } catch (error) {
      console.error("Error submitting apartment:", error.response?.data || error);
      alert("❌ Failed to create apartment listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-step p-4 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-center mb-4">Step 3: Review & Submit</h2>

      {/* Apartment Details */}
      <section className="mb-4">
        <h3 className="font-bold mb-2">🏢 Apartment Details</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li><strong>Name:</strong> {formData.name}</li>
          <li><strong>University:</strong> {formData.university_name || "—"}</li>
          <li><strong>Address:</strong> {formData.address}</li>
          <li>
            <strong>Monthly Rent:</strong>{" "}
            {formData.roomTypes && formData.roomTypes.length > 0
              ? formData.roomTypes.map(rt => `${rt.type}: KES ${rt.monthly_rent}`).join(", ")
              : "—"}
          </li>
          <li><strong>Amenities:</strong> {Array.isArray(formData.amenities) ? formData.amenities.join(", ") : formData.amenities || "None"}</li>
          <li>
            <strong>Distance to University:</strong>{" "}
            {formData.distance_from_university ? `${parseFloat(formData.distance_from_university).toFixed(2)} km` : "—"}
          </li>
        </ul>
      </section>

      {/* Cover Image */}
      {formData.coverImage && (
        <section className="mb-4">
          <h3 className="font-bold mb-2">🖼️ Cover Image</h3>
          <img
            src={URL.createObjectURL(formData.coverImage)}
            alt="Cover"
            style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "6px" }}
          />
        </section>
      )}

      {/* Room Types & Videos */}
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
                  <td className="p-2 border">{room.status === "Vacant" ? "🟢" : "🔴"} {room.status}</td>
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
