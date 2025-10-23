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
$content = trim($_POST['content'] ?? '');

// Walidacja
if (empty($content)) {
    echo json_encode(['success' => false, 'message' => 'Post nie może być pusty']);
    exit;
}

if (mb_strlen($content) > 280) {
    echo json_encode(['success' => false, 'message' => 'Post może mieć maksymalnie 280 znaków']);
    exit;
}

try {
    // Utwórz post
    $stmt = $pdo->prepare("
        INSERT INTO posts (user_id, content, created_at) 
        VALUES (?, ?, NOW())
    ");
    $stmt->execute([$userId, $content]);
    
    $postId = $pdo->lastInsertId();
    
    // Pobierz utworzony post z danymi użytkownika
    $stmt = $pdo->prepare("
        SELECT 
            p.*,
            u.username,
            u.full_name,
            u.profile_image,
            u.verified
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    ");
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => 'Post dodany pomyślnie',
        'post' => $post
    ]);
    
} catch (PDOException $e) {
    error_log("Create post error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Wystąpił błąd podczas tworzenia posta'
    ]);
}
?>
