import type { TextureKind } from '@/lib/textures';

export type MaterialFamily = 'fabric' | 'leather' | 'wood' | 'stone' | 'metal' | 'lacquer' | 'ceramic' | 'rug';

export interface MaterialDef {
  id: string;
  name: string;
  family: MaterialFamily;
  color: string;
  roughness: number;
  metalness?: number;
  texture?: TextureKind;
  /** Texture repeats per UV unit on furniture */
  repeat?: number;
  /** Bump strength from the procedural height map */
  bump?: number;
  sheen?: boolean;
  /** Price adjustment applied to products using this finish, in % */
  premium?: number;
  note?: string;
}

const m = (d: MaterialDef) => d;

export const materials: Record<string, MaterialDef> = Object.fromEntries(
  [
    // Upholstery
    m({ id: 'boucle-ivory', name: 'Ivory bouclé', family: 'fabric', color: '#E7E1D5', roughness: 0.95, texture: 'boucle', repeat: 2.5, bump: 0.9, sheen: true, premium: 6, note: 'Looped wool and linen yarn, Italy' }),
    m({ id: 'boucle-oat', name: 'Oat bouclé', family: 'fabric', color: '#CFC2AC', roughness: 0.95, texture: 'boucle', repeat: 2.5, bump: 0.9, sheen: true, premium: 6, note: 'Looped wool and linen yarn, Italy' }),
    m({ id: 'linen-natural', name: 'Natural linen', family: 'fabric', color: '#D9CFBD', roughness: 0.92, texture: 'linen', repeat: 3, bump: 0.5, sheen: true, note: 'Stonewashed Belgian linen' }),
    m({ id: 'linen-sand', name: 'Sand linen', family: 'fabric', color: '#BFB098', roughness: 0.92, texture: 'linen', repeat: 3, bump: 0.5, sheen: true, note: 'Stonewashed Belgian linen' }),
    m({ id: 'linen-olive', name: 'Olive linen', family: 'fabric', color: '#7F8468', roughness: 0.92, texture: 'linen', repeat: 3, bump: 0.5, sheen: true, note: 'Stonewashed Belgian linen' }),
    m({ id: 'mohair-terracotta', name: 'Terracotta mohair', family: 'fabric', color: '#9C5C3F', roughness: 0.85, texture: 'wool', repeat: 3, bump: 0.4, sheen: true, premium: 10, note: 'Mohair velvet, deep pile' }),
    m({ id: 'wool-charcoal', name: 'Charcoal wool', family: 'fabric', color: '#4A4844', roughness: 0.94, texture: 'wool', repeat: 3, bump: 0.4, sheen: true, note: 'Felted Scandinavian wool' }),
    m({ id: 'leather-cognac', name: 'Cognac leather', family: 'leather', color: '#8A5634', roughness: 0.55, texture: 'leather', repeat: 2, bump: 0.25, premium: 18, note: 'Vegetable-tanned aniline leather' }),
    m({ id: 'leather-espresso', name: 'Espresso leather', family: 'leather', color: '#3B2C24', roughness: 0.5, texture: 'leather', repeat: 2, bump: 0.25, premium: 18, note: 'Vegetable-tanned aniline leather' }),

    // Wood
    m({ id: 'oak-natural', name: 'Natural oak', family: 'wood', color: '#C29D72', roughness: 0.62, texture: 'wood', repeat: 1, bump: 0.15, note: 'European white oak, oiled' }),
    m({ id: 'oak-white', name: 'Limed oak', family: 'wood', color: '#D8C7A9', roughness: 0.66, texture: 'wood', repeat: 1, bump: 0.15, note: 'White-pigmented oil finish' }),
    m({ id: 'oak-smoked', name: 'Smoked oak', family: 'wood', color: '#6E5540', roughness: 0.6, texture: 'wood', repeat: 1, bump: 0.15, premium: 6, note: 'Fumed with ammonia for depth' }),
    m({ id: 'walnut', name: 'American walnut', family: 'wood', color: '#64462F', roughness: 0.55, texture: 'wood', repeat: 1, bump: 0.15, premium: 12, note: 'Solid black walnut, hardwax oil' }),
    m({ id: 'ash-black', name: 'Blackened ash', family: 'wood', color: '#2C2925', roughness: 0.6, texture: 'wood', repeat: 1, bump: 0.15, premium: 4, note: 'Open grain, pigmented black' }),

    // Stone
    m({ id: 'travertine', name: 'Travertine', family: 'stone', color: '#D6C7AE', roughness: 0.72, texture: 'travertine', repeat: 1, bump: 0.6, premium: 14, note: 'Unfilled, honed, Tivoli quarry' }),
    m({ id: 'travertine-noce', name: 'Noce travertine', family: 'stone', color: '#B39478', roughness: 0.7, texture: 'travertine', repeat: 1, bump: 0.6, premium: 16, note: 'Warm walnut-toned travertine' }),
    m({ id: 'marble-calacatta', name: 'Calacatta marble', family: 'stone', color: '#ECE9E3', roughness: 0.3, texture: 'marble', repeat: 1, bump: 0.05, premium: 22, note: 'Honed white marble with soft veining' }),
    m({ id: 'marble-verde', name: 'Verde marble', family: 'stone', color: '#3D4840', roughness: 0.28, texture: 'marble', repeat: 1, bump: 0.05, premium: 24, note: 'Deep green marble, polished' }),
    m({ id: 'concrete', name: 'Cast concrete', family: 'stone', color: '#A8A49C', roughness: 0.85, texture: 'concrete', repeat: 1, bump: 0.3, note: 'Fibre-reinforced, sealed' }),

    // Metal
    m({ id: 'brass', name: 'Brushed brass', family: 'metal', color: '#B79A68', roughness: 0.34, metalness: 1, texture: 'brushed', repeat: 1, premium: 8, note: 'Unlacquered, ages naturally' }),
    m({ id: 'steel', name: 'Brushed steel', family: 'metal', color: '#A7A6A1', roughness: 0.38, metalness: 1, texture: 'brushed', repeat: 1, note: 'Satin-brushed stainless' }),
    m({ id: 'bronze', name: 'Dark bronze', family: 'metal', color: '#5E4D3C', roughness: 0.42, metalness: 1, texture: 'brushed', repeat: 1, premium: 8, note: 'Patinated bronze finish' }),
    m({ id: 'metal-black', name: 'Graphite', family: 'metal', color: '#272725', roughness: 0.55, metalness: 0.5, note: 'Powder-coated steel' }),

    // Lacquer
    m({ id: 'lacquer-chalk', name: 'Chalk lacquer', family: 'lacquer', color: '#E4DFD4', roughness: 0.5, note: 'Matt water-based lacquer' }),
    m({ id: 'lacquer-olive', name: 'Olive lacquer', family: 'lacquer', color: '#6C7158', roughness: 0.5, note: 'Matt water-based lacquer' }),
    m({ id: 'lacquer-ink', name: 'Ink lacquer', family: 'lacquer', color: '#2A2A27', roughness: 0.45, note: 'Matt water-based lacquer' }),

    // Ceramic
    m({ id: 'ceramic-chalk', name: 'Chalk glaze', family: 'ceramic', color: '#E6E1D6', roughness: 0.6, texture: 'plaster', repeat: 1, bump: 0.2, note: 'Hand-thrown stoneware' }),
    m({ id: 'ceramic-ash', name: 'Ash glaze', family: 'ceramic', color: '#8E8B83', roughness: 0.65, texture: 'plaster', repeat: 1, bump: 0.2, note: 'Hand-thrown stoneware' }),
    m({ id: 'terracotta', name: 'Terracotta', family: 'ceramic', color: '#A7684A', roughness: 0.85, texture: 'concrete', repeat: 1, bump: 0.25, note: 'Unglazed clay' }),
    m({ id: 'stoneware-black', name: 'Black stoneware', family: 'ceramic', color: '#2E2C29', roughness: 0.7, texture: 'plaster', repeat: 1, bump: 0.2, note: 'Iron-rich clay body' }),

    // Rugs
    m({ id: 'rug-ivory', name: 'Ivory wool', family: 'rug', color: '#E2DACA', roughness: 1, texture: 'rug', repeat: 1, bump: 0.8, note: 'Hand-knotted New Zealand wool' }),
    m({ id: 'rug-stone', name: 'Stone wool', family: 'rug', color: '#9F988C', roughness: 1, texture: 'rug', repeat: 1, bump: 0.8, note: 'Hand-knotted New Zealand wool' }),
    m({ id: 'rug-jute', name: 'Natural jute', family: 'rug', color: '#BBA27C', roughness: 1, texture: 'jute', repeat: 1, bump: 1, premium: -12, note: 'Flatweave jute and wool' }),
  ].map((d) => [d.id, d]),
);

