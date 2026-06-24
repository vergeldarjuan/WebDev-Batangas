<?php

require_once __DIR__ . '/../app/init.php';

function requireAdmin(): array {
    if (($_SESSION['role'] ?? '') !== 'admin' || !isset($_SESSION['user_id'])) {
        errorResponse('Admin access is required.', 403);
    }

    return [
        'id' => (int) $_SESSION['user_id'],
        'role' => $_SESSION['role'],
    ];
}

function getUserId(array $data = []): int {
    $id = filter_var($data['id'] ?? ($_GET['id'] ?? null), FILTER_VALIDATE_INT);

    if (!$id || $id < 1) {
        errorResponse('User id is required.');
    }

    return $id;
}

function publicAdminUser(array $user): array {
    return [
        'id' => (int) $user['id'],
        'full_name' => $user['full_name'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'role' => $user['role'],
        'created_at' => $user['created_at'],
        'updated_at' => $user['updated_at'],
        'total_bookings' => isset($user['total_bookings']) ? (int) $user['total_bookings'] : 0,
        'active_bookings' => isset($user['active_bookings']) ? (int) $user['active_bookings'] : 0,
        'latest_booking_at' => $user['latest_booking_at'] ?? null,
    ];
}

function findUser(PDO $pdo, int $id): ?array {
    $statement = $pdo->prepare(
        <<<SQL
            SELECT
                users.id,
                users.full_name,
                users.email,
                users.phone,
                users.role,
                users.created_at,
                users.updated_at,
                COUNT(bookings.id) AS total_bookings,
                SUM(CASE WHEN bookings.status IN ('pending', 'confirmed') THEN 1 ELSE 0 END) AS active_bookings,
                MAX(bookings.created_at) AS latest_booking_at
            FROM users
            LEFT JOIN bookings
                ON bookings.user_id = users.id
            WHERE users.id = ?
            GROUP BY
                users.id,
                users.full_name,
                users.email,
                users.phone,
                users.role,
                users.created_at,
                users.updated_at
        SQL
    );
    $statement->execute([$id]);
    $user = $statement->fetch();

    return $user ?: null;
}

try {
    $pdo = Database::connect();
    $method = $_SERVER['REQUEST_METHOD'];
    $admin = requireAdmin();

    if ($method === 'GET') {
        if (isset($_GET['id']) && $_GET['id'] !== '') {
            $userId = getUserId();
            $user = findUser($pdo, $userId);

            if (!$user) {
                errorResponse('User not found.', 404);
            }

            $statement = $pdo->prepare(
                <<<SQL
                    SELECT
                        bookings.id,
                        bookings.listing_id,
                        listings.title AS listing_title,
                        listings.location AS listing_location,
                        categories.name AS category_name,
                        bookings.start_date,
                        bookings.end_date,
                        bookings.guests,
                        bookings.status,
                        bookings.notes,
                        bookings.created_at,
                        bookings.updated_at
                    FROM bookings
                    INNER JOIN listings
                        ON listings.id = bookings.listing_id
                    INNER JOIN categories
                        ON categories.id = listings.category_id
                    WHERE bookings.user_id = ?
                    ORDER BY bookings.created_at DESC
                SQL
            );
            $statement->execute([$userId]);

            jsonResponse([
                'success' => true,
                'user' => publicAdminUser($user),
                'bookings' => $statement->fetchAll(),
            ]);
        }

        $statement = $pdo->query(
            <<<SQL
                SELECT
                    users.id,
                    users.full_name,
                    users.email,
                    users.phone,
                    users.role,
                    users.created_at,
                    users.updated_at,
                    COUNT(bookings.id) AS total_bookings,
                    SUM(CASE WHEN bookings.status IN ('pending', 'confirmed') THEN 1 ELSE 0 END) AS active_bookings,
                    MAX(bookings.created_at) AS latest_booking_at
                FROM users
                LEFT JOIN bookings
                    ON bookings.user_id = users.id
                GROUP BY
                    users.id,
                    users.full_name,
                    users.email,
                    users.phone,
                    users.role,
                    users.created_at,
                    users.updated_at
                ORDER BY users.created_at DESC
            SQL
        );

        jsonResponse([
            'success' => true,
            'users' => array_map('publicAdminUser', $statement->fetchAll()),
        ]);
    }

    if ($method === 'PUT') {
        $data = getRequestData();
        $userId = getUserId($data);
        $fullName = trim($data['full_name'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $role = trim($data['role'] ?? '');

        if ($fullName === '' || strlen($fullName) > 100 || !preg_match('/^09[0-9]{9}$/', $phone) || !in_array($role, ['user', 'admin'], true)) {
            errorResponse('Please provide valid user details.');
        }

        $user = findUser($pdo, $userId);

        if (!$user) {
            errorResponse('User not found.', 404);
        }

        if ($userId === $admin['id'] && $role !== 'admin') {
            errorResponse('You cannot remove your own admin role.', 403);
        }

        $statement = $pdo->prepare(
            'UPDATE users SET full_name = ?, phone = ?, role = ? WHERE id = ?'
        );
        $statement->execute([$fullName, $phone, $role, $userId]);

        jsonResponse([
            'success' => true,
            'message' => 'User updated.',
            'user' => publicAdminUser(findUser($pdo, $userId)),
        ]);
    }

    errorResponse('Method not allowed.', 405);
} catch (PDOException $e) {
    errorResponse('Database error: ' . $e->getMessage(), 500);
}
