<?php

require_once __DIR__ . '/../app/init.php';

try {
    $pdo = Database::connect();
    if ($_SERVER['REQUEST_METHOD'] == 'GET') {
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
    }

    // TODO: IMAGE UPLOAD
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $targetType = trim($_POST['target_type'] ?? '');
        $targetKey = trim($_POST['target_key'] ?? '');
        $visitorName = trim($_POST['visitor_name'] ?? '');
        $rating = filter_var($_POST['rating'] ?? null, FILTER_VALIDATE_INT);
        $experienceText = trim($_POST['experience_text'] ?? '');

        // TODO: validate inputs
        $sql = <<<SQL
        INSERT INTO experiences (
            target_type,
            target_key,
            visitor_name,
            rating,
            experience_text,
            image_path
        ) VALUES (
            :target_type,
            :target_key,
            :visitor_name,
            :rating,
            :experience_text,
            NULL
        )
        SQL;

        $statement = $pdo->prepare($sql);
        $statement->execute([
            'target_type' => $targetType,
            'target_key' => $targetKey,
            'visitor_name' => $visitorName,
            'rating' => $rating,
            'experience_text' => $experienceText,
        ]);

        $experienceId = (int) $pdo->lastInsertId();

        jsonResponse([
            'success' => true,
            'message' => 'Experience submitted successfully',
            'experience_id' => $experienceId,
        ], 201);
    }
} catch (PDOException $exception) {
    errorResponse('Database error: ' . $exception->getMessage(), 500);
}