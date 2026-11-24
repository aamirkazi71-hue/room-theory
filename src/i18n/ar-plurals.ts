import type { PluralForms } from './index';

/**
 * Arabic plural forms for strings with a {n} count, chosen by Intl.PluralRules('ar'):
 * zero · one · two · few (3–10) · many (11–99) · other (100+, decimals).
 */
export const arPlurals: Record<string, PluralForms> = {
  '{n} pieces': {
    zero: 'لا قطع', one: 'قطعة واحدة', two: 'قطعتان', few: '{n} قطع', many: '{n} قطعة', other: '{n} قطعة',
  },
  '{n} pieces · {price} as shown': {
    zero: 'لا قطع', one: 'قطعة واحدة · {price} كما هو معروض', two: 'قطعتان · {price} كما هو معروض',
    few: '{n} قطع · {price} كما هو معروض', many: '{n} قطعة · {price} كما هو معروض', other: '{n} قطعة · {price} كما هو معروض',
  },
  '{n} min read': {
    one: 'قراءة في دقيقة', two: 'قراءة في دقيقتين', few: 'قراءة في {n} دقائق', many: 'قراءة في {n} دقيقة', other: 'قراءة في {n} دقيقة',
  },
  '{n} rooms planned by the studio. Each has real dimensions, a full furniture plan and finishes you can change — open any of them in the studio.': {
    one: 'غرفة واحدة خطّطها الاستوديو، بأبعاد حقيقية ومخطط أثاث كامل وتشطيبات قابلة للتغيير — افتحها في الاستوديو.',
    two: 'غرفتان خطّطهما الاستوديو، لكل منهما أبعاد حقيقية ومخطط أثاث كامل وتشطيبات قابلة للتغيير — افتح أيًّا منهما في الاستوديو.',
    few: '{n} غرف خطّطها الاستوديو. لكل منها أبعاد حقيقية ومخطط أثاث كامل وتشطيبات قابلة للتغيير — افتح أيًّا منها في الاستوديو.',
    many: '{n} غرفة خطّطها الاستوديو. لكل منها أبعاد حقيقية ومخطط أثاث كامل وتشطيبات قابلة للتغيير — افتح أيًّا منها في الاستوديو.',
    other: '{n} غرفة خطّطها الاستوديو. لكل منها أبعاد حقيقية ومخطط أثاث كامل وتشطيبات قابلة للتغيير — افتح أيًّا منها في الاستوديو.',
  },
  '{n} active': {
    one: 'عامل تصفية واحد', two: 'عاملا تصفية', few: '{n} عوامل تصفية', many: '{n} عامل تصفية', other: '{n} عامل تصفية',
  },
  '{n} finish': { one: 'تشطيب واحد', other: 'تشطيب واحد' },
  '{n} finishes': {
    one: 'تشطيب واحد', two: 'تشطيبان', few: '{n} تشطيبات', many: '{n} تشطيبًا', other: '{n} تشطيب',
  },
  '{n} lamp in the room.': { one: 'مصباح واحد في الغرفة.', other: 'مصباح واحد في الغرفة.' },
  '{n} lamps in the room.': {
    one: 'مصباح واحد في الغرفة.', two: 'مصباحان في الغرفة.', few: '{n} مصابيح في الغرفة.', many: '{n} مصباحًا في الغرفة.', other: '{n} مصباح في الغرفة.',
  },
};
