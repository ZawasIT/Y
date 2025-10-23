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
$postId = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;

if ($postId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowe ID posta']);
    exit;
}

try {
    // Sprawdź czy post należy do użytkownika
    $stmt = $pdo->prepare("SELECT user_id FROM posts WHERE id = ?");
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    
    if (!$post) {
        echo json_encode(['success' => false, 'message' => 'Post nie istnieje']);
        exit;
    }
    
    if ($post['user_id'] != $userId) {
        echo json_encode(['success' => false, 'message' => 'Nie masz uprawnień do usunięcia tego posta']);
        exit;
    }
    
    // Usuń post (triggery automatycznie usuną powiązane dane)
    $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ?");
    $stmt->execute([$postId]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Post został usunięty'
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Błąd podczas usuwania posta'
    ]);
}
