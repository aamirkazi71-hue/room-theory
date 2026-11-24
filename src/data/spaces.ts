import type { PhotoKey } from './assets';
import type { DesignSnapshot, LightingPreset, Opening, PlacedItem, RoomState, RoomType } from '@/store/types';
import { defaultMaterials, getProduct } from './furniture';
import { isRtl, t } from '@/i18n';

/* ------------------------------------------------------------------ */
/* Room templates — base geometry + a furnished layout per room type   */
/* ------------------------------------------------------------------ */

type LayoutRow = [productId: string, x: number, z: number, rotDeg: number, materials?: Record<string, string>, elevation?: number];

interface RoomTemplate {
  type: RoomType;
  label: string;
  width: number;
  depth: number;
  height: number;
  openings: Opening[];
  layout: LayoutRow[];
}

export const roomTemplates: Record<RoomType, RoomTemplate> = {
  living: {
    type: 'living', label: 'Living room', width: 6.2, depth: 5, height: 2.9,
    openings: [
      { kind: 'window', wall: 0, offset: -0.4, width: 2.4, height: 1.95, sill: 0.45 },
      { kind: 'window', wall: 1, offset: -0.6, width: 1.4, height: 1.95, sill: 0.45 },
      { kind: 'door', wall: 3, offset: 1.6, width: 0.9, height: 2.15 },
    ],
    layout: [
      ['weft-rug', 0.1, 0.1, 0],
      ['sable-sofa', -1.75, 0.1, 90],
      ['plinth-coffee-table', 0.1, 0.1, 90],
      ['orla-lounge-chair', 1.55, -0.65, -68],
      ['pell-accent-chair', 1.55, 0.95, -118],
      ['drum-side-table', -1.75, -1.85, 0],
      ['stem-floor-lamp', -2.6, 1.95, 0],
      ['tonal-artwork', -3.1, 0.1, 90, undefined, 1.6],
      ['arc-console', 1.85, -2.32, 0],
      ['dome-table-lamp', 2.3, -2.32, 0],
      ['urn-vase', 1.45, -2.32, 0],
      ['folio-books', 0.12, 0.35, 12],
      ['olea-floor-plant', 2.6, -1.6, 0],
      ['tuft-ottoman', 0.95, 1.75, 0],
    ],
  },
  bedroom: {
    type: 'bedroom', label: 'Bedroom', width: 4.8, depth: 4.4, height: 2.8,
    openings: [
      { kind: 'window', wall: 1, offset: -0.3, width: 1.6, height: 1.8, sill: 0.5 },
      { kind: 'door', wall: 2, offset: -1.5, width: 0.9, height: 2.1 },
    ],
    layout: [
      ['weft-rug', 0, 0.3, 0],
      ['still-bed', 0, -1.1, 0],
      ['nook-nightstand', -1.3, -1.95, 0],
      ['nook-nightstand', 1.3, -1.95, 0],
      ['dome-table-lamp', -1.3, -1.95, 0],
      ['dome-table-lamp', 1.3, -1.95, 0],
      ['column-wardrobe', -2.1, 0.9, 90],
      ['orla-lounge-chair', 1.55, 1.3, -140],
      ['stem-floor-lamp', 2.0, 1.85, 0],
      ['tonal-artwork', 0, -2.2, 0, undefined, 1.7],
      ['olea-floor-plant', 1.95, -0.35, 0],
      ['folio-books', 1.3, -1.9, 20],
    ],
  },
  dining: {
    type: 'dining', label: 'Dining room', width: 5.4, depth: 4.6, height: 3,
    openings: [
      { kind: 'window', wall: 1, offset: 0, width: 2.2, height: 2.2, sill: 0.3 },
      { kind: 'door', wall: 3, offset: -1.4, width: 0.9, height: 2.15 },
    ],
    layout: [
      ['ledger-dining-table', 0, 0.1, 0],
      ['rhea-dining-chair', -0.55, -0.52, 0],
      ['rhea-dining-chair', 0.55, -0.52, 0],
      ['rhea-dining-chair', -0.55, 0.72, 180],
      ['rhea-dining-chair', 0.55, 0.72, 180],
      ['rhea-dining-chair', 1.32, 0.1, -90],
      ['rhea-dining-chair', -1.32, 0.1, 90],
      ['halo-pendant', -0.55, 0.1, 0, undefined, 1.65],
      ['halo-pendant', 0.55, 0.1, 0, undefined, 1.65],
      ['arc-console', 0, -2.12, 0],
      ['urn-vase', -0.45, -2.12, 0],
      ['folio-books', 0.4, -2.12, -8],
      ['tonal-artwork', 0, -2.3, 0, undefined, 1.75],
      ['olea-floor-plant', -2.25, -1.85, 0],
      ['pell-accent-chair', 2.05, 1.75, -135],
    ],
  },
  kitchen: {
    type: 'kitchen', label: 'Kitchen', width: 5, depth: 4.4, height: 2.9,
    openings: [
      { kind: 'window', wall: 1, offset: -0.2, width: 1.8, height: 1.7, sill: 0.95 },
      { kind: 'door', wall: 3, offset: 1.3, width: 0.9, height: 2.15 },
    ],
    layout: [
      ['galley-kitchen', -0.6, -1.875, 0],
      ['hearth-island', 0, 0.35, 0],
      ['kett-counter-stool', -0.7, 0.98, 180],
      ['kett-counter-stool', 0, 0.98, 180],
      ['kett-counter-stool', 0.7, 0.98, 180],
      ['halo-pendant', -0.65, 0.35, 0, undefined, 1.85],
      ['halo-pendant', 0.65, 0.35, 0, undefined, 1.85],
      ['urn-vase', 0.75, 0.15, 0],
      ['folio-books', -0.8, 0.1, 10],
      ['olea-floor-plant', 1.95, -1.7, 0],
    ],
  },
  office: {
    type: 'office', label: 'Home office', width: 4.2, depth: 3.8, height: 2.8,
    openings: [
      { kind: 'window', wall: 0, offset: 0, width: 1.8, height: 1.5, sill: 0.85 },
      { kind: 'door', wall: 2, offset: 1.3, width: 0.9, height: 2.1 },
    ],
    layout: [
      ['weft-rug', 0.4, 0.55, 0, { rug: 'rug-jute' }],
      ['field-desk', 0, -1.45, 0],
      ['rhea-dining-chair', 0, -0.95, 180],
      ['dome-table-lamp', 0.5, -1.55, 0],
      ['folio-books', -0.45, -1.5, -6],
      ['grid-shelving', -1.92, 0.25, 90],
      ['orla-lounge-chair', 1.25, 0.95, -140],
      ['stem-floor-lamp', 1.75, 0.0, 0],
      ['tonal-artwork', 2.1, -0.6, -90, undefined, 1.5],
      ['olea-floor-plant', -1.7, -1.5, 0],
    ],
  },
  studio: {
    type: 'studio', label: 'Studio apartment', width: 7.2, depth: 5.2, height: 2.9,
    openings: [
      { kind: 'window', wall: 1, offset: 0, width: 1.8, height: 1.9, sill: 0.5 },
      { kind: 'window', wall: 3, offset: 0.6, width: 1.6, height: 1.9, sill: 0.5 },
      { kind: 'door', wall: 2, offset: -2.4, width: 0.9, height: 2.15 },
    ],
    layout: [
      ['still-bed', -2.5, -1.5, 0],
      ['nook-nightstand', -1.2, -2.35, 0],
      ['dome-table-lamp', -1.2, -2.35, 0],
      ['tonal-artwork', -2.5, -2.6, 0, undefined, 1.65],
      ['galley-kitchen', 1.8, -2.275, 0],
      ['grid-shelving', -0.9, 0.6, 90],
      ['weft-rug', 1.75, 0.6, 90],
      ['sable-sofa', 3.1, 0.6, -90],
      ['plinth-coffee-table', 1.75, 0.6, 90],
      ['orla-lounge-chair', 0.45, 0.95, 70],
      ['stem-floor-lamp', 3.2, 2.3, 0],
      ['folio-books', 1.8, 0.85, 8],
      ['olea-floor-plant', -3.2, 2.2, 0],
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Curated spaces                                                      */
/* ------------------------------------------------------------------ */

export type InteriorStyle =
  | 'Contemporary' | 'Minimalist' | 'Japandi' | 'Mid-century modern'
  | 'Scandinavian' | 'Organic modern' | 'Industrial' | 'Contemporary luxury';

export type Palette = 'warm' | 'earth' | 'mono' | 'deep';

export const paletteLabels: Record<Palette, { label: string; swatches: string[] }> = {
  warm: { label: 'Warm neutrals', swatches: ['#EEEAE2', '#D8C9AE', '#B8AD9D'] },
  earth: { label: 'Earth & clay', swatches: ['#CDB59D', '#A7684A', '#7E8369'] },
  mono: { label: 'Stone & monochrome', swatches: ['#E6E4DF', '#A8A49C', '#3E3D39'] },
  deep: { label: 'Deep & moody', swatches: ['#6C5A4A', '#4A4844', '#3D4840'] },
};

export const styles: InteriorStyle[] = ['Contemporary', 'Minimalist', 'Japandi', 'Mid-century modern', 'Scandinavian', 'Organic modern', 'Industrial', 'Contemporary luxury'];

/** Singular, lower-case room names for phrases such as "Calder living room". */
export const roomTypeSingular: Record<RoomType, string> = {
  living: 'living room', bedroom: 'bedroom', dining: 'dining room', kitchen: 'kitchen', office: 'home office', studio: 'studio apartment',
};

/**
 * A space's display name: "Calder living room" in English, "غرفة معيشة Calder" in Arabic,
 * where the noun leads. With `emphasise`, the room type is wrapped in *…* for Emph/SplitWords.
 */
export function spaceTitle(name: string, type: RoomType, emphasise = false) {
  const kind = t(roomTypeSingular[type]);
  const k = emphasise ? `*${kind}*` : kind;
  return isRtl() ? `${k} ${name}` : `${name} ${k}`;
}

export const roomTypeLabels: Record<RoomType, string> = {
  living: 'Living rooms', bedroom: 'Bedrooms', dining: 'Dining rooms', kitchen: 'Kitchens', office: 'Home offices', studio: 'Studio apartments',
};

export interface Space {
  slug: string;
  name: string;
  type: RoomType;
  style: InteriorStyle;
  palette: Palette;
  photo: PhotoKey;
  width: number;
  depth: number;
  height?: number;
  lede: string;
  description: string;
  characteristics: { label: string; value: string }[];
  finishes: Pick<RoomState, 'floor' | 'wallFinish' | 'wallColor'> & Partial<Pick<RoomState, 'accentWall' | 'accentFinish'>>;
  /** Per-product material overrides, applied to every instance */
  materials?: Record<string, Record<string, string>>;
  lighting?: LightingPreset;
  featured?: boolean;
}

export const spaces: Space[] = [
  {
    slug: 'calder-living-room', name: 'Calder', type: 'living', style: 'Contemporary', palette: 'warm', photo: 'livingContemporary', width: 6.2, depth: 5, featured: true,
    lede: 'A long living room organised around one low sofa and a stone table.',
    description: 'Calder is planned for conversation rather than a screen. The sofa faces two chairs across a heavy travertine table, the window is left clear, and a walnut-toned wall gives the room a warm back edge.',
    characteristics: [
      { label: 'Orientation', value: 'Dual aspect, north & east' },
      { label: 'Ceiling', value: '2.9 m, flat plaster' },
      { label: 'Circulation', value: 'Perimeter route from the door' },
      { label: 'Focal point', value: 'Travertine table under the window' },
    ],
    finishes: { floor: 'oak-boards', wallFinish: 'limewash', wallColor: '#E3DACB', accentWall: 3, accentFinish: 'walnut-panel' },
    materials: { 'sable-sofa': { upholstery: 'boucle-oat', base: 'oak-smoked' } },
    lighting: 'afternoon',
  },
  {
    slug: 'linen-bedroom', name: 'Linen', type: 'bedroom', style: 'Minimalist', palette: 'warm', photo: 'bedroomMinimal', width: 4.8, depth: 4.4, featured: true,
    lede: 'A bedroom with almost nothing in it, which is the point.',
    description: 'One bed, two stands, a wardrobe that reads as part of the wall. Linen is used everywhere it can be touched, and the only colour comes from the timber and the morning light.',
    characteristics: [
      { label: 'Orientation', value: 'East-facing window' },
      { label: 'Ceiling', value: '2.8 m' },
      { label: 'Storage', value: 'Full-height wardrobe on the entry wall' },
      { label: 'Focal point', value: 'Upholstered headboard' },
    ],
    finishes: { floor: 'limed-oak-boards', wallFinish: 'paint', wallColor: '#EEEAE2' },
    materials: { 'still-bed': { frame: 'oak-white', headboard: 'linen-natural', bedding: 'linen-natural' } },
    lighting: 'daylight',
  },
  {
    slug: 'plaster-dining-room', name: 'Plaster', type: 'dining', style: 'Organic modern', palette: 'mono', photo: 'diningSculptural', width: 5.4, depth: 4.6, height: 3, featured: true,
    lede: 'A dining room in concrete, timber and soft light.',
    description: 'A long oak table sits under two low pendants on a polished concrete floor. Walls are lime-plastered in a stone grey so the evening light from the pendants pools on the table rather than bouncing around the room.',
    characteristics: [
      { label: 'Orientation', value: 'Tall east window' },
      { label: 'Ceiling', value: '3.0 m' },
      { label: 'Seats', value: 'Six, extendable to eight' },
      { label: 'Focal point', value: 'Pendants over the table' },
    ],
    finishes: { floor: 'concrete-floor', wallFinish: 'limewash', wallColor: '#C9C4BA' },
    materials: { 'rhea-dining-chair': { frame: 'oak-smoked', seat: 'wool-charcoal' } },
    lighting: 'evening',
  },
  {
    slug: 'rua-studio-apartment', name: 'Rua', type: 'studio', style: 'Scandinavian', palette: 'earth', photo: 'studioApartment', width: 7.2, depth: 5.2, featured: true,
    lede: 'One room for sleeping, cooking and sitting — without feeling like one room.',
    description: 'Open shelving divides the bed from the living area without blocking light. The kitchen runs along the back wall, the sofa sits under the window, and a single rug defines where the day ends.',
    characteristics: [
      { label: 'Orientation', value: 'East & west windows' },
      { label: 'Zones', value: 'Sleep · Cook · Sit' },
      { label: 'Divider', value: 'Open oak shelving' },
      { label: 'Focal point', value: 'Sofa under the east window' },
    ],
    finishes: { floor: 'oak-boards', wallFinish: 'paint', wallColor: '#E3DACB' },
    materials: { 'sable-sofa': { upholstery: 'linen-sand', base: 'oak-natural' }, 'galley-kitchen': { body: 'oak-natural', top: 'travertine' } },
    lighting: 'daylight',
  },
  {
    slug: 'gallery-living-room', name: 'Gallery', type: 'living', style: 'Scandinavian', palette: 'warm', photo: 'livingGallery', width: 6, depth: 4.8,
    lede: 'A bright family room with space for books, plants and people.',
    description: 'Pale floors, linen upholstery and a rug that can take it. Gallery is a forgiving room: everything can be moved, and nothing minds being sat on.',
    characteristics: [
      { label: 'Orientation', value: 'South light, filtered' },
      { label: 'Ceiling', value: '2.9 m' },
      { label: 'Use', value: 'Family, everyday' },
      { label: 'Focal point', value: 'Artwork above the sofa' },
    ],
    finishes: { floor: 'limed-oak-boards', wallFinish: 'paint', wallColor: '#EEEAE2' },
    materials: { 'sable-sofa': { upholstery: 'linen-natural', base: 'oak-white' }, 'plinth-coffee-table': { top: 'oak-natural', base: 'oak-natural' } },
    lighting: 'daylight',
  },
  {
    slug: 'harbour-loft', name: 'Harbour', type: 'living', style: 'Industrial', palette: 'mono', photo: 'livingLoft', width: 7, depth: 5.6, height: 3.4,
    lede: 'A loft living room with high ceilings and cast surfaces.',
    description: 'Board-formed concrete, graphite metal and charcoal wool. Harbour uses the height of the room and keeps the furniture low, so the volume does the work.',
    characteristics: [
      { label: 'Ceiling', value: '3.4 m, exposed' },
      { label: 'Walls', value: 'Board-formed concrete' },
      { label: 'Metals', value: 'Graphite, brushed steel' },
      { label: 'Focal point', value: 'The full-height window' },
    ],
    finishes: { floor: 'concrete-floor', wallFinish: 'concrete-wall', wallColor: '#B4B0A7' },
    materials: { 'sable-sofa': { upholstery: 'wool-charcoal', base: 'ash-black' }, 'stem-floor-lamp': { metal: 'metal-black', shade: 'linen-natural' }, 'plinth-coffee-table': { top: 'concrete', base: 'concrete' } },
    lighting: 'afternoon',
  },
  {
    slug: 'vista-lounge', name: 'Vista', type: 'living', style: 'Contemporary luxury', palette: 'deep', photo: 'livingView', width: 6.4, depth: 5.2, height: 3.1,
    lede: 'A lounge in leather, walnut and dark marble for evenings.',
    description: 'Vista trades brightness for depth: walnut panelling, cognac leather and a verde marble table under low lamps. It is at its best after sunset.',
    characteristics: [
      { label: 'Ceiling', value: '3.1 m' },
      { label: 'Panelling', value: 'Walnut, full height' },
      { label: 'Stone', value: 'Verde marble' },
      { label: 'Focal point', value: 'Marble table under lamplight' },
    ],
    finishes: { floor: 'smoked-oak-boards', wallFinish: 'paint', wallColor: '#6C5A4A', accentWall: 3, accentFinish: 'walnut-panel' },
    materials: { 'sable-sofa': { upholstery: 'leather-cognac', base: 'walnut' }, 'plinth-coffee-table': { top: 'marble-verde', base: 'marble-verde' }, 'orla-lounge-chair': { upholstery: 'leather-espresso', frame: 'walnut' } },
    lighting: 'evening',
  },
  {
    slug: 'cedar-bedroom', name: 'Cedar', type: 'bedroom', style: 'Japandi', palette: 'earth', photo: 'bedroomTimber', width: 4.2, depth: 4,
    lede: 'A small bedroom with a timber wall and very low furniture.',
    description: 'Oak panelling behind the bed, olive linen on it, and nothing above knee height except the wardrobe. Cedar is about calm proportions in a modest footprint.',
    characteristics: [
      { label: 'Footprint', value: 'Compact, 16.8 m²' },
      { label: 'Accent', value: 'Oak-panelled bed wall' },
      { label: 'Bedding', value: 'Olive linen' },
      { label: 'Focal point', value: 'Timber wall' },
    ],
    finishes: { floor: 'oak-boards', wallFinish: 'limewash', wallColor: '#E3DACB', accentWall: 0, accentFinish: 'oak-panel' },
    materials: { 'still-bed': { frame: 'oak-natural', headboard: 'linen-sand', bedding: 'linen-olive' } },
    lighting: 'afternoon',
  },
  {
    slug: 'terrace-bedroom', name: 'Terrace', type: 'bedroom', style: 'Contemporary luxury', palette: 'mono', photo: 'bedroomGlass', width: 5.6, depth: 5,
    lede: 'A generous bedroom with travertine and a reading corner.',
    description: 'Travertine cladding frames the bed; the corner by the window gets a leather lounge chair and a lamp. A bedroom you might actually spend an afternoon in.',
    characteristics: [
      { label: 'Ceiling', value: '2.8 m' },
      { label: 'Cladding', value: 'Travertine bed wall' },
      { label: 'Corner', value: 'Reading chair & floor lamp' },
      { label: 'Focal point', value: 'Stone wall behind the bed' },
    ],
    finishes: { floor: 'smoked-oak-boards', wallFinish: 'paint', wallColor: '#E6E4DF', accentWall: 0, accentFinish: 'travertine-wall' },
    materials: { 'still-bed': { frame: 'walnut', headboard: 'boucle-oat', bedding: 'linen-natural' }, 'orla-lounge-chair': { upholstery: 'leather-cognac', frame: 'walnut' } },
    lighting: 'sunset',
  },
  {
    slug: 'moss-bedroom', name: 'Moss', type: 'bedroom', style: 'Mid-century modern', palette: 'deep', photo: 'bedroomGreen', width: 4.6, depth: 4.4,
    lede: 'Olive walls, walnut and terracotta — a warmer kind of dark.',
    description: 'Painted entirely in olive, Moss uses walnut and terracotta mohair to keep the room from going cold. Lamps do most of the lighting here.',
    characteristics: [
      { label: 'Walls', value: 'Olive, matt' },
      { label: 'Timber', value: 'American walnut' },
      { label: 'Textile', value: 'Terracotta mohair' },
      { label: 'Focal point', value: 'Headboard against olive' },
    ],
    finishes: { floor: 'smoked-oak-boards', wallFinish: 'paint', wallColor: '#7E8369' },
    materials: { 'still-bed': { frame: 'walnut', headboard: 'mohair-terracotta', bedding: 'linen-sand' }, 'nook-nightstand': { body: 'walnut' } },
    lighting: 'evening',
  },
  {
    slug: 'orchard-dining', name: 'Orchard', type: 'dining', style: 'Scandinavian', palette: 'warm', photo: 'diningAiry', width: 4.6, depth: 4,
    lede: 'A pale dining room that doubles as a place to work.',
    description: 'Limed oak, chalk walls and an olive tree in the corner. Orchard is bright enough to work at the table and soft enough for long dinners.',
    characteristics: [
      { label: 'Ceiling', value: '2.9 m' },
      { label: 'Light', value: 'Tall east window' },
      { label: 'Use', value: 'Dining & daytime work' },
      { label: 'Focal point', value: 'Olive tree by the window' },
    ],
    finishes: { floor: 'limed-oak-boards', wallFinish: 'paint', wallColor: '#EEEAE2' },
    materials: { 'ledger-dining-table': { top: 'oak-white', legs: 'oak-white' }, 'rhea-dining-chair': { frame: 'oak-white', seat: 'linen-natural' } },
    lighting: 'daylight',
  },
  {
    slug: 'refectory-dining', name: 'Refectory', type: 'dining', style: 'Mid-century modern', palette: 'earth', photo: 'diningGreen', width: 5.6, depth: 4.6,
    lede: 'A long table, olive linen and clay walls.',
    description: 'Refectory borrows the proportions of a monastery dining hall: a long table, matching chairs and plain walls in a warm clay. The olive seats are the only flourish.',
    characteristics: [
      { label: 'Walls', value: 'Clay limewash' },
      { label: 'Seats', value: 'Six in olive linen' },
      { label: 'Timber', value: 'Natural oak' },
      { label: 'Focal point', value: 'The table itself' },
    ],
    finishes: { floor: 'oak-boards', wallFinish: 'limewash', wallColor: '#CDB59D' },
    materials: { 'rhea-dining-chair': { frame: 'oak-natural', seat: 'linen-olive' }, 'halo-pendant': { metal: 'brass' } },
    lighting: 'afternoon',
  },
  {
    slug: 'umber-kitchen', name: 'Umber', type: 'kitchen', style: 'Contemporary luxury', palette: 'deep', photo: 'kitchenWalnut', width: 5, depth: 4.4,
    lede: 'A dark timber kitchen with a marble island.',
    description: 'Smoked oak cabinetry, a Calacatta island top and brass at the touch points. Umber is a kitchen to cook in and to linger at.',
    characteristics: [
      { label: 'Cabinetry', value: 'Smoked oak' },
      { label: 'Worktop', value: 'Calacatta marble' },
      { label: 'Seating', value: 'Three at the island' },
      { label: 'Focal point', value: 'Island under pendants' },
    ],
    finishes: { floor: 'travertine-tiles', wallFinish: 'paint', wallColor: '#E3DACB' },
    materials: { 'galley-kitchen': { body: 'oak-smoked', top: 'marble-calacatta' }, 'hearth-island': { body: 'oak-smoked', top: 'marble-calacatta' }, 'halo-pendant': { metal: 'brass' } },
    lighting: 'afternoon',
  },
  {
    slug: 'window-kitchen', name: 'Fenestra', type: 'kitchen', style: 'Scandinavian', palette: 'warm', photo: 'kitchenWindow', width: 4.6, depth: 4,
    lede: 'A pale kitchen built around a window.',
    description: 'Chalk cabinetry and a travertine top keep Fenestra light; the island is oak so it reads as furniture rather than kitchen.',
    characteristics: [
      { label: 'Cabinetry', value: 'Chalk lacquer' },
      { label: 'Worktop', value: 'Travertine' },
      { label: 'Island', value: 'Natural oak' },
      { label: 'Focal point', value: 'The window over the counter' },
    ],
    finishes: { floor: 'limed-oak-boards', wallFinish: 'paint', wallColor: '#EEEAE2' },
    materials: { 'hearth-island': { body: 'oak-natural', top: 'travertine' } },
    lighting: 'daylight',
  },
  {
    slug: 'sage-study', name: 'Sage', type: 'office', style: 'Japandi', palette: 'earth', photo: 'officeGreen', width: 4.2, depth: 3.8,
    lede: 'A study with a sage wall, open shelves and a reading chair.',
    description: 'The desk faces the window; the books sit behind you on open oak shelves; the lounge chair waits for the end of the day. Sage is a working room that does not look like an office.',
    characteristics: [
      { label: 'Walls', value: 'Sage, matt' },
      { label: 'Desk', value: 'Facing north light' },
      { label: 'Storage', value: 'Open oak shelving' },
      { label: 'Focal point', value: 'Window over the desk' },
    ],
    finishes: { floor: 'oak-boards', wallFinish: 'paint', wallColor: '#B3B6A0' },
    lighting: 'daylight',
  },
  {
    slug: 'atelier-office', name: 'Atelier', type: 'office', style: 'Minimalist', palette: 'mono', photo: 'officeWhite', width: 4.6, depth: 4.2,
    lede: 'A white workroom with graphite details.',
    description: 'Gesso walls, a walnut desk on graphite legs and a single shelving unit. Atelier is for concentration — everything else stays out of sight.',
    characteristics: [
      { label: 'Walls', value: 'Gesso' },
      { label: 'Desk', value: 'Walnut & graphite' },
      { label: 'Floor', value: 'Polished concrete' },
      { label: 'Focal point', value: 'Desk in the window' },
    ],
    finishes: { floor: 'concrete-floor', wallFinish: 'paint', wallColor: '#EEEAE2' },
    materials: { 'grid-shelving': { body: 'ash-black' } },
    lighting: 'daylight',
  },
  {
    slug: 'nook-studio', name: 'Nook', type: 'studio', style: 'Organic modern', palette: 'earth', photo: 'studioNook', width: 6.6, depth: 5,
    lede: 'A compact studio with a window seat feeling throughout.',
    description: 'Limewashed walls in clay, a jute rug and rounded forms. Nook makes a single room feel like a series of small, comfortable places.',
    characteristics: [
      { label: 'Walls', value: 'Clay limewash' },
      { label: 'Rug', value: 'Natural jute' },
      { label: 'Zones', value: 'Sleep · Cook · Sit' },
      { label: 'Focal point', value: 'Shelving divider' },
    ],
    finishes: { floor: 'oak-boards', wallFinish: 'limewash', wallColor: '#CDB59D' },
    materials: { 'weft-rug': { rug: 'rug-jute' }, 'sable-sofa': { upholstery: 'boucle-ivory', base: 'oak-natural' } },
    lighting: 'sunset',
  },
];

export const getSpace = (slug: string) => spaces.find((s) => s.slug === slug);

export const areaOf = (s: Pick<Space, 'width' | 'depth'>) => Math.round(s.width * s.depth * 10) / 10;
export type SizeBand = 'small' | 'medium' | 'large';
export const sizeBand = (s: Pick<Space, 'width' | 'depth'>): SizeBand => {
  const a = areaOf(s);
  return a < 20 ? 'small' : a <= 32 ? 'medium' : 'large';
};
export const sizeLabels: Record<SizeBand, string> = { small: 'Under 20 m²', medium: '20–32 m²', large: 'Over 32 m²' };

let uidCounter = 0;
export const newUid = () => `i${Date.now().toString(36)}${(uidCounter++).toString(36)}`;

/** Build a full studio design from a room type, optionally styled by a curated space. */
export function buildDesign(type: RoomType, space?: Space): DesignSnapshot {
  const t = roomTemplates[type];
  const width = space?.width ?? t.width;
  const depth = space?.depth ?? t.depth;
  const height = space?.height ?? t.height;
  const sx = width / t.width;
  const sz = depth / t.depth;
  const room: RoomState = {
    type,
    width, depth, height,
    floor: space?.finishes.floor ?? 'oak-boards',
    wallFinish: space?.finishes.wallFinish ?? 'paint',
    wallColor: space?.finishes.wallColor ?? '#EEEAE2',
    accentWall: space?.finishes.accentWall ?? null,
    accentFinish: space?.finishes.accentFinish ?? 'oak-panel',
    openings: t.openings.map((o) => ({ ...o, offset: o.offset * (o.wall % 2 === 0 ? sx : sz) })),
  };
  const items: PlacedItem[] = t.layout.flatMap(([productId, x, z, rot, mats, elevation]) => {
    const p = getProduct(productId);
    if (!p) return [];
    return [{
      uid: newUid(),
      productId,
      x: x * sx,
      z: z * sz,
      rotation: (rot * Math.PI) / 180,
      materials: { ...defaultMaterials(p), ...(space?.materials?.[productId] ?? {}), ...(mats ?? {}) },
      elevation: elevation ?? p.mount,
    }];
  });
  return { room, items, lighting: space?.lighting ?? 'afternoon' };
}

export function spaceProductIds(s: Space): string[] {
  return Array.from(new Set(roomTemplates[s.type].layout.map((r) => r[0])));
}
export const spaceItemCount = (s: Space) => roomTemplates[s.type].layout.length;
