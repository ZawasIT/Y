<?php
require_once 'config.php';
require_once 'functions.php';

// Włącz wyświetlanie błędów dla debugowania
error_reporting(E_ALL);
ini_set('display_errors', 0); // Wyłącz display (bo JSON), ale loguj
ini_set('log_errors', 1);

header('Content-Type: application/json');

// Sprawdź czy użytkownik jest zalogowany
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Musisz być zalogowany']);
    exit;
}

// Sprawdź czy to POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowa metoda']);
    exit;
}

$userId = $_SESSION['user_id'];
$followingId = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;

if ($followingId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowe ID użytkownika']);
    exit;
}

// Nie można obserwować samego siebie
if ($userId === $followingId) {
    echo json_encode(['success' => false, 'message' => 'Nie możesz obserwować samego siebie']);
    exit;
}

try {
    // Sprawdź czy użytkownik do obserwowania istnieje
    $stmt = $pdo->prepare("SELECT id, username FROM users WHERE id = ?");
    $stmt->execute([$followingId]);
    $targetUser = $stmt->fetch();
    
    if (!$targetUser) {
        echo json_encode(['success' => false, 'message' => 'Użytkownik nie istnieje']);
        exit;
    }
    
    // Sprawdź czy już obserwujesz tego użytkownika
    $stmt = $pdo->prepare("SELECT id FROM follows WHERE follower_id = ? AND following_id = ?");
    $stmt->execute([$userId, $followingId]);
    $existingFollow = $stmt->fetch();
    
    if ($existingFollow) {
        // Przestań obserwować (unfollow)
        $stmt = $pdo->prepare("DELETE FROM follows WHERE follower_id = ? AND following_id = ?");
        $stmt->execute([$userId, $followingId]);
        
        echo json_encode([
            'success' => true,
            'action' => 'unfollowed',
            'message' => 'Przestałeś obserwować @' . $targetUser['username']
        ]);
        
    } else {
        // Zacznij obserwować (follow)
        $stmt = $pdo->prepare("INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, NOW())");
        $stmt->execute([$userId, $followingId]);
        
        // Dodaj powiadomienie
        $stmt = $pdo->prepare("
            INSERT INTO notifications (user_id, type, actor_id, created_at) 
            VALUES (?, 'follow', ?, NOW())
        ");
        $stmt->execute([$followingId, $userId]);
        
        echo json_encode([
            'success' => true,
            'action' => 'followed',
            'message' => 'Obserwujesz @' . $targetUser['username']
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Follow user error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    echo json_encode([
        'success' => false, 
        'message' => 'Wystąpił błąd podczas przetwarzania',
        'error' => $e->getMessage(), // Dodane dla debugowania
        'code' => $e->getCode()
    ]);
} catch (Exception $e) {
    error_log("General error in follow_user: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Wystąpił błąd',
        'error' => $e->getMessage()
    ]);
}
?>
