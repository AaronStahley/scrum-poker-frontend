export interface Player {
    id: string;
    name: string;
    selection: number | string | null;
    currentRoom: string | null;
    lastJoinedAt: Date;
    createdAt: Date;
  }
  