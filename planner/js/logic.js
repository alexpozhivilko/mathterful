// Расчёты: даты, КБЖУ, список покупок, автоподбор меню, траты.
import { state, product, dish, uid } from './store.js';
import { CAT_ORDER } from './data.js';

// ---------- Даты ----------
export const WEEKDAYS = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
export const WD_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
export const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
export const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

export function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function parseISO(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
export function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
export function today() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
export function startOfWeek(d, ws = state.settings.weekStart) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return addDays(x, -((x.getDay() - ws + 7) % 7));
}
export const weekKeyFor = d => iso(startOfWeek(d));
export function weekKeyOffset(offset) { return weekKeyFor(addDays(today(), offset * 7)); }
export function weekDates(wk) { const s = parseISO(wk); return Array.from({ length: 7 }, (_, i) => addDays(s, i)); }
export function fmtDay(d) { return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`; }
export function fmtRange(wk) {
  const [a, , , , , , b] = weekDates(wk);
  if (a.getMonth() === b.getMonth()) return `${a.getDate()}–${b.getDate()} ${MONTHS_GEN[b.getMonth()]}`;
  return `${a.getDate()} ${MONTHS_GEN[a.getMonth()].slice(0, 3)} – ${b.getDate()} ${MONTHS_GEN[b.getMonth()].slice(0, 3)}`;
}

// Перенос меню при смене первого дня недели
export function migrateWeekStart(newWs) {
  const oldPlans = state.plans, oldShop = state.shopping;
  state.settings.weekStart = newWs;
  const plans = {}, shopping = {};
  for (const [wk, entries] of Object.entries(oldPlans)) {
    const s = parseISO(wk);
    for (const e of entries) {
      const date = addDays(s, e.day);
      const nk = weekKeyFor(date);
      const day = Math.round((date - parseISO(nk)) / 864e5);
      (plans[nk] ||= []).push({ ...e, day, span: Math.min(e.span, 7 - day) });
    }
  }
  for (const [wk, sh] of Object.entries(oldShop)) {
    const nk = weekKeyFor(parseISO(wk));
    if (!shopping[nk]) shopping[nk] = sh;
  }
  state.plans = plans; state.shopping = shopping;
}

// ---------- КБЖУ ----------
export const kcalOf = g => Math.round(g.p * 4 + g.c * 4 + g.f * 9);
export function grams(p, qty) { return p.unit === 'pcs' ? qty * (p.w || 0) : qty; }

export function dishNutr(d) {
  const n = { kcal: 0, p: 0, f: 0, c: 0 };
  if (!d) return n;
  for (const i of d.ing) {
    const pr = product(i.pid);
    if (!pr) continue;
    const k = grams(pr, i.qty) / 100;
    n.kcal += pr.kcal * k; n.p += pr.p * k; n.f += pr.f * k; n.c += pr.c * k;
  }
  return n;
}
export const isSeafood = d => !!d && d.ing.some(i => product(i.pid)?.seafood);

export const planOf = wk => (state.plans[wk] ||= []);
export const covers = (e, day) => day >= e.day && day < e.day + e.span;
export const forPerson = (e, person) => e.who === 'both' || e.who === person;
export const personMult = person => (person === 'him' ? state.settings.factor : 1);

export function entryNutr(e, person) {
  const n = dishNutr(dish(e.dishId));
  const m = e.mult * personMult(person);
  return { kcal: n.kcal * m, p: n.p * m, f: n.f * m, c: n.c * m };
}

export const dayNutr = (wk, day, person) => planDayNutr(planOf(wk), day, person);
export function planDayNutr(plan, day, person) {
  const t = { kcal: 0, p: 0, f: 0, c: 0 };
  for (const e of plan) {
    if (!covers(e, day) || !forPerson(e, person)) continue;
    const n = entryNutr(e, person);
    t.kcal += n.kcal; t.p += n.p; t.f += n.f; t.c += n.c;
  }
  return t;
}

// Средние калории в день по меню (по дням, где что-то запланировано)
export function planAvgKcal(plan, person) {
  const days = [0, 1, 2, 3, 4, 5, 6].filter(i => plan.some(e => covers(e, i) && forPerson(e, person)));
  return days.length ? days.reduce((a, i) => a + planDayNutr(plan, i, person).kcal, 0) / days.length : 0;
}

// Сколько каждого продукта нужно на всё меню (на двоих, с учётом дней и порций)
export function planNeeds(plan) {
  const f = state.settings.factor;
  const m = new Map();
  for (const e of plan) {
    const d = dish(e.dishId);
    if (!d) continue;
    const span = Math.min(e.span, 7 - e.day);
    const portions = e.mult * span * (e.who === 'both' ? 1 + f : e.who === 'me' ? 1 : f);
    for (const i of d.ing) {
      const pr = product(i.pid);
      if (!pr) continue;
      if (!m.has(pr.id)) m.set(pr.id, { p: pr, qty: 0, dishes: new Set() });
      const x = m.get(pr.id);
      x.qty += i.qty * portions;
      x.dishes.add(d.name);
    }
  }
  return m;
}

// ---------- Список покупок ----------
export function shopState(wk) {
  return (state.shopping[wk] ||= { checked: {}, hidden: {}, manual: [] });
}

export function fmtQty(pr, qty) {
  if (qty == null || !pr) return '';
  if (pr.unit === 'pcs') {
    const n = Math.max(1, Math.ceil(qty - 0.05));
    return `${n} ${pr.ul || 'шт'}`;
  }
  const u = pr.unit === 'ml' ? ['мл', 'л'] : ['г', 'кг'];
  if (qty >= 1000) return `${(Math.ceil(qty / 100) / 10).toString().replace('.', ',')} ${u[1]}`;
  return `${Math.max(10, Math.ceil(qty / 10) * 10)} ${u[0]}`;
}

export function shoppingList(wk) {
  const sh = shopState(wk);
  const items = new Map();
  const get = (key, pr) => {
    if (!items.has(key)) items.set(key, { key, pid: pr.id, name: pr.name, cat: pr.cat, qty: 0, dishes: new Set(), pantry: null, manual: false });
    return items.get(key);
  };

  for (const [pid, x] of planNeeds(planOf(wk))) {
    const status = state.pantry[pid];
    if (status === 'have') continue; // запасы из кладовки берём по статусу, а не по меню
    const it = get(pid, x.p);
    it.qty += x.qty;
    x.dishes.forEach(n => it.dishes.add(n));
  }
  for (const [pid, status] of Object.entries(state.pantry)) {
    if (status === 'have') continue;
    const pr = product(pid);
    if (!pr) continue;
    const it = get(pid, pr);
    it.pantry = status;
    if (!it.qty) it.qty = null;
  }
  for (const m of sh.manual) {
    const pr = m.pid ? product(m.pid) : null;
    items.set('m:' + m.id, {
      key: 'm:' + m.id, pid: m.pid || null, name: pr ? pr.name : m.name, cat: pr ? pr.cat : 'other',
      qty: null, dishes: new Set(), pantry: null, manual: true, manualId: m.id,
    });
  }

  const all = [...items.values()].map(it => ({
    ...it,
    qtyText: it.qty ? fmtQty(product(it.pid), it.qty) : '',
    done: !!sh.checked[it.key],
    hidden: !!sh.hidden[it.key],
  }));
  const visible = all.filter(i => !i.hidden);
  const groups = CAT_ORDER.map(cat => ({
    cat,
    items: visible.filter(i => i.cat === cat).sort((a, b) => (a.done - b.done) || a.name.localeCompare(b.name, 'ru')),
  })).filter(g => g.items.length);
  return { groups, total: visible.length, done: visible.filter(i => i.done).length, hidden: all.filter(i => i.hidden) };
}

// ---------- Автоподбор меню ----------
const rand = n => Math.floor(Math.random() * n);

function myGoal() {
  const g = state.settings.goals.me;
  return { kcal: kcalOf(g), p: g.p, f: g.f, c: g.c };
}

// Выбор из «тиндера блюд» и то, что уже есть дома
export const prefsOf = wk => (state.prefs[wk] ||= { like: [], star: [], nope: [] });

function context(wk) {
  const pr = state.prefs[wk] || { like: [], star: [], nope: [] };
  const like = new Set(pr.like), star = new Set(pr.star), nope = new Set(pr.nope);
  const home = new Set(Object.keys(shopState(wk).hidden));
  const rt = state.ratings || {};
  // Оценки прошлых недель: любимое чаще, «не очень» — реже
  const learned = d => { const r = rt[d.id]; return r > 0 ? 1 + 0.35 * r : r < 0 ? 0.4 : 1; };
  const pref = d => (star.has(d.id) ? 5 : like.has(d.id) ? 3 : 1) * (d.ing.some(i => home.has(i.pid)) ? 1.4 : 1) * learned(d);
  const all = state.dishes.filter(d => d.ing.length && !nope.has(d.id));
  return { like, star, nope, home, pref, all, shared: all.filter(d => !isSeafood(d)) };
}

function weightedPick(list, used, pref = () => 1) {
  const w = list.map(d => pref(d) / (1 + 3 * (used.get(d.id) || 0)));
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) { r -= w[i]; if (r <= 0) return list[i]; }
  return list[list.length - 1];
}

function usedCounts(plan) {
  const used = new Map();
  plan.forEach(e => used.set(e.dishId, (used.get(e.dishId) || 0) + 1));
  return used;
}

const mk = (day, meal, d, span = 1, who = 'both') => ({ id: uid(), day, meal, dishId: d.id, who, span, mult: 1 });

function generateDay(plan, day, dishes, used, ctx) {
  const covered = new Set(plan.filter(e => covers(e, day)).map(e => e.meal));
  const base = { kcal: 0, p: 0, f: 0, c: 0 };
  plan.filter(e => covers(e, day) && forPerson(e, 'me')).forEach(e => {
    const n = entryNutr(e, 'me'); base.kcal += n.kcal; base.p += n.p; base.f += n.f;
  });
  const need = ['b', 'l', 'd', 's'].filter(m => !covered.has(m));
  const cand = {};
  for (const m of need) cand[m] = dishes.filter(d => d.meals.includes(m));
  const G = myGoal();
  const w = d => ctx.pref(d) / (1 + 2 * (used.get(d.id) || 0));
  let best = null, bestScore = Infinity;

  for (let t = 0; t < 500; t++) {
    const picks = [];
    for (const m of need) {
      const list = cand[m];
      if (!list.length) continue;
      const count = m === 's' ? (Math.random() < 0.45 ? 2 : 1) : 1;
      for (let k = 0; k < count; k++) {
        const d = weightedPick(list, used, w);
        if (picks.some(p => p.d.id === d.id)) continue;
        picks.push({ m, d });
      }
    }
    const n = { ...base };
    let repeat = 0, liked = 0;
    for (const { d } of picks) {
      const x = dishNutr(d);
      n.kcal += x.kcal; n.p += x.p; n.f += x.f;
      repeat += used.get(d.id) || 0;
      liked += ctx.pref(d) - 1;
      if (ctx.star.has(d.id) && !used.get(d.id)) liked += 2;
    }
    const score =
      1.2 * Math.abs(n.kcal - G.kcal) / G.kcal +
      Math.max(0, G.p - n.p) / G.p +
      0.25 * Math.max(0, n.p - G.p * 1.35) / G.p +
      0.3 * Math.abs(n.f - G.f) / G.f +
      0.22 * repeat -
      0.08 * liked;
    if (score < bestScore) { bestScore = score; best = picks; }
  }
  for (const { m, d } of best || []) {
    plan.push(mk(day, m, d));
    used.set(d.id, (used.get(d.id) || 0) + 1);
  }
}

export function autoplanWeek(wk) { state.plans[wk] = buildPlan(wk); }

// Составить меню недели (не сохраняя его)
export function buildPlan(wk) {
  const ctx = context(wk);
  const dishes = ctx.shared;
  const plan = [];
  const used = new Map();
  const batchLunch = dishes.filter(d => d.batch && d.meals.includes('l'));
  const lunch = dishes.filter(d => !d.batch && d.meals.includes('l'));
  let day = 0;
  while (day < 7) {
    const useBatch = batchLunch.length && (Math.random() < 0.7 || !lunch.length);
    if (useBatch && day < 6) {
      const span = Math.min(Math.random() < 0.25 ? 3 : 2, 7 - day);
      const d = weightedPick(batchLunch, used, ctx.pref);
      plan.push(mk(day, 'l', d, span));
      used.set(d.id, (used.get(d.id) || 0) + 1);
      day += span;
    } else if (lunch.length) {
      const d = weightedPick(lunch, used, ctx.pref);
      plan.push(mk(day, 'l', d));
      used.set(d.id, (used.get(d.id) || 0) + 1);
      day += 1;
    } else break;
  }
  for (let d = 0; d < 7; d++) generateDay(plan, d, dishes, used, ctx);

  // «Обязательные» блюда, которые не попали в меню, ставим вместо подходящих
  const free = () => plan.filter(e => e.span === 1 && e.who === 'both' && !ctx.star.has(e.dishId));
  for (const id of ctx.star) {
    const d = dish(id);
    if (!d || isSeafood(d) || plan.some(e => e.dishId === id)) continue;
    const slots = free().filter(e => d.meals.includes(e.meal));
    if (slots.length) slots[rand(slots.length)].dishId = id;
  }

  // Блюда с морепродуктами, которые понравились: мне — оно, мужу — другое блюдо в тот же приём пищи
  const sea = ctx.all.filter(d => isSeafood(d) && (ctx.star.has(d.id) || ctx.like.has(d.id)))
    .sort((a, b) => ctx.pref(b) - ctx.pref(a)).slice(0, 2);
  for (const d of sea) {
    const slots = free().filter(e => d.meals.includes(e.meal) && (e.meal === 'l' || e.meal === 'd') &&
      !plan.some(x => x.day === e.day && x.who === 'me'));
    if (!slots.length) continue;
    const e = slots[rand(slots.length)];
    e.who = 'him';
    plan.push(mk(e.day, e.meal, d, 1, 'me'));
  }
  markAuto(plan, ctx);
  return plan;
}

// Отметить блюда, которые подобраны автоматически (не из «хочу» / «обязательно»)
function markAuto(entries, ctx) {
  if (!ctx.like.size && !ctx.star.size) return;
  for (const e of entries) {
    if (ctx.like.has(e.dishId) || ctx.star.has(e.dishId)) delete e.auto;
    else e.auto = true;
  }
}

export function shuffleDay(wk, day) {
  const plan = planOf(wk).filter(e => !(e.day === day && e.span === 1));
  const ctx = context(wk);
  const before = new Set(plan.map(e => e.id));
  generateDay(plan, day, ctx.shared, usedCounts(plan), ctx);
  markAuto(plan.filter(e => !before.has(e.id)), ctx);
  state.plans[wk] = plan;
}

// Продукты для черновика меню: запасы из кладовки и свежие, с количеством на неделю
export function wizardNeeds(plan) {
  const pantry = [], fresh = [];
  for (const x of planNeeds(plan).values()) {
    (state.pantry[x.p.id] ? pantry : fresh).push({ p: x.p, qty: x.qty, dishes: [...x.dishes] });
  }
  return { pantry, fresh };
}

// ---------- Траты ----------
export function money(n) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: n % 1 ? 2 : 0 }).format(n) + ' ₪';
}
export function expensesByWeek(n = 8) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const wk = weekKeyOffset(-i);
    const end = iso(addDays(parseISO(wk), 7));
    const total = state.expenses.filter(e => e.date >= wk && e.date < end).reduce((a, e) => a + e.amount, 0);
    out.push({ wk, total, current: i === 0 });
  }
  return out;
}
export function monthTotal(y, m) {
  const pre = `${y}-${String(m + 1).padStart(2, '0')}`;
  return state.expenses.filter(e => e.date.startsWith(pre)).reduce((a, e) => a + e.amount, 0);
}
