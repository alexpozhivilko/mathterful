import { state, save, saveNow, uid, product, allProducts, dish, invalidateProducts, replaceState, resetState } from './store.js';
import { CATS, CAT_ORDER, MEALS, DISH_EMOJIS, PRODUCT_EMOJI } from './data.js';
import {
  WEEKDAYS, WD_SHORT, MONTHS, iso, parseISO, today, addDays, weekKeyOffset, weekDates, fmtDay, fmtRange,
  migrateWeekStart, kcalOf, dishNutr, isSeafood, planOf, covers, forPerson, entryNutr, dayNutr,
  shopState, shoppingList, fmtQty, autoplanWeek, shuffleDay, money, expensesByWeek, monthTotal,
} from './logic.js';

// ---------- Иконки ----------
const I = {
  menu: '<svg viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="16" rx="4"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4M7.5 13.5h3M13.5 13.5h3M7.5 17h3"/></svg>',
  cart: '<svg viewBox="0 0 24 24"><path d="M2.5 3.5h2.3l2.2 10.6a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.5L20.6 7.5H6"/><circle cx="10" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/></svg>',
  jar: '<svg viewBox="0 0 24 24"><path d="M8 2.5h8v3.5H8z"/><path d="M7.5 6h9A2.5 2.5 0 0 1 19 8.5V19a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 19V8.5A2.5 2.5 0 0 1 7.5 6z"/><path d="M5 11.5h14M5 17h14"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M6 3.5h11.5A1.5 1.5 0 0 1 19 5v15.5H6.5A2.5 2.5 0 0 1 4 18V5.5a2 2 0 0 1 2-2z"/><path d="M4 18a2.5 2.5 0 0 1 2.5-2.5H19M9 7.5h6"/></svg>',
  wallet: '<svg viewBox="0 0 24 24"><path d="M4 7.5V18a2.5 2.5 0 0 0 2.5 2.5h12A1.5 1.5 0 0 0 20 19V9.5A1.5 1.5 0 0 0 18.5 8H5.5A1.5 1.5 0 0 1 4 6.5v0A2 2 0 0 1 6 4.5h10.5"/><circle cx="16" cy="14.2" r="1.3"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
  left: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/></svg>',
  dice: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.1" class="fill"/><circle cx="15" cy="15" r="1.1" class="fill"/><circle cx="15" cy="9" r="1.1" class="fill"/><circle cx="9" cy="15" r="1.1" class="fill"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M14.5 5.5l4 4M4 20l1-5L15.5 4.5a1.4 1.4 0 0 1 2 0l2 2a1.4 1.4 0 0 1 0 2L9 19z"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="M12 15.5V4.5M7 9l5-5 5 5M5 20h14"/></svg>',
  receipt: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>',
  undo: '<svg viewBox="0 0 24 24"><path d="M9 7L4.5 11.5 9 16"/><path d="M5 11.5h9.5a5 5 0 0 1 0 10H12"/></svg>',
};

// ---------- Утилиты ----------
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const r0 = n => Math.round(n);
const num = n => new Intl.NumberFormat('ru-RU').format(Math.round(n));
const buzz = () => { try { navigator.vibrate && navigator.vibrate(8); } catch (e) { /* нет вибрации */ } };
const names = () => state.settings.names;
const goalOf = p => { const g = state.settings.goals[p]; return { ...g, kcal: kcalOf(g) }; };
const mealOf = id => MEALS.find(m => m.id === id);
const pEmoji = p => PRODUCT_EMOJI[p.id] || CATS[p.cat].emoji;
const plural = (n, one, few, many) => {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b === 1) return one;
  if (b >= 2 && b <= 4) return few;
  return many;
};

const UIKEY = 'kitchen-planner-ui';
const ui = Object.assign(
  { tab: 'menu', weekOffset: 0, dishMeal: 'all', dishQ: '', pantryFilter: 'all', pantryEdit: false },
  (() => { try { return JSON.parse(sessionStorage.getItem(UIKEY)) || {}; } catch (e) { return {}; } })(),
  { pantryEdit: false },
);
const saveUI = () => { try { sessionStorage.setItem(UIKEY, JSON.stringify(ui)); } catch (e) { /* приватный режим */ } };
const curWeek = () => weekKeyOffset(ui.weekOffset);
let scrollToToday = true;

// ---------- Мелкие компоненты ----------
function ring(val, goal, cls, label, size = 44, stroke = 4.5) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  const pct = goal ? Math.min(val / goal, 1) : 0;
  const over = goal && val > goal * 1.1;
  return `<div class="ring ${cls}${over ? ' over' : ''}" style="--s:${size}px">
    <svg viewBox="0 0 ${size} ${size}"><circle class="ring-bg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/>
    <circle class="ring-fg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pct)).toFixed(1)}"/></svg>
    <span>${label}</span></div>`;
}

function macroBar(label, val, goal, cls) {
  const pct = goal ? Math.min(100, (val / goal) * 100) : 0;
  return `<div class="mbar ${cls}"><div class="mbar-top"><span>${label}</span><b>${r0(val)}<small> / ${r0(goal)} г</small></b></div>
    <div class="mbar-track"><i style="width:${pct}%"></i></div></div>`;
}

function weekNav() {
  const o = ui.weekOffset;
  const label = o === 0 ? 'Эта неделя' : o === 1 ? 'Следующая неделя' : o === -1 ? 'Прошлая неделя' : o > 1 ? `Через ${o} ${plural(o, 'неделю', 'недели', 'недель')}` : `${-o} ${plural(-o, 'неделю', 'недели', 'недель')} назад`;
  return `<div class="weeknav">
    <button class="icon-btn" data-act="week" data-d="-1" aria-label="Предыдущая неделя">${I.left}</button>
    <button class="weeknav-mid" data-act="weekToday"><b>${fmtRange(curWeek())}</b><small class="${o === 0 ? 'now' : ''}">${label}</small></button>
    <button class="icon-btn" data-act="week" data-d="1" aria-label="Следующая неделя">${I.right}</button>
  </div>`;
}

function whoDots(who) {
  return `<span class="who">${who !== 'him' ? '<i class="dot me"></i>' : ''}${who !== 'me' ? '<i class="dot him"></i>' : ''}</span>`;
}

function empty(emoji, title, text, btn = '') {
  return `<div class="empty"><div class="empty-emoji">${emoji}</div><h3>${title}</h3><p>${text}</p>${btn}</div>`;
}

// ---------- Меню недели ----------
function viewMenu() {
  const wk = curWeek();
  const dates = weekDates(wk);
  const plan = planOf(wk);
  const tKey = iso(today());

  const people = ['me', 'him'].map(p => {
    const g = goalOf(p);
    const days = dates.map((_, i) => i).filter(i => plan.some(e => covers(e, i) && forPerson(e, p)));
    const tot = days.reduce((a, i) => { const n = dayNutr(wk, i, p); a.kcal += n.kcal; a.p += n.p; return a; }, { kcal: 0, p: 0 });
    const avgK = days.length ? tot.kcal / days.length : 0;
    const avgP = days.length ? tot.p / days.length : 0;
    return `<div class="sum-person ${p}">
      ${ring(avgK, g.kcal, p, esc(names()[p].slice(0, 1).toUpperCase()), 52, 5)}
      <div class="sum-text"><small>${esc(names()[p])}</small>
        <b>${days.length ? num(avgK) : '—'}<span> ккал</span></b>
        <small class="muted">из ${num(g.kcal)} ккал</small>
        <small class="muted">белок ${days.length ? r0(avgP) : "—"}/${g.p} г</small></div>
    </div>`;
  }).join('');

  return `${weekNav()}
  <section class="card summary glow">
    <h3 class="card-title">В среднем за день</h3>
    <div class="sum-people">${people}</div>
    <div class="sum-actions">
      <button class="btn primary grow" data-act="autoplan">${I.spark}<span>${plan.length ? 'Пересобрать неделю' : 'Составить неделю за меня'}</span></button>
      ${plan.length ? `<button class="btn ghost square" data-act="clearWeek" aria-label="Очистить неделю">${I.trash}</button>` : ''}
    </div>
  </section>
  ${dates.map((d, i) => dayCard(wk, d, i, iso(d) === tKey)).join('')}
  <p class="foot-hint">Нажмите на блюдо, чтобы изменить порцию, дни или для кого оно. 🎲 — пересобрать день.</p>`;
}

