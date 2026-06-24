<?php

define('BACKEND_PATH', dirname(__DIR__));
define('UPLOADS_PATH', BACKEND_PATH . '/uploads');

require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/response.php';

header('Content-Type: application/json');
