import { getMaterialDef } from './materials';
import { intlLocale, t } from '@/i18n';

export type StudioCategory = 'seating' | 'tables' | 'lighting' | 'decor' | 'bedroom' | 'storage' | 'electronics';
export type CollectionCategory = 'sofas' | 'lounge-chairs' | 'dining' | 'coffee-tables' | 'beds' | 'lighting' | 'storage' | 'electronics' | 'accessories';
/** floor: stands on the floor · surface: rests on a table top if one is beneath · wall: hangs on the nearest wall · ceiling: hangs from the ceiling · rug: lies under everything */
export type Placement = 'floor' | 'surface' | 'wall' | 'ceiling' | 'rug';

export type ModelKey =
  | 'sofa' | 'loungeChair' | 'accentChair' | 'ottoman' | 'diningChair' | 'counterStool'
  | 'coffeeTable' | 'sideTable' | 'diningTable' | 'console' | 'desk'
  | 'floorLamp' | 'tableLamp' | 'pendant'
  | 'plant' | 'vase' | 'books' | 'rug' | 'artwork'
  | 'bed' | 'nightstand' | 'wardrobe' | 'shelving' | 'island' | 'kitchenRun'
  | 'tv' | 'wallTv' | 'mediaConsole' | 'speaker' | 'soundbar' | 'turntable';

export interface MaterialSlot {
  key: string;
  label: string;
  options: string[];
  default: string;
}

export interface Product {
  id: string;
  name: string;
  model: ModelKey;
  studioCategory: StudioCategory;
  category: CollectionCategory;
  placement: Placement;
  /** centimetres */
  dims: { w: number; d: number; h: number };
  price: number;
  tagline: string;
  description: string;
  slots: MaterialSlot[];
  /** Height in metres of a top that surface items can rest on */
  surfaceHeight?: number;
  /** Chairs and stools may slide under items that allowTuck */
  tucksUnder?: boolean;
  allowsTuck?: boolean;
  /** Mounting height (m) for wall items / drop (m) for ceiling items */
  mount?: number;
  /** Emits light in the evening presets */
  emitsLight?: boolean;
  specs: { label: string; value: string }[];
  leadTime: string;
  featured?: boolean;
}

const UPH = ['boucle-ivory', 'boucle-oat', 'linen-natural', 'linen-sand', 'linen-olive', 'mohair-terracotta', 'wool-charcoal', 'leather-cognac', 'leather-espresso'];
const WOOD = ['oak-natural', 'oak-white', 'oak-smoked', 'walnut', 'ash-black'];
const STONE = ['travertine', 'travertine-noce', 'marble-calacatta', 'marble-verde'];
const METAL = ['brass', 'steel', 'bronze', 'metal-black'];
const CERAMIC = ['ceramic-chalk', 'ceramic-ash', 'terracotta', 'stoneware-black'];

const slot = (key: string, label: string, options: string[], def: string): MaterialSlot => ({ key, label, options, default: def });

