# CRUD Usage

This file shows where Create, Read, Update, and Delete are used in the project.

## User Accounts

Page:

- User page
- Admin page

API files:

- `backend/api/auth.php`
- `backend/api/users.php`

CRUD use:

| Action | Where it happens | Description |
| --- | --- | --- |
| Create | Register form | A new user account is created during registration. |
| Read | User page, admin user list | The current user can view their own account. Admin can view registered users and user booking history. |
| Update | User page, admin user edit | Users can update their own name and phone number. Admin can update user name, phone, and role. |
| Delete | Not used | User deletion is not added yet because bookings are connected to user accounts. |

## Rental Listings

Page:

- Listings page
- Admin page

API file:

- `backend/api/listings.php`

CRUD use:

| Action | Where it happens | Description |
| --- | --- | --- |
| Create | Admin listing form | Admin can create a new rental listing. |
| Read | Listings page, admin listing list | Users can view available listings. Admin can view all listings. |
| Update | Admin listing form | Admin can edit listing details such as title, category, location, price, capacity, description, and availability. |
| Delete | Admin listing action | Admin can disable a listing. This is a soft delete using `is_available = 0`. |

## Listing Images

Page:

- Listings page
- Admin page

API files:

- `backend/api/listings.php`
- `backend/api/listing-images.php`

CRUD use:

| Action | Where it happens | Description |
| --- | --- | --- |
| Create | Admin listing form | Admin can upload an image for a listing. |
| Read | Listings page, admin listing list | Listing images are loaded with the listing data and shown in the listing cards. |
| Update | Admin listing image upload | Uploading a new primary image updates which image is used as the main listing image. |
| Delete | Not used | Image deletion is not added yet. |

## Bookings

Page:

- Listings page
- User page
- Admin page

API file:

- `backend/api/bookings.php`

CRUD use:

| Action | Where it happens | Description |
| --- | --- | --- |
| Create | Booking modal | A logged-in user can create a booking request for one listing. |
| Read | User page, admin booking list | Users can view their own bookings. Admin can view all booking records. |
| Update | User page, admin booking status | Users can modify booking dates, guests, and notes. Admin can update booking status. |
| Delete | User cancel booking | Booking cancellation is a soft delete using `status = cancelled`. |

## Notes

- Some delete actions are soft deletes. This keeps old records for history and admin review.
- Admin-only CRUD actions require an admin session.
- User-only booking actions require a logged-in user session.
