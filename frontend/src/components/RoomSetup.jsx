import React, { useState } from "react";
import { useApartment } from "../context/ApartmentContext";

const MAX_IMAGE_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 50;

export default function RoomSetup({ nextStep, prevStep }) {
  const { formData, setFormData } = useApartment();

  const [roomType, setRoomType] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [roomVideo, setRoomVideo] = useState(null);
  const [coverImage, setCoverImage] = useState(formData.coverImage || null);
  const [roomTypes, setRoomTypes] = useState(formData.roomTypes || []);
  const [roomLabel, setRoomLabel] = useState("");
  const [status, setStatus] = useState("Vacant");

  // ✅ Validate & handle image upload
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("❌ Only JPG, JPEG, or PNG images allowed.");
      return;
    }
    if (file.size / 1024 / 1024 > MAX_IMAGE_SIZE_MB) {
      alert(`❌ Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    setCoverImage(file);
  };

  const removeCoverImage = () => {
    setCoverImage(null);
  };

  // ✅ Validate & handle video upload
  const handleRoomVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["video/mp4", "video/mkv", "video/webm"];
    if (!validTypes.includes(file.type)) {
      alert("❌ Only MP4, MKV, or WEBM videos allowed.");
      return;
    }
    if (file.size / 1024 / 1024 > MAX_VIDEO_SIZE_MB) {
      alert(`❌ Video must be smaller than ${MAX_VIDEO_SIZE_MB}MB.`);
      return;
    }

    setRoomVideo(file);
  };

  const removeRoomVideo = () => {
    setRoomVideo(null);
  };

  // ✅ Add new room type with rent & video
  const handleAddRoomType = () => {
    if (!roomType || !monthlyRent || !roomVideo) {
      alert("⚠️ Please select room type, add rent, and upload a video.");
      return;
    }

    const exists = roomTypes.some((t) => t.type === roomType);
    if (exists) {
      alert("⚠️ This room type already exists.");
      return;
    }

    const newType = {
      type: roomType,
      monthly_rent: monthlyRent,
      video: roomVideo,
      rooms: [],
    };

    setRoomTypes((prev) => [...prev, newType]);
    setRoomType("");
    setMonthlyRent("");
    setRoomVideo(null);
  };

  // ✅ Add individual rooms
  const handleAddRoom = (roomTypeIndex) => {
    if (!roomLabel.trim()) return alert("Enter a room label");

    const newRoom = { label: roomLabel, status };
    const updated = [...roomTypes];
    updated[roomTypeIndex].rooms.push(newRoom);
    setRoomTypes(updated);
    setRoomLabel("");
  };

  // ✅ Remove room type
  const handleRemoveRoomType = (index) => {
    const updated = roomTypes.filter((_, i) => i !== index);
    setRoomTypes(updated);
  };

  // ✅ Proceed or go back
  const handleNext = () => {
    if (!coverImage || roomTypes.length === 0) {
      alert("Please upload a cover image and add at least one room type.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      coverImage,
      roomTypes,
    }));
    nextStep();
  };

  return (
    <div className="room-setup p-5 max-w-2xl mx-auto bg-white shadow-md rounded-lg space-y-5">
      <h2 className="text-xl font-semibold text-center">
        🏠 Step 2: Add Room Types & Rooms
      </h2>

      {/* ✅ Apartment Cover Image */}
      <div>
        <label className="block font-medium mb-1">Apartment Cover Image:</label>
        {coverImage ? (
  <div className="flex items-center gap-3 mt-2">
    <div
      className="border rounded overflow-hidden flex items-center justify-center shadow-sm"
      style={{
        width: "80px",
        height: "80px",
        flexShrink: 0,
        backgroundColor: "#f9fafb",
      }}
    >
      <img
        src={URL.createObjectURL(coverImage)}
        alt="Apartment cover"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "6px",
        }}
      />
    </div>
    <div>
      <p
        className="text-sm text-gray-700 truncate"
        style={{ maxWidth: "150px" }}
      >
        {coverImage.name}
      </p>
      <button
        onClick={removeCoverImage}
        className="text-red-500 text-sm underline mt-1"
      >
        Remove
      </button>
    </div>
  </div>
) : (
  <input
    type="file"
    accept="image/*"
    onChange={handleCoverImageChange}
    className="border p-2 rounded w-full"
  />
)}

      </div>

      {/* ✅ Room Type Form */}
      <div className="space-y-2 border-t pt-4">
        <h3 className="font-semibold text-lg">Add Room Type</h3>
        <select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">Select Room Type</option>
          <option value="Single">Single</option>
          <option value="Bedsitter">Bedsitter</option>
          <option value="One Bedroom">One Bedroom</option>
        </select>

        <input
          type="number"
          placeholder="Monthly Rent (KES)"
          value={monthlyRent}
          onChange={(e) => setMonthlyRent(e.target.value)}
          className="border p-2 rounded w-full"
        />

        {roomVideo ? (
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">{roomVideo.name}</p>
            <button onClick={removeRoomVideo} className="text-red-500 underline">
              Remove
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="video/*"
            onChange={handleRoomVideoChange}
            className="border p-2 rounded w-full"
          />
        )}

        <button
          onClick={handleAddRoomType}
          className="bg-blue-700 text-white px-3 py-1 rounded w-full hover:bg-blue-800"
        >
          ➕ Add Room Type
        </button>
      </div>

      {/* ✅ Added Room Types Display */}
      {roomTypes.length > 0 && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-lg">Added Room Types</h3>
          {roomTypes.map((type, index) => (
            <div key={index} className="border rounded p-3 space-y-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="font-medium">
                  🏡 {type.type} — Rent: KES {type.monthly_rent}
                </p>
                <button
                  onClick={() => handleRemoveRoomType(index)}
                  className="text-red-500 underline"
                >
                  Remove
                </button>
              </div>

              <div>
                <label className="font-medium text-sm">Add Rooms:</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Room Label (e.g. Room A)"
                    value={roomLabel}
                    onChange={(e) => setRoomLabel(e.target.value)}
                    className="border p-2 rounded flex-1"
                  />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border p-2 rounded"
                  >
                    <option value="Vacant">Vacant</option>
                    <option value="Booked">Booked</option>
                  </select>
                  <button
                    onClick={() => handleAddRoom(index)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* ✅ Room List */}
              {type.rooms.length > 0 && (
                <table className="w-full border-collapse border mt-2">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">Label</th>
                      <th className="border p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {type.rooms.map((room, i) => (
                      <tr key={i}>
                        <td className="border p-2">{room.label}</td>
                        <td className="border p-2">
                          {room.status === "Vacant" ? "🟢" : "🔴"} {room.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ✅ Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={prevStep}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          ← Back to Apartment Info
        </button>

        <button
          onClick={handleNext}
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          Next: Review & Submit →
        </button>
      </div>
    </div>
  );
}
