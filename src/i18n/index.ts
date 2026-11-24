/**
 * Translation layer. Keys are the English source strings themselves, so
 * `t('Start designing')` reads naturally and falls back to English when a
 * translation is missing. `{name}` placeholders are interpolated.
 *
 * Switching language re-mounts the app (see LocaleRoot in main.tsx), so the
 * plain `t()` function can be used anywhere — components, data mappers,
 * exporters — without hooks.
 */
import { create } from 'zustand';
// The Arabic dictionary is loaded on demand so English visitors never download it.
let ar: Record<string, string> = {};
let arPlurals: Record<string, PluralForms> = {};
export async function loadLocale(l: Locale) {
  if (l === 'ar' && Object.keys(ar).length === 0) {
    const mod = await import('./ar');
    ar = mod.ar;
    arPlurals = mod.arPlurals;
  }
}

/** Arabic has six plural categories; counted nouns change form (and case) with the number. */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
const arRules = new Intl.PluralRules('ar');

export type Locale = 'en' | 'ar';
const KEY = 'rt.locale.v1';

function readInitial(): Locale {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'ar' || q === 'en') {
      // A shared ?lang= link also becomes the visitor's preference.
      localStorage.setItem(KEY, q);
      return q;
    }
    const saved = localStorage.getItem(KEY);
    return saved === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
}

let current: Locale = readInitial();

function applyDocument(l: Locale) {
  const html = document.documentElement;
  html.lang = l;
  html.dir = l === 'ar' ? 'rtl' : 'ltr';
}
applyDocument(current);

export const useLocale = create<{ locale: Locale; setLocale: (l: Locale) => Promise<void> }>()((set) => ({
  locale: current,
  setLocale: async (l) => {
    await loadLocale(l);
    current = l;
    try { localStorage.setItem(KEY, l); } catch { /* preference is optional */ }
    // Keep a ?lang= in the address bar in step, so a reload doesn't switch back.
    const url = new URL(window.location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', l);
      window.history.replaceState(window.history.state, '', url);
    }
    applyDocument(l);
    set({ locale: l });
  },
}));

export const getLocale = () => current;
export const isRtl = () => current === 'ar';
/** Intl locale: Arabic text with Latin digits, which suits dimensions and prices. */
export const intlLocale = () => (current === 'ar' ? 'ar-u-nu-latn' : 'en-GB');

const missing = new Set<string>();
if (import.meta.env.DEV) (window as unknown as { __i18nMissing: Set<string> }).__i18nMissing = missing;

/** Plain measurements ("40 cm", "8–10 weeks") translate by unit rather than by dictionary entry. */
const MEASURE = /^[Ø\d][\d\s.,×–\-⅓/Ø]*\s?(cm|mm|kg|m|weeks?|days?)\b(.*)$/;
const units: Record<string, string> = { cm: 'سم', mm: 'مم', kg: 'كغ', m: 'م' };

/** Weeks and days agree with the last number: 1–2 أسبوع · 3–10 أسابيع · 11+ أسبوعًا. */
function countedUnit(unit: string, n: number) {
  const week = unit.startsWith('week');
  if (n <= 2) return week ? 'أسبوع' : 'يوم';
  if (n <= 10) return week ? 'أسابيع' : 'أيام';
  return week ? 'أسبوعًا' : 'يومًا';
}

function measure(source: string): string | null {
  const m = source.match(MEASURE);
  if (!m) return null;
  const numberPart = source.slice(0, source.length - m[0].length + m[0].indexOf(m[1])).trimEnd();
  const nums = numberPart.match(/\d+(?:\.\d+)?/g);
  const last = nums ? parseFloat(nums[nums.length - 1]) : 0;
  const unit = units[m[1]] ?? countedUnit(m[1], last);
  const raw = m[2].trim();
  const rest = raw.replace(/^\(|\)$/g, '');
  const tail = rest ? (raw.startsWith('(') ? ` (${ar[rest] ?? rest})` : ` ${ar[rest] ?? rest}`) : '';
  return `${numberPart} ${unit}${tail}`;
}

export function t(source: string, vars?: Record<string, string | number>): string {
  let out = source;
  if (current === 'ar') {
    const forms = arPlurals[source];
    const n = vars && typeof vars.n === 'number' ? vars.n : null;
    const hit = forms && n !== null ? forms[arRules.select(n)] ?? forms.other : ar[source] ?? measure(source);
    if (hit != null) out = hit;
    else if (import.meta.env.DEV) missing.add(source);
  }
  if (vars) out = out.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
  return out;
}

/** Look up a translation without recording it as missing (for optional strings such as alt text). */
export const tOptional = (source: string) => (current === 'ar' ? ar[source] ?? measure(source) ?? source : source);

