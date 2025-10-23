<?php
    require_once 'includes/config.php';
    require_once 'includes/functions.php';

    // Sprawdza czy użytkownik jest zalogowany
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }

    $currentUserId = $_SESSION['user_id'];

    // Pobiera nazwę użytkownika z URL (jeśli istnieje)
    $username = isset($_GET['user']) ? clean($_GET['user']) : null;

    // Jeśli nie podano username, pokazuje profil zalogowanego użytkownika
    if (!$username) {
        $stmt = $pdo->prepare("SELECT username FROM users WHERE id = ?");
        $stmt->execute([$currentUserId]);
        $currentUserData = $stmt->fetch();
        $username = $currentUserData['username'];
    }

    // Pobiera dane użytkownika
    $stmt = $pdo->prepare("
        SELECT 
            u.*,
            (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as posts_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
            EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
        FROM users u
        WHERE u.username = ?
    ");
    $stmt->execute([$currentUserId, $username]);
    $profileUser = $stmt->fetch();

    // Jeśli użytkownik nie istnieje, wraca na stronę główną
    if (!$profileUser) {
        header('Location: index.php');
        exit;
    }

    // Sprawdza czy to własny profil
    $isOwnProfile = true; // ZAWSZE własny profil w my_profile.php

    // Pobiera dane zalogowanego użytkownika dla sidebar
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$currentUserId]);
    $currentUser = $stmt->fetch();

    // Formatuje datę dołączenia
    $joinDate = new DateTime($profileUser['created_at']);
    $joinDateFormatted = $joinDate->format('F Y');
    $joinDatePolish = [
        'January' => 'styczeń',
        'February' => 'luty',
        'March' => 'marzec',
        'April' => 'kwiecień',
        'May' => 'maj',
        'June' => 'czerwiec',
        'July' => 'lipiec',
        'August' => 'sierpień',
        'September' => 'wrzesień',
        'October' => 'październik',
        'November' => 'listopad',
        'December' => 'grudzień'
    ];
    $joinDateFormatted = str_replace(array_keys($joinDatePolish), array_values($joinDatePolish), $joinDateFormatted);
?>

