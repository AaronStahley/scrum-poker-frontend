import PlayingCardSelector from '../../components/PlayingCardSelector'
import PlayerTable from '../../components/PlayerTable'
import { db } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import CreateNewPlayer from '@/app/components/CreateNewPlayer';

interface Room {
  params: { 
    roomId: string;
    players: Player[];
  };
}

interface Player {
  id: string;
  name: string;
  selection: number | string | null;
}

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
      {/* <CreateNewPlayer db={db} roomId={roomId} players={roomData.players}/> */}
      <h1 className="text-4xl font-bold mb-6">Select Your Story Point</h1>
      <PlayingCardSelector />
      <div className='flex flex-wrap gap-4 justify-center p-6'>
        <button className="text-base btn btn-primary">Submit Vote</button>
        <button className="text-base btn btn-secondary">Reveal Votes</button>
      </div>
      <PlayerTable players={roomData.players} revealVotes={false} />
    </div>
  )
}

export default RoomPage