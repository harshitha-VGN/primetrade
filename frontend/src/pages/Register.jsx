import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', adminSecret: '' });
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr(null); setMsg(null);
    try {
      await api.post('/auth/register', form);
      setMsg('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1600);
    } catch (e) {
      setErr(e.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#10b981'];

  return (
    <div style={s.page}>
      <div style={s.blob1} />
      <div style={s.blob2} />
      <div style={s.blob3} />

      <div style={s.card} className="fade-up">
        <div style={s.logoRow}>
          <div style={s.logoMark}>PT</div>
          <span style={s.logoText}>PrimeTrade</span>
        </div>

        <h1 style={s.title}>Create account</h1>
        <p style={s.sub}>Join the PrimeTrade community</p>

        <div style={s.tabRow}>
          <Link to="/login" style={{ ...s.tab, textDecoration: 'none' }}>Login</Link>
          <div style={{ ...s.tab, ...s.tabActive }}>Sign Up</div>
        </div>

        {msg && <div style={s.successBox}><span style={s.successDot}>✓</span>{msg}</div>}
        {err && <div style={s.errorBox}><span style={s.errorDot}>!</span>{err}</div>}

        <form onSubmit={submit} style={s.form}>
          <div style={s.field} className="fade-up fade-up-1">
            <label style={s.label}>Full Name</label>
            <input style={s.input} name="name" placeholder="John Doe" value={form.name} onChange={handle} required />
          </div>

          <div style={s.field} className="fade-up fade-up-2">
            <label style={s.label}>Email Address</label>
            <input style={s.input} name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} required />
          </div>

          <div style={s.field} className="fade-up fade-up-3">
            <label style={s.label}>Password</label>
            <div style={s.passWrap}>
              <input
                style={{ ...s.input, paddingRight: '3rem' }}
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handle}
                required
              />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
            {form.password.length > 0 && (
              <div style={s.strengthRow}>
                <div style={s.strengthTrack}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ ...s.strengthBar, background: i <= strength ? strengthColor[strength] : '#e5e7eb' }} />
                  ))}
                </div>
                <span style={{ ...s.strengthLabel, color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
              </div>
            )}
          </div>
          <div style={s.field}>
            <label style={s.label}>
                Admin Secret <span style={{ color: '#9ca3af', fontWeight: 400 }}>(leave blank for normal account)</span>
            </label>
            <input
                style={s.input}
                name="adminSecret"
                type="password"
                placeholder="Enter admin secret if you have one"
                value={form.adminSecret || ''}
                onChange={handle}
            />
            </div>

          <button style={{ ...s.btn, opacity: loading ? 0.75 : 1 }} disabled={loading} className="fade-up fade-up-4">
            {loading
              ? <span style={s.btnInner}><span style={s.spinner} />Creating account...</span>
              : <span style={s.btnInner}>Create Account ✨</span>
            }
          </button>
        </form>

        <p style={s.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={s.switchLink}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, #f0e8dc 0%, #dce8f5 45%, #d6eef5 100%)', padding: '1.5rem', position: 'relative', overflow: 'hidden' },
  blob1: { position: 'fixed', top: '-10%', right: '-8%', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,220,180,0.55) 0%, transparent 70%)', pointerEvents: 'none' },
  blob2: { position: 'fixed', bottom: '-12%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,210,240,0.5) 0%, transparent 70%)', pointerEvents: 'none' },
  blob3: { position: 'fixed', top: '30%', left: '20%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,230,240,0.35) 0%, transparent 70%)', pointerEvents: 'none' },
  card: { background: 'rgba(248,244,240,0.82)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '1.75rem', padding: '2.75rem 2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset', border: '1px solid rgba(255,255,255,0.6)', position: 'relative', zIndex: 1 },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.75rem', justifyContent: 'center' },
  logoMark: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#5b5fcf,#7c7fe8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem' },
  logoText: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: '#1e2140', letterSpacing: '-0.3px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 700, color: '#1a1d3a', textAlign: 'center', margin: 0, letterSpacing: '-0.5px' },
  sub: { color: '#6b7280', textAlign: 'center', margin: '0.4rem 0 1.5rem', fontSize: '0.9rem' },
  tabRow: { display: 'flex', background: 'rgba(230,225,218,0.6)', borderRadius: '999px', padding: '4px', marginBottom: '1.75rem', gap: '2px' },
  tab: { flex: 1, textAlign: 'center', padding: '0.6rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 500, color: '#6b7280', cursor: 'pointer' },
  tabActive: { background: '#fff', color: '#1a1d3a', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  successBox: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' },
  successDot: { width: '20px', height: '20px', background: '#10b981', color: '#fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 },
  errorBox: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' },
  errorDot: { width: '20px', height: '20px', background: '#ef4444', color: '#fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.45rem' },
  label: { fontSize: '0.85rem', fontWeight: 600, color: '#374151' },
  input: { width: '100%', padding: '0.85rem 1.1rem', borderRadius: '0.9rem', border: '1.5px solid rgba(200,195,190,0.7)', background: 'rgba(255,255,255,0.75)', color: '#1a1d3a', fontSize: '0.95rem', transition: 'all 0.2s ease', boxSizing: 'border-box' },
  passWrap: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0, lineHeight: 1 },
  strengthRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.3rem' },
  strengthTrack: { display: 'flex', gap: '4px', flex: 1 },
  strengthBar: { height: '4px', flex: 1, borderRadius: '999px', transition: 'background 0.3s ease' },
  strengthLabel: { fontSize: '0.75rem', fontWeight: 600, minWidth: '40px' },
  btn: { width: '100%', padding: '0.95rem', background: 'linear-gradient(135deg,#5b5fcf 0%,#7c7fe8 100%)', color: '#fff', border: 'none', borderRadius: '0.9rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 18px rgba(91,95,207,0.38)', transition: 'all 0.2s ease', marginTop: '0.25rem' },
  btnInner: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
  spinner: { display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  switchText: { textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', marginTop: '1.5rem' },
  switchLink: { color: '#5b5fcf', fontWeight: 600, textDecoration: 'none' },
};