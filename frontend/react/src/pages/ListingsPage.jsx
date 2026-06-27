// ListingsPage.jsx - public listing browse and booking entry points
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { BookingModal } from '../components/BookingModal.jsx';
import { StatusMessage } from '../components/StatusMessage.jsx';
import { getListingImages } from '../data/siteContent.js';
import { useRevealAnimation } from '../hooks/useRevealAnimation.js';

const filters = [
  { label: 'All listings', value: '' },
  { label: 'Accommodations', value: 'Apartment' },
  { label: 'Car Rentals', value: 'Car' },
];

function formatPrice(listing) {
  return `PHP ${Number(listing.price || 0).toLocaleString('en-PH')} ${listing.price_unit}`;
}

function ListingImageCarousel({ listing }) {
  const images = useMemo(() => getListingImages(listing), [listing]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] || images[0];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [listing.id, images.length]);

  const showPreviousImage = () => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const showNextImage = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };

  return (
    <div className="rental-image-wrap">
      <img className="rental-image" src={activeImage} alt={listing.title} />
      <span className="rental-badge">{listing.category_name}</span>

      {hasMultipleImages && (
        <>
          <button
            type="button"
            className="rental-image-nav previous"
            onClick={showPreviousImage}
          >
            <span>&lsaquo;</span>
          </button>
          <button
            type="button"
            className="rental-image-nav next"
            onClick={showNextImage}
          >
            <span>&rsaquo;</span>
          </button>
          <div className="rental-image-dots">
            {images.map((imagePath, index) => (
              <button
                key={`${imagePath}-${index}`}
                type="button"
                className={activeIndex === index ? 'rental-image-dot active' : 'rental-image-dot'}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
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
  const revealKey = useMemo(
    () => `${category}-${listings.map((listing) => listing.id).join('-')}`,
    [category, listings],
  );

  useRevealAnimation(revealKey);

  useEffect(() => {
    let isCurrentRequest = true;

    setLoading(true);
    setMessage('');
    setListings([]);

    api.listings(category ? { category } : {})
      .then((data) => {
        if (isCurrentRequest) {
          setListings(data.listings || []);
        }
      })
      .catch((error) => {
        if (isCurrentRequest) {
          setMessage(error.message);
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
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
            <ListingImageCarousel listing={listing} />
            <div className="rental-info">
              <div className="rental-meta">
                <span>Up to {listing.capacity} {listing.category_name === 'Car' ? 'seats' : 'guests'}</span>
                <span>{listing.location}</span>
              </div>
              <h2 className="rental-title">{listing.title}</h2>
              <p>{listing.description}</p>
              <div className="rental-price-wrap">
                <div className="rental-price">{formatPrice(listing)}</div>
                {
                  listing.is_available ? <button type="button" className="btn-book" onClick={() => startBooking(listing)}>
                  Book Now
                </button> : <button type="button" className="btn-book disabled-btn" disabled>
                  Not Available
                </button>
                }

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
