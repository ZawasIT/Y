// Funkcja formatująca liczby (np. 1000 -> 1K)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

// Funkcja pomocnicza - pobiera dane profilu z DOM
function getProfileData() {
    const profileData = document.getElementById('profile-data');
    if (!profileData) {
        console.error('Brak elementu #profile-data w DOM!');
        return null;
    }
    
    return {
        userId: parseInt(profileData.dataset.userId),
        username: profileData.dataset.username,
        isOwnProfile: profileData.dataset.isOwnProfile === 'true'
    };
}

// Funkcja ładująca posty użytkownika
function loadUserPosts(page = 1) {
    const feed = document.querySelector('.feed');
    
    if (!feed) return;
    
    // ZAWSZE pobieraj świeże dane profilu z DOM
    const profileData = getProfileData();
    if (!profileData || !profileData.userId || profileData.userId <= 0) {
        console.error('Nieprawidłowe dane profilu:', profileData);
        feed.innerHTML = '<div class="error">Błąd: Brak danych profilu</div>';
        return;
    }
    
    // Pokazuj loader tylko przy pierwszym ładowaniu
    if (page === 1) {
        feed.innerHTML = '<div class="loading">Ładowanie postów...</div>';
    }
    
    // Przygotuj dane dla API
    const formData = new FormData();
    formData.append('filter', 'user');
    formData.append('user_id', profileData.userId);
    formData.append('page', page);
    
    fetch('includes/api/get_posts.php', {
        method: 'POST',
        body: formData,
        cache: 'no-store'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Wyczyść feed tylko przy pierwszej stronie
                if (page === 1) {
                    feed.innerHTML = '';
                }
                
                if (data.posts.length === 0 && page === 1) {
                    // Brak postów - pokaż odpowiedni komunikat (użyj świeżych danych)
                    const currentProfileData = getProfileData();
                    const message = currentProfileData && currentProfileData.isOwnProfile
                        ? 'Nie masz jeszcze postów' 
                        : 'Ten użytkownik nie ma postów';
                    feed.innerHTML = `<div class="no-posts">${message}</div>`;
                } else {
                    // Dodaj posty do feed
                    data.posts.forEach(post => {
                        const postElement = createPostElement(post);
                        feed.appendChild(postElement);
                    });
                    
                    // Możliwość ładowania kolejnych stron
                    if (data.posts.length === 10) {
                        const loadMoreBtn = document.createElement('button');
                        loadMoreBtn.className = 'load-more-btn';
                        loadMoreBtn.textContent = 'Załaduj więcej';
                        loadMoreBtn.onclick = () => {
                            loadMoreBtn.remove();
                            loadUserPosts(page + 1);
                        };
                        feed.appendChild(loadMoreBtn);
                    }
                }
            } else {
                if (page === 1) {
                    feed.innerHTML = '<div class="error">Wystąpił błąd podczas ładowania postów</div>';
                }
            }
        })
        .catch(error => {
            console.error('Błąd:', error);
            if (page === 1) {
                feed.innerHTML = '<div class="error">Wystąpił błąd podczas ładowania postów</div>';
            }
        });
}