export const getMaterialDef = (id: string): MaterialDef => materials[id] ?? materials['linen-natural'];

/* ------------------------------------------------------------------ */
/* Room surfaces                                                       */
/* ------------------------------------------------------------------ */

export interface SurfaceFinish {
  id: string;
  name: string;
  texture?: TextureKind;
  color: string;
  roughness: number;
  /** Size in metres that one texture tile represents */
  tile: number;
  bump?: number;
  /** Whether the user colour tints this finish (paints & plasters) */
  tintable?: boolean;
}

export const floorFinishes: SurfaceFinish[] = [
  { id: 'oak-boards', name: 'Wide oak boards', texture: 'planks', color: '#C4A27A', roughness: 0.6, tile: 2.4, bump: 0.15 },
  { id: 'limed-oak-boards', name: 'Limed oak boards', texture: 'planks', color: '#D8C9AE', roughness: 0.65, tile: 2.4, bump: 0.15 },
  { id: 'smoked-oak-boards', name: 'Smoked oak boards', texture: 'planks', color: '#715A45', roughness: 0.55, tile: 2.4, bump: 0.15 },
  { id: 'travertine-tiles', name: 'Travertine flags', texture: 'tiles', color: '#D7C8B0', roughness: 0.7, tile: 1.6, bump: 0.35 },
  { id: 'concrete-floor', name: 'Polished concrete', texture: 'concrete', color: '#ACA89F', roughness: 0.5, tile: 3, bump: 0.12 },
  { id: 'terrazzo', name: 'Terrazzo', texture: 'terrazzo', color: '#E2DDD3', roughness: 0.45, tile: 1.4, bump: 0.05 },
];

