/** Arabic translations, keyed by the English source string. */
import { arUi } from './ar-ui';
import { arCatalogue } from './ar-catalogue';
import { arSpaces } from './ar-spaces';
import { arJournal } from './ar-journal';
import { arAlt } from './ar-alt';
export { arPlurals } from './ar-plurals';

export const ar: Record<string, string> = { ...arCatalogue, ...arSpaces, ...arJournal, ...arAlt, ...arUi };