document.addEventListener('DOMContentLoaded', function() {
    // Załaduj posty użytkownika
    loadUserPosts();
    
    // Napraw problem z nieskończoną pętlą onerror dla obrazków
    document.querySelectorAll('img[onerror]').forEach(img => {
        img.removeAttribute('onerror');
        img.addEventListener('error', function() {
            if (!this.dataset.errorHandled) {
                this.dataset.errorHandled = 'true';
                // Zamiast ładować placeholder, ustaw data URL z prostym SVG
                // Sprawdź rozmiar avatara - większy dla profilu, 48px dla follow-item
                let size = 40; // domyślny
                if (this.classList.contains('profile-avatar')) {
                    size = 140;
                } else if (this.closest('.follow-item')) {
                    size = 48;
                }
                this.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"%3E%3Crect width="${size}" height="${size}" fill="%23536471"/%3E%3Cpath d="M${size/2} ${size/4}c-${size/6.67} 0-${size/3.33} ${size/7.5}-${size/3.33} ${size/3.33}s${size/7.5} ${size/3.33} ${size/3.33} ${size/3.33} ${size/3.33}-${size/7.5} ${size/3.33}-${size/3.33}-${size/7.5}-${size/3.33}-${size/3.33}-${size/3.33}zm0 ${size/2.5}c-${size/4.55} 0-${size/3.125} ${size/6.67}-${size/3.125} ${size/3.125}h${size/1.25}c0-${size/4.55}-${size/6.67}-${size/3.125}-${size/3.125}-${size/3.125}z" fill="%23E7E9EA"/%3E%3C/svg%3E`;
            }
        });
    });

    // Napraw banner - użyj SVG zamiast zewnętrznego placeholdera
    const bannerImg = document.getElementById('bannerImg');
    if (bannerImg) {
        bannerImg.addEventListener('error', function() {
            if (!this.dataset.errorHandled) {
                this.dataset.errorHandled = 'true';
                this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="200" viewBox="0 0 600 200"%3E%3Crect width="600" height="200" fill="%231DA1F2"/%3E%3Ctext x="300" y="100" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="24" font-weight="bold"%3EBanner%3C/text%3E%3C/svg%3E';
            }
        });
    }

    // Zapobiegaj domyślnym akcjom dla linków z #
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
        });
    });

    // Przełączanie zakładek
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.dataset.tab;

            // Usuń aktywną klasę ze wszystkich zakładek
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Ukryj wszystkie treści
            tabContents.forEach(content => content.classList.remove('active'));

            // Pokaż odpowiednią treść
            const targetContent = document.getElementById(tabName + '-tab');
            if (targetContent) {
                targetContent.classList.add('active');
                
                // Jeśli wróciliśmy do zakładki z postami, odśwież posty
                if (tabName === 'posts') {
                    loadUserPosts();
                }
            } else {
                // Jeśli zakładka nie ma treści, pokaż komunikat
                showNotification(`Zakładka "${this.textContent}" w przygotowaniu`, 'info');
            }
        });
    });

    // Obsługa przycisku "Edytuj profil"
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            openEditProfileModal();
        });
    }

    // Obsługa przycisków polubień
    const likeBtns = document.querySelectorAll('.stat-btn.like');
    likeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            
            const countSpan = this.querySelector('span');
            let count = parseInt(countSpan.textContent) || 0;
            
            if (this.classList.contains('active')) {
                count++;
            } else {
                count--;
            }
            
            countSpan.textContent = count;
        });
    });

    // Obsługa przycisków repost
    const repostBtns = document.querySelectorAll('.stat-btn.repost');
    repostBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            showNotification('Post udostępniony', 'success');
        });
    });

    // Obsługa przycisków follow - zintegrowane z systemem z main.js
    const profileFollowBtn = document.querySelector('.profile-actions .follow-btn');
    console.log('Profile follow button found:', profileFollowBtn);
    
    if (profileFollowBtn) {
        console.log('Initial button state:', {
            text: profileFollowBtn.textContent,
            hasFollowingClass: profileFollowBtn.classList.contains('following'),
            userId: profileFollowBtn.getAttribute('data-user-id')
        });
        
        profileFollowBtn.addEventListener('click', async function(e) {
            e.stopPropagation();
            
            // Pobierz świeże dane profilu
            const profileData = getProfileData();
            const userId = this.getAttribute('data-user-id') || (profileData ? profileData.userId : null);
            
            if (!userId) {
                console.error('Brak ID użytkownika do obserwowania');
                return;
            }
            
            const isFollowing = this.classList.contains('following');
            
            // Zapisz poprzedni stan dla rollback
            const hadFollowingClass = this.classList.contains('following');
            
            console.log('Follow button clicked:', { userId, isFollowing, hadFollowingClass });
            
            // Optymistyczna aktualizacja UI - użyj klas CSS zamiast inline styles
            if (isFollowing) {
                this.textContent = 'Obserwuj';
                this.classList.remove('following');
                console.log('Changed to: Obserwuj (removed following class)');
            } else {
                this.textContent = 'Obserwujesz';
                this.classList.add('following');
                console.log('Changed to: Obserwujesz (added following class)');
            }
            
            try {
                const response = await fetch('includes/follow_user.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `user_id=${userId}`
                });
                
                const data = await response.json();
                console.log('Follow response:', data);
                
                if (data.success) {
                    // Upewnij się, że stan przycisku odpowiada akcji z serwera
                    if (data.action === 'followed') {
                        this.textContent = 'Obserwujesz';
                        this.classList.add('following');
                        console.log('Server confirmed: followed');
                    } else {
                        this.textContent = 'Obserwuj';
                        this.classList.remove('following');
                        console.log('Server confirmed: unfollowed');
                    }
                    
                    // Aktualizuj licznik obserwujących
                    const followersCount = document.querySelector('.profile-stats .stat:last-child .stat-value');
                    console.log('Followers count element:', followersCount);
                    
                    if (followersCount) {
                        const currentText = followersCount.textContent;
                        let count = parseInt(currentText.replace(/[^\d]/g, '')) || 0;
                        console.log('Current followers count:', currentText, 'parsed to:', count);
                        
                        if (data.action === 'followed') {
                            count++;
                        } else {
                            count--;
                        }
                        
                        const newCount = formatNumber(count);
                        followersCount.textContent = newCount;
                        console.log('Updated followers count to:', newCount);
                    } else {
                        console.error('Followers count element not found!');
                    }
                } else {
                    // Rollback w przypadku błędu
                    if (hadFollowingClass) {
                        this.textContent = 'Obserwujesz';
                        this.classList.add('following');
                    } else {
                        this.textContent = 'Obserwuj';
                        this.classList.remove('following');
                    }
                    console.error('Follow error:', data.message);
                    if (data.error) {
                        console.error('Detailed error:', data.error);
                        console.error('Error code:', data.code);
                    }
                }
            } catch (error) {
                console.error('Follow exception:', error);
                // Rollback w przypadku błędu
                if (hadFollowingClass) {
                    this.textContent = 'Obserwujesz';
                    this.classList.add('following');
                } else {
                    this.textContent = 'Obserwuj';
                    this.classList.remove('following');
                }
            }
        });

        profileFollowBtn.addEventListener('mouseenter', function() {
            if (this.classList.contains('following')) {
                this.textContent = 'Przestań obserwować';
            }
        });

        profileFollowBtn.addEventListener('mouseleave', function() {
            if (this.textContent === 'Przestań obserwować') {
                this.textContent = 'Obserwujesz';
            }
        });
    }
    
    // Obsługa przycisków follow w sugerowanych użytkownikach
    const followBtns = document.querySelectorAll('.sidebar-right .follow-btn');
    followBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (this.textContent === 'Obserwuj') {
                this.textContent = 'Obserwujesz';
                this.style.backgroundColor = 'transparent';
                this.style.color = 'var(--text-primary)';
                this.style.border = '1px solid var(--bg-border)';
                showNotification('Obserwujesz użytkownika', 'success');
            } else {
                this.textContent = 'Obserwuj';
                this.style.backgroundColor = 'var(--text-primary)';
                this.style.color = 'var(--bg-primary)';
                this.style.border = 'none';
            }
        });

        btn.addEventListener('mouseenter', function() {
            if (this.textContent === 'Obserwujesz') {
                this.textContent = 'Przestań obserwować';
                this.style.backgroundColor = 'rgba(244, 33, 46, 0.1)';
                this.style.borderColor = 'rgba(244, 33, 46, 0.4)';
                this.style.color = '#F4212E';
            }
        });

        btn.addEventListener('mouseleave', function() {
            if (this.textContent === 'Przestań obserwować') {
                this.textContent = 'Obserwujesz';
                this.style.backgroundColor = 'transparent';
                this.style.borderColor = 'var(--bg-border)';
                this.style.color = 'var(--text-primary)';
            }
        });
    });

    // Obsługa statystyk profilu (obserwowani/obserwujący)
    const profileStats = document.querySelectorAll('.profile-stats .stat');
    profileStats.forEach(stat => {
        stat.addEventListener('click', function(e) {
            e.preventDefault();
            const label = this.querySelector('.stat-label').textContent;
            showNotification(`Lista: ${label}`, 'info');
        });
    });
});

