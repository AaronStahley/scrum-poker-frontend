import PlayingCardSelector from '../components/PlayingCardSelector'
import PlayerTable from '../components/PlayerTable'

interface Players {
  id: string;
  name: string;
  selection: number | string | null;
}

const RoomPage = async () => {
  const res = await fetch('https://jsonplaceholder.typicode.com/users', {cache: "no-store"});
  const players: Players[] = await res.json();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
      <h1 className="text-4xl font-bold mb-6">Select Your Story Point</h1>
      <PlayingCardSelector />
      <div className='flex flex-wrap gap-4 justify-center p-6'>
        <button className="text-base btn btn-primary">Submit Vote</button>
        <button className="text-base btn btn-secondary">Reveal Votes</button>
      </div>
      <PlayerTable players={players} revealVotes={false} />
    </div>
  )
}

export default RoomPage