function dayCard(wk, date, i, isToday) {
  const plan = planOf(wk);
  const rings = ['me', 'him'].map(p => {
    const n = dayNutr(wk, i, p), g = goalOf(p);
    return `<div class="ring-wrap">${ring(n.kcal, g.kcal, p, esc(names()[p].slice(0, 1).toUpperCase()), 38, 4)}<small>${n.kcal ? num(n.kcal) : '—'}</small></div>`;
  }).join('');

  const rows = MEALS.map(m => {
    const entries = plan.filter(e => e.meal === m.id && covers(e, i)).sort((a, b) => a.day - b.day);
    const chips = entries.map(e => chip(e, i)).join('');
    return `<div class="meal-row">
      <div class="meal-label"><span>${m.emoji}</span>${m.name}</div>
      <div class="chips">${chips}<button class="add-chip" data-act="addEntry" data-day="${i}" data-meal="${m.id}" aria-label="Добавить: ${m.name}">${I.plus}</button></div>
    </div>`;
  }).join('');

  return `<article class="card day${isToday ? ' today' : ''}" id="day-${i}">
    <header class="day-head">
      <div class="day-title"><b>${WEEKDAYS[date.getDay()]}</b><small>${fmtDay(date)}${isToday ? ' · <em>сегодня</em>' : ''}</small></div>
      <button class="day-rings" data-act="dayStats" data-day="${i}" aria-label="КБЖУ за день">${rings}</button>
      <button class="icon-btn soft" data-act="shuffleDay" data-day="${i}" aria-label="Пересобрать день">${I.dice}</button>
    </header>
    ${rows}
  </article>`;
}

function chip(e, day) {
  const d = dish(e.dishId);
  if (!d) return '';
  const cont = e.day !== day;
  const person = e.who === 'him' ? 'him' : 'me';
  const n = entryNutr(e, person);
  const warn = isSeafood(d) && forPerson(e, 'him');
  const meta = cont
    ? `продолжение · с ${WD_SHORT[addDays(parseISO(curWeek()), e.day).getDay()]}`
    : `${num(n.kcal)} ккал · Б ${r0(n.p)}`;
  return `<button class="chip${cont ? ' cont' : ''}${warn ? ' warn' : ''}" data-act="editEntry" data-id="${e.id}">
    <span class="chip-emoji">${d.emoji}</span>
    <span class="chip-body"><span class="chip-name">${esc(d.name)}</span><span class="chip-meta">${meta}</span></span>
    <span class="chip-tags">${whoDots(e.who)}${e.span > 1 && !cont ? `<span class="tag">${e.span} ${plural(e.span, 'день', 'дня', 'дней')}</span>` : ''}${e.mult !== 1 && !cont ? `<span class="tag">×${String(e.mult).replace('.', ',')}</span>` : ''}${warn ? '<span class="tag warn">🦐</span>' : ''}</span>
  </button>`;
}

// ---------- Покупки ----------
function viewShop() {
  const wk = curWeek();
  const L = shoppingList(wk);
  const pct = L.total ? L.done / L.total : 0;
  const head = `${weekNav()}
  <section class="card shop-head glow">
    ${ring(L.done, L.total || 1, 'prog', `${Math.round(pct * 100)}%`, 64, 6)}
    <div class="shop-head-text"><b>${L.total ? `Куплено ${L.done} из ${L.total}` : 'Список пуст'}</b>
      <small>${L.total ? (L.done === L.total ? 'Всё куплено! Можно вносить чек 🎉' : 'Отмечайте продукты прямо в магазине') : 'Добавьте блюда в меню — список соберётся сам'}</small></div>
  </section>
  <div class="add-row">
    <div class="search">${I.plus}<input id="shop-add" data-input="shopAdd" data-enter="shopAddEnter" placeholder="Добавить продукт…" autocomplete="off" enterkeyhint="done"></div>
    <div class="suggest" id="shop-suggest"></div>
  </div>`;

  const groups = L.groups.map(g => `<section class="group">
    <h3 class="group-title"><span>${CATS[g.cat].emoji}</span>${CATS[g.cat].name}<small>${g.items.filter(i => !i.done).length || '✓'}</small></h3>
    <div class="card list">${g.items.map(shopItem).join('')}</div></section>`).join('');

  const hidden = L.hidden.length
    ? `<button class="btn ghost small center" data-act="unhideAll">${I.undo}Вернуть скрытые (${L.hidden.length})</button>` : '';

  const finish = `<div class="sticky-cta"><button class="btn primary wide" data-act="finishShop">${I.receipt}<span>Покупка завершена — внести чек</span></button></div>`;

  if (!L.total) {
    return head + empty('🛒', 'Пока нечего покупать', 'Список соберётся сам из меню недели и кладовки. Можно добавить продукт и вручную.',
      `<button class="btn primary" data-act="tab" data-tab="menu">${I.menu}<span>Перейти к меню</span></button>`) + hidden;
  }
  return head + groups + hidden + finish;
}

function shopItem(it) {
  const sub = [];
  if (it.pantry) sub.push(`<span class="pill ${it.pantry}">${it.pantry === 'out' ? 'закончилось' : 'заканчивается'}</span>`);
  if (it.dishes.size) sub.push(esc([...it.dishes].slice(0, 3).join(', ') + (it.dishes.size > 3 ? ` +${it.dishes.size - 3}` : '')));
  if (it.manual) sub.push('добавлено вручную');
  return `<div class="item${it.done ? ' done' : ''}" data-act="toggleItem" data-key="${esc(it.key)}">
    <span class="check">${I.check}</span>
    <div class="item-main"><div class="item-name">${esc(it.name)}</div>${sub.length ? `<div class="item-sub">${sub.join(' · ')}</div>` : ''}</div>
    ${it.qtyText ? `<div class="item-qty">${it.qtyText}</div>` : ''}
    <button class="item-x" data-act="hideItem" data-key="${esc(it.key)}" aria-label="Убрать">${I.x}</button>
  </div>`;
}

function renderShopSuggest(q) {
  const box = $('#shop-suggest');
  if (!box) return;
  q = q.trim().toLowerCase();
  if (!q) { box.innerHTML = ''; return; }
  const found = allProducts().filter(p => p.name.toLowerCase().includes(q)).slice(0, 6);
  box.innerHTML = found.map(p => `<button class="sug" data-act="shopAddPid" data-pid="${p.id}"><span>${pEmoji(p)}</span>${esc(p.name)}</button>`).join('')
    + `<button class="sug free" data-act="shopAddEnter"><span>＋</span>Добавить «${esc(q)}»</button>`;
}

// ---------- Кладовка ----------
const STATUS = { have: 'Есть', low: 'Заканчивается', out: 'Нет' };
const NEXT = { have: 'low', low: 'out', out: 'have' };

