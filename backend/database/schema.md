# Database Notes

The website will have three main parts:

- A main page that introduces and showcases Batangas
- A listings page for rentals and bookable services
- A user page where users can view/edit their info and manage bookings

## Main Tables

### users

Stores the accounts of people using the website.

Fields:

- `id`
- `full_name`
- `email`
- `password_hash`
- `phone`
- `created_at`
- `updated_at`

Notes:

- `email` should be unique because it will be used for login.
- `password_hash` stores the hashed password, not the plain password.
- `phone` can use the local 11-digit format, like `09XXXXXXXXX`.

For passwords, we should only save the hashed version in the database. In PHP, use `password_hash()` when creating the account and `password_verify()` when logging in.

### categories

Stores the type of listing.

Fields:

- `id`
- `name`
- `description`
- `created_at`

Possible categories:

- Apartment
- Car
- Van
- Boat
- Tour Guide
- Cottage

### listings

Stores the places, vehicles, or services that users can book. For now, these will come from seed data and will not be created by users.

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
- `image_path` stores the image location, like `uploads/listings/sample.jpg`.
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

- `confirmed`
- `cancelled`

When a user makes a booking, it will be saved as `confirmed` right away. If the user removes or cancels the booking, the status can be changed to `cancelled`.

## Table Connections

- `categories` connects to `listings`
- `listings` connects to `listing_images`
- `users` connects to `bookings`
- `listings` also connects to `bookings`

## Features Covered

- Users can register, view their profile, and update their profile.
- Users can view available listings.
- Users can create, view, update, and delete bookings.
- Listings and listing images will be prepared through seed data.
