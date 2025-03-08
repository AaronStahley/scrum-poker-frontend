
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-8">
      <h1 className="text-4xl font-bold mb-4">The Scrum Poker</h1>
      <p className="text-lg text-gray-600 mb-8">
        Estimate story points collaboratively with your team.
      </p>
      <div className="flex flex-col gap-4 justify-center">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Enter User Name"
            className="input input-bordered w-64"
            // value={roomId}
            // onChange={(e) => setRoomId(e.target.value)}
          />
          <Link href="/room">
            <button className="btn btn-primary px-6">
              Create Room
            </button>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Existing Room ID"
            className="input input-bordered w-64"
            // value={roomId}
            // onChange={(e) => setRoomId(e.target.value)}
          />
          <button className="btn btn-secondary px-6">
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
