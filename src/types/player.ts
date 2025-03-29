export interface Player {
    id: string;
    name: string;
    selection: number | string | null;
    currentRoom: string | null;
    rooms: string[];
    createdAt: Date;
  }
  