function viewPantry() {
  const entries = Object.entries(state.pantry).map(([pid, st]) => ({ p: product(pid), st })).filter(x => x.p);
  const cnt = { have: 0, low: 0, out: 0 };
  entries.forEach(x => cnt[x.st]++);
  const f = ui.pantryFilter;
  const shown = entries.filter(x => f === 'all' || (f === 'need' ? x.st !== 'have' : x.st === f));

  const head = `<section class="card pantry-head glow">
    <div class="stat have"><b>${cnt.have}</b><small>есть</small></div>
    <div class="stat low"><b>${cnt.low}</b><small>заканчивается</small></div>
    <div class="stat out"><b>${cnt.out}</b><small>нет</small></div>
  </section>
  <p class="hint">Нажмите на продукт, чтобы сменить статус: <b class="c-have">есть</b> → <b class="c-low">заканчивается</b> → <b class="c-out">нет</b>. Всё, что не «есть», само попадёт в список покупок.</p>
  <div class="toolbar">
    <div class="seg">${[['all', 'Все'], ['need', 'Купить'], ['have', 'Есть']].map(([k, l]) => `<button class="${f === k ? 'on' : ''}" data-act="pantryFilter" data-f="${k}">${l}</button>`).join('')}</div>
    <button class="btn ghost small${ui.pantryEdit ? ' on' : ''}" data-act="pantryEdit">${ui.pantryEdit ? 'Готово' : I.edit}</button>
  </div>`;

  const groups = CAT_ORDER.map(cat => {
    const items = shown.filter(x => x.p.cat === cat).sort((a, b) => a.p.name.localeCompare(b.p.name, 'ru'));
    if (!items.length) return '';
    return `<section class="group"><h3 class="group-title"><span>${CATS[cat].emoji}</span>${CATS[cat].name}</h3>
      <div class="pantry-grid">${items.map(({ p, st }) => `<button class="jar ${st}${ui.pantryEdit ? ' editing' : ''}" data-act="${ui.pantryEdit ? 'pantryRemove' : 'pantryCycle'}" data-pid="${p.id}">
        <span class="jar-name">${esc(p.name)}</span><span class="jar-st"><i></i>${STATUS[st]}</span>
        ${ui.pantryEdit ? `<span class="jar-x">${I.x}</span>` : ''}</button>`).join('')}</div></section>`;
  }).join('');

  return head + (groups || empty('🫙', f === 'need' ? 'Ничего покупать не нужно' : 'Пусто', f === 'need' ? 'Все запасы на месте.' : 'Добавьте продукты, которые храните надолго.'))
    + `<button class="btn ghost wide dashed" data-act="pantryAdd">${I.plus}<span>Добавить в кладовку</span></button>`;
}

// ---------- Блюда ----------
function viewDishes() {
  const q = ui.dishQ.trim().toLowerCase();
  const filters = [['all', 'Все'], ...MEALS.map(m => [m.id, m.name]), ['sea', '🦐 Только мои']];
  const list = state.dishes.filter(d =>
    (!q || d.name.toLowerCase().includes(q)) &&
    (ui.dishMeal === 'all' || (ui.dishMeal === 'sea' ? isSeafood(d) : d.meals.includes(ui.dishMeal))));

  return `<div class="search big">${I.search}<input data-input="dishSearch" placeholder="Найти блюдо" value="${esc(ui.dishQ)}" autocomplete="off"></div>
  <div class="filters">${filters.map(([k, l]) => `<button class="fchip${ui.dishMeal === k ? ' on' : ''}" data-act="dishMeal" data-m="${k}">${l}</button>`).join('')}</div>
  <div class="dish-grid" id="dish-grid">${dishCards(list)}</div>`;
}

function dishCards(list) {
  return `<button class="dish-card new" data-act="newDish"><span class="dc-emoji">${I.plus}</span><b>Новое блюдо</b><small>своё, с КБЖУ</small></button>`
    + list.map(d => {
      const n = dishNutr(d);
      return `<button class="dish-card" data-act="openDish" data-id="${d.id}">
        <span class="dc-emoji">${d.emoji}</span>
        <b>${esc(d.name)}</b>
        <small>${num(n.kcal)} ккал · Б ${r0(n.p)}</small>
        <span class="dc-tags">${d.meals.map(m => `<i title="${mealOf(m).name}">${mealOf(m).emoji}</i>`).join('')}${d.batch ? '<i title="Можно на несколько дней">🗓</i>' : ''}${isSeafood(d) ? '<i title="Муж не ест">🦐</i>' : ''}</span>
      </button>`;
    }).join('');
}

// ---------- Траты ----------
function viewMoney() {
  const t = today();
  const thisM = monthTotal(t.getFullYear(), t.getMonth());
  const pm = addDays(new Date(t.getFullYear(), t.getMonth(), 1), -1);
  const prevM = monthTotal(pm.getFullYear(), pm.getMonth());
  const weeks = expensesByWeek(8);
  const withData = weeks.filter(w => w.total > 0);
  const avg = withData.length ? withData.reduce((a, w) => a + w.total, 0) / withData.length : 0;
  const diff = prevM ? Math.round(((thisM - prevM) / prevM) * 100) : null;

  const max = Math.max(...weeks.map(w => w.total), 1);
  const W = 320, H = 150, bw = 26, gap = (W - bw * 8) / 7;
  const bars = weeks.map((w, i) => {
    const h = Math.max(3, (w.total / max) * 100);
    const x = i * (bw + gap), y = 118 - h;
    const d = parseISO(w.wk);
    return `<g class="bar${w.current ? ' cur' : ''}">
      <rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="${Math.min(7, h / 2)}"/>
      ${w.total ? `<text x="${x + bw / 2}" y="${y - 6}" class="bv">${w.total >= 1000 ? (w.total / 1000).toFixed(1).replace('.', ',') + 'к' : r0(w.total)}</text>` : ''}
      <text x="${x + bw / 2}" y="138" class="bl">${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}</text></g>`;
  }).join('');

  const byMonth = {};
  [...state.expenses].sort((a, b) => b.date.localeCompare(a.date)).forEach(e => (byMonth[e.date.slice(0, 7)] ||= []).push(e));
  const list = Object.entries(byMonth).map(([ym, items]) => {
    const [y, m] = ym.split('-').map(Number);
    return `<section class="group"><h3 class="group-title">${MONTHS[m - 1]} ${y}<small>${money(items.reduce((a, e) => a + e.amount, 0))}</small></h3>
      <div class="card list">${items.map(e => {
        const d = parseISO(e.date);
        return `<button class="item exp" data-act="editExpense" data-id="${e.id}">
          <span class="exp-date"><b>${d.getDate()}</b><small>${WD_SHORT[d.getDay()]}</small></span>
          <div class="item-main"><div class="item-name">${esc(e.note || 'Покупка')}</div></div>
          <div class="item-qty money">${money(e.amount)}</div></button>`;
      }).join('')}</div></section>`;
  }).join('');

  return `<section class="card money-hero glow">
    <small>${MONTHS[t.getMonth()]} · потрачено на продукты</small>
    <div class="big-money">${money(thisM)}</div>
    <div class="money-sub">
      ${diff !== null ? `<span class="pill ${diff > 0 ? 'out' : 'have'}">${diff > 0 ? '▲' : '▼'} ${Math.abs(diff)}% к прошлому месяцу</span>` : ''}
      <span class="muted">≈ ${money(r0(avg))} в неделю</span>
    </div>
    <button class="btn ghost small add-exp" data-act="newExpense">${I.plus}<span>Добавить чек</span></button>
  </section>
  <section class="card chart">
    <h3 class="card-title">По неделям</h3>
    <svg viewBox="0 -12 ${W} ${H + 4}" class="bars"><defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>${bars}</svg>
  </section>
  ${list || empty('🧾', 'Чеков пока нет', 'Когда закончите покупки, нажмите «Покупка завершена» в списке — сумма чека появится здесь.')}
`;
}

// ---------- Оболочка ----------
const TABS = {
  menu: { title: 'Меню недели', icon: I.menu, label: 'Меню', view: viewMenu, kicker: () => fmtRange(curWeek()) },
  shop: { title: 'Покупки', icon: I.cart, label: 'Покупки', view: viewShop, kicker: () => fmtRange(curWeek()) },
  pantry: { title: 'Кладовка', icon: I.jar, label: 'Кладовка', view: viewPantry, kicker: () => 'долгие запасы' },
  dishes: { title: 'Блюда', icon: I.book, label: 'Блюда', view: viewDishes, kicker: () => `${state.dishes.length} ${plural(state.dishes.length, 'блюдо', 'блюда', 'блюд')}` },
  money: { title: 'Траты', icon: I.wallet, label: 'Траты', view: viewMoney, kicker: () => 'история чеков' },
};

