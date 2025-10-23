<?php
require_once 'config.php';
require_once 'functions.php';

// Włącz wyświetlanie błędów dla debugowania
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Sprawdza czy użytkownik jest zalogowany
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Musisz być zalogowany']);
    exit;
}

// Sprawdza czy to POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowa metoda']);
    exit;
}

$userId = $_SESSION['user_id'];
$postId = isset($_POST['post_id']) ? (int)$_POST['post_id'] : 0;

if ($postId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowe ID posta']);
    exit;
}

try {
    // Sprawdza czy post istnieje
    $stmt = $pdo->prepare("SELECT id, user_id FROM posts WHERE id = ?");
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    
    if (!$post) {
        echo json_encode(['success' => false, 'message' => 'Post nie istnieje']);
        exit;
    }
    
    // Sprawdza czy użytkownik już polubił ten post
    $stmt = $pdo->prepare("SELECT id FROM likes WHERE post_id = ? AND user_id = ?");
    $stmt->execute([$postId, $userId]);
    $existingLike = $stmt->fetch();
    
    if ($existingLike) {
        // Usuwa polubienie (unlike)
        $stmt = $pdo->prepare("DELETE FROM likes WHERE post_id = ? AND user_id = ?");
        $stmt->execute([$postId, $userId]);
        
        // Aktualizuje licznik w tabeli posts
        $stmt = $pdo->prepare("UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?");
        $stmt->execute([$postId]);
        
        // Pobiera aktualną liczbę polubień
        $stmt = $pdo->prepare("SELECT likes_count FROM posts WHERE id = ?");
        $stmt->execute([$postId]);
        $likesCount = $stmt->fetchColumn();
        
        echo json_encode([
            'success' => true,
            'action' => 'unliked',
            'likes_count' => (int)$likesCount,
            'message' => 'Usunięto polubienie'
        ]);
        
    } else {
        // Dodaje polubienie (like)
        $stmt = $pdo->prepare("INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, NOW())");
        $stmt->execute([$postId, $userId]);
        
        // Aktualizuje licznik w tabeli posts
        $stmt = $pdo->prepare("UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?");
        $stmt->execute([$postId]);
        
        // Pobiera aktualną liczbę polubień
        $stmt = $pdo->prepare("SELECT likes_count FROM posts WHERE id = ?");
        $stmt->execute([$postId]);
        $likesCount = $stmt->fetchColumn();
        
        // Dodaje powiadomienie (jeśli to nie własny post)
        if ($post['user_id'] != $userId) {
            $stmt = $pdo->prepare("
                INSERT INTO notifications (user_id, type, post_id, actor_id, created_at) 
                VALUES (?, 'like', ?, ?, NOW())
            ");
            $stmt->execute([$post['user_id'], $postId, $userId]);
        }
        
        echo json_encode([
            'success' => true,
            'action' => 'liked',
            'likes_count' => (int)$likesCount,
            'message' => 'Polubiono post'
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Like post error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    echo json_encode([
        'success' => false, 
        'message' => 'Wystąpił błąd podczas przetwarzania',
        'error' => $e->getMessage(), // Dodane dla debugowania
        'code' => $e->getCode()
    ]);
} catch (Exception $e) {
    error_log("General error in like_post: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Wystąpił błąd',
        'error' => $e->getMessage()
    ]);
}
?>
