<?php
/**
 * API Endpoint: Pobieranie postów
 * 
 * Parametry:
 * - filter: 'all' (wszystkie posty), 'following' (obserwowani), 'user' (konkretny użytkownik)
 * - user_id: ID użytkownika (wymagane gdy filter='user')
 * - page: numer strony (domyślnie 1)
 */

require_once '../config.php';
require_once '../functions.php';

// Nagłówki zapobiegające cachowaniu
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

// Tylko metoda POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Metoda nie dozwolona']);
    exit;
}

// Sprawdź autoryzację
if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Wymagane logowanie']);
    exit;
}

$currentUserId = (int)$_SESSION['user_id'];

// Pobierz parametry
$filter = $_POST['filter'] ?? 'all';
$targetUserId = isset($_POST['user_id']) ? (int)$_POST['user_id'] : null;
$page = isset($_POST['page']) ? (int)$_POST['page'] : 1;
$limit = 20;
$offset = ($page - 1) * $limit;

// Walidacja
if (!in_array($filter, ['all', 'following', 'user'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Nieprawidłowy filtr']);
    exit;
}

if ($filter === 'user' && (!$targetUserId || $targetUserId <= 0)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Wymagane prawidłowe user_id dla filtru user']);
    exit;
}

try {
    // Buduj zapytanie w zależności od filtru
    $whereClause = '';
    $params = [
        ':current_user_id_1' => $currentUserId,
        ':current_user_id_2' => $currentUserId,
        ':limit' => $limit,
        ':offset' => $offset
    ];
    
    switch ($filter) {
        case 'user':
            // Posty konkretnego użytkownika
            $whereClause = 'WHERE p.user_id = :target_user_id';
            $params[':target_user_id'] = $targetUserId;
            break;
            
        case 'following':
            // Posty od obserwowanych użytkowników
            $whereClause = 'WHERE p.user_id IN (
                SELECT following_id FROM follows WHERE follower_id = :following_user_id
            )';
            $params[':following_user_id'] = $currentUserId;
            break;
            
        case 'all':
        default:
            // Wszystkie posty
            $whereClause = '';
            break;
    }
    
    $sql = "
        SELECT 
            p.id,
            p.content,
            p.likes_count,
            p.reposts_count,
            p.replies_count,
            p.created_at,
            u.id as user_id,
            u.username,
            u.full_name,
            u.profile_image,
            u.verified,
            EXISTS(
                SELECT 1 FROM likes 
                WHERE post_id = p.id AND user_id = :current_user_id_1
            ) as is_liked,
            EXISTS(
                SELECT 1 FROM reposts 
                WHERE post_id = p.id AND user_id = :current_user_id_2
            ) as is_reposted
        FROM posts p
        INNER JOIN users u ON p.user_id = u.id
        {$whereClause}
        ORDER BY p.created_at DESC
        LIMIT :limit OFFSET :offset
    ";
    
    $stmt = $pdo->prepare($sql);
    
    // Bind wszystkich parametrów
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value, PDO::PARAM_INT);
    }
    
    $stmt->execute();
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatuj daty
    foreach ($posts as &$post) {
        $post['time_ago'] = timeAgo($post['created_at']);
        
        // Konwertuj boolean wartości
        $post['is_liked'] = (bool)$post['is_liked'];
        $post['is_reposted'] = (bool)$post['is_reposted'];
        $post['verified'] = (bool)$post['verified'];
    }
    
    // Zwróć wynik
    echo json_encode([
        'success' => true,
        'posts' => $posts,
        'filter' => $filter,
        'page' => $page,
        'count' => count($posts)
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    error_log("API get_posts error: " . $e->getMessage());
    error_log("SQL: " . ($sql ?? 'N/A'));
    error_log("Params: " . print_r($params, true));
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Błąd serwera podczas pobierania postów'
    ]);
}
