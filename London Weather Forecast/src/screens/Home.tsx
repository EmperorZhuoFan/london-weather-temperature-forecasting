import { Button, Eyebrow, HeroPhoto, LocationPill, Photo, SectionHead, TextLink, Wordmark } from '../components/ui'
import { Icon } from '../components/Icon'
import { ACTIVITIES, PRESETS, THEMES, fmt, golfAdvice, tempSize, longDate, type Prediction, type Screen } from '../lib/weather'

export function Home({ pred, go, setScenario, error }: { pred: Prediction; go: (s: Screen) => void; setScenario: (id: string) => void; error: string }) {
  const theme = THEMES[pred.category]
  const golf = golfAdvice(pred)
  const activeId = PRESETS.find((p) => p.category === pred.category)?.id

  return (
    <div className="animate-screen relative pb-32">
      <HeroPhoto category={pred.category} height={700} />

      {/* Editorial masthead */}
      <div className="relative z-10 flex min-h-[610px] flex-col px-6 pt-6 text-white">
        <header className="flex items-center justify-between">
          <Wordmark />
          <LocationPill />
        </header>

        <div className="mt-auto pb-2">
          <div className="flex items-center gap-3">
            <span className="t-eyebrow">{longDate(pred.date)}</span>
            <span className="h-px flex-1 bg-white/35" />
            <span className="t-eyebrow text-white/80">{theme.label}</span>
          </div>

          <div className="mt-3 flex items-start" style={{ textShadow: '0 4px 40px rgba(0,0,0,0.35)' }}>
            <span className="t-numeral leading-[0.82]" style={{ fontSize: tempSize(pred.temp, 212) }}>{fmt(pred.temp)}</span>
            <span className="t-display mt-3 text-[63px] leading-none">°C</span>
          </div>

          <h1 className="t-display mt-5 max-w-[300px] text-[39px] leading-[1.05]">{theme.headline}</h1>
          <p className="mt-2 max-w-[290px] text-[14.5px] leading-snug text-white/80">{theme.blurb}</p>

          <p className="mt-4 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-white/65">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" /> Model prediction · London
          </p>
        </div>
      </div>

      <div className="relative z-10 px-6">
        <Button onClick={() => go('input')}>
          Generate new prediction <Icon name="arrow" size={20} />
        </Button>
        {error && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>}

        {/* Pinned golf teaser */}
        <button onClick={() => go('golf')} className="group relative mt-7 block h-[168px] w-full overflow-hidden rounded-[6px] text-left text-white">
          <Photo src={golf.img} pos="center 55%" className="transition duration-700 group-hover:scale-[1.04]" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(95deg, rgba(5,9,14,0.82) 0%, rgba(5,9,14,0.45) 55%, rgba(5,9,14,0.1) 100%)' }} />
          <div className="absolute inset-0 flex flex-col justify-between p-5">
            <span className="t-eyebrow flex items-center gap-2 text-white/85">
              <Icon name="golf" size={15} /> Pinned · Golf
            </span>
            <div>
              <div className="t-display text-[35px] leading-none">{golf.rating}</div>
              <div className="mt-1.5 max-w-[240px] text-[13px] leading-snug text-white/80">{golf.headline}</div>
            </div>
          </div>
          <span className="absolute bottom-5 right-5 grid h-10 w-10 place-items-center rounded-full border border-white/50">
            <Icon name="arrow" size={18} />
          </span>
        </button>

        {/* Activities rail */}
        <section className="mt-10">
          <SectionHead eyebrow="For this forecast" title="Suggested today" action={<TextLink onClick={() => go('activities')}>See all</TextLink>} />
          <div className="no-scrollbar -mx-6 flex snap-x gap-3 overflow-x-auto px-6">
            {ACTIVITIES[pred.category].slice(0, 5).map((a) => (
              <button key={a.id} onClick={() => go('activities')} className="relative h-[210px] w-[148px] shrink-0 snap-start overflow-hidden rounded-[6px] text-left text-white">
                <Photo src={a.img} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,9,14,0.85) 0%, rgba(5,9,14,0) 60%)' }} />
                <div className="absolute inset-x-3.5 bottom-3.5">
                  <div className="t-eyebrow mb-1 text-[9px] text-white/70">{a.indoor ? 'Indoors' : 'Outdoors'}</div>
                  <div className="t-display text-[23px] leading-[1.05]">{a.name}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Weather state preview */}
        <section className="mt-10">
          <SectionHead eyebrow="Try a scenario" title="Weather conditions" />
          <div className="no-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6">
            {PRESETS.map((p) => {
              const on = p.id === activeId
              return (
                <button key={p.id} onClick={() => setScenario(p.id)} className="w-[76px] shrink-0 text-left" aria-pressed={on}>
                  <div className="h-[100px] overflow-hidden rounded-[6px] transition" style={{ outline: on ? '2px solid var(--accent)' : '2px solid transparent', outlineOffset: 3 }}>
                    <Photo src={THEMES[p.category].hero} pos="center 40%" />
                  </div>
                  <div className="mt-2 text-[12px] font-semibold" style={{ color: on ? 'var(--ink)' : 'var(--ink-soft)' }}>
                    {THEMES[p.category].label}
                  </div>
                </button>
              )
            })}
          </div>
          <p className="mt-5 text-[11.5px] leading-snug" style={{ color: 'var(--ink-soft)' }}>
            Predictions use the trained model and historical temperature observations in the project dataset.
          </p>
        </section>
      </div>
    </div>
  )
}
