import { Button, Eyebrow, HeroPhoto, Photo } from '../components/ui'
import { Icon } from '../components/Icon'
import { INPUT_META, PRESETS, THEMES, parseISO, presetDate, toISO, type Category, type Inputs } from '../lib/weather'

function DayStrip({ date, onChange }: { date: string; onChange: (d: string) => void }) {
  const days = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })
  return (
    <div className="no-scrollbar -mx-6 flex gap-1.5 overflow-x-auto px-6">
      {days.map((d) => {
        const iso = toISO(d)
        const on = iso === date
        return (
          <button
            key={iso}
            onClick={() => onChange(iso)}
            aria-pressed={on}
            className="flex h-[76px] w-[52px] shrink-0 flex-col items-center justify-center rounded-[14px] transition"
            style={on ? { background: 'var(--accent)', color: 'var(--accent-ink)' } : { color: 'var(--ink)' }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">{d.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
            <span className="t-numeral mt-0.5 text-[34px] leading-none">{d.getDate()}</span>
            <span className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wider opacity-70">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
          </button>
        )
      })}
    </div>
  )
}

export function InputScreen({
  category,
  date,
  setDate,
  inputs,
  setInputs,
  onGenerate,
  loading,
  error,
}: {
  category: Category
  date: string
  setDate: (d: string) => void
  inputs: Inputs
  setInputs: (i: Inputs) => void
  onGenerate: () => void
  loading: boolean
  error: string
}) {
  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id)!
    setDate(presetDate(p))
    setInputs(p.inputs)
  }
  const set = (k: keyof Inputs, v: number) => setInputs({ ...inputs, [k]: v })

  return (
    <div className="animate-screen relative">
      <HeroPhoto category={category} height={300} scrim="strong" />
      <header className="relative z-10 px-6 pb-8 pt-16 text-white">
        <span className="t-eyebrow text-white/75">Prediction · Step 1 of 2</span>
        <h1 className="t-display mt-3 text-[53px] leading-[0.98]">
          Describe <em>the day</em>
        </h1>
        <p className="mt-3 max-w-[290px] text-[14px] leading-snug text-white/80">Choose a date and set the conditions. We’ll estimate London’s mean temperature.</p>
      </header>

      <div className="relative z-10 px-6 pb-28">
        <section className="pt-1">
          <div className="mb-3 flex items-center justify-between">
            <Eyebrow>Date</Eyebrow>
            <label className="relative flex items-center gap-1.5 text-[12.5px] font-semibold">
              <Icon name="calendar" size={16} /> Pick any date
              <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Choose prediction date" />
            </label>
          </div>
          <DayStrip date={date} onChange={setDate} />
          <p className="mt-3 text-[13px] font-medium" style={{ color: 'var(--ink-soft)' }}>
            {parseISO(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </section>

        <section className="mt-8 border-t pt-4 hairline">
          <Eyebrow>Start from a scenario</Eyebrow>
          <div className="no-scrollbar -mx-6 mt-3 flex gap-3 overflow-x-auto px-6">
            {PRESETS.map((p) => (
              <button key={p.id} onClick={() => applyPreset(p.id)} className="w-[88px] shrink-0 text-left">
                <div className="h-[72px] overflow-hidden rounded-[6px]">
                  <Photo src={THEMES[p.category].hero} pos="center 45%" />
                </div>
                <div className="mt-1.5 text-[12px] font-semibold leading-tight">{p.label}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 border-t hairline">
          {INPUT_META.map((m) => {
            const v = inputs[m.key]
            const pct = ((v - m.min) / (m.max - m.min)) * 100
            return (
              <div key={m.key} className="border-b py-6 hairline">
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[14.5px] font-semibold">
                      <Icon name={m.icon} size={17} /> {m.label}
                    </div>
                    <div className="mt-1 text-[13px] font-medium" style={{ color: 'var(--accent)' }}>
                      {m.describe(v)}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={m.min}
                      max={m.max}
                      step={m.step}
                      value={v}
                      onChange={(e) => {
                        const n = parseFloat(e.target.value)
                        if (!Number.isNaN(n)) set(m.key, Math.max(m.min, Math.min(m.max, n)))
                      }}
                      aria-label={`${m.label} value`}
                      className="t-numeral w-[84px] border-b bg-transparent text-right text-[44px] leading-none outline-none hairline focus:border-[var(--accent)]"
                    />
                    <span className="w-9 text-[11px] font-semibold" style={{ color: 'var(--ink-soft)' }}>
                      {m.unit}
                    </span>
                  </div>
                </div>
                <input type="range" className="range mt-5" min={m.min} max={m.max} step={m.step} value={v} onChange={(e) => set(m.key, parseFloat(e.target.value))} style={{ ['--pct' as string]: `${pct}%` }} aria-label={m.label} />
                <p className="mt-3.5 text-[12.5px] leading-snug" style={{ color: 'var(--ink-soft)' }}>
                  {m.hint}
                </p>
              </div>
            )
          })}
        </section>

        <p className="mt-5 flex items-start gap-2.5 text-[12.5px] leading-snug" style={{ color: 'var(--ink-soft)' }}>
          <Icon name="cpu" size={18} className="mt-px shrink-0" />
          Recent temperature history is gathered automatically by the server, so you only describe the day itself.
        </p>
      </div>

      {/* Sticky action */}
      <div className="sticky bottom-0 z-20 px-6 pb-[92px] pt-10" style={{ background: 'linear-gradient(to top, var(--bg) 62%, transparent)' }}>
        {error && <p role="alert" className="mb-3 text-sm font-medium text-red-700">{error}</p>}
        <Button onClick={onGenerate} disabled={loading}>
          Generate prediction <Icon name="arrow" size={20} />
        </Button>
      </div>
    </div>
  )
}
