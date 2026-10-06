import Link from "next/link";
import { Smartphone, Sliders, ShieldCheck, Zap, Bot, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-extrabold text-base shadow-lg shadow-amber-500/20">
            BP
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white">BidPulse</h1>
            <p className="text-[10px] text-slate-400 font-mono">Live Auction Simulation Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Socket.io & SQLite Online
          </span>
        </div>
      </header>

      {/* Main Hero & Dual Entry Cards */}
      <main className="max-w-4xl mx-auto w-full my-auto py-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Real-time Engine · Mobile-First UI · AI Bidding Bots</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-2xl leading-tight">
          Simulator Penawaran Lelang Interaktif & CMS Controller
        </h2>

        <p className="text-sm sm:text-base text-slate-400 mt-4 max-w-xl">
          Platform simulasi lelang berbasis web dengan tampilan mobile yang responsif, bot cerdas otomatis, dan panel kontrol admin untuk skenario simulasi.
        </p>

        {/* Dual Portal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full mt-10">
          {/* Mobile Simulator Card */}
          <Link
            href="/simulator"
            className="group relative p-6 rounded-3xl bg-gradient-to-b from-[#111827] to-[#0D121F] border border-slate-700/80 hover:border-amber-500/60 transition-all duration-300 text-left shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Smartphone className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              Antarmuka Peserta
            </span>

            <h3 className="text-lg font-bold text-white mt-2 group-hover:text-amber-300 transition">
              Buka Mobile Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Tampilan mobile-first lelang live dengan countdown timer, quick bid chips, sound FX, dan feed penawaran real-time.
            </p>

            <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
              <span>Masuk Simulasi</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* CMS Admin Controller Card */}
          <Link
            href="/admin"
            className="group relative p-6 rounded-3xl bg-gradient-to-b from-[#111827] to-[#0D121F] border border-slate-700/80 hover:border-blue-500/60 transition-all duration-300 text-left shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/40 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Sliders className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
              Antarmuka Pengelola
            </span>

            <h3 className="text-lg font-bold text-white mt-2 group-hover:text-blue-300 transition">
              Buka CMS Controller
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Panel kendali lelang: mulai/jeda timer, tambah waktu darurat, atur agresivitas bot AI, trigger bid manual, dan audit logs.
            </p>

            <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition">
              <span>Buka Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>Bot AI (Sniper & Aggressive)</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anti-Sniping Rule Engine</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Latency &lt;50ms via Socket.io</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center text-xs text-slate-500 py-4 border-t border-slate-800/60">
        BidPulse Simulator & CMS · Powered by Next.js 15, Socket.io, & Drizzle SQLite.
      </footer>
    </div>
  );
}
