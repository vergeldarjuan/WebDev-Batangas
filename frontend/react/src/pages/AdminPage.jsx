import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { StatusMessage } from '../components/StatusMessage.jsx';

const bookingStatuses = ['pending', 'confirmed', 'cancelled', 'rejected'];
const emptyListingForm = {
  category_id: 1,
  title: '',
  description: '',
  location: '',
  price: '',
  price_unit: 'per night',
  capacity: 1,
  is_available: 1,
};

function AdminLogin({ setUser }) {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setBusy(true);

    try {
      const data = await api.login(email.trim(), password);

      if (data.user.role !== 'admin') {
        await api.logout();
        setMessage('This account does not have admin access.');
        return;
      }

      setUser(data.user);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page-main admin-page">
      <section className="admin-login-panel">
        <p className="section-eyebrow">Administrator</p>
        <h1 className="section-title">Dashboard Access</h1>
        <p className="section-body">Sign in with an administrator account to manage bookings and listing data.</p>
        <StatusMessage>{message}</StatusMessage>
        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="adminEmail" className="form-label">Email Address</label>
            <input id="adminEmail" className="form-control" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="adminPassword" className="form-label">Password</label>
            <input id="adminPassword" className="form-control" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          <button type="submit" className="btn-auth" disabled={busy}>{busy ? 'Checking' : 'Log In'}</button>
        </form>
      </section>
    </main>
  );
}

function formatPrice(listing) {
  return `PHP ${Number(listing.price || 0).toLocaleString('en-PH')} ${listing.price_unit}`;
}

