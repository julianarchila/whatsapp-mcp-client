"use client"

import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  ArrowRight,
  Check,
  MessageCircle,
  Settings,
  Rocket,
  Sparkles,
  Mail,
  Calendar,
  Dumbbell,
  FileText,
  Search,
  NotebookPen,
} from "lucide-react"
import { useRef } from "react"

// tiny classnames helper
function cn(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(" ")
}

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-white via-white to-slate-50 text-slate-900 antialiased">
      <Header />
      <Hero />
      <HowItWorks />
      <UseCaseGrid />
      <Why />
      <CtaFooter />
    </main>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-slate-200/70">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-amber-400 shadow-[0_16px_40px_-18px_rgba(251,191,36,0.9)] grid place-items-center">
              <Sparkles className="h-5 w-5 text-slate-950" />
            </div>
            <span className="font-semibold tracking-tight text-slate-950">threadway</span>
            <KnotBadge className="hidden sm:inline-flex">MCP inside</KnotBadge>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#how" className="text-slate-700 hover:text-slate-950">What it does</a>
            <a href="#use-cases" className="text-slate-700 hover:text-slate-950">Use cases</a>
            <a href="#why" className="text-slate-700 hover:text-slate-950">Why</a>
          </nav>
          <ThreadButton asChild>
            <Link href="WA_LINK">Message threadway</Link>
          </ThreadButton>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y1 = useTransform(scrollYProgress, [0, 1], [30, -30])
  const y2 = useTransform(scrollYProgress, [0, 1], [-18, 18])

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* low-contrast ambient orbs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[880px] h-[880px] rounded-full bg-amber-200 blur-3xl"
        style={{ opacity: 0.08, y: y1, mixBlendMode: "multiply" as any }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -right-24 w-[560px] h-[560px] rounded-full bg-indigo-200 blur-3xl"
        style={{ opacity: 0.07, y: y2, mixBlendMode: "multiply" as any }}
      />
      {/* optional grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: "url(/noise.png)" }} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-18 sm:py-24">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* high-contrast content panel */}
            <div className="rounded-3xl bg-white/90 backdrop-blur-sm ring-1 ring-black/5 p-6 sm:p-8 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.3)]">
              <KnotBadge className="bg-amber-100 text-amber-800 border-amber-200">In WhatsApp</KnotBadge>
              <h1 className="mt-4 text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] text-slate-950">
                Your Personal Helper—In WhatsApp
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-slate-800">
                No new apps. No tech headaches. Threads that pull tasks together.
              </p>
              <p className="mt-3 text-sm text-slate-600 italic">
                Power users: We use MCP—like USB‑C for AI—to plug your helper into services you use.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
                <ThreadButton asChild size="lg">
                  <Link href="WA_LINK">
                    Message threadway
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </ThreadButton>
                <OutlineButton asChild size="lg">
                  <a href="#how">What it does</a>
                </OutlineButton>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
          >
            <HeroChatMock />
          </motion.div>
        </div>

        <ThreadLine className="mt-10 hidden sm:block" opacity={0.22} />
      </div>
    </section>
  )
}

function HeroChatMock() {
  return (
    <div className="mx-auto max-w-md">
      <div className="relative">
        <div className="rounded-[26px] overflow-hidden border border-slate-200 bg-white shadow-2xl">
          <div className="bg-slate-950 text-slate-50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-emerald-400 grid place-items-center text-slate-950 font-bold">W</div>
              <div className="text-sm leading-tight">
                <div className="font-semibold">threadway helper</div>
                <div className="text-slate-300 text-xs">online</div>
              </div>
            </div>
            <MessageCircle className="h-4 w-4 text-slate-300" />
          </div>
          <div className="bg-gradient-to-b from-white to-slate-50 px-4 py-5 space-y-3">
            <ChatBubble from="ai">Hi! What can I help you do today?</ChatBubble>
            <ChatBubble>Send an email to Alex that I’m running late 15 mins.</ChatBubble>
            <ChatBubble from="ai">Got it — using Gmail via MCP. Want to add a friendly tone?</ChatBubble>
            <ChatBubble>Yes, please.</ChatBubble>
            <ChatBubble from="ai">Done. Sent! ✅</ChatBubble>
          </div>
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="rounded-full border border-slate-300 px-3 py-2 text-sm text-slate-600">Type a message…</div>
          </div>
        </div>

        <div className="absolute -right-3 -top-3">
          <KnotBadge className="bg-teal-600 text-white border-teal-600">⚡ MCP</KnotBadge>
        </div>
      </div>
    </div>
  )
}

