import { useState } from 'react'
import { Eyebrow, FitMeter, Photo } from '../components/ui'
import { Icon } from '../components/Icon'
import { ACTIVITIES, THEMES, fmt, golfAdvice, shortDate, type Prediction, type Screen } from '../lib/weather'

const MOODS = { cold: 'frost', hot: 'sunshine', rainy: 'rain', cloudy: 'soft cloud', mild: 'easy daylight' } as const
const RATIOS = ['4 / 5', '5 / 4', '4 / 5', '5 / 4', '4 / 5']

export function Activities({ pred, go }: { pred: Prediction; go: (s: Screen) => void }) {
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all')
  const theme = THEMES[pred.category]
  const golf = golfAdvice(pred)
  const list = ACTIVITIES[pred.category].filter((a) => (filter === 'all' ? true : filter === 'in' ? a.indoor : !a.indoor))
  const golfVisible = filter === 'all' || (filter === 'in' ? golf.mode === 'indoor' : golf.mode === 'outdoor')

  return (
    <div className="animate-screen pb-32">
      <header className="px-6 pt-8">
        <Eyebrow>{shortDate(pred.date)} · {theme.label}</Eyebrow>
        <h1 className="t-display mt-3 text-[56px] leading-[0.96]">
          Made for <em>{fmt(pred.temp)}°</em> and {MOODS[pred.category]}
        </h1>
        <p className="mt-4 text-[13px] leading-snug" style={{ color: 'var(--ink-soft)' }}>
          Chosen by rule: {pred.rule.toLowerCase()}.
        </p>
      </header>

      {/* Pinned bar: Golf is always one tap away */}
      <div className="sticky top-0 z-20 mt-6 px-6 py-3" style={{ background: 'color-mix(in srgb, var(--bg) 88%, transparent)', backdropFilter: 'blur(18px)', borderBottom: '1px solid var(--line)' }}>
        <div className="no-scrollbar -mx-6 flex items-center gap-2 overflow-x-auto px-6">
          <button onClick={() => go('golf')} className="flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-4 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
            <span className="h-7 w-7 overflow-hidden rounded-full">
              <Photo src={golf.img} />
            </span>
            Golf
            <Icon name="golf" size={14} />
          </button>
          <span className="mx-1 h-5 w-px shrink-0" style={{ background: 'var(--line)' }} />
          {([['all', 'All'], ['in', 'Indoors'], ['out', 'Outdoors']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id} className="shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-semibold transition" style={filter === id ? { borderColor: 'var(--ink)', color: 'var(--ink)' } : { borderColor: 'var(--line)', color: 'var(--ink-soft)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Signature feature: Golf (edge-to-edge, distinct from the list) */}
      {golfVisible && (
        <button onClick={() => go('golf')} className="group relative mt-6 block h-[420px] w-full overflow-hidden text-left text-white">
          <Photo src={golf.img} pos="center 60%" className="transition duration-1000 group-hover:scale-[1.04]" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(4,8,12,0.9) 0%, rgba(4,8,12,0.35) 45%, rgba(4,8,12,0.25) 100%)' }} />
          <div className="absolute inset-0 flex flex-col justify-between p-6">
            <div className="flex items-center justify-between">
              <span className="glass-dark flex items-center gap-2 rounded-full py-1.5 pl-2.5 pr-3.5 text-[10.5px] font-semibold uppercase tracking-[0.2em]">
                <Icon name="golf" size={14} /> Pinned · Signature
              </span>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-white/75">{golf.mode === 'outdoor' ? 'Outdoor' : 'Indoor'}</span>
            </div>
            <div>
              <div className="t-display text-[102px] leading-[0.85] uppercase">Golf</div>
              <div className="mt-4 flex items-center gap-3">
                <span className="rounded-full bg-white px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#10151a]">{golf.rating}</span>
                <span className="text-[13px] font-medium text-white/85">{golf.headline}</span>
              </div>
              <p className="mt-3 line-clamp-2 max-w-[310px] text-[13.5px] leading-snug text-white/75">{golf.summary}</p>
              <span className="mt-5 inline-flex items-center gap-2 border-b border-white/70 pb-1 text-[13.5px] font-semibold">
                Explore golf <Icon name="arrow" size={16} />
              </span>
            </div>
          </div>
        </button>
      )}

      <div className="mt-10 space-y-10 px-6">
        {list.length === 0 && (
          <p className="py-10 text-center text-[14px]" style={{ color: 'var(--ink-soft)' }}>
            Nothing {filter === 'in' ? 'indoors' : 'outdoors'} suits this forecast. Try another filter.
          </p>
        )}
        {list.map((a, i) => (
          <article key={a.id}>
            <div className="relative overflow-hidden rounded-[6px]" style={{ aspectRatio: RATIOS[i % RATIOS.length] }}>
              <Photo src={a.img} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(4,8,12,0.78) 0%, rgba(4,8,12,0) 50%), linear-gradient(to bottom, rgba(4,8,12,0.35) 0%, rgba(4,8,12,0) 22%)' }} />
              <span className="t-eyebrow absolute left-4 top-4 text-[10px] text-white">{a.indoor ? 'Indoors' : 'Outdoors'}</span>
              <span className="t-eyebrow absolute right-4 top-4 text-[10px] text-white/70">{String(i + 1).padStart(2, '0')}</span>
              <div className="absolute inset-x-4 bottom-4 text-white">
                <FitMeter fit={a.fit} onPhoto />
                <h3 className="t-display mt-2 text-[37px] leading-[1.02]">{a.name}</h3>
              </div>
            </div>
            <p className="mt-4 text-[14.5px] leading-snug">{a.description}</p>
            <p className="mt-3 flex gap-2.5 border-t pt-3 text-[13px] leading-snug hairline" style={{ color: 'var(--ink-soft)' }}>
              <span className="t-eyebrow shrink-0 pt-px text-[9.5px]" style={{ color: 'var(--accent)' }}>
                Why it suits
              </span>
              <span>{a.reason(pred)}</span>
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
