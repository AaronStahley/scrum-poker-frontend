"use client";

import { useEffect } from "react";
import useJoinRoom from "@/app/hooks/JoinRoom";

const JoinRoom = ({ roomId }: { roomId: string }) => {
  const { joinRoom } = useJoinRoom();

  if (!roomId) return null;

  useEffect(() => {
      joinRoom(roomId);
  }, [roomId, joinRoom]); 

  return (<></>);
};

export default JoinRoom;