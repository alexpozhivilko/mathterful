// Свободный ввод состава блюда: «тыква 300 г», «2 яйца», «масло 1 ст.л.», «чеснок 2 зубчика»…
import { allProducts, product } from './store.js';

export const norm = s => String(s).toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9%\s]/g, ' ').replace(/\s+/g, ' ').trim();

// Синонимы и частые написания → продукт из справочника. Порядок важен: конкретное раньше общего.
const SYN = [
  [/томат[а-я]* в (собств|сок)|томат[а-я]* консерв|пелати|томаты? в банке/, 'cantom'],
  [/томатн[а-я]* паст/, 'tompaste'],
  [/арахисов/, 'pb'],
  [/сливочн[а-я]* масл/, 'butter'],
  [/(растит|подсолн)[а-я]* масл/, 'oil'],
  [/масл/, 'olive'],
  [/черн[а-я]* перец|перец черн|перец молот/, 'blackpep'],
  [/перец|перц/, 'bellpep'],
  [/помидор|томат|черри/, 'tomato'],
  [/огур/, 'cucumber'],
  [/(^| )лук/, 'onion'],
  [/чесн/, 'garlic'],
  [/морков/, 'carrot'],
  [/картоф|картош/, 'potato'],
  [/батат/, 'sweetpot'],
  [/кабач|цукин/, 'zucchini'],
  [/баклаж/, 'eggplant'],
  [/брокк/, 'broccoli'],
  [/цветн[а-я]* капуст/, 'cauli'],
  [/капуст/, 'cabbage'],
  [/шпинат/, 'spinach'],
  [/руккол|айсберг|(^| )салат/, 'lettuce'],
  [/гриб|шампин/, 'mushroom'],
  [/зелен|укроп|петруш|кинз|базилик|(^| )мят/, 'greens'],
  [/авокад/, 'avocado'],
  [/лимон/, 'lemon'],
  [/свекл/, 'beet'],
  [/тыкв/, 'pumpkin'],
  [/банан/, 'banana'],
  [/яблок/, 'apple'],
  [/апельс/, 'orange'],
  [/яйц|яиц|(^| )яйко/, 'eggs'],
  [/молок/, 'milk'],
  [/творог/, 'tvorog'],
  [/коттедж/, 'cottage'],
  [/йогурт/, 'yogurt'],
  [/кефир|лебен/, 'kefir'],
  [/моцарел/, 'mozz'],
  [/(^| )фет|брынз/, 'feta'],
  [/лабан/, 'labane'],
  [/сметан/, 'smetana'],
  [/тофу/, 'tofu'],
  [/сыр/, 'cheese'],
  [/лосос|семг/, 'salmon'],
  [/тунец|тунц/, 'tuna'],
  [/кревет/, 'shrimp'],
  [/кальмар/, 'squid'],
  [/треск|денис|дорад|рыб/, 'whitefish'],
  [/хлебц/, 'ricecake'],
  [/хлеб|тост/, 'bread'],
  [/(^| )пит/, 'pita'],
  [/тортил|лаваш/, 'tortilla'],
  [/(^| )рис/, 'rice'],
  [/греч/, 'buckwheat'],
  [/макарон|(^| )паст|спагет|пенне|фузилл/, 'pasta'],
  [/овсян|геркулес/, 'oats'],
  [/булгур/, 'bulgur'],
  [/киноа/, 'quinoa'],
  [/кус ?кус/, 'couscous'],
  [/чечев/, 'lentils'],
  [/(^| )мук/, 'flour'],
  [/гранол|мюсли/, 'granola'],
  [/(^| )нут/, 'chickpeas'],
  [/фасол/, 'beans'],
  [/кукуруз/, 'corn'],
  [/хумус/, 'hummus'],
  [/тхин|тахин/, 'tahini'],
  [/соев/, 'soy'],
  [/(^| )сол/, 'salt'],
  [/паприк/, 'paprika'],
  [/(^| )зир|кумин/, 'cumin'],
  [/сахар/, 'sugar'],
  [/(^| )мед/, 'honey'],
  [/грецк|орех/, 'walnut'],
  [/миндал/, 'almond'],
  [/финик/, 'dates'],
  [/шоколад/, 'choco'],
  [/ягод|черник|малин|клубник/, 'berries'],
  [/горош/, 'peas'],
  [/овощн[а-я]* смес/, 'vegmix'],
];

// Примерный вес одной штуки для продуктов, которые считаются в граммах
const PIECE_W = {
  tomato: 120, cucumber: 120, bellpep: 150, potato: 150, sweetpot: 250, zucchini: 250, eggplant: 300,
  broccoli: 400, cauli: 600, beet: 200, mushroom: 20, salmon: 150, whitefish: 150, bread: 30,
  tuna: 160, chickpeas: 240, beans: 240, cantom: 400, corn: 200, mozz: 125, tofu: 300,
};

