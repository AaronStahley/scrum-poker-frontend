import { db } from "@/lib/firebase/firebase";
import {doc, addDoc, getDoc, updateDoc, collection, Timestamp } from "firebase/firestore";
import { Player } from "@/types/player";
import { Room } from "@/types/room";

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

export const addPlayerToRoom = async (roomId: string, playerId: string) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }

    const roomData = roomSnap.data();
    const players = roomData.players || [];
    const playerInRoom = players.some((p: string) => p === playerId);
    
    if (playerInRoom) {
        throw new Error("Player already in room");
    }

    await updateDoc(roomRef, {
        ownerId: roomData.ownerId === "anonymous" ? playerId : roomData.ownerId,
        players: players.concat(playerId),
    });
};

export const isPlayerInRoom = async (roomId: string, playerId: string) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }

    const roomData = roomSnap.data();
    const players = roomData.players || [];
    const playerInRoom = players.some((p: string) => p === playerId);

    if (!playerInRoom) {
        return false;
    }

    return true;
}

export const getRoom = async (roomId: string) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }

    return roomSnap.data();
}