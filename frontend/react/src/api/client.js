const API_BASE = '/api';

function buildPath(path, params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export async function request(path, options = {}) {
  const headers = options.body instanceof FormData
    ? options.headers || {}
    : {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    credentials: 'include',
    headers,
    body: options.body instanceof FormData
      ? options.body
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

export const api = {
  currentUser: () => request('/auth.php'),
  login: (email, password) => request('/auth.php?action=login', {
    method: 'POST',
    body: { email, password },
  }),
  register: (user) => request('/auth.php?action=register', {
    method: 'POST',
    body: user,
  }),
  logout: () => request('/auth.php?action=logout', { method: 'POST' }),
  updateProfile: (profile) => request('/auth.php', {
    method: 'PUT',
    body: profile,
  }),

  listings: (params = {}) => request(buildPath('/listings.php', params)),
  createListing: (listing) => request('/listings.php', {
    method: 'POST',
    body: listing,
  }),
  updateListing: (listing) => request('/listings.php', {
    method: 'PUT',
    body: listing,
  }),
  disableListing: (id) => request('/listings.php', {
    method: 'DELETE',
    body: { id },
  }),

  bookings: (params = {}) => request(buildPath('/bookings.php', params)),
  createBooking: (booking) => request('/bookings.php', {
    method: 'POST',
    body: booking,
  }),
  updateBooking: (booking) => request('/bookings.php', {
    method: 'PUT',
    body: booking,
  }),
  cancelBooking: (id) => request('/bookings.php', {
    method: 'DELETE',
    body: { id },
  }),
};
