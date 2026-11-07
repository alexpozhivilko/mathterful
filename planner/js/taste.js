// «Умные» рекомендации: профиль вкуса строится по выбору в тиндере и оценкам прошедших недель.
import { state, product, dish } from './store.js';
import { SUGGESTED } from './data.js';
import { isSeafood, planOf, weekKeyOffset, parseISO } from './logic.js';

// Базовые продукты, которые есть почти везде, — они ничего не говорят о вкусе
const GENERIC = new Set(['salt', 'olive', 'oil', 'blackpep', 'garlic', 'onion', 'sugar', 'flour', 'greens', 'lemon', 'butter']);

const poolDish = id => SUGGESTED.find(d => d.id === id);
const anyDish = id => dish(id) || poolDish(id);
const keyIngs = d => [...new Set(d.ing.map(i => i.pid).filter(pid => !GENERIC.has(pid)))];

// Вес каждого продукта во вкусе (плюс — нравится, минус — не очень)
export function tasteProfile() {
  const w = new Map();
  let signal = 0;
  const add = (id, k) => {
    const d = anyDish(id);
    if (!d) return;
    const ings = keyIngs(d);
    if (!ings.length) return;
    const part = k / Math.sqrt(ings.length);
    ings.forEach(pid => w.set(pid, (w.get(pid) || 0) + part));
    if (k > 0) signal += k;
  };
  for (const pr of Object.values(state.prefs || {})) {
    pr.like.forEach(id => add(id, 1));
    pr.star.forEach(id => add(id, 2));
    pr.nope.forEach(id => add(id, -0.3));
  }
  for (const [id, r] of Object.entries(state.ratings || {})) add(id, r > 0 ? r * 1.5 : -1.5);
  return { w, signal };
}

// Что пользователь любит: блюда с ♥/★ и высокими оценками
function lovedDishes() {
  const score = new Map();
  const bump = (id, k) => score.set(id, (score.get(id) || 0) + k);
  for (const pr of Object.values(state.prefs || {})) { pr.like.forEach(id => bump(id, 1)); pr.star.forEach(id => bump(id, 2)); }
  for (const [id, r] of Object.entries(state.ratings || {})) if (r > 0) bump(id, r * 2);
  return [...score.entries()].filter(([, s]) => s > 0).map(([id, s]) => ({ d: anyDish(id), s })).filter(x => x.d);
}

const jaccard = (a, b) => {
  const A = new Set(a), B = new Set(b);
  const inter = [...A].filter(x => B.has(x)).length;
  return inter / (A.size + B.size - inter || 1);
};

// Рекомендации из библиотеки: чего ещё нет в «Моих блюдах» и от чего не отказывались
export function suggestions(n = 3) {
  const have = new Set(state.dishes.map(d => d.id));
  const dismissed = new Set(state.dismissed || []);
  const { w, signal } = tasteProfile();
  const loved = lovedDishes();
  const list = SUGGESTED.filter(d => !have.has(d.id) && !dismissed.has(d.id)).map(d => {
    const ings = keyIngs(d);
    let score = ings.reduce((a, pid) => a + (w.get(pid) || 0), 0) / Math.sqrt(ings.length || 1);
    let like = null, best = 0, bestJ = 0;
    for (const { d: l, s } of loved) {
      const j = jaccard(ings, keyIngs(l));
      if (j * Math.min(2, s) > best) { best = j * Math.min(2, s); like = l; bestJ = j; }
    }
    score += best * 1.5;
    // Морепродукты — только для меня, поэтому чуть реже
    if (isSeafood(d)) score -= 0.3;
    const liked = ings.filter(pid => (w.get(pid) || 0) > 0.25).sort((a, b) => w.get(b) - w.get(a)).slice(0, 2).map(pid => product(pid)?.name.toLowerCase());
    const reason = like && bestJ >= 0.3 ?`Похоже на «${like.name}»` : liked.length ? `Вы любите: ${liked.join(', ')}` : 'Попробуйте что-то новое';
    return { d, score: score + Math.random() * 0.05, reason };
  });
  list.sort((a, b) => b.score - a.score);
  // Без истории выбора показываем разнообразные блюда в случайном порядке
  if (signal < 3) list.sort(() => Math.random() - 0.5);
  return { items: list.slice(0, n), learned: signal >= 3 };
}

// Добавить рецепт из библиотеки в «Мои блюда»
export function adoptSuggestion(id) {
  const d = poolDish(id);
  if (!d || dish(id)) return null;
  const copy = structuredClone(d);
  state.dishes.unshift(copy);
  return copy;
}

export function dismissSuggestion(id) {
  if (!state.dismissed.includes(id)) state.dismissed.push(id);
}

export const suggestedDish = poolDish;

// Последняя прошедшая неделя, которую ещё не оценили
export function weekToReview() {
  const cur = weekKeyOffset(0);
  const weeks = Object.keys(state.plans).filter(wk => wk < cur && state.plans[wk].length && !state.reviewed[wk]).sort();
  const wk = weeks[weeks.length - 1];
  if (!wk) return null;
  // Старше трёх недель уже не спрашиваем
  if ((parseISO(cur) - parseISO(wk)) / 864e5 > 21) return null;
  return wk;
}

export function weekDishes(wk) {
  return [...new Set(planOf(wk).map(e => e.dishId))].map(id => dish(id)).filter(Boolean);
}
