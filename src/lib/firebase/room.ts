import {
    doc, 
    addDoc,
    getDoc, 
    updateDoc, 
    deleteDoc,
    collection, 
    arrayUnion, 
    query, 
    collectionGroup, 
    where, 
    getDocs 
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Room, PlayerRemovalPermission } from "@/types/room";

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
        playerRemovalPermissions: 'host-only',
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
export const removePlayerFromRoom = async (roomId: string, playerId: string, currentUserId?: string) => {
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

    // Validate permissions if currentUserId is provided
    if (currentUserId) {
        const isHost = roomData.createdBy === currentUserId;
        const permissions = roomData.playerRemovalPermissions || 'host-only';
        
        // Cannot remove the host
        if (playerId === roomData.createdBy) {
            throw new Error("Cannot remove the room host");
        }
        
        // Cannot remove yourself (should be handled client-side, but double-check)
        if (playerId === currentUserId) {
            throw new Error("Cannot remove yourself from the room");
        }
        
        // Check if current user has permission to remove players
        if (permissions === 'host-only' && !isHost) {
            throw new Error("Only the host can remove players from this room");
        }
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

    const rooms: Room[] = [];

    snapshot.forEach((doc) => {
        const roomData = doc.data();
        rooms.push({
            id: doc.id,
            ...roomData
        } as unknown as Room);
    });

    return rooms;
};

// Delete a room (host only)
export const deleteRoom = async (roomId: string, currentUserId: string) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }

    const roomData = roomSnap.data();
    
    // Validate that only the room owner can delete the room
    if (roomData.createdBy !== currentUserId) {
        throw new Error("Only the room host can delete this room");
    }

    await deleteDoc(roomRef);
};

// Update room name (host only)
export const updateRoomName = async (roomId: string, newName: string, currentUserId: string) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }

    const roomData = roomSnap.data();
    
    // Validate that only the room owner can update the room name
    if (roomData.createdBy !== currentUserId) {
        throw new Error("Only the room host can update this room");
    }

    await updateDoc(roomRef, { name: newName });
};

// Update room player removal permissions (host only)
export const updateRoomPermissions = async (roomId: string, permissions: PlayerRemovalPermission, currentUserId: string) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }

    const roomData = roomSnap.data();
    
    // Validate that only the room owner can update permissions
    if (roomData.createdBy !== currentUserId) {
        throw new Error("Only the room host can update permissions");
    }

    await updateDoc(roomRef, { playerRemovalPermissions: permissions });
};
