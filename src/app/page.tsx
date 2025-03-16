
import CreateRoom from "./components/room/CreateRoom";
import JoinRoom from "./components/room/JoinRoom";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-4 ">The Scrum Poker</h1>
      <p className="text-lg text-secondary mb-5">
        Estimate story points collaboratively with your team.
      </p>
      <div className="flex flex-col gap-4 justify-center">
        <CreateRoom />
        <JoinRoom />
      </div>
    </div>
  );
}