// Funkcja otwierająca modal edycji profilu
function openEditProfileModal() {
    // Pobierz aktualne dane użytkownika z DOM
    const profileName = document.querySelector('.profile-name').childNodes[0].textContent.trim();
    const profileBio = document.querySelector('.profile-bio')?.textContent || '';
    const profileLocation = document.querySelector('.meta-item')?.textContent.replace('Dołączył(a):', '').trim() || '';
    
    // Pobierz dane z widocznych elementów profilu
    const fullName = document.querySelector('.profile-name').childNodes[0].textContent.trim();
    const bio = document.querySelector('.profile-bio')?.textContent || '';
    const bannerSrc = document.querySelector('.profile-banner img')?.src || '';
    const avatarSrc = document.querySelector('.profile-avatar')?.src || '';
    
    // Pobierz location i website z serwera
    fetchCurrentProfileData().then(userData => {
        createAndShowModal(userData);
    });
}

// Funkcja pobierająca aktualne dane profilu z serwera
async function fetchCurrentProfileData() {
    try {
        const response = await fetch('includes/api/get_current_user.php', {
            method: 'GET',
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error('Błąd pobierania danych');
        }
        
        const data = await response.json();
        
        if (data.success) {
            return data.user;
        } else {
            throw new Error(data.message || 'Błąd pobierania danych');
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
        // Zwróć dane z DOM jako fallback
        return {
            full_name: document.querySelector('.profile-name').childNodes[0].textContent.trim(),
            bio: document.querySelector('.profile-bio')?.textContent || '',
            location: '',
            website: '',
            profile_image: document.querySelector('.profile-avatar')?.src || '',
            banner_image: document.querySelector('.profile-banner img')?.src || ''
        };
    }
}

// Funkcja tworząca i pokazująca modal
function createAndShowModal(userData) {
    // Sprawdź czy modal już istnieje
    let modal = document.querySelector('.modal.edit-profile-modal');
    
    if (!modal) {
        // Utwórz modal
        modal = document.createElement('div');
        modal.className = 'modal edit-profile-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <button class="modal-close">
                        <svg viewBox="0 0 24 24"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg>
                    </button>
                    <h2 class="modal-title">Edytuj profil</h2>
                    <button class="modal-save">Zapisz</button>
                </div>
                <div class="modal-body">
                    <div class="edit-banner">
                        <img src="${userData.banner_image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22200%22 viewBox=%220 0 600 200%22%3E%3Crect width=%22600%22 height=%22200%22 fill=%22%231DA1F2%22/%3E%3C/svg%3E'}" alt="Banner">
                        <div class="edit-banner-overlay">
                            <button class="banner-upload-btn" title="Dodaj zdjęcie">
                                <svg viewBox="0 0 24 24"><g><path d="M9.697 3H11v2h-.697l-3 2H5c-.276 0-.5.224-.5.5v11c0 .276.224.5.5.5h14c.276 0 .5-.224.5-.5V10h2v8.5c0 1.381-1.119 2.5-2.5 2.5H5c-1.381 0-2.5-1.119-2.5-2.5v-11C2.5 6.119 3.619 5 5 5h1.697l3-2zM12 10.5c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zm-4 2c0-2.209 1.791-4 4-4s4 1.791 4 4-1.791 4-4 4-4-1.791-4-4zM17 2c0 1.657-1.343 3-3 3v1c1.657 0 3 1.343 3 3h1c0-1.657 1.343-3 3-3V5c-1.657 0-3-1.343-3-3h-1z"></path></g></svg>
                            </button>
                        </div>
                    </div>
                    <div class="edit-avatar-wrapper">
                        <img src="${userData.profile_image}" alt="Avatar" class="edit-avatar" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22 viewBox=%220 0 140 140%22%3E%3Crect width=%22140%22 height=%22140%22 fill=%22%23536471%22/%3E%3Cpath d=%22M70 35c-10 0-20 7.5-20 20s7.5 20 20 20 20-7.5 20-20-7.5-20-20-20zm0 56c-18 0-28 10-28 20h56c0-10-10-20-28-20z%22 fill=%22%23E7E9EA%22/%3E%3C/svg%3E'">
                        <div class="avatar-upload-overlay">
                            <button class="avatar-upload-btn" title="Dodaj zdjęcie">
                                <svg viewBox="0 0 24 24"><g><path d="M9.697 3H11v2h-.697l-3 2H5c-.276 0-.5.224-.5.5v11c0 .276.224.5.5.5h14c.276 0 .5-.224.5-.5V10h2v8.5c0 1.381-1.119 2.5-2.5 2.5H5c-1.381 0-2.5-1.119-2.5-2.5v-11C2.5 6.119 3.619 5 5 5h1.697l3-2zM12 10.5c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zm-4 2c0-2.209 1.791-4 4-4s4 1.791 4 4-1.791 4-4 4-4-1.791-4-4z"></path></g></svg>
                            </button>
                        </div>
                    </div>
                    <form class="edit-form">
                        <div class="form-group">
                            <input type="text" id="editName" value="${escapeHtml(userData.full_name)}" maxlength="50" required>
                            <label for="editName">Imię i nazwisko</label>
                        </div>
                        <div class="form-group">
                            <textarea id="editBio" maxlength="160">${escapeHtml(userData.bio || '')}</textarea>
                            <label for="editBio">Bio</label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="editLocation" value="${escapeHtml(userData.location || '')}" placeholder="np. Warszawa, Polska" maxlength="30">
                            <label for="editLocation">Lokalizacja</label>
                        </div>
                        <div class="form-group">
                            <input type="url" id="editWebsite" value="${escapeHtml(userData.website || '')}" placeholder="https://example.com" maxlength="100">
                            <label for="editWebsite">Strona internetowa</label>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Obsługa zamykania modala
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', function() {
            closeEditProfileModal();
        });
        
        // Zamknij modal po kliknięciu poza nim
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeEditProfileModal();
            }
        });
        
        // Obsługa zapisywania
        const saveBtn = modal.querySelector('.modal-save');
        saveBtn.addEventListener('click', function() {
            saveProfile();
        });
    } else {
        // Zaktualizuj istniejący modal
        modal.querySelector('#editName').value = userData.full_name;
        modal.querySelector('#editBio').value = userData.bio || '';
        modal.querySelector('#editLocation').value = userData.location || '';
        modal.querySelector('#editWebsite').value = userData.website || '';
        modal.querySelector('.edit-avatar').src = userData.profile_image;
        modal.querySelector('.edit-banner img').src = userData.banner_image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22200%22 viewBox=%220 0 600 200%22%3E%3Crect width=%22600%22 height=%22200%22 fill=%22%231DA1F2%22/%3E%3C/svg%3E';
    }
    
    modal.classList.add('active');
}

