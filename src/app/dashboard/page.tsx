import { ScoringService } from '@/server/services/scoring.service';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { skills, projects, certifications, internships, resumeProfiles } from '@/db/schema';
import BreakdownChart from '@/components/BreakdownChart';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, UserCircle, Rocket, Target, Lightbulb, TrendingUp, ShieldCheck, ChevronRight, BarChart3, Sparkles } from 'lucide-react';

export default async function DashboardPage() {
    const userId = "temp-user-id";

    let result;
    try {
        const userSkills = await db.query.skills.findMany({ where: eq(skills.userId, userId) });
        const userProjects = await db.query.projects.findMany({ where: eq(projects.userId, userId) });
        const certCount = (await db.query.certifications.findMany({ where: eq(certifications.userId, userId) })).length;
        const internCount = (await db.query.internships.findMany({ where: eq(internships.userId, userId) })).length;
        const resumeProfile = await db.query.resumeProfiles.findFirst({ where: eq(resumeProfiles.userId, userId) });

        result = ScoringService.calculateScore({
            skills: userSkills, projects: userProjects,
            certificationsCount: certCount, internshipsCount: internCount,
            resumeComplete: resumeProfile?.isComplete ?? false,
        });
    } catch {
        result = ScoringService.calculateScore({
            skills: [{ level: 4 }, { level: 3 }],
            projects: [{ complexity: 5 }, { complexity: 4 }],
            certificationsCount: 2, internshipsCount: 1, resumeComplete: true,
        });
    }

    const scoreColor = result.totalScore >= 80 ? '#10b981' : result.totalScore >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-60 bg-white border-r border-slate-100 hidden md:flex flex-col sticky top-0 h-screen shadow-sm">
                <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-200">C</div>
                        <span className="text-base font-black tracking-tight">CareerCore</span>
                    </div>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                    <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm">
                        <LayoutDashboard size={18} /> Overview
                    </div>
                    <a href="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-all font-semibold text-sm">
                        <UserCircle size={18} /> Profile
                    </a>
                    <a href="http://localhost:8501" target="_blank" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-all font-semibold text-sm">
                        <BarChart3 size={18} /> AI Analytics
                    </a>
                    <div className="flex items-center gap-3 px-4 py-3 text-slate-300 rounded-xl font-semibold text-sm cursor-not-allowed">
                        <Target size={18} /> Goals
                    </div>
                </nav>
                <div className="p-3 border-t border-slate-100">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Sparkles size={12} className="text-amber-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pro</span>
                        </div>
                        <p className="text-xs font-semibold mb-3 text-slate-300">ML-powered path analysis</p>
                        <a href="http://localhost:8501" target="_blank" className="block w-full bg-indigo-500 hover:bg-indigo-400 py-2 rounded-lg text-xs font-bold text-center transition-all">Open Analytics</a>
                    </div>
                </div>
            </aside>

            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 animate-in">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-500 font-bold text-[11px] uppercase tracking-[0.25em] mb-1">
                            <Rocket size={14} /> Career Dashboard
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">Professional Readiness</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-500">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Software Engineer Path
                        </div>
                        <Badge variant={result.totalScore > 80 ? "success" : "default"}>{result.level}</Badge>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Score Circle */}
                    <div className="lg:col-span-4 animate-in-delay-1 card-hover bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden glow-indigo">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-50 rounded-bl-[60px] -mr-12 -mt-12 opacity-50"></div>
                        <h3 className="text-slate-400 font-bold mb-6 uppercase tracking-[0.2em] text-[10px]">Readiness Score</h3>
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <defs>
                                    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#4f46e5" />
                                        <stop offset="100%" stopColor="#0ea5e9" />
                                    </linearGradient>
                                </defs>
                                <circle cx="96" cy="96" r="86" stroke="#f1f5f9" strokeWidth="14" fill="transparent" />
                                <circle cx="96" cy="96" r="86" stroke="url(#g)" strokeWidth="14" fill="transparent"
                                    strokeDasharray={2 * Math.PI * 86}
                                    strokeDashoffset={2 * Math.PI * 86 * (1 - result.totalScore / 100)}
                                    strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-5xl font-black leading-none">{result.totalScore}</span>
                                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">/ 100</span>
                            </div>
                        </div>
                        <p className="mt-8 text-center text-slate-400 font-medium text-sm leading-relaxed px-2">
                            {result.totalScore > 80 ? "Expert tier. You're in the top 10%." :
                                result.totalScore > 50 ? "Strong foundation. Push for complex projects." :
                                    "Getting started! Complete your profile for insights."}
                        </p>
                    </div>

                    {/* Radar */}
                    <div className="lg:col-span-8 animate-in-delay-2 card-hover bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Skill Distribution</h3>
                            <div className="flex gap-3">
                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></div><span className="text-[10px] font-bold text-slate-400">You</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-slate-200 rounded-sm"></div><span className="text-[10px] font-bold text-slate-400">Benchmark</span></div>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[320px]">
                            <BreakdownChart data={result.breakdown} />
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="lg:col-span-12 mt-2 animate-in-delay-3">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                <Lightbulb size={20} />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Growth Recommendations</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {result.suggestions.map((s: string, i: number) => (
                                <div key={i} className="card-hover group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded">TIP {i + 1}</span>
                                            <ChevronRight size={12} className="text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <p className="text-slate-700 font-bold text-sm leading-snug">{s}</p>
                                    </div>
                                    <div className="mt-5 flex items-center gap-1.5 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                                        +10-15 pts
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
