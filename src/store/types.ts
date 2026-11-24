export type RoomType = 'living' | 'bedroom' | 'dining' | 'kitchen' | 'office' | 'studio';

/** Walls: 0 north (back, z = -d/2) · 1 east (x = +w/2) · 2 south (front, z = +d/2) · 3 west (x = -w/2) */
export type WallIndex = 0 | 1 | 2 | 3;

export interface Opening {
  kind: 'window' | 'door';
  wall: WallIndex;
  /** Centre along the wall in metres, measured from the wall's midpoint (x for N/S walls, z for E/W walls) */
  offset: number;
  width: number;
  height: number;
  /** Window sill height */
  sill?: number;
}

export interface RoomState {
  type: RoomType;
  width: number;
  depth: number;
  height: number;
  floor: string;
  wallFinish: string;
  wallColor: string;
  accentWall: WallIndex | null;
  accentFinish: string;
  openings: Opening[];
}

export interface PlacedItem {
  uid: string;
  productId: string;
  x: number;
  z: number;
  /** radians around Y */
  rotation: number;
  materials: Record<string, string>;
  /** Wall items: mount height. Ceiling items: fixture height. */
  elevation?: number;
}

export type LightingPreset = 'daylight' | 'afternoon' | 'sunset' | 'evening' | 'night';
export type CameraPreset = 'perspective' | 'front' | 'top' | 'corner';
export type StudioTool = 'spaces' | 'furniture' | 'materials' | 'lighting' | 'layout' | 'summary';

export interface DesignSnapshot {
  room: RoomState;
  items: PlacedItem[];
  lighting: LightingPreset;
}

export interface SavedProject {
  id: string;
  name: string;
  spaceSlug?: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  design: DesignSnapshot;
}
