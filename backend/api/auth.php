<?php
// auth.php - Authentication endpoints (register, login, logout, profile)

require_once __DIR__ . '/../app/init.php';

function publicUser(array $user): array {
    return [
        'id' => (int) $user['id'],
        'full_name' => $user['full_name'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'role' => $user['role'],
    ];
}

function findUserById(PDO $pdo, int $id): ?array {
    $statement = $pdo->prepare(
        'SELECT id, full_name, email, phone, role FROM users WHERE id = ?'
    );
    $statement->execute([$id]);
    $user = $statement->fetch();

    return $user ?: null;
}

try {
    $pdo = Database::connect();
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    if ($method === 'GET') {
        $userId = $_SESSION['user_id'] ?? null;
        $user = $userId ? findUserById($pdo, (int) $userId) : null;

        jsonResponse([
            'success' => true,
            'user' => $user ? publicUser($user) : null,
        ]);
    }

    if ($method === 'PUT') {
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            errorResponse('You must be logged in.', 401);
        }

        $data = getRequestData();
        $fullName = trim($data['full_name'] ?? '');
        $phone = trim($data['phone'] ?? '');

        if ($fullName === '' || strlen($fullName) > 100 || !preg_match('/^09[0-9]{9}$/', $phone)) {
            errorResponse('Please provide valid profile details.');
        }

        $statement = $pdo->prepare('UPDATE users SET full_name = ?, phone = ? WHERE id = ?');
        $statement->execute([$fullName, $phone, (int) $userId]);

        $user = findUserById($pdo, (int) $userId);

        jsonResponse([
            'success' => true,
            'message' => 'Profile updated.',
            'user' => publicUser($user),
        ]);
    }

    if ($method !== 'POST') {
        errorResponse('Method not allowed.', 405);
    }

    $data = getRequestData();

    if ($action === 'register') {
        $fullName = trim($data['full_name'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $phone = trim($data['phone'] ?? '');

        if ($fullName === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8 || !preg_match('/^09[0-9]{9}$/', $phone)) {
            errorResponse('Please provide valid registration details.');
        }

        $statement = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $statement->execute([$email]);

        if ($statement->fetch()) {
            errorResponse('Email is already registered.', 409);
        }

        $statement = $pdo->prepare(
            'INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)'
        );
        $statement->execute([
            $fullName,
            $email,
            password_hash($password, PASSWORD_DEFAULT),
            $phone,
            'user',
        ]);

        $userId = (int) $pdo->lastInsertId();
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        $_SESSION['role'] = 'user';

        $user = findUserById($pdo, $userId);

        jsonResponse([
            'success' => true,
            'message' => 'Registration successful.',
            'user' => publicUser($user),
        ], 201);
    }

    if ($action === 'login') {
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        $statement = $pdo->prepare(
            'SELECT id, full_name, email, phone, role, password_hash FROM users WHERE email = ?'
        );
        $statement->execute([$email]);
        $user = $statement->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            errorResponse('Invalid email or password.', 401);
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) $user['id'];
        $_SESSION['role'] = $user['role'];

        jsonResponse([
            'success' => true,
            'message' => 'Login successful.',
            'user' => publicUser($user),
        ]);
    }

    if ($action === 'logout') {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }

        session_destroy();

        jsonResponse([
            'success' => true,
            'message' => 'Logout successful.',
        ]);
    }

    errorResponse('Invalid auth action.', 404);
} catch (PDOException $e) {
    errorResponse('Database error: ' . $e->getMessage(), 500);
}
