'use client';

interface JoinRoleModalProps {
  onSelectRole: (role: 'player' | 'spectator') => void;
}

const JoinRoleModal: React.FC<JoinRoleModalProps> = ({ onSelectRole }) => {
  return (
    <dialog className="modal modal-middle text-center" open={true} suppressHydrationWarning>
      <div className="modal-box">
        <h2 className="text-xl font-bold mb-2">How would you like to join?</h2>
        <p className="text-sm text-base-content/60 mb-6">
          Players vote on estimates. Spectators observe without voting.
        </p>
        <div className="flex gap-3 justify-center">
          <button className="btn btn-primary flex-1" onClick={() => onSelectRole('player')}>
            Join as Player
          </button>
          <button className="btn btn-outline flex-1" onClick={() => onSelectRole('spectator')}>
            Join as Spectator
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default JoinRoleModal;
