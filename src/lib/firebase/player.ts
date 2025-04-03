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
import PlayerNavDropdown from "@/app/components/nav/PlayerNavDropdown";

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

export const getPreviousRooms = async (playerId: string) => {
    const playerRef = doc(db, 'players', playerId);
    const playerSnap = await getDoc(playerRef);

    if (!playerSnap.exists()) {
        throw new Error("Player not found");
    }

    

    const playerData = playerSnap.data();
    const playerRooms = playerData.rooms || [];

    return playerRooms;
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
  
