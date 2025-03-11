import { Player } from './player';

export interface Room {
    params: { 
      roomId: string;
      players: Player[];
    };
  }
  