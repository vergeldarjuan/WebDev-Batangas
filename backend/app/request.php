<?php
// request.php - helpers for parsing request payloads (JSON, form, urlencoded)

function getRequestData(): array {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (str_contains($contentType, 'application/json')) {
        $data = json_decode(file_get_contents('php://input'), true);
        return is_array($data) ? $data : [];
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        return $_POST;
    }

    $data = [];
    parse_str(file_get_contents('php://input'), $data);

    return $data;
}
