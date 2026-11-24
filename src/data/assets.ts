/**
 * Centralised photography registry.
 *
 * Every photograph on the site is referenced by key from here — never by URL
 * inside a component — so temporary imagery can be swapped for commissioned
 * production photography in one place.
 *
 * Current source: Unsplash (Unsplash License — free for commercial use, no
 * permission required). Replace `src` with a local import or CDN path when
 * final assets are available; keep `alt` descriptive.
 */

export interface PhotoAsset {
  /** Unsplash photo id or absolute URL */
  src: string;
  alt: string;
  /** Focal point for object-position, e.g. '50% 40%' */
  focus?: string;
  /** Dominant tone used as a placeholder while loading */
  tone: string;
}

const P = (src: string, alt: string, tone: string, focus?: string): PhotoAsset => ({ src, alt, tone, focus });

export const photos = {
  // Home
  heroLiving: P('1600210492493-0946911123ea', 'Living room under a timber ceiling with tall glazing, a low terracotta sofa and warm afternoon light', '#b59a7c', '50% 55%'),
  finalDusk: P('1564078516393-cf04bd966897', 'Double-height living room at dusk with a full-height window and low seating', '#3c3a36', '50% 50%'),
  emptyRoom: P('1630699144867-37acec97df5a', 'An empty white room with a large window and pale oak floor', '#d9d6cf', '50% 50%'),

  // Featured spaces
  livingContemporary: P('1600607687939-ce8a6c25118c', 'Open living space with a walnut-panelled wall, pale sofa and sculptural side table', '#c9c2b8', '45% 50%'),
  bedroomMinimal: P('1617325247661-675ab4b64ae2', 'Minimal bedroom with crisp white linen and soft daylight', '#e1ddd4', '50% 60%'),
  diningSculptural: P('1544457070-4cd773b4d71e', 'Dining room with polished concrete floor, round table and slender chairs', '#b5b1aa', '50% 50%'),
  studioApartment: P('1502672260266-1c1ef2d93688', 'Studio apartment with a linen sofa, mid-century chair and tall plants', '#d2cbbf', '50% 50%'),

  // Additional spaces
  livingGallery: P('1600210492486-724fe5c67fb0', 'Bright living room with linen sofas, gallery wall and plants', '#ddd5ca', '50% 55%'),
  livingLoft: P('1597665863042-47e00964d899', 'Loft living area with white walls and a patterned rug', '#d6d2cb', '50% 55%'),
  livingView: P('1503174971373-b1f69850bded', 'Living room with leather lounge chairs facing a glazed view', '#c8c6c1', '50% 50%'),
  bedroomTimber: P('1512918728675-ed5a9ecdebfd', 'Bedroom with a timber headboard wall and pale bedding', '#d7d0c4', '50% 55%'),
  bedroomGlass: P('1578683010236-d716f9a3f461', 'Bedroom opening onto a terrace through full-height glass', '#b9b3aa', '50% 50%'),
  bedroomGreen: P('1617098474202-0d0d7f60c56b', 'Bedroom with a deep green wall, rust bedding and a woven pendant', '#55574a', '50% 55%'),
  bedroomLight: P('1609766857041-ed402ea8069a', 'Bedroom with a column and soft morning light', '#e3ded6', '50% 55%'),
  diningAiry: P('1519710164239-da123dc03ef4', 'Airy white dining corner with a round table and olive branches', '#e8e6e1', '50% 50%'),
  diningGreen: P('1617806118233-18e1de247200', 'Dining room with green chairs around a long table and rattan pendant', '#d6d2c8', '50% 55%'),
  kitchenWalnut: P('1622372738946-62e02505feb3', 'Kitchen with dark timber cabinetry, island and brass stools', '#7a6a5c', '50% 50%'),
  kitchenWindow: P('1617228069096-4638a7ffc906', 'Kitchen with a wide window over the counter and soft daylight', '#d8d6d0', '50% 50%'),
  kitchenWhite: P('1600585152220-90363fe7e115', 'White kitchen with island, timber stools and three pendants', '#e1dfda', '50% 50%'),
  officeGreen: P('1600494603989-9650cf6ddd3d', 'Home office with a sage green wall and timber desk', '#7c826e', '50% 50%'),
  officeWhite: P('1524758631624-e2822e304c36', 'Workspace with white chairs, task lamps and large windows', '#d9d9d6', '50% 50%'),
  studioNook: P('1616593969747-4797dc75033e', 'Window seat nook with cushions and hanging plants', '#d4cfc6', '50% 50%'),

  // Collections
  catSeating: P('1551298370-9d3d53740c72', 'Two moulded chairs against a dark plaster wall', '#4b4540', '50% 60%'),
  catTables: P('1611486212557-88be5ff6f941', 'Oak side table with books on the lower shelf', '#d8d4ce', '50% 55%'),
  catLighting: P('1507473885765-e6ed057f782c', 'Black articulated floor lamp against a white wall', '#e6e6e4', '60% 40%'),
  catStorage: P('1615875605825-5eb9bb5d52ac', 'Open shelving with ceramics and books beside a leather chair', '#cdbfb0', '50% 50%'),
  catBedroom: P('1595526114035-0d45ed16cfbf', 'Bedroom with white linen, a timber bench and a reading lamp', '#e1ddd4', '50% 60%'),
  catObjects: P('1597218868981-1b68e15f0065', 'Ochre plaster wall with ceramics and a lounge chair', '#b8925a', '50% 50%'),
  catAccent: P('1616627547584-bf28cee262db', 'Mustard accent chair against a pale wall', '#d6d3cc', '50% 50%'),

  // Materials (photographic)
  linenDetail: P('1616627561950-9f746e330187', 'Close view of linen and striped cushions on a bed', '#d8cfc4', '50% 50%'),
  rugDetail: P('1600166898405-da9535204843', 'A rolled wool rug with a faded pattern', '#8f8a82', '50% 50%'),

  // Journal
  warmMinimal: P('1618221195710-dd6b41faaea6', 'Warm minimal living room with leather stools and a long window', '#c8c0b2', '50% 55%'),
  organicLiving: P('1616046229478-9901c5536a45', 'Living room with round mirror, woven textures and plants', '#d4c6b4', '50% 50%'),
  naturalMaterials: P('1631679706909-1844bbd07221', 'Living room with rattan mirrors and natural textiles', '#e2dbd1', '50% 50%'),
  shapedByLight: P('1549497538-303791108f95', 'A single chair lit by a narrow beam in a dark room', '#2c2620', '50% 50%'),
  archGlass: P('1600573472550-8090b5e0745e', 'Glazed stair hall opening to a pool terrace', '#a8acaa', '50% 50%'),
  archTimber: P('1600566753190-17f0baa2a6c3', 'Timber-clad house with a concrete base', '#a29a8d', '50% 50%'),
  archNight: P('1600585153490-76fb20a32601', 'Dark brick house glowing at night', '#232627', '50% 55%'),
  archStair: P('1600607687920-4e2a09cf159d', 'Concrete stair beside a dining table and glazing', '#a8a49e', '50% 50%'),
  plasterClock: P('1533090161767-e6ffed986c88', 'Minimal clock on a pale plaster wall with a plant', '#dad8d4', '50% 50%'),
  maker: P('1558618666-fcd25c85cd64', 'A craftsperson at work in a workshop', '#5a5048', '50% 40%'),
  yellowChair: P('1586023492125-27b2c045efd7', 'Yellow lounge chair in a white room with a floor lamp', '#dedcd8', '40% 55%'),
} satisfies Record<string, PhotoAsset>;

export type PhotoKey = keyof typeof photos;

/** Build a responsive Unsplash URL for a given width. */
export function photoUrl(asset: PhotoAsset, width: number, quality = 72): string {
  if (asset.src.startsWith('http') || asset.src.startsWith('/')) return asset.src;
  return `https://images.unsplash.com/photo-${asset.src}?w=${width}&q=${quality}&auto=format&fit=crop`;
}

export function photoSrcSet(asset: PhotoAsset, widths = [480, 800, 1200, 1600, 2200]): string {
  return widths.map((w) => `${photoUrl(asset, w)} ${w}w`).join(', ');
}
