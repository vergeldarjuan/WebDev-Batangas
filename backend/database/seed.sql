INSERT INTO users (id, full_name, email, password_hash, phone, role) VALUES
    (1, 'Admin User', 'admin@example.com', '$2y$12$UwTZmWBpz8EAwJj5O1qTh.Pyy7Y/8z7PWZE9v0LKtZmXWLuirBJIC', '09123456789', 'admin'),
    (2, 'Sample User', 'user@example.com', '$2y$12$UwTZmWBpz8EAwJj5O1qTh.Pyy7Y/8z7PWZE9v0LKtZmXWLuirBJIC', '09987654321', 'user');

INSERT INTO categories (id, name, description) VALUES
    (1, 'Apartment', 'Places to stay for tourists visiting Batangas.'),
    (2, 'Car', 'Vehicles available for rent around Batangas.');

INSERT INTO listings (
    id,
    category_id,
    title,
    description,
    location,
    price,
    price_unit,
    capacity,
    is_available
) VALUES
    (
        1,
        1,
        'Taal Lake View Apartment',
        'A simple apartment near Taal Lake for small groups and families.',
        'Talisay, Batangas',
        2500.00,
        'per night',
        4,
        1
    ),
    (
        2,
        1,
        'Laiya Beach Apartment',
        'A beach-side apartment close to resorts and local food spots.',
        'San Juan, Batangas',
        3200.00,
        'per night',
        5,
        1
    ),
    (
        3,
        2,
        'Compact Sedan Rental',
        'A compact car for city trips and short travel around Batangas.',
        'Batangas City, Batangas',
        1800.00,
        'per day',
        5,
        1
    ),
    (
        4,
        2,
        'Family SUV Rental',
        'A larger vehicle for family trips and group travel.',
        'Lipa City, Batangas',
        2800.00,
        'per day',
        7,
        1
    );

INSERT INTO listing_images (listing_id, image_path, is_primary) VALUES
    (1, '/uploads/listings/Taal-Lake-View-1.jpg', 1),
    (1, '/uploads/listings/Taal-Lake-View-2.jpg', 0),
    (1, '/uploads/listings/Taal-Lake-View-3.jpg', 0),
    (2, '/uploads/listings/Laiya-Beach-Apartment-1.jpg', 1),
    (2, '/uploads/listings/Laiya-Beach-Apartment-2.jpg', 0),
    (2, '/uploads/listings/Laiya-Beach-Apartment-3.jpg', 0),
    (2, '/uploads/listings/Laiya-Beach-Apartment-4.jpg', 0),
    (3, '/uploads/listings/Compact-Sedan-rental-1.jpg', 1),
    (3, '/uploads/listings/Compact-Sedan-rental-2.jpg', 0),
    (4, '/uploads/listings/Family-SUV-Renta-1.jpg', 1),
    (4, '/uploads/listings/Family-SUV-Renta-2.jpg', 0);

INSERT INTO bookings (
    user_id,
    listing_id,
    start_date,
    end_date,
    guests,
    status,
    notes
) VALUES
    (
        2,
        1,
        '2026-07-10',
        '2026-07-12',
        3,
        'pending',
        'Sample booking request for testing.'
    );
