import React, { useState } from "react";
import { useApartment } from "../context/ApartmentContext";

const RoomSetup = ({ nextStep }) => {
  const { formData, setFormData } = useApartment(); // ✅ use context
  const [roomType, setRoomType] = useState("");
  const [roomVideo, setRoomVideo] = useState(null);
  const [coverImage, setCoverImage] = useState(formData.coverImage || null);
  const [rooms, setRooms] = useState(formData.rooms || []);
  const [roomLabel, setRoomLabel] = useState("");
  const [status, setStatus] = useState("Vacant");

  // ✅ Add Room Type & Upload Video
  const handleAddRoomType = () => {
    if (!roomType || !roomVideo)
      return alert("Please select room type and upload a video.");

    const newType = {
      type: roomType,
      video: roomVideo,
      rooms: [],
    };

    setFormData((prev) => ({
      ...prev,
      roomTypes: [...(prev.roomTypes || []), newType],
    }));

    setRoomType("");
    setRoomVideo(null);
  };

  // ✅ Add Room to Table
  const handleAddRoom = () => {
    if (!roomLabel) return alert("Enter room label");
    const newRoom = { label: roomLabel, status };
    setRooms([...rooms, newRoom]);
    setRoomLabel("");
  };

  // ✅ Handle Cover Image Upload
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    setCoverImage(file);
  };

  // ✅ Proceed to Step 3
  const handleNext = () => {
    setFormData((prev) => ({
      ...prev,
      rooms,
      coverImage,
    }));
    nextStep();
  };

  return (
    <div className="room-setup p-4 max-w-lg mx-auto bg-white shadow-md rounded-lg space-y-4">
      <h2 className="text-xl font-semibold text-center">Step 2: Add Room Types & Rooms</h2>

      {/* Cover Image */}
      <div className="form-group">
        <label>Apartment Cover Image:</label>
        <input type="file" accept="image/*" onChange={handleCoverImageChange} />
      </div>

      {/* Room Type */}
      <div className="form-group">
        <label>Room Type:</label>
        <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
          <option value="">Select Room Type</option>
          <option value="Single">Single</option>
          <option value="Bedsitter">Bedsitter</option>
          <option value="One Bedroom">One Bedroom</option>
        </select>

        <label>Upload Room Video:</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setRoomVideo(e.target.files[0])}
        />
        <button onClick={handleAddRoomType} className="bg-blue-600 text-white px-2 py-1 rounded ml-2">
          Add Room Type
        </button>
      </div>

      {/* Add Rooms */}
      <div className="add-room">
        <h3>Add Rooms</h3>
        <input
          type="text"
          placeholder="Room Label (e.g. Room A)"
          value={roomLabel}
          onChange={(e) => setRoomLabel(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 rounded mb-2">
          <option value="Vacant">Vacant</option>
          <option value="Booked">Booked</option>
        </select>
        <button onClick={handleAddRoom} className="bg-green-600 text-white px-2 py-1 rounded ml-2">
          Add Room
        </button>
      </div>

      {/* Rooms Table */}
      <table className="w-full border-collapse border border-gray-300 mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Room Label</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, index) => (
            <tr key={index}>
              <td className="border p-2">{room.label}</td>
              <td className="border p-2">{room.status === "Vacant" ? "🟢" : "🔴"} {room.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleNext}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Next: Review and Submit
      </button>
    </div>
  );
};

export default RoomSetup;
