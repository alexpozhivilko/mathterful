// Справочник продуктов, отделы супермаркета и стартовые блюда.
// КБЖУ — на 100 г (для штучных товаров w = вес одной штуки в граммах).

export const CATS = {
  veg:    { name: 'Овощи и зелень',        emoji: '🥬' },
  fruit:  { name: 'Фрукты',                emoji: '🍎' },
  dairy:  { name: 'Молочное, яйца, тофу',  emoji: '🧀' },
  fish:   { name: 'Рыба и морепродукты',   emoji: '🐟' },
  bread:  { name: 'Хлеб и выпечка',        emoji: '🥖' },
  grain:  { name: 'Крупы и макароны',      emoji: '🌾' },
  canned: { name: 'Консервы и бобовые',    emoji: '🥫' },
  sauce:  { name: 'Соусы и пасты',         emoji: '🫙' },
  spice:  { name: 'Масла и специи',        emoji: '🧂' },
  nuts:   { name: 'Орехи и сладкое',       emoji: '🥜' },
  frozen: { name: 'Замороженное',          emoji: '🧊' },
  drinks: { name: 'Чай и кофе',            emoji: '☕' },
  other:  { name: 'Другое',                emoji: '🛍️' },
};
export const CAT_ORDER = Object.keys(CATS);