function render() {
  const t = TABS[ui.tab] || TABS.menu;
  $('#header').innerHTML = `<div class="hdr-text"><small>${esc(t.kicker())}</small><h1>${t.title}</h1></div>
    <button class="icon-btn glass" data-act="settings" aria-label="Настройки">${I.gear}</button>`;
  $('#main').innerHTML = `<div class="view" data-view="${ui.tab}">${t.view()}</div>`;
  $('#tabbar').innerHTML = Object.entries(TABS).map(([k, v]) => {
    const badge = k === 'shop' ? shopBadge() : 0;
    return `<button class="tab${k === ui.tab ? ' on' : ''}" data-act="tab" data-tab="${k}">${v.icon}<span>${v.label}</span>${badge ? `<i class="badge">${badge}</i>` : ''}</button>`;
  }).join('');
  if (ui.tab === 'menu' && scrollToToday) {
    scrollToToday = false;
    if (!planOf(curWeek()).length) return;
    const el = $('.day.today');
    if (el) requestAnimationFrame(() => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 92, behavior: 'instant' }));
  }
}
function shopBadge() {
  const L = shoppingList(weekKeyOffset(0));
  return L.total - L.done;
}

function update() { save(); saveUI(); render(); refreshSheet(); }

// ---------- Нижние шторки ----------
let sheet = null; // { wrap, render }

function openSheet(renderFn, cls = '') {
  if (sheet) { sheet.wrap.remove(); sheet = null; }
  const wrap = document.createElement('div');
  wrap.className = 'sheet-wrap';
  wrap.innerHTML = `<div class="sheet-backdrop" data-act="closeSheet"></div>
    <div class="sheet ${cls}" role="dialog" aria-modal="true"><div class="sheet-handle"></div><div class="sheet-body"></div></div>`;
  document.body.appendChild(wrap);
  sheet = { wrap, render: renderFn };
  wrap.querySelector('.sheet-body').innerHTML = renderFn();
  document.body.classList.add('noscroll');
  requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('open')));
  enableDrag(wrap);
}
function refreshSheet() {
  if (!sheet) return;
  const body = sheet.wrap.querySelector('.sheet-body');
  const st = body.scrollTop;
  body.innerHTML = sheet.render();
  body.scrollTop = st;
}
function closeSheet() {
  if (!sheet) return;
  const w = sheet.wrap;
  sheet = null;
  w.classList.remove('open');
  document.body.classList.remove('noscroll');
  setTimeout(() => w.remove(), 320);
}
function enableDrag(wrap) {
  const el = wrap.querySelector('.sheet');
  const handle = wrap.querySelector('.sheet-handle');
  let y0 = null, dy = 0;
  const start = e => { y0 = e.touches[0].clientY; dy = 0; el.style.transition = 'none'; };
  const move = e => {
    if (y0 == null) return;
    dy = Math.max(0, e.touches[0].clientY - y0);
    el.style.transform = `translateY(${dy}px)`;
  };
  const end = () => {
    if (y0 == null) return;
    el.style.transition = ''; el.style.transform = '';
    if (dy > 90) closeSheet();
    y0 = null;
  };
  handle.addEventListener('touchstart', start, { passive: true });
  handle.addEventListener('touchmove', move, { passive: true });
  handle.addEventListener('touchend', end);
}

function confirmSheet(title, text, okLabel, onOk, danger = true) {
  pending.confirm = onOk;
  openSheet(() => `<div class="confirm"><h2>${title}</h2><p>${text}</p>
    <div class="btn-row"><button class="btn ghost grow" data-act="closeSheet">Отмена</button>
    <button class="btn ${danger ? 'danger' : 'primary'} grow" data-act="confirmOk">${okLabel}</button></div></div>`, 'small');
}
const pending = { confirm: null };

