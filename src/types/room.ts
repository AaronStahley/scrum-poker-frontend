export type PlayerRemovalPermission = 'host-only' | 'all-players';

export interface Room {
    id: string;
    createdAt: Date;
    createdBy: string;
    name: string;
    status: string;
    players: string[];
    spectators?: string[];
    playerRemovalPermissions?: PlayerRemovalPermission;
}