// [id, название, отдел, ед., вес шт., ккал, Б, Ж, У, флаги (P — кладовка, S — морепродукт), подпись ед.]
const RAW_PRODUCTS = [
  ['tomato', 'Помидоры', 'veg', 'g', 0, 18, 0.9, 0.2, 3.9],
  ['cucumber', 'Огурцы', 'veg', 'g', 0, 15, 0.7, 0.1, 3.6],
  ['bellpep', 'Болгарский перец', 'veg', 'g', 0, 27, 1, 0.3, 6],
  ['onion', 'Лук репчатый', 'veg', 'pcs', 100, 40, 1.1, 0.1, 9.3],
  ['garlic', 'Чеснок', 'veg', 'pcs', 5, 149, 6.4, 0.5, 33, '', 'зуб.'],
  ['carrot', 'Морковь', 'veg', 'pcs', 80, 41, 0.9, 0.2, 9.6],
  ['potato', 'Картофель', 'veg', 'g', 0, 77, 2, 0.1, 17],
  ['sweetpot', 'Батат', 'veg', 'g', 0, 86, 1.6, 0.1, 20],
  ['zucchini', 'Кабачки', 'veg', 'g', 0, 17, 1.2, 0.3, 3.1],
  ['eggplant', 'Баклажаны', 'veg', 'g', 0, 25, 1, 0.2, 6],
  ['broccoli', 'Брокколи', 'veg', 'g', 0, 34, 2.8, 0.4, 7],
  ['cauli', 'Цветная капуста', 'veg', 'g', 0, 25, 1.9, 0.3, 5],
  ['cabbage', 'Капуста белокочанная', 'veg', 'g', 0, 25, 1.3, 0.1, 5.8],
  ['spinach', 'Шпинат', 'veg', 'g', 0, 23, 2.9, 0.4, 3.6],
  ['lettuce', 'Салат листовой', 'veg', 'g', 0, 15, 1.4, 0.2, 2.9],
  ['mushroom', 'Шампиньоны', 'veg', 'g', 0, 22, 3.1, 0.3, 3.3],
  ['greens', 'Зелень (укроп, петрушка)', 'veg', 'g', 0, 36, 3, 0.8, 6],
  ['avocado', 'Авокадо', 'veg', 'pcs', 150, 160, 2, 15, 9],
  ['lemon', 'Лимон', 'veg', 'pcs', 100, 29, 1.1, 0.3, 9],
  ['beet', 'Свёкла', 'veg', 'g', 0, 43, 1.6, 0.2, 10],
  ['pumpkin', 'Тыква', 'veg', 'g', 0, 26, 1, 0.1, 6.5],

  ['banana', 'Бананы', 'fruit', 'pcs', 120, 89, 1.1, 0.3, 23],
  ['apple', 'Яблоки', 'fruit', 'pcs', 180, 52, 0.3, 0.2, 14],
  ['orange', 'Апельсины', 'fruit', 'pcs', 180, 47, 0.9, 0.1, 12],

  ['eggs', 'Яйца', 'dairy', 'pcs', 55, 155, 13, 11, 1.1],
  ['milk', 'Молоко', 'dairy', 'ml', 0, 52, 3, 2.5, 4.7],
  ['tvorog', 'Творог 5%', 'dairy', 'g', 0, 121, 17, 5, 1.8],
  ['cottage', 'Коттедж 3%', 'dairy', 'g', 0, 75, 11, 3, 2],
  ['yogurt', 'Греческий йогурт', 'dairy', 'g', 0, 66, 9, 2, 4],
  ['kefir', 'Кефир', 'dairy', 'ml', 0, 41, 3, 1, 4],
  ['cheese', 'Сыр твёрдый', 'dairy', 'g', 0, 350, 25, 27, 1],
  ['feta', 'Фета', 'dairy', 'g', 0, 264, 14, 21, 4],
  ['mozz', 'Моцарелла', 'dairy', 'g', 0, 254, 24, 16, 2.8],
  ['labane', 'Лабане', 'dairy', 'g', 0, 160, 8, 12, 4],
  ['smetana', 'Сметана 15%', 'dairy', 'g', 0, 158, 2.6, 15, 3],
  ['tofu', 'Тофу', 'dairy', 'g', 0, 76, 8, 4.8, 1.9],
  ['butter', 'Сливочное масло', 'dairy', 'g', 0, 717, 0.9, 81, 0.1, 'P'],

  ['salmon', 'Лосось (филе)', 'fish', 'g', 0, 208, 20, 13, 0],
  ['whitefish', 'Белая рыба (филе)', 'fish', 'g', 0, 82, 18, 0.7, 0],
  ['tuna', 'Тунец консервированный', 'fish', 'g', 0, 116, 26, 1, 0],
  ['shrimp', 'Креветки', 'fish', 'g', 0, 99, 24, 0.3, 0.2, 'S'],
  ['squid', 'Кальмары', 'fish', 'g', 0, 92, 16, 1.4, 3, 'S'],

  ['bread', 'Хлеб цельнозерновой', 'bread', 'g', 0, 250, 13, 3.5, 41],
  ['pita', 'Пита', 'bread', 'pcs', 80, 275, 9, 1.2, 55],
  ['tortilla', 'Тортильи', 'bread', 'pcs', 60, 300, 8, 8, 50],
  ['ricecake', 'Хлебцы', 'bread', 'g', 0, 380, 8, 3, 80],

  ['rice', 'Рис', 'grain', 'g', 0, 344, 7, 0.7, 78, 'P'],
  ['buckwheat', 'Гречка', 'grain', 'g', 0, 313, 12.6, 3.3, 62, 'P'],
  ['pasta', 'Макароны', 'grain', 'g', 0, 350, 12, 1.5, 72, 'P'],
  ['oats', 'Овсяные хлопья', 'grain', 'g', 0, 370, 13, 6.5, 60, 'P'],
  ['bulgur', 'Булгур', 'grain', 'g', 0, 342, 12, 1.3, 76, 'P'],
  ['quinoa', 'Киноа', 'grain', 'g', 0, 368, 14, 6, 64, 'P'],
  ['couscous', 'Кус-кус', 'grain', 'g', 0, 376, 13, 0.6, 77, 'P'],
  ['lentils', 'Чечевица красная', 'grain', 'g', 0, 318, 24, 1.5, 53, 'P'],
  ['flour', 'Мука', 'grain', 'g', 0, 364, 10, 1, 76, 'P'],
  ['granola', 'Гранола', 'grain', 'g', 0, 450, 10, 18, 64],

  ['chickpeas', 'Нут консервированный', 'canned', 'g', 0, 139, 7, 2.6, 22],
  ['beans', 'Фасоль консервированная', 'canned', 'g', 0, 100, 7, 0.5, 17],
  ['cantom', 'Томаты в собственном соку', 'canned', 'g', 0, 32, 1.6, 0.2, 5.5],
  ['corn', 'Кукуруза консервированная', 'canned', 'g', 0, 86, 3.3, 1.2, 19],

  ['hummus', 'Хумус', 'sauce', 'g', 0, 240, 7, 18, 13],
  ['tahini', 'Тхина', 'sauce', 'g', 0, 595, 17, 54, 21, 'P'],
  ['tompaste', 'Томатная паста', 'sauce', 'g', 0, 82, 4.3, 0.5, 19, 'P'],
  ['soy', 'Соевый соус', 'sauce', 'ml', 0, 53, 8, 0.6, 5, 'P'],
  ['pb', 'Арахисовая паста', 'sauce', 'g', 0, 588, 25, 50, 20, 'P'],

  ['olive', 'Оливковое масло', 'spice', 'ml', 0, 884, 0, 100, 0, 'P'],
  ['oil', 'Растительное масло', 'spice', 'ml', 0, 884, 0, 100, 0, 'P'],
  ['salt', 'Соль', 'spice', 'g', 0, 0, 0, 0, 0, 'P'],
  ['blackpep', 'Перец чёрный молотый', 'spice', 'g', 0, 251, 10, 3, 64, 'P'],
  ['paprika', 'Паприка', 'spice', 'g', 0, 282, 14, 13, 54, 'P'],
  ['cumin', 'Зира', 'spice', 'g', 0, 375, 18, 22, 44, 'P'],
  ['sugar', 'Сахар', 'spice', 'g', 0, 387, 0, 0, 100, 'P'],
  ['honey', 'Мёд', 'spice', 'g', 0, 304, 0.3, 0, 82, 'P'],

  ['walnut', 'Грецкие орехи', 'nuts', 'g', 0, 654, 15, 65, 14, 'P'],
  ['almond', 'Миндаль', 'nuts', 'g', 0, 579, 21, 50, 22, 'P'],
  ['dates', 'Финики', 'nuts', 'g', 0, 282, 2.5, 0.4, 75],
  ['choco', 'Тёмный шоколад', 'nuts', 'g', 0, 546, 5, 31, 61],

  ['berries', 'Ягоды замороженные', 'frozen', 'g', 0, 50, 0.7, 0.3, 12],
  ['peas', 'Зелёный горошек', 'frozen', 'g', 0, 81, 5.4, 0.4, 14],
  ['vegmix', 'Овощная смесь', 'frozen', 'g', 0, 50, 2.5, 0.4, 9],

  ['coffee', 'Кофе', 'drinks', 'g', 0, 0, 0, 0, 0, 'P'],
  ['tea', 'Чай', 'drinks', 'g', 0, 0, 0, 0, 0, 'P'],
];

