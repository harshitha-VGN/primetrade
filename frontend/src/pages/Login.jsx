import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      navigate('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h1 style={styles.title}>Welcome Back</h1>
            <p style={styles.subtitle}>Sign in to manage your tasks</p>
          </div>
          {err && <div style={styles.error}>{err}</div>}
          <form onSubmit={submit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input style={styles.input} name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input style={styles.input} name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required />
            </div>
            <button style={styles.btn} disabled={loading}>{loading ? '🔄 Signing in...' : '🚀 Sign In'}</button>
          </form>
          <div style={styles.divider}><span>Don't have an account?</span></div>
          <p style={styles.link}><Link to="/register" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 700 }}>Create a new account</Link></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #f0e6d2 0%, #c8e6f5 50%, #d4f1f4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', -apple-system, sans-serif", padding: '1rem' },
  container: { width: '100%', maxWidth: '420px' },
  card: { background: 'rgba(255, 255, 255, 0.95)', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)' },
  cardHeader: { marginBottom: '2rem', textAlign: 'center' },
  title: { color: '#1f2937', margin: 0, fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px' },
  subtitle: { color: '#6b7280', margin: '0.5rem 0 0', fontSize: '0.95rem' },
  formGroup: { marginBottom: '1.5rem' },
  label: { display: 'block', color: '#374151', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' },
  form: { display: 'flex', flexDirection: 'column' },
  input: { width: '100%', padding: '0.95rem 1.25rem', marginBottom: '0.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', background: '#f9fafb', color: '#1f2937', fontSize: '1rem', boxSizing: 'border-box', transition: 'all 0.3s ease', fontFamily: 'inherit' },
  btn: { width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', border: 'none', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(99,102,241,0.4)', transition: 'all 0.3s ease', marginTop: '0.5rem' },
  error: { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(239,68,68,0.3)' },
  divider: { textAlign: 'center', margin: '1.5rem 0', color: '#9ca3af', fontSize: '0.85rem' },
  link: { color: '#6b7280', marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' },
};