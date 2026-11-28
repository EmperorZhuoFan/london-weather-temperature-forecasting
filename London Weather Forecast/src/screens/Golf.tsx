import { Eyebrow, Photo, SectionHead } from '../components/ui'
import { Icon } from '../components/Icon'
import { fmt, golfAdvice, longDate, type Prediction, type Screen } from '../lib/weather'

export function Golf({ pred, go }: { pred: Prediction; go: (s: Screen) => void }) {
  const g = golfAdvice(pred)
  const outdoor = g.mode === 'outdoor'
  const facts = [
    ['Temperature', `${fmt(pred.temp)}°C`, 'thermo'],
    ['Rain', pred.inputs.precip === 0 ? 'Dry' : `${fmt(pred.inputs.precip)} mm`, 'drop'],
    ['Cloud', `${pred.inputs.cloud}/8`, 'cloud'],
  ]

  return (
    <div className="animate-screen pb-32">
      <div className="relative h-[520px] overflow-hidden text-white">
        <Photo src={g.img} pos="center 55%" className="animate-kenburns" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(4,8,12,0.55) 0%, rgba(4,8,12,0.05) 30%, rgba(4,8,12,0.4) 62%, var(--bg) 100%)' }} />
        <div className="absolute inset-x-6 top-6 flex items-center justify-between">
          <button onClick={() => go('activities')} aria-label="Back to activities" className="glass-dark grid h-10 w-10 place-items-center rounded-full">
            <Icon name="back" size={20} />
          </button>
          <span className="t-eyebrow flex items-center gap-2">
            <Icon name="golf" size={15} /> Pinned · Golf
          </span>
          <span className="h-10 w-10" />
        </div>
        <div className="absolute inset-x-6 bottom-8">
          <div className="t-eyebrow text-white/80">{longDate(pred.date)}</div>
          <h1 className="t-display mt-2 text-[111px] leading-[0.85] uppercase">Golf</h1>
          <span className="mt-5 inline-block rounded-full bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#10151a]">{g.rating}</span>
        </div>
      </div>

      <div className="px-6">
        <h2 className="t-display text-[39px] leading-[1.05]">{g.headline}</h2>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          {g.summary}
        </p>

        {/* Outdoor playability */}
        <section className="mt-8 border-t pt-4 hairline">
          <div className="flex items-end justify-between">
            <Eyebrow>Outdoor playability</Eyebrow>
            <span className="t-numeral text-[39px] leading-none">
              {g.score}
              <span className="text-[16px]" style={{ color: 'var(--ink-soft)' }}>
                /100
              </span>
            </span>
          </div>
          <div className="mt-3 h-[3px] w-full" style={{ background: 'var(--line)' }}>
            <div className="h-full transition-all duration-700" style={{ width: `${g.score}%`, background: 'var(--accent)' }} />
          </div>
          <div className="mt-5 grid grid-cols-3">
            {facts.map(([k, v, icon], i) => (
              <div key={k} className={i ? 'border-l pl-4 hairline' : ''}>
                <Icon name={icon} size={17} />
                <div className="t-display mt-2 text-[28px] leading-none">{v}</div>
                <div className="mt-1 text-[11.5px] font-medium" style={{ color: 'var(--ink-soft)' }}>
                  {k}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 flex items-start gap-3 border-y py-4 hairline">
          <Icon name="clock" size={20} className="mt-0.5 shrink-0" />
          <div>
            <Eyebrow>{outdoor ? 'Best time to play' : 'When to go'}</Eyebrow>
            <p className="mt-1 text-[14.5px] leading-snug">{g.window}</p>
          </div>
        </section>

        <section className="mt-10">
          <SectionHead eyebrow={outdoor ? 'Outdoor' : 'Indoor'} title="Ways to play today" />
          <ul>
            {g.formats.map((f, i) => (
              <li key={f.name} className="flex items-baseline gap-4 border-b py-4 hairline">
                <span className="t-numeral w-8 text-[25px]" style={{ color: 'var(--accent)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="t-display text-[27px] leading-tight">{f.name}</div>
                  <div className="mt-0.5 text-[13px]" style={{ color: 'var(--ink-soft)' }}>
                    {f.note}
                  </div>
                </div>
                <span className="text-[12px] font-semibold" style={{ color: 'var(--ink-soft)' }}>
                  {f.length}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <SectionHead eyebrow="Before you go" title="Three tips" />
          <ol className="space-y-4">
            {g.tips.map((t, i) => (
              <li key={t} className="flex gap-4 text-[14.5px] leading-snug">
                <span className="t-eyebrow pt-1" style={{ color: 'var(--accent)' }}>
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-8 flex items-start gap-2.5 border-t pt-4 text-[13px] leading-snug hairline" style={{ color: 'var(--ink-soft)' }}>
          <Icon name="info" size={17} className="mt-px shrink-0" />
          {g.alt}
        </p>
      </div>
    </div>
  )
}
