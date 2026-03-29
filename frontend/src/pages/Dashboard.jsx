import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STATUS_COLORS = { pending: '#f59e0b', in_progress: '#3b82f6', completed: '#22c55e' };

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', status: 'pending' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const flash = (type, text) => {
    if (type === 'success') { setMsg(text); setErr(null); }
    else { setErr(text); setMsg(null); }
    setTimeout(() => { setMsg(null); setErr(null); }, 3000);
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.data);
    } catch (e) { flash('error', 'Failed to load tasks'); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/tasks/${editId}`, form);
        flash('success', 'Task updated!');
        setEditId(null);
      } else {
        await api.post('/tasks', form);
        flash('success', 'Task created!');
      }
      setForm({ title: '', description: '', status: 'pending' });
      fetchTasks();
    } catch (e) { flash('error', e.response?.data?.message || 'Error'); }
  };

  const startEdit = (task) => {
    setEditId(task.id);
    setForm({ title: task.title, description: task.description || '', status: task.status });
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      flash('success', 'Task deleted.');
      fetchTasks();
    } catch (e) { flash('error', e.response?.data?.message || 'Delete failed'); }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.logo}>PrimeTrade Tasks</h1>
          <span style={styles.roleTag}>{user.role?.toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{user.name}</span>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.container}>
        {msg && <div style={styles.success}>{msg}</div>}
        {err && <div style={styles.error}>{err}</div>}

        {/* Task Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>{editId ? '✏️ Edit Task' : '➕ New Task'}</h2>
          <form onSubmit={submit} style={styles.form}>
            <input style={styles.input} name="title" placeholder="Task title" value={form.title} onChange={handle} required />
            <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }} name="description" placeholder="Description (optional)" value={form.description} onChange={handle} />
            <select style={styles.input} name="status" value={form.status} onChange={handle}>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button style={styles.btn} type="submit">{editId ? 'Update Task' : 'Create Task'}</button>
              {editId && <button style={styles.cancelBtn} type="button" onClick={() => { setEditId(null); setForm({ title: '', description: '', status: 'pending' }); }}>Cancel</button>}
            </div>
          </form>
        </div>

        {/* Task List */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📋 My Tasks ({tasks.length})</h2>
          {tasks.length === 0 && <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem', fontSize: '0.95rem' }}>No tasks yet. Create one above to get started!</p>}
          <div style={styles.taskGrid}>
            {tasks.map((task) => (
              <div key={task.id} style={styles.taskCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ color: '#1f2937', margin: 0, fontSize: '1.05rem', fontWeight: 700, flex: 1 }}>{task.title}</h3>
                  <span style={{ ...styles.badge, background: STATUS_COLORS[task.status] + '22', color: STATUS_COLORS[task.status], border: `1px solid ${STATUS_COLORS[task.status]}66` }}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                {task.description && <p style={{ color: '#6b7280', margin: '0.5rem 0', fontSize: '0.85rem', lineHeight: '1.5' }}>{task.description}</p>}
                <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '0.75rem 0 0' }}>📅 {new Date(task.created_at).toLocaleDateString()}</p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button style={styles.editBtn} onClick={() => startEdit(task)}>✏️ Edit</button>
                  <button style={styles.deleteBtn} onClick={() => deleteTask(task.id)}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #f0e6d2 0%, #c8e6f5 50%, #d4f1f4 100%)', fontFamily: "'Inter', -apple-system, sans-serif" },
  header: { background: 'linear-gradient(90deg, #ffffff 0%, #f5f8fb 100%)', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  logo: { color: '#6366f1', margin: 0, fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' },
  roleTag: { fontSize: '0.75rem', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', padding: '0.35rem 0.85rem', borderRadius: '999px', fontWeight: 700 },
  logoutBtn: { padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none', color: '#fff', borderRadius: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' },
  container: { maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem' },
  card: { background: 'rgba(255, 255, 255, 0.95)', borderRadius: '1.25rem', padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' },
  cardTitle: { color: '#1f2937', margin: '0 0 1.5rem', fontSize: '1.35rem', fontWeight: 700, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.9rem 1.25rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', background: '#f9fafb', color: '#1f2937', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box', transition: 'all 0.3s ease', fontFamily: 'inherit' },
  btn: { padding: '0.9rem 1.75rem', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', border: 'none', borderRadius: '0.75rem', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(99,102,241,0.4)', transition: 'all 0.3s ease' },
  cancelBtn: { padding: '0.9rem 1.75rem', background: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '0.75rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease' },
  taskGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
  taskCard: { background: 'rgba(255, 255, 255, 0.7)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)' },
  badge: { fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '999px', fontWeight: 700, whiteSpace: 'nowrap' },
  editBtn: { padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' },
  deleteBtn: { padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' },
  success: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' },
  error: { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(239,68,68,0.3)' },
};