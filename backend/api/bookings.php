<?php
// bookings.php - Booking management API (create, view, update, cancel)

require_once __DIR__ . '/../app/init.php';

function currentUser(): array {
    if (!isset($_SESSION['user_id'])) {
        errorResponse('You must be logged in.', 401);
    }

    return [
        'id' => (int) $_SESSION['user_id'],
        'role' => $_SESSION['role'] ?? 'user',
        'is_admin' => ($_SESSION['role'] ?? '') === 'admin',
    ];
}

function isValidDateValue(string $date): bool {
    $parsed = DateTime::createFromFormat('Y-m-d', $date);

    return $parsed && $parsed->format('Y-m-d') === $date;
}

function getBookingId(array $data): int {
    $id = filter_var($data['id'] ?? ($_GET['id'] ?? null), FILTER_VALIDATE_INT);

    if (!$id || $id < 1) {
        errorResponse('Booking id is required.');
    }

    return $id;
}

function findBooking(PDO $pdo, int $id): ?array {
    $statement = $pdo->prepare('SELECT * FROM bookings WHERE id = ?');
    $statement->execute([$id]);
    $booking = $statement->fetch();

    return $booking ?: null;
}

function canAccessBooking(array $booking, array $user): bool {
    return $user['is_admin'] || (int) $booking['user_id'] === $user['id'];
}

try {
    $pdo = Database::connect();
    $method = $_SERVER['REQUEST_METHOD'];
    $user = currentUser();

    if ($method === 'GET') {
        $where = [];
        $params = [];

        if (!$user['is_admin']) {
            $where[] = 'bookings.user_id = ?';
            $params[] = $user['id'];
        }

        if (isset($_GET['status']) && $_GET['status'] !== '') {
            $allowedStatuses = ['pending', 'confirmed', 'cancelled', 'rejected'];

            if (!in_array($_GET['status'], $allowedStatuses, true)) {
                errorResponse('Invalid booking status.');
            }

            $where[] = 'bookings.status = ?';
            $params[] = $_GET['status'];
        }

        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $sql = <<<SQL
            SELECT
                bookings.id,
                bookings.user_id,
                users.full_name AS user_name,
                users.email AS user_email,
                bookings.listing_id,
                listings.title AS listing_title,
                listings.location AS listing_location,
                listings.price AS listing_price,
                listings.price_unit AS listing_price_unit,
                listings.capacity AS listing_capacity,
                categories.name AS category_name,
                bookings.start_date,
                bookings.end_date,
                bookings.guests,
                bookings.status,
                bookings.notes,
                bookings.created_at,
                bookings.updated_at
            FROM bookings
            INNER JOIN users
                ON users.id = bookings.user_id
            INNER JOIN listings
                ON listings.id = bookings.listing_id
            INNER JOIN categories
                ON categories.id = listings.category_id
            {$whereSql}
            ORDER BY bookings.created_at DESC
        SQL;

        $statement = $pdo->prepare($sql);
        $statement->execute($params);

        jsonResponse([
            'success' => true,
            'bookings' => $statement->fetchAll(),
        ]);
    }

    $data = getRequestData();

    if ($method === 'POST') {
        $listingId = filter_var($data['listing_id'] ?? null, FILTER_VALIDATE_INT);
        $startDate = trim($data['start_date'] ?? '');
        $endDate = trim($data['end_date'] ?? '');
        $guests = filter_var($data['guests'] ?? null, FILTER_VALIDATE_INT);
        $notes = trim($data['notes'] ?? '');

        if (!$listingId || $listingId < 1 || !isValidDateValue($startDate) || !isValidDateValue($endDate) || $endDate < $startDate || !$guests || $guests < 1) {
            errorResponse('Please provide valid booking details.');
        }

        $statement = $pdo->prepare('SELECT id FROM listings WHERE id = ? AND is_available = 1');
        $statement->execute([$listingId]);

        if (!$statement->fetch()) {
            errorResponse('Listing is not available.', 404);
        }

        $statement = $pdo->prepare(
            'INSERT INTO bookings (user_id, listing_id, start_date, end_date, guests, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $statement->execute([
            $user['id'],
            $listingId,
            $startDate,
            $endDate,
            $guests,
            'pending',
            $notes ?: null,
        ]);

        jsonResponse([
            'success' => true,
            'message' => 'Booking request created.',
            'booking_id' => (int) $pdo->lastInsertId(),
        ], 201);
    }

    if ($method === 'PUT') {
        $bookingId = getBookingId($data);
        $booking = findBooking($pdo, $bookingId);

        if (!$booking || !canAccessBooking($booking, $user)) {
            errorResponse('Booking not found.', 404);
        }

        if (!$user['is_admin'] && array_key_exists('status', $data)) {
            errorResponse('Only admins can update booking status.', 403);
        }

        $allowedStatuses = ['pending', 'confirmed', 'cancelled', 'rejected'];
        $status = $booking['status'];

        if ($user['is_admin'] && isset($data['status'])) {
            if (!in_array($data['status'], $allowedStatuses, true)) {
                errorResponse('Invalid booking status.');
            }

            $status = $data['status'];
        }

        $startDate = trim($data['start_date'] ?? $booking['start_date']);
        $endDate = trim($data['end_date'] ?? $booking['end_date']);
        $guests = filter_var($data['guests'] ?? $booking['guests'], FILTER_VALIDATE_INT);
        $notes = array_key_exists('notes', $data) ? trim((string) $data['notes']) : $booking['notes'];

        if (!isValidDateValue($startDate) || !isValidDateValue($endDate) || $endDate < $startDate || !$guests || $guests < 1) {
            errorResponse('Please provide valid booking details.');
        }

        $statement = $pdo->prepare(
            'UPDATE bookings SET start_date = ?, end_date = ?, guests = ?, status = ?, notes = ? WHERE id = ?'
        );
        $statement->execute([
            $startDate,
            $endDate,
            $guests,
            $status,
            $notes ?: null,
            $bookingId,
        ]);

        jsonResponse([
            'success' => true,
            'message' => 'Booking updated.',
        ]);
    }

    if ($method === 'DELETE') {
        $bookingId = getBookingId($data);
        $booking = findBooking($pdo, $bookingId);

        if (!$booking || !canAccessBooking($booking, $user)) {
            errorResponse('Booking not found.', 404);
        }

        $statement = $pdo->prepare('UPDATE bookings SET status = ? WHERE id = ?');
        $statement->execute(['cancelled', $bookingId]);

        jsonResponse([
            'success' => true,
            'message' => 'Booking cancelled.',
        ]);
    }

    errorResponse('Method not allowed.', 405);
} catch (PDOException $e) {
    errorResponse('Database error: ' . $e->getMessage(), 500);
}
