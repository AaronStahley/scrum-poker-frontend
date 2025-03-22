"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Room } from "../../../types/room";
import useJoinRoom from "@/app/hooks/JoinRoom";

const CreateRoom = () => {
  const [roomName, setRoomName] = useState("");
  const { joinRoom } = useJoinRoom();

  const createRoom = async () => {
    try {
      const newRoom: Room = {
        createdAt: new Date(),
        createdBy: "anonymous",
        name: roomName,
        status: "waiting",
        players: [],
      };

      const roomRef = await addDoc(collection(db, "rooms"), newRoom);
      console.log("Room created successfully:", roomRef.id);
      joinRoom(roomRef.id);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleCreateNewRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    if (form.checkValidity()) {
      createRoom();
    }
  };

  return (
    <>
      <form onSubmit={handleCreateNewRoomSubmit} className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Enter Room Name"
          className={`input input-bordered min-w-64`}
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
          minLength={2}
          maxLength={25}
        />
        <button
          type="submit"
          className="btn btn-primary min-w-30"
        >
          Create Room
        </button>
      </form>
    </>
  );
}; 

export default CreateRoom;