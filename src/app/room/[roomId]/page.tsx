import RoomClient from '@/app/components/room/RoomClient';
import RoomNotFound from "@/app/components/room/RoomNotFound";
import { getRoom } from "@/lib/firebase/room";

interface PageProps {
  params: Promise<{ roomId: string }>;
}

const RoomPage = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const { roomId } = resolvedParams;
  const roomData = await getRoom(roomId);

  if (!roomData) {
    return (<div className="text-center text-error"><RoomNotFound /></div>); 
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