// [регулярное выражение для единицы, тип, множитель]
const UNITS = [
  [/^(кг|килограмм\S*)/, 'g', 1000],
  [/^(гр?|грамм\S*)(?![а-я])/, 'g', 1],
  [/^(мл|миллилитр\S*)/, 'ml', 1],
  [/^(л|литр\S*)(?![а-я])/, 'ml', 1000],
  [/^(ст\.?\s?л\.?|столов\S*\s+лож\S*|ст\.?\s?лож\S*)/, 'g', 15],
  [/^(ч\.?\s?л\.?|чайн\S*\s+лож\S*)/, 'g', 5],
  [/^(лож\S*)/, 'g', 15],
  [/^(стакан\S*|чаш\S*)/, 'g', 200],
  [/^(пуч\S*)/, 'g', 30],
  [/^(банк\S*)/, 'can', 1],
  [/^(щепот\S*)/, 'g', 1],
  [/^(зуб\S*|доль\S*|долек)/, 'pcs', 1],
  [/^(шт\S*|штук\S*)/, 'pcs', 1],
  [/^(ломт\S*|кусоч\S*|кусок)/, 'slice', 1],
];

export function findProduct(name) {
  const n = norm(name);
  if (!n) return null;
  const all = allProducts();
  let p = all.find(x => norm(x.name) === n);
  if (p) return p;
  p = all.find(x => x.id.startsWith('c_') && (norm(x.name).startsWith(n) || n.startsWith(norm(x.name))));
  if (p) return p;
  for (const [re, id] of SYN) if (re.test(n)) return product(id);
  const words = n.split(' ').filter(w => w.length > 3);
  for (const x of all) {
    const w0 = norm(x.name).split(' ')[0];
    if (w0.length < 4) continue;
    const stem = w0.slice(0, Math.max(4, w0.length - 2));
    if (words.some(w => w.startsWith(stem))) return x;
  }
  return null;
}

const round = v => Math.round(v * 100) / 100;

export function parseLine(raw) {
  let s = raw.trim().replace(/^[-–—•*·]\s*/, '').replace(/^\d+[.)]\s+(?=[^\d\s])/, '');
  if (!s) return null;
  let t = s.toLowerCase().replace(/ё/g, 'е')
    .replace(/½/g, ' 0.5 ').replace(/¼/g, ' 0.25 ').replace(/¾/g, ' 0.75 ')
    .replace(/(^|\s)(половин\S*|пол)(?=\s)/, ' 0.5 ')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/по вкусу|для подачи|по желанию/g, ' ');
  let qty = null, kind = null, mult = 1;
  const m = t.match(/(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+))?(?:\s*[-–]\s*\d+(?:\.\d+)?)?/);
  if (m) {
    qty = Number(m[1]) / (m[2] ? Number(m[2]) : 1);
    const after = t.slice(m.index + m[0].length).replace(/^[\s.]+/, '');
    let unitLen = 0;
    for (const [re, k, mu] of UNITS) {
      const um = after.match(re);
      if (um) { kind = k; mult = mu; unitLen = um[0].length; break; }
    }
    const afterRest = after.slice(unitLen);
    t = t.slice(0, m.index) + ' ' + afterRest;
  } else {
    for (const [re, k, mu] of UNITS) {
      const um = t.match(new RegExp('(^|\\s)' + re.source.slice(1)));
      if (um) { t = t.replace(um[0], ' '); qty = 1; kind = k; mult = mu; break; }
    }
  }
  const name = t.replace(/[—–:;,.()]+/g, ' ').replace(/\s-\s|^-|-$/g, ' ').replace(/\s+/g, ' ').trim();
  if (!name) return null;
  const p = findProduct(name);
  return { raw: s, name, qty, kind, mult, p };
}

// Количество в единицах продукта
export function toQty(p, { qty, kind, mult }) {
  if (qty == null) return p.unit === 'pcs' ? 1 : (p.cat === 'spice' ? 3 : 100);
  const grams = kind === 'g' || kind === 'ml' ? qty * mult : kind === 'slice' ? qty * 30 : kind === 'can' ? qty * (PIECE_W[p.id] || 400) : null;
  if (p.unit === 'pcs') return grams != null ? round(grams / (p.w || 100)) : qty;
  if (grams != null) return round(grams);
  if (kind === 'pcs' || qty <= 6) return round(qty * (PIECE_W[p.id] || 100));
  return qty;
}

export function newProductFrom(r) {
  const unit = r.kind === 'pcs' ? 'pcs' : r.kind === 'ml' ? 'ml' : (r.kind == null && r.qty != null && r.qty <= 6) ? 'pcs' : 'g';
  const name = r.name[0].toUpperCase() + r.name.slice(1);
  return { name, cat: 'other', unit, w: 100, kcal: 0, p: 0, f: 0, c: 0, staple: false, seafood: false, ul: null };
}

export function parseIngredients(text) {
  return text.split(/\n|;/).map(parseLine).filter(Boolean).map(r => {
    if (r.p) return { ...r, qtyP: toQty(r.p, r) };
    const np = newProductFrom(r);
    return { ...r, np, qtyP: toQty(np, r) };
  });
}

const fmtN = v => String(round(v)).replace('.', ',');
export function ingredientsToText(ing) {
  return ing.map(i => {
    const p = product(i.pid);
    if (!p) return '';
    const u = p.unit === 'pcs' ? (p.ul || 'шт') : p.unit === 'ml' ? 'мл' : 'г';
    return `${p.name} ${fmtN(i.qty)} ${u}`;
  }).filter(Boolean).join('\n');
}
