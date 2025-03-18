import { db } from "@/lib/firebase/firebase";
import { getDoc, doc } from "firebase/firestore";
import RoomClient from '@/app/components/room/RoomClient';
import RoomNotFound from "@/app/components/room/RoomNotFound";

interface PageProps {
  params: Promise<{ roomId: string }>;
}

const RoomPage = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const { roomId } = resolvedParams;

  // Fetch room details from Firestore
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);
  const roomData = roomSnap.exists() ? roomSnap.data() : null;

  if (!roomData) {
    return (<div className="text-center text-red-500"><RoomNotFound /></div>); 
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-base-200 text-center">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-5">Select Your Story Point</h1>
        <p className="text-md text-secondary">Room Id: {roomId}</p>
      </div>
      <RoomClient roomId={roomId} />
    </div>
  );
};

export default RoomPage