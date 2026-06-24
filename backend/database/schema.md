# Database Notes

The website will have three main parts:

- A main page that introduces and showcases Batangas
- A listings page for rentals and bookable services
- A user page where users can view/edit their info and manage bookings
- An admin page where admins can manage users, listings, and listing images

## Main Tables

### users

Stores the accounts of people using the website.

Fields:

- `id`
- `full_name`
- `email`
- `password_hash`
- `phone`
- `role`
- `created_at`
- `updated_at`

Notes:

- `email` should be unique because it will be used for login.
- `password_hash` stores the hashed password, not the plain password.
- `phone` can use the local 11-digit format, like `09XXXXXXXXX`.
- `role` can be `user` or `admin`.

For passwords, we should only save the hashed version in the database. In PHP, use `password_hash()` when creating the account and `password_verify()` when logging in.

### categories

Stores the type of listing.

Fields:

- `id`
- `name`
- `description`
- `created_at`

Current categories:

- Apartment
- Car

### listings

Stores the places, vehicles, or services that users can book. These can be prepared through seed data first, then managed by admins later.

Fields:

- `id`
- `category_id`
- `title`
- `description`
- `location`
- `price`
- `price_unit`
- `capacity`
- `is_available`
- `created_at`
- `updated_at`

Notes:

- `category_id` connects the listing to the `categories` table.
- `price` should be a decimal value.
- `price_unit` explains what the price means.
- `capacity` should be an integer.
- `is_available` can be `1` for available and `0` for unavailable.

Possible `price_unit` values:

- `per night`
- `per day`
- `per trip`
- `per hour`

### listing_images

Stores images for each listing. A listing can have more than one image.

Fields:

- `id`
- `listing_id`
- `image_path`
- `is_primary`
- `created_at`

Notes:

- `listing_id` connects the image to the `listings` table.
- `image_path` stores the image location, like `/images/listings/sample.jpg` for seeded images or `uploads/listings/sample.jpg` for future admin uploads.
- `is_primary` can be `1` for the main image and `0` for extra images.

### bookings

Stores the bookings made by users. To keep it simple, one booking is only for one listing.

Fields:

- `id`
- `user_id`
- `listing_id`
- `start_date`
- `end_date`
- `guests`
- `status`
- `notes`
- `created_at`
- `updated_at`

Notes:

- `user_id` connects the booking to the `users` table.
- `listing_id` connects the booking to the `listings` table.
- `start_date` and `end_date` should use date values, like `2026-06-24`.
- `guests` should be an integer.
- `notes` is optional.

Possible `status` values:

- `pending`
- `confirmed`
- `cancelled`
- `rejected`

When a user makes a booking, it will be saved as `pending` first. An admin can change it to `confirmed` or `rejected`. If the booking is cancelled, the status can be changed to `cancelled`.

## Table Connections

- `categories` connects to `listings`
- `listings` connects to `listing_images`
- `users` connects to `bookings`
- `listings` also connects to `bookings`

## Features Covered

- Users can register, view their profile, and update their profile.
- Users can view available listings.
- Users can create, view, update, and delete bookings.
- Admins can view and manage user records.
- Admins can create, view, update, and delete listings.
- Admins can update listing images.
