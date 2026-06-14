<?php
$databaseFile = dirname(__DIR__) . '/database/database.db';

try {
    $pdo = new PDO("sqlite:" . $databaseFile);

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connected to SQLite";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