function ChatBubble({
  children,
  from,
}: {
  children: React.ReactNode
  from?: "ai" | "user"
}) {
  const isAi = from === "ai"
  return (
    <div className={cn("flex", isAi ? "" : "justify-end")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm relative",
          isAi
            ? "bg-emerald-50 text-slate-950 border border-emerald-200"
            : "bg-white text-slate-950 border border-slate-300"
        )}
      >
        <span className={cn("absolute -bottom-1 h-2 w-2 rounded-full bg-gradient-to-br from-amber-400 to-indigo-500", isAi ? "left-3" : "right-3")} />
        {children}
      </div>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Say Hi on WhatsApp",
      desc: "Tap Start and drop us a message—no installs, no extra passwords.",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Style it, plug it in",
      desc: `Pick a voice you like. Turn on integrations with MCP (Gmail, Notion, Instacart…).`,
      color: "bg-sky-50 text-sky-700 border-sky-200",
      badge: "⚡ MCP",
    },
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "Get stuff done",
      desc: "Email, reminders, receipts, workouts, file search—just chat it. Your helper handles the rest.",
      color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    },
  ]

  return (
    <section id="how" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">What it does</h2>
          <p className="mt-3 text-slate-700">Three steps. Zero friction.</p>
        </div>
        <div className="relative">
          <ThreadLine className="absolute -top-6 left-1/2 -translate-x-1/2 w-[720px] hidden md:block" opacity={0.2} />
          <div className="grid md:grid-cols-3 gap-6 relative">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                className={cn(
                  "group relative rounded-3xl border bg-white p-6 transition-all",
                  "hover:shadow-xl hover:-translate-y-1",
                  s.color.replace("text-", "border-"),
                )}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.05 }}
              >
                <div className={cn("inline-flex items-center justify-center h-12 w-12 rounded-2xl border", s.color)}>
                  {s.icon}
                </div>
                {s.badge && (
                  <KnotBadge className="ml-2 mt-2 bg-teal-600 text-white border-teal-600">{s.badge}</KnotBadge>
                )}
                <h3 className="mt-4 font-semibold text-lg text-slate-950">{s.title}</h3>
                <p className="mt-2 text-slate-700">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function UseCaseGrid() {
  const cases = [
    { icon: Mail, label: "Shoot off an email", bg: "bg-sky-50 hover:bg-sky-100" },
    { icon: Calendar, label: "Set a reminder", bg: "bg-amber-50 hover:bg-amber-100" },
    { icon: Dumbbell, label: "Log my workout", bg: "bg-emerald-50 hover:bg-emerald-100" },
    { icon: FileText, label: "Summarize a receipt", bg: "bg-rose-50 hover:bg-rose-100" },
    { icon: Search, label: "Search your files", bg: "bg-teal-50 hover:bg-teal-100" },
    { icon: NotebookPen, label: "Draft a note", bg: "bg-violet-50 hover:bg-violet-100" },
  ]
  return (
    <section id="use-cases" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {cases.map((c, i) => (
            <motion.div
              key={i}
              className={cn(
                "rounded-3xl border border-slate-300 p-5 transition-all bg-white/95",
                "hover:-translate-y-1 hover:shadow-2xl",
                c.bg
              )}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.04 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white border border-slate-200 grid place-items-center">
                  <c.icon className="h-5 w-5 text-slate-900" />
                </div>
                <div className="font-semibold text-slate-950">{c.label}</div>
              </div>
              <p className="text-sm text-slate-700 mt-2">Try it by just asking in chat.</p>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm text-slate-600 mt-6">
          MCP‑powered: swap in any service that speaks JSON‑RPC.
        </p>
      </div>
    </section>
  )
}

function Why() {
  const bullets = [
    "In WhatsApp, where you already are — no new apps to learn.",
    "Zero tech skills required — just chat.",
    "Real‑world action, not just answers — MCP reaches the services you use.",
    "You’re always in control — connect or disconnect any integration at any time.",
  ]
  return (
    <section id="why" className="py-20 bg-gradient-to-b from-white to-slate-100 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -left-20 -bottom-24 w-[480px] h-[480px] rounded-full bg-amber-200/35 blur-3xl" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">Why you’ll love it</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {bullets.map((b, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3 rounded-2xl bg-white border border-slate-300 p-4"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.03 }}
            >
              <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center">
                <Check className="h-4 w-4" />
              </div>
              <p className="text-slate-800">{b}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaFooter() {
  return (
    <footer className="mt-10 bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-slate-300">Make everyday tasks lighter.</p>
          <h3 className="text-3xl sm:text-4xl font-extrabold mt-1 text-white">Start chatting on WhatsApp today.</h3>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ThreadButton asChild size="lg">
              <Link href="WA_LINK">Message threadway</Link>
            </ThreadButton>
            <OutlineButton asChild size="lg" className="!border-slate-600 !text-slate-100 hover:bg-white/10">
              <Link href="/privacy">Privacy Policy</Link>
            </OutlineButton>
            <OutlineButton asChild size="lg" className="!border-slate-600 !text-slate-100 hover:bg-white/10">
              <Link href="/contact">Contact Us</Link>
            </OutlineButton>
          </div>
          <div className="mt-6 text-sm text-slate-400 flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              Powered by MCP
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ---------- Inline “components” ---------- */

function ThreadButton({
  children,
  asChild,
  size = "md",
  className,
}: {
  children: React.ReactNode
  asChild?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const Size = size === "lg" ? "px-6 py-3 text-base" : size === "sm" ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm"
  const Comp: any = asChild ? "span" : "button"
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition",
        "bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-[.98]",
        "shadow-[0_22px_60px_-22px_rgba(251,191,36,0.9)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60",
        "relative",
        Size,
        className
      )}
    >
      <span className="pointer-events-none absolute left-2 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-amber-400 to-indigo-500" />
      {children}
    </Comp>
  )
}

function OutlineButton({
  children,
  asChild,
  size = "md",
  className,
}: {
  children: React.ReactNode
  asChild?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const Size = size === "lg" ? "px-6 py-3 text-base" : size === "sm" ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm"
  const Comp: any = asChild ? "span" : "button"
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition bg-transparent",
        "border border-slate-400 text-slate-900 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60",
        Size,
        className
      )}
    >
      {children}
    </Comp>
  )
}

function KnotBadge({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        "bg-teal-50 border-teal-200 text-teal-800",
        className
      )}
    >
      <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-br from-amber-400 to-indigo-500" />
      {children}
    </span>
  )
}

function ThreadLine({
  className,
  path = "M0,80 C120,20 240,140 360,80 S600,80 720,80",
  colorA = "#f59e0b", // amber-500
  colorB = "#6366f1", // indigo-500
  opacity = 0.22,
}: {
  className?: string
  path?: string
  colorA?: string
  colorB?: string
  opacity?: number
}) {
  return (
    <svg className={cn("w-full", className)} viewBox="0 0 720 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="thread" x1="0" y1="0" x2="720" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor={colorA} />
          <stop offset="1" stopColor={colorB} />
        </linearGradient>
      </defs>
      <motion.path
        d={path}
        stroke="url(#thread)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity={opacity}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
    </svg>
  )
}