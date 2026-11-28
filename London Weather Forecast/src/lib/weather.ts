export type Category = 'cold' | 'hot' | 'rainy' | 'cloudy' | 'mild'
export type Screen = 'home' | 'input' | 'result' | 'activities' | 'golf' | 'details'

export interface Inputs {
  cloud: number // oktas
  sunshine: number // hours
  radiation: number // W/m²
  precip: number // mm
  pressure: number // hPa
  snow: number // cm
}

export interface Prediction {
  date: string // yyyy-mm-dd
  inputs: Inputs
  temp: number
  low: number
  high: number
  category: Category
  rule: string
}

export interface Theme {
  label: string
  headline: string
  blurb: string
  interpretation: (p: Prediction) => string
  hero: string
  dark: boolean
  vars: Record<string, string>
  swatch: [string, string]
}

const img = (n: string) => `/img/${n}.jpg`

export const THEMES: Record<Category, Theme> = {
  cold: {
    label: 'Cold',
    headline: 'Crisp, still and silver.',
    blurb: 'Frost on the branches and a hush across the parks.',
    interpretation: (p) =>
      `A cold day is expected, with a mean of ${fmt(p.temp)}°C. Frost is likely overnight${
        p.inputs.snow > 0 ? ' and snow may linger on the ground' : ''
      }. Layer up, and plan around warm interiors.`,
    hero: img('hero-cold'),
    dark: true,
    swatch: ['#bfdcf5', '#0a1522'],
    vars: {
      '--bg': '#0a1522',
      '--bg-2': '#112338',
      '--ink': '#eaf2fa',
      '--ink-soft': 'rgba(234,242,250,0.64)',
      '--line': 'rgba(190,215,240,0.16)',
      '--surface': 'rgba(190,215,240,0.08)',
      '--accent': '#bfdcf5',
      '--accent-ink': '#0a1522',
      '--nav': 'rgba(10,21,34,0.66)',
    },
  },
  hot: {
    label: 'Hot',
    headline: 'Golden, bright and long.',
    blurb: 'Warm light from morning until well after dinner.',
    interpretation: (p) =>
      `A hot day for London: the model expects a mean of ${fmt(p.temp)}°C with plenty of sun. Keep to the shade at midday, carry water, and save the best plans for morning and evening.`,
    hero: img('hero-hot'),
    dark: false,
    swatch: ['#f6c15a', '#c4650f'],
    vars: {
      '--bg': '#f7f0e3',
      '--bg-2': '#efe3cd',
      '--ink': '#2a1a0c',
      '--ink-soft': 'rgba(42,26,12,0.64)',
      '--line': 'rgba(42,26,12,0.14)',
      '--surface': 'rgba(255,255,255,0.5)',
      '--accent': '#b95a0c',
      '--accent-ink': '#fff6e6',
      '--nav': 'rgba(247,240,227,0.74)',
    },
  },
  rainy: {
    label: 'Rainy',
    headline: 'Soft rain, quiet streets.',
    blurb: 'Reflections on the pavement and lamplight at dusk.',
    interpretation: (p) =>
      `Rain sets the tone: about ${fmt(p.inputs.precip)} mm is expected, alongside a mean of ${fmt(
        p.temp,
      )}°C. A good day for galleries, long lunches and plans under a roof.`,
    hero: img('hero-rainy'),
    dark: true,
    swatch: ['#9db8cb', '#14181d'],
    vars: {
      '--bg': '#13171c',
      '--bg-2': '#1b2128',
      '--ink': '#e8edf0',
      '--ink-soft': 'rgba(232,237,240,0.62)',
      '--line': 'rgba(200,215,225,0.15)',
      '--surface': 'rgba(200,215,225,0.07)',
      '--accent': '#a3bdd0',
      '--accent-ink': '#10151a',
      '--nav': 'rgba(19,23,28,0.7)',
    },
  },
  cloudy: {
    label: 'Cloudy',
    headline: 'Calm beneath the cloud.',
    blurb: 'Even, unhurried light with nothing to squint at.',
    interpretation: (p) =>
      `Cloud will dominate with a mean of ${fmt(p.temp)}°C and little direct sun. It should stay dry: a calm, even-light day, kind to walkers and photographers.`,
    hero: img('hero-cloudy'),
    dark: false,
    swatch: ['#8c9db4', '#e6e9ec'],
    vars: {
      '--bg': '#e6e9ec',
      '--bg-2': '#d9dee3',
      '--ink': '#1d2630',
      '--ink-soft': 'rgba(29,38,48,0.64)',
      '--line': 'rgba(29,38,48,0.14)',
      '--surface': 'rgba(255,255,255,0.55)',
      '--accent': '#3f566e',
      '--accent-ink': '#f2f5f7',
      '--nav': 'rgba(230,233,236,0.76)',
    },
  },
  mild: {
    label: 'Pleasant',
    headline: 'Fresh, bright and easy.',
    blurb: 'Soft daylight and a gentle breeze across the lawns.',
    interpretation: (p) =>
      `A pleasant day is on the cards: a mean of ${fmt(p.temp)}°C with good light and little rain. Comfortable in a light jacket, and made for time outdoors.`,
    hero: img('hero-mild'),
    dark: false,
    swatch: ['#2f6b4f', '#f4f1e6'],
    vars: {
      '--bg': '#f4f1e6',
      '--bg-2': '#e8e5d3',
      '--ink': '#12301f',
      '--ink-soft': 'rgba(18,48,31,0.64)',
      '--line': 'rgba(18,48,31,0.15)',
      '--surface': 'rgba(255,255,255,0.55)',
      '--accent': '#2f6b4f',
      '--accent-ink': '#f4f1e6',
      '--nav': 'rgba(244,241,230,0.76)',
    },
  },
}

