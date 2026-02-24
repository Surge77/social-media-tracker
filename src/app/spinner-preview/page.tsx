'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import spinnerData from './spinners.json'

/* ── ldrs CSS imports (required for animations) ─────────────────────── */
import 'ldrs/react/Quantum.css'
import 'ldrs/react/Waveform.css'
import 'ldrs/react/Helix.css'
import 'ldrs/react/ChaoticOrbit.css'
import 'ldrs/react/TailChase.css'
import 'ldrs/react/Trefoil.css'
import 'ldrs/react/NewtonsCradle.css'
import 'ldrs/react/Reuleaux.css'
import 'ldrs/react/Pulsar.css'
import 'ldrs/react/Infinity.css'
import 'ldrs/react/Spiral.css'
import 'ldrs/react/Leapfrog.css'
import 'ldrs/react/Mirage.css'
import 'ldrs/react/DotWave.css'
import 'ldrs/react/Pinwheel.css'
import 'ldrs/react/Zoomies.css'
import 'ldrs/react/Ring2.css'
import 'ldrs/react/Jelly.css'
import 'ldrs/react/Hatch.css'
import 'ldrs/react/Miyagi.css'
import 'ldrs/react/Momentum.css'
import 'ldrs/react/Ripples.css'
import 'ldrs/react/Superballs.css'
import 'ldrs/react/Metronome.css'
import 'ldrs/react/LineWobble.css'
import 'ldrs/react/Squircle.css'
import 'ldrs/react/JellyTriangle.css'
import 'ldrs/react/Hourglass.css'
import 'ldrs/react/Wobble.css'
import 'ldrs/react/Cardio.css'

/* ── brand color ────────────────────────────────────────────────────── */
const O = 'hsl(16,100%,60%)'     // orange
const O2 = 'hsl(30,100%,65%)'     // light orange
const DM = 'hsl(16,100%,60%,0.2)' // dim orange

const KEYFRAMES = `
@keyframes sp-spin    { to { transform:rotate(360deg) } }
@keyframes sp-spin-r  { to { transform:rotate(-360deg) } }
@keyframes sp-bar {
  0%,100%{ transform:scaleY(.3);opacity:.4 }
  50%    { transform:scaleY(1);opacity:1 }
}
@keyframes sp-bounce {
  0%,80%,100%{ transform:scale(.5);opacity:.3 }
  40%        { transform:scale(1);opacity:1 }
}
@keyframes sp-ping {
  0%      { transform:scale(.3);opacity:1 }
  100%    { transform:scale(2);opacity:0 }
}
@keyframes sp-fade {
  0%,100%{ opacity:.1 }
  50%    { opacity:1 }
}
@keyframes sp-scan {
  0%  { top:0%;opacity:0 }
  5%  { opacity:1 }
  95% { opacity:1 }
  100%{ top:92%;opacity:0 }
}
@keyframes sp-blink {
  0%,49% { opacity:1 }
  50%,100%{ opacity:0 }
}
@keyframes sp-morph {
  0%,100%{ border-radius:50% 50% 50% 50%/50% 50% 50% 50% }
  33%    { border-radius:70% 30% 60% 40%/40% 60% 30% 70% }
  66%    { border-radius:30% 70% 40% 60%/60% 40% 70% 30% }
}
@keyframes sp-cube {
  0%  { transform:rotateX(0) rotateY(0) }
  100%{ transform:rotateX(360deg) rotateY(360deg) }
}
@keyframes sp-orbit {
  from{ transform:rotate(0deg) translateX(14px) rotate(0deg) }
  to  { transform:rotate(360deg) translateX(14px) rotate(-360deg) }
}
`

/* inject keyframes into <head> — only reliable place in Next.js */
function useKeyframes() {
  useEffect(() => {
    if (document.getElementById('sp-kf')) return
    const el = document.createElement('style')
    el.id = 'sp-kf'
    el.textContent = KEYFRAMES
    document.head.appendChild(el)
    return () => { document.getElementById('sp-kf')?.remove() }
  }, [])
}

