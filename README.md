# Platforma Y - Social Media Platform

**Platforma Y** to nowoczesna platforma społecznościowa wzorowana na X (Twitter), stworzona z HTML, CSS, JavaScript i PHP.

## 📋 Wymagania
- XAMPP (Apache + MySQL + PHP 7.4+)
- Przeglądarka internetowa

## 🚀 Instalacja

### Krok 1: Uruchom XAMPP
1. Uruchom **XAMPP Control Panel**
2. Włącz **Apache**
3. Włącz **MySQL**

### Krok 2: Utwórz bazę danych
1. Otwórz w przeglądarce: `http://localhost/phpmyadmin`
2. Kliknij **"Import"** w górnym menu
3. Kliknij **"Choose File"** i wybierz plik `database/schema.sql`
4. Kliknij **"Go"** na dole strony
5. Poczekaj, aż pojawi się komunikat "Import has been successfully finished"

### Krok 3: Testuj połączenie
1. Otwórz w przeglądarce: `http://localhost/Platforma_Y/test_connection.php`
2. Sprawdź, czy wszystkie testy przechodzą (zielone checkmarki)
3. Jeśli widzisz błędy, upewnij się, że baza danych została poprawnie zaimportowana

### Krok 4: Testuj aplikację
1. Otwórz: `http://localhost/Platforma_Y/register.php`
2. Zarejestruj nowe konto testowe
3. Zostaniesz automatycznie zalogowany i przekierowany do strony głównej

## 🔐 Testowe Konto

Jeśli baza została poprawnie zaimportowana, możesz zalogować się na konto testowe:

- **Nazwa użytkownika:** `jankowalski`
- **Hasło:** `test1234`

## 📋 Funkcjonalności

### ✅ Zaimplementowane strony:

1. **Strona logowania** (`login.php`)
   - Formularz logowania
   - Opcje logowania przez Google i Apple
   - Link do rejestracji
   - Responsywny design

2. **Strona rejestracji** (`register.php`)
   - Formularz rejestracji
   - Walidacja w czasie rzeczywistym
   - Wybór daty urodzenia
   - Walidacja wieku (min. 13 lat)
   - Silne hasło z walidacją

3. **Strona główna** (`index.php`)
   - Feed z postami
   - Formularz dodawania nowych postów
   - Boczne menu nawigacyjne
   - Widget "Co się dzieje?"
   - Widget "Kogo obserwować"
   - Interaktywne przyciski (like, repost, komentarze)

4. **Profil użytkownika** (`profile.php`)
   - Banner profilu
   - Avatar użytkownika
   - Informacje o profilu (bio, statystyki)
   - Zakładki (Posty, Odpowiedzi, Media, Polubienia)
   - Edycja profilu (modal)
   - Posty użytkownika

## 🎨 Design

Platforma Y wykorzystuje ciemny motyw inspirowany X (Twitter):
- Czarne tło (`#000000`)
- Niebieski akcent (`#1D9BF0`)
- Nowoczesne ikony SVG
- Płynne animacje i przejścia
- W pełni responsywny design

## 📁 Struktura projektu

```
Platforma_Y/
├── index.php              # Strona główna z feedem
├── login.php              # Strona logowania
├── register.php           # Strona rejestracji
├── profile.php            # Profil użytkownika
│
├── css/
│   ├── login.css          # Style strony logowania
│   ├── register.css       # Style strony rejestracji
│   ├── style.css          # Główne style aplikacji
│   └── profile.css        # Style profilu użytkownika
│
├── js/
│   ├── login.js           # Logika strony logowania
│   ├── register.js        # Logika rejestracji z walidacją
│   ├── main.js            # Główna logika (posty, like, follow)
│   └── profile.js         # Logika profilu użytkownika
│
├── images/
│   └── default-avatar.png # Domyślny avatar użytkownika
│
└── includes/
    └── login_process.php  # Backend logowania (do zaimplementowania)
```

## 🚀 Uruchomienie

### Wymagania:
- Serwer WWW (XAMPP, WAMP, MAMP, lub inny)
- Nowoczesna przeglądarka internetowa

### Instalacja:

1. **Uruchom XAMPP**
   ```
   Uruchom XAMPP Control Panel
   Start: Apache
   ```

2. **Otwórz w przeglądarce**
   ```
   http://localhost/Platforma_Y/login.php
   ```

## 🎯 Główne funkcje

### Strona główna (index.php)
- ✅ Pełny feed z postami
- ✅ Dodawanie nowych postów (textarea z licznikiem znaków 0/280)
- ✅ Polubienia postów (toggle, licznik)
- ✅ Reposty (licznik)
- ✅ Obserwowanie użytkowników
- ✅ Widget z trendami
- ✅ Responsywne menu

### Rejestracja (register.php)
- ✅ Walidacja email (regex)
- ✅ Walidacja nazwy użytkownika (3-20 znaków, bez spacji)
- ✅ Silne hasło (min. 8 znaków, wielka/mała litera, cyfra)
- ✅ Potwierdzenie hasła
- ✅ Data urodzenia (weryfikacja wieku 13+)
- ✅ Wizualne feedbacki (error/success states)

### Profil (profile.php)
- ✅ Banner i avatar użytkownika
- ✅ Bio i statystyki (obserwowani/obserwujący)
- ✅ Edycja profilu (modal)
- ✅ Zakładki z treścią
- ✅ Posty użytkownika
- ✅ Verified badge
- ✅ Przycisk "Obserwuj"

## 💡 Interaktywne elementy

### JavaScript:
- **Auto-resize textarea** - automatyczne dopasowanie wysokości
- **Licznik znaków** - 280 znaków max dla postów
- **Toggle like/repost** - animowane przejścia kolorów
- **Follow/Unfollow** - zmiana stanu przycisku z hover effects
- **Notyfikacje** - wyskakujące powiadomienia o akcjach
- **Modal edycji profilu** - pełnofunkcjonalny modal
- **Zakładki profilu** - płynne przełączanie

## 🎨 Kolory i style

```css
--bg-primary: #000000        /* Czarne tło */
--bg-secondary: #16181C      /* Ciemny panel */
--text-primary: #E7E9EA      /* Biały tekst */
--text-secondary: #71767B    /* Szary tekst */
--accent-blue: #1D9BF0       /* Niebieski akcent */
--accent-red: #F91880        /* Różowy (like) */
```

## 📱 Responsywność

- **Desktop** (>1280px): Pełny widok z 3 kolumnami
- **Tablet** (1024-1280px): 2 kolumny, ukryty prawy sidebar
- **Mobile** (<688px): Minimalne menu, jedna kolumna

## 🔮 Przyszłe funkcje (do zaimplementowania z backendem)

- [ ] Połączenie z bazą danych MySQL
- [ ] System logowania/rejestracji
- [ ] Dodawanie postów do bazy
- [ ] System komentarzy
- [ ] Upload zdjęć/mediów
- [ ] System powiadomień
- [ ] Wyszukiwarka użytkowników
- [ ] Prywatne wiadomości
- [ ] Hashtagi i trendy
- [ ] System weryfikacji kont

## 📄 Licencja

Projekt edukacyjny - Platforma Y © 2025

## 👨‍💻 Autor

Projekt stworzony jako demonstracja umiejętności frontend development.

---

**Uwaga:** Aktualnie projekt zawiera tylko warstwę wizualną (HTML/CSS/JS). Backend i baza danych do zaimplementowania w przyszłości.
