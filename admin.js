// Precepta — admin dashboard
// Handles: Supabase Auth login/logout, loading both application tables,
// the detail modal, and approve/reject/return-to-pending status actions.

import { getSupabase } from './supabase-client.js';

let supabase = null;
let studentsCache = [];
let physiciansCache = [];
let currentDetail = null; // { app, type }

const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const logoutBtn = document.getElementById('logout-btn');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const loginBoot = document.getElementById('login-boot');

const modal = document.getElementById('detail-modal');
const detailContent = document.getElementById('detail-content');
const modalError = document.getElementById('modal-error');

init();

async function init() {
  try {
    supabase = getSupabase();
  } catch (err) {
    console.error('Supabase failed to initialize:', err);
    if (loginBoot) {
      loginBoot.hidden = false;
      loginBoot.textContent = 'Could not connect to the server. Please refresh, or try again shortly.';
    }
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();
  updateAuthUI(session);

  supabase.auth.onAuthStateChange(function (_event, session) {
    updateAuthUI(session);
  });

  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);

  document.querySelectorAll('.admin-tab').forEach(function (tab) {
    tab.addEventListener('click', function () { switchTab(tab.dataset.tab); });
  });

  document.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
  document.querySelectorAll('#detail-modal [data-action]').forEach(function (btn) {
    btn.addEventListener('click', function () { handleStatusChange(btn.dataset.action, btn); });
  });
}

function updateAuthUI(session) {
  if (session) {
    loginError.hidden = true;
    if (loginBoot) loginBoot.hidden = true;
    loginView.hidden = true;
    dashboardView.hidden = false;
    logoutBtn.hidden = false;
    loadApplications();
  } else {
    loginView.hidden = false;
    dashboardView.hidden = true;
    logoutBtn.hidden = true;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = loginForm.querySelector('button[type="submit"]');
  const originalLabel = btn.textContent;
  const fd = new FormData(loginForm);

  loginError.hidden = true;
  btn.disabled = true;
  btn.textContent = 'Signing in…';

  const { error } = await supabase.auth.signInWithPassword({
    email: (fd.get('email') || '').toString().trim(),
    password: (fd.get('password') || '').toString()
  });

  btn.disabled = false;
  btn.textContent = originalLabel;

  if (error) {
    loginError.textContent = 'We could not sign you in. Check your email and password and try again.';
    loginError.hidden = false;
  }
}

async function handleLogout() {
  logoutBtn.disabled = true;
  await supabase.auth.signOut();
  logoutBtn.disabled = false;
}

function switchTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(function (btn) {
    btn.classList.toggle('is-active', btn.dataset.tab === tab);
  });
  document.getElementById('tab-students').hidden = tab !== 'students';
  document.getElementById('tab-physicians').hidden = tab !== 'physicians';
}

async function loadApplications() {
  await Promise.all([loadStudents(), loadPhysicians()]);
}

async function loadStudents() {
  const statusEl = document.getElementById('students-status');
  statusEl.textContent = 'Loading applications…';
  const { data, error } = await supabase
    .from('student_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    statusEl.textContent = 'Could not load student applications. Please refresh to try again.';
    return;
  }
  studentsCache = data || [];
  statusEl.textContent = studentsCache.length ? '' : 'No student applications yet.';
  renderTable('students-tbody', studentsCache, 'student');
}

async function loadPhysicians() {
  const statusEl = document.getElementById('physicians-status');
  statusEl.textContent = 'Loading applications…';
  const { data, error } = await supabase
    .from('physician_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    statusEl.textContent = 'Could not load physician applications. Please refresh to try again.';
    return;
  }
  physiciansCache = data || [];
  statusEl.textContent = physiciansCache.length ? '' : 'No physician applications yet.';
  renderTable('physicians-tbody', physiciansCache, 'physician');
}

function renderTable(tbodyId, rows, type) {
  const tbody = document.getElementById(tbodyId);
  tbody.innerHTML = rows.map(function (app) { return rowHTML(app, type); }).join('');
  tbody.querySelectorAll('tr').forEach(function (tr) {
    tr.addEventListener('click', function () { openDetail(tr.dataset.id, type); });
  });
}

