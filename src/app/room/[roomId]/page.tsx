import { db } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import RoomClient from '@/app/components/room/RoomClient';
import { Room } from "@/types/room";

const RoomPage = async ({ params }: Room) => {
  const { roomId } = await params;

  // Fetch room details from Firestore
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);
  const roomData = roomSnap.exists() ? roomSnap.data() : null;

  if (!roomData) {
    return <div className="text-center text-red-500">Room not found</div>;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-base-200">
    <h1 className="text-4xl font-bold mb-6">Select Your Story Point</h1>
      <RoomClient roomId={roomId} />
    </div>
  )
}

export default RoomPage