export const CATEGORY_ORDER: Category[] = ['rainy', 'cold', 'hot', 'cloudy', 'mild']

export function fmt(n: number) {
  return (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, '')
}

/* Largest numeral size that keeps long readings such as 25.5 or -7.5 inside the screen */
export function tempSize(temp: number, base: number) {
  return fmt(temp).length >= 4 ? Math.round(base * 0.84) : base
}

/* ---------- Dates ---------- */
export function toISO(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
export function parseISO(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export function longDate(s: string) {
  return parseISO(s).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}
export function shortDate(s: string) {
  return parseISO(s).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

/* ---------- Inputs metadata ---------- */
export interface InputMeta {
  key: keyof Inputs
  label: string
  unit: string
  hint: string
  min: number
  max: number
  step: number
  icon: string
  describe: (v: number) => string
}

export const INPUT_META: InputMeta[] = [
  {
    key: 'cloud',
    label: 'Cloud cover',
    unit: 'oktas',
    hint: 'How much of the sky is covered. 0 is clear, 8 is fully overcast.',
    min: 0,
    max: 8,
    step: 1,
    icon: 'cloud',
    describe: (v) => (v <= 1 ? 'Clear sky' : v <= 3 ? 'A few clouds' : v <= 5 ? 'Partly cloudy' : v <= 7 ? 'Mostly cloudy' : 'Overcast'),
  },
  {
    key: 'sunshine',
    label: 'Sunshine',
    unit: 'hours',
    hint: 'Hours of direct sun across the day.',
    min: 0,
    max: 16,
    step: 0.5,
    icon: 'sun',
    describe: (v) => (v < 1 ? 'Barely any' : v < 4 ? 'A little' : v < 8 ? 'Some sun' : 'Plenty of sun'),
  },
  {
    key: 'radiation',
    label: 'Sun strength',
    unit: 'W/m²',
    hint: 'Global radiation: how intense the sunlight is at ground level.',
    min: 0,
    max: 350,
    step: 5,
    icon: 'bolt',
    describe: (v) => (v < 50 ? 'Weak' : v < 150 ? 'Moderate' : v < 250 ? 'Strong' : 'Intense'),
  },
  {
    key: 'precip',
    label: 'Rainfall',
    unit: 'mm',
    hint: 'Total precipitation expected over the day.',
    min: 0,
    max: 30,
    step: 0.5,
    icon: 'drop',
    describe: (v) => (v === 0 ? 'Dry' : v < 1.5 ? 'Light drizzle' : v < 8 ? 'Showers' : 'Heavy rain'),
  },
  {
    key: 'pressure',
    label: 'Air pressure',
    unit: 'hPa',
    hint: 'High pressure usually means settled weather; low means unsettled.',
    min: 970,
    max: 1050,
    step: 1,
    icon: 'gauge',
    describe: (v) => (v < 1000 ? 'Low, unsettled' : v < 1020 ? 'Normal' : 'High, settled'),
  },
  {
    key: 'snow',
    label: 'Snow depth',
    unit: 'cm',
    hint: 'Depth of snow lying on the ground. Usually 0.',
    min: 0,
    max: 20,
    step: 1,
    icon: 'snow',
    describe: (v) => (v === 0 ? 'None' : v < 3 ? 'A dusting' : 'Settled snow'),
  },
]

export const DEFAULT_INPUTS: Inputs = {
  cloud: 4,
  sunshine: 5,
  radiation: 120,
  precip: 0,
  pressure: 1015,
  snow: 0,
}

/* ---------- Scenario presets (used for quick fill and theme previews) ---------- */
export interface Preset {
  id: string
  label: string
  category: Category
  month: number
  day: number
  inputs: Inputs
}

export const PRESETS: Preset[] = [
  { id: 'rainy', label: 'Rainy day', category: 'rainy', month: 9, day: 18, inputs: { cloud: 8, sunshine: 0.3, radiation: 35, precip: 9, pressure: 999, snow: 0 } },
  { id: 'frost', label: 'Frosty morning', category: 'cold', month: 0, day: 14, inputs: { cloud: 6, sunshine: 1, radiation: 30, precip: 0, pressure: 1028, snow: 6 } },
  { id: 'heat', label: 'Heatwave', category: 'hot', month: 6, day: 22, inputs: { cloud: 1, sunshine: 12, radiation: 280, precip: 0, pressure: 1022, snow: 0 } },
  { id: 'grey', label: 'Grey spring', category: 'cloudy', month: 3, day: 9, inputs: { cloud: 7, sunshine: 2, radiation: 80, precip: 0.2, pressure: 1015, snow: 0 } },
  { id: 'fresh', label: 'Fresh May day', category: 'mild', month: 4, day: 24, inputs: { cloud: 2, sunshine: 8, radiation: 190, precip: 0, pressure: 1018, snow: 0 } },
]

export function presetDate(p: Preset) {
  const now = new Date()
  let d = new Date(now.getFullYear(), p.month, p.day)
  if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate())) d = new Date(now.getFullYear() + 1, p.month, p.day)
  return toISO(d)
}

/* ---------- Activities (rule-based by category, each with its own photograph) ---------- */
export interface Activity {
  id: string
  name: string
  img: string
  indoor: boolean
  fit: 2 | 3
  description: string
  reason: (p: Prediction) => string
}

export const ACTIVITIES: Record<Category, Activity[]> = {
  cold: [
    { id: 'museum', name: 'Museum afternoon', img: img('museum'), indoor: true, fit: 3, description: 'Cathedral-like halls at the Natural History Museum or the V&A, warm and free to enter.', reason: (p) => `At ${fmt(p.temp)}°C, vast heated galleries make the cold feel far away.` },
    { id: 'cafe', name: 'Café by the window', img: img('cafe-cold'), indoor: true, fit: 3, description: 'A flat white and a warm croissant in a Marylebone or Soho café.', reason: () => 'Steamed windows and a hot drink are the best answer to frost.' },
    { id: 'read', name: 'A quiet hour with a book', img: img('bookshop'), indoor: true, fit: 2, description: 'Find something new in an independent bookshop, then settle into an armchair.', reason: () => 'Still, cold days suit slow, unhurried reading.' },
    { id: 'cinema', name: 'Cinema matinee', img: img('cinema'), indoor: true, fit: 2, description: 'A restored classic in a velvet-seated West End screen.', reason: (p) => `${p.inputs.snow > 0 ? 'Snow on the ground' : 'Frost in the air'} makes a dark, warm room appealing.` },
    { id: 'bowl', name: 'Evening at the lanes', img: img('bowling'), indoor: true, fit: 2, description: 'Boutique bowling with cocktails and booths. Indoor entertainment with some style.', reason: () => 'Entirely indoors, and a lively way to spend a long cold evening.' },
  ],
  hot: [
    { id: 'park', name: 'Park laze by the water', img: img('park-sunny'), indoor: false, fit: 3, description: 'Deckchairs on the grass beside the Serpentine in Hyde Park.', reason: (p) => `${fmt(p.temp)}°C and strong sun call for open lawns and water.` },
    { id: 'alfresco', name: 'Shaded terrace brunch', img: img('cafe-hot'), indoor: false, fit: 3, description: 'Iced coffee and a late brunch beneath an awning with a view.', reason: () => 'Long daylight hours make the terrace the best seat in the city.' },
    { id: 'cycle', name: 'Early ride in Richmond Park', img: img('cycling'), indoor: false, fit: 2, description: 'Dappled shade, wide skies and deer grazing in the distance.', reason: () => 'Go early: it is dry and clear, and the morning is the coolest part of the day.' },
    { id: 'sights', name: 'The river by boat', img: img('sightseeing'), indoor: false, fit: 3, description: 'See Tower Bridge and the skyline from the water with a breeze on deck.', reason: () => 'Great visibility, and the river keeps you cooler than the streets.' },
  ],
  rainy: [
    { id: 'gallery', name: 'Gallery hours', img: img('gallery'), indoor: true, fit: 3, description: 'Hushed white rooms and large canvases, a short walk from the river.', reason: (p) => `About ${fmt(p.inputs.precip)} mm of rain means art is best seen from indoors.` },
    { id: 'museum', name: 'A day among the collections', img: img('museum'), indoor: true, fit: 3, description: 'The great Victorian halls reward an unhurried day with no plan at all.', reason: () => 'Large, dry spaces with plenty to see.' },
    { id: 'cafe', name: 'Rainy-window tea', img: img('cafe-rainy'), indoor: true, fit: 3, description: 'A window seat, a pot of tea and the city blurred through the glass.', reason: () => 'Rain is at its most beautiful from behind a window.' },
    { id: 'shop', name: 'Arcades and covered shopping', img: img('shopping'), indoor: true, fit: 2, description: 'Browse Victorian arcades where the glass roof keeps you dry.', reason: () => 'Covered walkways keep you dry between shops.' },
    { id: 'cinema', name: 'Cinema escape', img: img('cinema'), indoor: true, fit: 2, description: 'Two dark, dry hours in a plush auditorium.', reason: () => 'A dry two hours and a good story.' },
  ],
  cloudy: [
    { id: 'tour', name: 'Walking tour', img: img('walking-tour'), indoor: false, fit: 3, description: 'Follow a guided route through London’s prettiest streets and mews.', reason: (p) => `Mild, dry ${fmt(p.temp)}°C air is easy to walk in.` },
    { id: 'photo', name: 'Photography along the river', img: img('photography'), indoor: false, fit: 3, description: 'Capture the South Bank and Westminster in flat, silvery light.', reason: () => 'Overcast skies act like a giant softbox: no harsh shadows.' },
    { id: 'park', name: 'A quiet park', img: img('park-cloudy'), indoor: false, fit: 2, description: 'Regent’s Park paths beneath old plane trees on a still, grey day.', reason: () => 'Dry weather and soft light, with fewer people about.' },
    { id: 'sights', name: 'Westminster without the crowds', img: img('hero-cloudy'), indoor: false, fit: 2, description: 'Stroll the riverside from the Abbey to the Houses of Parliament.', reason: () => 'Grey skies thin out the crowds and calm the river.' },
  ],
  mild: [
    { id: 'picnic', name: 'Picnic on Primrose Hill', img: img('picnic'), indoor: false, fit: 3, description: 'A basket, a blanket and the skyline laid out below you.', reason: (p) => `${fmt(p.temp)}°C with light cloud is true picnic weather.` },
    { id: 'cycle', name: 'Cycle through the park', img: img('cycling'), indoor: false, fit: 3, description: 'A leisurely loop through Richmond Park with deer and wide skies.', reason: () => 'Comfortable temperatures: you won’t overheat or chill.' },
    { id: 'dine', name: 'Dinner on the terrace', img: img('dining'), indoor: false, fit: 3, description: 'A candlelit table above the river as the light softens.', reason: () => 'Dry and bright, so the evening is made for sitting outdoors.' },
    { id: 'tour', name: 'Walking tour', img: img('walking-tour'), indoor: false, fit: 2, description: 'Pastel mews and garden squares on a guided stroll.', reason: () => 'Pleasant air for a couple of hours on foot.' },
    { id: 'park', name: 'An afternoon in the park', img: img('hero-mild'), indoor: false, fit: 2, description: 'Blossom, lawns and long paths at their very best.', reason: () => 'Fresh, bright and gentle: the park at its finest.' },
  ],
}

/* ---------- Pinned golf feature: weather-aware advice ---------- */
export interface GolfAdvice {
  mode: 'outdoor' | 'indoor'
  rating: string
  score: number // outdoor playability, 0 to 100
  headline: string
  summary: string
  window: string
  img: string
  tips: string[]
  formats: { name: string; length: string; note: string }[]
  alt: string
}

export function golfAdvice(p: Prediction): GolfAdvice {
  const t = p.temp
  switch (p.category) {
    case 'cold':
      return {
        mode: 'indoor',
        rating: 'Indoor day',
        score: p.inputs.snow > 0 ? 8 : 22,
        headline: 'Take your swing indoors.',
        summary: `At ${fmt(t)}°C${p.inputs.snow > 0 ? ' with snow on the ground' : ''}, fairways are firm or frozen and the light fades early. A simulator lounge keeps your game warm.`,
        window: 'Any time. Book a bay for late morning or early afternoon.',
        img: img('golf-cold'),
        tips: ['Wear a base layer even indoors; bays can be cool between swings.', 'Use the session to work on short game and tempo.', 'Warm up for ten minutes before hitting full shots.'],
        formats: [
          { name: 'Simulator bay', length: '1 hour', note: 'Play a famous course on screen' },
          { name: 'Short-game studio', length: '45 min', note: 'Putting and chipping practice' },
          { name: 'Lesson with analysis', length: '1 hour', note: 'Swing data and video feedback' },
        ],
        alt: 'Outdoor golf is not recommended today: frozen ground and short daylight.',
      }
    case 'rainy':
      return {
        mode: 'indoor',
        rating: 'Indoor day',
        score: 18,
        headline: 'Stay dry on a covered range.',
        summary: `With around ${fmt(p.inputs.precip)} mm of rain forecast, wet greens and slippery lies make a full round a poor choice. A covered driving range or indoor facility is the better call.`,
        window: 'Covered bays work all day. Evening sessions look especially good in the rain.',
        img: img('golf-rainy'),
        tips: ['Bring a towel and spare glove if you play a covered bay with open sides.', 'Waterproof shoes are worth it between the car and the bay.', 'Treat it as a practice day: work on one thing at a time.'],
        formats: [
          { name: 'Covered range session', length: '1 hour', note: 'Heated, roofed bays' },
          { name: 'Indoor simulator', length: '1 hour', note: 'Fully dry, any conditions' },
          { name: 'Putting practice', length: '30 min', note: 'Quiet and indoors' },
        ],
        alt: 'Outdoor golf is not recommended today: heavy rain and soft ground.',
      }
    case 'hot':
      return {
        mode: 'outdoor',
        rating: t >= 30 ? 'Early start only' : 'Good, with timing',
        score: t >= 30 ? 52 : 70,
        headline: 'Play early, or late in the day.',
        summary: `At ${fmt(t)}°C with strong sun, outdoor golf is a pleasure early and late, and punishing at midday. Choose a course with plenty of tree cover, or finish by late morning.`,
        window: 'Tee off before 9:00, or after 17:00 for a twilight round.',
        img: img('golf-hot'),
        tips: ['Pick a shaded parkland course and ride a cart if you can.', 'Carry more water than you think you need, and refill at the turn.', 'Hat, sunscreen and a light, breathable layer.'],
        formats: [
          { name: 'Early nine holes', length: '2 hours', note: 'Finish before the heat peaks' },
          { name: 'Twilight round', length: '2.5 hours', note: 'Cooler air and golden light' },
          { name: 'Shaded range session', length: '1 hour', note: 'Covered bays for midday' },
        ],
        alt: 'Midday play is not advised. Choose early morning, evening or shaded facilities.',
      }
    case 'cloudy':
      return {
        mode: 'outdoor',
        rating: t >= 12 ? 'Good' : 'Playable',
        score: t >= 12 ? 82 : 66,
        headline: 'Even light, easy on the eyes.',
        summary: `Dry, overcast conditions at ${fmt(t)}°C suit a relaxed round: no glare, no heat and good visibility on the greens.${t < 12 ? ' It will feel cool, so bring an extra layer.' : ''}`,
        window: 'Any time. Late morning is typically the mildest.',
        img: img('golf-cloudy'),
        tips: ['Flat light can hide slopes on the greens. Read putts carefully.', 'A light windproof jacket is enough.', 'Cooler air means the ball travels slightly shorter, so take an extra club.'],
        formats: [
          { name: 'Full 18 holes', length: '4 hours', note: 'Comfortable all the way round' },
          { name: 'Nine holes after work', length: '2 hours', note: 'Good light until early evening' },
          { name: 'Pitch and putt', length: '1 hour', note: 'Relaxed and beginner-friendly' },
        ],
        alt: 'If the cloud thickens or rain arrives, switch to a covered range.',
      }
    default:
      return {
        mode: 'outdoor',
        rating: 'Ideal',
        score: 96,
        headline: 'A day made for the course.',
        summary: `Bright, dry and ${fmt(t)}°C: close to perfect for golf. Firm fairways, good visibility and a gentle temperature all day.`,
        window: 'All day. Late morning to mid-afternoon has the best light.',
        img: img('golf-mild'),
        tips: ['A light layer is plenty; you will likely shed it by the fourth hole.', 'Book a morning tee time if you want the course at its quietest.', 'Mind the sun on the back nine: sunscreen still matters.'],
        formats: [
          { name: 'Full 18 holes', length: '4 hours', note: 'The complete experience' },
          { name: 'Nine holes at golden hour', length: '2 hours', note: 'Soft light and a quiet course' },
          { name: 'Range and short game', length: '1.5 hours', note: 'Warm up or sharpen your touch' },
        ],
        alt: 'Light rain later in the day would change the picture. Check again before you go.',
      }
  }
}
