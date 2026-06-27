<?php
// response.php - helpers for standardized JSON responses and errors

function jsonResponse(array $data, int $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

function errorResponse(string $message, int $status = 400) {
    jsonResponse([
        'success' => false,
        'message' => $message,
    ], $status);
}