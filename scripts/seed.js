/**
 * Seed script for MCPanel database
 * Reads products.json base data and generates 500+ products via variations
 * 
 * Usage: node scripts/seed.js
 */

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'mcpanel.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'lib', 'schema.sql');
const DATA_PATH = path.join(__dirname, 'data', 'products.json');

// ─── Helpers ──────────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDatetime(date) {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

function formatMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Ukrainian names for customers
const FIRST_NAMES = [
  'Олександр', 'Андрій', 'Максим', 'Ігор', 'Дмитро', 'Сергій', 'Віктор', 'Олег', 'Юрій', 'Михайло',
  'Наталія', 'Олена', 'Ірина', 'Тетяна', 'Юлія', 'Марія', 'Анна', 'Катерина', 'Світлана', 'Вікторія',
  'Богдан', 'Артем', 'Роман', 'Василь', 'Петро', 'Антон', 'Ярослав', 'Тарас', 'Назар', 'Данило',
  'Оксана', 'Людмила', 'Дарія', 'Аліна', 'Софія', 'Діана', 'Валерія', 'Христина', 'Зоряна', 'Лариса'
];

const LAST_NAMES = [
  'Шевченко', 'Бондаренко', 'Ткаченко', 'Коваленко', 'Мельник', 'Кравченко', 'Олійник', 'Савченко',
  'Поліщук', 'Козак', 'Лисенко', 'Бойко', 'Марченко', 'Іваненко', 'Петренко', 'Григоренко',
  'Сидоренко', 'Власенко', 'Романенко', 'Тимошенко', 'Кириченко', 'Мороз', 'Пономаренко', 'Гончаренко',
  'Демченко', 'Левченко', 'Руденко', 'Шевчук', 'Литвиненко', 'Пилипенко'
];

// ─── Product variation generators ────────────────────────────

const FLAVORS_GEL = ['апельсин', 'лимон', 'лісова ягода', 'малина', 'банан', 'кола', 'ваніль', 'м\'ятний',
  'полуниця', 'грейпфрут', 'вишня', 'ананас', 'манго', 'кавун', 'нейтральний', 'тропічний'];
const FLAVORS_BAR = ['шоколад', 'горіх', 'карамель', 'кокос', 'банан', 'ваніль', 'журавлина',
  'яблуко-кориця', 'червоні ягоди', 'полуниця', 'тирамісу', 'абрикос', 'лимон-імбир'];
const FLAVORS_DRINK = ['апельсин', 'лимон-лайм', 'смородина', 'тропік', 'ягідний мікс', 'персик', 'грейпфрут', 'кола'];
const SIZES_VITAMIN = ['30 капсул', '60 капсул', '90 капсул', '100 капсул', '120 капсул', '180 капсул', '250 таблеток'];
const DOSAGES = ['250мг', '500мг', '1000мг', '2000мг'];

