"use client";

import { useState } from "react";
import useJoinRoom from "@/app/hooks/JoinRoom";

const JoinRoom = () => {
  const [roomId, setRoomId] = useState("");
  const { joinRoom } = useJoinRoom();

  const handleJoinRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    if (form.checkValidity()) {
      joinRoom( roomId );
    }
  }

  // useEffect(() => {
  //   if (player && navigateToRoom) {
  //     console.log("Joining room for player: ", player.displayName);
  //     joinRoom(roomId, player, player.displayName);
  //   }
  // }, [player, navigateToRoom, roomId, joinRoom]); 

  return (
    <>
      {/* <CreateNewPlayer create={createNewPlayer} onPlayerCreated={handlePlayerCreated} /> */}
      <form onSubmit={handleJoinRoomSubmit} className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Existing Room ID"
          name="roomId"
          className={`input input-bordered min-w-64`}
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          required
          minLength={20}
          maxLength={20}
          // pattern="^[a-zA-Z0-9]{20}$" //TODO: figure out how to use this with custom message
        />
        <button
          type="submit"
          className="btn btn-secondary min-w-30"
        >
          Join Room
        </button>
      </form>
    </>
  )
}

export default JoinRoom