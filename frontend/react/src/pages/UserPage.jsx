// UserPage.jsx - user profile and booking management interface
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { BookingModal } from '../components/BookingModal.jsx';
import { StatusMessage } from '../components/StatusMessage.jsx';

const phonePattern = /^09\d{9}$/;

function isPastBooking(booking) {
  const today = new Date().toISOString().slice(0, 10);
  return ['cancelled', 'rejected'].includes(booking.status) || booking.end_date < today;
}

function BookingCard({ booking, onEdit, onCancel }) {
  const canModify = ['pending', 'confirmed'].includes(booking.status);

  return (
    <article className="booking-card">
      <div className="booking-card-header">
        <div>
          <h3 className="booking-listing-title">{booking.listing_title}</h3>
          <span>{booking.category_name} - {booking.listing_location}</span>
        </div>
        <span className={`booking-status ${booking.status}`}>{booking.status}</span>
      </div>
      <div className="booking-details">
        <span>Dates: {booking.start_date} to {booking.end_date}</span>
        <span>Guests or seats: {booking.guests}</span>
        {booking.notes && <span>Notes: {booking.notes}</span>}
      </div>
      {canModify && (
        <div className="booking-actions">
          <button type="button" className="btn-action-edit" onClick={() => onEdit(booking)}>Modify</button>
          <button type="button" className="btn-action-cancel" onClick={() => onCancel(booking.id)}>Cancel Booking</button>
        </div>
      )}
    </article>
  );
}

export function UserPage({ user, setUser, onOpenAuth }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) {
      return;
    }

    setMessage('');

    try {
      const data = await api.bookings();
      setBookings(data.bookings || []);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  const activeBookings = useMemo(
    () => bookings.filter((booking) => !isPastBooking(booking)),
    [bookings],
  );

  const pastBookings = useMemo(
    () => bookings.filter((booking) => isPastBooking(booking)),
    [bookings],
  );

  if (!user) {
    return (
      <main className="page-main profile-page">
        <section className="section-head page-head">
          <p className="section-eyebrow">User Account</p>
          <h1 className="section-title">Sign in to manage your bookings</h1>
          <p className="section-body">
            Use your account to request bookings, change dates, cancel requests, and view your information.
          </p>
          <div className="hero-actions page-actions">
            <button type="button" className="hero-cta" onClick={() => onOpenAuth('login')}>Log In</button>
            <button type="button" className="hero-cta secondary-cta" onClick={() => onOpenAuth('register')}>Create Account</button>
          </div>
        </section>
      </main>
    );
  }

  const updateProfileField = (field, value) => {
    setProfile((current) => ({
      ...current,
      [field]: field === 'phone' ? value.replace(/\D/g, '').slice(0, 11) : value,
    }));
  };

  const startEditingProfile = () => {
    setMessage('');
    setSuccessMessage('');
    setEditingProfile(true);
  };

  const cancelEditingProfile = () => {
    setMessage('');
    setSuccessMessage('');
    setEditingProfile(false);
    setProfile({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
  };

  const saveProfile = async () => {
    setMessage('');
    setSuccessMessage('');

    if (!profile.full_name.trim() || !phonePattern.test(profile.phone.trim())) {
      setMessage('Please enter a valid full name and 11-digit phone number starting with 09.');
      return;
    }

    try {
      const data = await api.updateProfile({
        full_name: profile.full_name.trim(),
        phone: profile.phone.trim(),
      });
      setUser(data.user);
      setEditingProfile(false);
      setSuccessMessage('Profile updated.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) {
      return;
    }

    setMessage('');
    setSuccessMessage('');

    try {
      await api.cancelBooking(id);
      setSuccessMessage('Booking cancelled.');
      await loadBookings();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const bookingSaved = async (text) => {
    setSuccessMessage(text);
    await loadBookings();
  };

  return (
    <main className="page-main profile-page">
      <section className="section-head page-head">
        <p className="section-eyebrow">User Profile</p>
        <h1 className="section-title">{user.full_name}</h1>
        <p className="section-body">{user.email} - {user.role}</p>
      </section>

      <div className="profile-layout">
        <aside className="profile-side">
          <button
            type="button"
            className={activeTab === 'profile' ? 'profile-tab-btn active' : 'profile-tab-btn'}
            onClick={() => setActiveTab('profile')}
          >
            Personal Information
          </button>
          <button
            type="button"
            className={activeTab === 'active' ? 'profile-tab-btn active' : 'profile-tab-btn'}
            onClick={() => setActiveTab('active')}
          >
            Active Bookings
          </button>
          <button
            type="button"
            className={activeTab === 'past' ? 'profile-tab-btn active' : 'profile-tab-btn'}
            onClick={() => setActiveTab('past')}
          >
            Past Bookings
          </button>
          <Link to="/listings" className="side-link">Browse listings</Link>
        </aside>

        <section className="profile-panel">
          <StatusMessage>{message}</StatusMessage>
          <StatusMessage success>{successMessage}</StatusMessage>

          {activeTab === 'profile' && (
            <div className="profile-form">
              <div className="form-group">
                <label htmlFor="profileName" className="form-label">Full Name</label>
                <input
                  id="profileName"
                  className="form-control"
                  value={profile.full_name}
                  disabled={!editingProfile}
                  onChange={(event) => updateProfileField('full_name', event.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="profileEmail" className="form-label">Email Address</label>
                <input id="profileEmail" className="form-control" value={profile.email} disabled />
              </div>
              <div className="form-group">
                <label htmlFor="profilePhone" className="form-label">Phone Number</label>
                <input
                  id="profilePhone"
                  className="form-control"
                  value={profile.phone}
                  disabled={!editingProfile}
                  onChange={(event) => updateProfileField('phone', event.target.value)}
                />
              </div>
              <div className="form-actions">
                {editingProfile ? (
                  <>
                    <button type="button" className="btn-auth inline-btn" onClick={saveProfile}>Save Changes</button>
                    <button type="button" className="admin-secondary-btn" onClick={cancelEditingProfile}>Cancel</button>
                  </>
                ) : (
                  <button type="button" className="btn-auth inline-btn" onClick={startEditingProfile}>Edit Profile</button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'active' && (
            <div className="booking-list">
              {activeBookings.length ? activeBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onEdit={setEditingBooking}
                  onCancel={cancelBooking}
                />
              )) : <p className="empty-state">No active bookings yet.</p>}
            </div>
          )}

          {activeTab === 'past' && (
            <div className="booking-list">
              {pastBookings.length ? pastBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onEdit={setEditingBooking}
                  onCancel={cancelBooking}
                />
              )) : <p className="empty-state">No past bookings yet.</p>}
            </div>
          )}
        </section>
      </div>

      <BookingModal
        open={Boolean(editingBooking)}
        booking={editingBooking}
        onClose={() => setEditingBooking(null)}
        onSaved={bookingSaved}
      />
    </main>
  );
}
