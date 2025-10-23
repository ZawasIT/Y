<?php
// Konfiguracja bazy danych
define('DB_HOST', 'localhost');
define('DB_NAME', 'platforma_y');
define('DB_USER', 'root');
define('DB_PASS', '');

// Połączenie z bazą danych
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";port=3307;dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    die("Błąd połączenia z bazą danych: " . $e->getMessage());
}

// Rozpocznij sesję jeśli jeszcze nie została rozpoczęta
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