export function AdminPage({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [statusDrafts, setStatusDrafts] = useState({});
  const [showListingForm, setShowListingForm] = useState(false);
  const [listingForm, setListingForm] = useState(emptyListingForm);

  const stats = useMemo(() => ({
    pending: bookings.filter((booking) => booking.status === 'pending').length,
    bookings: bookings.length,
    listings: listings.length,
  }), [bookings, listings]);

  const loadDashboardData = async () => {
    setMessage('');

    try {
      const [bookingData, listingData] = await Promise.all([
        api.bookings(),
        api.listings(),
      ]);
      setBookings(bookingData.bookings || []);
      setListings(listingData.listings || []);
      setStatusDrafts({});
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  if (!user) {
    return <AdminLogin setUser={setUser} />;
  }

  if (user.role !== 'admin') {
    return (
      <main className="page-main admin-page">
        <section className="section-head page-head">
          <p className="section-eyebrow">Admin Dashboard</p>
          <h1 className="section-title">Access denied</h1>
          <p className="section-body">This page is only available to administrator accounts.</p>
        </section>
      </main>
    );
  }

  const updateStatus = async (booking) => {
    const status = statusDrafts[booking.id] || booking.status;
    setMessage('');
    setSuccessMessage('');

    try {
      await api.updateBooking({
        id: booking.id,
        status,
      });
      setSuccessMessage('Booking status updated.');
      await loadDashboardData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const openCreateListing = () => {
    setListingForm(emptyListingForm);
    setShowListingForm(true);
    setActiveTab('listings');
  };

  const openEditListing = (listing) => {
    setListingForm({
      id: listing.id,
      category_id: Number(listing.category_id),
      title: listing.title,
      description: listing.description,
      location: listing.location,
      price: listing.price,
      price_unit: listing.price_unit,
      capacity: Number(listing.capacity),
      is_available: Number(listing.is_available),
    });
    setShowListingForm(true);
    setActiveTab('listings');
  };

  const updateListingField = (field, value) => {
    setListingForm((current) => ({
      ...current,
      [field]: ['category_id', 'capacity', 'is_available'].includes(field) ? Number(value) : value,
    }));
  };

  const saveListing = async (event) => {
    event.preventDefault();
    setMessage('');
    setSuccessMessage('');

    if (!listingForm.title.trim() || !listingForm.description.trim() || !listingForm.location.trim() || Number(listingForm.price) < 0 || Number(listingForm.capacity) < 1) {
      setMessage('Please complete the listing form.');
      return;
    }

    const payload = {
      ...listingForm,
      title: listingForm.title.trim(),
      description: listingForm.description.trim(),
      location: listingForm.location.trim(),
      price: Number(listingForm.price),
      capacity: Number(listingForm.capacity),
    };

    try {
      if (payload.id) {
        await api.updateListing(payload);
        setSuccessMessage('Listing updated.');
      } else {
        await api.createListing(payload);
        setSuccessMessage('Listing created.');
      }

      setShowListingForm(false);
      setListingForm(emptyListingForm);
      await loadDashboardData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const disableListing = async (id) => {
    if (!window.confirm('Disable this listing? Existing bookings will remain.')) {
      return;
    }

    setMessage('');
    setSuccessMessage('');

    try {
      await api.disableListing(id);
      setSuccessMessage('Listing disabled.');
      await loadDashboardData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="page-main admin-page">
      <section className="admin-header">
        <div>
          <p className="section-eyebrow">Admin Dashboard</p>
          <h1 className="section-title">Operations Overview</h1>
          <p className="section-body">Signed in as {user.full_name}</p>
        </div>
        <button type="button" className="admin-secondary-btn" onClick={loadDashboardData}>Refresh</button>
      </section>

      <StatusMessage>{message}</StatusMessage>
      <StatusMessage success>{successMessage}</StatusMessage>

      <section className="admin-stats">
        <article className="admin-stat">
          <span>Pending Bookings</span>
          <strong>{stats.pending}</strong>
        </article>
        <article className="admin-stat">
          <span>Total Bookings</span>
          <strong>{stats.bookings}</strong>
        </article>
        <article className="admin-stat">
          <span>Listings</span>
          <strong>{stats.listings}</strong>
        </article>
      </section>

      <div className="admin-tabs" role="tablist" aria-label="Admin sections">
        <button type="button" className={activeTab === 'bookings' ? 'admin-tab active' : 'admin-tab'} onClick={() => setActiveTab('bookings')}>Bookings</button>
        <button type="button" className={activeTab === 'listings' ? 'admin-tab active' : 'admin-tab'} onClick={() => setActiveTab('listings')}>Listings</button>
        <button type="button" className={activeTab === 'users' ? 'admin-tab active' : 'admin-tab'} onClick={() => setActiveTab('users')}>Users</button>
      </div>

      {activeTab === 'bookings' && (
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Booking Records</h2>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Listing</th>
                  <th>Dates</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      {booking.user_name}
                      <small>{booking.user_email}</small>
                    </td>
                    <td>
                      {booking.listing_title}
                      <small>{booking.category_name} - {booking.listing_location}</small>
                    </td>
                    <td>
                      {booking.start_date}
                      <small>to {booking.end_date}</small>
                    </td>
                    <td>{booking.guests}</td>
                    <td>
                      <select
                        className="form-control table-select"
                        value={statusDrafts[booking.id] || booking.status}
                        onChange={(event) => setStatusDrafts((current) => ({
                          ...current,
                          [booking.id]: event.target.value,
                        }))}
                      >
                        {bookingStatuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button type="button" className="admin-secondary-btn" onClick={() => updateStatus(booking)}>Save</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!bookings.length && <p className="empty-state">No booking records found.</p>}
        </section>
      )}

      {activeTab === 'listings' && (
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Rental Listings</h2>
            <button type="button" className="admin-secondary-btn" onClick={openCreateListing}>New Listing</button>
          </div>

          {showListingForm && (
            <form className="admin-form" onSubmit={saveListing}>
              <input type="hidden" value={listingForm.id || ''} readOnly />
              <div className="admin-form-grid">
                <div className="form-group">
                  <label htmlFor="listingTitle" className="form-label">Title</label>
                  <input id="listingTitle" className="form-control" value={listingForm.title} onChange={(event) => updateListingField('title', event.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="listingCategory" className="form-label">Category</label>
                  <select id="listingCategory" className="form-control" value={listingForm.category_id} onChange={(event) => updateListingField('category_id', event.target.value)}>
                    <option value="1">Apartment</option>
                    <option value="2">Car</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="listingLocation" className="form-label">Location</label>
                  <input id="listingLocation" className="form-control" value={listingForm.location} onChange={(event) => updateListingField('location', event.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="listingPrice" className="form-label">Price</label>
                  <input id="listingPrice" className="form-control" type="number" min="0" step="0.01" value={listingForm.price} onChange={(event) => updateListingField('price', event.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="listingPriceUnit" className="form-label">Price Unit</label>
                  <select id="listingPriceUnit" className="form-control" value={listingForm.price_unit} onChange={(event) => updateListingField('price_unit', event.target.value)}>
                    <option value="per night">per night</option>
                    <option value="per day">per day</option>
                    <option value="per trip">per trip</option>
                    <option value="per hour">per hour</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="listingCapacity" className="form-label">Capacity</label>
                  <input id="listingCapacity" className="form-control" type="number" min="1" value={listingForm.capacity} onChange={(event) => updateListingField('capacity', event.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="listingAvailable" className="form-label">Available</label>
                  <select id="listingAvailable" className="form-control" value={listingForm.is_available} onChange={(event) => updateListingField('is_available', event.target.value)}>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
                <div className="form-group admin-form-wide">
                  <label htmlFor="listingDescription" className="form-label">Description</label>
                  <textarea id="listingDescription" className="form-control" rows="3" value={listingForm.description} onChange={(event) => updateListingField('description', event.target.value)} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-auth inline-btn">{listingForm.id ? 'Update Listing' : 'Create Listing'}</button>
                <button type="button" className="admin-secondary-btn" onClick={() => setShowListingForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Capacity</th>
                  <th>Available</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td>
                      {listing.title}
                      <small>{listing.description}</small>
                    </td>
                    <td>{listing.category_name}</td>
                    <td>{listing.location}</td>
                    <td>{formatPrice(listing)}</td>
                    <td>{listing.capacity}</td>
                    <td>
                      <span className={Number(listing.is_available) === 1 ? 'admin-badge' : 'admin-badge no'}>
                        {Number(listing.is_available) === 1 ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" className="admin-secondary-btn" onClick={() => openEditListing(listing)}>Edit</button>
                        {Number(listing.is_available) === 1 && (
                          <button type="button" className="admin-danger-btn" onClick={() => disableListing(listing.id)}>Disable</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!listings.length && <p className="empty-state">No listing records found.</p>}
        </section>
      )}

      {activeTab === 'users' && (
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>User Records</h2>
          </div>
          <div className="admin-note">
            User management needs a users API next. This React page is ready for the tab, while current admin tools already manage bookings and listings.
          </div>
        </section>
      )}
    </main>
  );
}
