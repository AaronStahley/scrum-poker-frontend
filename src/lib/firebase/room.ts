import { db } from "@/lib/firebase/firebase";
import {doc, addDoc, getDoc, updateDoc, collection, Timestamp, arrayUnion } from "firebase/firestore";
import { Player } from "@/types/player";
import { Room } from "@/types/room";
import { addRoomToPlayer } from "./player";

export const createRoom = async (roomName: string, ownerId: string | null | undefined) => {
    const roomStatus = "waiting";

    if (!ownerId) {
        ownerId = "anonymous";
    }

    const newRoom: Room = {
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

export const updateRoom = async (roomId: string, roomData: Partial<Room>) => {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, roomData);
};

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

    //Update the room with the player
    await updateDoc(roomRef, {
        createdBy: roomData.createdBy === "anonymous" ? playerId : roomData.createdBy,
        players: arrayUnion(playerId),
    });
};

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

    //Remove the player from the room
    await updateDoc(roomRef, {
        players: playersInRoom.filter((p: string) => p !== playerId),
    });
}

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
}

export const getRoom = async (roomId: string) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }

    return roomSnap.data();
}

