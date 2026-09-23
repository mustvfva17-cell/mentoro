// Precepta — physician mentor application form → public.physician_applications

import { getSupabase } from './supabase-client.js';
import { setSubmitting, showSuccess, showError, hideError, logAndDescribeError } from './form-helpers.js';

const form = document.getElementById('physician-form');

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
      specialty: fd.get('specialty') || null,
      subspecialty: (fd.get('subspecialty') || '').toString().trim() || null,
      years_of_experience: fd.get('years') || null,
      city: (fd.get('city') || '').toString().trim(),
      hospital_institution: (fd.get('hospital') || '').toString().trim() || null,
      clinic: (fd.get('clinic') || '').toString().trim() || null,
      mentorship_types: fd.getAll('mentorship_type'),
      preferred_availability: fd.getAll('availability'),
      email: (fd.get('email') || '').toString().trim(),
      phone: (fd.get('phone') || '').toString().trim(),
      professional_bio: (fd.get('bio') || '').toString().trim() || null,
      consent_to_contact: fd.has('consent'),
      status: 'pending'
    };

    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('physician_applications').insert(payload);
      if (error) throw error;
      showSuccess(panel);
    } catch (err) {
      showError(panel, logAndDescribeError('Physician application submission', err));
      setSubmitting(form, false);
      submitting = false;
    }
  });
}
