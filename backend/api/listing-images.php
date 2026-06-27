<?php
// listing-images.php - Handles image uploads for listings (admin only)

require_once __DIR__ . '/../app/init.php';

function requireAdminUser(): void {
    if (($_SESSION['role'] ?? '') !== 'admin') {
        errorResponse('Admin access is required.', 403);
    }
}

function getUploadedListingId(): int {
    $listingId = filter_var($_POST['listing_id'] ?? null, FILTER_VALIDATE_INT);

    if (!$listingId || $listingId < 1) {
        errorResponse('Listing id is required.');
    }

    return $listingId;
}

function ensureListingExists(PDO $pdo, int $listingId): void {
    $statement = $pdo->prepare('SELECT id FROM listings WHERE id = ?');
    $statement->execute([$listingId]);

    if (!$statement->fetch()) {
        errorResponse('Listing not found.', 404);
    }
}

function getUploadedImage(): array {
    if (!isset($_FILES['image']) || !is_array($_FILES['image'])) {
        errorResponse('Image file is required.');
    }

    $image = $_FILES['image'];

    if (($image['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        errorResponse('Image upload failed.');
    }

    if (($image['size'] ?? 0) > 5 * 1024 * 1024) {
        errorResponse('Image must be 5MB or smaller.');
    }

    $allowedTypes = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];
    $fileInfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $fileInfo->file($image['tmp_name']);

    if (!isset($allowedTypes[$mimeType])) {
        errorResponse('Only JPG, PNG, or WebP images are allowed.');
    }

    return [
        'tmp_name' => $image['tmp_name'],
        'extension' => $allowedTypes[$mimeType],
    ];
}

function saveUploadedImage(array $image): string {
    $uploadDirectory = UPLOADS_PATH . '/listings';

    if (!is_dir($uploadDirectory) && !@mkdir($uploadDirectory, 0775, true)) {
        errorResponse('Could not prepare image upload folder.', 500);
    }

    if (!is_writable($uploadDirectory)) {
        errorResponse('Image upload folder is not writable.', 500);
    }

    $fileName = bin2hex(random_bytes(12)) . '.' . $image['extension'];
    $targetPath = $uploadDirectory . '/' . $fileName;

    if (!@move_uploaded_file($image['tmp_name'], $targetPath)) {
        errorResponse('Could not save uploaded image.', 500);
    }

    return '/uploads/listings/' . $fileName;
}

try {
    requireAdminUser();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        errorResponse('Method not allowed.', 405);
    }

    $pdo = Database::connect();
    $listingId = getUploadedListingId();
    $image = getUploadedImage();
    $isPrimary = filter_var($_POST['is_primary'] ?? 1, FILTER_VALIDATE_INT) === 1 ? 1 : 0;

    ensureListingExists($pdo, $listingId);

    $imagePath = saveUploadedImage($image);

    $pdo->beginTransaction();

    if ($isPrimary === 1) {
        $statement = $pdo->prepare('UPDATE listing_images SET is_primary = 0 WHERE listing_id = ?');
        $statement->execute([$listingId]);
    }

    $statement = $pdo->prepare(
        'INSERT INTO listing_images (listing_id, image_path, is_primary) VALUES (?, ?, ?)'
    );
    $statement->execute([$listingId, $imagePath, $isPrimary]);

    $pdo->commit();

    jsonResponse([
        'success' => true,
        'message' => 'Listing image uploaded.',
        'image' => [
            'id' => (int) $pdo->lastInsertId(),
            'listing_id' => $listingId,
            'image_path' => $imagePath,
            'is_primary' => $isPrimary,
        ],
    ], 201);
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    errorResponse('Database error: ' . $e->getMessage(), 500);
}