function toast(text) {
  const t = $('#toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}

function confetti() {
  const colors = ['#8b5cf6', '#22d3ee', '#f472b6', '#fbbf24', '#34d399'];
  const box = document.createElement('div');
  box.className = 'confetti';
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%';
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = Math.random() * 0.3 + 's';
    s.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
    s.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2000);
}

// ---------- Шторка: выбор блюда ----------
let pick = null; // { day, meal, replaceId, q }

function openPicker(day, meal, replaceId = null) {
  pick = { day, meal, replaceId, q: '' };
  const date = weekDates(curWeek())[day];
  openSheet(() => `<div class="sheet-title"><small>${mealOf(meal).emoji} ${mealOf(meal).name} · ${WD_SHORT[date.getDay()]}, ${fmtDay(date)}</small><h2>${replaceId ? 'Заменить блюдо' : 'Выберите блюдо'}</h2></div>
    <div class="search">${I.search}<input data-input="pickSearch" placeholder="Поиск" autocomplete="off" value="${esc(pick.q)}"></div>
    <div id="pick-list">${pickList()}</div>`, 'tall');
}

function pickList() {
  const q = pick.q.trim().toLowerCase();
  const match = state.dishes.filter(d => !q || d.name.toLowerCase().includes(q));
  const fits = match.filter(d => d.meals.includes(pick.meal));
  const other = match.filter(d => !d.meals.includes(pick.meal));
  const row = d => {
    const n = dishNutr(d);
    return `<button class="dish-row" data-act="pickDish" data-id="${d.id}">
      <span class="dr-emoji">${d.emoji}</span>
      <span class="dr-body"><b>${esc(d.name)}</b><small>${num(n.kcal)} ккал · Б ${r0(n.p)} · Ж ${r0(n.f)} · У ${r0(n.c)}</small></span>
      <span class="dr-tags">${d.batch ? '<i>🗓</i>' : ''}${isSeafood(d) ? '<i>🦐</i>' : ''}</span></button>`;
  };
  return (fits.length ? `<h4 class="list-h">Подходит для: ${mealOf(pick.meal).name.toLowerCase()}</h4>${fits.map(row).join('')}` : '')
    + (other.length ? `<h4 class="list-h">Другие блюда</h4>${other.map(row).join('')}` : '')
    + (!match.length ? `<p class="hint center">Ничего не нашлось. Создайте блюдо во вкладке «Блюда».</p>` : '');
}

// ---------- Шторка: блюдо в меню ----------
let draft = null; // { e, isNew }

function openEntry(e, isNew) {
  draft = { e: { ...e }, isNew };
  openSheet(entrySheet);
}

function entrySheet() {
  const e = draft.e;
  const d = dish(e.dishId);
  const wk = curWeek();
  const date = weekDates(wk)[e.day];
  const maxSpan = 7 - e.day;
  const nm = entryNutr(e, 'me'), nh = entryNutr(e, 'him');
  const sea = isSeafood(d);
  const nmz = names();
  return `<div class="entry-head">
      <span class="eh-emoji">${d.emoji}</span>
      <div><small>${mealOf(e.meal).emoji} ${mealOf(e.meal).name} · ${WD_SHORT[date.getDay()]}, ${fmtDay(date)}</small><h2>${esc(d.name)}</h2></div>
    </div>
    <label class="field-label">Для кого</label>
    <div class="seg wide">${[['both', 'Для обоих'], ['me', nmz.me], ['him', nmz.him]].map(([k, l]) => `<button class="${e.who === k ? 'on' : ''}" data-act="draftSet" data-k="who" data-v="${k}">${esc(l)}</button>`).join('')}</div>
    ${sea && e.who !== 'me' ? `<div class="alert">🦐 В этом блюде морепродукты, а ${esc(nmz.him.toLowerCase())} их не ест. Лучше поставить «${esc(nmz.me)}» и добавить ему что-то другое.</div>` : ''}
    <label class="field-label">На сколько дней готовим</label>
    <div class="seg wide">${[1, 2, 3, 4].map(n => `<button class="${e.span === n ? 'on' : ''}" ${n > maxSpan ? 'disabled' : ''} data-act="draftSet" data-k="span" data-v="${n}">${n} ${plural(n, 'день', 'дня', 'дней')}</button>`).join('')}</div>
    ${e.span > 1 ? `<p class="hint">Блюдо появится в меню ещё на ${e.span - 1} ${plural(e.span - 1, 'день', 'дня', 'дней')}, а продукты посчитаются сразу на все порции.</p>` : ''}
    <label class="field-label">Размер порции</label>
    <div class="stepper">
      <button class="icon-btn soft" data-act="draftMult" data-d="-0.25" ${e.mult <= 0.25 ? 'disabled' : ''}>${I.minus}</button>
      <div class="stepper-val"><b>×${String(e.mult).replace('.', ',')}</b><small>${e.mult === 1 ? 'обычная' : e.mult < 1 ? 'поменьше' : 'побольше'}</small></div>
      <button class="icon-btn soft" data-act="draftMult" data-d="0.25" ${e.mult >= 3 ? 'disabled' : ''}>${I.plus}</button>
    </div>
    <div class="nutr-pair">
      ${e.who !== 'him' ? `<div class="np me"><small>${esc(nmz.me)}</small><b>${num(nm.kcal)} ккал</b><span>Б ${r0(nm.p)} · Ж ${r0(nm.f)} · У ${r0(nm.c)}</span></div>` : ''}
      ${e.who !== 'me' ? `<div class="np him"><small>${esc(nmz.him)} · ×${String(state.settings.factor).replace('.', ',')}</small><b>${num(nh.kcal)} ккал</b><span>Б ${r0(nh.p)} · Ж ${r0(nh.f)} · У ${r0(nh.c)}</span></div>` : ''}
    </div>
    <div class="btn-col">
      <button class="btn primary wide" data-act="draftSave">${draft.isNew ? `${I.plus}<span>Добавить в меню</span>` : `${I.check}<span>Сохранить</span>`}</button>
      ${draft.isNew
        ? `<button class="btn ghost wide" data-act="draftBack">${I.left}<span>Выбрать другое блюдо</span></button>`
        : `<div class="btn-row"><button class="btn ghost grow" data-act="draftReplace">${I.undo}<span>Заменить</span></button><button class="btn danger grow" data-act="draftDelete">${I.trash}<span>Удалить</span></button></div>`}
    </div>`;
}

// ---------- Шторка: КБЖУ дня ----------
function openDayStats(day) {
  const wk = curWeek();
  const date = weekDates(wk)[day];
  openSheet(() => `<div class="sheet-title"><small>${fmtDay(date)}</small><h2>${WEEKDAYS[date.getDay()]}</h2></div>
    ${['me', 'him'].map(p => {
      const n = dayNutr(wk, day, p), g = goalOf(p);
      const left = g.kcal - n.kcal;
      return `<section class="card day-stat ${p}">
        <div class="ds-top">${ring(n.kcal, g.kcal, p, `${Math.round((n.kcal / g.kcal) * 100)}%`, 76, 7)}
          <div><small>${esc(names()[p])}</small><b class="ds-k">${num(n.kcal)}<span> / ${num(g.kcal)} ккал</span></b>
          ${n.kcal === 0 ? '<span class="muted">пока ничего не запланировано</span>' : Math.abs(left) <= g.kcal * 0.05 ? '<span class="c-have">точно в цель 🎯</span>' : left > 0 ? `<span class="muted">ещё ${num(left)} ккал</span>` : `<span class="c-out">перебор ${num(-left)} ккал</span>`}</div></div>
        ${macroBar('Белки', n.p, g.p, 'p')}${macroBar('Жиры', n.f, g.f, 'f')}${macroBar('Углеводы', n.c, g.c, 'c')}
      </section>`;
    }).join('')}`);
}

// ---------- Шторка: блюдо ----------
function openDish(id) {
  openSheet(() => {
    const d = dish(id);
    if (!d) return '';
    const n = dishNutr(d);
    const f = state.settings.factor;
    return `<div class="dish-hero"><span class="dh-emoji">${d.emoji}</span><h2>${esc(d.name)}</h2>
      <div class="dh-tags">${d.meals.map(m => `<span class="pill">${mealOf(m).emoji} ${mealOf(m).name}</span>`).join('')}${d.batch ? '<span class="pill">🗓 на несколько дней</span>' : ''}${isSeafood(d) ? '<span class="pill out">🦐 только для меня</span>' : ''}</div></div>
      <div class="kbju">
        <div class="k kcal"><b>${num(n.kcal)}</b><small>ккал</small></div>
        <div class="k p"><b>${r0(n.p)}</b><small>белки</small></div>
        <div class="k f"><b>${r0(n.f)}</b><small>жиры</small></div>
        <div class="k c"><b>${r0(n.c)}</b><small>углеводы</small></div>
      </div>
      <p class="hint center">На мою порцию · порция ${esc(names().him.toLowerCase())}а ×${String(f).replace('.', ',')} ≈ ${num(n.kcal * f)} ккал</p>
      <h4 class="list-h">Ингредиенты на порцию</h4>
      <div class="card list">${d.ing.map(i => {
        const p = product(i.pid);
        return p ? `<div class="item static"><span class="ing-cat">${pEmoji(p)}</span><div class="item-main"><div class="item-name">${esc(p.name)}</div></div><div class="item-qty">${ingQty(p, i.qty)}</div></div>` : '';
      }).join('')}</div>
      <div class="btn-row"><button class="btn ghost grow" data-act="editDish" data-id="${d.id}">${I.edit}<span>Изменить</span></button>
      <button class="btn danger grow" data-act="deleteDish" data-id="${d.id}">${I.trash}<span>Удалить</span></button></div>`;
  });
}

function ingQty(p, qty) {
  const v = String(Math.round(qty * 100) / 100).replace('.', ',');
  return p.unit === 'pcs' ? `${v} ${p.ul || 'шт'}` : `${v} ${p.unit === 'ml' ? 'мл' : 'г'}`;
}
const unitLabel = p => (p.unit === 'pcs' ? (p.ul || 'шт') : p.unit === 'ml' ? 'мл' : 'г');

// ---------- Шторка: редактор блюда ----------
let ed = null; // { d, q, np }

function openEditor(id) {
  const src = id ? dish(id) : null;
  ed = {
    d: src ? structuredClone(src) : { id: null, name: '', emoji: '🍲', meals: [], batch: false, ing: [] },
    q: '', np: null, emojiOpen: false,
  };
  openSheet(editorSheet, 'tall');
}

function editorNutr() {
  const n = dishNutr(ed.d);
  return `<div class="kbju mini"><div class="k kcal"><b>${num(n.kcal)}</b><small>ккал</small></div><div class="k p"><b>${r0(n.p)}</b><small>Б</small></div><div class="k f"><b>${r0(n.f)}</b><small>Ж</small></div><div class="k c"><b>${r0(n.c)}</b><small>У</small></div></div>`;
}

function editorSheet() {
  const d = ed.d;
  const np = ed.np;
  return `<div class="sheet-title"><h2>${d.id ? 'Изменить блюдо' : 'Новое блюдо'}</h2></div>
    <div class="ed-name">
      <button class="emoji-btn" data-act="edEmojiToggle">${d.emoji}</button>
      <input class="input" data-input="edName" placeholder="Название блюда" value="${esc(d.name)}">
    </div>
    ${ed.emojiOpen ? `<div class="emoji-grid">${DISH_EMOJIS.map(e => `<button data-act="edEmoji" data-e="${e}" class="${e === d.emoji ? 'on' : ''}">${e}</button>`).join('')}</div>` : ''}
    <label class="field-label">Когда едим</label>
    <div class="filters wrap">${MEALS.map(m => `<button class="fchip${d.meals.includes(m.id) ? ' on' : ''}" data-act="edMeal" data-m="${m.id}">${m.emoji} ${m.name}</button>`).join('')}
      <button class="fchip${d.batch ? ' on' : ''}" data-act="edBatch">🗓 Можно на несколько дней</button></div>
    <label class="field-label">Ингредиенты на одну мою порцию</label>
    <div id="ed-nutr">${editorNutr()}</div>
    <div class="card list ing-list">${d.ing.map((i, idx) => {
      const p = product(i.pid);
      if (!p) return '';
      return `<div class="item static"><span class="ing-cat">${pEmoji(p)}</span><div class="item-main"><div class="item-name">${esc(p.name)}</div></div>
        <label class="qty-in"><input type="number" inputmode="decimal" step="any" min="0" data-input="edQty" data-i="${idx}" value="${i.qty}"><span>${unitLabel(p)}</span></label>
        <button class="item-x show" data-act="edRemoveIng" data-i="${idx}" aria-label="Убрать">${I.x}</button></div>`;
    }).join('') || '<p class="hint center pad">Пока нет ингредиентов</p>'}</div>
    <div class="search">${I.plus}<input id="ed-search" data-input="edSearch" placeholder="Добавить ингредиент…" autocomplete="off" value="${esc(ed.q)}"></div>
    <div class="suggest inline" id="ed-suggest">${edSuggest()}</div>
    ${np ? newProductForm(np) : ''}
    <div class="btn-col"><button class="btn primary wide" data-act="edSave">${I.check}<span>Сохранить блюдо</span></button></div>`;
}

function edSuggest() {
  const q = ed.q.trim().toLowerCase();
  if (!q || ed.np) return '';
  const found = allProducts().filter(p => p.name.toLowerCase().includes(q)).slice(0, 7);
  return found.map(p => `<button class="sug" data-act="edAddIng" data-pid="${p.id}"><span>${pEmoji(p)}</span>${esc(p.name)}<small>${num(p.kcal)} ккал/100${p.unit === 'ml' ? ' мл' : ' г'}</small></button>`).join('')
    + `<button class="sug free" data-act="edNewProduct"><span>＋</span>Новый продукт «${esc(ed.q.trim())}»</button>`;
}

function newProductForm(np) {
  return `<section class="card np-form">
    <h4>Новый продукт</h4>
    <input class="input" data-input="np" data-k="name" value="${esc(np.name)}" placeholder="Название">
    <div class="row2">
      <label class="sel"><span>Отдел</span><select data-change="np" data-k="cat">${CAT_ORDER.map(c => `<option value="${c}" ${np.cat === c ? 'selected' : ''}>${CATS[c].emoji} ${CATS[c].name}</option>`).join('')}</select></label>
      <label class="sel"><span>Считаем в</span><select data-change="np" data-k="unit"><option value="g" ${np.unit === 'g' ? 'selected' : ''}>граммах</option><option value="ml" ${np.unit === 'ml' ? 'selected' : ''}>мл</option><option value="pcs" ${np.unit === 'pcs' ? 'selected' : ''}>штуках</option></select></label>
    </div>
    ${np.unit === 'pcs' ? `<label class="sel"><span>Вес одной штуки, г</span><input class="input" type="number" inputmode="decimal" data-input="np" data-k="w" value="${np.w || ''}"></label>` : ''}
    <small class="muted">КБЖУ на 100 г (можно оставить пустым)</small>
    <div class="row4">${[['kcal', 'ккал'], ['p', 'Б'], ['f', 'Ж'], ['c', 'У']].map(([k, l]) => `<label class="mini-in"><input type="number" inputmode="decimal" data-input="np" data-k="${k}" value="${np[k] || ''}" placeholder="0"><span>${l}</span></label>`).join('')}</div>
    <div class="btn-row"><button class="btn ghost grow" data-act="npCancel">Отмена</button><button class="btn primary grow" data-act="npSave">Добавить</button></div>
  </section>`;
}

// ---------- Шторка: чек ----------
let exp = null; // { mode, id, amount, date, note }

function openExpense(mode, id) {
  const e = id ? state.expenses.find(x => x.id === id) : null;
  exp = { mode, id, amount: e ? String(e.amount) : '', date: e ? e.date : iso(today()), note: e ? e.note : 'Супермаркет' };
  openSheet(() => `<div class="sheet-title"><small>${mode === 'finish' ? 'Отличная работа! 🎉' : 'Траты на продукты'}</small><h2>${mode === 'edit' ? 'Чек' : 'Сумма чека'}</h2></div>
    <label class="money-in"><input type="number" inputmode="decimal" step="any" data-input="exp" data-k="amount" value="${esc(exp.amount)}" placeholder="0" ${mode !== 'edit' ? 'autofocus' : ''}><span>₪</span></label>
    <div class="row2">
      <label class="sel"><span>Дата</span><input class="input" type="date" data-input="exp" data-k="date" value="${exp.date}"></label>
      <label class="sel"><span>Где</span><input class="input" data-input="exp" data-k="note" value="${esc(exp.note)}"></label>
    </div>
    ${mode === 'finish' ? '<p class="hint">Купленные продукты из кладовки снова станут «есть», а то, что вы добавили вручную и купили, уберётся из списка.</p>' : ''}
    <div class="btn-col"><button class="btn primary wide" data-act="expSave">${I.check}<span>Сохранить чек</span></button>
    ${mode === 'edit' ? `<button class="btn danger wide" data-act="expDelete">${I.trash}<span>Удалить чек</span></button>` : ''}</div>`, 'small');
  setTimeout(() => { const i = sheet?.wrap.querySelector('.money-in input'); if (i && mode !== 'edit') i.focus(); }, 350);
}

// ---------- Шторка: добавить в кладовку ----------
let pq = '';
function openPantryAdd() {
  pq = '';
  openSheet(() => `<div class="sheet-title"><h2>Добавить в кладовку</h2><small>То, что покупаете редко и храните долго</small></div>
    <div class="search">${I.search}<input data-input="pantrySearch" placeholder="Найти или создать продукт" autocomplete="off" value="${esc(pq)}"></div>
    <div id="pantry-list">${pantryAddList()}</div>`, 'tall');
}
function pantryAddList() {
  const q = pq.trim().toLowerCase();
  const list = allProducts().filter(p => !state.pantry[p.id] && (!q || p.name.toLowerCase().includes(q)))
    .sort((a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat) || a.name.localeCompare(b.name, 'ru'));
  return (q ? `<button class="sug free" data-act="pantryCreate"><span>＋</span>Создать «${esc(pq.trim())}»</button>` : '')
    + list.slice(0, 60).map(p => `<button class="sug" data-act="pantryPick" data-pid="${p.id}"><span>${pEmoji(p)}</span>${esc(p.name)}</button>`).join('');
}

// ---------- Шторка: настройки ----------
function openSettings() {
  openSheet(() => {
    const s = state.settings;
    const person = p => {
      const g = s.goals[p];
      return `<section class="card set-goal ${p}">
        <div class="sg-head"><input class="input name-in" data-change="setName" data-p="${p}" value="${esc(s.names[p])}"><b>${num(kcalOf(g))} ккал</b></div>
        <div class="row3">${[['p', 'Белки'], ['f', 'Жиры'], ['c', 'Углеводы']].map(([k, l]) => `<label class="mini-in ${k}"><input type="number" inputmode="numeric" data-change="setGoal" data-p="${p}" data-k="${k}" value="${g[k]}"><span>${l}, г</span></label>`).join('')}</div>
      </section>`;
    };
    return `<div class="sheet-title"><h2>Настройки</h2></div>
      <label class="field-label">Цели на день</label>
      ${person('me')}${person('him')}
      <label class="field-label">Порция ${esc(s.names.him.toLowerCase())}а относительно моей</label>
      <div class="stepper">
        <button class="icon-btn soft" data-act="setFactor" data-d="-0.1">${I.minus}</button>
        <div class="stepper-val"><b>×${s.factor.toFixed(1).replace('.', ',')}</b><small>для расчёта покупок и КБЖУ</small></div>
        <button class="icon-btn soft" data-act="setFactor" data-d="0.1">${I.plus}</button>
      </div>
      <button class="btn ghost wide small" data-act="goalsFromFactor">Цели ${esc(s.names.him.toLowerCase())}а = мои × ${s.factor.toFixed(1).replace('.', ',')}</button>
      <label class="field-label">Неделя начинается с</label>
      <div class="seg wide">${[[0, 'Воскресенья'], [1, 'Понедельника']].map(([k, l]) => `<button class="${s.weekStart === k ? 'on' : ''}" data-act="setWeekStart" data-v="${k}">${l}</button>`).join('')}</div>
      <label class="field-label">Резервная копия</label>
      <p class="hint">Все данные хранятся только в этом телефоне. Сохраняйте копию время от времени — пригодится при смене телефона.</p>
      <div class="btn-row"><button class="btn ghost grow" data-act="exportData">${I.down}<span>Сохранить</span></button>
      <label class="btn ghost grow">${I.up}<span>Загрузить</span><input type="file" accept="application/json,.json" data-change="importData" hidden></label></div>
      <button class="btn danger wide small" data-act="resetAll">${I.trash}<span>Стереть все данные</span></button>
      <p class="hint center">Кухонный планер · ₪ · сделано с любовью 💜</p>`;
  }, 'tall');
}

// ---------- Действия ----------
const A = {
  tab(el) {
    if (ui.tab === el.dataset.tab) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    ui.tab = el.dataset.tab; ui.pantryEdit = false;
    if (ui.tab === 'menu') scrollToToday = ui.weekOffset === 0;
    saveUI(); render(); if (!scrollToToday) window.scrollTo(0, 0);
  },
  week(el) { ui.weekOffset += Number(el.dataset.d); saveUI(); render(); window.scrollTo(0, 0); },
  weekToday() { if (ui.weekOffset !== 0) { ui.weekOffset = 0; scrollToToday = ui.tab === 'menu'; saveUI(); render(); } },
  settings: openSettings,
  closeSheet,
  confirmOk() { const f = pending.confirm; pending.confirm = null; closeSheet(); f && f(); },

  // меню
  autoplan() {
    const wk = curWeek();
    const run = () => { autoplanWeek(wk); buzz(); update(); toast('Готово! Меню на неделю составлено ✨'); };
    if (planOf(wk).length) confirmSheet('Пересобрать неделю?', 'Текущее меню этой недели заменится новым.', 'Пересобрать', run, false);
    else run();
  },
  clearWeek() {
    confirmSheet('Очистить неделю?', 'Все блюда этой недели будут удалены из меню.', 'Очистить', () => { state.plans[curWeek()] = []; update(); });
  },
  shuffleDay(el) { shuffleDay(curWeek(), Number(el.dataset.day)); buzz(); update(); },
  dayStats(el) { openDayStats(Number(el.dataset.day)); },
  addEntry(el) { openPicker(Number(el.dataset.day), el.dataset.meal); },
  pickDish(el) {
    const d = dish(el.dataset.id);
    if (pick.replaceId) {
      const e = planOf(curWeek()).find(x => x.id === pick.replaceId);
      if (e) { draft.e.dishId = d.id; openEntry(draft.e, false); }
      return;
    }
    const span = d.batch && pick.meal !== 'b' && pick.meal !== 's' ? Math.min(2, 7 - pick.day) : 1;
    openEntry({ id: uid(), day: pick.day, meal: pick.meal, dishId: d.id, who: isSeafood(d) ? 'me' : 'both', span, mult: 1 }, true);
  },
  editEntry(el) {
    const e = planOf(curWeek()).find(x => x.id === el.dataset.id);
    if (e) openEntry(e, false);
  },
  draftSet(el) {
    const v = el.dataset.k === 'span' ? Number(el.dataset.v) : el.dataset.v;
    draft.e[el.dataset.k] = v; refreshSheet();
  },
  draftMult(el) { draft.e.mult = Math.min(3, Math.max(0.25, draft.e.mult + Number(el.dataset.d))); refreshSheet(); },
  draftSave() {
    const plan = planOf(curWeek());
    const i = plan.findIndex(x => x.id === draft.e.id);
    if (i >= 0) plan[i] = draft.e; else plan.push(draft.e);
    closeSheet(); buzz(); update();
  },
  draftBack() { openPicker(draft.e.day, draft.e.meal); },
  draftReplace() { openPicker(draft.e.day, draft.e.meal, draft.e.id); },
  draftDelete() {
    const wk = curWeek();
    state.plans[wk] = planOf(wk).filter(x => x.id !== draft.e.id);
    closeSheet(); update();
  },

  // покупки
  toggleItem(el, ev) {
    if (ev.target.closest('.item-x')) return;
    const sh = shopState(curWeek());
    const k = el.dataset.key;
    if (sh.checked[k]) delete sh.checked[k]; else { sh.checked[k] = true; buzz(); }
    update();
  },
  hideItem(el) {
    const sh = shopState(curWeek());
    const k = el.dataset.key;
    if (k.startsWith('m:')) sh.manual = sh.manual.filter(m => 'm:' + m.id !== k);
    else if (state.pantry[k] && state.pantry[k] !== 'have') { state.pantry[k] = 'have'; toast('Отмечено в кладовке как «есть»'); }
    else sh.hidden[k] = true;
    update();
  },
  unhideAll() { shopState(curWeek()).hidden = {}; update(); },
  shopAddPid(el) {
    const sh = shopState(curWeek());
    sh.manual.push({ id: uid(), pid: el.dataset.pid, name: '' });
    update(); const i = $('#shop-add'); if (i) i.focus();
  },
  shopAddEnter() {
    const inp = $('#shop-add');
    const q = (inp?.value || '').trim();
    if (!q) return;
    const exact = allProducts().find(p => p.name.toLowerCase() === q.toLowerCase());
    shopState(curWeek()).manual.push({ id: uid(), pid: exact ? exact.id : null, name: q[0].toUpperCase() + q.slice(1) });
    update(); const i = $('#shop-add'); if (i) i.focus();
  },
  finishShop() { openExpense('finish'); },

  // кладовка
  pantryCycle(el) { const p = el.dataset.pid; state.pantry[p] = NEXT[state.pantry[p]]; buzz(); update(); },
  pantryRemove(el) { delete state.pantry[el.dataset.pid]; update(); },
  pantryFilter(el) { ui.pantryFilter = el.dataset.f; update(); },
  pantryEdit() { ui.pantryEdit = !ui.pantryEdit; render(); },
  pantryAdd: openPantryAdd,
  pantryPick(el) { state.pantry[el.dataset.pid] = 'have'; save(); render(); refreshSheet(); toast('Добавлено в кладовку'); },
  pantryCreate() {
    const name = pq.trim();
    if (!name) return;
    const id = 'c_' + uid();
    state.customProducts.push({ id, name: name[0].toUpperCase() + name.slice(1), cat: 'other', unit: 'g', w: 0, kcal: 0, p: 0, f: 0, c: 0, staple: true, seafood: false, ul: null });
    invalidateProducts();
    state.pantry[id] = 'have';
    closeSheet(); update(); toast('Добавлено в кладовку');
  },

  // блюда
  dishMeal(el) { ui.dishMeal = el.dataset.m; update(); },
  openDish(el) { openDish(el.dataset.id); },
  newDish() { openEditor(null); },
  editDish(el) { openEditor(el.dataset.id); },
  deleteDish(el) {
    const id = el.dataset.id;
    const d = dish(id);
    confirmSheet(`Удалить «${esc(d.name)}»?`, 'Блюдо пропадёт из списка и из всех недель меню.', 'Удалить', () => {
      state.dishes = state.dishes.filter(x => x.id !== id);
      for (const wk of Object.keys(state.plans)) state.plans[wk] = state.plans[wk].filter(e => e.dishId !== id);
      update(); toast('Блюдо удалено');
    });
  },
  edEmojiToggle() { ed.emojiOpen = !ed.emojiOpen; refreshSheet(); },
  edEmoji(el) { ed.d.emoji = el.dataset.e; ed.emojiOpen = false; refreshSheet(); },
  edMeal(el) {
    const m = el.dataset.m, ms = ed.d.meals;
    ed.d.meals = ms.includes(m) ? ms.filter(x => x !== m) : [...ms, m].sort((a, b) => 'blds'.indexOf(a) - 'blds'.indexOf(b));
    refreshSheet();
  },
  edBatch() { ed.d.batch = !ed.d.batch; refreshSheet(); },
  edAddIng(el) {
    const p = product(el.dataset.pid);
    ed.d.ing.push({ pid: p.id, qty: p.unit === 'pcs' ? 1 : 100 });
    ed.q = ''; refreshSheet();
  },
  edRemoveIng(el) { ed.d.ing.splice(Number(el.dataset.i), 1); refreshSheet(); },
  edNewProduct() {
    const n = ed.q.trim();
    ed.np = { name: n ? n[0].toUpperCase() + n.slice(1) : '', cat: 'other', unit: 'g', w: '', kcal: '', p: '', f: '', c: '' };
    refreshSheet();
  },
  npCancel() { ed.np = null; refreshSheet(); },
  npSave() {
    const np = ed.np;
    if (!np.name.trim()) { toast('Введите название продукта'); return; }
    const id = 'c_' + uid();
    const n = v => Math.max(0, Number(String(v).replace(',', '.')) || 0);
    state.customProducts.push({ id, name: np.name.trim(), cat: np.cat, unit: np.unit, w: n(np.w) || 100, kcal: n(np.kcal), p: n(np.p), f: n(np.f), c: n(np.c), staple: false, seafood: false, ul: null });
    invalidateProducts();
    ed.d.ing.push({ pid: id, qty: np.unit === 'pcs' ? 1 : 100 });
    ed.np = null; ed.q = ''; save(); refreshSheet();
  },
  edSave() {
    const d = ed.d;
    d.name = d.name.trim();
    if (!d.name) return toast('Введите название блюда');
    if (!d.meals.length) return toast('Выберите, когда едим это блюдо');
    if (!d.ing.length) return toast('Добавьте хотя бы один ингредиент');
    d.ing = d.ing.filter(i => i.qty > 0);
    if (d.id) {
      const i = state.dishes.findIndex(x => x.id === d.id);
      state.dishes[i] = d;
    } else {
      d.id = 'u_' + uid();
      state.dishes.unshift(d);
    }
    const id = d.id;
    closeSheet(); update(); toast('Блюдо сохранено');
    setTimeout(() => openDish(id), 340);
  },

  // траты
  newExpense() { openExpense('new'); },
  editExpense(el) { openExpense('edit', el.dataset.id); },
  expSave() {
    const amount = Number(String(exp.amount).replace(',', '.'));
    if (!(amount > 0)) return toast('Введите сумму чека');
    if (exp.mode === 'edit') {
      Object.assign(state.expenses.find(x => x.id === exp.id), { amount, date: exp.date, note: exp.note.trim() });
    } else {
      state.expenses.push({ id: uid(), amount, date: exp.date || iso(today()), note: exp.note.trim() });
    }
    if (exp.mode === 'finish') {
      const sh = shopState(curWeek());
      for (const k of Object.keys(sh.checked)) {
        if (state.pantry[k] && state.pantry[k] !== 'have') { state.pantry[k] = 'have'; delete sh.checked[k]; }
      }
      sh.manual = sh.manual.filter(m => !sh.checked['m:' + m.id]);
      Object.keys(sh.checked).filter(k => k.startsWith('m:')).forEach(k => delete sh.checked[k]);
      confetti();
    }
    closeSheet(); update(); toast(`Чек на ${money(amount)} сохранён`);
  },
  expDelete() {
    state.expenses = state.expenses.filter(x => x.id !== exp.id);
    closeSheet(); update();
  },

  // настройки
  setFactor(el) {
    const s = state.settings;
    s.factor = Math.round(Math.min(2.5, Math.max(0.5, s.factor + Number(el.dataset.d))) * 10) / 10;
    update();
  },
  goalsFromFactor() {
    const s = state.settings, m = s.goals.me;
    s.goals.him = { p: Math.round(m.p * s.factor), f: Math.round(m.f * s.factor), c: Math.round(m.c * s.factor) };
    update(); toast('Цели обновлены');
  },
  setWeekStart(el) {
    const v = Number(el.dataset.v);
    if (v === state.settings.weekStart) return;
    migrateWeekStart(v); update();
  },
  exportData() {
    saveNow();
    const blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' });
    const name = `kitchen-planner-${iso(today())}.json`;
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Кухонный планер — копия' }).catch(() => {});
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
  resetAll() {
    confirmSheet('Стереть всё?', 'Меню, блюда, кладовка и история чеков будут удалены без возможности восстановления.', 'Стереть', () => { resetState(); render(); toast('Данные стёрты'); });
  },
};

// Поля ввода
const INPUT = {
  pickSearch(el) { pick.q = el.value; $('#pick-list').innerHTML = pickList(); },
  shopAdd(el) { renderShopSuggest(el.value); },
  dishSearch(el) {
    ui.dishQ = el.value;
    const q = ui.dishQ.trim().toLowerCase();
    const list = state.dishes.filter(d => (!q || d.name.toLowerCase().includes(q)) &&
      (ui.dishMeal === 'all' || (ui.dishMeal === 'sea' ? isSeafood(d) : d.meals.includes(ui.dishMeal))));
    $('#dish-grid').innerHTML = dishCards(list);
    saveUI();
  },
  edName(el) { ed.d.name = el.value; },
  edQty(el) {
    ed.d.ing[Number(el.dataset.i)].qty = Math.max(0, Number(el.value.replace(',', '.')) || 0);
    $('#ed-nutr').innerHTML = editorNutr();
  },
  edSearch(el) { ed.q = el.value; $('#ed-suggest').innerHTML = edSuggest(); },
  np(el) { ed.np[el.dataset.k] = el.value; },
  exp(el) { exp[el.dataset.k] = el.value; },
  pantrySearch(el) { pq = el.value; $('#pantry-list').innerHTML = pantryAddList(); },
};

const CHANGE = {
  np(el) { ed.np[el.dataset.k] = el.value; refreshSheet(); },
  setName(el) { const v = el.value.trim(); if (v) state.settings.names[el.dataset.p] = v; update(); },
  setGoal(el) {
    const v = Math.max(0, Math.round(Number(el.value) || 0));
    state.settings.goals[el.dataset.p][el.dataset.k] = v; update();
  },
  importData(el) {
    const f = el.files && el.files[0];
    if (!f) return;
    f.text().then(txt => {
      const data = JSON.parse(txt);
      if (!data || !Array.isArray(data.dishes) || typeof data.plans !== 'object') throw new Error('bad');
      confirmSheet('Загрузить копию?', 'Текущие данные на телефоне заменятся данными из файла.', 'Загрузить', () => {
        replaceState(data); invalidateProducts(); render(); toast('Копия загружена');
      }, false);
    }).catch(() => toast('Не получилось прочитать файл'));
  },
};

document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const f = A[el.dataset.act];
  if (f) { ev.preventDefault(); f(el, ev); }
});
document.addEventListener('input', ev => {
  const el = ev.target;
  if (el.dataset && el.dataset.input && INPUT[el.dataset.input]) INPUT[el.dataset.input](el);
});
document.addEventListener('change', ev => {
  const el = ev.target;
  if (el.dataset && el.dataset.change && CHANGE[el.dataset.change]) CHANGE[el.dataset.change](el);
});
document.addEventListener('keydown', ev => {
  if (ev.key === 'Enter' && ev.target.dataset && ev.target.dataset.enter) {
    ev.preventDefault();
    A[ev.target.dataset.enter]();
  }
  if (ev.key === 'Escape') closeSheet();
});

// Обновить «сегодня», если приложение долго висело в фоне
let lastDay = iso(today());
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && iso(today()) !== lastDay) { lastDay = iso(today()); scrollToToday = true; render(); }
});

render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
