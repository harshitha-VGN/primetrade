import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

//  Helpers 

const STATUS_CFG = {
  pending:     { color: '#d97706', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  dot: '#f59e0b', label: 'Pending' },
  in_progress: { color: '#2563eb', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)',  dot: '#3b82f6', label: 'In Progress' },
  completed:   { color: '#059669', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)',  dot: '#10b981', label: 'Completed' },
};

const ROLE_CFG = {
  admin: { color: '#5b5fcf', bg: 'rgba(91,95,207,0.1)', border: 'rgba(91,95,207,0.25)' },
  user:  { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)' },
};

// ── Sub-components 

function StatCard({ label, value, color, bg, icon }) {
  return (
    <div style={{ ...s.statCard, background: bg, borderColor: color + '22' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      </div>
      <span style={{ ...s.statValue, color }}>{value}</span>
      <span style={s.statLabel}>{label}</span>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ ...s.toast, ...(toast.type === 'success' ? s.toastSuccess : s.toastError) }}>
      <span>{toast.type === 'success' ? '✓' : '!'}</span>
      {toast.text}
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={s.modalOverlay}>
      <div style={s.modal}>
        <div style={s.modalIcon}>⚠️</div>
        <h3 style={s.modalTitle}>Confirm Action</h3>
        <p style={s.modalMsg}>{message}</p>
        <div style={s.modalActions}>
          <button onClick={onCancel} style={s.modalCancelBtn}>Cancel</button>
          <button onClick={onConfirm} style={s.modalConfirmBtn}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component 

export default function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null); // { message, onConfirm }

  // Stats
  const [stats, setStats] = useState(null);

  // Users
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userPages, setUserPages] = useState(1);

  // Tasks
  const [tasks, setTasks] = useState([]);
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('');
  const [taskPage, setTaskPage] = useState(1);
  const [taskTotal, setTaskTotal] = useState(0);
  const [taskPages, setTaskPages] = useState(1);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const askConfirm = (message, onConfirm) => setConfirm({ message, onConfirm });

  // ── Data fetching 

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch { showToast('error', 'Failed to load stats'); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: userPage, limit: 15 });
      if (userSearch) params.set('search', userSearch);
      if (userRoleFilter) params.set('role', userRoleFilter);
      const res = await api.get(`/admin/users?${params}`);
      const { users: u, total, pages } = res.data.data;
      setUsers(u);
      setUserTotal(total);
      setUserPages(pages);
    } catch { showToast('error', 'Failed to load users'); }
  }, [userPage, userSearch, userRoleFilter]);

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: taskPage, limit: 15 });
      if (taskSearch) params.set('search', taskSearch);
      if (taskStatusFilter) params.set('status', taskStatusFilter);
      const res = await api.get(`/admin/tasks?${params}`);
      const { tasks: t, total, pages } = res.data.data;
      setTasks(t);
      setTaskTotal(total);
      setTaskPages(pages);
    } catch { showToast('error', 'Failed to load tasks'); }
  }, [taskPage, taskSearch, taskStatusFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (activeTab === 'users' || activeTab === 'overview') fetchUsers(); }, [fetchUsers, activeTab]);
  useEffect(() => { if (activeTab === 'tasks' || activeTab === 'overview') fetchTasks(); }, [fetchTasks, activeTab]);

  // ── User actions 

  const promoteUser = (id, name) => askConfirm(
    `Promote "${name}" to admin? They will gain full admin access.`,
    async () => {
      setConfirm(null);
      try {
        await api.patch(`/admin/users/${id}/promote`);
        showToast('success', `${name} promoted to admin.`);
        fetchUsers(); fetchStats();
      } catch (e) { showToast('error', e.response?.data?.message || 'Failed'); }
    }
  );

  const demoteUser = (id, name) => askConfirm(
    `Demote "${name}" back to a regular user?`,
    async () => {
      setConfirm(null);
      try {
        await api.patch(`/admin/users/${id}/demote`);
        showToast('success', `${name} demoted to user.`);
        fetchUsers(); fetchStats();
      } catch (e) { showToast('error', e.response?.data?.message || 'Failed'); }
    }
  );

  const deleteUser = (id, name) => askConfirm(
    `Permanently delete "${name}" and all their tasks? This cannot be undone.`,
    async () => {
      setConfirm(null);
      try {
        await api.delete(`/admin/users/${id}`);
        showToast('success', `${name} deleted.`);
        fetchUsers(); fetchStats(); fetchTasks();
      } catch (e) { showToast('error', e.response?.data?.message || 'Failed'); }
    }
  );

  // ── Task actions 

  const deleteTask = (id, title) => askConfirm(
    `Delete task "${title}"? This cannot be undone.`,
    async () => {
      setConfirm(null);
      try {
        await api.delete(`/admin/tasks/${id}`);
        showToast('success', 'Task deleted.');
        fetchTasks(); fetchStats();
      } catch (e) { showToast('error', e.response?.data?.message || 'Failed'); }
    }
  );

  const logout = () => { localStorage.clear(); navigate('/login'); };

  // ── Render 

  return (
    <div style={s.page}>
      <div style={s.bgTop} />
      <Toast toast={toast} />
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logoRow}>
            <div style={s.logoMark}>PT</div>
            <div>
              <span style={s.logoText}>PrimeTrade</span>
              <span style={{ ...s.roleChip, background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>ADMIN</span>
            </div>
          </div>
          <nav style={s.navTabs}>
            {[
              { key: 'overview', icon: '📊', label: 'Overview' },
              { key: 'users',    icon: '👥', label: 'Users' },
              { key: 'tasks',    icon: '📋', label: 'All Tasks' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{ ...s.navTab, ...(activeTab === tab.key ? s.navTabActive : {}) }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
          <div style={s.headerRight}>
            <button onClick={() => navigate('/dashboard')} style={s.switchBtn}>
              🔀 My Dashboard
            </button>
            <div style={s.avatar}>{currentUser.name?.charAt(0).toUpperCase()}</div>
            <span style={s.userName}>{currentUser.name}</span>
            <button onClick={logout} style={s.logoutBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={s.main}>

        {/* ── Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>Admin Overview</h1>
              <p style={s.pageSub}>Platform-wide statistics and quick access</p>
            </div>

            {stats ? (
              <>
                <div style={s.statsGrid}>
                  <StatCard label="Total Users"   value={stats.users.total}     color="#5b5fcf" bg="rgba(91,95,207,0.08)"    icon="👥" />
                  <StatCard label="Admins"         value={stats.users.admins}    color="#ef4444" bg="rgba(239,68,68,0.08)"    icon="🛡️" />
                  <StatCard label="Regular Users"  value={stats.users.regular}   color="#6b7280" bg="rgba(107,114,128,0.08)" icon="👤" />
                  <StatCard label="Total Tasks"    value={stats.tasks.total}     color="#1a1d3a" bg="rgba(26,29,58,0.06)"    icon="📋" />
                  <StatCard label="Pending Tasks"  value={stats.tasks.pending}   color="#d97706" bg="rgba(245,158,11,0.08)"  icon="⏳" />
                  <StatCard label="In Progress"    value={stats.tasks.in_progress} color="#2563eb" bg="rgba(59,130,246,0.08)" icon="⚙️" />
                  <StatCard label="Completed"      value={stats.tasks.completed} color="#059669" bg="rgba(16,185,129,0.08)" icon="✅" />
                </div>

                {/* Quick task completion bar */}
                {stats.tasks.total > 0 && (
                  <div style={s.progressCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={s.progressLabel}>Overall Task Completion</span>
                      <span style={s.progressPct}>{Math.round((stats.tasks.completed / stats.tasks.total) * 100)}%</span>
                    </div>
                    <div style={s.progressTrack}>
                      <div style={{ ...s.progressFill, width: `${Math.round((stats.tasks.completed / stats.tasks.total) * 100)}%`, background: 'linear-gradient(90deg,#5b5fcf,#10b981)' }} />
                    </div>
                    <div style={s.progressLegend}>
                      <span style={{ color: '#f59e0b' }}>⏳ {stats.tasks.pending} pending</span>
                      <span style={{ color: '#3b82f6' }}>⚙️ {stats.tasks.in_progress} in progress</span>
                      <span style={{ color: '#10b981' }}>✅ {stats.tasks.completed} done</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={s.loading}>Loading stats…</div>
            )}

            {/* Recent users snippet */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <span style={s.sectionTitle}>👥 Recent Users</span>
                  <button onClick={() => setActiveTab('users')} style={s.seeAllBtn}>See all →</button>
                </div>
                {users.slice(0, 5).map(u => (
                  <div key={u._id} style={s.miniRow}>
                    <div style={{ ...s.miniAvatar, background: u.role === 'admin' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#5b5fcf,#7c7fe8)' }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={s.miniName}>{u.name}</div>
                      <div style={s.miniEmail}>{u.email}</div>
                    </div>
                    <span style={{ ...s.roleBadge, ...ROLE_CFG[u.role] }}>{u.role}</span>
                  </div>
                ))}
              </div>
              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <span style={s.sectionTitle}>📋 Recent Tasks</span>
                  <button onClick={() => setActiveTab('tasks')} style={s.seeAllBtn}>See all →</button>
                </div>
                {tasks.slice(0, 5).map(t => {
                  const cfg = STATUS_CFG[t.status] || STATUS_CFG.pending;
                  return (
                    <div key={t._id || t.id} style={s.miniRow}>
                      <div style={{ ...s.statusDotLg, background: cfg.dot }} />
                      <div style={{ flex: 1 }}>
                        <div style={s.miniName}>{t.title}</div>
                        <div style={s.miniEmail}>{t.user?.name || 'Unknown'}</div>
                      </div>
                      <span style={{ ...s.roleBadge, background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div style={s.pageHeader}>
              <div>
                <h1 style={s.pageTitle}>User Management</h1>
                <p style={s.pageSub}>{userTotal} users total • Promote, demote, or remove</p>
              </div>
            </div>

            <div style={s.filterBar}>
              <input
                style={s.searchInput}
                placeholder="🔍  Search by name or email…"
                value={userSearch}
                onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
              />
              <select
                style={s.selectInput}
                value={userRoleFilter}
                onChange={e => { setUserRoleFilter(e.target.value); setUserPage(1); }}
              >
                <option value="">All roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={s.tableCard}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={s.tr}>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ ...s.miniAvatar, width: '32px', height: '32px', fontSize: '0.85rem', background: u.role === 'admin' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#5b5fcf,#7c7fe8)' }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500, color: '#1a1d3a' }}>{u.name}</span>
                          {u._id === currentUser.id && <span style={s.youBadge}>you</span>}
                        </div>
                      </td>
                      <td style={{ ...s.td, color: '#6b7280' }}>{u.email}</td>
                      <td style={s.td}>
                        <span style={{ ...s.roleBadge, ...ROLE_CFG[u.role] }}>{u.role}</span>
                      </td>
                      <td style={{ ...s.td, color: '#9ca3af', fontSize: '0.8rem' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={s.td}>
                        {u._id === currentUser.id ? (
                          <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>—</span>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {u.role === 'user' ? (
                              <button onClick={() => promoteUser(u._id, u.name)} style={s.promoteBtn}>
                                ⬆ Promote
                              </button>
                            ) : (
                              <button onClick={() => demoteUser(u._id, u.name)} style={s.demoteBtn}>
                                ⬇ Demote
                              </button>
                            )}
                            <button onClick={() => deleteUser(u._id, u.name)} style={s.dangerBtn}>
                              🗑 Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination page={userPage} pages={userPages} setPage={setUserPage} />
          </div>
        )}

        {/* ── Tasks Tab  */}
        {activeTab === 'tasks' && (
          <div>
            <div style={s.pageHeader}>
              <div>
                <h1 style={s.pageTitle}>All Tasks</h1>
                <p style={s.pageSub}>{taskTotal} tasks across all users</p>
              </div>
            </div>

            <div style={s.filterBar}>
              <input
                style={s.searchInput}
                placeholder="🔍  Search by title or description…"
                value={taskSearch}
                onChange={e => { setTaskSearch(e.target.value); setTaskPage(1); }}
              />
              <select
                style={s.selectInput}
                value={taskStatusFilter}
                onChange={e => { setTaskStatusFilter(e.target.value); setTaskPage(1); }}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div style={s.tableCard}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Task', 'Owner', 'Status', 'Created', 'Action'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => {
                    const cfg = STATUS_CFG[t.status] || STATUS_CFG.pending;
                    const tid = t._id || t.id;
                    return (
                      <tr key={tid} style={s.tr}>
                        <td style={s.td}>
                          <div style={{ fontWeight: 500, color: '#1a1d3a' }}>{t.title}</div>
                          {t.description && <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '2px' }}>{t.description.slice(0, 60)}{t.description.length > 60 ? '…' : ''}</div>}
                        </td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ ...s.miniAvatar, width: '28px', height: '28px', fontSize: '0.75rem', flexShrink: 0, background: 'linear-gradient(135deg,#5b5fcf,#7c7fe8)' }}>
                              {(t.user?.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>{t.user?.name || 'Unknown'}</div>
                              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{t.user?.email || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td style={s.td}>
                          <span style={{ ...s.roleBadge, background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                            <span style={{ ...s.statusDotSm, background: cfg.dot }} />{cfg.label}
                          </span>
                        </td>
                        <td style={{ ...s.td, color: '#9ca3af', fontSize: '0.8rem' }}>
                          {new Date(t.createdAt || t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={s.td}>
                          <button onClick={() => deleteTask(tid, t.title)} style={s.dangerBtn}>
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {tasks.length === 0 && (
                    <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>No tasks found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination page={taskPage} pages={taskPages} setPage={setTaskPage} />
          </div>
        )}
      </main>
    </div>
  );
}

// ── Pagination 

function Pagination({ page, pages, setPage }) {
  if (pages <= 1) return null;
  return (
    <div style={s.pagination}>
      <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ ...s.pageBtn, opacity: page <= 1 ? 0.4 : 1 }}>← Prev</button>
      <span style={s.pageInfo}>Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} style={{ ...s.pageBtn, opacity: page >= pages ? 0.4 : 1 }}>Next →</button>
    </div>
  );
}

// ── Styles 

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(160deg,#f0e8dc 0%,#e8eef8 40%,#d6eef5 100%)', fontFamily: 'var(--font-body)' },
  bgTop: { position: 'fixed', top: 0, left: 0, right: 0, height: '320px', background: 'linear-gradient(180deg,rgba(239,68,68,0.04) 0%,transparent 100%)', pointerEvents: 'none', zIndex: 0 },

  // Toast
  toast: { position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.85rem 1.25rem', borderRadius: '0.85rem', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
  toastSuccess: { background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' },
  toastError: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' },

  // Modal
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, backdropFilter: 'blur(4px)' },
  modal: { background: '#fff', borderRadius: '1.25rem', padding: '2.25rem 2rem', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalIcon: { fontSize: '2.5rem', marginBottom: '0.75rem' },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: '#1a1d3a', margin: '0 0 0.75rem' },
  modalMsg: { color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.75rem' },
  modalActions: { display: 'flex', gap: '0.75rem', justifyContent: 'center' },
  modalCancelBtn: { padding: '0.7rem 1.5rem', background: '#f3f4f6', border: '1.5px solid #e5e7eb', color: '#374151', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' },
  modalConfirmBtn: { padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg,#ef4444,#dc2626)', border: 'none', color: '#fff', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(239,68,68,0.35)' },

  // Header
  header: { background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(200,195,190,0.4)', position: 'sticky', top: 0, zIndex: 100 },
  headerInner: { maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', height: '64px', display: 'flex', alignItems: 'center', gap: '1rem' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginRight: '0.5rem' },
  logoMark: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem' },
  logoText: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: '#1a1d3a', letterSpacing: '-0.3px', marginRight: '0.5rem' },
  roleChip: { fontSize: '0.65rem', fontWeight: 700, color: '#fff', padding: '0.2rem 0.55rem', borderRadius: '999px' },
  navTabs: { display: 'flex', gap: '0.25rem', flex: 1 },
  navTab: { padding: '0.5rem 0.9rem', borderRadius: '0.6rem', border: 'none', background: 'transparent', color: '#6b7280', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' },
  navTabActive: { background: 'rgba(239,68,68,0.1)', color: '#dc2626', fontWeight: 600 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '0.65rem', marginLeft: 'auto' },
  switchBtn: { padding: '0.45rem 0.85rem', background: 'rgba(91,95,207,0.08)', border: '1px solid rgba(91,95,207,0.2)', color: '#5b5fcf', borderRadius: '0.6rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' },
  userName: { color: '#374151', fontSize: '0.85rem', fontWeight: 500 },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', borderRadius: '0.6rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },

  // Main
  main: { maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 },
  pageHeader: { marginBottom: '1.75rem' },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: '#1a1d3a', margin: 0, letterSpacing: '-0.5px' },
  pageSub: { color: '#6b7280', margin: '0.3rem 0 0', fontSize: '0.9rem' },

  // Stats
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '0.85rem', marginBottom: '1.25rem' },
  statCard: { borderRadius: '1rem', padding: '1.1rem 1.25rem', border: '1px solid transparent', display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  statValue: { fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 },
  statLabel: { color: '#6b7280', fontSize: '0.75rem', fontWeight: 500 },

  // Progress card
  progressCard: { background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderRadius: '1rem', padding: '1.25rem 1.5rem', border: '1px solid rgba(200,195,190,0.4)', marginBottom: '0.5rem' },
  progressLabel: { fontWeight: 600, color: '#1a1d3a', fontSize: '0.9rem' },
  progressPct: { fontFamily: 'var(--font-display)', fontWeight: 700, color: '#5b5fcf', fontSize: '1.1rem' },
  progressTrack: { height: '8px', background: '#f3f4f6', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.75rem' },
  progressFill: { height: '100%', borderRadius: '999px', transition: 'width 0.6s ease' },
  progressLegend: { display: 'flex', gap: '1.5rem', fontSize: '0.8rem', fontWeight: 500 },

  // Mini section cards 
  sectionCard: { background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', borderRadius: '1rem', padding: '1.25rem', border: '1px solid rgba(200,195,190,0.4)' },
  sectionHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1a1d3a', fontSize: '0.95rem' },
  seeAllBtn: { background: 'none', border: 'none', color: '#5b5fcf', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' },
  miniRow: { display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.04)' },
  miniAvatar: { width: '36px', height: '36px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem', flexShrink: 0 },
  miniName: { fontSize: '0.875rem', fontWeight: 500, color: '#1a1d3a' },
  miniEmail: { fontSize: '0.75rem', color: '#9ca3af' },
  statusDotLg: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  statusDotSm: { display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', marginRight: '5px', flexShrink: 0 },

  // Filter bar
  filterBar: { display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: '220px', padding: '0.7rem 1rem', borderRadius: '0.75rem', border: '1.5px solid rgba(200,195,190,0.7)', background: 'rgba(255,255,255,0.85)', color: '#1a1d3a', fontSize: '0.9rem' },
  selectInput: { padding: '0.7rem 1rem', borderRadius: '0.75rem', border: '1.5px solid rgba(200,195,190,0.7)', background: 'rgba(255,255,255,0.85)', color: '#374151', fontSize: '0.875rem', minWidth: '140px', cursor: 'pointer' },

  // Table
  tableCard: { background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', borderRadius: '1.25rem', border: '1px solid rgba(200,195,190,0.4)', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '0.9rem 1.25rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.06)' },
  tr: { borderBottom: '1px solid rgba(0,0,0,0.04)', transition: 'background 0.15s' },
  td: { padding: '0.9rem 1.25rem', fontSize: '0.875rem', verticalAlign: 'middle' },

  // Badges & role
  roleBadge: { display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid' },
  youBadge: { fontSize: '0.65rem', padding: '0.1rem 0.45rem', background: 'rgba(91,95,207,0.1)', color: '#5b5fcf', borderRadius: '999px', fontWeight: 700 },

  // Action buttons
  promoteBtn: { padding: '0.35rem 0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#059669', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 },
  demoteBtn: { padding: '0.35rem 0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#d97706', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 },
  dangerBtn: { padding: '0.35rem 0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 },

  // Pagination
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem' },
  pageBtn: { padding: '0.5rem 1.1rem', background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(200,195,190,0.6)', color: '#374151', borderRadius: '0.65rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 },
  pageInfo: { color: '#6b7280', fontSize: '0.875rem' },

  loading: { color: '#9ca3af', textAlign: 'center', padding: '3rem', fontSize: '0.9rem' },
};