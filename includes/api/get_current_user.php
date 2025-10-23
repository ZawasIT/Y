<?php
require_once '../config.php';
require_once '../functions.php';

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

// Sprawdź czy użytkownik jest zalogowany
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Musisz być zalogowany']);
    exit;
}

try {
    $userId = $_SESSION['user_id'];
    
    // Pobierz dane użytkownika
    $stmt = $pdo->prepare("
        SELECT 
            id,
            username,
            full_name,
            bio,
            location,
            website,
            profile_image,
            banner_image,
            verified,
            created_at
        FROM users 
        WHERE id = ?
    ");
    
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if ($user) {
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Nie znaleziono użytkownika'
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Błąd pobierania danych'
    ]);
}