function rowHTML(app, type) {
  const specialty = type === 'student' ? app.specialty_of_interest : app.specialty;
  const status = app.status || 'pending';
  return (
    '<tr data-id="' + escapeHtml(app.id) + '">' +
      '<td>' + escapeHtml(app.full_name) + '</td>' +
      '<td>' + escapeHtml(app.email) + '</td>' +
      '<td>' + escapeHtml(specialty) + '</td>' +
      '<td>' + escapeHtml(app.city) + '</td>' +
      '<td><span class="status-badge status-' + escapeHtml(status) + '">' + escapeHtml(status) + '</span></td>' +
      '<td>' + formatDate(app.created_at) + '</td>' +
    '</tr>'
  );
}

function openDetail(id, type) {
  const list = type === 'student' ? studentsCache : physiciansCache;
  const app = list.find(function (a) { return String(a.id) === String(id); });
  if (!app) return;
  currentDetail = { app: app, type: type };
  modalError.hidden = true;
  detailContent.innerHTML = detailHTML(app, type);
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  document.querySelector('.admin-modal-panel').focus();
}

function closeModal() {
  modal.hidden = true;
  currentDetail = null;
  document.body.style.overflow = '';
}

function detailHTML(app, type) {
  const status = app.status || 'pending';
  const rows = type === 'student' ? [
    ['Full name', app.full_name],
    ['Email', app.email],
    ['Phone / WhatsApp', app.phone],
    ['Medical school', app.medical_school],
    ['Current year', app.current_year],
    ['City', app.city],
    ['Specialty of interest', app.specialty_of_interest],
    ['Preferred experience', formatArray(app.preferred_experience)],
    ['Mentorship goals', app.mentorship_goals],
    ['Consent to contact', app.consent_to_contact ? 'Yes' : 'No'],
    ['Submitted', formatDate(app.created_at, true)]
  ] : [
    ['Full name', app.full_name],
    ['Specialty', app.specialty],
    ['Subspecialty', app.subspecialty],
    ['Years of experience', app.years_of_experience],
    ['City', app.city],
    ['Hospital / institution', app.hospital_institution],
    ['Clinic', app.clinic],
    ['Mentorship types', formatArray(app.mentorship_types)],
    ['Preferred availability', formatArray(app.preferred_availability)],
    ['Email', app.email],
    ['Phone / WhatsApp', app.phone],
    ['Professional bio', app.professional_bio],
    ['Consent to contact', app.consent_to_contact ? 'Yes' : 'No'],
    ['Submitted', formatDate(app.created_at, true)]
  ];

  return (
    '<span class="status-badge status-' + escapeHtml(status) + '">' + escapeHtml(status) + '</span>' +
    '<dl class="detail-list">' +
      rows.map(function (pair) {
        return '<dt>' + escapeHtml(pair[0]) + '</dt><dd>' + escapeHtml(pair[1]) + '</dd>';
      }).join('') +
    '</dl>'
  );
}

async function handleStatusChange(action, btn) {
  if (!currentDetail) return;
  const newStatus = { approve: 'approved', reject: 'rejected', pending: 'pending' }[action];
  if (!newStatus) return;
  const { app, type } = currentDetail;
  const table = type === 'student' ? 'student_applications' : 'physician_applications';

  const allButtons = document.querySelectorAll('#detail-modal [data-action]');
  allButtons.forEach(function (b) { b.disabled = true; });
  const originalLabel = btn.textContent;
  btn.textContent = 'Saving…';
  modalError.hidden = true;

  const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', app.id);

  allButtons.forEach(function (b) { b.disabled = false; });
  btn.textContent = originalLabel;

  if (error) {
    console.error(error);
    modalError.textContent = 'Could not update this application. Please try again.';
    modalError.hidden = false;
    return;
  }

  app.status = newStatus;
  renderTable(type === 'student' ? 'students-tbody' : 'physicians-tbody', type === 'student' ? studentsCache : physiciansCache, type);
  closeModal();
}

function formatArray(arr) {
  if (!arr || !arr.length) return '—';
  return arr.join(', ');
}

function formatDate(iso, withTime) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const opts = withTime
    ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: 'numeric', month: 'short', year: 'numeric' };
  return d.toLocaleString('en-GB', opts);
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value === null || value === undefined || value === '' ? '—' : String(value);
  return div.innerHTML;
}