export const products: Product[] = [
  // ——— Seating
  {
    id: 'sable-sofa', name: 'Sable', model: 'sofa', studioCategory: 'seating', category: 'sofas', placement: 'floor',
    dims: { w: 280, d: 98, h: 72 }, price: 6480, featured: true,
    tagline: 'Modular sofa, three seats',
    description: 'A low, deep sofa built from three independent modules on a recessed timber plinth. Feather-wrapped cushions keep their shape without looking stiff, and every cover zips off.',
    slots: [slot('upholstery', 'Upholstery', UPH, 'boucle-oat'), slot('base', 'Plinth', WOOD, 'oak-smoked')],
    specs: [{ label: 'Seat height', value: '40 cm' }, { label: 'Seat depth', value: '68 cm' }, { label: 'Frame', value: 'Kiln-dried beech, FSC' }, { label: 'Filling', value: 'Feather-wrapped HR foam' }],
    leadTime: '8–10 weeks',
  },
  {
    id: 'orla-lounge-chair', name: 'Orla', model: 'loungeChair', studioCategory: 'seating', category: 'lounge-chairs', placement: 'floor',
    dims: { w: 78, d: 86, h: 72 }, price: 2860, featured: true,
    tagline: 'Lounge chair with timber frame',
    description: 'A reclined lounge chair with a solid timber frame and loose cushions. The arm is wide enough for a cup, the back low enough to sit in the middle of a room.',
    slots: [slot('upholstery', 'Cushions', UPH, 'linen-sand'), slot('frame', 'Frame', WOOD, 'oak-natural')],
    specs: [{ label: 'Seat height', value: '38 cm' }, { label: 'Frame', value: 'Solid hardwood, mortise & tenon' }, { label: 'Cushions', value: 'Removable covers' }],
    leadTime: '6–8 weeks',
  },
  {
    id: 'pell-accent-chair', name: 'Pell', model: 'accentChair', studioCategory: 'seating', category: 'lounge-chairs', placement: 'floor',
    dims: { w: 76, d: 72, h: 70 }, price: 1940,
    tagline: 'Sculptural tub chair',
    description: 'A rounded shell on a quiet plinth. Pell is drawn as one continuous curve so it reads well from every side — useful when a chair has to stand away from the wall.',
    slots: [slot('upholstery', 'Upholstery', UPH, 'boucle-ivory'), slot('base', 'Base', [...WOOD, 'metal-black', 'brass'], 'oak-smoked')],
    specs: [{ label: 'Seat height', value: '42 cm' }, { label: 'Shell', value: 'Moulded foam on steel' }, { label: 'Swivel', value: 'No — fixed plinth' }],
    leadTime: '6–8 weeks',
  },
  {
    id: 'tuft-ottoman', name: 'Tuft', model: 'ottoman', studioCategory: 'seating', category: 'lounge-chairs', placement: 'floor',
    dims: { w: 62, d: 62, h: 40 }, price: 720,
    tagline: 'Round ottoman',
    description: 'A soft drum for feet, trays or an extra guest. Firm enough to perch on, light enough to move with one hand.',
    slots: [slot('upholstery', 'Upholstery', UPH, 'boucle-oat')],
    specs: [{ label: 'Filling', value: 'Recycled polyester & foam' }, { label: 'Weight', value: '7 kg' }],
    leadTime: '4–6 weeks',
  },
  {
    id: 'rhea-dining-chair', name: 'Rhea', model: 'diningChair', studioCategory: 'seating', category: 'dining', placement: 'floor', tucksUnder: true,
    dims: { w: 48, d: 52, h: 78 }, price: 640,
    tagline: 'Dining chair with curved back',
    description: 'A dining chair with a steam-bent back rail that holds the shoulders without a full backrest. Upholstered seat, solid timber throughout.',
    slots: [slot('frame', 'Frame', WOOD, 'oak-natural'), slot('seat', 'Seat', UPH, 'linen-sand')],
    specs: [{ label: 'Seat height', value: '46 cm' }, { label: 'Stackable', value: 'No' }, { label: 'Joinery', value: 'Pegged mortise & tenon' }],
    leadTime: '6–8 weeks',
  },
  {
    id: 'kett-counter-stool', name: 'Kett', model: 'counterStool', studioCategory: 'seating', category: 'dining', placement: 'floor', tucksUnder: true,
    dims: { w: 42, d: 42, h: 66 }, price: 520,
    tagline: 'Counter stool',
    description: 'A splayed four-leg stool at counter height, with a turned seat and a brushed footring that takes the scuffs.',
    slots: [slot('frame', 'Frame', WOOD, 'walnut'), slot('ring', 'Footring', METAL, 'brass')],
    specs: [{ label: 'Seat height', value: '66 cm' }, { label: 'For counters', value: '90–95 cm' }],
    leadTime: '4–6 weeks',
  },

  // ——— Tables
  {
    id: 'plinth-coffee-table', name: 'Plinth', model: 'coffeeTable', studioCategory: 'tables', category: 'coffee-tables', placement: 'floor', surfaceHeight: 0.34,
    dims: { w: 120, d: 70, h: 34 }, price: 2980, featured: true,
    tagline: 'Coffee table in solid stone',
    description: 'A thick, softened slab on two offset blocks. Plinth is cut from a single quarry block so top and bases share the same banding.',
    slots: [slot('top', 'Top', [...STONE, 'walnut', 'oak-natural'], 'travertine'), slot('base', 'Bases', [...STONE, 'walnut', 'oak-smoked'], 'travertine')],
    specs: [{ label: 'Weight', value: '96 kg' }, { label: 'Top thickness', value: '6 cm' }, { label: 'Edge', value: '8 mm softened radius' }],
    leadTime: '10–12 weeks',
  },
  {
    id: 'drum-side-table', name: 'Drum', model: 'sideTable', studioCategory: 'tables', category: 'coffee-tables', placement: 'floor', surfaceHeight: 0.5,
    dims: { w: 44, d: 44, h: 50 }, price: 980,
    tagline: 'Pedestal side table',
    description: 'A faceted column between two discs. Heavy at the base and slender in the middle, it sits as well beside a bed as beside a sofa.',
    slots: [slot('body', 'Material', [...STONE, ...WOOD], 'travertine-noce')],
    specs: [{ label: 'Weight', value: '22 kg (stone)' }, { label: 'Top', value: 'Ø 44 cm' }],
    leadTime: '6–8 weeks',
  },
  {
    id: 'ledger-dining-table', name: 'Ledger', model: 'diningTable', studioCategory: 'tables', category: 'dining', placement: 'floor', surfaceHeight: 0.75, allowsTuck: true,
    dims: { w: 220, d: 95, h: 75 }, price: 4650, featured: true,
    tagline: 'Dining table for six to eight',
    description: 'A long table on two slab legs set well in from the ends, so chairs fit everywhere and nobody straddles a leg. Solid top, breadboard-free.',
    slots: [slot('top', 'Top', [...WOOD, 'marble-calacatta', 'travertine'], 'oak-natural'), slot('legs', 'Legs', [...WOOD, 'travertine'], 'oak-natural')],
    specs: [{ label: 'Seats', value: '6–8' }, { label: 'Top thickness', value: '4 cm' }, { label: 'Knee clearance', value: '68 cm' }],
    leadTime: '8–10 weeks',
  },
  {
    id: 'arc-console', name: 'Arc', model: 'console', studioCategory: 'tables', category: 'storage', placement: 'floor', surfaceHeight: 0.8,
    dims: { w: 140, d: 36, h: 80 }, price: 2240,
    tagline: 'Console with arched opening',
    description: 'A single bridge of timber or stone with a semicircular opening, for entrances and long walls. Shallow enough for a hallway, generous enough for lamps and books.',
    slots: [slot('body', 'Material', [...WOOD, 'travertine', 'lacquer-chalk', 'lacquer-olive'], 'oak-white')],
    specs: [{ label: 'Depth', value: '36 cm' }, { label: 'Load', value: '40 kg evenly spread' }],
    leadTime: '8–10 weeks',
  },
  {
    id: 'field-desk', name: 'Field', model: 'desk', studioCategory: 'tables', category: 'storage', placement: 'floor', surfaceHeight: 0.75, allowsTuck: true,
    dims: { w: 140, d: 70, h: 75 }, price: 1880,
    tagline: 'Writing desk',
    description: 'A thin top on splayed steel legs with a shallow drawer for the day’s essentials. Made to sit in a room, not hide in an office.',
    slots: [slot('top', 'Top', WOOD, 'walnut'), slot('legs', 'Legs', METAL, 'metal-black')],
    specs: [{ label: 'Drawer', value: '60 × 40 × 5 cm' }, { label: 'Cable port', value: 'Rear, concealed' }],
    leadTime: '6–8 weeks',
  },

  // ——— Lighting
  {
    id: 'stem-floor-lamp', name: 'Stem', model: 'floorLamp', studioCategory: 'lighting', category: 'lighting', placement: 'floor', emitsLight: true,
    dims: { w: 40, d: 40, h: 162 }, price: 890, featured: true,
    tagline: 'Floor lamp with linen shade',
    description: 'A slender stem on a weighted disc, finished with a pleated-free linen drum. Gives a low, warm pool of light for reading.',
    slots: [slot('metal', 'Stem & base', METAL, 'brass'), slot('shade', 'Shade', ['linen-natural', 'linen-sand', 'linen-olive'], 'linen-natural')],
    specs: [{ label: 'Lamp', value: 'E27, 2700 K LED' }, { label: 'Dimmer', value: 'Foot dimmer' }, { label: 'Cable', value: '2.5 m braided' }],
    leadTime: '3–4 weeks',
  },
  {
    id: 'dome-table-lamp', name: 'Dome', model: 'tableLamp', studioCategory: 'lighting', category: 'lighting', placement: 'surface', emitsLight: true,
    dims: { w: 30, d: 30, h: 42 }, price: 460,
    tagline: 'Table lamp',
    description: 'A mushroom lamp with a shallow dome shade. Low glare, generous spread — enough to read by, quiet enough to leave on.',
    slots: [slot('body', 'Body', [...CERAMIC, 'brass', 'travertine'], 'ceramic-chalk')],
    specs: [{ label: 'Lamp', value: 'G9, 2700 K LED' }, { label: 'Switch', value: 'Touch dimmer' }],
    leadTime: '3–4 weeks',
  },
  {
    id: 'halo-pendant', name: 'Halo', model: 'pendant', studioCategory: 'lighting', category: 'lighting', placement: 'ceiling', emitsLight: true, mount: 0.95,
    dims: { w: 46, d: 46, h: 30 }, price: 740,
    tagline: 'Pendant with opal diffuser',
    description: 'A spun metal dome over an opal glass diffuser. Hang it low over a table so the light stays on the surface, not in your eyes.',
    slots: [slot('metal', 'Shade', [...METAL, 'lacquer-chalk', 'lacquer-olive'], 'bronze')],
    specs: [{ label: 'Lamp', value: 'E27, 2700 K LED' }, { label: 'Drop', value: 'Adjustable to 2 m' }],
    leadTime: '3–4 weeks',
  },

  // ——— Decor
  {
    id: 'olea-floor-plant', name: 'Olea', model: 'plant', studioCategory: 'decor', category: 'accessories', placement: 'floor',
    dims: { w: 70, d: 70, h: 170 }, price: 390,
    tagline: 'Olive tree in stoneware pot',
    description: 'A multi-stem olive in a heavy stoneware planter. Wants the brightest corner you have and very little else.',
    slots: [slot('pot', 'Planter', CERAMIC, 'terracotta')],
    specs: [{ label: 'Light', value: 'Bright, direct' }, { label: 'Water', value: 'Every 10–14 days' }],
    leadTime: '1–2 weeks',
  },
  {
    id: 'urn-vase', name: 'Urn', model: 'vase', studioCategory: 'decor', category: 'accessories', placement: 'surface',
    dims: { w: 26, d: 26, h: 44 }, price: 210,
    tagline: 'Thrown stoneware vessel',
    description: 'A wide-shouldered vessel thrown by hand, with a dry branch or two. Each one is slightly different.',
    slots: [slot('body', 'Glaze', CERAMIC, 'ceramic-ash')],
    specs: [{ label: 'Watertight', value: 'Yes, glazed interior' }],
    leadTime: '2–3 weeks',
  },
  {
    id: 'folio-books', name: 'Folio', model: 'books', studioCategory: 'decor', category: 'accessories', placement: 'surface',
    dims: { w: 32, d: 25, h: 14 }, price: 180,
    tagline: 'Stack of art & architecture books',
    description: 'A curated stack of monographs on architecture, craft and photography. Changes with each season’s reading list.',
    slots: [],
    specs: [{ label: 'Titles', value: '4, curated' }],
    leadTime: '1 week',
  },
  {
    id: 'weft-rug', name: 'Weft', model: 'rug', studioCategory: 'decor', category: 'accessories', placement: 'rug',
    dims: { w: 240, d: 170, h: 1.5 }, price: 2150, featured: true,
    tagline: 'Hand-knotted rug',
    description: 'A dense, low-pile rug with a tone-on-tone border. Knotted by hand, so it will outlast most of what stands on it.',
    slots: [slot('rug', 'Yarn', ['rug-ivory', 'rug-stone', 'rug-jute'], 'rug-ivory')],
    specs: [{ label: 'Pile', value: '9 mm' }, { label: 'Knots', value: '100 per inch²' }],
    leadTime: '12–14 weeks',
  },
  {
    id: 'tonal-artwork', name: 'Tonal I', model: 'artwork', studioCategory: 'decor', category: 'accessories', placement: 'wall', mount: 1.55,
    dims: { w: 76, d: 4, h: 100 }, price: 640,
    tagline: 'Framed print on cotton paper',
    description: 'A limited print of earth pigments on heavy cotton paper, in a slim solid-timber frame. Edition of 150.',
    slots: [slot('frame', 'Frame', [...WOOD, 'metal-black'], 'oak-natural')],
    specs: [{ label: 'Edition', value: '150, signed' }, { label: 'Glazing', value: 'Anti-reflective' }],
    leadTime: '2–3 weeks',
  },

  // ——— Bedroom
  {
    id: 'still-bed', name: 'Still', model: 'bed', studioCategory: 'bedroom', category: 'beds', placement: 'floor', surfaceHeight: 0.42,
    dims: { w: 186, d: 216, h: 96 }, price: 4280, featured: true,
    tagline: 'Bed with upholstered headboard',
    description: 'A low timber platform with a tall, softly padded headboard. Built for a 180 × 200 mattress, with linen dressed the way we like it.',
    slots: [slot('frame', 'Frame', WOOD, 'oak-natural'), slot('headboard', 'Headboard', UPH, 'linen-sand'), slot('bedding', 'Bedding', ['linen-natural', 'linen-sand', 'linen-olive', 'boucle-ivory'], 'linen-natural')],
    specs: [{ label: 'Mattress', value: '180 × 200 cm' }, { label: 'Platform height', value: '28 cm' }, { label: 'Slats', value: 'Sprung beech' }],
    leadTime: '8–10 weeks',
  },
  {
    id: 'nook-nightstand', name: 'Nook', model: 'nightstand', studioCategory: 'bedroom', category: 'beds', placement: 'floor', surfaceHeight: 0.5,
    dims: { w: 50, d: 40, h: 50 }, price: 860,
    tagline: 'Nightstand with drawer',
    description: 'A soft-edged box with one drawer and an open shelf for the books you will finish one day.',
    slots: [slot('body', 'Material', [...WOOD, 'lacquer-chalk', 'lacquer-olive'], 'oak-natural')],
    specs: [{ label: 'Drawer', value: 'Push-to-open' }],
    leadTime: '6–8 weeks',
  },
  {
    id: 'column-wardrobe', name: 'Column', model: 'wardrobe', studioCategory: 'bedroom', category: 'storage', placement: 'floor',
    dims: { w: 120, d: 60, h: 220 }, price: 3640,
    tagline: 'Two-door wardrobe',
    description: 'A tall, calm volume with flush doors and slim edge pulls. Fitted inside with a rail, two shelves and a shallow drawer.',
    slots: [slot('body', 'Finish', [...WOOD, 'lacquer-chalk', 'lacquer-olive', 'lacquer-ink'], 'oak-white'), slot('pulls', 'Pulls', METAL, 'brass')],
    specs: [{ label: 'Interior', value: 'Rail, 2 shelves, drawer' }, { label: 'Hinges', value: 'Soft-close' }],
    leadTime: '10–12 weeks',
  },

  // ——— Storage
  {
    id: 'grid-shelving', name: 'Grid', model: 'shelving', studioCategory: 'storage', category: 'storage', placement: 'floor',
    dims: { w: 160, d: 36, h: 190 }, price: 2480,
    tagline: 'Open shelving',
    description: 'Open shelves on a fine timber grid, shown here with a few things worth keeping. Wall-fixed for safety.',
    slots: [slot('body', 'Timber', WOOD, 'oak-natural')],
    specs: [{ label: 'Shelves', value: '5 fixed' }, { label: 'Load', value: '25 kg per shelf' }],
    leadTime: '8–10 weeks',
  },
  {
    id: 'hearth-island', name: 'Hearth', model: 'island', studioCategory: 'storage', category: 'dining', placement: 'floor', surfaceHeight: 0.92, allowsTuck: true,
    dims: { w: 240, d: 100, h: 92 }, price: 9800,
    tagline: 'Kitchen island with stone top',
    description: 'A freestanding island with a thick stone top that overhangs for stools. Drawers on the working side, open knee space on the other.',
    slots: [slot('body', 'Cabinet', [...WOOD, 'lacquer-chalk', 'lacquer-olive', 'lacquer-ink'], 'oak-smoked'), slot('top', 'Worktop', [...STONE, 'concrete'], 'marble-calacatta')],
    specs: [{ label: 'Worktop', value: '4 cm, honed' }, { label: 'Overhang', value: '30 cm' }],
    leadTime: '12–14 weeks',
  },
  {
    id: 'galley-kitchen', name: 'Galley', model: 'kitchenRun', studioCategory: 'storage', category: 'storage', placement: 'floor', surfaceHeight: 0.92,
    dims: { w: 300, d: 65, h: 220 }, price: 14600,
    tagline: 'Kitchen run with open shelf',
    description: 'A three-metre run of base cabinets with a stone worktop and splashback, finished with a single open shelf in place of wall cupboards.',
    slots: [slot('body', 'Cabinet', [...WOOD, 'lacquer-chalk', 'lacquer-olive', 'lacquer-ink'], 'lacquer-chalk'), slot('top', 'Worktop', [...STONE, 'concrete'], 'travertine')],
    specs: [{ label: 'Appliances', value: 'Integrated, not included' }, { label: 'Sink', value: 'Undermount steel' }],
    leadTime: '12–14 weeks',
  },

  // ——— Electronics
  {
    id: 'frame-tv-65', name: 'Frame 65', model: 'tv', studioCategory: 'electronics', category: 'electronics', placement: 'surface',
    dims: { w: 146, d: 30, h: 90 }, price: 2190, featured: true,
    tagline: '65″ television on slim feet',
    description: 'A 65-inch 4K panel with a thin metal frame, chosen because it disappears when it is off. Stands on two low feet, or sits on a console.',
    slots: [slot('frame', 'Frame', ['metal-black', 'steel', 'bronze'], 'metal-black')],
    specs: [{ label: 'Screen', value: '65″ 4K OLED' }, { label: 'Panel depth', value: '2.5 cm' }, { label: 'Inputs', value: 'HDMI 2.1 × 4, eARC' }],
    leadTime: '1–2 weeks',
  },
  {
    id: 'flush-wall-tv-75', name: 'Flush 75', model: 'wallTv', studioCategory: 'electronics', category: 'electronics', placement: 'wall', mount: 1.35,
    dims: { w: 167, d: 4, h: 96 }, price: 3290,
    tagline: '75″ wall-mounted television',
    description: 'A 75-inch panel on a zero-gap bracket, so it hangs like a picture. Set the height in the studio — we suggest the centre at eye level when seated.',
    slots: [slot('frame', 'Frame', ['metal-black', 'steel', 'bronze'], 'metal-black')],
    specs: [{ label: 'Screen', value: '75″ 4K OLED' }, { label: 'Wall gap', value: '4 mm' }, { label: 'Bracket', value: 'Included, concealed' }],
    leadTime: '2–3 weeks',
  },
  {
    id: 'low-media-console', name: 'Lowline', model: 'mediaConsole', studioCategory: 'electronics', category: 'electronics', placement: 'floor', surfaceHeight: 0.46,
    dims: { w: 200, d: 45, h: 46 }, price: 2640,
    tagline: 'Low media console',
    description: 'A long, low cabinet for a television and everything that goes with it. Ventilated doors hide the boxes; a rear channel hides the cables.',
    slots: [slot('body', 'Finish', [...WOOD, 'lacquer-chalk', 'lacquer-olive', 'lacquer-ink'], 'walnut')],
    specs: [{ label: 'Load', value: '60 kg on top' }, { label: 'Cable management', value: 'Rear channel, two ports' }, { label: 'Doors', value: 'Push-to-open, ventilated' }],
    leadTime: '8–10 weeks',
  },
  {
    id: 'tower-speaker', name: 'Tower', model: 'speaker', studioCategory: 'electronics', category: 'electronics', placement: 'floor',
    dims: { w: 22, d: 30, h: 104 }, price: 1480,
    tagline: 'Floor-standing speaker',
    description: 'A slim three-way speaker in a solid timber cabinet with a wrapped fabric grille. Sold singly — place two for stereo.',
    slots: [slot('cabinet', 'Cabinet', [...WOOD, 'lacquer-chalk', 'lacquer-ink'], 'walnut'), slot('grille', 'Grille', ['wool-charcoal', 'linen-natural', 'linen-sand', 'boucle-oat'], 'wool-charcoal')],
    specs: [{ label: 'Drivers', value: '3-way, 2 × 6.5″ woofers' }, { label: 'Response', value: '38 Hz – 28 kHz' }, { label: 'Connection', value: 'Wireless or wired' }],
    leadTime: '2–3 weeks',
  },
  {
    id: 'soundbar', name: 'Strand', model: 'soundbar', studioCategory: 'electronics', category: 'electronics', placement: 'surface',
    dims: { w: 100, d: 11, h: 7 }, price: 690,
    tagline: 'Soundbar in woven fabric',
    description: 'A low soundbar wrapped in the same wool as our upholstery, so it reads as an object rather than equipment.',
    slots: [slot('grille', 'Fabric', ['wool-charcoal', 'linen-natural', 'linen-sand', 'boucle-oat'], 'wool-charcoal')],
    specs: [{ label: 'Channels', value: '5.0, Dolby Atmos' }, { label: 'Connection', value: 'HDMI eARC, wireless' }],
    leadTime: '1–2 weeks',
  },
  {
    id: 'turntable', name: 'Platter', model: 'turntable', studioCategory: 'electronics', category: 'electronics', placement: 'surface',
    dims: { w: 45, d: 36, h: 14 }, price: 980,
    tagline: 'Belt-drive turntable',
    description: 'A belt-drive record player on a solid timber plinth, with a brushed platter and a built-in phono stage.',
    slots: [slot('plinth', 'Plinth', WOOD, 'oak-natural'), slot('platter', 'Platter', METAL, 'steel')],
    specs: [{ label: 'Speeds', value: '33⅓ / 45 rpm' }, { label: 'Phono stage', value: 'Built-in, switchable' }],
    leadTime: '1–2 weeks',
  },
];

