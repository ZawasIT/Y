<?php
session_start();

// Usuń wszystkie zmienne sesji
$_SESSION = [];

// Zniszcz sesję
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

session_destroy();

// Przekieruj do strony logowania
header('Location: ../login.php?message=logged_out');
exit;
?>
