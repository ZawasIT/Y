<?php
require_once 'config.php';
require_once 'functions.php';

header('Content-Type: application/json');

// Sprawdź czy użytkownik jest zalogowany
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Musisz być zalogowany']);
    exit;
}

// Sprawdź czy jest to żądanie POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowa metoda']);
    exit;
}

$userId = $_SESSION['user_id'];
$postId = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
$content = isset($_POST['content']) ? trim($_POST['content']) : '';

// Walidacja
if ($postId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowy ID posta']);
    exit;
}

if (empty($content)) {
    echo json_encode(['success' => false, 'message' => 'Odpowiedź nie może być pusta']);
    exit;
}

if (mb_strlen($content) > 280) {
    echo json_encode(['success' => false, 'message' => 'Odpowiedź może mieć maksymalnie 280 znaków']);
    exit;
}

// Sprawdź czy post istnieje
$stmt = $pdo->prepare("SELECT id FROM posts WHERE id = ?");
$stmt->execute([$postId]);
if (!$stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Post nie istnieje']);
    exit;
}

try {
    // Dodaj odpowiedź do bazy
    $stmt = $pdo->prepare("INSERT INTO replies (post_id, user_id, content) VALUES (?, ?, ?)");
    $stmt->execute([$postId, $userId, $content]);
    
    $replyId = $pdo->lastInsertId();
    
    // Pobierz dane nowo utworzonej odpowiedzi z danymi użytkownika
    $stmt = $pdo->prepare("
        SELECT 
            r.*,
            u.username,
            u.full_name,
            u.profile_image,
            u.verified
        FROM replies r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
    ");
    $stmt->execute([$replyId]);
    $reply = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => 'Odpowiedź dodana',
        'reply' => $reply
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Błąd bazy danych']);
}
?>
