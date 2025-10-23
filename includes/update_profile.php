<?php
require_once 'config.php';
require_once 'functions.php';

header('Content-Type: application/json');

// Sprawdź czy użytkownik jest zalogowany
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Musisz być zalogowany']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowa metoda']);
    exit;
}

$userId = $_SESSION['user_id'];

// Pobierz dane z formularza
$fullName = isset($_POST['full_name']) ? trim($_POST['full_name']) : '';
$bio = isset($_POST['bio']) ? trim($_POST['bio']) : '';
$location = isset($_POST['location']) ? trim($_POST['location']) : '';
$website = isset($_POST['website']) ? trim($_POST['website']) : '';

// Walidacja
$errors = [];

if (empty($fullName)) {
    $errors[] = 'Imię i nazwisko jest wymagane';
} elseif (mb_strlen($fullName) > 50) {
    $errors[] = 'Imię i nazwisko może mieć maksymalnie 50 znaków';
}

if (mb_strlen($bio) > 160) {
    $errors[] = 'Bio może mieć maksymalnie 160 znaków';
}

if (mb_strlen($location) > 30) {
    $errors[] = 'Lokalizacja może mieć maksymalnie 30 znaków';
}

if (!empty($website) && mb_strlen($website) > 100) {
    $errors[] = 'Strona internetowa może mieć maksymalnie 100 znaków';
}

// Walidacja URL
if (!empty($website) && !filter_var($website, FILTER_VALIDATE_URL)) {
    $errors[] = 'Podaj prawidłowy adres URL';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

try {
    // Aktualizuj profil w bazie danych
    $stmt = $pdo->prepare("
        UPDATE users 
        SET full_name = ?, 
            bio = ?, 
            location = ?, 
            website = ?
        WHERE id = ?
    ");
    
    $stmt->execute([
        $fullName,
        $bio,
        $location,
        $website,
        $userId
    ]);
    
    // Pobierz zaktualizowane dane
    $stmt = $pdo->prepare("SELECT full_name, bio, location, website FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $updatedUser = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => 'Profil został zaktualizowany',
        'user' => $updatedUser
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Błąd podczas aktualizacji profilu'
    ]);
}
