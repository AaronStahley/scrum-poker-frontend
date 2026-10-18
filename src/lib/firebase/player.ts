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
    serverTimestamp,
} from "firebase/firestore";
import { Player } from "@/types/player";
import { Theme } from "@/app/contexts/theme";
import { 
    DEFAULT_LIGHT_THEME, 
    DEFAULT_DARK_THEME,
    DEFAULT_THEME_MODE,
    getThemeModeFromTheme
} from "@/app/constants/themes";

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
        return updateDoc(doc.ref, playerData);
    });

    await Promise.all(updatePromises);
    await updateDoc(doc(db, 'rooms', roomId), { lastActivity: serverTimestamp() });
};

// Update player display name - this updates the name field in Firestore to match Firebase Auth displayName
// Uses setDoc with merge to handle both creation and update scenarios efficiently
export const updatePlayerDisplayName = async (playerId: string, newDisplayName: string) => {
    const playerRef = doc(db, 'players', playerId);
    await setDoc(playerRef, { name: newDisplayName }, { merge: true });
};

// Get a player's theme preference
export const getPlayerTheme = async (playerId: string): Promise<Theme | null> => {
    try {
        const playerRef = doc(db, 'players', playerId);
        const playerSnap = await getDoc(playerRef);

        if (!playerSnap.exists()) {
            return null;
        }

        const playerData = playerSnap.data() as Player;
        return playerData.preferences?.theme || null;
    } catch (error) {
        console.error('Error getting player theme:', error);
        return null;
    }
};

// Set a player's theme preference
export const setPlayerTheme = async (playerId: string, theme: Theme): Promise<void> => {
    try {
        const playerRef = doc(db, 'players', playerId);
        
        // Read current preferences to preserve existing fields
        const currentDoc = await getDoc(playerRef);
        const currentPreferences = currentDoc.data()?.preferences || {};
        
        await setDoc(playerRef, { 
            preferences: {
                ...currentPreferences,
                theme
            }
        }, { merge: true });
    } catch (error) {
        console.error('Error setting player theme:', error);
        throw error;
    }
};


// Get a player's light theme preference
export const getPlayerLightTheme = async (playerId: string): Promise<Theme | null> => {
    try {
        const playerRef = doc(db, 'players', playerId);
        const playerSnap = await getDoc(playerRef);

        if (!playerSnap.exists()) {
            return null;
        }

        const playerData = playerSnap.data() as Player;
        return playerData.preferences?.lightTheme || null;
    } catch (error) {
        console.error('Error getting player light theme:', error);
        return null;
    }
};

// Set a player's light theme preference
export const setPlayerLightTheme = async (playerId: string, lightTheme: Theme): Promise<void> => {
    try {
        const playerRef = doc(db, 'players', playerId);
        
        // Read current preferences to preserve existing fields
        const currentDoc = await getDoc(playerRef);
        const currentPreferences = currentDoc.data()?.preferences || {};
        
        await setDoc(playerRef, { 
            preferences: {
                ...currentPreferences,
                lightTheme
            }
        }, { merge: true });
    } catch (error) {
        console.error('Error setting player light theme:', error);
        throw error;
    }
};

// Get a player's dark theme preference
export const getPlayerDarkTheme = async (playerId: string): Promise<Theme | null> => {
    try {
        const playerRef = doc(db, 'players', playerId);
        const playerSnap = await getDoc(playerRef);

        if (!playerSnap.exists()) {
            return null;
        }

        const playerData = playerSnap.data() as Player;
        return playerData.preferences?.darkTheme || null;
    } catch (error) {
        console.error('Error getting player dark theme:', error);
        return null;
    }
};

// Set a player's dark theme preference
export const setPlayerDarkTheme = async (playerId: string, darkTheme: Theme): Promise<void> => {
    try {
        const playerRef = doc(db, 'players', playerId);
        
        // Read current preferences to preserve existing fields
        const currentDoc = await getDoc(playerRef);
        const currentPreferences = currentDoc.data()?.preferences || {};
        
        await setDoc(playerRef, { 
            preferences: {
                ...currentPreferences,
                darkTheme
            }
        }, { merge: true });
    } catch (error) {
        console.error('Error setting player dark theme:', error);
        throw error;
    }
};

// Get a player's theme mode preference
export const getPlayerThemeMode = async (playerId: string): Promise<'system' | 'light' | 'dark' | null> => {
    try {
        const playerRef = doc(db, 'players', playerId);
        const playerSnap = await getDoc(playerRef);

        if (!playerSnap.exists()) {
            return null;
        }

        const playerData = playerSnap.data() as Player;
        return playerData.preferences?.themeMode || null;
    } catch (error) {
        console.error('Error getting player theme mode:', error);
        return null;
    }
};

// Set a player's theme mode preference
export const setPlayerThemeMode = async (playerId: string, themeMode: 'system' | 'light' | 'dark'): Promise<void> => {
    try {
        const playerRef = doc(db, 'players', playerId);
        
        // Read current preferences to preserve existing fields
        const currentDoc = await getDoc(playerRef);
        const currentPreferences = currentDoc.data()?.preferences || {};
        
        await setDoc(playerRef, { 
            preferences: {
                ...currentPreferences,
                themeMode
            }
        }, { merge: true });
    } catch (error) {
        console.error('Error setting player theme mode:', error);
        throw error;
    }
};


// Migrate anonymous theme preferences to dual theme system
export const migrateAnonymousThemeToDualSystem = async (
    playerId: string, 
    anonymousTheme: Theme, 
    anonymousThemeMode?: 'system' | 'light' | 'dark' | null
): Promise<void> => {
    try {
        // Use default themes for dual system
        const lightTheme: Theme = DEFAULT_LIGHT_THEME;
        const darkTheme: Theme = DEFAULT_DARK_THEME;
        
        // Determine theme mode from anonymous preferences using theme metadata
        let themeMode: 'system' | 'light' | 'dark' = DEFAULT_THEME_MODE;
        
        if (anonymousThemeMode && anonymousThemeMode !== 'system' && anonymousThemeMode !== null) {
            // If explicit mode was set (not null or system), use it
            themeMode = anonymousThemeMode;
        } else {
            // Determine mode based on theme metadata for null/system/undefined cases
            themeMode = getThemeModeFromTheme(anonymousTheme);
        }

        // Set the dual theme preferences using proper nested object to preserve other preferences
        const playerRef = doc(db, 'players', playerId);
        
        // Read current preferences to preserve existing fields
        const currentDoc = await getDoc(playerRef);
        const currentPreferences = currentDoc.data()?.preferences || {};
        
        await setDoc(playerRef, {
            preferences: {
                ...currentPreferences,
                lightTheme,
                darkTheme,
                themeMode
            }
        }, { merge: true });

        // Clear anonymous theme preferences from localStorage
        if (typeof window !== "undefined") {
            localStorage.removeItem("anonymous-theme");
            localStorage.removeItem("anonymous-theme-mode");
        }
    } catch (error) {
        console.error('Error migrating anonymous theme to dual system:', error);
        throw error;
    }
};
