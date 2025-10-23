// Obsługa formularza logowania
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Walidacja formularza
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Walidacja podstawowa
        if (!username || !password) {
            showNotification('Proszę wypełnić wszystkie pola', 'error');
            return;
        }

        // Wyłącz przycisk podczas przetwarzania
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logowanie...';

        // Przygotuj dane formularza
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        // Wyślij żądanie do backendu
        fetch('includes/login_process.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Logowanie pomyślne! Przekierowanie...', 'success');
                
                // Przekierowanie po 1 sekundzie
                setTimeout(() => {
                    window.location.href = data.redirect || 'index.php';
                }, 1000);
            } else {
                // Wyświetl błąd
                showNotification(data.message || 'Nieprawidłowa nazwa użytkownika lub hasło', 'error');
                
                // Przywróć przycisk
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                
                // Wyczyść hasło
                passwordInput.value = '';
                passwordInput.focus();
            }
        })
        .catch(error => {
            console.error('Błąd:', error);
            showNotification('Wystąpił błąd połączenia. Spróbuj ponownie.', 'error');
            
            // Przywróć przycisk
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    });

    // Animacja dla inputów
    const inputs = document.querySelectorAll('.input-wrapper input');
    
    inputs.forEach(input => {
        // Sprawdź czy input ma wartość przy załadowaniu strony
        if (input.value) {
            input.parentElement.classList.add('has-value');
        }

        input.addEventListener('blur', function() {
            if (this.value) {
                this.parentElement.classList.add('has-value');
            } else {
                this.parentElement.classList.remove('has-value');
            }
        });
    });

    // Obsługa przycisków społecznościowych
    const socialBtns = document.querySelectorAll('.google-btn');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const isGoogle = this.querySelector('.google-icon path[fill="#4285F4"]');
            const provider = isGoogle ? 'Google' : 'Apple';
            showNotification(`Logowanie przez ${provider} - funkcja w przygotowaniu`, 'info');
        });
    });
});

// Dodaj efekt ripple do przycisków
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Funkcja do wyświetlania powiadomień
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    const colors = {
        success: '#00BA7C',
        error: '#F4212E',
        info: '#1D9BF0'
    };
    
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: ${colors[type]};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 700;
        z-index: 1000;
        animation: slideUp 0.3s ease;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Dodaj style dla animacji
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
    }
`;
document.head.appendChild(style);
