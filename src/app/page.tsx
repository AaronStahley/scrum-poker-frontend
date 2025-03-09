
import CreateRoom from "./components/CreateRoom";
import JoinRoom from "./components/JoinRoom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-8">
      <h1 className="text-4xl font-bold mb-4">The Scrum Poker</h1>
      <p className="text-lg text-gray-600 mb-8">
        Estimate story points collaboratively with your team.
      </p>
      <div className="flex flex-col gap-4 justify-center">
        <CreateRoom />
        <JoinRoom />
      </div>
    </div>
  );
}
