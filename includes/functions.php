<?php
// Funkcje pomocnicze

// Sprawdza czy użytkownik jest zalogowany
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Pobiera ID zalogowanego użytkownika
function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

// Wymaga zalogowania (redirect jeśli niezalogowany)
function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

// Czyści dane wejściowe
function clean($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Walidacja email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Walidacja username (3-20 znaków, tylko litery, cyfry i _)
function isValidUsername($username) {
    return preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username);
}

// Walidacja hasła (min 8 znaków)
function isValidPassword($password) {
    return strlen($password) >= 8;
}

// Hashowanie hasła
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Weryfikacja hasła
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Format czasu ("2h", "1d", etc.)
function timeAgo($timestamp) {
    $time = strtotime($timestamp);
    $diff = time() - $time;
    
    if ($diff < 60) {
        return $diff . 's';
    } elseif ($diff < 3600) {
        return floor($diff / 60) . 'm';
    } elseif ($diff < 86400) {
        return floor($diff / 3600) . 'h';
    } elseif ($diff < 604800) {
        return floor($diff / 86400) . 'd';
    } else {
        return date('d M', $time);
    }
}

// Format liczby (1234 -> 1,2 tys.)
function formatNumber($num) {
    if ($num >= 1000000) {
        return round($num / 1000000, 1) . ' mln';
    } elseif ($num >= 1000) {
        return round($num / 1000, 1) . ' tys.';
    }
    return $num;
}

// Generuje CSRF token
function generateCsrfToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Weryfikuje CSRF token
function verifyCsrfToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Upload obrazka
function uploadImage($file, $directory = 'uploads/') {
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $filename = $file['name'];
    $fileTmp = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileExt = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    
    if (!in_array($fileExt, $allowed)) {
        return ['success' => false, 'error' => 'Nieprawidłowy format pliku'];
    }
    
    if ($fileSize > 5000000) { // 5MB
        return ['success' => false, 'error' => 'Plik jest za duży (max 5MB)'];
    }
    
    $newFilename = uniqid('img_', true) . '.' . $fileExt;
    $destination = $directory . $newFilename;
    
    if (!file_exists($directory)) {
        mkdir($directory, 0777, true);
    }
    
    if (move_uploaded_file($fileTmp, $destination)) {
        return ['success' => true, 'path' => $destination];
    }
    
    return ['success' => false, 'error' => 'Błąd podczas przesyłania pliku'];
}
?>
