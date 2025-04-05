import {
    doc, 
    addDoc,
    getDoc, 
    updateDoc, 
    collection, 
    arrayUnion, 
    query, 
    collectionGroup, 
    where, 
    getDocs 
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Room } from "@/types/room";

// Create a new room
export const createRoom = async (roomName: string, ownerId: string | null | undefined) => {
    const roomStatus = "waiting";

    if (!ownerId) {
        ownerId = "anonymous";
    }

    const newRoom: Partial<Room> = {
        createdAt: new Date(),
        createdBy: ownerId,
        name: roomName,
        status: roomStatus,
        players: [ownerId] as string[],
    };

    const roomRef = await addDoc(collection(db, 'rooms'), newRoom);

    console.log(`Room created with ID: ${roomRef.id}`);
    return roomRef.id;
};

// Get a room by ID
export const getRoom = async (roomId: string) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }

    return roomSnap.data();
};

// Update room data
export const updateRoom = async (roomId: string, roomData: Partial<Room>) => {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, roomData);
};

// Check if a player is in a room
export const isPlayerInRoom = async (roomId: string, playerId: string) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }

    const roomData = roomSnap.data();
    const players = roomData.players || [];
    const playerInRoom = players.some((p: string) => p === playerId);

    return playerInRoom;
};

// Add a player to a room
export const addPlayerToRoom = async (roomId: string, playerId: string) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }

    const roomData = roomSnap.data();
    const playersInRoom = roomData.players || [];
    const isPlayerInRoom = playersInRoom.some((p: string) => p === playerId);
    
    if (isPlayerInRoom) {
        console.log("Player already in room:", playerId);
        return;
    }

    console.log("Adding player to room:", roomId, playerId);

    await updateDoc(roomRef, {
        createdBy: roomData.createdBy === "anonymous" ? playerId : roomData.createdBy,
        players: arrayUnion(playerId),
    });
};

// Remove a player from a room
export const removePlayerFromRoom = async (roomId: string, playerId: string) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }

    const roomData = roomSnap.data();
    const playersInRoom = roomData.players || [];
    const isPlayerInRoom = playersInRoom.some((p: string) => p === playerId);
    if (!isPlayerInRoom) {
        console.log("Player not in room:", playerId);
        return;
    }

    await updateDoc(roomRef, {
        players: playersInRoom.filter((p: string) => p !== playerId),
    });
};

// Get previous rooms a player has participated in
export const getPreviousRooms = async (playerId: string) => {
    const q = query(
        collectionGroup(db, "rooms"),
        where("players", "array-contains", playerId)
    );

    const snapshot = await getDocs(q);

    const rooms: any = [];

    snapshot.forEach((doc) => {
        const roomData = doc.data();
        rooms.push({
            id: doc.id,
            ...roomData
        } as unknown as Room);
    });

    return rooms;
};