export const productById = Object.fromEntries(products.map((p) => [p.id, p])) as Record<string, Product>;
export const getProduct = (id: string): Product | undefined => productById[id];

export const studioCategories: { id: StudioCategory; label: string }[] = [
  { id: 'seating', label: 'Seating' },
  { id: 'tables', label: 'Tables' },
  { id: 'lighting', label: 'Lighting' },
  { id: 'decor', label: 'Decor' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'storage', label: 'Storage' },
  { id: 'electronics', label: 'Electronics' },
];

export const collectionCategories: { id: CollectionCategory; label: string }[] = [
  { id: 'sofas', label: 'Sofas' },
  { id: 'lounge-chairs', label: 'Lounge chairs' },
  { id: 'dining', label: 'Dining' },
  { id: 'coffee-tables', label: 'Coffee & side tables' },
  { id: 'beds', label: 'Beds' },
  { id: 'lighting', label: 'Lighting' },
  { id: 'storage', label: 'Storage' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'accessories', label: 'Accessories' },
];

export function defaultMaterials(p: Product): Record<string, string> {
  return Object.fromEntries(p.slots.map((s) => [s.key, s.default]));
}

/** Price including material premiums (each finish can add or subtract a percentage). */
export function priceFor(p: Product, mats: Record<string, string>): number {
  let pct = 0;
  for (const s of p.slots) {
    const chosen = getMaterialDef(mats[s.key] ?? s.default);
    const base = getMaterialDef(s.default);
    pct += ((chosen.premium ?? 0) - (base.premium ?? 0)) / Math.max(1, p.slots.length);
  }
  return Math.round((p.price * (1 + pct / 100)) / 10) * 10;
}

export const formatPrice = (n: number) =>
  new Intl.NumberFormat(intlLocale(), { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export const formatDims = (d: Product['dims']) => `${d.w} × ${d.d} × ${d.h} ${t('cm')}`;
