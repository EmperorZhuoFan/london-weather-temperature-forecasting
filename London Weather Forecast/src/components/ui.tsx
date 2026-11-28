import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'
import { CATEGORY_ORDER, THEMES, type Activity, type Category, type Screen } from '../lib/weather'

/* ---------- Brand ---------- */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`t-wide text-[19px] uppercase leading-none tracking-[0.06em] ${className}`}>
      Mizzle
    </span>
  )
}

export function LocationPill() {
  return (
    <span className="glass-dark inline-flex items-center gap-1.5 rounded-full py-1.5 pl-2.5 pr-3.5 text-[12px] font-semibold tracking-wide">
      <Icon name="pin" size={14} /> London
    </span>
  )
}

/* ---------- Typography helpers ---------- */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`t-eyebrow ${className}`} style={{ color: 'var(--ink-soft)' }}>
      {children}
    </span>
  )
}

export function SectionHead({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between border-t pt-4 hairline">
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="t-display mt-1 text-[32px] leading-none">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 pb-0.5 text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>
      {children} <Icon name="arrow" size={15} />
    </button>
  )
}

/* ---------- Buttons ---------- */
export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: { variant?: 'primary' | 'outline' } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const style =
    variant === 'primary'
      ? { background: 'var(--accent)', color: 'var(--accent-ink)' }
      : { border: '1px solid var(--line)', color: 'var(--ink)' }
  return (
    <button
      {...rest}
      className={`flex h-[56px] w-full items-center justify-between rounded-[14px] px-6 text-[15px] font-semibold tracking-wide transition active:scale-[0.985] disabled:opacity-60 ${className}`}
      style={style}
    >
      {children}
    </button>
  )
}

/* ---------- Photography ---------- */
export function Photo({ src, alt = '', className = '', pos = 'center' }: { src: string; alt?: string; className?: string; pos?: string }) {
  return <img src={src} alt={alt} loading="lazy" draggable={false} className={`h-full w-full object-cover ${className}`} style={{ objectPosition: pos }} />
}

/* Full-bleed weather photograph with a cross-fade between themes */
export function HeroPhoto({ category, height, scrim = 'default' }: { category: Category; height: number; scrim?: 'default' | 'strong' }) {
  return (
    <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height }}>
      {CATEGORY_ORDER.map((c) => (
        <div key={c} className="absolute inset-0 transition-opacity duration-[1100ms]" style={{ opacity: c === category ? 1 : 0 }}>
          <img src={THEMES[c].hero} alt="" className="animate-kenburns h-full w-full object-cover" style={{ objectPosition: 'center 38%' }} />
        </div>
      ))}
      <div
        className="absolute inset-0"
        style={{
          background:
            scrim === 'strong'
              ? 'linear-gradient(to bottom, rgba(6,10,16,0.55) 0%, rgba(6,10,16,0.35) 35%, rgba(6,10,16,0.7) 72%, var(--bg) 100%)'
              : 'linear-gradient(to bottom, rgba(6,10,16,0.42) 0%, rgba(6,10,16,0.05) 28%, rgba(6,10,16,0.2) 52%, rgba(6,10,16,0.5) 72%, rgba(6,10,16,0.62) 88%, var(--bg) 100%)',
        }}
      />
    </div>
  )
}

/* ---------- Activity components ---------- */
export function FitMeter({ fit, onPhoto = false }: { fit: 2 | 3; onPhoto?: boolean }) {
  return (
    <span className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: onPhoto ? '#fff' : 'var(--ink-soft)' }}>
      <span className="flex gap-[3px]">
        {[1, 2, 3].map((i) => (
          <span key={i} className="h-[3px] w-4 rounded-full" style={{ background: i <= fit ? (onPhoto ? '#fff' : 'var(--accent)') : onPhoto ? 'rgba(255,255,255,0.35)' : 'var(--line)' }} />
        ))}
      </span>
      {fit === 3 ? 'Perfect fit' : 'Great fit'}
    </span>
  )
}

export function ActivityThumb({ a, size = 56 }: { a: Activity; size?: number }) {
  return (
    <div className="shrink-0 overflow-hidden rounded-[6px]" style={{ width: size, height: size }}>
      <Photo src={a.img} />
    </div>
  )
}

/* ---------- Navigation ---------- */
const TABS: { id: Screen; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'input', label: 'Prediction', icon: 'sliders' },
  { id: 'activities', label: 'Activities', icon: 'compass' },
  { id: 'details', label: 'Details', icon: 'list' },
]

export function NavBar({ screen, go }: { screen: Screen; go: (s: Screen) => void }) {
  const active = screen === 'result' ? 'input' : screen === 'golf' ? 'activities' : screen
  return (
    <nav className="glass-nav absolute inset-x-5 bottom-5 z-30 flex items-center justify-between rounded-[22px] px-2 py-1.5" style={{ boxShadow: '0 24px 48px -20px rgba(0,0,0,0.5)' }}>
      {TABS.map((t) => {
        const on = t.id === active
        return (
          <button key={t.id} onClick={() => go(t.id)} aria-current={on ? 'page' : undefined} className="relative flex h-[50px] flex-1 flex-col items-center justify-center gap-[3px] text-[10px] font-semibold tracking-wide" style={{ color: on ? 'var(--ink)' : 'var(--ink-soft)' }}>
            <Icon name={t.icon} size={20} strokeWidth={on ? 1.8 : 1.5} />
            {t.label}
            <span className="absolute -bottom-0.5 h-[3px] rounded-full transition-all" style={{ width: on ? 18 : 0, background: 'var(--accent)' }} />
          </button>
        )
      })}
    </nav>
  )
}
