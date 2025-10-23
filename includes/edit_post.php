<?php
require_once 'config.php';
require_once 'functions.php';

header('Content-Type: application/json');

// Sprawdza czy użytkownik jest zalogowany
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
$content = isset($_POST['content']) ? trim($_POST['content']) : '';

// Walidacja
if ($postId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowe ID posta']);
    exit;
}

if (empty($content)) {
    echo json_encode(['success' => false, 'message' => 'Treść posta nie może być pusta']);
    exit;
}

if (mb_strlen($content) > 280) {
    echo json_encode(['success' => false, 'message' => 'Post może mieć maksymalnie 280 znaków']);
    exit;
}

try {
    // Sprawdza czy post należy do użytkownika
    $stmt = $pdo->prepare("SELECT user_id FROM posts WHERE id = ?");
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    
    if (!$post) {
        echo json_encode(['success' => false, 'message' => 'Post nie istnieje']);
        exit;
    }
    
    if ($post['user_id'] != $userId) {
        echo json_encode(['success' => false, 'message' => 'Nie masz uprawnień do edycji tego posta']);
        exit;
    }
    
    // Aktualizuje post
    $stmt = $pdo->prepare("UPDATE posts SET content = ? WHERE id = ?");
    $stmt->execute([$content, $postId]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Post został zaktualizowany',
        'content' => $content
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Błąd podczas edycji posta'
    ]);
}
