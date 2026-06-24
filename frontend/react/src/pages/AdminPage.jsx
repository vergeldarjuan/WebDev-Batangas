import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { StatusMessage, ToastMessage } from '../components/StatusMessage.jsx';

const bookingStatuses = ['pending', 'confirmed', 'cancelled', 'rejected'];
const phonePattern = /^09\d{9}$/;
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
const emptyUserForm = {
  id: '',
  full_name: '',
  email: '',
  phone: '',
  role: 'user',
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
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserBookings, setSelectedUserBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [statusDrafts, setStatusDrafts] = useState({});
  const [showListingForm, setShowListingForm] = useState(false);
  const [listingForm, setListingForm] = useState(emptyListingForm);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);

  const clearNotification = () => {
    setMessage('');
    setSuccessMessage('');
  };

  const notifyError = (text) => {
    setSuccessMessage('');
    setMessage(text);
  };

  const notifySuccess = (text) => {
    setMessage('');
    setSuccessMessage(text);
  };

  const stats = useMemo(() => ({
    pending: bookings.filter((booking) => booking.status === 'pending').length,
    bookings: bookings.length,
    listings: listings.length,
    users: users.length,
  }), [bookings, listings, users]);

  const loadDashboardData = async () => {
    setMessage('');

    try {
      const [bookingData, listingData, userData] = await Promise.all([
        api.bookings(),
        api.listings(),
        api.users(),
      ]);
      setBookings(bookingData.bookings || []);
      setListings(listingData.listings || []);
      setUsers(userData.users || []);
      setStatusDrafts({});
    } catch (error) {
      notifyError(error.message);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (!message && !successMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(clearNotification, 3500);

    return () => window.clearTimeout(timeout);
  }, [message, successMessage]);

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
    clearNotification();

    try {
      await api.updateBooking({
        id: booking.id,
        status,
      });
      notifySuccess('Booking status updated.');
      await loadDashboardData();
    } catch (error) {
      notifyError(error.message);
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
    clearNotification();

    if (!listingForm.title.trim() || !listingForm.description.trim() || !listingForm.location.trim() || Number(listingForm.price) < 0 || Number(listingForm.capacity) < 1) {
      notifyError('Please complete the listing form.');
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
        notifySuccess('Listing updated.');
      } else {
        await api.createListing(payload);
        notifySuccess('Listing created.');
      }

      setShowListingForm(false);
      setListingForm(emptyListingForm);
      await loadDashboardData();
    } catch (error) {
      notifyError(error.message);
    }
  };

  const disableListing = async (id) => {
    if (!window.confirm('Disable this listing? Existing bookings will remain.')) {
      return;
    }

    clearNotification();

    try {
      await api.disableListing(id);
      notifySuccess('Listing disabled.');
      await loadDashboardData();
    } catch (error) {
      notifyError(error.message);
    }
  };

  const loadUserDetails = async (id, options = {}) => {
    if (!options.keepNotification) {
      clearNotification();
    }

    try {
      const data = await api.users({ id });
      setSelectedUser(data.user);
      setSelectedUserBookings(data.bookings || []);
      setShowUserForm(false);
    } catch (error) {
      notifyError(error.message);
    }
  };

  const openEditUser = (targetUser) => {
    setUserForm({
      id: targetUser.id,
      full_name: targetUser.full_name,
      email: targetUser.email,
      phone: targetUser.phone,
      role: targetUser.role,
    });
    setSelectedUser(targetUser);
    setShowUserForm(true);
    setActiveTab('users');
  };

  const updateUserField = (field, value) => {
    setUserForm((current) => ({
      ...current,
      [field]: field === 'phone' ? value.replace(/\D/g, '').slice(0, 11) : value,
    }));
  };

  const saveUser = async (event) => {
    event.preventDefault();
    clearNotification();

    if (!userForm.full_name.trim() || !phonePattern.test(userForm.phone.trim()) || !['user', 'admin'].includes(userForm.role)) {
      notifyError('Please provide valid user details.');
      return;
    }

    try {
      const data = await api.updateUser({
        id: userForm.id,
        full_name: userForm.full_name.trim(),
        phone: userForm.phone.trim(),
        role: userForm.role,
      });

      notifySuccess('User updated.');
      setShowUserForm(false);
      await loadDashboardData();
      await loadUserDetails(data.user.id, { keepNotification: true });
    } catch (error) {
      notifyError(error.message);
    }
  };

  return (
    <main className="page-main admin-page">
      <ToastMessage success={Boolean(successMessage)} onClose={clearNotification}>
        {successMessage || message}
      </ToastMessage>

      <section className="admin-header">
        <div>
          <p className="section-eyebrow">Admin Dashboard</p>
          <h1 className="section-title">Operations Overview</h1>
          <p className="section-body">Signed in as {user.full_name}</p>
        </div>
        <button type="button" className="admin-secondary-btn" onClick={loadDashboardData}>Refresh</button>
      </section>

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
        <article className="admin-stat">
          <span>Users</span>
          <strong>{stats.users}</strong>
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

          {showUserForm && (
            <form className="admin-form" onSubmit={saveUser}>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label htmlFor="userName" className="form-label">Full Name</label>
                  <input id="userName" className="form-control" value={userForm.full_name} onChange={(event) => updateUserField('full_name', event.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="userEmail" className="form-label">Email Address</label>
                  <input id="userEmail" className="form-control" value={userForm.email} disabled />
                </div>
                <div className="form-group">
                  <label htmlFor="userPhone" className="form-label">Phone</label>
                  <input id="userPhone" className="form-control" value={userForm.phone} onChange={(event) => updateUserField('phone', event.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="userRole" className="form-label">Role</label>
                  <select id="userRole" className="form-control" value={userForm.role} onChange={(event) => updateUserField('role', event.target.value)}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-auth inline-btn">Save User</button>
                <button type="button" className="admin-secondary-btn" onClick={() => setShowUserForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Bookings</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.full_name}
                      <small>Joined {item.created_at}</small>
                    </td>
                    <td>{item.email}</td>
                    <td>{item.phone}</td>
                    <td>
                      <span className={item.role === 'admin' ? 'admin-badge role-admin' : 'admin-badge role-user'}>
                        {item.role}
                      </span>
                    </td>
                    <td>
                      {item.total_bookings}
                      <small>{item.active_bookings} active</small>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" className="admin-secondary-btn" onClick={() => loadUserDetails(item.id)}>View</button>
                        <button type="button" className="admin-secondary-btn" onClick={() => openEditUser(item)}>Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!users.length && <p className="empty-state">No registered users found.</p>}

          {selectedUser && (
            <div className="admin-detail-panel">
              <div className="admin-panel-head">
                <h2>{selectedUser.full_name}</h2>
                <button type="button" className="admin-secondary-btn" onClick={() => openEditUser(selectedUser)}>Edit User</button>
              </div>
              <div className="admin-note">
                {selectedUser.email} - {selectedUser.phone} - {selectedUser.role}
              </div>
              <h3 className="admin-subtitle">Booking History</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Listing</th>
                      <th>Category</th>
                      <th>Dates</th>
                      <th>Guests</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUserBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          {booking.listing_title}
                          <small>{booking.listing_location}</small>
                        </td>
                        <td>{booking.category_name}</td>
                        <td>
                          {booking.start_date}
                          <small>to {booking.end_date}</small>
                        </td>
                        <td>{booking.guests}</td>
                        <td>
                          <span className={`booking-status ${booking.status}`}>{booking.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!selectedUserBookings.length && <p className="empty-state">This user has no booking records.</p>}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
