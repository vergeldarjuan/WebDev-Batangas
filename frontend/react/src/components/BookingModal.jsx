import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function BookingModal({ listing, booking, open, onClose, onSaved }) {
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    guests: 1,
    notes: '',
  });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const item = useMemo(() => {
    if (listing) {
      return listing;
    }

    if (!booking) {
      return null;
    }

    return {
      id: booking.listing_id,
      title: booking.listing_title,
      category_name: booking.category_name,
      price: booking.listing_price,
      price_unit: booking.listing_price_unit,
      capacity: booking.listing_capacity,
    };
  }, [listing, booking]);

  const maxCapacity = Math.max(1, Number(item?.capacity || item?.listing_capacity || 1));
  const isEdit = Boolean(booking);

  useEffect(() => {
    if (!open) {
      return;
    }

    setMessage('');
    setBusy(false);
    setForm({
      start_date: booking?.start_date || todayString(),
      end_date: booking?.end_date || todayString(),
      guests: Number(booking?.guests || 1),
      notes: booking?.notes || '',
    });
  }, [open, booking]);

  if (!open || !item) {
    return null;
  }

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: field === 'guests' ? Number(value) : value,
    }));
  };

  const validate = () => {
    if (!form.start_date || !form.end_date) {
      return 'Please select booking dates.';
    }

    if (form.end_date < form.start_date) {
      return 'End date cannot be earlier than the start date.';
    }

    if (!form.guests || form.guests < 1 || form.guests > maxCapacity) {
      return `Guest or seat count must be between 1 and ${maxCapacity}.`;
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
      if (isEdit) {
        await api.updateBooking({
          id: booking.id,
          start_date: form.start_date,
          end_date: form.end_date,
          guests: form.guests,
          notes: form.notes.trim(),
        });
        onSaved('Booking updated.');
      } else {
        await api.createBooking({
          listing_id: item.id,
          start_date: form.start_date,
          end_date: form.end_date,
          guests: form.guests,
          notes: form.notes.trim(),
        });
        onSaved('Booking request submitted.');
      }

      onClose();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true">
      <div className="modal-card">
        <button type="button" className="modal-close-btn" aria-label="Close modal" onClick={onClose}>
          <span aria-hidden="true">x</span>
        </button>

        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Modify Booking' : `Book ${item.title}`}</h3>
          <p className="modal-subtitle">
            {item.category_name} - PHP {Number(item.price || 0).toLocaleString('en-PH')} {item.price_unit}
          </p>
        </div>

        {message && <div className="auth-alert">{message}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="bookingStart" className="form-label">Start Date</label>
            <input
              id="bookingStart"
              className="form-control"
              type="date"
              min={todayString()}
              value={form.start_date}
              onChange={(event) => updateField('start_date', event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bookingEnd" className="form-label">End Date</label>
            <input
              id="bookingEnd"
              className="form-control"
              type="date"
              min={form.start_date || todayString()}
              value={form.end_date}
              onChange={(event) => updateField('end_date', event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bookingGuests" className="form-label">Guests or Seats</label>
            <input
              id="bookingGuests"
              className="form-control"
              type="number"
              min="1"
              max={maxCapacity}
              value={form.guests}
              onChange={(event) => updateField('guests', event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bookingNotes" className="form-label">Special Notes</label>
            <textarea
              id="bookingNotes"
              className="form-control"
              rows="4"
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
            />
          </div>

          <button type="submit" className="btn-auth" disabled={busy}>
            {busy ? 'Saving' : isEdit ? 'Save Updates' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
