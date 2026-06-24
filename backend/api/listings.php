<?php

require_once __DIR__ . '/../app/init.php';

try {
    $pdo = Database::connect();

    $sql = <<<SQL
        SELECT
            listings.id,
            listings.title,
            listings.description,
            listings.location,
            listings.price,
            listings.price_unit,
            listings.capacity,
            listings.is_available,
            listings.created_at,
            listings.updated_at,
            categories.name as category_name
        FROM listings
        INNER JOIN categories
            ON categories.id = listings.category_id
        ORDER BY listings.created_at DESC
    SQL;

    $statement = $pdo->query($sql);
    $listings = $statement->fetchAll();

    jsonResponse([
        'success' => true,
        'listings' => $listings,
    ]);

} catch (PDOException $e) {
    errorResponse('Database error: ' . $e->getMessage());
}