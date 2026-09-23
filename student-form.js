// Precepta — student waitlist form → public.student_applications

import { getSupabase } from './supabase-client.js';
import { setSubmitting, showSuccess, showError, hideError, logAndDescribeError } from './form-helpers.js';

const form = document.getElementById('student-form');

if (form) {
  const panel = form.closest('.form-panel');
  let submitting = false;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (submitting) return; // guard against double submission

    submitting = true;
    hideError(panel);
    setSubmitting(form, true, 'Submitting…');

    const fd = new FormData(form);
    const payload = {
      full_name: (fd.get('name') || '').toString().trim(),
      email: (fd.get('email') || '').toString().trim(),
      phone: (fd.get('phone') || '').toString().trim(),
      medical_school: (fd.get('school') || '').toString().trim(),
      current_year: fd.get('year') || null,
      city: (fd.get('city') || '').toString().trim(),
      specialty_of_interest: fd.get('specialty') || null,
      preferred_experience: fd.getAll('experience_type'),
      mentorship_goals: (fd.get('goal') || '').toString().trim() || null,
      consent_to_contact: fd.has('consent'),
      status: 'pending'
    };

    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('student_applications').insert(payload);
      if (error) throw error;
      showSuccess(panel);
    } catch (err) {
      showError(panel, logAndDescribeError('Student application submission', err));
      setSubmitting(form, false);
      submitting = false;
    }
  });
}
