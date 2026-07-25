"use client";

import { useState } from "react";
import useJoinRoom from "@/app/hooks/useJoinRoom";
import { createRoom } from "@/lib/firebase/room";
import { useAuth } from "@/app/contexts/auth";
import LoadOverlay from "@/app/components/loading/LoadingOverlay";
import { CardSequenceType } from "@/types/room";
import { DEFAULT_CARD_SEQUENCE } from "@/lib/cardSequences";
import CreateRoomSettingsModal from "./CreateRoomSettingsModal";
import JoinRoleModal from "./JoinRoleModal";

const CreateRoom = () => {
  const [roomName, setRoomName] = useState("");
  const [cardSequence, setCardSequence] = useState<CardSequenceType>(DEFAULT_CARD_SEQUENCE);
  const [showSettings, setShowSettings] = useState(false);
  const { joinRoom, loadingRoom, isPending, showRoleModal, confirmRole } = useJoinRoom();
  const { player, showCreateNewPlayerModal } = useAuth();

  const handleOpenSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    if (form.checkValidity()) {
      setShowSettings(true);
    }
  };

  const handleCreateRoom = async (): Promise<void> => {
    const roomId = await createRoom(roomName, player?.uid, cardSequence);
    setShowSettings(false);
    await joinRoom(roomId);
  };

  return (
    <>
      {showRoleModal && <JoinRoleModal onSelectRole={confirmRole} />}
      {(loadingRoom || isPending) && <LoadOverlay />}
      <form onSubmit={handleOpenSettings} className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Enter Room Name"
          className={`input input-bordered min-w-64 text-base`}
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
          minLength={2}
          maxLength={25}
        />
        <button
          type="submit"
          className="btn btn-primary min-w-34 text-base"
        >
          Create Room
        </button>
      </form>
      <CreateRoomSettingsModal
        isOpen={showSettings && !showCreateNewPlayerModal && !showRoleModal}
        onClose={() => setShowSettings(false)}
        cardSequence={cardSequence}
        onChangeCardSequence={setCardSequence}
        onCreateRoom={handleCreateRoom}
      />
    </>
  );
};

export default CreateRoom;
