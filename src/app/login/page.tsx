'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const { login, signup, user, loading } = useAuth();
    const router = useRouter();
    const [tab, setTab] = useState<'login' | 'signup'>('login');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && user) router.push('/dashboard');
    }, [user, loading, router]);

    // ── Canvas particle background ──
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        let W = canvas.width = window.innerWidth;
        let H = canvas.height = window.innerHeight;
        let mx = W / 2, my = H / 2;
        let animId: number;

        const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
        window.addEventListener('resize', onResize);

        const COLORS = ['rgba(108,99,255,', 'rgba(255,101,132,', 'rgba(249,199,79,', 'rgba(67,170,139,'];
        const particles = Array.from({ length: 60 }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            r: Math.random() * 3 + 0.5,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            c: COLORS[Math.floor(Math.random() * COLORS.length)],
            a: Math.random() * 0.5 + 0.1,
        }));

        const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
        window.addEventListener('mousemove', onMove);

        function draw() {
            ctx.clearRect(0, 0, W, H);
            for (const p of particles) {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.c + p.a + ')';
                ctx.fill();
                const dx = p.x - mx, dy = p.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my);
                    ctx.strokeStyle = p.c + 0.15 * (1 - dist / 100) + ')';
                    ctx.lineWidth = 0.8; ctx.stroke();
                    p.vx += -dx * 0.0003; p.vy += -dy * 0.0003;
                }
                p.vx *= 0.99; p.vy *= 0.99;
            }
            animId = requestAnimationFrame(draw);
        }
        draw();
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); window.removeEventListener('mousemove', onMove); };
    }, []);

    // ── Custom cursor ──
    useEffect(() => {
        let rx = window.innerWidth / 2, ry = window.innerHeight / 2;
        let mx = rx, my = ry;
        let animId: number;
        const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
        window.addEventListener('mousemove', onMove);
        function animCursor() {
            rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
            if (cursorRef.current) { cursorRef.current.style.left = mx + 'px'; cursorRef.current.style.top = my + 'px'; }
            if (ringRef.current) { ringRef.current.style.left = rx + 'px'; ringRef.current.style.top = ry + 'px'; }
            animId = requestAnimationFrame(animCursor);
        }
        animCursor();
        return () => { cancelAnimationFrame(animId); window.removeEventListener('mousemove', onMove); };
    }, []);

    // ── Character eye tracking ──
    useEffect(() => {
        let animId: number;
        let time = 0;
        const charDefs = [
            { id: 'cc-char1', pupils: ['cc-p1a', 'cc-p1b'], mouth: 'cc-m1', float: 0.18, baseTransform: 'translateX(-50%)' },
            { id: 'cc-char2', pupils: ['cc-p2a', 'cc-p2b'], mouth: 'cc-m2', float: 0.12, baseTransform: '' },
            { id: 'cc-char3', pupils: ['cc-p3a', 'cc-p3b'], mouth: 'cc-m3', float: 0.08, baseTransform: 'translateX(-40%)' },
            { id: 'cc-char4', pupils: ['cc-p4a', 'cc-p4b'], mouth: 'cc-m4', float: 0.15, baseTransform: '' },
        ];
        const floatOffsets = charDefs.map(() => ({ x: 0, y: 0, tx: 0, ty: 0 }));
        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
        window.addEventListener('mousemove', onMove);

        function track() {
            time += 0.02;
            const stage = stageRef.current;
            if (!stage) { animId = requestAnimationFrame(track); return; }
            const sr = stage.getBoundingClientRect();

            charDefs.forEach((ch, i) => {
                const el = document.getElementById(ch.id);
                if (!el) return;
                const rect = el.getBoundingClientRect();
                const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
                const dx = mx - cx, dy = my - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const prox = Math.max(0, 1 - dist / 300);
                const angle = Math.atan2(dy, dx);
                const maxP = 4;
                const px = Math.cos(angle) * Math.min(dist, 300) / 300 * maxP;
                const py = Math.sin(angle) * Math.min(dist, 300) / 300 * maxP;
                ch.pupils.forEach(pid => {
                    const p = document.getElementById(pid);
                    if (p) p.style.transform = `translate(${px}px,${py}px)`;
                });
                const mouth = document.getElementById(ch.mouth);
                if (mouth) mouth.className = prox > 0.8 ? 'cc-mouth surprised' : prox > 0.4 ? 'cc-mouth smile' : 'cc-mouth';

                const fo = floatOffsets[i];
                const idleX = Math.sin(time * 0.8 + i * 1.5) * 6;
                const idleY = Math.cos(time * 0.6 + i * 1.2) * 8;
                const atX = (mx - sr.left - sr.width / 2) * ch.float * prox * 0.3;
                const atY = (my - sr.top - sr.height / 2) * ch.float * prox * 0.3;
                fo.tx = idleX + atX; fo.ty = idleY + atY;
                fo.x += (fo.tx - fo.x) * 0.07; fo.y += (fo.ty - fo.y) * 0.07;
                el.style.transform = ch.baseTransform
                    ? `${ch.baseTransform} translate(${fo.x}px,${fo.y}px)`
                    : `translate(${fo.x}px,${fo.y}px)`;
            });
            animId = requestAnimationFrame(track);
        }
        track();
        return () => { cancelAnimationFrame(animId); window.removeEventListener('mousemove', onMove); };
    }, []);

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(''); setSubmitting(true);
        const fd = new FormData(e.currentTarget);
        const result = await login(fd.get('email') as string, fd.get('password') as string);
        setSubmitting(false);
        if (result.success) router.push('/dashboard');
        else setError(result.error ?? 'Login failed');
    }

    async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(''); setSubmitting(true);
        const fd = new FormData(e.currentTarget);
        const pw = fd.get('password') as string;
        if (pw.length < 6) { setSubmitting(false); setError('Password must be at least 6 characters.'); return; }
        const result = await signup(fd.get('name') as string, fd.get('email') as string, pw);
        setSubmitting(false);
        if (result.success) router.push('/dashboard');
        else setError(result.error ?? 'Signup failed');
    }

    if (loading) return null;

    return (
        <>
            <style>{`
        .cc-cursor { position: fixed; width: 14px; height: 14px; background: #6c63ff; border-radius: 50%; pointer-events: none; z-index: 9999; transform: translate(-50%,-50%); box-shadow: 0 0 16px #6c63ff, 0 0 40px rgba(108,99,255,0.4); transition: width .2s, height .2s, background .2s; }
        .cc-ring { position: fixed; width: 38px; height: 38px; border: 2px solid rgba(108,99,255,0.5); border-radius: 50%; pointer-events: none; z-index: 9998; transform: translate(-50%,-50%); transition: all .15s ease-out; }
        .cc-char { position: absolute; display: flex; align-items: center; justify-content: center; will-change: transform; }
        .cc-body { position: relative; display: flex; align-items: center; justify-content: center; }
        .cc-eyes { position: absolute; display: flex; gap: 10px; top: 30%; left: 50%; transform: translateX(-50%); }
        .cc-eye { width: 14px; height: 18px; background: #fff; border-radius: 50%; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .cc-pupil { width: 8px; height: 10px; background: #1a1040; border-radius: 50%; position: absolute; transition: transform .08s ease-out; }
        .cc-shine { width: 3px; height: 3px; background: #fff; border-radius: 50%; position: absolute; top: 3px; right: 3px; z-index: 2; }
        .cc-mouth { position: absolute; bottom: 26%; left: 50%; transform: translateX(-50%); width: 22px; height: 12px; border-radius: 0 0 12px 12px; border: 3px solid #fff; border-top: none; transition: all .2s; }
        .cc-mouth.surprised { width: 16px; height: 16px; border-radius: 50%; border: 3px solid #fff; }
        .cc-mouth.smile { width: 28px; height: 14px; }
        .cc-reaction { position: absolute; top: -44px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.95); color: #1a1040; font-size: 0.7rem; font-weight: 800; padding: 5px 10px; border-radius: 20px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .2s; font-family: 'Nunito', sans-serif; }
        .cc-reaction.show { opacity: 1; }
        .cc-reaction::after { content:''; position: absolute; bottom:-5px; left:50%; transform:translateX(-50%); border:5px solid transparent; border-top-color:rgba(255,255,255,0.95); border-bottom:none; }
        @keyframes cc-wiggle { 0%,100%{transform:rotate(-10deg)} 25%{transform:rotate(-16deg) scale(1.05)} 75%{transform:rotate(-4deg) scale(1.05)} }
        @keyframes cc-float { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-14px) rotate(8deg)} }
        .cc-floatshape { position: absolute; border-radius: 50%; opacity: 0.15; animation: cc-float 4s ease-in-out infinite; }
        @keyframes cc-sparkle { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-40px) scale(0.5)} }
        .cc-sparkle { position:fixed; pointer-events:none; font-size:1rem; animation: cc-sparkle .8s ease forwards; }
      `}</style>

            <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
            <div ref={cursorRef} className="cc-cursor" />
            <div ref={ringRef} className="cc-ring" />

            <main
                style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a', fontFamily: "'Nunito', sans-serif", cursor: 'none' }}
            >
                <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

                <div style={{ display: 'flex', width: 900, maxWidth: '96vw', minHeight: 560, borderRadius: 28, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,99,255,0.3)' }}>

                    {/* ── Left: Characters ── */}
                    <div style={{ flex: 1.1, background: 'linear-gradient(135deg,#0d0d1f 0%,#1a1040 50%,#120a2e 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 30px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 40% at 30% 70%,rgba(108,99,255,0.15) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 80% 20%,rgba(255,101,132,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />

                        <div ref={stageRef} style={{ position: 'relative', width: 280, height: 280 }}>

                            {/* char1: Purple square */}
                            <div id="cc-char1" className="cc-char" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}
                                onMouseEnter={() => showReaction('cc-r1', ['Uwu~', 'Senpai! 💜', 'Follow me!', '*blushes*'])}>
                                <div className="cc-body" style={{ width: 110, height: 110, background: 'linear-gradient(135deg,#a78bfa,#6c63ff)', borderRadius: 20, transform: 'rotate(-10deg)', boxShadow: '0 12px 32px rgba(108,99,255,0.4),inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                                    <div id="cc-r1" className="cc-reaction" />
                                    <div className="cc-eyes" style={{ top: '32%', gap: 12 }}>
                                        <div className="cc-eye" style={{ width: 16, height: 20 }}><div id="cc-p1a" className="cc-pupil" style={{ width: 9, height: 11 }} /><div className="cc-shine" /></div>
                                        <div className="cc-eye" style={{ width: 16, height: 20 }}><div id="cc-p1b" className="cc-pupil" style={{ width: 9, height: 11 }} /><div className="cc-shine" /></div>
                                    </div>
                                    <div id="cc-m1" className="cc-mouth" style={{ width: 26, height: 14, bottom: '24%' }} />
                                </div>
                            </div>

                            {/* char2: Orange circle */}
                            <div id="cc-char2" className="cc-char" style={{ position: 'absolute', bottom: 30, left: 10, zIndex: 2 }}
                                onMouseEnter={() => showReaction('cc-r2', ['Kyaa! ✨', 'Hello!', 'Let me in!', '*rolls*'])}>
                                <div className="cc-body" style={{ width: 85, height: 85, background: 'linear-gradient(135deg,#fbbf24,#f97316)', borderRadius: '50%', boxShadow: '0 10px 24px rgba(249,115,22,0.4),inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                                    <div id="cc-r2" className="cc-reaction" />
                                    <div className="cc-eyes" style={{ top: '30%', gap: 8 }}>
                                        <div className="cc-eye" style={{ width: 12, height: 16 }}><div id="cc-p2a" className="cc-pupil" style={{ width: 7, height: 9 }} /><div className="cc-shine" /></div>
                                        <div className="cc-eye" style={{ width: 12, height: 16 }}><div id="cc-p2b" className="cc-pupil" style={{ width: 7, height: 9 }} /><div className="cc-shine" /></div>
                                    </div>
                                    <div id="cc-m2" className="cc-mouth" style={{ width: 18, height: 10, bottom: '22%' }} />
                                </div>
                            </div>

                            {/* char3: Dark rectangle */}
                            <div id="cc-char3" className="cc-char" style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-40%)', zIndex: 4 }}
                                onMouseEnter={() => showReaction('cc-r3', ['...', 'Hmph.', 'Cool.', 'Whatever.'])}>
                                <div className="cc-body" style={{ width: 60, height: 80, background: 'linear-gradient(135deg,#374151,#1f2937)', borderRadius: 12, boxShadow: '0 8px 20px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.08)' }}>
                                    <div id="cc-r3" className="cc-reaction" />
                                    <div className="cc-eyes" style={{ top: '28%', gap: 6 }}>
                                        <div className="cc-eye" style={{ width: 11, height: 14 }}><div id="cc-p3a" className="cc-pupil" style={{ width: 6, height: 8 }} /><div className="cc-shine" /></div>
                                        <div className="cc-eye" style={{ width: 11, height: 14 }}><div id="cc-p3b" className="cc-pupil" style={{ width: 6, height: 8 }} /><div className="cc-shine" /></div>
                                    </div>
                                    <div id="cc-m3" className="cc-mouth" style={{ width: 16, height: 8, bottom: '24%' }} />
                                </div>
                            </div>

                            {/* char4: Yellow rotated square */}
                            <div id="cc-char4" className="cc-char" style={{ position: 'absolute', top: 40, right: 20, zIndex: 2 }}
                                onMouseEnter={() => showReaction('cc-r4', ['Woah! 🌟', 'Pick me!', 'Hype!!', 'So cool!'])}>
                                <div className="cc-body" style={{ width: 70, height: 70, background: 'linear-gradient(135deg,#f9c74f,#f3722c)', borderRadius: 14, transform: 'rotate(25deg)', boxShadow: '0 8px 20px rgba(243,114,44,0.4),inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                                    <div id="cc-r4" className="cc-reaction" />
                                    <div className="cc-eyes" style={{ top: '30%', gap: 6, transform: 'translateX(-50%) rotate(-25deg)' }}>
                                        <div className="cc-eye" style={{ width: 10, height: 13 }}><div id="cc-p4a" className="cc-pupil" style={{ width: 6, height: 8 }} /><div className="cc-shine" /></div>
                                        <div className="cc-eye" style={{ width: 10, height: 13 }}><div id="cc-p4b" className="cc-pupil" style={{ width: 6, height: 8 }} /><div className="cc-shine" /></div>
                                    </div>
                                    <div id="cc-m4" className="cc-mouth" style={{ width: 14, height: 8, bottom: '22%', transform: 'translateX(-50%) rotate(-25deg)' }} />
                                </div>
                            </div>

                            {/* Decorative floats */}
                            <div className="cc-floatshape" style={{ width: 30, height: 30, background: '#6c63ff', top: 10, left: 20 }} />
                            <div className="cc-floatshape" style={{ width: 16, height: 16, background: '#ff6584', bottom: 120, right: 10, borderRadius: 4, animationDelay: '1.2s' }} />
                            <div className="cc-floatshape" style={{ width: 20, height: 20, background: '#f9c74f', top: 130, left: 50, borderRadius: 4, animationDelay: '2.1s' }} />
                        </div>

                        <div style={{ marginTop: 28, textAlign: 'center' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg,#a78bfa,#6c63ff,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>🧠 CareerCore</h1>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4, fontWeight: 600 }}>AI-Powered Career Readiness</p>
                        </div>
                    </div>

                    {/* ── Right: Form ── */}
                    <div style={{ flex: 1, background: '#1a1a2e', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 44px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: 1, height: '100%', background: 'linear-gradient(to bottom,transparent,rgba(108,99,255,0.4),transparent)' }} />

                        <div style={{ marginBottom: 32 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6c63ff', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Welcome back!</div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#e2e8f0' }}>Sign in to continue</h2>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4, fontWeight: 600 }}>Your career twin awaits you ✨</p>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
                            {(['login', 'signup'] as const).map(t => (
                                <button key={t} onClick={() => { setTab(t); setError(''); }} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 10, fontFamily: 'inherit', fontWeight: 800, fontSize: '0.85rem', cursor: 'none', transition: 'all .25s', background: tab === t ? '#6c63ff' : 'transparent', color: tab === t ? '#fff' : '#94a3b8', boxShadow: tab === t ? '0 4px 14px rgba(108,99,255,0.4)' : 'none' }}>
                                    {t === 'login' ? 'Log In' : 'Sign Up'}
                                </button>
                            ))}
                        </div>

                        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700, marginBottom: 16 }}>{error}</div>}

                        {tab === 'login' ? (
                            <form onSubmit={handleLogin}>
                                <Field label="Email Address" name="email" type="email" placeholder="you@example.com" />
                                <Field label="Password" name="password" type="password" placeholder="••••••••" />
                                <SubmitBtn loading={submitting}>Log In →</SubmitBtn>
                                <Divider />
                                <GoogleBtn />
                                <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                                    No account? <button type="button" onClick={() => { setTab('signup'); setError(''); }} style={{ color: '#6c63ff', background: 'none', border: 'none', fontWeight: 800, cursor: 'none', fontFamily: 'inherit', fontSize: 'inherit' }}>Sign Up</button>
                                </p>
                            </form>
                        ) : (
                            <form onSubmit={handleSignup}>
                                <Field label="Full Name" name="name" type="text" placeholder="Your full name" />
                                <Field label="Email Address" name="email" type="email" placeholder="you@example.com" />
                                <Field label="Password" name="password" type="password" placeholder="Min 6 characters" />
                                <SubmitBtn loading={submitting}>Create Account →</SubmitBtn>
                                <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                                    Have account? <button type="button" onClick={() => { setTab('login'); setError(''); }} style={{ color: '#6c63ff', background: 'none', border: 'none', fontWeight: 800, cursor: 'none', fontFamily: 'inherit', fontSize: 'inherit' }}>Log In</button>
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}

// ── Helpers ──
function showReaction(id: string, msgs: string[]) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1400);
}

function Field({ label, name, type, placeholder }: { label: string; name: string; type: string; placeholder: string }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>
            <input name={name} type={type} placeholder={placeholder} required
                style={{ width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(108,99,255,0.2)', borderRadius: 12, color: '#e2e8f0', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600, outline: 'none', transition: 'all .2s', cursor: 'none' }}
                onFocus={e => { e.target.style.borderColor = '#6c63ff'; e.target.style.background = 'rgba(108,99,255,0.08)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(108,99,255,0.2)'; e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.boxShadow = 'none'; }}
            />
        </div>
    );
}

function SubmitBtn({ children, loading }: { children: React.ReactNode; loading: boolean }) {
    return (
        <button type="submit" disabled={loading}
            style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,#6c63ff,#818cf8)', border: 'none', borderRadius: 14, color: '#fff', fontFamily: 'inherit', fontSize: '1rem', fontWeight: 900, cursor: 'none', transition: 'all .25s', boxShadow: '0 6px 20px rgba(108,99,255,0.4)', marginTop: 6, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Please wait...' : children}
        </button>
    );
}

function Divider() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 4px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />OR<span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>
    );
}

function GoogleBtn() {
    return (
        <button type="button" style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#e2e8f0', fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: 800, cursor: 'none', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.1rem' }}>G</span> Continue with Google
        </button>
    );
}
