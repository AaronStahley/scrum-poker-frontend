export type PlayerRemovalPermission = 'host-only' | 'all-players';
export type CardSequenceType = 'fibonacci' | 'modified-fibonacci' | 't-shirt';

export interface Room {
    id: string;
    createdAt: Date;
    createdBy: string;
    name: string;
    status: string;
    players: string[];
    spectators?: string[];
    playerRemovalPermissions?: PlayerRemovalPermission;
    cardSequence?: CardSequenceType;
    lastActivity?: Date;
}