<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($profileUser['full_name']); ?> (@<?php echo htmlspecialchars($profileUser['username']); ?>) / Platforma Y</title>
    <link rel="stylesheet" href="css/profile.css">
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
                <a href="index.php" class="nav-item">
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

                <a href="my_profile.php" class="nav-item active">
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

    <!-- Główna zawartość profilu -->
    <main class="profile-content">
        <!-- Nagłówek profilu -->
        <header class="profile-header">
            <a href="index.php" class="back-btn">
                <svg viewBox="0 0 24 24">
                    <g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g>
                </svg>
            </a>
            <div class="header-info">
                <h2><?php echo htmlspecialchars($profileUser['full_name']); ?></h2>
                <span class="posts-count"><?php echo formatNumber($profileUser['posts_count']); ?> <?php echo $profileUser['posts_count'] == 1 ? 'post' : 'postów'; ?></span>
            </div>
        </header>

        <!-- Banner profilu -->
        <div class="profile-banner">
            <?php if ($profileUser['banner_image']): ?>
                <img src="<?php echo htmlspecialchars($profileUser['banner_image']); ?>" alt="Banner" id="bannerImg">
            <?php else: ?>
                <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
            <?php endif; ?>
        </div>

        <!-- Informacje o profilu -->
        <div class="profile-info-section">
            <div class="profile-avatar-wrapper">
                <img src="<?php echo htmlspecialchars($profileUser['profile_image']); ?>" alt="Avatar" class="profile-avatar">
            </div>
            
            <div class="profile-actions">
                <?php if ($isOwnProfile): ?>
                    <button class="edit-profile-btn" id="editProfileBtn">Edytuj profil</button>
                <?php else: ?>
                    <button class="follow-btn <?php echo $profileUser['is_following'] ? 'following' : ''; ?>" 
                            data-user-id="<?php echo $profileUser['id']; ?>">
                        <?php echo $profileUser['is_following'] ? 'Obserwujesz' : 'Obserwuj'; ?>
                    </button>
                <?php endif; ?>
            </div>

            <div class="profile-details">
                <h1 class="profile-name">
                    <?php echo htmlspecialchars($profileUser['full_name']); ?>
                    <?php if ($profileUser['verified']): ?>
                        <svg viewBox="0 0 22 22" class="verified-badge">
                            <g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g>
                        </svg>
                    <?php endif; ?>
                </h1>
                <p class="profile-username">@<?php echo htmlspecialchars($profileUser['username']); ?></p>
                
                <?php if ($profileUser['bio']): ?>
                    <p class="profile-bio">
                        <?php echo nl2br(htmlspecialchars($profileUser['bio'])); ?>
                    </p>
                <?php endif; ?>

                <div class="profile-meta">
                    <?php if ($profileUser['location']): ?>
                        <span class="meta-item">
                            <svg viewBox="0 0 24 24" class="meta-icon">
                                <g><path d="M12 7c-1.93 0-3.5 1.57-3.5 3.5S10.07 14 12 14s3.5-1.57 3.5-3.5S13.93 7 12 7zm0 5c-.827 0-1.5-.673-1.5-1.5S11.173 9 12 9s1.5.673 1.5 1.5S12.827 12 12 12zm0-10c-4.687 0-8.5 3.813-8.5 8.5 0 5.967 7.621 11.116 7.945 11.332l.555.37.555-.37c.324-.216 7.945-5.365 7.945-11.332C20.5 5.813 16.687 2 12 2zm0 17.77c-1.665-1.241-6.5-5.196-6.5-9.27C5.5 6.916 8.416 4 12 4s6.5 2.916 6.5 6.5c0 4.073-4.835 8.028-6.5 9.27z"></path></g>
                            </svg>
                            <?php echo htmlspecialchars($profileUser['location']); ?>
                        </span>
                    <?php endif; ?>
                    
                    <?php if ($profileUser['website']): ?>
                        <span class="meta-item">
                            <svg viewBox="0 0 24 24" class="meta-icon">
                                <g><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></g>
                            </svg>
                            <a href="<?php echo htmlspecialchars($profileUser['website']); ?>" target="_blank" rel="noopener noreferrer" class="profile-website">
                                <?php echo htmlspecialchars(parse_url($profileUser['website'], PHP_URL_HOST) ?: $profileUser['website']); ?>
                            </a>
                        </span>
                    <?php endif; ?>
                    
                    <span class="meta-item">
                        <svg viewBox="0 0 24 24" class="meta-icon">
                            <g><path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5v12c0 .28.23.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zm0 6h2v-2H7v2zm0 4h2v-2H7v2zm4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm4-4h2v-2h-2v2z"></path></g>
                        </svg>
                        Dołączył(a): <?php echo $joinDateFormatted; ?>
                    </span>
                </div>

                <div class="profile-stats">
                    <a href="#" class="stat">
                        <span class="stat-value"><?php echo formatNumber($profileUser['following_count']); ?></span>
                        <span class="stat-label">Obserwowani</span>
                    </a>
                    <a href="#" class="stat">
                        <span class="stat-value"><?php echo formatNumber($profileUser['followers_count']); ?></span>
                        <span class="stat-label">Obserwujący</span>
                    </a>
                </div>
            </div>
        </div>

        <!-- Nawigacja zakładek -->
        <nav class="profile-tabs">
            <a href="#" class="tab active" data-tab="posts">Posty</a>
            <a href="#" class="tab" data-tab="replies">Odpowiedzi</a>
            <a href="#" class="tab" data-tab="media">Media</a>
            <a href="#" class="tab" data-tab="likes">Polubienia</a>
        </nav>

        <!-- Zawartość zakładek -->
        <div class="tab-content active" id="posts-tab">
            <!-- Posty użytkownika będą ładowane przez JavaScript -->
            <div class="feed"></div>
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

        <!-- Kogo obserwować -->
        <div class="widget">
            <h2>Kogo obserwować</h2>
            <div class="follow-item">
                <img src="images/default-avatar.png" alt="Avatar" onerror="this.src='https://via.placeholder.com/40'">
                <div class="follow-info">
                    <div class="follow-name">Kamil Nowicki</div>
                    <div class="follow-username">@kamildev</div>
                </div>
                <button class="follow-btn">Obserwuj</button>
            </div>
            <div class="follow-item">
                <img src="images/default-avatar.png" alt="Avatar" onerror="this.src='https://via.placeholder.com/40'">
                <div class="follow-info">
                    <div class="follow-name">Ola Kowalska</div>
                    <div class="follow-username">@oladesign</div>
                </div>
                <button class="follow-btn">Obserwuj</button>
            </div>
            <a href="#" class="show-more">Pokaż więcej</a>
        </div>
    </aside>

    <!-- Przekaż dane profilu jako atrybuty data -->
    <div id="profile-data" 
         data-user-id="<?php echo $currentUserId; ?>" 
         data-username="<?php echo htmlspecialchars($currentUser['username']); ?>"
         data-is-own-profile="true"
         style="display: none;">
    </div>
    
    <script src="js/main.js"></script>
    <script src="js/profile.js"></script>
</body>
</html>
