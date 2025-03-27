import { db } from "@/lib/firebase/firebase";
import {doc, getDoc, setDoc } from "firebase/firestore";
import { Player } from "@/types/player";

export const createPlayer = async (playerId: string, playerName: string) => {

    const newPlayer: Player = {
        id: playerId,
        name: playerName,
        currentRoom: null,
        selection: null,
        createdAt: new Date(),
    };

    const playerRef = doc(db, 'players', playerId);
    await setDoc(playerRef, newPlayer);

    console.log(`Player created with ID: ${playerRef.id}`);
    return playerRef.id;
};

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
      