import RoomClient from '@/app/components/room/RoomClient';
import RoomHeader from '@/app/components/room/RoomHeader';
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
      <RoomHeader roomId={roomId} fallbackName={roomData.name} />
      <RoomClient roomId={roomId} />
    </div>
  );
};

export default RoomPage