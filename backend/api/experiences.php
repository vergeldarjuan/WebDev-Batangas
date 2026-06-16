<?php

require_once __DIR__ . '/../app/init.php';

try {
    $pdo = Database::connect();
    $sql = <<<SQL
        SELECT * FROM experiences
        ORDER BY created_at DESC
    SQL;
    $statement = $pdo->query($sql);
    $experiences = $statement->fetchAll();

    jsonResponse([
        'success' => true,
        'experiences' => $experiences,
    ]);
} catch (PDOException $exception) {
    errorResponse('Database error: ' . $exception->getMessage(), 500);
}