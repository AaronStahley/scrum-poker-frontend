import { db } from "@/lib/firebase/firebase";
import {
    doc, 
    getDoc, 
    updateDoc, 
    setDoc, 
    arrayUnion, 
    collection,
    query,
    where, 
    getDocs, 
    Unsubscribe,
    onSnapshot
} from "firebase/firestore";
import { Player } from "@/types/player";

export const createPlayer = async (playerId: string, playerName: string) => {

    const newPlayer: Player = {
        id: playerId,
        name: playerName,
        currentRoom: null,
        rooms: [],
        selection: null,
        createdAt: new Date(),
    };

    const playerRef = doc(db, 'players', playerId);
    await setDoc(playerRef, newPlayer);

    console.log(`Player created with ID: ${playerRef.id}`);
    return playerRef.id;
};

export const updatePlayers = async (roomId: string, playerData: Partial<Player>) => {
    const playersRef = collection(db, 'players');
    const q = query(playersRef, where('currentRoom', '==', roomId));
    const querySnap = await getDocs(q);

    querySnap.forEach(async (doc) => {
        console.log("Updating player:", doc.id, playerData);
        await updateDoc(doc.ref, playerData);
    });
}

export const updatePlayer = async (playerId: string, playerData: Partial<Player>) => {
    const playerRef = doc(db, 'players', playerId);
    await updateDoc(playerRef, playerData);
}

export const playerExists = async (playerId: string) => {
    const playerRef = doc(db, 'players', playerId);
    const playerSnap = await getDoc(playerRef);

    return playerSnap.exists();
};

export const getPlayer = async (playerId: string) => {
    const playerRef = doc(db, 'players', playerId);
    const playerSnap = await getDoc(playerRef);

    if (!playerSnap.exists()) {
        throw new Error("Player not found");
    }

    return playerSnap.data();
}

export const addRoomToPlayer = async (playerId: string, roomId: string) => {
    console.log("Adding room to player:", playerId, roomId);
    const playerRef = doc(db, 'players', playerId);
    const playerSnap = await getDoc(playerRef);

    if (!playerSnap.exists()) {
        throw new Error("Player not found");
    }

    await updateDoc(playerRef, {
        currentRoom: roomId,
        rooms: arrayUnion(roomId),
    });
}

export const removeRoomFromPlayer = async (playerId: string, roomId: string) => {
    const playerRef = doc(db, 'players', playerId);
    const playerSnap = await getDoc(playerRef);

    if (!playerSnap.exists()) {
        throw new Error("Player not found");
    }

    const playerData = playerSnap.data();
    const playersInRoom = playerData.rooms || [];
    const isPlayerInRoom = playersInRoom.some((p: string) => p === roomId);
    if (!isPlayerInRoom) {
        console.log("Player is not part of the associated room", roomId);
        return;
    }

    //Remove the player from the room
    await updateDoc(playerRef, {
        rooms: playersInRoom.filter((r: string) => r !== roomId),
    });
    
}

export const getPlayersInRoom = async (roomId: string) => {
    console.log("Getting players in room:", roomId);
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
  
    if (!roomSnap.exists()) {
      throw new Error('Room does not exist');
    }
  
    const playerIds = roomSnap.data().players || [];
  
    if (playerIds.length === 0) return [];
  
    // Firestore `in` queries only support up to 10 values at a time
    const chunks = chunkArray(playerIds, 10);
    const players: Player[] = [];
  
    for (const chunk of chunks) {
      const playersRef = collection(db, 'players');
      const q = query(playersRef, where('__name__', 'in', chunk));
      const querySnap = await getDocs(q);
  
      querySnap.forEach(doc => {
        const playerData = doc.data();
        players.push({
            id: doc.id,
            name: playerData.name,
            selection: playerData.selection,
            currentRoom: playerData.currentRoom,
            rooms: playerData.rooms,
            createdAt: playerData.createdAt,
        });
      });
    }
  
    console.log("Players in room:", players);
    return players;
  };
  
  export const listenToPlayersInRoom = async (
    roomId: string,
    onUpdate: (players: any[]) => void
  ): Promise<Unsubscribe[]> => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
  
    if (!roomSnap.exists()) {
      throw new Error('Room does not exist');
    }
  
    const playerIds: string[] = roomSnap.data().playerIds || [];
  
    if (playerIds.length === 0) {
      onUpdate([]);
      return [];
    }
  
    const chunks = chunkArray(playerIds, 10);
    const unsubscribes: Unsubscribe[] = [];
  
    for (const chunk of chunks) {
      const q = query(collection(db, 'players'), where('__name__', 'in', chunk));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const players = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        onUpdate(players);
      });
  
      unsubscribes.push(unsubscribe);
    }
  
    return unsubscribes;
  };

  function chunkArray(array: string[], size: number) {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
      array.slice(i * size, i * size + size)
    );
  }