export const wallFinishes: SurfaceFinish[] = [
  { id: 'paint', name: 'Matt paint', color: '#EEEAE2', roughness: 0.92, tile: 2, tintable: true },
  { id: 'limewash', name: 'Limewash', texture: 'plaster', color: '#E6DED0', roughness: 0.95, tile: 2.6, bump: 0.25, tintable: true },
  { id: 'concrete-wall', name: 'Board-formed concrete', texture: 'concrete', color: '#B4B0A7', roughness: 0.9, tile: 2.4, bump: 0.3 },
  { id: 'oak-panel', name: 'Oak panelling', texture: 'slats', color: '#BE9C72', roughness: 0.65, tile: 1.2, bump: 0.3 },
  { id: 'walnut-panel', name: 'Walnut panelling', texture: 'slats', color: '#644731', roughness: 0.6, tile: 1.2, bump: 0.3 },
  { id: 'travertine-wall', name: 'Travertine cladding', texture: 'tiles', color: '#D5C6AD', roughness: 0.72, tile: 1.6, bump: 0.35 },
];

export const wallColours: { id: string; name: string; hex: string }[] = [
  { id: 'gesso', name: 'Gesso', hex: '#EEEAE2' },
  { id: 'bone', name: 'Bone', hex: '#E3DACB' },
  { id: 'clay', name: 'Clay', hex: '#CDB59D' },
  { id: 'sage', name: 'Sage', hex: '#B3B6A0' },
  { id: 'olive', name: 'Olive', hex: '#7E8369' },
  { id: 'stone', name: 'Stone', hex: '#BEB8AD' },
  { id: 'ochre', name: 'Ochre', hex: '#C49E66' },
  { id: 'umber', name: 'Umber', hex: '#6C5A4A' },
  { id: 'charcoal', name: 'Charcoal', hex: '#3E3D39' },
];

