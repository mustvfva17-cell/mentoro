// Precepta — shared submit-lifecycle helpers for the student & physician forms

export function setSubmitting(form, isSubmitting, loadingLabel) {
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return;
  if (isSubmitting) {
    btn.dataset.originalLabel = btn.dataset.originalLabel || btn.textContent;
    btn.textContent = loadingLabel || 'Submitting…';
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
  } else {
    btn.textContent = btn.dataset.originalLabel || btn.textContent;
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
  }
}

export function showSuccess(panel) {
  const form = panel.querySelector('form');
  const success = panel.querySelector('.form-success');
  if (form) form.classList.add('is-hidden');
  if (success) {
    success.classList.add('is-visible');
    success.setAttribute('tabindex', '-1');
    success.focus();
  }
}

export function showError(panel, message) {
  const alertEl = panel.querySelector('.form-alert-error');
  if (!alertEl) return;
  const textEl = alertEl.querySelector('p');
  if (textEl) textEl.textContent = message;
  alertEl.hidden = false;
}

export function hideError(panel) {
  const alertEl = panel.querySelector('.form-alert-error');
  if (alertEl) alertEl.hidden = true;
}

// Logs the full Supabase/Postgres error shape (message, code, details, hint)
// to the console — that's the actual diagnostic info; PostgrestError objects
// don't always expand usefully by default in some devtools, so pulling the
// fields out explicitly makes sure they're visible. Returns a message that's
// more specific than a single generic string, without echoing raw database
// text back to a public-facing visitor.
export function logAndDescribeError(label, err) {
  const code = err && err.code;
  const message = (err && err.message) || String(err);

  console.error(label + ' failed. Supabase/Postgres error detail:', {
    message: message,
    code: code || null,
    details: (err && err.details) || null,
    hint: (err && err.hint) || null
  });

  // 42501 = insufficient_privilege — this is the SQLSTATE Postgres/PostgREST
  // returns specifically for an RLS policy rejection.
  if (code === '42501') {
    return 'Your submission was blocked by a server permissions rule, not something you entered. We\u2019ve logged the details — please try again shortly.';
  }
  // SQLSTATE class 23 = integrity constraint violation (not-null, check,
  // unique, foreign key, etc.) — something about the data itself.
  if (typeof code === 'string' && code.startsWith('23')) {
    return 'Some of the submitted information could not be saved. Please check the form and try again.';
  }
  if (/configuration|library/i.test(message)) {
    return 'We could not connect to the server. Please refresh the page and try again.';
  }
  return 'We could not submit your application. Please check your connection and try again.';
}
