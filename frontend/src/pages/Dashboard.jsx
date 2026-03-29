import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STATUS_CONFIG = {
  pending:     { color: '#d97706', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  dot: '#f59e0b', label: 'Pending' },
  in_progress: { color: '#2563eb', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)',  dot: '#3b82f6', label: 'In Progress' },
  completed:   { color: '#059669', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)',  dot: '#10b981', label: 'Completed' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', status: 'pending' });
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.data);
    } catch (e) { showToast('error', 'Failed to load tasks'); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/tasks/${editId}`, form);
        showToast('success', 'Task updated!');
        setEditId(null);
      } else {
        await api.post('/tasks', form);
        showToast('success', 'Task created!');
      }
      setForm({ title: '', description: '', status: 'pending' });
      fetchTasks();
    } catch (e) { showToast('error', e.response?.data?.message || 'Something went wrong'); }
  };

  const startEdit = (task) => {
    setEditId(task._id || task.id);
    setForm({ title: task.title, description: task.description || '', status: task.status });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditId(null); setForm({ title: '', description: '', status: 'pending' }); };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      showToast('success', 'Task deleted.');
      fetchTasks();
    } catch (e) { showToast('error', e.response?.data?.message || 'Delete failed'); }
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div style={s.page}>
      <div style={s.bgTop} />

      {toast && (
        <div style={{ ...s.toast, ...(toast.type === 'success' ? s.toastSuccess : s.toastError) }}>
          <span>{toast.type === 'success' ? '✓' : '!'}</span>
          {toast.text}
        </div>
      )}

      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logoRow}>
            <div style={s.logoMark}>PT</div>
            <div>
              <span style={s.logoText}>PrimeTrade</span>
              <span style={s.roleChip}>{user.role?.toUpperCase()}</span>
            </div>
          </div>
          <div style={s.headerRight}>
            {user.role === 'admin' && (
              <button onClick={() => navigate('/admin')} style={s.adminBtn}>
                🛡️ Admin Panel
              </button>
            )}
            <div style={s.avatar}>{user.name?.charAt(0).toUpperCase()}</div>
            <span style={s.userName}>{user.name}</span>
            <button onClick={logout} style={s.logoutBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={s.main}>
        <div style={s.statsRow}>
          {[
            { label: 'Total Tasks',  value: counts.all,         color: '#5b5fcf', bg: 'rgba(91,95,207,0.08)' },
            { label: 'Pending',      value: counts.pending,     color: '#d97706', bg: 'rgba(245,158,11,0.08)' },
            { label: 'In Progress',  value: counts.in_progress, color: '#2563eb', bg: 'rgba(59,130,246,0.08)' },
            { label: 'Completed',    value: counts.completed,   color: '#059669', bg: 'rgba(16,185,129,0.08)' },
          ].map((stat, i) => (
            <div key={i} style={{ ...s.statCard, background: stat.bg, borderColor: stat.color + '22' }} className={`fade-up fade-up-${i+1}`}>
              <span style={{ ...s.statValue, color: stat.color }}>{stat.value}</span>
              <span style={s.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>

        <div style={s.grid}>
          {/* Form */}
          <div style={s.formCard} className="fade-up fade-up-2">
            <div style={s.formHeader}>
              <div style={{ ...s.formIconWrap, background: editId ? 'rgba(59,130,246,0.1)' : 'rgba(91,95,207,0.1)' }}>
                {editId
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5b5fcf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                }
              </div>
              <h2 style={s.formTitle}>{editId ? 'Edit Task' : 'New Task'}</h2>
            </div>

            <form onSubmit={submit} style={s.formBody}>
              <div style={s.field}>
                <label style={s.label}>Task Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input style={s.input} name="title" placeholder="What needs to be done?" value={form.title} onChange={handle} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Description <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                <textarea style={{ ...s.input, height: '90px', resize: 'vertical', lineHeight: '1.5' }} name="description" placeholder="Add details..." value={form.description} onChange={handle} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Status</label>
                <div style={s.statusSelect}>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button key={key} type="button" onClick={() => setForm({ ...form, status: key })} style={{ ...s.statusOpt, background: form.status === key ? cfg.bg : 'transparent', border: form.status === key ? `1.5px solid ${cfg.border}` : '1.5px solid transparent', color: form.status === key ? cfg.color : '#6b7280', fontWeight: form.status === key ? 600 : 400 }}>
                      <span style={{ ...s.statusDot, background: cfg.dot }} />
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={s.formActions}>
                <button type="submit" style={{ ...s.btn, background: editId ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'linear-gradient(135deg,#5b5fcf,#7c7fe8)', boxShadow: editId ? '0 4px 15px rgba(59,130,246,0.35)' : '0 4px 15px rgba(91,95,207,0.35)' }}>
                  {editId ? 'Update Task' : 'Create Task'}
                </button>
                {editId && <button type="button" onClick={cancelEdit} style={s.cancelBtn}>Cancel</button>}
              </div>
            </form>
          </div>

          {/* Task List */}
          <div style={s.listSection}>
            <div style={s.filterRow}>
              {[
                { key: 'all',         label: `All (${counts.all})` },
                { key: 'pending',     label: `Pending (${counts.pending})` },
                { key: 'in_progress', label: `In Progress (${counts.in_progress})` },
                { key: 'completed',   label: `Done (${counts.completed})` },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{ ...s.filterBtn, ...(filter === f.key ? s.filterActive : {}) }}>
                  {f.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={s.empty}>
                <div style={s.emptyIcon}>📋</div>
                <p style={s.emptyTitle}>{filter === 'all' ? 'No tasks yet' : `No ${filter.replace('_',' ')} tasks`}</p>
                <p style={s.emptySub}>{filter === 'all' ? 'Create your first task using the form.' : 'Try a different filter.'}</p>
              </div>
            ) : (
              <div style={s.taskList}>
                {filtered.map((task, i) => {
                  const cfg = STATUS_CONFIG[task.status];
                  const tid = task._id || task.id;
                  return (
                    <div key={tid} style={s.taskCard} className={`fade-up fade-up-${Math.min(i+1,4)}`}>
                      <div style={s.taskTop}>
                        <div style={{ ...s.taskStatusDot, background: cfg.dot }} />
                        <h3 style={s.taskTitle}>{task.title}</h3>
                        <span style={{ ...s.badge, background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>{cfg.label}</span>
                      </div>
                      {task.description && <p style={s.taskDesc}>{task.description}</p>}
                      <div style={s.taskFooter}>
                        <span style={s.taskDate}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {new Date(task.createdAt || task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div style={s.taskActions}>
                          <button style={s.editBtn} onClick={() => startEdit(task)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Edit
                          </button>
                          <button style={s.deleteBtn} onClick={() => deleteTask(tid)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(160deg,#f0e8dc 0%,#e8eef8 40%,#d6eef5 100%)', fontFamily: 'var(--font-body)' },
  bgTop: { position: 'fixed', top: 0, left: 0, right: 0, height: '320px', background: 'linear-gradient(180deg,rgba(91,95,207,0.06) 0%,transparent 100%)', pointerEvents: 'none', zIndex: 0 },
  toast: { position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.85rem 1.25rem', borderRadius: '0.85rem', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.6rem', animation: 'slideDown 0.3s cubic-bezier(.22,1,.36,1)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
  toastSuccess: { background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' },
  toastError:   { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' },
  header: { background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(200,195,190,0.4)', position: 'sticky', top: 0, zIndex: 100 },
  headerInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  logoMark: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#5b5fcf,#7c7fe8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem' },
  logoText: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: '#1a1d3a', letterSpacing: '-0.3px', marginRight: '0.5rem' },
  roleChip: { fontSize: '0.65rem', fontWeight: 700, background: 'linear-gradient(135deg,#5b5fcf,#7c7fe8)', color: '#fff', padding: '0.2rem 0.55rem', borderRadius: '999px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#5b5fcf,#7c7fe8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' },
  userName: { color: '#374151', fontSize: '0.875rem', fontWeight: 500 },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', borderRadius: '0.6rem', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600 },
  adminBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.22)', color: '#dc2626', borderRadius: '0.6rem', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600 },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.75rem' },
  statCard: { borderRadius: '1rem', padding: '1.25rem 1.5rem', border: '1px solid transparent', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  statValue: { fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, lineHeight: 1 },
  statLabel: { color: '#6b7280', fontSize: '0.8rem', fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' },
  formCard: { background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '1.25rem', border: '1px solid rgba(200,195,190,0.4)', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
  formHeader: { padding: '1.5rem 1.75rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' },
  formIconWrap: { width: '36px', height: '36px', borderRadius: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  formTitle: { fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#1a1d3a', margin: 0 },
  formBody: { padding: '1.25rem 1.75rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.825rem', fontWeight: 600, color: '#374151' },
  input: { width: '100%', padding: '0.8rem 1rem', borderRadius: '0.75rem', border: '1.5px solid rgba(200,195,190,0.7)', background: 'rgba(255,255,255,0.8)', color: '#1a1d3a', fontSize: '0.9rem', transition: 'all 0.2s ease', boxSizing: 'border-box' },
  statusSelect: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  statusOpt: { padding: '0.6rem 0.9rem', borderRadius: '0.65rem', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.55rem', transition: 'all 0.2s', textAlign: 'left' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  formActions: { display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' },
  btn: { flex: 1, padding: '0.85rem', color: '#fff', border: 'none', borderRadius: '0.75rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { padding: '0.85rem 1.25rem', background: 'rgba(0,0,0,0.04)', border: '1.5px solid rgba(0,0,0,0.08)', color: '#6b7280', borderRadius: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 },
  listSection: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  filterRow: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  filterBtn: { padding: '0.45rem 0.9rem', borderRadius: '999px', border: '1.5px solid rgba(200,195,190,0.5)', background: 'rgba(255,255,255,0.6)', color: '#6b7280', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(8px)' },
  filterActive: { background: '#5b5fcf', borderColor: '#5b5fcf', color: '#fff', boxShadow: '0 2px 10px rgba(91,95,207,0.3)' },
  empty: { background: 'rgba(255,255,255,0.7)', borderRadius: '1.25rem', padding: '4rem 2rem', textAlign: 'center', border: '1px solid rgba(200,195,190,0.4)' },
  emptyIcon: { fontSize: '3rem', marginBottom: '1rem' },
  emptyTitle: { fontFamily: 'var(--font-display)', color: '#1a1d3a', fontWeight: 600, fontSize: '1.1rem', margin: '0 0 0.4rem' },
  emptySub: { color: '#9ca3af', fontSize: '0.875rem' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  taskCard: { background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: '1rem', padding: '1.25rem 1.5rem', border: '1px solid rgba(200,195,190,0.4)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
  taskTop: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' },
  taskStatusDot: { width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0 },
  taskTitle: { fontFamily: 'var(--font-display)', color: '#1a1d3a', margin: 0, fontSize: '0.975rem', fontWeight: 600, flex: 1 },
  badge: { fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: '999px', fontWeight: 600, border: '1px solid', whiteSpace: 'nowrap', flexShrink: 0 },
  taskDesc: { color: '#6b7280', fontSize: '0.85rem', lineHeight: '1.55', margin: '0 0 0.75rem', paddingLeft: '1.6rem' },
  taskFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.05)' },
  taskDate: { display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#9ca3af', fontSize: '0.775rem' },
  taskActions: { display: 'flex', gap: '0.5rem' },
  editBtn: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.38rem 0.85rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#2563eb', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  deleteBtn: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.38rem 0.85rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
};