/* ── ldrs dynamic imports ───────────────────────────────────────────── */
const mk = (name: string) =>
  dynamic(
    () => import('ldrs/react').then(m => ({ default: (m as Record<string, React.ComponentType<Record<string, unknown>>>)[name] })),
    { ssr: false, loading: () => <div style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid ${DM}`, borderTopColor: O, animation: 'sp-spin .8s linear infinite' }} /> }
  )

const Quantum = mk('Quantum')
const Waveform = mk('Waveform')
const Helix = mk('Helix')
const ChaoticOrbit = mk('ChaoticOrbit')
const TailChase = mk('TailChase')
const Trefoil = mk('Trefoil')
const NewtonsCradle = mk('NewtonsCradle')
const Reuleaux = mk('Reuleaux')
const Pulsar = mk('Pulsar')
const InfinityL = mk('Infinity')
const Spiral = mk('Spiral')
const Leapfrog = mk('Leapfrog')
const Mirage = mk('Mirage')
const DotWave = mk('DotWave')
const Pinwheel = mk('Pinwheel')
const Zoomies = mk('Zoomies')
const Ring2 = mk('Ring2')
const Jelly = mk('Jelly')
const Hatch = mk('Hatch')
const Miyagi = mk('Miyagi')
const Momentum = mk('Momentum')
const Ripples = mk('Ripples')
const Superballs = mk('Superballs')
const Metronome = mk('Metronome')
const LineWobble = mk('LineWobble')
const Squircle = mk('Squircle')
const JellyTriangle = mk('JellyTriangle')
const Hourglass = mk('Hourglass')
const Wobble = mk('Wobble')
const Cardio = mk('Cardio')

/* ── CSS-only spinners ──────────────────────────────────────────────── */
function S1() { // Conic ring
  return (
    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `conic-gradient(from 0deg,transparent,${O})`, animation: 'sp-spin .85s linear infinite' }}>
      <div style={{ width: '70%', height: '70%', borderRadius: '50%', background: 'var(--background)', margin: '15%' }} />
    </div>
  )
}
function S2() { // Conic + glow
  return (
    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `conic-gradient(from 0deg,transparent,${O} 70%,${O2},transparent)`, animation: 'sp-spin 1s linear infinite', boxShadow: `0 0 14px ${DM}` }}>
      <div style={{ width: '65%', height: '65%', borderRadius: '50%', background: 'var(--background)', margin: '17.5%' }} />
    </div>
  )
}
function S3() { // Dual arc
  return (
    <div style={{ width: 44, height: 44, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${DM}`, borderTopColor: O, borderRightColor: O, animation: 'sp-spin 1s linear infinite' }} />
      <div style={{ position: 'absolute', inset: 7, borderRadius: '50%', border: `2px solid ${DM}`, borderBottomColor: O2, borderLeftColor: O2, animation: 'sp-spin-r .7s linear infinite' }} />
    </div>
  )
}
function S4() { // Glow ring
  return (
    <div style={{ width: 44, height: 44, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${DM}` }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: O, animation: 'sp-spin .75s linear infinite', boxShadow: `0 0 12px ${DM}` }} />
    </div>
  )
}
function S5() { // Bar wave
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 44, padding: '8px 0' }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{ width: 5, height: 28, borderRadius: 3, background: O, animation: `sp-bar 1.1s ease-in-out ${i * .12}s infinite` }} />
      ))}
    </div>
  )
}
function S6() { // Segment pulse
  const n = 8, r = 14
  return (
    <div style={{ width: 44, height: 44, position: 'relative' }}>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * 360, rad = (a * Math.PI) / 180
        return (
          <div key={i} style={{ position: 'absolute', left: 22 + r * Math.sin(rad) - 2, top: 22 - r * Math.cos(rad) - 6, width: 4, height: 12, borderRadius: 2, background: O, transform: `rotate(${a}deg)`, transformOrigin: `2px ${6 + r}px`, animation: `sp-fade 1s ease-in-out ${(i / n) * -1}s infinite` }} />
        )
      })}
    </div>
  )
}
function S7() { // Dot bounce
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 44 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: O, animation: `sp-bounce 1.3s ease-in-out ${i * .18}s infinite` }} />
      ))}
    </div>
  )
}
function S8() { // Ping rings
  return (
    <div style={{ width: 44, height: 44, position: 'relative' }}>
      <div style={{ position: 'absolute', top: '38%', left: '38%', width: '24%', height: '24%', borderRadius: '50%', background: O }} />
      <div style={{ position: 'absolute', inset: '15%', borderRadius: '50%', border: `2px solid ${O}`, animation: 'sp-ping 1.6s ease-out 0s infinite' }} />
      <div style={{ position: 'absolute', inset: '15%', borderRadius: '50%', border: `2px solid ${O}`, animation: 'sp-ping 1.6s ease-out .8s infinite' }} />
    </div>
  )
}
function S9() { // Morph blob
  return (
    <div style={{ width: 30, height: 30, background: `linear-gradient(135deg,${O},${O2})`, animation: 'sp-morph 2.5s ease-in-out infinite, sp-spin 6s linear infinite' }} />
  )
}
function S10() { // 3D cube
  const face: React.CSSProperties = { position: 'absolute', width: '100%', height: '100%', border: `1.5px solid ${O}`, background: 'hsl(16,100%,60%,0.07)' }
  return (
    <div style={{ width: 44, height: 44, perspective: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 22, height: 22, position: 'relative', transformStyle: 'preserve-3d', animation: 'sp-cube 3s linear infinite' }}>
        <div style={{ ...face, transform: 'translateZ(11px)' }} />
        <div style={{ ...face, transform: 'rotateY(180deg) translateZ(11px)' }} />
        <div style={{ ...face, transform: 'rotateY(90deg) translateZ(11px)' }} />
        <div style={{ ...face, transform: 'rotateY(-90deg) translateZ(11px)' }} />
        <div style={{ ...face, transform: 'rotateX(90deg) translateZ(11px)' }} />
        <div style={{ ...face, transform: 'rotateX(-90deg) translateZ(11px)' }} />
      </div>
    </div>
  )
}
function S11() { // Neon scanner
  return (
    <div style={{ width: 44, height: 44, border: `1px solid ${DM}`, borderRadius: 4, position: 'relative', overflow: 'hidden', background: `hsl(16,100%,60%,0.04)` }}>
      <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${O},transparent)`, boxShadow: `0 0 8px ${O}`, animation: 'sp-scan 1.8s linear infinite' }} />
    </div>
  )
}
function S12() { // Terminal cursor
  return (
    <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: O, fontFamily: 'monospace' }}>
      <span style={{ animation: 'sp-blink 1s step-end infinite' }}>█</span>
    </div>
  )
}
function S13() { // Orbit trail
  return (
    <div style={{ width: 44, height: 44, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: O, opacity: .4 }} />
      {[0, 1, 2].map(i => (
        <div key={i} style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: O, animation: `sp-orbit ${1.2 + i * .4}s linear ${i * -.4}s infinite`, opacity: 1 - i * .25 }} />
      ))}
    </div>
  )
}

