import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^09\d{9}$/;

export function AuthModal({ open, mode = 'login', onClose, onAuth }) {
  const [activeMode, setActiveMode] = useState(mode);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    if (open) {
      setActiveMode(mode);
      setMessage('');
      setBusy(false);
      setForm({
        full_name: '',
        email: '',
        phone: '',
        password: '',
      });
    }
  }, [open, mode]);

  if (!open) {
    return null;
  }

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: field === 'phone' ? value.replace(/\D/g, '').slice(0, 11) : value,
    }));
  };

  const switchMode = (nextMode) => {
    setActiveMode(nextMode);
    setMessage('');
  };

  const validate = () => {
    if (!emailPattern.test(form.email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (form.password.length < (activeMode === 'register' ? 8 : 1)) {
      return activeMode === 'register'
        ? 'Password must be at least 8 characters.'
        : 'Password is required.';
    }

    if (activeMode === 'register') {
      if (!form.full_name.trim()) {
        return 'Full name is required.';
      }

      if (!phonePattern.test(form.phone.trim())) {
        return 'Phone number must be 11 digits and start with 09.';
      }
    }

    return '';
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');

    const validationMessage = validate();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setBusy(true);

    try {
      const data = activeMode === 'register'
        ? await api.register({
            full_name: form.full_name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            password: form.password,
          })
        : await api.login(form.email.trim(), form.password);

      onAuth(data.user);
      onClose();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true">
      <div className="modal-card auth-card">
        <button type="button" className="modal-close-btn" aria-label="Close modal" onClick={onClose}>
          <span aria-hidden="true">x</span>
        </button>

        <div className="modal-header">
          <h3 className="modal-title">{activeMode === 'register' ? 'Create Account' : 'Welcome Back'}</h3>
          <p className="modal-subtitle">
            {activeMode === 'register' ? 'Already have an account?' : 'New to Batangas?'}
            {' '}
            <button type="button" className="inline-link" onClick={() => switchMode(activeMode === 'register' ? 'login' : 'register')}>
              {activeMode === 'register' ? 'Log in here' : 'Create an account'}
            </button>
          </p>
        </div>

        {message && <div className="auth-alert">{message}</div>}

        <form onSubmit={submit}>
          {activeMode === 'register' && (
            <div className="form-group">
              <label htmlFor="authName" className="form-label">Full Name</label>
              <input
                id="authName"
                className="form-control"
                value={form.full_name}
                onChange={(event) => updateField('full_name', event.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="authEmail" className="form-label">Email Address</label>
            <input
              id="authEmail"
              className="form-control"
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              autoComplete="email"
            />
          </div>

          {activeMode === 'register' && (
            <div className="form-group">
              <label htmlFor="authPhone" className="form-label">Phone Number</label>
              <input
                id="authPhone"
                className="form-control"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="09XXXXXXXXX"
                autoComplete="tel"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="authPassword" className="form-label">Password</label>
            <input
              id="authPassword"
              className="form-control"
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              autoComplete={activeMode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>

          <button type="submit" className="btn-auth" disabled={busy}>
            {busy ? 'Please wait' : activeMode === 'register' ? 'Register' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