export const PRODUCTS = RAW_PRODUCTS.map(([id, name, cat, unit, w, kcal, p, f, c, flags = '', ul]) => ({
  id, name, cat, unit, w, kcal, p, f, c,
  staple: flags.includes('P'),
  seafood: flags.includes('S'),
  ul: ul || null,
}));

// Блюда: [id, название, эмодзи, приёмы пищи (b/l/d/s), можно на несколько дней, ингредиенты на 1 порцию]
const RAW_DISHES = [
  // Завтраки
  ['omelet', 'Омлет с овощами', '🍳', 'bd', false, [['eggs', 2], ['milk', 50], ['tomato', 80], ['spinach', 40], ['cheese', 15], ['olive', 5]]],
  ['shakshuka', 'Шакшука', '🍳', 'bld', false, [['eggs', 2], ['cantom', 200], ['bellpep', 80], ['onion', 0.5], ['garlic', 1], ['olive', 7], ['paprika', 2], ['bread', 40]]],
  ['oatmeal', 'Овсянка с ягодами', '🥣', 'b', false, [['oats', 50], ['milk', 150], ['berries', 80], ['honey', 10], ['walnut', 10]]],
  ['tvorogban', 'Творог с бананом и мёдом', '🍌', 'bs', false, [['tvorog', 180], ['banana', 1], ['honey', 10]]],
  ['yogbowl', 'Йогурт с гранолой и ягодами', '🫐', 'bs', false, [['yogurt', 200], ['granola', 35], ['berries', 60]]],
  ['syrniki', 'Сырники со сметаной', '🥞', 'b', false, [['tvorog', 180], ['eggs', 1], ['flour', 30], ['sugar', 10], ['oil', 7], ['smetana', 30]]],
  ['avotoast', 'Тост с авокадо и яйцом', '🥑', 'b', false, [['bread', 60], ['avocado', 0.5], ['eggs', 2], ['tomato', 50]]],
  ['labtoast', 'Тосты с лабане и овощами', '🥪', 'bs', false, [['bread', 60], ['labane', 50], ['cucumber', 100], ['tomato', 100], ['olive', 5]]],
  ['protpanc', 'Овсяные панкейки с творогом', '🥞', 'b', false, [['oats', 40], ['tvorog', 100], ['eggs', 1], ['banana', 0.5], ['oil', 5]]],

  // Супы и блюда на несколько дней
  ['lentsoup', 'Чечевичный суп', '🍲', 'ld', true, [['lentils', 70], ['carrot', 0.5], ['onion', 0.5], ['cantom', 80], ['olive', 7], ['cumin', 1], ['lemon', 0.2]]],
  ['vegsoup', 'Овощной суп с фасолью', '🥣', 'ld', true, [['potato', 120], ['carrot', 0.5], ['onion', 0.5], ['zucchini', 100], ['cabbage', 80], ['beans', 80], ['greens', 10], ['oil', 5]]],
  ['pumpsoup', 'Тыквенный крем-суп', '🎃', 'ld', true, [['pumpkin', 250], ['onion', 0.5], ['carrot', 0.5], ['smetana', 20], ['olive', 7], ['bread', 30]]],
  ['borsch', 'Борщ с фасолью', '🍲', 'ld', true, [['beet', 100], ['cabbage', 100], ['potato', 80], ['carrot', 0.5], ['onion', 0.5], ['tompaste', 15], ['beans', 70], ['garlic', 1], ['oil', 5], ['smetana', 20]]],
  ['chickstew', 'Рагу из нута с овощами', '🥘', 'ld', true, [['chickpeas', 150], ['zucchini', 100], ['eggplant', 100], ['bellpep', 70], ['cantom', 100], ['onion', 0.5], ['olive', 10], ['rice', 50]]],
  ['buckmush', 'Гречка с грибами и яйцом', '🍄', 'ld', true, [['buckwheat', 70], ['mushroom', 150], ['onion', 0.5], ['eggs', 1], ['oil', 7]]],
  ['vegplov', 'Плов с нутом', '🍚', 'ld', true, [['rice', 80], ['carrot', 1], ['onion', 0.5], ['chickpeas', 100], ['garlic', 2], ['cumin', 1], ['oil', 10]]],
  ['casserole', 'Творожная запеканка', '🍰', 'bsd', true, [['tvorog', 200], ['eggs', 1], ['flour', 20], ['sugar', 10], ['yogurt', 30]]],

  // Обеды и ужины
  ['pastamozz', 'Паста с томатами и моцареллой', '🍝', 'ld', false, [['pasta', 80], ['cantom', 150], ['mozz', 50], ['garlic', 1], ['olive', 7], ['greens', 5]]],
  ['salmonrice', 'Лосось с рисом и брокколи', '🐟', 'ld', false, [['salmon', 150], ['rice', 60], ['broccoli', 150], ['soy', 10], ['lemon', 0.2], ['olive', 5]]],
  ['fishbatat', 'Белая рыба с запечённым бататом', '🐠', 'ld', false, [['whitefish', 180], ['sweetpot', 200], ['olive', 8], ['greens', 5], ['lemon', 0.2]]],
  ['tunasalad', 'Салат с тунцом и яйцом', '🥗', 'ld', false, [['tuna', 120], ['lettuce', 80], ['cucumber', 100], ['tomato', 100], ['eggs', 1], ['corn', 50], ['olive', 8]]],
  ['tofubowl', 'Боул с киноа и тофу', '🥙', 'ld', false, [['quinoa', 60], ['tofu', 150], ['avocado', 0.3], ['cucumber', 80], ['carrot', 0.5], ['soy', 15], ['oil', 5]]],
  ['pitahummus', 'Пита с хумусом и фетой', '🫓', 'ls', false, [['pita', 1], ['hummus', 60], ['feta', 30], ['tomato', 80], ['cucumber', 80]]],
  ['bakedveg', 'Запечённые овощи с фетой', '🫑', 'd', false, [['eggplant', 150], ['zucchini', 150], ['bellpep', 100], ['feta', 50], ['garlic', 1], ['olive', 10]]],
  ['tofustir', 'Тофу стир-фрай с рисом', '🥢', 'ld', false, [['tofu', 180], ['broccoli', 120], ['bellpep', 80], ['carrot', 0.5], ['garlic', 1], ['soy', 15], ['rice', 60], ['oil', 7]]],
  ['frittata', 'Фриттата с брокколи', '🥚', 'bd', false, [['eggs', 3], ['broccoli', 120], ['cheese', 20], ['milk', 30], ['onion', 0.25], ['oil', 5]]],
  ['burrito', 'Буррито с фасолью', '🌯', 'ld', false, [['tortilla', 1], ['beans', 120], ['corn', 50], ['cheese', 30], ['tomato', 80], ['bellpep', 50], ['yogurt', 30]]],
  ['caulitahini', 'Цветная капуста с тхиной и нутом', '🥦', 'd', false, [['cauli', 300], ['chickpeas', 100], ['tahini', 25], ['olive', 8], ['lemon', 0.2], ['greens', 5]]],
  ['greek', 'Греческий салат', '🥗', 'lds', false, [['cucumber', 150], ['tomato', 150], ['bellpep', 80], ['feta', 60], ['onion', 0.25], ['olive', 10]]],
  ['couscousveg', 'Кус-кус с овощами и яйцом', '🍛', 'ld', false, [['couscous', 60], ['zucchini', 100], ['bellpep', 80], ['eggs', 2], ['olive', 8], ['greens', 5]]],
  ['bulgursalad', 'Табуле с булгуром и сыром', '🌿', 'ld', false, [['bulgur', 60], ['tomato', 120], ['cucumber', 100], ['greens', 20], ['lemon', 0.3], ['olive', 8], ['cottage', 150]]],

  // Только для меня — с морепродуктами
  ['shrimppasta', 'Паста с креветками и чесноком', '🍤', 'ld', false, [['shrimp', 150], ['pasta', 80], ['tomato', 100], ['garlic', 2], ['olive', 10], ['lemon', 0.2], ['greens', 5]]],
  ['squidveg', 'Кальмары с овощами и рисом', '🦑', 'd', false, [['squid', 200], ['bellpep', 100], ['zucchini', 100], ['soy', 15], ['rice', 50], ['oil', 8]]],
  ['shrimpsalad', 'Салат с креветками и авокадо', '🍤', 'ld', false, [['shrimp', 150], ['lettuce', 80], ['avocado', 0.5], ['tomato', 100], ['cucumber', 80], ['lemon', 0.2], ['olive', 5]]],

  // Перекусы
  ['applepb', 'Яблоко с арахисовой пастой', '🍎', 's', false, [['apple', 1], ['pb', 20]]],
  ['nutsdates', 'Миндаль и финики', '🥜', 's', false, [['almond', 25], ['dates', 30]]],
  ['cottagecuc', 'Коттедж с огурцом и хлебцами', '🥒', 's', false, [['cottage', 200], ['cucumber', 120], ['ricecake', 20]]],
  ['kefirban', 'Кефир и банан', '🥛', 's', false, [['kefir', 250], ['banana', 1]]],
  ['ricehummus', 'Хлебцы с хумусом', '🍘', 's', false, [['ricecake', 25], ['hummus', 50], ['tomato', 80]]],
  ['boiledeggs', 'Варёные яйца с овощами', '🥚', 's', false, [['eggs', 2], ['cucumber', 100], ['tomato', 80]]],
  ['orangeyog', 'Апельсин и йогурт', '🍊', 's', false, [['orange', 1], ['yogurt', 150]]],
  ['chocolate', 'Тёмный шоколад', '🍫', 's', false, [['choco', 20]]],
];

