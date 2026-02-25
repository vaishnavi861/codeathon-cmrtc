import Link from 'next/link'
import { Rocket, Target, Zap, Shield, ChevronRight, ArrowRight, BarChart3, Users, Globe } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Cinematic Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-indigo-600/15 blur-[150px] rounded-full animate-pulse-ring"></div>
        <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-blue-600/15 blur-[150px] rounded-full animate-pulse-ring" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-violet-500/10 blur-[120px] rounded-full animate-float"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center animate-in">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-500/20">C</div>
          <span className="text-lg font-black tracking-tighter">CAREERCORE</span>
        </div>
        <div className="flex items-center gap-8 text-sm font-semibold text-slate-400">
          <a href="#features" className="hover:text-white transition-colors duration-300">Features</a>
          <a href="#stats" className="hover:text-white transition-colors duration-300">Results</a>
          <Link href="/profile" className="btn-shine bg-white text-slate-900 px-6 py-2.5 rounded-full hover:bg-slate-100 transition-all duration-300 shadow-xl shadow-white/5 font-bold">
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-40 text-center">
        <div className="animate-in-delay-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-10">
          <Zap size={13} className="animate-pulse" />
          <span className="tracking-wider">POWERED BY ADVANCED AI SCORING</span>
        </div>

        <h1 className="animate-in-delay-2 text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85]">
          MEASURE YOUR <br />
          <span className="gradient-text italic">CAREER READINESS.</span>
        </h1>

        <p className="animate-in-delay-3 max-w-xl text-slate-400 text-base md:text-lg font-medium mb-14 leading-relaxed">
          Identify skill gaps, benchmark against industry leaders, and get a personalized roadmap to your dream role — all backed by data.
        </p>

        <div className="animate-in-delay-4 flex flex-col sm:flex-row items-center gap-5">
          <Link href="/profile" className="btn-shine group bg-gradient-to-r from-indigo-600 to-blue-600 animate-gradient px-10 py-4 rounded-2xl font-black text-base hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-500 flex items-center gap-2.5">
            Get Your Score
            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
          <Link href="/dashboard" className="group px-10 py-4 rounded-2xl font-bold text-base border border-slate-800 hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300 flex items-center gap-2.5">
            View Dashboard
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative z-10 border-t border-slate-800/60 py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
          {[
            { value: "50k+", label: "Profiles Scored", icon: Users },
            { value: "94%", label: "Placement Rate", icon: BarChart3 },
            { value: "120+", label: "Partner Companies", icon: Globe },
            { value: "4.9★", label: "User Satisfaction", icon: Zap },
          ].map((stat, i) => (
            <div key={i} className={`animate-in-delay-${Math.min(i + 1, 4)} flex flex-col items-center text-center group cursor-default`}>
              <stat.icon size={20} className="text-indigo-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-3xl md:text-4xl font-black mb-1.5 group-hover:text-indigo-300 transition-colors duration-300">{stat.value}</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-indigo-400 font-bold text-xs uppercase tracking-[0.3em] mb-4">Why CareerCore</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Precision Analysis.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, color: "indigo", title: "Weighted Scoring", desc: "Our algorithm weighs skills, projects & certifications against real industry benchmarks." },
              { icon: Target, color: "blue", title: "Actionable Roadmap", desc: "Not just a number — get specific next steps to boost your hirability instantly." },
              { icon: Rocket, color: "emerald", title: "Industry Benchmark", desc: "See how you compare against top hires at companies like Google, Meta & OpenAI." },
            ].map((feature, i) => (
              <div key={i} className={`card-hover p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-${feature.color}-500/40 group`}>
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className={`text-${feature.color}-400`} size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Ready to Level Up?</h2>
          <p className="text-slate-400 font-medium mb-10 text-lg">Join 50,000+ professionals who transformed their careers with CareerCore.</p>
          <Link href="/profile" className="btn-shine inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-blue-600 animate-gradient px-12 py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-500">
            Start Free Analysis
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-md flex items-center justify-center font-bold text-[10px]">C</div>
            <span className="text-sm font-black tracking-tighter text-slate-500">CAREERCORE</span>
          </div>
          <span className="text-slate-700 text-xs font-semibold">© 2026 CareerCore Inc. All rights reserved.</span>
          <div className="flex gap-8 text-slate-600 text-xs font-bold">
            <a href="#" className="hover:text-white transition-colors duration-300">Twitter</a>
            <a href="#" className="hover:text-white transition-colors duration-300">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors duration-300">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