/* ── card + layout ──────────────────────────────────────────────────── */
function Card({ id, label, desc, children }: { id: string; label: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 12px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: '0 0 3px', fontSize: 11.5, fontWeight: 600, color: 'var(--foreground)' }}>{label}</p>
        <code style={{ display: 'inline-block', margin: '0 0 5px', fontSize: 9.5, color: 'var(--muted-foreground)', background: 'var(--muted)', padding: '1px 6px', borderRadius: 3 }}>{id}</code>
        <p style={{ margin: 0, fontSize: 10, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  )
}

const GRID: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }

export default function SpinnerPreviewPage() {
  useKeyframes()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--foreground)', marginBottom: 6 }}>Spinner Preview</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12.5, lineHeight: 1.7, marginBottom: 36 }}>
          Tell me the <strong style={{ color: 'var(--foreground)' }}>id</strong> under any spinner and I&apos;ll replace the current one everywhere.<br />
          <strong>Section A</strong> = ldrs (physics-based, loads in ~1s). <strong>Section B</strong> = pure CSS (instant, never lags).
        </p>

        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', marginBottom: 10 }}>A — ldrs library (30 spinners)</h2>
        <div style={{ ...GRID, marginBottom: 40 }}>
          <Card id="quantum" label="Quantum" desc="Two rings orbiting."><Quantum size={44} color={O} speed={1.75} /></Card>
          <Card id="waveform" label="Waveform" desc="Audio EQ bars."><Waveform size={44} color={O} speed={1} /></Card>
          <Card id="helix" label="Helix" desc="DNA double helix."><Helix size={44} color={O} speed={2.5} /></Card>
          <Card id="chaoticOrbit" label="Chaotic Orbit" desc="Orbital chaos."><ChaoticOrbit size={44} color={O} speed={1.5} /></Card>
          <Card id="tailChase" label="Tail Chase" desc="Spiral tail chase."><TailChase size={44} color={O} speed={1.75} /></Card>
          <Card id="trefoil" label="Trefoil Knot" desc="Math knot shape."><Trefoil size={44} color={O} speed={1.75} /></Card>
          <Card id="newtonsCradle" label="Newton's Cradle" desc="Physics pendulum."><NewtonsCradle size={44} color={O} speed={2.5} /></Card>
          <Card id="reuleaux" label="Reuleaux" desc="Geometric triangle."><Reuleaux size={44} color={O} speed={1.75} /></Card>
          <Card id="pulsar" label="Pulsar" desc="Pulse rings. Sonar."><Pulsar size={44} color={O} speed={1.75} /></Card>
          <Card id="infinity" label="Infinity" desc="∞ symbol spinning."><InfinityL size={44} color={O} speed={2} /></Card>
          <Card id="spiral" label="Spiral" desc="Tightening spiral."><Spiral size={44} color={O} speed={2} /></Card>
          <Card id="leapfrog" label="Leapfrog" desc="Dots leaping over."><Leapfrog size={44} color={O} speed={2.5} /></Card>
          <Card id="mirage" label="Mirage" desc="Heat mirage blur."><Mirage size={44} color={O} speed={2.5} /></Card>
          <Card id="dotWave" label="Dot Wave" desc="Wave of dots."><DotWave size={44} color={O} speed={1} /></Card>
          <Card id="pinwheel" label="Pinwheel" desc="Spinning pinwheel."><Pinwheel size={44} color={O} speed={1.75} /></Card>
          <Card id="zoomies" label="Zoomies" desc="Dot zoom circle."><Zoomies size={44} color={O} speed={1.4} /></Card>
          <Card id="ring2" label="Ring 2" desc="Ring + bouncing ball."><Ring2 size={44} color={O} speed={0.6} /></Card>
          <Card id="jelly" label="Jelly" desc="Jelly blob bounce."><Jelly size={44} color={O} speed={0.9} /></Card>
          <Card id="hatch" label="Hatch" desc="Hatching lines."><Hatch size={44} color={O} speed={3.5} /></Card>
          <Card id="miyagi" label="Miyagi" desc="Folding arc."><Miyagi size={44} color={O} speed={0.9} /></Card>
          <Card id="momentum" label="Momentum" desc="Accel/decel ring."><Momentum size={44} color={O} speed={1.1} /></Card>
          <Card id="ripples" label="Ripples" desc="Water ripple rings."><Ripples size={44} color={O} speed={2} /></Card>
          <Card id="superballs" label="Superballs" desc="Balls with gravity."><Superballs size={44} color={O} speed={1.4} /></Card>
          <Card id="metronome" label="Metronome" desc="Pendulum swing."><Metronome size={44} color={O} speed={1} /></Card>
          <Card id="lineWobble" label="Line Wobble" desc="Wobbling line."><LineWobble size={44} color={O} speed={1.75} /></Card>
          <Card id="squircle" label="Squircle" desc="Square-circle morph."><Squircle size={44} color={O} speed={0.9} /></Card>
          <Card id="jellyTriangle" label="Jelly Triangle" desc="Triangle + jelly."><JellyTriangle size={44} color={O} speed={1.25} /></Card>
          <Card id="hourglass" label="Hourglass" desc="Rotating hourglass."><Hourglass size={44} color={O} speed={1.75} /></Card>
          <Card id="wobble" label="Wobble" desc="Wobbling disc."><Wobble size={44} color={O} speed={1} /></Card>
          <Card id="cardio" label="Cardio" desc="Heartbeat arc pulse."><Cardio size={44} color={O} speed={2} /></Card>
        </div>

        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', marginBottom: 10 }}>B — Pure CSS (13 spinners)</h2>
        <div style={{ ...GRID, marginBottom: 36 }}>
          <Card id="css-conic" label="Conic Gradient" desc="Gradient sweep ring.">   <S1 /></Card>
          <Card id="css-conic2" label="Conic + Glow" desc="Conic with glow trail."> <S2 /></Card>
          <Card id="css-dual" label="Dual Arc" desc="Two arcs counter-spin."> <S3 /></Card>
          <Card id="css-glow" label="Glow Ring" desc="Ring with neon glow.">   <S4 /></Card>
          <Card id="css-bars" label="Bar Wave" desc="5 bars waving.">          <S5 /></Card>
          <Card id="css-segment" label="Segment Pulse" desc="Radial bars fading.">    <S6 /></Card>
          <Card id="css-dots" label="Dot Bounce" desc="3 dots bouncing.">        <S7 /></Card>
          <Card id="css-ping" label="Ping Rings" desc="Sonar expanding rings."> <S8 /></Card>
          <Card id="css-morph" label="Morph Blob" desc="Shape-shifting blob.">   <S9 /></Card>
          <Card id="css-cube" label="3D Cube" desc="CSS 3D rotating cube.">  <S10 /></Card>
          <Card id="css-scanner" label="Neon Scanner" desc="Radar scan on grid.">    <S11 /></Card>
          <Card id="css-terminal" label="Terminal Cursor" desc="Blinking block cursor."> <S12 /></Card>
          <Card id="css-orbit" label="Orbit Trail" desc="Multi-dot orbit.">        <S13 /></Card>
        </div>

        {/* C — CLI spinners */}
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', marginBottom: 4 }}>C — CLI / ora spinners (90 spinners)</h2>
        <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 14, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
          Frame data from <code style={{ background: 'var(--muted)', padding: '1px 5px', borderRadius: 3 }}>cli-spinners</code> — the same library used by <code style={{ background: 'var(--muted)', padding: '1px 5px', borderRadius: 3 }}>ora</code>, <code style={{ background: 'var(--muted)', padding: '1px 5px', borderRadius: 3 }}>inquirer</code>, and most Node CLI tools. Rendered as animated Unicode in the browser.
        </p>
        <CliSpinnersGrid />

        {/* D — nanospinner */}
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', marginTop: 40, marginBottom: 4 }}>D — nanospinner (state machine)</h2>
        <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 14, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
          <code style={{ background: 'var(--muted)', padding: '1px 5px', borderRadius: 3 }}>nanospinner</code> has one animation (dots braille) but its value is the <strong style={{ color: 'var(--foreground)' }}>state system</strong> — a spinner that transitions to success / error / warn / info when the async task resolves. Used in CLIs like <code style={{ background: 'var(--muted)', padding: '1px 5px', borderRadius: 3 }}>create-next-app</code>.
        </p>
        <NanoSpinnerSection />

        <div style={{ padding: '14px 18px', background: 'var(--muted)', borderRadius: 8, fontSize: 11, color: 'var(--muted-foreground)', lineHeight: 1.8, marginTop: 36 }}>
          <strong style={{ color: 'var(--foreground)' }}>How to pick:</strong> tell me the <code style={{ background: 'var(--card)', padding: '1px 5px', borderRadius: 3 }}>id</code> shown under any spinner. ldrs ones take ~1s to hydrate on first load — if you see a spinning ring placeholder, wait a moment.
        </div>
      </div>
    </div>
  )
}