export const DISHES = RAW_DISHES.map(([id, name, emoji, meals, batch, ing]) => ({
  id, name, emoji,
  meals: meals.split(''),
  batch,
  ing: ing.map(([pid, qty]) => ({ pid, qty })),
}));

export const MEALS = [
  { id: 'b', name: 'Завтрак', emoji: '☀️' },
  { id: 'l', name: 'Обед', emoji: '🍲' },
  { id: 'd', name: 'Ужин', emoji: '🌙' },
  { id: 's', name: 'Перекусы', emoji: '🍏' },
];

export const DISH_EMOJIS = ['🍳', '🥣', '🥞', '🥑', '🥪', '🍲', '🥘', '🍝', '🍚', '🍛', '🥗', '🥙', '🌯', '🫓', '🐟', '🐠', '🍤', '🦑', '🥦', '🍄', '🫑', '🎃', '🥕', '🍅', '🧀', '🥚', '🍰', '🍌', '🍎', '🍊', '🫐', '🥜', '🍫', '🥛', '🍕', '🥧'];

// Эмодзи продуктов (если нет — берётся эмодзи отдела)
export const PRODUCT_EMOJI = {
  tomato: '🍅', cucumber: '🥒', bellpep: '🫑', onion: '🧅', garlic: '🧄', carrot: '🥕', potato: '🥔', sweetpot: '🍠',
  eggplant: '🍆', broccoli: '🥦', cauli: '🥦', cabbage: '🥬', spinach: '🥬', lettuce: '🥬', mushroom: '🍄', greens: '🌿',
  avocado: '🥑', lemon: '🍋', pumpkin: '🎃', banana: '🍌', apple: '🍎', orange: '🍊', eggs: '🥚', milk: '🥛', kefir: '🥛',
  cheese: '🧀', feta: '🧀', mozz: '🧀', butter: '🧈', salmon: '🐟', whitefish: '🐟', tuna: '🐟', shrimp: '🍤', squid: '🦑',
  bread: '🍞', pita: '🫓', tortilla: '🫓', rice: '🍚', pasta: '🍝', oats: '🥣', corn: '🌽', chickpeas: '🫘', beans: '🫘',
  cantom: '🥫', hummus: '🫙', honey: '🍯', salt: '🧂', olive: '🫒', oil: '🌻', walnut: '🌰', almond: '🥜', pb: '🥜',
  choco: '🍫', berries: '🫐', peas: '🫛', coffee: '☕', tea: '🍵', dates: '🌴', sugar: '🍬', lentils: '🫘', flour: '🌾',
};
