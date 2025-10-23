// Wypełnienie select dnia i roku
document.addEventListener('DOMContentLoaded', function() {
    const daySelect = document.getElementById('day');
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');

    // Wypełnienie dni (1-31)
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }

    // Wypełnienie lat (od bieżącego roku wstecz do 1900)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1900; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }

    // Aktualizacja liczby dni w miesiącu
    function updateDays() {
        const month = parseInt(monthSelect.value);
        const year = parseInt(yearSelect.value);
        
        if (month && year) {
            const daysInMonth = new Date(year, month, 0).getDate();
            const currentDay = parseInt(daySelect.value);
            
            // Usuń wszystkie opcje poza pierwszą
            daySelect.innerHTML = '<option value="">Dzień</option>';
            
            // Dodaj odpowiednią liczbę dni
            for (let i = 1; i <= daysInMonth; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                daySelect.appendChild(option);
            }
            
            // Przywróć wybrany dzień jeśli jest poprawny
            if (currentDay && currentDay <= daysInMonth) {
                daySelect.value = currentDay;
            }
        }
    }

    monthSelect.addEventListener('change', updateDays);
    yearSelect.addEventListener('change', updateDays);

    // Walidacja formularza
    const form = document.getElementById('registerForm');
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    // Walidacja w czasie rzeczywistym
    username.addEventListener('input', function() {
        const value = this.value;
        // Usuń niedozwolone znaki
        this.value = value.replace(/[^a-zA-Z0-9_]/g, '');
        
        if (this.value.length > 0) {
            validateUsername(this.value);
        } else {
            clearValidation(this.parentElement);
        }
    });

    email.addEventListener('blur', function() {
        if (this.value) {
            validateEmail(this.value);
        }
    });

    password.addEventListener('input', function() {
        if (this.value) {
            validatePassword(this.value);
        } else {
            clearValidation(this.parentElement);
        }
        
        // Sprawdź zgodność haseł jeśli potwierdzenie jest wypełnione
        if (confirmPassword.value) {
            validatePasswordMatch();
        }
    });

    confirmPassword.addEventListener('input', function() {
        if (this.value) {
            validatePasswordMatch();
        } else {
            clearValidation(this.parentElement);
        }
    });

    // Obsługa wysyłania formularza
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;

        // Walidacja imienia i nazwiska
        if (!fullName.value.trim()) {
            showError(fullName.parentElement, 'To pole jest wymagane');
            isValid = false;
        } else {
            showSuccess(fullName.parentElement);
        }

        // Walidacja email
        if (!validateEmail(email.value)) {
            isValid = false;
        }

        // Walidacja nazwy użytkownika
        if (!validateUsername(username.value)) {
            isValid = false;
        }

        // Walidacja hasła
        if (!validatePassword(password.value)) {
            isValid = false;
        }

        // Walidacja potwierdzenia hasła
        if (!validatePasswordMatch()) {
            isValid = false;
        }

        // Walidacja daty urodzenia
        if (!monthSelect.value || !daySelect.value || !yearSelect.value) {
            showNotification('Wypełnij datę urodzenia', 'error');
            isValid = false;
        } else {
            // Sprawdź czy użytkownik ma przynajmniej 13 lat
            const birthDate = new Date(yearSelect.value, monthSelect.value - 1, daySelect.value);
            const age = calculateAge(birthDate);
            
            if (age < 13) {
                showNotification('Musisz mieć przynajmniej 13 lat', 'error');
                isValid = false;
            }
        }

        if (isValid) {
            // Wyłącz przycisk submit podczas przetwarzania
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Rejestracja...';

            // Zbierz dane formularza
            const formData = new FormData();
            formData.append('full_name', fullName.value);
            formData.append('email', email.value);
            formData.append('username', username.value);
            formData.append('password', password.value);
            formData.append('birth_day', daySelect.value);
            formData.append('birth_month', monthSelect.value);
            formData.append('birth_year', yearSelect.value);

            // Wyślij żądanie do backendu
            fetch('includes/register_process.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Rejestracja zakończona sukcesem! Przekierowanie...', 'success');
                    
                    // Przekierowanie po 1.5 sekundach
                    setTimeout(() => {
                        window.location.href = data.redirect || 'index.php';
                    }, 1500);
                } else {
                    // Wyświetl błąd
                    showNotification(data.message || 'Wystąpił błąd podczas rejestracji', 'error');
                    
                    // Przywróć przycisk
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;

                    // Jeśli jest informacja o konkretnym polu, zaznacz je
                    if (data.field) {
                        const field = document.getElementById(data.field);
                        if (field) {
                            showError(field.parentElement, data.message);
                            field.focus();
                        }
                    }
                }
            })
            .catch(error => {
                console.error('Błąd:', error);
                showNotification('Wystąpił błąd połączenia. Spróbuj ponownie.', 'error');
                
                // Przywróć przycisk
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            });
        }
    });

    // Funkcje walidacji
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const inputGroup = document.getElementById('email').parentElement;
        
        if (!email) {
            showError(inputGroup, 'Email jest wymagany');
            return false;
        } else if (!emailRegex.test(email)) {
            showError(inputGroup, 'Wprowadź poprawny adres email');
            return false;
        } else {
            showSuccess(inputGroup);
            return true;
        }
    }

    function validateUsername(username) {
        const inputGroup = document.getElementById('username').parentElement;
        
        if (!username) {
            showError(inputGroup, 'Nazwa użytkownika jest wymagana');
            return false;
        } else if (username.length < 3) {
            showError(inputGroup, 'Nazwa musi mieć minimum 3 znaki');
            return false;
        } else if (username.length > 20) {
            showError(inputGroup, 'Nazwa może mieć maksymalnie 20 znaków');
            return false;
        } else {
            showSuccess(inputGroup);
            return true;
        }
    }

    function validatePassword(password) {
        const inputGroup = document.getElementById('password').parentElement;
        
        if (!password) {
            showError(inputGroup, 'Hasło jest wymagane');
            return false;
        } else if (password.length < 8) {
            showError(inputGroup, 'Hasło musi mieć minimum 8 znaków');
            return false;
        } else {
            showSuccess(inputGroup);
            return true;
        }
    }

    function validatePasswordMatch() {
        const inputGroup = confirmPassword.parentElement;
        
        if (!confirmPassword.value) {
            showError(inputGroup, 'Potwierdź hasło');
            return false;
        } else if (password.value !== confirmPassword.value) {
            showError(inputGroup, 'Hasła nie są zgodne');
            return false;
        } else {
            showSuccess(inputGroup);
            return true;
        }
    }

    function showError(inputGroup, message) {
        clearValidation(inputGroup);
        inputGroup.classList.add('error');
        
        const errorMsg = document.createElement('span');
        errorMsg.className = 'error-message';
        errorMsg.textContent = message;
        inputGroup.appendChild(errorMsg);
    }

    function showSuccess(inputGroup) {
        clearValidation(inputGroup);
        inputGroup.classList.add('success');
    }

    function clearValidation(inputGroup) {
        inputGroup.classList.remove('error', 'success');
        const errorMsg = inputGroup.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    function calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    // Obsługa przycisków społecznościowych
    const googleBtn = document.querySelector('.google-btn');
    const appleBtn = document.querySelector('.apple-btn');

    googleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('Rejestracja przez Google - funkcja w przygotowaniu', 'info');
    });

    appleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('Rejestracja przez Apple - funkcja w przygotowaniu', 'info');
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