/* ── nanospinner ─────────────────────────────────────────────────────── */
const NS_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const NS_INTERVAL = 80

type NanoState = 'spinning' | 'success' | 'error' | 'warn' | 'info'
const NS_STATES: { state: NanoState; symbol: string; color: string; label: string; text: string; desc: string }[] = [
  { state: 'spinning', symbol: '⠼', color: O, label: 'Spinning', text: 'Fetching data…', desc: 'Active — spinner animates at 80ms' },
  { state: 'success', symbol: '✔', color: 'hsl(142,71%,45%)', label: 'Success', text: 'Done!', desc: '.success({ text }) — green tick' },
  { state: 'error', symbol: '✖', color: 'hsl(0,72%,51%)', label: 'Error', text: 'Request failed.', desc: '.error({ text }) — red cross' },
  { state: 'warn', symbol: '⚠', color: 'hsl(38,92%,50%)', label: 'Warning', text: 'Rate limit hit.', desc: '.warn({ text }) — yellow warn' },
  { state: 'info', symbol: 'ℹ', color: 'hsl(210,79%,56%)', label: 'Info', text: 'Retrying in 3s…', desc: '.stop() with info symbol' },
]

function NanoStateCard({ symbol, color, label, text, desc, isSpinning }: {
  symbol: string; color: string; label: string; text: string; desc: string; isSpinning: boolean
}) {
  const [frame, setFrame] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval>>(undefined)
  useEffect(() => {
    if (!isSpinning) { clearInterval(ref.current); return }
    ref.current = setInterval(() => setFrame(f => (f + 1) % NS_FRAMES.length), NS_INTERVAL)
    return () => clearInterval(ref.current)
  }, [isSpinning])

  const displaySymbol = isSpinning ? NS_FRAMES[frame] : symbol

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* terminal line */}
      <div style={{ background: 'hsl(0,0%,8%)', borderRadius: 6, padding: '10px 14px', fontFamily: 'monospace', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color, minWidth: 16, textAlign: 'center' }}>{displaySymbol}</span>
        <span style={{ color: 'hsl(0,0%,80%)' }}>{text}</span>
      </div>
      {/* meta */}
      <div>
        <p style={{ margin: '0 0 3px', fontSize: 11.5, fontWeight: 600, color: 'var(--foreground)' }}>{label}</p>
        <p style={{ margin: 0, fontSize: 10, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  )
}