// Extended product templates for generation
const EXTRA_PRODUCTS = [
  // More Gels
  ...generateVariations('Гель енергетичний GU Energy Gel ({flavor}) 32г', FLAVORS_GEL.slice(0, 8), 'GU Energy', 'Гелі енергетичні', 'GU Sports Nutrition', [115, 165]),
  ...generateVariations('Гель SiS Go Energy ({flavor}) 60мл', FLAVORS_GEL.slice(0, 6), 'Science In Sport (SIS)', 'Гелі енергетичні', 'SIS Distribution', [95, 135]),
  ...generateVariations('Гель Enervit C2:1PRO ({flavor}) 60мл', FLAVORS_GEL.slice(0, 5), 'Enervit', 'Гелі енергетичні', 'Euro Nutrition', [135, 175]),
  ...generateVariations('Гель 226ERS High Energy ({flavor}) 76г', FLAVORS_GEL.slice(0, 5), '226ERS', 'Гелі енергетичні', '226ERS SL', [125, 165]),
  ...generateVariations('Гель Sponser Liquid Energy ({flavor}) 35г', FLAVORS_GEL.slice(0, 4), 'Sponser', 'Гелі енергетичні', 'Sponser Sport Food', [145, 195]),
  ...generateVariations('Гель NUTREND Enduro Snack ({flavor}) 75г', FLAVORS_GEL.slice(0, 4), 'NUTREND', 'Гелі енергетичні', 'Nutrend D.S.', [75, 105]),

  // More Electrolytes
  ...generateVariations('Ізотонік SiS Hydro ({flavor}) 20 таблеток', FLAVORS_DRINK.slice(0, 6), 'Science In Sport (SIS)', 'Електроліти (гідратація)', 'SIS Distribution', [380, 520]),
  ...generateVariations('Ізотонік Sponser Electrolytes ({flavor}) 10 таблеток', FLAVORS_DRINK.slice(0, 4), 'Sponser', 'Електроліти (гідратація)', 'Sponser Sport Food', [290, 380]),
  ...generateVariations('Електролітний напій NUTREND Isodrinx ({flavor}) 420г', FLAVORS_DRINK.slice(0, 5), 'NUTREND', 'Електроліти (гідратація)', 'Nutrend D.S.', [485, 625]),
  ...generateVariations('Електроліти 226ERS Sub9 Salts ({flavor}) 100 капсул', ['нейтральний', 'лимон', 'арбуз'], '226ERS', 'Електроліти (гідратація)', '226ERS SL', [890, 1150]),
  ...generateVariations('Hydria Recovery ({flavor}) 10 стіків', ['мандарин', 'ягідний', 'лимон', 'нейтральний'], 'Hydria', 'Електроліти (гідратація)', 'Hydria Ukraine', [680, 890]),

  // More Bars
  ...generateVariations('Батончик GU Energy Stroopwafel ({flavor}) 32г', FLAVORS_BAR.slice(0, 6), 'GU Energy', 'Енергетичні батончики', 'GU Sports Nutrition', [105, 145]),
  ...generateVariations('Батончик 226ERS Endurance ({flavor}) 60г', FLAVORS_BAR.slice(0, 5), '226ERS', 'Енергетичні батончики', '226ERS SL', [115, 155]),
  ...generateVariations('Батончик Enervit Power Sport ({flavor}) 60г', FLAVORS_BAR.slice(0, 4), 'Enervit', 'Енергетичні батончики', 'Euro Nutrition', [95, 130]),
  ...generateVariations('Батончик NUTREND Excelent Protein ({flavor}) 85г', FLAVORS_BAR.slice(0, 6), 'NUTREND', 'Енергетичні батончики', 'Nutrend D.S.', [105, 135]),
  ...generateVariations('Батончик Sponser Protein Low Carb ({flavor}) 50г', FLAVORS_BAR.slice(0, 4), 'Sponser', 'Енергетичні батончики', 'Sponser Sport Food', [135, 175]),

  // Carb Drinks
  ...generateVariations('Вуглеводний напій SiS Go Energy ({flavor}) 1.6кг', FLAVORS_DRINK.slice(0, 4), 'Science In Sport (SIS)', 'Вуглеводні напої', 'SIS Distribution', [1850, 2350]),
  ...generateVariations('Вуглеводний напій Sponser Competition ({flavor}) 1кг', FLAVORS_DRINK.slice(0, 5), 'Sponser', 'Вуглеводні напої', 'Sponser Sport Food', [1450, 1850]),
  ...generateVariations('Вуглеводний напій 226ERS Energy Drink ({flavor}) 1кг', FLAVORS_DRINK.slice(0, 3), '226ERS', 'Вуглеводні напої', '226ERS SL', [1650, 2100]),
  ...generateVariations('Напій NUTREND Carbosnack ({flavor}) 500мл', FLAVORS_DRINK.slice(0, 4), 'NUTREND', 'Вуглеводні напої', 'Nutrend D.S.', [165, 225]),

  // Recovery
  ...generateVariations('Відновлювальний напій SiS REGO ({flavor}) 500г', ['шоколад', 'ваніль', 'полуниця', 'банан'], 'Science In Sport (SIS)', 'Відновлювальні напої', 'SIS Distribution', [1050, 1350]),
  ...generateVariations('Відновлення 226ERS Recovery ({flavor}) 1кг', ['шоколад', 'ваніль', 'полуниця'], '226ERS', 'Відновлювальні напої', '226ERS SL', [1850, 2250]),
  ...generateVariations('Казеїн NUTREND Micellar Casein ({flavor}) 900г', ['шоколад', 'ваніль', 'банан'], 'NUTREND', 'Відновлювальні напої', 'Nutrend D.S.', [1650, 2050]),

  // Pre-workout
  ...generateVariations('Передтренувальний NUTREND N1 ({flavor}) 510г', ['блакитна малина', 'кавун', 'апельсин', 'грейпфрут', 'тропік'], 'NUTREND', 'Передтренувальні комплекси', 'Nutrend D.S.', [1150, 1450]),
  ...generateVariations('Кофеїн Sponser Caffeine Caps ({size})', ['100мг 90 капсул', '200мг 90 капсул'], 'Sponser', 'Передтренувальні комплекси', 'Sponser Sport Food', [485, 695]),

  // Protein
  ...generateVariations('Протеїн SiS Whey Protein ({flavor}) 1кг', ['шоколад', 'ваніль', 'полуниця'], 'Science In Sport (SIS)', 'Протеїнові добавки', 'SIS Distribution', [1950, 2450]),
  ...generateVariations('Сироватковий протеїн NUTREND 100% Whey ({flavor}) 1кг', ['шоколад', 'ваніль', 'карамель', 'полуниця', 'банан', 'кокос'], 'NUTREND', 'Протеїнові добавки', 'Nutrend D.S.', [1350, 1750]),
  ...generateVariations('Протеїн Olimp Natural Whey ({flavor}) 700г', ['шоколад', 'ваніль', 'полуниця', 'банан'], 'Olimp', 'Протеїнові добавки', 'Euro Nutrition', [1150, 1450]),

  // Creatine
  ...generateVariations('Креатин NUTREND Creatine Monohydrate ({size})', ['150г', '300г', '500г'], 'NUTREND', 'Креатин', 'Nutrend D.S.', [285, 785]),
  ...generateVariations('Креатин NOW FOODS ({size})', ['227г', '600г', '750мг 120 капсул'], 'NOW FOODS', 'Креатин', 'NOW International', [395, 895]),

  // Vitamins — extended
  ...generateVariations('Вітамін C NOW FOODS ({dosage}), 100 капсул', DOSAGES, 'NOW FOODS', 'Вітаміни', 'NOW International', [295, 695]),
  ...generateVariations('Вітамін D3 NOW FOODS ({dosage}), 120 софтгелів', ['1000 IU', '2000 IU', '5000 IU', '10000 IU'], 'NOW FOODS', 'Вітаміни', 'NOW International', [355, 895]),
  ...generateVariations('Мультивітаміни NOW FOODS ({variant})', ['Adam чоловічі 60 таб', 'Eve жіночі 90 таб', 'Daily Vits 100 таб', 'Mega Multi 60 капсул'], 'NOW FOODS', 'Вітаміни', 'NOW International', [555, 1250]),
  ...generateVariations('Вітамін B-Complex NOW FOODS ({variant})', ['B-50 100 капсул', 'B-100 100 капсул', 'Co-Enzyme B-Complex 60 капсул'], 'NOW FOODS', 'Вітаміни', 'NOW International', [485, 895]),
  ...generateVariations('Вітамін E NOW FOODS ({dosage}), 100 софтгелів', ['200 IU', '400 IU', '1000 IU'], 'NOW FOODS', 'Вітаміни', 'NOW International', [395, 985]),
  ...generateVariations('Вітамін K2 ({brand}), 100мкг, 60 капсул', ['NOW FOODS', 'Solgar', 'Doctor\'s Best'], null, 'Вітаміни', 'Vitamin Distribution UA', [455, 895]),
  ...generateVariations('Куркумін NOW FOODS ({variant})', ['500мг 60 капсул', 'Phytosome 60 капсул', 'Bio 30 софтгелів'], 'NOW FOODS', 'Вітаміни', 'NOW International', [495, 1350]),
  ...generateVariations('Коензим Q10 ({brand}) ({dosage}), 60 софтгелів', ['NOW FOODS', 'Solgar', 'Doctor\'s Best'], null, 'Вітаміни', 'Vitamin Distribution UA', [555, 1450], ['100мг', '200мг']),

  // Minerals
  ...generateVariations('Магній ({form}) NOW FOODS, 100 капсул', ['Citrate', 'Glycinate', 'Bisglycinate', 'Malate', 'L-Threonate'], 'NOW FOODS', 'Мікроелементи', 'NOW International', [385, 895]),
  ...generateVariations('Цинк ({brand}) ({dosage}), 100 капсул', ['NOW FOODS', 'Solgar', 'Life Extension'], null, 'Мікроелементи', 'Vitamin Distribution UA', [325, 695], ['15мг', '30мг', '50мг']),
  ...generateVariations('Кальцій NOW FOODS ({variant})', ['500мг+D3 90 таб', '1000мг+D3 180 таб', 'Citrate 100 таб'], 'NOW FOODS', 'Мікроелементи', 'NOW International', [395, 895]),
  ...generateVariations('Селен NOW FOODS ({dosage}), 100 капсул', ['100мкг', '200мкг'], 'NOW FOODS', 'Мікроелементи', 'NOW International', [325, 555]),
  ...generateVariations('Хром NOW FOODS ({dosage}), 100 капсул', ['200мкг', '500мкг'], 'NOW FOODS', 'Мікроелементи', 'NOW International', [295, 455]),
  ...generateVariations('Йод NOW FOODS ({dosage}), 60 таблеток', ['150мкг', '225мкг'], 'NOW FOODS', 'Мікроелементи', 'NOW International', [265, 395]),

  // Amino acids
  ...generateVariations('BCAA NOW FOODS ({variant})', ['120 капсул', '240 капсул', 'порошок 340г'], 'NOW FOODS', 'Амінокислоти', 'NOW International', [595, 1450]),
  ...generateVariations('L-Карнітин NOW FOODS ({variant})', ['500мг 60 капсул', '1000мг 50 таб', 'Liquid 473мл', '500мг 180 капсул'], 'NOW FOODS', 'Амінокислоти', 'NOW International', [495, 1250]),
  ...generateVariations('L-Глутамін ({brand}) ({variant})', ['NOW FOODS', 'Solgar', 'NUTREND'], null, 'Амінокислоти', 'Vitamin Distribution UA', [385, 995], ['500мг 60 капсул', '1000мг 120 капсул', 'порошок 300г']),
  ...generateVariations('Таурин NOW FOODS ({variant})', ['500мг 100 капсул', '1000мг 100 капсул', 'порошок 227г'], 'NOW FOODS', 'Амінокислоти', 'NOW International', [395, 695]),
  ...generateVariations('L-Аргінін NOW FOODS ({dosage}), 120 капсул', ['500мг', '1000мг'], 'NOW FOODS', 'Амінокислоти', 'NOW International', [495, 895]),
  ...generateVariations('Бета-Аланін NOW FOODS ({variant})', ['750мг 120 капсул', 'порошок 500г'], 'NOW FOODS', 'Амінокислоти', 'NOW International', [595, 1095]),

  // Omega
  ...generateVariations('Омега-3 ({brand}) ({variant})', ['NOW FOODS', 'Solgar', 'Life Extension', 'Swanson'], null, 'Омега', 'Vitamin Distribution UA', [495, 2350], ['60 софтгелів', '120 софтгелів', '180 софтгелів']),
  ...generateVariations('Omega-3 Fish Oil NOW FOODS ({strength})', ['1000мг 100 софтгелів', '1000мг 200 софтгелів', 'Ultra 180 софтгелів'], 'NOW FOODS', 'Омега', 'NOW International', [495, 1950]),

  // Collagen (new sub-category)
  ...generateVariations('Колаген NOW FOODS ({variant})', ['Type I&III 120 таб', 'Type II 60 капсул', 'Peptides порошок 227г'], 'NOW FOODS', 'Вітаміни', 'NOW International', [595, 1295]),
  ...generateVariations('Колаген Solgar ({variant})', ['Type II 60 капсул', 'Skin, Nails & Hair 120 таб'], 'Solgar', 'Вітаміни', 'Vitamin Distribution UA', [795, 1595]),

  // Accessories
  ...generateVariations('Фляга SiS ({variant})', ['800мл прозора', '600мл чорна', '1L для бігу', 'TT aero 750мл'], 'Science In Sport (SIS)', 'Фляги', 'SIS Distribution', [295, 595]),
  ...generateVariations('Фляга Hydrapak ({variant})', ['SoftFlask 250мл', 'SoftFlask 500мл', 'Flux 1L', 'Flux 1.5L', 'Stow 500мл'], 'RACE EXPERT', 'Фляги', 'Hydria Ukraine', [650, 1650]),
  ...generateVariations('Пояс для бігу ({variant})', ['Race Expert 2 фляги', 'Race Expert 4 фляги', 'Race Expert ultra'], 'RACE EXPERT', 'Сумочки та пояси', 'Hydria Ukraine', [750, 1450]),
  ...generateVariations('Жилет для бігу ({variant})', ['Race Expert 5L', 'Race Expert 10L', 'Race Expert 12L'], 'RACE EXPERT', 'Сумочки та пояси', 'Hydria Ukraine', [1950, 3450]),

  // More Bundles
  ...generateVariations('Набір харчування GU Energy для ({distance})', ['5 км', '10 км', '21 км', '42 км'], 'GU Energy', 'Набори', 'GU Sports Nutrition', [195, 1250], null, true),
  ...generateVariations('Набір гелів Enervit ({variant})', ['6 шт MIX', '12 шт MIX', 'C2:1PRO 8 шт'], 'Enervit', 'Набори', 'Euro Nutrition', [595, 1850], null, true),
  ...generateVariations('Набір електролітів PFH ({variant})', ['PH 500 + PH 1000', 'PH 1500 тріо', 'All-In-One Marathon'], 'PFH (Precision Fuel & Hydration)', 'Набори', 'PFH Direct', [895, 2350], null, true),
  ...generateVariations('Набір RACE EXPERT ({variant})', ['Старт 5км', 'Марафон базовий', 'Марафон PRO', 'Ультра 50км', 'Ультра 100км'], 'RACE EXPERT', 'Набори', 'Hydria Ukraine', [350, 2850], null, true),
  ...generateVariations('Набір вітамінів ({variant})', ['Біг базовий', 'Тріатлон PRO', 'Відновлення', 'Імунітет'], 'NOW FOODS', 'Набори', 'NOW International', [1250, 2850], null, true),

  // Beet It Sport
  ...generateVariations('Beet It Sport ({variant})', ['Nitrate 400 шот 70мл', 'Nitrate 3000 шот 250мл', 'Organic Beetroot Powder 210г'], 'Beet It Sport', 'Передтренувальні комплекси', 'SIS Distribution', [135, 1250]),

  // ─── ADDITIONAL PRODUCTS to reach 500+ ────────────────

  // More gel flavors per brand
  ...generateVariations('Гель з кофеїном GU Roctane ({flavor}) 32г', ['ваніль-апельсин', 'шоколад-кокос', 'вишня-лайм', 'пряний яблучний', 'тропічний фрукт', 'солона карамель'], 'GU Energy', 'Гелі енергетичні', 'GU Sports Nutrition', [145, 175]),
  ...generateVariations('Гель SiS Beta Fuel ({flavor}) 60мл', ['помаранч', 'малина-лимон', 'полуниця-лайм', 'яблуко', 'чорна смородина'], 'Science In Sport (SIS)', 'Гелі енергетичні', 'SIS Distribution', [139, 165]),
  ...generateVariations('Гель Sponser Liquid Energy Long ({flavor}) 70г', ['мигдаль-ваніль', 'солона карамель', 'лимон-м\'ята', 'нейтральний'], 'Sponser', 'Гелі енергетичні', 'Sponser Sport Food', [189, 235]),

  // More electrolyte variants
  ...generateVariations('Ізотонік NUTREND Isodrinx ({flavor}) 840г', ['апельсин', 'грейпфрут', 'лимон', 'лісова ягода', 'bitter lemon'], 'NUTREND', 'Електроліти (гідратація)', 'Nutrend D.S.', [750, 1050]),
  ...generateVariations('Електроліти Maurten Drink Mix ({variant})', ['160 коробка 18 шт', '320 коробка 14 шт', '160 CAF 100 коробка 18 шт'], 'Maurten', 'Електроліти (гідратація)', 'Maurten AB', [2850, 4250]),

  // More bar varieties
  ...generateVariations('Батончик SiS Whey Protein ({flavor}) 64г', ['шоколад-м\'ята', 'солона карамель', 'подвійний шоколад', 'ваніль', 'арахіс'], 'Science In Sport (SIS)', 'Енергетичні батончики', 'SIS Distribution', [115, 155]),
  ...generateVariations('Батончик Sponser Oat Pack ({flavor}) 60г', ['мигдаль-ваніль', 'банан-шоколад', 'ягідний мікс', 'мокко'], 'Sponser', 'Енергетичні батончики', 'Sponser Sport Food', [115, 155]),
  ...generateVariations('Батончик NUTREND Deluxe Protein ({flavor}) 60г', ['шоколадний захер', 'панакота', 'шоколад+горіх', 'полуничний чізкейк', 'ванільний пудинг', 'карамель фладжек'], 'NUTREND', 'Енергетичні батончики', 'Nutrend D.S.', [85, 125]),

  // More vitamins by different brands
  ...generateVariations('Вітамін C Solgar ({variant})', ['500мг 100 капсул', '1000мг 90 таблеток', 'Ester-C 500мг 100 капсул', '1000мг Rose Hips 100 таб'], 'Solgar', 'Вітаміни', 'Vitamin Distribution UA', [395, 1095]),
  ...generateVariations('Вітамін D3 Solgar ({variant})', ['1000 IU 100 софтгелів', '5000 IU 100 софтгелів', '10000 IU 120 софтгелів'], 'Solgar', 'Вітаміни', 'Vitamin Distribution UA', [455, 1195]),
  ...generateVariations('Мультивітаміни Solgar ({variant})', ['Male Multiple 60 таб', 'Female Multiple 60 таб', 'Omnium 90 таб'], 'Solgar', 'Вітаміни', 'Vitamin Distribution UA', [895, 1595]),
  ...generateVariations('Вітамін C Life Extension ({variant})', ['1000мг 60 таб', 'Buffered 1000мг 90 таб'], 'Life Extension', 'Вітаміни', 'Vitamin Distribution UA', [455, 795]),
  ...generateVariations('Мультивітаміни Life Extension ({variant})', ['Two-Per-Day 120 таб', 'Mix Capsules 360 капсул', 'One-Per-Day 60 таб'], 'Life Extension', 'Вітаміни', 'Vitamin Distribution UA', [895, 2295]),
  ...generateVariations('Глюкозамін + Хондроітин ({brand})', ['NOW FOODS 240 капсул', 'Solgar 120 таб', 'Doctor\'s Best 360 капсул'], null, 'Вітаміни', 'Vitamin Distribution UA', [895, 1895]),
  ...generateVariations('Пробіотик ({brand}) ({variant})', ['NOW FOODS', 'Swanson', 'Life Extension'], null, 'Вітаміни', 'Vitamin Distribution UA', [495, 1295], ['25 млрд 30 капсул', '50 млрд 60 капсул', '100 млрд 30 капсул']),

  // More minerals by different brands
  ...generateVariations('Магній Solgar ({variant})', ['Citrate 200мг 120 таб', 'Glycinate 400мг 120 таб', 'Chelated 100 таб'], 'Solgar', 'Мікроелементи', 'Vitamin Distribution UA', [595, 1095]),
  ...generateVariations('Залізо ({brand}) ({variant})', ['NOW FOODS', 'Solgar', 'Life Extension'], null, 'Мікроелементи', 'Vitamin Distribution UA', [295, 695], ['18мг 120 капсул', '36мг 90 капсул']),
  ...generateVariations('Калій NOW FOODS ({variant})', ['99мг 100 капсул', '99мг 250 капсул', 'Gluconate 100 таб'], 'NOW FOODS', 'Мікроелементи', 'NOW International', [275, 595]),
  ...generateVariations('Бор NOW FOODS ({variant})', ['3мг 100 капсул', '3мг 250 капсул'], 'NOW FOODS', 'Мікроелементи', 'NOW International', [215, 395]),

  // More omega varieties
  ...generateVariations('Омега-3-6-9 NOW FOODS ({variant})', ['100 софтгелів', '250 софтгелів'], 'NOW FOODS', 'Омега', 'NOW International', [595, 1495]),
  ...generateVariations('Масло криля ({brand})', ['NOW FOODS 60 софтгелів', 'Solgar 60 софтгелів', 'Life Extension 30 софтгелів'], null, 'Омега', 'Vitamin Distribution UA', [895, 1595]),

  // More amino acids
  ...generateVariations('L-Цистеїн NOW FOODS ({variant})', ['500мг 100 таблеток', 'NAC 600мг 100 капсул', 'NAC 1000мг 120 таблеток'], 'NOW FOODS', 'Амінокислоти', 'NOW International', [395, 1095]),
  ...generateVariations('L-Тирозин NOW FOODS ({variant})', ['500мг 120 капсул', '750мг Extra Strength 90 капсул'], 'NOW FOODS', 'Амінокислоти', 'NOW International', [495, 895]),
  ...generateVariations('L-Лізин ({brand}) ({variant})', ['NOW FOODS', 'Solgar'], null, 'Амінокислоти', 'Vitamin Distribution UA', [295, 695], ['500мг 100 капсул', '1000мг 100 таб']),
  ...generateVariations('EAA ({brand}) ({variant})', ['NUTREND порошок 315г', 'NOW FOODS 120 капсул', 'Olimp 300 таб'], null, 'Амінокислоти', 'Vitamin Distribution UA', [595, 1350], ['лимон', 'нейтральний']),

  // Additional accessories
  ...generateVariations('Шейкер ({brand}) ({variant})', ['NUTREND', 'Olimp', 'RACE EXPERT'], null, 'Фляги', 'Hydria Ukraine', [195, 395], ['600мл', '700мл', '1000мл']),
  ...generateVariations('Мірна ложка ({brand})', ['NUTREND', 'Olimp', 'NOW FOODS'], null, 'Аксесуари', 'Hydria Ukraine', [45, 95]),
  ...generateVariations('Таблетниця ({brand})', ['NOW FOODS', 'Solgar', 'RACE EXPERT'], null, 'Аксесуари', 'Hydria Ukraine', [85, 195]),

  // Extra bundles
  ...generateVariations('Набір харчування 226ERS ({distance})', ['10 км', '21 км', '42 км', 'Half Ironman', 'Ironman'], '226ERS', 'Набори', '226ERS SL', [395, 2850], null, true),
  ...generateVariations('Набір NUTREND ({variant})', ['Performance Pack', 'Endurance Box', 'Recovery Set', 'Mass Gain', 'Vitamin Essentials'], 'NUTREND', 'Набори', 'Nutrend D.S.', [595, 1850], null, true),
  ...generateVariations('Набір Sponser ({variant})', ['Marathon Kit', 'Sprint Kit', 'Recovery Kit', 'Triathlon Pro'], 'Sponser', 'Набори', 'Sponser Sport Food', [685, 2150], null, true),

  // Extra gels to reach 500+
  ...generateVariations('Гель SiS Go Isotonic ({flavor}) 60мл', ['чорна смородина', 'тропік', 'лимон-м\'ята', 'малина', 'яблуко-полуниця', 'ананас'], 'Science In Sport (SIS)', 'Гелі енергетичні', 'SIS Distribution', [99, 129]),
  ...generateVariations('Гель Maurten GEL 100 CAF ({variant})', ['40г single', '16x40г box'], 'Maurten', 'Гелі енергетичні', 'Maurten AB', [261, 3650]),
  ...generateVariations('Батончик NUTREND Endurance Bar ({flavor}) 45г', ['мигдаль', 'кокос-шоколад', 'журавлина', 'ваніль-мед'], 'NUTREND', 'Енергетичні батончики', 'Nutrend D.S.', [65, 95]),
  ...generateVariations('Гель Enervit Isotonic ({flavor}) 60мл', ['апельсин', 'лимон', 'полуниця', 'чорниця'], 'Enervit', 'Гелі енергетичні', 'Euro Nutrition', [115, 149]),
  ...generateVariations('Гель 226ERS Sub9 ({flavor}) 40мл', ['нейтральний', 'лимон-імбир', 'апельсин-м\'ята'], '226ERS', 'Гелі енергетичні', '226ERS SL', [149, 195]),
];

