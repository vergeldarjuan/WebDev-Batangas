import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { BookingModal } from '../components/BookingModal.jsx';
import { StatusMessage } from '../components/StatusMessage.jsx';
import { getListingImage } from '../data/siteContent.js';
import { useRevealAnimation } from '../hooks/useRevealAnimation.js';

const filters = [
  { label: 'All listings', value: '' },
  { label: 'Accommodations', value: 'Apartment' },
  { label: 'Car Rentals', value: 'Car' },
];

function formatPrice(listing) {
  return `PHP ${Number(listing.price || 0).toLocaleString('en-PH')} ${listing.price_unit}`;
}

export function ListingsPage({ user, onOpenAuth }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [pendingListing, setPendingListing] = useState(null);
  const category = searchParams.get('category') || '';

  useRevealAnimation(`${category}-${listings.length}`);

  useEffect(() => {
    setLoading(true);
    setMessage('');

    api.listings(category ? { category } : {})
      .then((data) => setListings(data.listings || []))
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    if (user && pendingListing) {
      setSelectedListing(pendingListing);
      setPendingListing(null);
    }
  }, [user, pendingListing]);

  const title = useMemo(() => {
    if (category === 'Apartment') {
      return 'Accommodations';
    }

    if (category === 'Car') {
      return 'Car Rentals';
    }

    return 'Rentals and Vehicles';
  }, [category]);

  const selectCategory = (value) => {
    setSuccessMessage('');
    setSearchParams(value ? { category: value } : {});
  };

  const startBooking = (listing) => {
    setSuccessMessage('');

    if (!user) {
      setPendingListing(listing);
      onOpenAuth('login');
      return;
    }

    setSelectedListing(listing);
  };

  const handleSaved = (text) => {
    setSuccessMessage(`${text} You can view it from your profile.`);
  };

  return (
    <main className="page-main rentals-page">
      <section className="section-head page-head reveal">
        <p className="section-eyebrow">Stay and Transport Options</p>
        <h1 className="section-title">{title}</h1>
        <p className="section-body">
          View verified accommodations and local vehicle rentals. Submit a request and wait for admin confirmation.
        </p>
      </section>

      <div className="rental-tabs reveal">
        {filters.map((filter) => (
          <button
            key={filter.label}
            type="button"
            className={category === filter.value ? 'tab-btn active' : 'tab-btn'}
            onClick={() => selectCategory(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <StatusMessage>{message}</StatusMessage>
      <StatusMessage success>{successMessage}</StatusMessage>
      {loading && <p className="loading-note">Loading listings...</p>}

      <section className="rental-grid">
        {listings.map((listing, index) => (
          <article key={listing.id} className={`rental-card reveal reveal-delay-${index % 4}`}>
            <div className="rental-image-wrap">
              <img className="rental-image" src={getListingImage(listing)} alt={listing.title} />
              <span className="rental-badge">{listing.category_name}</span>
            </div>
            <div className="rental-info">
              <div className="rental-meta">
                <span>Up to {listing.capacity} {listing.category_name === 'Car' ? 'seats' : 'guests'}</span>
                <span>{listing.location}</span>
              </div>
              <h2 className="rental-title">{listing.title}</h2>
              <p>{listing.description}</p>
              <div className="rental-price-wrap">
                <div className="rental-price">{formatPrice(listing)}</div>
                <button type="button" className="btn-book" onClick={() => startBooking(listing)}>
                  Book Now
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {!loading && !listings.length && (
        <p className="empty-state">No listings found for this category.</p>
      )}

      <BookingModal
        open={Boolean(selectedListing)}
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onSaved={handleSaved}
      />
    </main>
  );
}
