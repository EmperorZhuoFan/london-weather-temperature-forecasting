import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { HeroPhoto, NavBar } from './components/ui'
import { Home } from './screens/Home'
import { InputScreen } from './screens/Input'
import { Result } from './screens/Result'
import { Activities } from './screens/Activities'
import { Details } from './screens/Details'
import { Golf } from './screens/Golf'
import {
  CATEGORY_ORDER,
  DEFAULT_INPUTS,
  PRESETS,
  THEMES,
  presetDate,
  toISO,
  type Inputs,
  type Prediction,
  type Screen,
} from './lib/weather'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [pred, setPred] = useState<Prediction | null>(null)
  const [date, setDate] = useState(() => toISO(new Date()))
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [screen])

  const requestPrediction = async (predictionDate: string, weatherInputs: Inputs): Promise<Prediction> => {
    const apiUrl = import.meta.env.VITE_API_URL ?? ''
    const response = await fetch(`${apiUrl}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: predictionDate, inputs: weatherInputs }),
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(typeof result.detail === 'string' ? result.detail : `Prediction failed (${response.status}).`)
    }
    return result as Prediction
  }

  const loadInitialPrediction = async () => {
    setLoading(true)
    setError('')
    try {
      setPred(await requestPrediction(date, inputs))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not connect to the prediction API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadInitialPrediction()
  }, [])

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      setPred(await requestPrediction(date, inputs))
      setScreen('result')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Prediction failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const setScenario = async (id: string) => {
    const p = PRESETS.find((x) => x.id === id)!
    const scenarioDate = presetDate(p)
    setDate(scenarioDate)
    setInputs(p.inputs)
    setLoading(true)
    setError('')
    try {
      setPred(await requestPrediction(scenarioDate, p.inputs))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Prediction failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!pred) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#0b0f17] p-8 text-white">
        <div className="max-w-sm text-center">
          <p className="t-eyebrow text-white/60">{loading ? 'Connecting to the model' : 'Prediction service unavailable'}</p>
          <h1 className="t-wide mt-3 text-3xl uppercase">Mizzle</h1>
          <p className="mt-4 text-sm text-white/70">{loading ? 'Loading the London weather model…' : error}</p>
          {!loading && (
            <button onClick={() => void loadInitialPrediction()} className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0b0f17]">
              Try again
            </button>
          )}
        </div>
      </main>
    )
  }

  const theme = THEMES[pred.category]

  return (
    <main className="flex min-h-dvh items-center justify-center gap-16 bg-[#0b0f17] sm:p-8">
      <aside className="hidden max-w-[300px] text-white lg:block">
        <p className="t-eyebrow text-white/50">London weather</p>
        <h1 className="t-wide mt-3 text-[34px] uppercase leading-none tracking-[0.06em]">Mizzle</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-white/65">
          London temperature forecasting with a machine-learning model, weather-matched activities and a pinned golf recommendation.
        </p>
        <p className="t-eyebrow mt-10 text-white/50">Weather themes</p>
        <div className="mt-3 divide-y divide-white/10 border-y border-white/10">
          {CATEGORY_ORDER.map((c) => {
            const t = THEMES[c]
            const preset = PRESETS.find((p) => p.category === c)!
            return (
              <button
                key={c}
                onClick={() => {
                  setScenario(preset.id)
                  setScreen('home')
                }}
                className={`flex w-full items-center gap-3 py-2.5 text-left text-[14px] font-medium transition ${pred.category === c ? 'text-white' : 'text-white/55 hover:text-white'}`}
              >
                <span className="h-9 w-9 overflow-hidden rounded-[6px]">
                  <img src={t.hero} alt="" className="h-full w-full object-cover" />
                </span>
                {t.label}
              </button>
            )
          })}
        </div>
      </aside>

      <div
        className="relative h-dvh w-full overflow-hidden sm:h-[844px] sm:w-[390px] sm:rounded-[52px] sm:border-[10px] sm:border-[#1b2230] sm:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]"
        style={{ ...(theme.vars as CSSProperties), color: 'var(--ink)', background: 'var(--bg)' }}
      >
        <div ref={scroller} className="no-scrollbar absolute inset-0 overflow-y-auto overflow-x-hidden">
          <div key={screen} className="min-h-full">
            {screen === 'home' && <Home pred={pred} go={setScreen} setScenario={setScenario} error={error} />}
            {screen === 'input' && (
              <InputScreen category={pred.category} date={date} setDate={setDate} inputs={inputs} setInputs={setInputs} onGenerate={generate} loading={loading} error={error} />
            )}
            {screen === 'result' && <Result pred={pred} go={setScreen} />}
            {screen === 'activities' && <Activities pred={pred} go={setScreen} />}
            {screen === 'golf' && <Golf pred={pred} go={setScreen} />}
            {screen === 'details' && <Details pred={pred} go={setScreen} />}
          </div>
        </div>

        <NavBar screen={screen} go={setScreen} />

        {loading && (
          <div className="absolute inset-0 z-40 animate-fade overflow-hidden text-white">
            <HeroPhoto category={pred.category} height={844} scrim="strong" />
            <div className="absolute inset-0 backdrop-blur-xl" style={{ background: 'rgba(6,10,16,0.55)' }} />
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2">
              <div className="t-eyebrow text-white/70">Please wait</div>
              <div className="t-display mt-3 text-[51px] leading-none">Preparing your report</div>
              <p className="mt-3 text-[14px] text-white/70">Combining your conditions with recent temperatures.</p>
              <div className="mt-8 h-px w-full bg-white/25">
                <div className="animate-progress h-full bg-white" />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