function generateVariations(template, variants, brand, category, supplier, priceRange, extraVariants, isBundle) {
  const results = [];
  for (const v of variants) {
    if (extraVariants) {
      for (const ev of extraVariants) {
        const name = template.replace(/\{[^}]+\}/g, (match, offset) => {
          if (results.length === 0 || match.includes('brand') || match.includes('dosage') || match.includes('form') || match.includes('strength')) return v;
          return ev;
        });
        // Handle templates with multiple placeholders
        let finalName = template;
        if (template.includes('{brand}')) finalName = finalName.replace('{brand}', v);
        if (template.includes('{variant}')) finalName = finalName.replace('{variant}', ev);
        if (template.includes('{dosage}')) finalName = finalName.replace('{dosage}', ev);
        if (template.includes('{form}')) finalName = finalName.replace('{form}', v);
        if (template.includes('{strength}')) finalName = finalName.replace('{strength}', v);
        if (template.includes('{flavor}')) finalName = finalName.replace('{flavor}', v);
        if (template.includes('{size}')) finalName = finalName.replace('{size}', v);
        if (template.includes('{distance}')) finalName = finalName.replace('{distance}', v);

        results.push({
          name: finalName,
          price: randomInt(priceRange[0], priceRange[1]),
          brand: brand || v,
          category,
          supplier,
          is_bundle: isBundle || false,
        });
      }
    } else {
      let finalName = template;
      finalName = finalName.replace('{flavor}', v);
      finalName = finalName.replace('{variant}', v);
      finalName = finalName.replace('{size}', v);
      finalName = finalName.replace('{dosage}', v);
      finalName = finalName.replace('{form}', v);
      finalName = finalName.replace('{distance}', v);
      finalName = finalName.replace('{brand}', v);
      finalName = finalName.replace('{strength}', v);

      results.push({
        name: finalName,
        price: randomInt(priceRange[0], priceRange[1]),
        brand: brand || v,
        category,
        supplier,
        is_bundle: isBundle || false,
      });
    }
  }
  return results;
}

