import { Icon } from '../components/Icon'
import { ActivityThumb, Eyebrow, HeroPhoto, Photo, SectionHead, TextLink } from '../components/ui'
import { ACTIVITIES, INPUT_META, THEMES, fmt, golfAdvice, longDate, type Prediction, type Screen } from '../lib/weather'

export function Details({ pred, go }: { pred: Prediction; go: (s: Screen) => void }) {
  const theme = THEMES[pred.category]
  const golf = golfAdvice(pred)
  const rows: [string, string][] = [
    ['Prediction', 'Mean daily temperature'],
    ['Likely range', `${fmt(pred.low)}° to ${fmt(pred.high)}°C`],
    ['Category', theme.label],
    ['Category rule', pred.rule],
    ['Past temperatures', 'Supplied by the backend'],
    ['Data status', 'Trained model'],
  ]
  return (
    <div className="animate-screen relative pb-32">
      <HeroPhoto category={pred.category} height={330} scrim="strong" />
      <header className="relative z-10 px-6 pb-6 pt-14 text-white">
        <span className="t-eyebrow text-white/75">Forecast details</span>
        <h1 className="t-display mt-3 text-[46px] leading-[1]">{longDate(pred.date)}</h1>
        <div className="mt-5 flex items-start">
          <span className="t-numeral text-[110px] leading-[0.82]">{fmt(pred.temp)}</span>
          <span className="t-display mt-1.5 text-[39px] leading-none">°C</span>
          <span className="ml-auto self-end rounded-full bg-white px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#10151a]">{theme.label}</span>
        </div>
      </header>

      <div className="relative z-10 px-6">
        <section className="pt-2">
          <SectionHead eyebrow="Entered by you" title="Conditions" />
          <ul>
            {INPUT_META.map((m) => {
              const v = pred.inputs[m.key]
              const pct = Math.max(2, ((v - m.min) / (m.max - m.min)) * 100)
              return (
                <li key={m.key} className="border-b py-4 hairline">
                  <div className="flex items-baseline justify-between">
                    <span className="flex items-center gap-2 text-[14px] font-semibold">
                      <Icon name={m.icon} size={16} /> {m.label}
                    </span>
                    <span>
                      <span className="t-numeral text-[32px] leading-none">{v}</span>
                      <span className="ml-1 text-[11px] font-semibold" style={{ color: 'var(--ink-soft)' }}>
                        {m.unit}
                      </span>
                    </span>
                  </div>
                  <div className="mt-3 h-[2px] w-full" style={{ background: 'var(--line)' }}>
                    <div className="h-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                  </div>
                  <div className="mt-2 text-[12.5px]" style={{ color: 'var(--ink-soft)' }}>
                    {m.describe(v)}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="mt-10">
          <SectionHead eyebrow="Report" title="About this prediction" />
          <dl>
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-6 border-b py-3.5 hairline">
                <dt className="text-[13px]" style={{ color: 'var(--ink-soft)' }}>
                  {k}
                </dt>
                <dd className="max-w-[60%] text-right text-[13.5px] font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10">
          <SectionHead eyebrow="Recommended" title="Activities" action={<TextLink onClick={() => go('activities')}>All</TextLink>} />
          <button onClick={() => go('golf')} className="flex w-full items-center gap-4 border-b py-3 text-left hairline">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[6px]">
              <Photo src={golf.img} />
            </div>
            <div className="min-w-0 flex-1">
              <Eyebrow>Pinned · Golf</Eyebrow>
              <div className="t-display text-[24px] leading-tight">{golf.rating}</div>
            </div>
            <Icon name="next" size={18} />
          </button>
          {ACTIVITIES[pred.category].map((a) => (
            <button key={a.id} onClick={() => go('activities')} className="flex w-full items-center gap-4 border-b py-3 text-left hairline">
              <ActivityThumb a={a} size={56} />
              <div className="min-w-0 flex-1">
                <div className="t-display text-[24px] leading-tight">{a.name}</div>
                <div className="text-[12px] font-medium" style={{ color: 'var(--ink-soft)' }}>
                  {a.indoor ? 'Indoors' : 'Outdoors'}
                </div>
              </div>
              <Icon name="next" size={18} />
            </button>
          ))}
        </section>
      </div>
    </div>
  )
}
