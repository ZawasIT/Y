<?php
require_once '../config.php';
require_once '../functions.php';

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

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

$currentUserId = $_SESSION['user_id'];
$postId = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
$page = isset($_POST['page']) ? intval($_POST['page']) : 1;
$limit = 20;
$offset = ($page - 1) * $limit;

// Walidacja
if ($postId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowy ID posta']);
    exit;
}

try {
    // Pobierz odpowiedzi dla danego posta
    $stmt = $pdo->prepare("
        SELECT 
            r.id,
            r.post_id,
            r.user_id,
            r.content,
            r.created_at,
            u.username,
            u.full_name,
            u.profile_image,
            u.verified
        FROM replies r
        JOIN users u ON r.user_id = u.id
        WHERE r.post_id = ?
        ORDER BY r.created_at ASC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([$postId, $limit, $offset]);
    $replies = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'replies' => $replies,
        'page' => $page,
        'count' => count($replies)
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Błąd bazy danych']);
}
?>
