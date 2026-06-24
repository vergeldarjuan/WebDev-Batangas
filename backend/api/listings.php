<?php

require_once __DIR__ . '/../app/init.php';

function isAdminUser(): bool {
    return ($_SESSION['role'] ?? '') === 'admin';
}

function requireAdminUser(): void {
    if (!isAdminUser()) {
        errorResponse('Admin access is required.', 403);
    }
}

function getListingId(array $data): int {
    $id = filter_var($data['id'] ?? ($_GET['id'] ?? null), FILTER_VALIDATE_INT);

    if (!$id || $id < 1) {
        errorResponse('Listing id is required.');
    }

    return $id;
}

function getListingInput(array $data, bool $isUpdate = false): array {
    $priceUnits = ['per night', 'per day', 'per trip', 'per hour'];

    $categoryId = filter_var($data['category_id'] ?? null, FILTER_VALIDATE_INT);
    $title = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');
    $location = trim($data['location'] ?? '');
    $price = filter_var($data['price'] ?? null, FILTER_VALIDATE_FLOAT);
    $priceUnit = trim($data['price_unit'] ?? '');
    $capacity = filter_var($data['capacity'] ?? null, FILTER_VALIDATE_INT);
    $isAvailable = array_key_exists('is_available', $data)
        ? filter_var($data['is_available'], FILTER_VALIDATE_INT)
        : 1;

    if ($isUpdate && !filter_var($data['id'] ?? null, FILTER_VALIDATE_INT)) {
        errorResponse('Listing id is required.');
    }

    if (!$categoryId || $categoryId < 1 || $title === '' || $description === '' || $location === '' || $price === false || $price < 0 || !in_array($priceUnit, $priceUnits, true) || !$capacity || $capacity < 1 || !in_array($isAvailable, [0, 1], true)) {
        errorResponse('Please provide valid listing details.');
    }

    return [
        'category_id' => $categoryId,
        'title' => $title,
        'description' => $description,
        'location' => $location,
        'price' => $price,
        'price_unit' => $priceUnit,
        'capacity' => $capacity,
        'is_available' => $isAvailable,
    ];
}

function ensureCategoryExists(PDO $pdo, int $categoryId): void {
    $statement = $pdo->prepare('SELECT id FROM categories WHERE id = ?');
    $statement->execute([$categoryId]);

    if (!$statement->fetch()) {
        errorResponse('Category not found.', 404);
    }
}

function ensureListingExists(PDO $pdo, int $listingId): void {
    $statement = $pdo->prepare('SELECT id FROM listings WHERE id = ?');
    $statement->execute([$listingId]);

    if (!$statement->fetch()) {
        errorResponse('Listing not found.', 404);
    }
}

try {
    $pdo = Database::connect();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $where = [];
        $params = [];

        if (!isAdminUser()) {
            $where[] = 'listings.is_available = 1';
        }

        if (isset($_GET['category']) && $_GET['category'] !== '') {
            $where[] = 'LOWER(categories.name) = LOWER(?)';
            $params[] = $_GET['category'];
        }

        if (isset($_GET['id']) && $_GET['id'] !== '') {
            $where[] = 'listings.id = ?';
            $params[] = getListingId([]);
        }

        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $sql = <<<SQL
            SELECT
                listings.id,
                listings.category_id,
                listings.title,
                listings.description,
                listings.location,
                listings.price,
                listings.price_unit,
                listings.capacity,
                listings.is_available,
                listings.created_at,
                listings.updated_at,
                categories.name AS category_name
            FROM listings
            INNER JOIN categories
                ON categories.id = listings.category_id
            {$whereSql}
            ORDER BY listings.created_at DESC
        SQL;

        $statement = $pdo->prepare($sql);
        $statement->execute($params);

        jsonResponse([
            'success' => true,
            'listings' => $statement->fetchAll(),
        ]);
    }

    requireAdminUser();
    $data = getRequestData();

    if ($method === 'POST') {
        $listing = getListingInput($data);
        ensureCategoryExists($pdo, $listing['category_id']);

        $statement = $pdo->prepare(
            'INSERT INTO listings (category_id, title, description, location, price, price_unit, capacity, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $statement->execute([
            $listing['category_id'],
            $listing['title'],
            $listing['description'],
            $listing['location'],
            $listing['price'],
            $listing['price_unit'],
            $listing['capacity'],
            $listing['is_available'],
        ]);

        jsonResponse([
            'success' => true,
            'message' => 'Listing created.',
            'listing_id' => (int) $pdo->lastInsertId(),
        ], 201);
    }

    if ($method === 'PUT') {
        $listingId = getListingId($data);
        $listing = getListingInput($data, true);

        ensureListingExists($pdo, $listingId);
        ensureCategoryExists($pdo, $listing['category_id']);

        $statement = $pdo->prepare(
            'UPDATE listings SET category_id = ?, title = ?, description = ?, location = ?, price = ?, price_unit = ?, capacity = ?, is_available = ? WHERE id = ?'
        );
        $statement->execute([
            $listing['category_id'],
            $listing['title'],
            $listing['description'],
            $listing['location'],
            $listing['price'],
            $listing['price_unit'],
            $listing['capacity'],
            $listing['is_available'],
            $listingId,
        ]);

        jsonResponse([
            'success' => true,
            'message' => 'Listing updated.',
        ]);
    }

    if ($method === 'DELETE') {
        $listingId = getListingId($data);
        ensureListingExists($pdo, $listingId);

        $statement = $pdo->prepare('UPDATE listings SET is_available = 0 WHERE id = ?');
        $statement->execute([$listingId]);

        jsonResponse([
            'success' => true,
            'message' => 'Listing disabled.',
        ]);
    }

    errorResponse('Method not allowed.', 405);
} catch (PDOException $e) {
    errorResponse('Database error: ' . $e->getMessage(), 500);
}
