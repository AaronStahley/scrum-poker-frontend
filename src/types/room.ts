import { Player } from './player';

export interface Room {
    id: string;
    createdAt: Date;
    createdBy: string;
    name: string;
    status: string;
    players: string[];
}