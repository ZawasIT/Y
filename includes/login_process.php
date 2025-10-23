<?php
require_once 'config.php';
require_once 'functions.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowa metoda']);
    exit;
}

$username = clean($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

// Walidacja
if (empty($username) || empty($password)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Proszę wypełnić wszystkie pola'
    ]);
    exit;
}

try {
    // Szukaj użytkownika po email lub username
    $stmt = $pdo->prepare("
        SELECT id, username, password_hash, full_name, profile_image, verified 
        FROM users 
        WHERE email = ? OR username = ?
    ");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();
    
    if ($user && verifyPassword($password, $user['password_hash'])) {
        // Poprawne logowanie
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['full_name'] = $user['full_name'];
        $_SESSION['profile_image'] = $user['profile_image'];
        $_SESSION['verified'] = $user['verified'];
        $_SESSION['logged_in'] = true;
        
        echo json_encode([
            'success' => true,
            'message' => 'Logowanie pomyślne',
            'redirect' => 'index.php'
        ]);
        exit;
    } else {
        // Nieprawidłowe dane
        echo json_encode([
            'success' => false, 
            'message' => 'Nieprawidłowa nazwa użytkownika lub hasło'
        ]);
        exit;
    }
} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Wystąpił błąd serwera. Spróbuj ponownie.'
    ]);
    exit;
}
?>
