import { db } from "@/lib/firebase/firebase";
import {
    doc, 
    getDoc, 
    updateDoc, 
    setDoc, 
    collection,
    query,
    where, 
    getDocs, 
} from "firebase/firestore";
import { Player } from "@/types/player";

// Check if a player exists
export const playerExists = async (playerId: string) => {
    const playerRef = doc(db, 'players', playerId);
    const playerSnap = await getDoc(playerRef);

    return playerSnap.exists();
};

// Get a player's data
export const getPlayer = async (playerId: string) => {
    const playerRef = doc(db, 'players', playerId);
    const playerSnap = await getDoc(playerRef);

    if (!playerSnap.exists()) {
        throw new Error("Player not found");
    }

    return playerSnap.data();
};

// Create a new player
export const createPlayer = async (playerId: string, playerName: string) => {
    const newPlayer:  Partial<Player> = {
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

// Update a specific player's data
export const updatePlayer = async (playerId: string, playerData: Partial<Player>) => {
    const playerRef = doc(db, 'players', playerId);
    await updateDoc(playerRef, playerData);
};

// Update all players in a specific room
export const updatePlayers = async (roomId: string, playerData: Partial<Player>) => {
    const playersRef = collection(db, 'players');
    const q = query(playersRef, where('currentRoom', '==', roomId));
    const querySnap = await getDocs(q);

    // Use Promise.all to ensure all updates complete before resolving
    // This prevents race conditions from concurrent calls
    const updatePromises = querySnap.docs.map(async (doc) => {
        console.log("Updating player:", doc.id, playerData);
        return updateDoc(doc.ref, playerData);
    });

    await Promise.all(updatePromises);
};

// Update player display name - this updates the name field in Firestore to match Firebase Auth displayName
export const updatePlayerDisplayName = async (playerId: string, newDisplayName: string) => {
    const playerRef = doc(db, 'players', playerId);
    await updateDoc(playerRef, { name: newDisplayName });
};