function NanoLiveDemo() {
  const CYCLE: NanoState[] = ['spinning', 'success', 'spinning', 'error', 'spinning', 'warn', 'spinning', 'info']
  const DURATIONS = [2200, 1400, 2200, 1400, 2200, 1400, 2200, 1400]
  const [stateIdx, setStateIdx] = useState(0)
  const [frame, setFrame] = useState(0)
  const frameRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const cycleRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const current = CYCLE[stateIdx % CYCLE.length]
  const isSpinning = current === 'spinning'
  const meta = NS_STATES.find(s => s.state === current)!

  useEffect(() => {
    if (isSpinning) {
      frameRef.current = setInterval(() => setFrame(f => (f + 1) % NS_FRAMES.length), NS_INTERVAL)
    } else { clearInterval(frameRef.current) }
    return () => clearInterval(frameRef.current)
  }, [isSpinning])

  useEffect(() => {
    cycleRef.current = setTimeout(() => setStateIdx(i => i + 1), DURATIONS[stateIdx % DURATIONS.length])
    return () => clearTimeout(cycleRef.current)
  }, [stateIdx])

  const symbol = isSpinning ? NS_FRAMES[frame] : meta.symbol
  const messages: Record<NanoState, string> = {
    spinning: 'Installing packages…',
    success: 'Packages installed.',
    error: 'Network error.',
    warn: 'Using cache fallback.',
    info: 'Retrying in 3s…',
  }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 16px 14px' }}>
      <p style={{ margin: '0 0 10px', fontSize: 11.5, fontWeight: 600, color: 'var(--foreground)' }}>Live demo — cycles through all states</p>
      <div style={{ background: 'hsl(0,0%,8%)', borderRadius: 6, padding: '12px 16px', fontFamily: 'monospace', fontSize: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: meta.color, minWidth: 18, textAlign: 'center', fontSize: 17 }}>{symbol}</span>
        <span style={{ color: 'hsl(0,0%,80%)' }}>{messages[current]}</span>
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {NS_STATES.map(s => (
          <span key={s.state} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: current === s.state ? `${s.color}22` : 'var(--muted)', color: current === s.state ? s.color : 'var(--muted-foreground)', border: `1px solid ${current === s.state ? s.color + '55' : 'transparent'}`, fontFamily: 'monospace', transition: 'all .2s' }}>
            {s.symbol} {s.state}
          </span>
        ))}
      </div>
      <p style={{ margin: '8px 0 0', fontSize: 10, color: 'var(--muted-foreground)' }}>
        <code style={{ background: 'var(--muted)', padding: '1px 5px', borderRadius: 3 }}>createSpinner(text).start()</code> → then call <code style={{ background: 'var(--muted)', padding: '1px 5px', borderRadius: 3 }}>.success()</code> / <code style={{ background: 'var(--muted)', padding: '1px 5px', borderRadius: 3 }}>.error()</code> / <code style={{ background: 'var(--muted)', padding: '1px 5px', borderRadius: 3 }}>.warn()</code>
      </p>
    </div>
  )
}

function NanoSpinnerSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <NanoLiveDemo />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
        {NS_STATES.map(s => (
          <NanoStateCard key={s.state} {...s} isSpinning={s.state === 'spinning'} />
        ))}
      </div>
      <div style={{ background: 'var(--muted)', borderRadius: 8, padding: '12px 16px', fontSize: 10.5, color: 'var(--muted-foreground)', lineHeight: 1.9, fontFamily: 'monospace' }}>
        <span style={{ color: 'var(--foreground)', fontWeight: 600, fontFamily: 'inherit' }}>Usage:</span><br />
        <span style={{ color: 'hsl(210,79%,65%)' }}>import</span> {'{'} createSpinner {'}'} <span style={{ color: 'hsl(210,79%,65%)' }}>from</span> <span style={{ color: 'hsl(142,71%,55%)' }}>&apos;nanospinner&apos;</span><br />
        <span style={{ color: 'hsl(0,0%,60%)' }}>const</span> spinner = createSpinner(<span style={{ color: 'hsl(142,71%,55%)' }}>&apos;Loading…&apos;</span>).start()<br />
        <span style={{ color: 'hsl(0,0%,60%)' }}>await</span> doWork()<br />
        spinner.success({'{'} text: <span style={{ color: 'hsl(142,71%,55%)' }}>&apos;Done!&apos;</span> {'}'})<br />
        <span style={{ color: 'hsl(0,0%,45%)' }}>// or: spinner.error() / spinner.warn() / spinner.stop()</span>
      </div>
    </div>
  )
}

/* ── CLI spinners grid ───────────────────────────────────────────────── */
const ALL_CLI = spinnerData

function CliSpinner({ name, def }: { name: string; def: { interval: number; frames: string[] } }) {
  const [frame, setFrame] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    ref.current = setInterval(() => {
      setFrame(f => (f + 1) % def.frames.length)
    }, def.interval)
    return () => clearInterval(ref.current)
  }, [def])

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {/* frame display */}
      <div style={{ width: 56, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 22, color: O, lineHeight: 1, whiteSpace: 'pre' }}>
        {def.frames[frame]}
      </div>
      {/* name + id */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: '0 0 3px', fontSize: 11, fontWeight: 600, color: 'var(--foreground)' }}>{name}</p>
        <code style={{ fontSize: 9, color: 'var(--muted-foreground)', background: 'var(--muted)', padding: '1px 5px', borderRadius: 3 }}>cli-{name}</code>
      </div>
    </div>
  )
}

function CliSpinnersGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 8 }}>
      {Object.entries(ALL_CLI).map(([name, def]) => (
        <CliSpinner key={name} name={name} def={def} />
      ))}
    </div>
  )
}
