'use client';

import { useState } from 'react';
import { addSkill, addProject, addCertification, addInternship, toggleResumeComplete } from './actions';
import { Plus, Award, Briefcase, Code, Star, CheckCircle2, ChevronRight, User, Sparkles } from 'lucide-react';

export default function ProfilePage() {
    const userId = "temp-user-id";
    const [resumeComplete, setResumeComplete] = useState(false);
    const [submitting, setSubmitting] = useState<string | null>(null);

    const handleSubmit = (formId: string, action: (fd: FormData) => Promise<void>) => {
        return async (formData: FormData) => {
            setSubmitting(formId);
            await action(formData);
            (document.getElementById(formId) as HTMLFormElement)?.reset();
            setSubmitting(null);
        };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pb-24">
            {/* Premium Header */}
            <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-20 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <User size={22} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 leading-tight tracking-tight">Career Builder</h1>
                            <p className="text-[11px] text-slate-400 font-semibold tracking-wide">Profile Setup</p>
                        </div>
                    </div>
                    <a href="/dashboard" className="group flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg">
                        View Dashboard
                        <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-12">
                <header className="mb-12 animate-in">
                    <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-[0.25em] mb-2">
                        <Sparkles size={14} />
                        <span>Build Your Story</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Add Your Achievements</h2>
                    <p className="text-slate-400 mt-2 font-medium">Each entry strengthens your career readiness score.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Skills */}
                    <section className="animate-in-delay-1 card-hover glass rounded-2xl p-7 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                                <Star size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-800">Core Skills</h3>
                                <p className="text-[11px] text-slate-400 font-semibold">Technical & soft skills</p>
                            </div>
                        </div>
                        <form className="space-y-3.5" id="skill-form" action={handleSubmit('skill-form', async (fd) => {
                            await addSkill(userId, fd.get('name') as string, Number(fd.get('level')));
                        })}>
                            <input name="name" placeholder="e.g. React, Python, Leadership" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 outline-none transition-all text-sm font-medium placeholder:text-slate-300" required />
                            <input name="level" type="number" min="1" max="5" placeholder="Proficiency (1-5)" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 outline-none transition-all text-sm font-medium placeholder:text-slate-300" required />
                            <button type="submit" disabled={submitting === 'skill-form'} className="btn-shine flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 w-full transition-all shadow-lg shadow-indigo-100 text-sm disabled:opacity-50">
                                <Plus size={16} /> {submitting === 'skill-form' ? 'Adding...' : 'Add Skill'}
                            </button>
                        </form>
                    </section>

                    {/* Projects */}
                    <section className="animate-in-delay-2 card-hover glass rounded-2xl p-7 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-violet-100 text-violet-600 rounded-xl">
                                <Code size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-800">Projects</h3>
                                <p className="text-[11px] text-slate-400 font-semibold">Portfolio highlights</p>
                            </div>
                        </div>
                        <form className="space-y-3.5" id="project-form" action={handleSubmit('project-form', async (fd) => {
                            await addProject(userId, fd.get('name') as string, Number(fd.get('complexity')));
                        })}>
                            <input name="name" placeholder="e.g. E-commerce Platform" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 outline-none transition-all text-sm font-medium placeholder:text-slate-300" required />
                            <input name="complexity" type="number" min="1" max="5" placeholder="Complexity (1-5)" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 outline-none transition-all text-sm font-medium placeholder:text-slate-300" required />
                            <button type="submit" disabled={submitting === 'project-form'} className="btn-shine flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-black w-full transition-all shadow-lg text-sm disabled:opacity-50">
                                <Plus size={16} /> {submitting === 'project-form' ? 'Adding...' : 'Add Project'}
                            </button>
                        </form>
                    </section>

                    {/* Certifications */}
                    <section className="animate-in-delay-3 card-hover glass rounded-2xl p-7 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                                <Award size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-800">Certifications</h3>
                                <p className="text-[11px] text-slate-400 font-semibold">Industry validations</p>
                            </div>
                        </div>
                        <form className="space-y-3.5" id="cert-form" action={handleSubmit('cert-form', async (fd) => {
                            await addCertification(userId, fd.get('name') as string, fd.get('issuer') as string);
                        })}>
                            <input name="name" placeholder="Certification Title" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 outline-none transition-all text-sm font-medium placeholder:text-slate-300" required />
                            <input name="issuer" placeholder="Issuing Organization" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 outline-none transition-all text-sm font-medium placeholder:text-slate-300" required />
                            <button type="submit" disabled={submitting === 'cert-form'} className="btn-shine flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-amber-600 w-full transition-all shadow-lg shadow-amber-100 text-sm disabled:opacity-50">
                                <Plus size={16} /> {submitting === 'cert-form' ? 'Adding...' : 'Add Certification'}
                            </button>
                        </form>
                    </section>

                    {/* Internships */}
                    <section className="animate-in-delay-4 card-hover glass rounded-2xl p-7 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                                <Briefcase size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-800">Experience</h3>
                                <p className="text-[11px] text-slate-400 font-semibold">Internships & work</p>
                            </div>
                        </div>
                        <form className="space-y-3.5" id="intern-form" action={handleSubmit('intern-form', async (fd) => {
                            await addInternship(userId, fd.get('company') as string, fd.get('role') as string, Number(fd.get('duration')));
                        })}>
                            <input name="company" placeholder="Company Name" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 outline-none transition-all text-sm font-medium placeholder:text-slate-300" required />
                            <input name="role" placeholder="Your Role" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 outline-none transition-all text-sm font-medium placeholder:text-slate-300" required />
                            <input name="duration" type="number" placeholder="Duration (months)" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 outline-none transition-all text-sm font-medium placeholder:text-slate-300" required />
                            <button type="submit" disabled={submitting === 'intern-form'} className="btn-shine flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-700 w-full transition-all shadow-lg shadow-emerald-100 text-sm disabled:opacity-50">
                                <Plus size={16} /> {submitting === 'intern-form' ? 'Adding...' : 'Add Internship'}
                            </button>
                        </form>
                    </section>

                    {/* Resume Banner */}
                    <section className="md:col-span-2 animate-in-delay-4">
                        <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 animate-gradient rounded-2xl p-7 shadow-xl text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black">Resume Profile Complete?</h3>
                                    <p className="text-white/70 text-sm font-medium">Toggle ON if your resume is professionally polished.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer scale-110">
                                <input type="checkbox" checked={resumeComplete} onChange={async (e) => {
                                    setResumeComplete(e.target.checked);
                                    await toggleResumeComplete(userId, e.target.checked);
                                }} className="sr-only peer" />
                                <div className="w-14 h-7 bg-white/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-white/90 after:peer-checked:bg-indigo-600 after:shadow-lg"></div>
                            </label>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
