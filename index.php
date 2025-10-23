<?php
    require_once 'includes/config.php';
    require_once 'includes/functions.php';

    // Sprawdza czy użytkownik jest zalogowany
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }

    // Pobiera dane zalogowanego użytkownika
    $userId = $_SESSION['user_id'];
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $currentUser = $stmt->fetch();

    // Pobiera sugestie użytkowników do obserwowania (max 5, losowo)
    $stmt = $pdo->prepare("
        SELECT id, username, full_name, bio, profile_image, verified 
        FROM users 
        WHERE id != ? 
        AND id NOT IN (
            SELECT following_id FROM follows WHERE follower_id = ?
        )
        ORDER BY RAND()
        LIMIT 5
    ");
    $stmt->execute([$userId, $userId]);
    $suggestedUsers = $stmt->fetchAll();
?>


<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Strona główna / Platforma Y</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Boczne menu lewe -->
    <aside class="sidebar-left">
        <div class="sidebar-content">
            <!-- Logo -->
            <a href="index.php" class="logo-link">
                <svg viewBox="0 0 24 24" class="logo-icon" aria-hidden="true">
                    <g>
                        <path d="m 18.244,2.25 h 3.308 l -7.227,8.26 8.502,11.24 H 16.17 c 0,0 -4.248284,-5.298111 -14.916,-19.5 H 8.08 l 4.713,6.231 z m -1.161,17.52 h 1.833 L 7.084,4.126 H 5.117 Z" fill="#e7e9ea"></path>
                    </g>
                </svg>
            </a>

            <!-- Menu nawigacyjne -->
            <nav class="main-nav">
                <a href="index.php" class="nav-item active">
                    <svg viewBox="0 0 24 24" class="nav-icon">
                        <g><path d="M12 3L3 9v11c0 1.1.9 2 2 2h5v-7h4v7h5c1.1 0 2-.9 2-2V9l-9-6z"></path></g>
                    </svg>
                    <span class="nav-text">Strona główna</span>
                </a>

                <a href="#" class="nav-item">
                    <svg viewBox="0 0 24 24" class="nav-icon">
                        <g><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path></g>
                    </svg>
                    <span class="nav-text">Szukaj</span>
                </a>

                <a href="#" class="nav-item">
                    <svg viewBox="0 0 24 24" class="nav-icon">
                        <g><path d="M19.993 9.042C19.48 5.017 16.054 2 11.996 2s-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958zM12 20c-1.306 0-2.417-.835-2.829-2h5.658c-.412 1.165-1.523 2-2.829 2zm-6.866-4l.847-6.698C6.364 6.272 8.941 4 11.996 4s5.627 2.268 6.013 5.295L18.864 16H5.134z"></path></g>
                    </svg>
                    <span class="nav-text">Powiadomienia</span>
                </a>

                <a href="#" class="nav-item">
                    <svg viewBox="0 0 24 24" class="nav-icon">
                        <g><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z"></path></g>
                    </svg>
                    <span class="nav-text">Wiadomości</span>
                </a>

                <a href="profile.php" class="nav-item">
                    <svg viewBox="0 0 24 24" class="nav-icon">
                        <g><path d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z"></path></g>
                    </svg>
                    <span class="nav-text">Profil</span>
                </a>

                <a href="#" class="nav-item">
                    <svg viewBox="0 0 24 24" class="nav-icon">
                        <g><path d="M3.75 12c0-4.56 3.69-8.25 8.25-8.25s8.25 3.69 8.25 8.25-3.69 8.25-8.25 8.25S3.75 16.56 3.75 12zM12 1.75C6.34 1.75 1.75 6.34 1.75 12S6.34 22.25 12 22.25 22.25 17.66 22.25 12 17.66 1.75 12 1.75zm-4.75 11.5c.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25S6 11.31 6 12s.56 1.25 1.25 1.25zm9.5 0c.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25-1.25.56-1.25 1.25.56 1.25 1.25 1.25zM13.25 12c0 .69-.56 1.25-1.25 1.25s-1.25-.56-1.25-1.25.56-1.25 1.25-1.25 1.25.56 1.25 1.25z"></path></g>
                    </svg>
                    <span class="nav-text">Więcej</span>
                </a>
            </nav>

            <!-- Przycisk "Postuj" -->
            <button class="post-button">Postuj</button>

            <!-- Informacje o użytkowniku -->
            <div class="user-info">
                <img src="<?php echo htmlspecialchars($currentUser['profile_image']); ?>" alt="Avatar" class="user-avatar">
                <div class="user-details">
                    <div class="user-name">
                        <?php echo htmlspecialchars($currentUser['full_name']); ?>
                        <?php if ($currentUser['verified']): ?>
                            <svg viewBox="0 0 24 24" class="verified-badge" style="width: 18px; height: 18px; fill: #1D9BF0; display: inline-block; vertical-align: middle;">
                                <g><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2l-4.3-4.29 1.42-1.42 2.88 2.88 6.79-6.79 1.42 1.42-8.21 8.2z"></path></g>
                            </svg>
                        <?php endif; ?>
                    </div>
                    <div class="user-username">@<?php echo htmlspecialchars($currentUser['username']); ?></div>
                </div>
                <a href="includes/logout.php" style="text-decoration: none; color: inherit;" title="Wyloguj">
                    <svg viewBox="0 0 24 24" class="more-icon">
                        <g><circle cx="5" cy="12" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle></g>
                    </svg>
                </a>
            </div>
        </div>
    </aside>

    <!-- Główna zawartość -->
    <main class="main-content">
        <!-- Nagłówek -->
        <header class="feed-header">
            <div class="feed-tabs">
                <button class="feed-tab active" data-tab="for-you">Dla Ciebie</button>
                <button class="feed-tab" data-tab="following">Obserwowani</button>
            </div>
        </header>

        <!-- Formularz nowego posta -->
        <div class="new-post">
            <img src="<?php echo htmlspecialchars($currentUser['profile_image']); ?>" alt="Avatar" class="post-avatar">
            <div class="post-form">
                <textarea placeholder="Co się dzieje?!" maxlength="280"></textarea>
                <div class="post-actions">
                    <div class="post-icons">
                        <button class="icon-btn" title="Media">
                            <svg viewBox="0 0 24 24"><g><path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v13c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-13c0-.276-.224-.5-.5-.5h-13zM18 15.5c0-.276-.224-.5-.5-.5H17v.5c0 .276-.224.5-.5.5s-.5-.224-.5-.5V15h-.5c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h.5v-.5c0-.276.224-.5.5-.5s.5.224.5.5v.5h.5c.276 0 .5.224.5.5zm-3-5.5c0-1.105-.895-2-2-2s-2 .895-2 2 .895 2 2 2 2-.895 2-2z"></path></g></svg>
                        </button>
                        <button class="icon-btn" title="GIF">
                            <svg viewBox="0 0 24 24"><g><path d="M3 5.5C3 4.119 4.12 3 5.5 3h13C19.88 3 21 4.119 21 5.5v13c0 1.381-1.12 2.5-2.5 2.5h-13C4.12 21 3 19.881 3 18.5v-13zM5.5 5c-.28 0-.5.224-.5.5v13c0 .276.22.5.5.5h13c.28 0 .5-.224.5-.5v-13c0-.276-.22-.5-.5-.5h-13zM18 10.711V9.25h-3.74v5.5h1.44v-1.719h1.7V11.57h-1.7v-.859H18zM11.79 9.25h1.44v5.5h-1.44v-5.5zm-3.07 1.375c.34 0 .77.172 1.02.43l1.03-.86c-.51-.601-1.28-.945-2.05-.945C7.19 9.25 6 10.453 6 12s1.19 2.75 2.72 2.75c.85 0 1.54-.344 2.05-.945v-2.005H8.38v1.032H9.4v.515c-.17.086-.42.172-.68.172-.76 0-1.36-.602-1.36-1.445 0-.859.6-1.46 1.36-1.46z"></path></g></svg>
                        </button>
                        <button class="icon-btn" title="Ankieta">
                            <svg viewBox="0 0 24 24"><g><path d="M6 5c-1.1 0-2 .895-2 2s.9 2 2 2 2-.895 2-2-.9-2-2-2zM2 7c0-2.209 1.79-4 4-4s4 1.791 4 4-1.79 4-4 4-4-1.791-4-4zm20 1H12V6h10v2zM6 15c-1.1 0-2 .895-2 2s.9 2 2 2 2-.895 2-2-.9-2-2-2zm-4 2c0-2.209 1.79-4 4-4s4 1.791 4 4-1.79 4-4 4-4-1.791-4-4zm20 1H12v-2h10v2z"></path></g></svg>
                        </button>
                        <button class="icon-btn" title="Emoji">
                            <svg viewBox="0 0 24 24"><g><path d="M8 9.5C8 8.119 8.672 7 9.5 7S11 8.119 11 9.5 10.328 12 9.5 12 8 10.881 8 9.5zm6.5 2.5c.828 0 1.5-1.119 1.5-2.5S15.328 7 14.5 7 13 8.119 13 9.5s.672 2.5 1.5 2.5zM12 16c-2.224 0-3.021-2.227-3.051-2.316l-1.897.633c.05.15 1.271 3.684 4.949 3.684s4.898-3.533 4.949-3.684l-1.896-.638c-.033.095-.83 2.322-3.053 2.322zm10.25-4.001c0 5.652-4.598 10.25-10.25 10.25S1.75 17.652 1.75 12 6.348 1.75 12 1.75 22.25 6.348 22.25 12zm-2 0c0-4.549-3.701-8.25-8.25-8.25S3.75 7.451 3.75 12s3.701 8.25 8.25 8.25 8.25-3.701 8.25-8.25z"></path></g></svg>
                        </button>
                        <button class="icon-btn" title="Harmonogram">
                            <svg viewBox="0 0 24 24"><g><path d="M6 3V2h2v1h6V2h2v1h1.5C18.88 3 20 4.119 20 5.5v2h-2v-2c0-.276-.22-.5-.5-.5H16v1h-2V5H8v1H6V5H4.5c-.28 0-.5.224-.5.5v12c0 .276.22.5.5.5h3v2h-3C3.12 20 2 18.881 2 17.5v-12C2 4.119 3.12 3 4.5 3H6zm9.5 8c-2.49 0-4.5 2.015-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.01-4.5-4.5-4.5zM9 15.5C9 11.91 11.91 9 15.5 9s6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5S9 19.09 9 15.5zm5.5-2.5h2v2.086l1.71 1.707-1.42 1.414-2.29-2.293V13z"></path></g></svg>
                        </button>
                        <button class="icon-btn" title="Lokalizacja">
                            <svg viewBox="0 0 24 24"><g><path d="M12 7c-1.93 0-3.5 1.57-3.5 3.5S10.07 14 12 14s3.5-1.57 3.5-3.5S13.93 7 12 7zm0 5c-.827 0-1.5-.673-1.5-1.5S11.173 9 12 9s1.5.673 1.5 1.5S12.827 12 12 12zm0-10c-4.687 0-8.5 3.813-8.5 8.5 0 5.967 7.621 11.116 7.945 11.332l.555.37.555-.37c.324-.216 7.945-5.365 7.945-11.332C20.5 5.813 16.687 2 12 2zm0 17.77c-1.665-1.241-6.5-5.196-6.5-9.27C5.5 6.916 8.416 4 12 4s6.5 2.916 6.5 6.5c0 4.073-4.835 8.028-6.5 9.27z"></path></g></svg>
                        </button>
                    </div>
                    <button class="post-submit-btn">Postuj</button>
                </div>
            </div>
        </div>

        <!-- Separator -->
        <div class="posts-separator"></div>

        <!-- Feed z postami (ładowany dynamicznie) -->
        <div class="feed">
            <!-- Posty będą ładowane przez JavaScript -->
        </div>
    </main>

    <!-- Boczne menu prawe -->
    <aside class="sidebar-right">
        <!-- Wyszukiwarka -->
        <div class="search-box">
            <svg viewBox="0 0 24 24" class="search-icon">
                <g><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path></g>
            </svg>
            <input type="text" placeholder="Szukaj">
        </div>

        <!-- Co się dzieje? -->
        <div class="widget">
            <h2>Co się dzieje?</h2>
            <div class="trending-item">
                <div class="trending-category">Technologia · Na czasie</div>
                <div class="trending-topic">#ReactJS</div>
                <div class="trending-posts">15,2 tys. postów</div>
            </div>
            <div class="trending-item">
                <div class="trending-category">Polska · Trendy</div>
                <div class="trending-topic">#PlatformaY</div>
                <div class="trending-posts">8,4 tys. postów</div>
            </div>
            <div class="trending-item">
                <div class="trending-category">Programowanie · Na czasie</div>
                <div class="trending-topic">#100DaysOfCode</div>
                <div class="trending-posts">24,5 tys. postów</div>
            </div>
            <div class="trending-item">
                <div class="trending-category">Wiadomości · LIVE</div>
                <div class="trending-topic">Konferencja IT 2025</div>
                <div class="trending-posts">3,2 tys. postów</div>
            </div>
            <a href="#" class="show-more">Pokaż więcej</a>
        </div>

        <!-- Kogo obserwować -->
        <div class="widget">
            <h2>Kogo obserwować</h2>
            <?php foreach ($suggestedUsers as $user): ?>
            <div class="follow-item">
                <img src="<?php echo htmlspecialchars($user['profile_image']); ?>" alt="Avatar">
                <div class="follow-info">
                    <div class="follow-name">
                        <?php echo htmlspecialchars($user['full_name']); ?>
                        <?php if ($user['verified']): ?>
                            <svg viewBox="0 0 24 24" class="verified-badge" style="width: 16px; height: 16px; fill: #1D9BF0; display: inline-block; vertical-align: middle; margin-left: 2px;">
                                <g><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2l-4.3-4.29 1.42-1.42 2.88 2.88 6.79-6.79 1.42 1.42-8.21 8.2z"></path></g>
                            </svg>
                        <?php endif; ?>
                    </div>
                    <div class="follow-username">@<?php echo htmlspecialchars($user['username']); ?></div>
                </div>
                <button class="follow-btn" data-user-id="<?php echo $user['id']; ?>">Obserwuj</button>
            </div>
            <?php endforeach; ?>
            <?php if (empty($suggestedUsers)): ?>
                <p style="text-align: center; color: #71767B; padding: 20px;">Brak sugestii</p>
            <?php endif; ?>
            <a href="#" class="show-more">Pokaż więcej</a>
        </div>

        <!-- Stopka -->
        <div class="footer-links">
            <a href="#">Warunki korzystania z usługi</a>
            <a href="#">Zasady prywatności</a>
            <a href="#">Zasady dot. plików cookie</a>
            <a href="#">Ułatwienia dostępu</a>
            <a href="#">Informacje o reklamach</a>
            <a href="#">Więcej ···</a>
            <div class="copyright">© 2025 Platforma Y.</div>
        </div>
    </aside>

    <div id="current-user-data" 
         data-user-id="<?php echo $currentUser['id']; ?>"
         data-username="<?php echo htmlspecialchars($currentUser['username']); ?>"
         style="display: none;">
    </div>

    <!-- Helper functions -->
    <script src="js/utils/helpers.js"></script>

    <!-- UI Components -->
    <script src="js/modules/ui.js"></script>

    <!-- Modules -->
    <script src="js/modules/interactions.js"></script>
    <script src="js/modules/posts.js"></script>
    <script src="js/modules/replies.js"></script>

    <!-- Main entry point -->
    <script src="js/main.js"></script>

</body>
</html>
