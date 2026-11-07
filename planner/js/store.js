// Состояние приложения: хранится в localStorage этого устройства.
import { PRODUCTS, DISHES } from './data.js';

const KEY = 'kitchen-planner-v1';

function defaults() {
  const pantry = {};
  PRODUCTS.filter(p => p.staple).forEach(p => { pantry[p.id] = 'have'; });
  return {
    v: 1,
    settings: {
      names: { me: 'Я', him: 'Муж' },
      goals: {
        me: { p: 110, f: 55, c: 165 },
        him: { p: 176, f: 88, c: 264 },
      },
      factor: 1.6,       // порция мужа относительно моей
      weekStart: 0,      // 0 — воскресенье, 1 — понедельник
    },
    dishes: structuredClone(DISHES),
    customProducts: [],
    pantry,
    plans: {},           // weekKey -> [{ id, day, meal, dishId, who, span, mult }]
    shopping: {},        // weekKey -> { checked: {key: true}, hidden: {key: true}, manual: [{id, name, pid, qty}] }
    expenses: [],        // [{ id, date, amount, note }]
    prefs: {},           // weekKey -> { like: [], star: [], nope: [] } — выбор из «тиндера блюд»
    ratings: {},         // dishId -> оценка после недели: 2 — лучшее, 1 — понравилось, -1 — не очень
    dismissed: [],       // рекомендации, от которых отказались
    reviewed: {},        // weekKey -> true, неделя уже оценена
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      const d = defaults();
      return { ...d, ...s, settings: { ...d.settings, ...s.settings } };
    }
  } catch (e) { /* повреждённые данные — начнём заново */ }
  return defaults();
}

export const state = load();

let timer = null;
export function save() {
  clearTimeout(timer);
  timer = setTimeout(saveNow, 150);
}
export function saveNow() {
  clearTimeout(timer);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn(e); }
}
window.addEventListener('pagehide', saveNow);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); });

export function replaceState(next) {
  const d = defaults();
  Object.keys(state).forEach(k => delete state[k]);
  Object.assign(state, d, next, { settings: { ...d.settings, ...(next.settings || {}) } });
  saveNow();
}
export function resetState() { replaceState(defaults()); }

export const uid = () => Math.random().toString(36).slice(2, 10);

// ---------- Продукты ----------
let pmapCache = null, pmapLen = -1;
export function productMap() {
  if (!pmapCache || pmapLen !== state.customProducts.length) {
    pmapCache = new Map();
    PRODUCTS.forEach(p => pmapCache.set(p.id, p));
    state.customProducts.forEach(p => pmapCache.set(p.id, p));
    pmapLen = state.customProducts.length;
  }
  return pmapCache;
}
export const product = id => productMap().get(id);
export const allProducts = () => [...productMap().values()];
export function invalidateProducts() { pmapCache = null; }

export const dish = id => state.dishes.find(d => d.id === id);