export const getFloorFinish = (id: string) => floorFinishes.find((f) => f.id === id) ?? floorFinishes[0];
export const getWallFinish = (id: string) => wallFinishes.find((f) => f.id === id) ?? wallFinishes[0];

/* ------------------------------------------------------------------ */
/* Material stories (homepage)                                         */
/* ------------------------------------------------------------------ */

export interface MaterialStory {
  id: string;
  name: string;
  materialId: string;
  origin: string;
  character: string;
  body: string;
  traits: { label: string; value: string }[];
}

export const materialStories: MaterialStory[] = [
  {
    id: 'oak', name: 'Oak', materialId: 'oak-natural', origin: 'Slavonia & northern France',
    character: 'Straight-grained, honest, slow to age.',
    body: 'We use quarter-sawn European oak for its calm grain and stability. Oiled rather than lacquered, it darkens a shade each year and takes repairs without complaint.',
    traits: [{ label: 'Hardness', value: '1,360 lbf' }, { label: 'Finish', value: 'Hardwax oil' }, { label: 'Ages to', value: 'Honey' }],
  },
  {
    id: 'walnut', name: 'Walnut', materialId: 'walnut', origin: 'Appalachian hardwood forests',
    character: 'Dark, figured, quietly luxurious.',
    body: 'Black walnut brings depth to a room without weight. Its heartwood moves from chocolate to violet-brown; we keep the sapwood out and the figure book-matched.',
    traits: [{ label: 'Hardness', value: '1,010 lbf' }, { label: 'Finish', value: 'Hardwax oil' }, { label: 'Ages to', value: 'Warm amber' }],
  },
  {
    id: 'travertine', name: 'Travertine', materialId: 'travertine', origin: 'Tivoli, Lazio',
    character: 'Porous, banded, warm to the eye.',
    body: 'Formed by mineral springs, travertine records its own making in horizontal bands and open pores. We leave it unfilled and honed so the surface stays soft to the touch.',
    traits: [{ label: 'Density', value: '2.5 g/cm³' }, { label: 'Finish', value: 'Honed, unfilled' }, { label: 'Care', value: 'Penetrating seal' }],
  },
  {
    id: 'marble', name: 'Marble', materialId: 'marble-calacatta', origin: 'Apuan Alps, Tuscany',
    character: 'Cool, luminous, veined by pressure.',
    body: 'Calacatta is chosen slab by slab for veining that reads at the scale of furniture. A honed finish keeps reflections soft and lets the stone gather a patina.',
    traits: [{ label: 'Density', value: '2.7 g/cm³' }, { label: 'Finish', value: 'Honed' }, { label: 'Care', value: 'pH-neutral soap' }],
  },
  {
    id: 'linen', name: 'Linen', materialId: 'linen-sand', origin: 'Flanders, Belgium',
    character: 'Dry hand, irregular slub, breathable.',
    body: 'Flax grown and woven within a few hundred kilometres. Stonewashing relaxes the weave so covers feel lived-in from the first day and soften further with each wash.',
    traits: [{ label: 'Weight', value: '340 g/m²' }, { label: 'Rub test', value: '40,000 Martindale' }, { label: 'Care', value: 'Removable covers' }],
  },
  {
    id: 'boucle', name: 'Bouclé', materialId: 'boucle-ivory', origin: 'Biella, Piedmont',
    character: 'Looped, sculptural, catches light.',
    body: 'A looped yarn of wool and linen that gives soft forms a visible texture. It flatters curves and hides wear better than a smooth weave ever could.',
    traits: [{ label: 'Weight', value: '620 g/m²' }, { label: 'Rub test', value: '60,000 Martindale' }, { label: 'Composition', value: '78% wool, 22% linen' }],
  },
  {
    id: 'metal', name: 'Brushed metal', materialId: 'brass', origin: 'Workshops in Porto',
    character: 'Satin, directional, unlacquered.',
    body: 'Brass and steel are brushed by hand in one direction so light runs along a frame rather than pooling on it. Brass is left unlacquered to develop its own patina.',
    traits: [{ label: 'Alloy', value: 'CuZn37 brass' }, { label: 'Finish', value: 'Hand-brushed' }, { label: 'Ages to', value: 'Soft bronze' }],
  },
];
