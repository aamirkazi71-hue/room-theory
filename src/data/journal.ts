import type { PhotoKey } from './assets';
import { intlLocale } from '@/i18n';

export type JournalCategory = 'Architecture' | 'Interiors' | 'Materials' | 'Furniture' | 'Design philosophy' | 'Spatial storytelling';
export const journalCategories: JournalCategory[] = ['Architecture', 'Interiors', 'Materials', 'Furniture', 'Design philosophy', 'Spatial storytelling'];

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'image'; photo: PhotoKey; caption: string; wide?: boolean }
  | { type: 'list'; items: string[] };

export interface Article {
  slug: string;
  title: string;
  /** Title with an italic phrase marked by *asterisks* */
  display: string;
  standfirst: string;
  category: JournalCategory;
  date: string;
  readingTime: number;
  cover: PhotoKey;
  author: string;
  body: Block[];
}

export const articles: Article[] = [
  {
    slug: 'the-art-of-warm-minimalism',
    title: 'The art of warm minimalism',
    display: 'The art of *warm* minimalism',
    standfirst: 'Fewer things, chosen for how they feel in the hand as much as how they look. On rooms that are spare without being cold.',
    category: 'Interiors', date: '2026-10-14', readingTime: 6, cover: 'warmMinimal', author: 'Inès Varga',
    body: [
      { type: 'p', text: 'Minimalism got its cold reputation from photographs. A white room with a single chair looks severe in print because a photograph cannot carry warmth: the give of a linen cushion, the temperature of oak under a bare foot, the way limewash takes on the colour of the hour. In person, the best minimal rooms are among the most comfortable we know.' },
      { type: 'p', text: 'Warm minimalism keeps the discipline — few objects, clear surfaces, generous space between things — but changes what those few things are made of. Painted MDF gives way to solid timber. Synthetic weaves give way to linen, wool and bouclé. Lacquer becomes oil. The palette narrows to the colours of the materials themselves.' },
      { type: 'h', text: 'Texture does the work colour used to do' },
      { type: 'p', text: 'In a room with little colour, texture becomes the main event. A bouclé chair beside a smooth plaster wall reads almost as contrast; a travertine table holds the eye because of its pores and banding. We often specify three or four textures per room and let them carry the composition.' },
      { type: 'quote', text: 'A spare room asks more of each object in it. Everything left has to be good to touch.' },
      { type: 'image', photo: 'plasterClock', caption: 'Limewash takes on the colour of the hour — cooler at noon, almost pink at dusk.' },
      { type: 'h', text: 'Three rules we keep coming back to' },
      { type: 'list', items: ['Choose one dominant timber and let everything else defer to it.', 'Keep large surfaces matt; save sheen for small things — a brass pull, a glazed vase.', 'Leave one wall empty. It is not unfinished; it is where the light goes.'] },
      { type: 'p', text: 'None of this needs a large budget, but it does need patience. Warm minimal rooms are assembled slowly, one considered piece at a time, and they tend to get better as they age.' },
    ],
  },
  {
    slug: 'contemporary-organic-interiors',
    title: 'Contemporary organic interiors',
    display: 'Contemporary *organic* interiors',
    standfirst: 'Rounded forms, natural fibres and imperfect surfaces are back — this time with a sharper sense of proportion.',
    category: 'Interiors', date: '2026-09-28', readingTime: 5, cover: 'organicLiving', author: 'Tom Achterberg',
    body: [
      { type: 'p', text: 'The organic interior has returned in a different key. Where the seventies version was all shag and spider plants, the contemporary one is restrained: a curved sofa in bouclé, a round mirror, a jute rug, a single olive tree. The forms are soft; the composition is not.' },
      { type: 'p', text: 'What makes it contemporary is proportion. Curves are used against straight architecture rather than instead of it. A tub chair sits beside a rectilinear window; a round table sits on a rectangular rug. The tension between the two is what keeps the room from feeling like a theme.' },
      { type: 'h', text: 'Natural, not rustic' },
      { type: 'p', text: 'Natural materials do not have to look rough. Honed travertine, oiled oak and stonewashed linen are all natural and all refined. The trick is finishing: leave the material legible, but finish it well.' },
      { type: 'image', photo: 'linenDetail', caption: 'Stonewashed linen and simple stripes — soft and natural, but never rustic.' },
      { type: 'p', text: 'Plants, finally, are furniture here. One large specimen in the right corner does more than ten small pots on a sill, and it changes the room as it grows.' },
    ],
  },
  {
    slug: 'the-language-of-natural-materials',
    title: 'The language of natural materials',
    display: 'The language of *natural* materials',
    standfirst: 'Oak, travertine, linen and brass each age in their own way. Designing with them means designing for the next twenty years.',
    category: 'Materials', date: '2026-09-09', readingTime: 7, cover: 'naturalMaterials', author: 'Inès Varga',
    body: [
      { type: 'p', text: 'Every material speaks, and most of what it says is about time. Oak darkens. Brass dulls and then glows. Linen softens with each wash. Travertine collects the faint marks of use until it looks like it has always been there. Synthetic surfaces stay the same until they fail; natural ones change and keep going.' },
      { type: 'h', text: 'Oak' },
      { type: 'p', text: 'Quarter-sawn oak has a straight, quiet grain and moves very little. Oiled rather than lacquered, it can be repaired with a cloth and a little more oil. Over a decade it shifts from pale straw to honey.' },
      { type: 'h', text: 'Travertine' },
      { type: 'p', text: 'Formed in mineral springs, travertine carries its history in horizontal bands and open pores. We specify it unfilled and honed, then seal it with a penetrating sealer that leaves the surface dry to the touch.' },
      { type: 'quote', text: 'Choose materials that look better with use. It is the simplest form of sustainability there is.' },
      { type: 'h', text: 'Linen and brass' },
      { type: 'p', text: 'Linen is breathable and strong, and it wrinkles honestly. Unlacquered brass oxidises to a soft bronze where it is not handled and stays bright where it is — a map of how a piece is used.' },
      { type: 'p', text: 'In the studio, every swatch is rendered from the same material definitions we use for production samples, so the oak you choose on screen is the oak we would order.' },
    ],
  },
  {
    slug: 'spaces-shaped-by-light',
    title: 'Spaces shaped by light',
    display: 'Spaces shaped *by light*',
    standfirst: 'A room is only half designed until you know where the sun will be at four in the afternoon.',
    category: 'Spatial storytelling', date: '2026-08-21', readingTime: 6, cover: 'shapedByLight', author: 'Marta Leal',
    body: [
      { type: 'p', text: 'Light is the one material you cannot order. It arrives from a fixed direction, changes colour through the day and disappears for half the year at the hours you most want it. Good rooms are planned around it.' },
      { type: 'p', text: 'Start with orientation. North light is even and cool — good for working and for art. East light is bright and brief, made for bedrooms and breakfast. West light is long and warm, and turns gold before it goes. South light is generous and needs managing.' },
      { type: 'h', text: 'Layering after dark' },
      { type: 'p', text: 'Evenings need three layers: a low ambient wash, task light where hands are busy, and a few points of warmth at eye level or below. Overhead light alone flattens a room; lamps give it depth.' },
      { type: 'quote', text: 'Put light where you want people to look, and shadow where you want them to rest.' },
      { type: 'p', text: 'The studio lets you move through daylight, afternoon, sunset, evening and night for exactly this reason. Furnish a room at noon and it may fail at nine. Check both.' },
    ],
  },
  {
    slug: 'a-house-in-timber-and-concrete',
    title: 'A house in timber and concrete',
    display: 'A house in *timber* and concrete',
    standfirst: 'How a heavy base and a light upper storey set the rules for every room inside.',
    category: 'Architecture', date: '2026-08-02', readingTime: 8, cover: 'archTimber', author: 'Tom Achterberg',
    body: [
      { type: 'p', text: 'Some houses explain themselves from the street. This one sits a timber-clad volume on a concrete plinth, and the logic carries all the way through: heavy, cool and grounded below; warm, light and lifted above.' },
      { type: 'p', text: 'Downstairs, living spaces share the concrete — floors poured continuous with the walls, a stair cast in place. Furniture here is low and solid: stone tables, deep sofas, rugs to soften the acoustic.' },
      { type: 'image', photo: 'archStair', caption: 'The cast stair, left unclad, becomes the main sculptural element of the ground floor.', wide: true },
      { type: 'p', text: 'Upstairs the bedrooms are lined in oak. Ceilings drop, windows narrow, and the furniture becomes lighter — timber frames, linen, a single chair by each window.' },
      { type: 'quote', text: 'The architecture decides the furniture long before anyone chooses a sofa.' },
      { type: 'p', text: 'It is a useful lesson for any interior: read the building first. A concrete room asks for weight; a timber room asks for restraint.' },
    ],
  },
  {
    slug: 'on-glass-and-thresholds',
    title: 'On glass and thresholds',
    display: 'On glass and *thresholds*',
    standfirst: 'Full-height glazing blurs inside and out. Furnishing such rooms means deciding where the room ends.',
    category: 'Architecture', date: '2026-07-15', readingTime: 5, cover: 'archGlass', author: 'Marta Leal',
    body: [
      { type: 'p', text: 'When a wall becomes glass, the room borrows the landscape — and loses an edge. Without care, furniture drifts and the space feels like a corridor between two views.' },
      { type: 'p', text: 'The answer is usually a rug or a change of floor that draws the room back in, and seating that faces across the room rather than at the glass. Let the view be something you turn towards, not something you sit with your back to.' },
      { type: 'h', text: 'Practical notes' },
      { type: 'list', items: ['Keep tall pieces on solid walls so the glazing reads as one plane.', 'Choose materials that look good backlit — linen, timber, stone.', 'Plan evening light so the glass does not become a black mirror.'] },
    ],
  },
  {
    slug: 'why-we-design-furniture-for-rooms',
    title: 'Why we design furniture for rooms',
    display: 'Why we design furniture *for rooms*',
    standfirst: 'A chair is never seen alone. Our pieces are drawn in plan before they are drawn in elevation.',
    category: 'Design philosophy', date: '2026-06-30', readingTime: 4, cover: 'catAccent', author: 'Studio Room Theory',
    body: [
      { type: 'p', text: 'Most furniture is designed to be photographed on a white floor. Ours is designed to be placed: against a wall, in front of a window, three feet from a sofa. That changes the decisions.' },
      { type: 'p', text: 'Backs are finished because chairs end up in the middle of rooms. Sofas are low because windows start at forty-five centimetres. Tables have legs set in from the ends because people sit at the ends.' },
      { type: 'quote', text: 'We draw every piece in plan first. If it does not work as a footprint, it will not work as an object.' },
      { type: 'p', text: 'It is also why we built the studio. Seeing a piece in your own room, at your own dimensions and in your own light, is the only honest way to choose it.' },
    ],
  },
  {
    slug: 'the-workshop-in-porto',
    title: 'The workshop in Porto',
    display: 'The workshop *in Porto*',
    standfirst: 'A visit to the makers who brush our brass by hand and turn our stools on a lathe older than most of the staff.',
    category: 'Furniture', date: '2026-06-11', readingTime: 7, cover: 'catSeating', author: 'Inès Varga',
    body: [
      { type: 'p', text: 'The workshop is down a narrow street a short walk from the river, and you hear it before you see it — the steady sound of a belt sander, then a radio, then someone laughing over the top of both.' },
      { type: 'p', text: 'Fourteen people work here, most of them for more than a decade. They make our metal frames, brush our brass and turn the legs for the Kett stool. Every piece is signed on the underside by the person who finished it.' },
      { type: 'h', text: 'Brushed in one direction' },
      { type: 'p', text: 'Brushing is done by hand with a fine abrasive pad, always in one direction along the length of a part, so light runs along a frame instead of pooling on it. It takes longer than a machine finish. It also looks completely different.' },
      { type: 'quote', text: 'You can see a machine finish from across the room. You only notice a hand finish when you are close enough to touch it.' },
      { type: 'p', text: 'We visit twice a year, and every time we leave with ideas we did not arrive with.' },
    ],
  },
];

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);

export const formatDate = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString(intlLocale(), { day: 'numeric', month: 'long', year: 'numeric' });