// ─── Main Seed Function ──────────────────────────────────────

function seed() {
  console.log('🌱 Starting MCPanel seed...\n');

  // Remove existing DB
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('  Removed existing database');
  }

  // Ensure data dir
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create DB and apply schema
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);
  console.log('  Schema applied ✓');

  // Load base product data
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

  // Merge base products with generated extra products
  const allProducts = [...data.products, ...EXTRA_PRODUCTS];

  // ─── 1. Brands ──────────────────────────────────────────
  const brandMap = {};
  const insertBrand = db.prepare('INSERT INTO brands (name, country) VALUES (?, ?)');
  for (const brand of data.brands) {
    const result = insertBrand.run(brand.name, brand.country);
    brandMap[brand.name] = result.lastInsertRowid;
  }
  console.log(`  Brands: ${data.brands.length} ✓`);

  // ─── 2. Categories ─────────────────────────────────────
  const catMap = {};
  const insertCat = db.prepare('INSERT INTO categories (name, parent_id) VALUES (?, ?)');
  for (const cat of data.categories.filter(c => !c.parent)) {
    const result = insertCat.run(cat.name, null);
    catMap[cat.name] = result.lastInsertRowid;
  }
  for (const cat of data.categories.filter(c => c.parent)) {
    const parentId = catMap[cat.parent] || null;
    const result = insertCat.run(cat.name, parentId);
    catMap[cat.name] = result.lastInsertRowid;
  }
  console.log(`  Categories: ${data.categories.length} ✓`);

  // ─── 3. Suppliers ──────────────────────────────────────
  const supplierMap = {};
  const insertSupplier = db.prepare('INSERT INTO suppliers (name, country, contact) VALUES (?, ?, ?)');
  for (const s of data.suppliers) {
    const result = insertSupplier.run(s.name, s.country, `contact@${s.name.toLowerCase().replace(/\s+/g, '')}.com`);
    supplierMap[s.name] = result.lastInsertRowid;
  }
  console.log(`  Suppliers: ${data.suppliers.length} ✓`);

  // ─── 4. Customers ──────────────────────────────────────
  const customerIds = [];
  const insertCustomer = db.prepare('INSERT INTO customers (name, email, phone, type) VALUES (?, ?, ?, ?)');
  const customerTypes = ['retail', 'retail', 'retail', 'retail', 'wholesale', 'veteran_sport', 'veteran_sport', 'other'];

  for (let i = 0; i < 200; i++) {
    const first = randomChoice(FIRST_NAMES);
    const last = randomChoice(LAST_NAMES);
    const type = randomChoice(customerTypes);
    const result = insertCustomer.run(
      `${first} ${last}`,
      `${first.toLowerCase()}.${last.toLowerCase()}${i}@gmail.com`,
      `+380${randomInt(50, 99)}${randomInt(1000000, 9999999)}`,
      type
    );
    customerIds.push(result.lastInsertRowid);
  }
  console.log(`  Customers: 200 ✓`);

  // ─── 5. Products (500+) ────────────────────────────────
  const productIds = [];
  const productPrices = {};
  const insertProduct = db.prepare(
    'INSERT INTO products (sku, name, brand_id, category_id, supplier_id, price, cost, is_bundle) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const usedNames = new Set();
  let productCount = 0;

  for (let i = 0; i < allProducts.length; i++) {
    const p = allProducts[i];
    // Skip duplicates
    if (usedNames.has(p.name)) continue;
    usedNames.add(p.name);

    const sku = `RE-${String(1000 + productCount).padStart(5, '0')}`;
    const brandId = brandMap[p.brand] || null;
    const catId = catMap[p.category] || null;
    const supplierId = supplierMap[p.supplier] || null;
    const cost = parseFloat((p.price * randomFloat(0.40, 0.65)).toFixed(2));

    try {
      const result = insertProduct.run(sku, p.name, brandId, catId, supplierId, p.price, cost, p.is_bundle ? 1 : 0);
      const pid = result.lastInsertRowid;
      productIds.push(pid);
      productPrices[pid] = { price: p.price, cost: cost };
      productCount++;
    } catch (e) {
      // Skip duplicate SKU errors
    }
  }
  console.log(`  Products: ${productCount} ✓`);

  // ─── 6. Inventory ──────────────────────────────────────
  const insertInventory = db.prepare('INSERT INTO inventory (product_id, quantity, reserved) VALUES (?, ?, ?)');
  for (const pid of productIds) {
    const qty = randomInt(5, 300);
    const reserved = randomInt(0, Math.min(qty, 40));
    insertInventory.run(pid, qty, reserved);
  }
  console.log(`  Inventory: ${productIds.length} items ✓`);

  // ─── 7. Orders + Order Items ───────────────────────────
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const insertOrder = db.prepare(`
    INSERT INTO orders (customer_id, status, payment_status, payment_method, order_type, total_amount, discount, created_at, confirmed_at, shipped_at, completed_at, is_packed, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price, unit_cost) VALUES (?, ?, ?, ?, ?)');

  const paymentMethods = ['online', 'nova_poshta', 'bank_transfer'];
  const paymentStatuses = ['paid', 'unpaid', 'cod'];

  const statusWeights = {
    'new': 0.08, 'awaiting_payment': 0.06, 'agreement': 0.04,
    'production': 0.12, 'returned': 0.03, 'delivery': 0.15, 'done': 0.52
  };

  function pickStatus() {
    const r = Math.random();
    let cum = 0;
    for (const [status, weight] of Object.entries(statusWeights)) {
      cum += weight;
      if (r < cum) return status;
    }
    return 'done';
  }

  function getDelayHours() {
    const r = Math.random();
    if (r < 0.40) return randomInt(1, 23);
    if (r < 0.65) return randomInt(24, 47);
    if (r < 0.85) return randomInt(48, 71);
    if (r < 0.95) return randomInt(72, 119);
    return randomInt(120, 240);
  }

  const orderIds = [];

  // Previous month orders (~650, all completed)
  for (let i = 0; i < 650; i++) {
    const createdAt = randomDate(prevMonthStart, prevMonthEnd);
    const confirmedAt = new Date(createdAt.getTime() + randomInt(1, 4) * 3600000);
    const shippedAt = new Date(confirmedAt.getTime() + randomInt(4, 48) * 3600000);
    const completedAt = new Date(shippedAt.getTime() + randomInt(24, 96) * 3600000);
    const customerId = randomChoice(customerIds);
    const isVeteran = Math.random() < 0.15;
    const payMethod = randomChoice(paymentMethods);

    const itemCount = randomInt(1, 5);
    const orderProducts = [];
    let total = 0;
    for (let j = 0; j < itemCount; j++) {
      const pid = randomChoice(productIds);
      const qty = randomInt(1, 3);
      const pp = productPrices[pid];
      total += pp.price * qty;
      orderProducts.push({ pid, qty, price: pp.price, cost: pp.cost });
    }

    const discount = Math.random() < 0.2 ? parseFloat((total * randomFloat(0.05, 0.15)).toFixed(2)) : 0;
    const result = insertOrder.run(
      customerId, 'done', Math.random() < 0.85 ? 'paid' : 'cod', payMethod,
      isVeteran ? 'veteran_sport' : 'other', parseFloat((total - discount).toFixed(2)),
      discount, formatDatetime(createdAt), formatDatetime(confirmedAt),
      formatDatetime(shippedAt), formatDatetime(completedAt), 1, null
    );

    const orderId = result.lastInsertRowid;
    orderIds.push(orderId);
    for (const item of orderProducts) {
      insertOrderItem.run(orderId, item.pid, item.qty, item.price, item.cost);
    }
  }
  console.log(`  Previous month orders: 650 ✓`);

  // Current month orders (~700, mixed statuses)
  for (let i = 0; i < 700; i++) {
    const createdAt = randomDate(currentMonthStart, now);
    const status = pickStatus();
    const customerId = randomChoice(customerIds);
    const isVeteran = Math.random() < 0.15;
    const payMethod = randomChoice(paymentMethods);

    let payStatus;
    if (status === 'done' || status === 'delivery') payStatus = Math.random() < 0.75 ? 'paid' : 'cod';
    else if (status === 'awaiting_payment') payStatus = 'unpaid';
    else payStatus = randomChoice(paymentStatuses);

    let confirmedAt = null, shippedAt = null, completedAt = null, isPacked = 0;

    if (['agreement', 'production', 'returned', 'delivery', 'done'].includes(status)) {
      confirmedAt = new Date(createdAt.getTime() + randomInt(1, 4) * 3600000);
    }

    if (status === 'production') {
      const delayHours = getDelayHours();
      confirmedAt = new Date(now.getTime() - delayHours * 3600000);
      isPacked = Math.random() < 0.4 ? 1 : 0;
    }

    if (status === 'delivery') {
      shippedAt = new Date(confirmedAt.getTime() + randomInt(4, 48) * 3600000);
      isPacked = 1;
    }

    if (status === 'done') {
      shippedAt = new Date(confirmedAt.getTime() + randomInt(4, 48) * 3600000);
      completedAt = new Date(shippedAt.getTime() + randomInt(24, 96) * 3600000);
      isPacked = 1;
    }

    const itemCount = randomInt(1, 5);
    const orderProducts = [];
    let total = 0;
    for (let j = 0; j < itemCount; j++) {
      const pid = randomChoice(productIds);
      const qty = randomInt(1, 3);
      const pp = productPrices[pid];
      total += pp.price * qty;
      orderProducts.push({ pid, qty, price: pp.price, cost: pp.cost });
    }

    const discount = Math.random() < 0.15 ? parseFloat((total * randomFloat(0.05, 0.10)).toFixed(2)) : 0;
    const result = insertOrder.run(
      customerId, status, payStatus, payMethod,
      isVeteran ? 'veteran_sport' : 'other', parseFloat((total - discount).toFixed(2)),
      discount, formatDatetime(createdAt),
      confirmedAt ? formatDatetime(confirmedAt) : null,
      shippedAt ? formatDatetime(shippedAt) : null,
      completedAt ? formatDatetime(completedAt) : null,
      isPacked, null
    );

    const orderId = result.lastInsertRowid;
    orderIds.push(orderId);
    for (const item of orderProducts) {
      insertOrderItem.run(orderId, item.pid, item.qty, item.price, item.cost);
    }
  }
  console.log(`  Current month orders: 700 ✓`);

  // ─── 8. Finance Accounts ───────────────────────────────
  const insertAccount = db.prepare('INSERT INTO finance_accounts (name, type, balance) VALUES (?, ?, ?)');
  const accounts = [
    { name: 'ПриватБанк', type: 'bank', balance: randomFloat(150000, 350000) },
    { name: 'ПУМБ', type: 'bank', balance: randomFloat(80000, 200000) },
    { name: 'Каса', type: 'cash', balance: randomFloat(15000, 45000) },
    { name: 'Інші', type: 'other', balance: randomFloat(5000, 25000) }
  ];
  const accountIds = [];
  for (const acc of accounts) {
    const result = insertAccount.run(acc.name, acc.type, acc.balance);
    accountIds.push(result.lastInsertRowid);
  }
  console.log(`  Finance accounts: ${accounts.length} ✓`);

  // ─── 9. Finance Transactions ───────────────────────────
  const insertTransaction = db.prepare(
    'INSERT INTO finance_transactions (account_id, type, amount, description, category, order_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const expenseCategories = ['logistics', 'marketing', 'salary', 'rent', 'utilities', 'other'];
  let txCount = 0;

  for (const orderId of orderIds.slice(0, 800)) {
    const accId = randomChoice(accountIds);
    const orderData = db.prepare('SELECT total_amount, created_at FROM orders WHERE id = ?').get(orderId);
    if (orderData) {
      insertTransaction.run(accId, 'income', orderData.total_amount, `Оплата замовлення #${orderId}`, 'sales', orderId, orderData.created_at);
      txCount++;
    }
  }

  for (let i = 0; i < 200; i++) {
    const accId = randomChoice(accountIds);
    const cat = randomChoice(expenseCategories);
    const amount = randomFloat(500, 50000);
    const date = randomDate(prevMonthStart, now);
    insertTransaction.run(accId, 'expense', amount, `Витрати: ${cat}`, cat, null, formatDatetime(date));
    txCount++;
  }
  console.log(`  Transactions: ${txCount} ✓`);

  // ─── 10. Receivables ───────────────────────────────────
  const insertReceivable = db.prepare(
    'INSERT INTO receivables (debtor_type, debtor_id, amount, due_date, description, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (let i = 0; i < 20; i++) {
    const custId = randomChoice(customerIds);
    const cust = db.prepare('SELECT name FROM customers WHERE id = ?').get(custId);
    insertReceivable.run('customer', custId, randomFloat(2000, 35000),
      randomDate(now, new Date(now.getTime() + 30 * 86400000)).toISOString().substring(0, 10),
      `Дебіторська заборгованість: ${cust.name}`, formatDatetime(randomDate(prevMonthStart, now)));
  }
  const supplierIds = Object.values(supplierMap);
  for (let i = 0; i < 8; i++) {
    const suppId = randomChoice(supplierIds);
    const supp = db.prepare('SELECT name FROM suppliers WHERE id = ?').get(suppId);
    insertReceivable.run('supplier', suppId, randomFloat(10000, 80000),
      randomDate(now, new Date(now.getTime() + 60 * 86400000)).toISOString().substring(0, 10),
      `Передоплата: ${supp.name}`, formatDatetime(randomDate(prevMonthStart, now)));
  }
  console.log(`  Receivables: 28 ✓`);

  // ─── 11. Payables ──────────────────────────────────────
  const insertPayable = db.prepare(
    'INSERT INTO payables (creditor_type, creditor_id, amount, due_date, description, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (let i = 0; i < 15; i++) {
    const suppId = randomChoice(supplierIds);
    const supp = db.prepare('SELECT name FROM suppliers WHERE id = ?').get(suppId);
    insertPayable.run('supplier', suppId, randomFloat(15000, 120000),
      randomDate(now, new Date(now.getTime() + 45 * 86400000)).toISOString().substring(0, 10),
      `Заборгованість: ${supp.name}`, formatDatetime(randomDate(prevMonthStart, now)));
  }
  for (let i = 0; i < 5; i++) {
    const custId = randomChoice(customerIds);
    const cust = db.prepare('SELECT name FROM customers WHERE id = ?').get(custId);
    insertPayable.run('customer', custId, randomFloat(500, 5000),
      randomDate(now, new Date(now.getTime() + 14 * 86400000)).toISOString().substring(0, 10),
      `Повернення: ${cust.name}`, formatDatetime(randomDate(prevMonthStart, now)));
  }
  console.log(`  Payables: 20 ✓`);

  // ─── 12. Monthly Expenses ──────────────────────────────
  const insertExpense = db.prepare('INSERT INTO expenses (month, category, amount, description) VALUES (?, ?, ?, ?)');
  const currentMonth = formatMonth(now);
  const prevMonth = formatMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const expenseItems = [
    { cat: 'Логістика', amount: [180000, 220000] },
    { cat: 'Маркетинг', amount: [80000, 120000] },
    { cat: 'Зарплата', amount: [250000, 320000] },
    { cat: 'Оренда', amount: [45000, 55000] },
    { cat: 'Комунальні', amount: [8000, 15000] },
    { cat: 'Закупівля товару', amount: [400000, 600000] },
    { cat: 'IT та підтримка', amount: [15000, 25000] },
    { cat: 'Інше', amount: [10000, 30000] }
  ];
  for (const month of [prevMonth, currentMonth]) {
    for (const exp of expenseItems) {
      insertExpense.run(month, exp.cat, randomFloat(exp.amount[0], exp.amount[1]), `${exp.cat} за ${month}`);
    }
  }
  console.log(`  Expenses: ${expenseItems.length * 2} ✓`);

  // ─── Summary ───────────────────────────────────────────
  const counts = {
    brands: db.prepare('SELECT COUNT(*) as c FROM brands').get().c,
    categories: db.prepare('SELECT COUNT(*) as c FROM categories').get().c,
    suppliers: db.prepare('SELECT COUNT(*) as c FROM suppliers').get().c,
    customers: db.prepare('SELECT COUNT(*) as c FROM customers').get().c,
    products: db.prepare('SELECT COUNT(*) as c FROM products').get().c,
    orders: db.prepare('SELECT COUNT(*) as c FROM orders').get().c,
    orderItems: db.prepare('SELECT COUNT(*) as c FROM order_items').get().c,
    inventory: db.prepare('SELECT COUNT(*) as c FROM inventory').get().c,
    transactions: db.prepare('SELECT COUNT(*) as c FROM finance_transactions').get().c,
  };

  console.log('\n📊 Seed complete!\n');
  console.log('  ┌──────────────────┬──────────┐');
  console.log('  │ Table            │ Records  │');
  console.log('  ├──────────────────┼──────────┤');
  for (const [table, count] of Object.entries(counts)) {
    console.log(`  │ ${table.padEnd(16)} │ ${String(count).padStart(8)} │`);
  }
  console.log('  └──────────────────┴──────────┘');

  // Switch from WAL to DELETE journal mode for Vercel compatibility
  db.pragma('journal_mode = DELETE');
  db.close();
  console.log(`\n  Database: ${DB_PATH}`);
  console.log('  Journal mode set to DELETE for Vercel deployment ✓');
}

try {
  seed();
} catch (err) {
  console.error('❌ Seed failed:', err);
  process.exit(1);
}
