<?php
require_once 'config.php';
require_once 'functions.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowa metoda']);
    exit;
}

// Pobiera dane
$fullName = clean($_POST['full_name'] ?? '');
$email = clean($_POST['email'] ?? '');
$username = clean($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';
$birthDay = $_POST['birth_day'] ?? '';
$birthMonth = $_POST['birth_month'] ?? '';
$birthYear = $_POST['birth_year'] ?? '';

// Walidacja podstawowa
if (empty($fullName) || empty($email) || empty($username) || empty($password)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Wszystkie pola są wymagane'
    ]);
    exit;
}

// Walidacja email
if (!isValidEmail($email)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Nieprawidłowy adres email',
        'field' => 'email'
    ]);
    exit;
}

// Walidacja username
if (!isValidUsername($username)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Nazwa użytkownika musi mieć 3-20 znaków (litery, cyfry, _)',
        'field' => 'username'
    ]);
    exit;
}

// Walidacja hasła
if (!isValidPassword($password)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Hasło musi mieć minimum 8 znaków',
        'field' => 'password'
    ]);
    exit;
}

// Sprawdza czy email już istnieje
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ten adres email jest już zajęty',
        'field' => 'email'
    ]);
    exit;
}

// Sprawdza czy username już istnieje
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    echo json_encode([
        'success' => false, 
        'message' => 'Ta nazwa użytkownika jest już zajęta',
        'field' => 'username'
    ]);
    exit;
}

// Tworzy użytkownika
try {
    $passwordHash = hashPassword($password);
    
    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password_hash, full_name) 
        VALUES (?, ?, ?, ?)
    ");
    
    $stmt->execute([$username, $email, $passwordHash, $fullName]);
    
    $userId = $pdo->lastInsertId();
    
    // Loguje użytkownika automatycznie
    $_SESSION['user_id'] = $userId;
    $_SESSION['username'] = $username;
    $_SESSION['full_name'] = $fullName;
    $_SESSION['profile_image'] = 'images/default-avatar.png';
    $_SESSION['verified'] = false;
    $_SESSION['logged_in'] = true;
    
    echo json_encode([
        'success' => true,
        'message' => 'Konto utworzone pomyślnie',
        'redirect' => 'index.php'
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Błąd podczas tworzenia konta. Spróbuj ponownie.'
    ]);
}
?>
