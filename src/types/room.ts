import { Player } from './player';

export interface Room {
    createdAt: Date;
    createdBy: string;
    name: string;
    status: string;
    players: Player[];
}
  