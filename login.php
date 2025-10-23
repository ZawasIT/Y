<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zaloguj się do Y - Platforma Y</title>
    <link rel="stylesheet" href="css/login.css">
</head>
<body>
    <div class="container">
        <!-- Lewa sekcja z logo -->
        <div class="left-section">
            <div class="logo">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <g>
                        <path d="m 18.244,2.25 h 3.308 l -7.227,8.26 8.502,11.24 H 16.17 c 0,0 -4.248284,-5.298111 -14.916,-19.5 H 8.08 l 4.713,6.231 z m -1.161,17.52 h 1.833 L 7.084,4.126 H 5.117 Z" fill="#e7e9ea"></path>
                    </g>
                </svg>
            </div>
        </div>

        <!-- Prawa sekcja z formularzem -->
        <div class="right-section">
            <div class="login-container">
                <h1>Dzieje się teraz</h1>
                <h2>Zaloguj się do Y i Ytuj do woli!</h2>

                <!-- Komunikaty błędów/sukcesów -->
                <?php if (isset($_GET['error'])): ?>
                    <div class="alert alert-error">
                        <?php
                        $error = htmlspecialchars($_GET['error']);
                        $errorMessages = [
                            'empty_fields' => 'Proszę wypełnić wszystkie pola',
                            'invalid_credentials' => 'Nieprawidłowa nazwa użytkownika lub hasło',
                            'server_error' => 'Wystąpił błąd serwera. Spróbuj ponownie.',
                            'logged_out' => 'Zostałeś wylogowany'
                        ];
                        echo $errorMessages[$error] ?? 'Wystąpił błąd podczas logowania';
                        ?>
                    </div>
                <?php endif; ?>

                <?php if (isset($_GET['message'])): ?>
                    <div class="alert alert-success">
                        <?php
                        $message = htmlspecialchars($_GET['message']);
                        $messages = [
                            'logged_out' => 'Zostałeś pomyślnie wylogowany',
                            'registered' => 'Konto utworzone! Możesz się teraz zalogować'
                        ];
                        echo $messages[$message] ?? htmlspecialchars($message);
                        ?>
                    </div>
                <?php endif; ?>

                <!-- Przycisk Google -->
                <button class="btn google-btn">
                    <svg class="google-icon" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Zaloguj się przez Google
                </button>

                <!-- Przycisk Apple -->
                <button class="btn google-btn" style="background-color: #fff; color: #000;">
                    <svg class="google-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Zaloguj się przez Apple
                </button>

                <div class="divider">
                    <span>lub</span>
                </div>

                <!-- Formularz logowania -->
                <form id="loginForm">
                    <div class="input-group">
                        <div class="input-wrapper">
                            <input type="text" id="username" name="username" placeholder="username" required>
                            <label for="username">Telefon, email lub nazwa użytkownika</label>
                        </div>
                    </div>

                    <div class="input-group">
                        <div class="input-wrapper">
                            <input type="password" id="password" name="password" placeholder="password" required>
                            <label for="password">Hasło</label>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary">Zaloguj się</button>
                </form>

                <div class="forgot-password">
                    <a href="#">Nie pamiętasz hasła?</a>
                </div>

                <!-- Sekcja rejestracji -->
                <div class="signup-section">
                    <p>Nie masz konta?</p>
                    <a href="register.php">
                        <button class="btn btn-secondary">Zarejestruj się</button>
                    </a>
                </div>

                <!-- Stopka -->
                <div class="footer">
                    <a href="#">Informacje</a>
                    <a href="#">Centrum pomocy</a>
                    <!-- <a href="#">Warunki korzystania z usługi</a>
                    <a href="#">Zasady prywatności</a>
                    <a href="#">Zasady dotyczące plików cookie</a>
                    <a href="#">Ułatwienia dostępu</a>
                    <a href="#">Reklamy</a>
                    <a href="#">Blog</a>
                    <a href="#">Status</a>
                    <a href="#">Kariera</a>
                    <a href="#">Zasoby marki</a>
                    <a href="#">Reklama</a>
                    <a href="#">Marketing</a>
                    <a href="#">Y dla firm</a>
                    <a href="#">Katalog</a> -->
                    <a href="#">Deweloperzy</a>
                    <a href="#">Ustawienia</a>
                    <span>© 2025 Platforma Y.</span>
                </div>
            </div>
        </div>
    </div>

    <script src="js/login.js"></script>
</body>
</html>