// Funkcja pomocnicza do escape'owania HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Funkcja zamykająca modal
function closeEditProfileModal() {
    const modal = document.querySelector('.modal.edit-profile-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Funkcja zapisująca profil
async function saveProfile() {
    const name = document.getElementById('editName').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    const location = document.getElementById('editLocation').value.trim();
    const website = document.getElementById('editWebsite').value.trim();
    
    // Walidacja
    if (!name) {
        showNotification('Imię i nazwisko jest wymagane', 'error');
        return;
    }
    
    if (name.length > 50) {
        showNotification('Imię i nazwisko może mieć maksymalnie 50 znaków', 'error');
        return;
    }
    
    if (bio.length > 160) {
        showNotification('Bio może mieć maksymalnie 160 znaków', 'error');
        return;
    }
    
    if (location.length > 30) {
        showNotification('Lokalizacja może mieć maksymalnie 30 znaków', 'error');
        return;
    }
    
    if (website.length > 100) {
        showNotification('Strona internetowa może mieć maksymalnie 100 znaków', 'error');
        return;
    }
    
    // Wyłącz przycisk zapisz
    const saveBtn = document.querySelector('.modal-save');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Zapisywanie...';
    
    try {
        const formData = new FormData();
        formData.append('full_name', name);
        formData.append('bio', bio);
        formData.append('location', location);
        formData.append('website', website);
        
        const response = await fetch('includes/update_profile.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Aktualizuj wyświetlane dane na stronie
            const profileNameElement = document.querySelector('.profile-name');
            const nameNode = profileNameElement.childNodes[0];
            if (nameNode.nodeType === Node.TEXT_NODE) {
                nameNode.textContent = name + '\n                    ';
            }
            
            // Aktualizuj bio
            let bioElement = document.querySelector('.profile-bio');
            if (bio) {
                if (!bioElement) {
                    // Utwórz element bio jeśli nie istnieje
                    bioElement = document.createElement('p');
                    bioElement.className = 'profile-bio';
                    document.querySelector('.profile-details').insertBefore(
                        bioElement,
                        document.querySelector('.profile-meta')
                    );
                }
                bioElement.textContent = bio;
            } else if (bioElement) {
                bioElement.remove();
            }
            
            showNotification('Profil został zaktualizowany!', 'success');
            closeEditProfileModal();
        } else {
            showNotification(data.message || 'Błąd podczas zapisywania', 'error');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showNotification('Wystąpił błąd podczas zapisywania', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }
}

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
const profileAnimationStyle = document.createElement('style');
profileAnimationStyle.textContent = `
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
document.head.appendChild(profileAnimationStyle);
