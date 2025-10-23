// Obsługa formularza nowego posta
document.addEventListener('DOMContentLoaded', function() {
    // Napraw problem z nieskończoną pętlą onerror dla obrazków
    document.querySelectorAll('img[onerror]').forEach(img => {
        img.removeAttribute('onerror');
        img.addEventListener('error', function() {
            if (!this.dataset.errorHandled) {
                this.dataset.errorHandled = 'true';
                // Zamiast ładować placeholder, ustaw data URL z prostym SVG
                this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23536471"/%3E%3Cpath d="M20 10c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 16c-4.4 0-8 3.6-8 8h16c0-4.4-3.6-8-8-8z" fill="%23E7E9EA"/%3E%3C/svg%3E';
            }
        });
    });

    // Zapobiegaj domyślnym akcjom dla linków z #
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
        });
    });

    // Obsługa zakładek "Dla Ciebie" / "Obserwowani"
    const feedTabs = document.querySelectorAll('.feed-tab');
    feedTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Usuń active ze wszystkich zakładek
            feedTabs.forEach(t => t.classList.remove('active'));
            // Dodaj active do klikniętej
            this.classList.add('active');
            
            const tabName = this.dataset.tab;
            if (tabName === 'following') {
                loadPosts(1, 'following');
            } else {
                loadPosts(1, 'for-you');
            }
        });
    });

    const textarea = document.querySelector('.post-form textarea');
    const postSubmitBtn = document.querySelector('.post-submit-btn');
    const mainPostButton = document.querySelector('.post-button');

    // Auto-resize textarea
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
            
            // Aktywuj/dezaktywuj przycisk Postuj
            if (this.value.trim().length > 0) {
                postSubmitBtn.style.opacity = '1';
                postSubmitBtn.disabled = false;
            } else {
                postSubmitBtn.style.opacity = '0.5';
                postSubmitBtn.disabled = true;
            }
        });

        // Inicjalne ustawienie przycisku
        postSubmitBtn.style.opacity = '0.5';
        postSubmitBtn.disabled = true;
    }

    // Obsługa wysyłania posta
    if (postSubmitBtn) {
        postSubmitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const content = textarea.value.trim();
            
            if (content.length === 0) {
                showNotification('Post nie może być pusty', 'error');
                return;
            }
            
            if (content.length > 280) {
                showNotification('Post może mieć maksymalnie 280 znaków', 'error');
                return;
            }
            
            // Wyłącz przycisk podczas wysyłania
            const originalText = postSubmitBtn.textContent;
            postSubmitBtn.disabled = true;
            postSubmitBtn.textContent = 'Publikowanie...';
            
            // Przygotuj dane
            const formData = new FormData();
            formData.append('content', content);
            
            // Wyślij do backendu
            fetch('includes/create_post.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Wyczyść formularz
                    textarea.value = '';
                    textarea.style.height = 'auto';
                    
                    // Dodaj post do feedu
                    addPostToFeed(data.post);
                    
                    // Komunikat sukcesu
                    showNotification('Post został opublikowany!', 'success');
                } else {
                    showNotification(data.message || 'Błąd podczas publikowania', 'error');
                }
                
                // Przywróć przycisk
                postSubmitBtn.disabled = false;
                postSubmitBtn.textContent = originalText;
                postSubmitBtn.style.opacity = '0.5';
            })
            .catch(error => {
                console.error('Błąd:', error);
                showNotification('Wystąpił błąd połączenia', 'error');
                postSubmitBtn.disabled = false;
                postSubmitBtn.textContent = originalText;
            });
        });
    }

    // Obsługa głównego przycisku "Postuj" w menu
    if (mainPostButton) {
        mainPostButton.addEventListener('click', function() {
            textarea.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Obsługa przycisków polubień (używamy event delegation dla dynamicznych postów)
    document.addEventListener('click', function(e) {
        const likeBtn = e.target.closest('.stat-btn.like');
        if (likeBtn) {
            e.stopPropagation();
            handleLikeClick(likeBtn);
        }
    });

    // Obsługa przycisków repost
    const repostBtns = document.querySelectorAll('.stat-btn.repost');
    repostBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            
            const countSpan = this.querySelector('span');
            let count = parseInt(countSpan.textContent) || 0;
            
            if (this.classList.contains('active')) {
                count++;
                showNotification('Post udostępniony', 'success');
            } else {
                count--;
            }
            
            countSpan.textContent = count;
        });
    });

    // Obsługa przycisków follow (event delegation) - ale NIE dla przycisku na profilu
    document.addEventListener('click', function(e) {
        const followBtn = e.target.closest('.follow-btn');
        // Ignoruj przyciski follow w .profile-actions (obsługiwane przez profile.js)
        if (followBtn && !followBtn.closest('.profile-actions')) {
            e.stopPropagation();
            handleFollowClick(followBtn);
        }
    });
    
    // Efekt hover dla przycisku "Obserwujesz" - ale NIE dla przycisku na profilu
    document.addEventListener('mouseover', function(e) {
        if (e.target && typeof e.target.closest === 'function') {
            const followBtn = e.target.closest('.follow-btn');
            // Ignoruj przyciski follow w .profile-actions (obsługiwane przez profile.js)
            if (followBtn && !followBtn.closest('.profile-actions') && followBtn.textContent.trim() === 'Obserwujesz') {
                followBtn.textContent = 'Przestań obserwować';
                followBtn.style.backgroundColor = 'rgba(244, 33, 46, 0.1)';
                followBtn.style.borderColor = 'rgba(244, 33, 46, 0.4)';
                followBtn.style.color = '#F4212E';
            }
        }
    }, true);

    document.addEventListener('mouseout', function(e) {
        if (e.target && typeof e.target.closest === 'function') {
            const followBtn = e.target.closest('.follow-btn');
            // Ignoruj przyciski follow w .profile-actions (obsługiwane przez profile.js)
            if (followBtn && !followBtn.closest('.profile-actions') && followBtn.textContent.trim() === 'Przestań obserwować') {
                followBtn.textContent = 'Obserwujesz';
                followBtn.style.backgroundColor = 'transparent';
                followBtn.style.borderColor = 'var(--bg-border)';
                followBtn.style.color = 'var(--text-primary)';
            }
        }
    }, true);

    // Obsługa kliknięcia na post (przejście do szczegółów)
    const posts = document.querySelectorAll('.post');
    posts.forEach(post => {
        post.addEventListener('click', function(e) {
            // Ignoruj kliknięcia na przyciski i linki do profilu
            if (e.target.closest('.stat-btn') || 
                e.target.closest('.post-more') || 
                e.target.closest('.post-avatar-link') ||
                e.target.closest('.author-name-link') ||
                e.target.closest('.author-username-link')) {
                return;
            }
            console.log('Otwieranie szczegółów posta');
            // Tutaj będzie nawigacja do szczegółów posta
        });
    });

    // Obsługa przycisku więcej opcji posta
    const postMoreBtns = document.querySelectorAll('.post-more');
    postMoreBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            showNotification('Menu opcji posta', 'info');
        });
    });

    // Obsługa wyszukiwarki
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            console.log('Wyszukiwanie:', this.value);
            // Tutaj będzie logika wyszukiwania
        });
    }

    // Obsługa elementów trending
    const trendingItems = document.querySelectorAll('.trending-item');
    trendingItems.forEach(item => {
        item.addEventListener('click', function() {
            const topic = this.querySelector('.trending-topic').textContent;
            console.log('Kliknięto w trend:', topic);
            showNotification(`Przeglądanie: ${topic}`, 'info');
        });
    });

    // Licznik znaków
    if (textarea) {
        const charCounter = document.createElement('div');
        charCounter.className = 'char-counter';
        charCounter.style.cssText = 'color: var(--text-secondary); font-size: 13px; margin-right: 12px; margin-left: auto;';
        
        // Dodaj licznik do post-actions, przed przyciskiem
        const postActions = document.querySelector('.post-actions');
        if (postActions) {
            postActions.insertBefore(charCounter, postSubmitBtn);
        }

        textarea.addEventListener('input', function() {
            const count = this.value.length;
            charCounter.textContent = count > 0 ? `${count}/280` : '';
            
            if (count > 280) {
                charCounter.style.color = 'var(--accent-red)';
                postSubmitBtn.disabled = true;
                postSubmitBtn.style.opacity = '0.5';
            } else if (count > 260) {
                charCounter.style.color = '#FFD400';
            } else {
                charCounter.style.color = 'var(--text-secondary)';
            }
        });
    }
    
    // Załaduj posty z bazy danych tylko na stronie głównej (nie na profilach)
    const isProfilePage = !!document.getElementById('profile-data');
    if (!isProfilePage) {
        loadPosts();
    }
});

// Funkcja do dodawania posta do feedu
function addPostToFeed(post) {
    const feed = document.querySelector('.feed');
    if (!feed) return;
    
    const postElement = createPostElement(post);
    
    // Dodaj na początek feedu (po formularzu nowego posta)
    const firstPost = feed.querySelector('.post');
    if (firstPost) {
        feed.insertBefore(postElement, firstPost);
    } else {
        feed.appendChild(postElement);
    }
    
    // Animacja pojawienia
    postElement.style.opacity = '0';
    postElement.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        postElement.style.transition = 'all 0.3s ease';
        postElement.style.opacity = '1';
        postElement.style.transform = 'translateY(0)';
    }, 10);
}

// Funkcja do tworzenia elementu posta
function createPostElement(post) {
    const postDiv = document.createElement('article');
    postDiv.className = 'post';
    postDiv.dataset.postId = post.id;
    
    // Konwertuj is_liked i is_reposted na boolean (mogą być stringi "0"/"1")
    const isLiked = post.is_liked == 1 || post.is_liked === true;
    const isReposted = post.is_reposted == 1 || post.is_reposted === true;
    
    const verifiedBadge = post.verified ? `
        <svg viewBox="0 0 22 22" class="verified-badge">
            <g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g>
        </svg>
    ` : '';
    
    postDiv.innerHTML = `
        <a href="profile.php?user=${post.username}" class="post-avatar-link">
            <img src="${post.profile_image}" alt="Avatar" class="post-avatar" onerror="this.src='https://via.placeholder.com/40'">
        </a>
        <div class="post-content">
            <div class="post-header">
                <div class="post-author">
                    <a href="profile.php?user=${post.username}" class="author-name-link">
                        <span class="author-name">${post.full_name}</span>
                        ${verifiedBadge}
                    </a>
                    <a href="profile.php?user=${post.username}" class="author-username-link">
                        <span class="author-username">@${post.username}</span>
                    </a>
                    <span class="post-dot">·</span>
                    <span class="post-time">${post.time_ago || 'Teraz'}</span>
                </div>
                <button class="post-more">
                    <svg viewBox="0 0 24 24">
                        <g><circle cx="5" cy="12" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle></g>
                    </svg>
                </button>
            </div>
            <div class="post-text">${escapeHtml(post.content)}</div>
            <div class="post-stats">
                <button class="stat-btn reply-btn" data-post-id="${post.id}">
                    <svg viewBox="0 0 24 24" class="stat-icon">
                        <g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g>
                    </svg>
                    <span class="replies-count">${post.replies_count || 0}</span>
                </button>
                <button class="stat-btn repost ${isReposted ? 'active' : ''}" data-post-id="${post.id}">
                    <svg viewBox="0 0 24 24" class="stat-icon">
                        <g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g>
                    </svg>
                    <span>${post.reposts_count || 0}</span>
                </button>
                <button class="stat-btn like ${isLiked ? 'active' : ''}" data-post-id="${post.id}">
                    <svg viewBox="0 0 24 24" class="stat-icon">
                        <g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g>
                    </svg>
                    <span>${post.likes_count || 0}</span>
                </button>
                <button class="stat-btn">
                    <svg viewBox="0 0 24 24" class="stat-icon">
                        <g><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></g>
                    </svg>
                    <span></span>
                </button>
            </div>
            <div class="replies-section" style="display: none;">
                <div class="replies-list"></div>
            </div>
        </div>
    `;
    
    return postDiv;
}

// Funkcja do escapowania HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Funkcja do ładowania postów
function loadPosts(page = 1, feedType = 'for-you') {
    const formData = new FormData();
    formData.append('filter', feedType === 'following' ? 'following' : 'all');
    formData.append('page', page);
    
    fetch('includes/api/get_posts.php', {
        method: 'POST',
        body: formData,
        cache: 'no-store'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const feed = document.querySelector('.feed');
                if (!feed) return;
                
                // Wyczyść feed jeśli to pierwsza strona
                if (page === 1) {
                    const existingPosts = feed.querySelectorAll('.post');
                    existingPosts.forEach(post => post.remove());
                }
                
                // Dodaj posty
                data.posts.forEach(post => {
                    const postElement = createPostElement(post);
                    feed.appendChild(postElement);
                });
                
                if (data.posts.length === 0 && page === 1) {
                    const message = feedType === 'following' 
                        ? 'Brak postów od obserwowanych użytkowników. Zacznij obserwować więcej osób!'
                        : 'Brak postów. Napisz coś jako pierwszy!';
                    feed.innerHTML = `<div class="no-posts" style="text-align: center; padding: 40px; color: #71767B;">${message}</div>`;
                }
            }
        })
        .catch(error => {
            console.error('Błąd ładowania postów:', error);
        });
}

// Funkcja do obsługi polubienia posta
function handleLikeClick(likeBtn) {
    const postId = likeBtn.dataset.postId;
    
    if (!postId) {
        console.error('Brak ID posta');
        return;
    }
    
    // Zablokuj przycisk podczas przetwarzania (użyj atrybutu data zamiast disabled)
    if (likeBtn.dataset.processing === 'true') {
        console.log('Przetwarzanie w toku, ignoruję kliknięcie');
        return;
    }
    likeBtn.dataset.processing = 'true';
    
    const countSpan = likeBtn.querySelector('span');
    const wasActive = likeBtn.classList.contains('active');
    const currentCount = parseInt(countSpan.textContent) || 0;
    
    console.log(`Like click - Post ID: ${postId}, Was active: ${wasActive}, Current count: ${currentCount}`);
    
    // Optymistyczna aktualizacja UI
    likeBtn.classList.toggle('active');
    countSpan.textContent = wasActive ? currentCount - 1 : currentCount + 1;
    
    // Wyślij request do backendu
    const formData = new FormData();
    formData.append('post_id', postId);
    
    fetch('includes/like_post.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Like response:', data);
        
        if (data.success) {
            // Zaktualizuj licznik z prawdziwymi danymi z serwera
            countSpan.textContent = data.likes_count;
            
            // Upewnij się że stan przycisku odpowiada akcji z serwera
            if (data.action === 'liked') {
                likeBtn.classList.add('active');
            } else {
                likeBtn.classList.remove('active');
            }
        } else {
            console.error('Like error:', data.message);
            if (data.error) {
                console.error('Detailed error:', data.error);
            }
            // Cofnij optymistyczną aktualizację w razie błędu
            if (wasActive) {
                likeBtn.classList.add('active');
            } else {
                likeBtn.classList.remove('active');
            }
            countSpan.textContent = currentCount;
        }
    })
    .catch(error => {
        console.error('Błąd połączenia:', error);
        // Cofnij optymistyczną aktualizację
        if (wasActive) {
            likeBtn.classList.add('active');
        } else {
            likeBtn.classList.remove('active');
        }
        countSpan.textContent = currentCount;
    })
    .finally(() => {
        // Odblokuj przycisk po zakończeniu
        likeBtn.dataset.processing = 'false';
        console.log('Like processing finished');
    });
}

// Funkcja do obsługi obserwowania użytkownika
function handleFollowClick(followBtn) {
    const userId = followBtn.dataset.userId;
    
    if (!userId) {
        console.error('Brak ID użytkownika');
        return;
    }
    
    // Zablokuj przycisk podczas przetwarzania
    if (followBtn.dataset.processing === 'true') {
        console.log('Przetwarzanie w toku, ignoruję kliknięcie');
        return;
    }
    followBtn.dataset.processing = 'true';
    
    const originalText = followBtn.textContent.trim();
    const wasFollowing = originalText === 'Obserwujesz' || originalText === 'Przestań obserwować';
    const originalBgColor = followBtn.style.backgroundColor;
    const originalColor = followBtn.style.color;
    const originalBorder = followBtn.style.border;
    
    // Optymistyczna aktualizacja UI
    if (wasFollowing) {
        followBtn.textContent = 'Obserwuj';
        followBtn.style.backgroundColor = 'var(--text-primary)';
        followBtn.style.color = 'var(--bg-primary)';
        followBtn.style.border = 'none';
    } else {
        followBtn.textContent = 'Obserwujesz';
        followBtn.style.backgroundColor = 'transparent';
        followBtn.style.color = 'var(--text-primary)';
        followBtn.style.border = '1px solid var(--bg-border)';
    }
    
    // Wyślij request do backendu
    const formData = new FormData();
    formData.append('user_id', userId);
    
    fetch('includes/follow_user.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Zaktualizuj stan przycisku zgodnie z akcją z serwera
            if (data.action === 'followed') {
                followBtn.textContent = 'Obserwujesz';
                followBtn.style.backgroundColor = 'transparent';
                followBtn.style.color = 'var(--text-primary)';
                followBtn.style.border = '1px solid var(--bg-border)';
            } else {
                followBtn.textContent = 'Obserwuj';
                followBtn.style.backgroundColor = 'var(--text-primary)';
                followBtn.style.color = 'var(--bg-primary)';
                followBtn.style.border = 'none';
            }
        } else {
            // Cofnij optymistyczną aktualizację w razie błędu
            followBtn.textContent = originalText;
            followBtn.style.backgroundColor = originalBgColor;
            followBtn.style.color = originalColor;
            followBtn.style.border = originalBorder;
            console.error('Błąd:', data.message);
        }
    })
    .catch(error => {
        console.error('Błąd połączenia:', error);
        // Cofnij optymistyczną aktualizację
        followBtn.textContent = originalText;
        followBtn.style.backgroundColor = originalBgColor;
        followBtn.style.color = originalColor;
        followBtn.style.border = originalBorder;
    })
    .finally(() => {
        followBtn.dataset.processing = 'false';
    });
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

    .stat-btn.repost.active {
        color: #00BA7C;
    }

    .stat-btn.repost.active .stat-icon {
        fill: #00BA7C;
    }
`;
document.head.appendChild(style);

// ===== FUNKCJE OBSŁUGI MENU KONTEKSTOWEGO POSTÓW =====

// Obsługa kliknięcia przycisku "więcej" (trzy kropki)
document.addEventListener('click', function(e) {
    const moreBtn = e.target.closest('.post-more');
    if (moreBtn) {
        e.stopPropagation();
        const post = moreBtn.closest('.post');
        const postId = post.dataset.postId;
        
        // Pobierz ID aktualnego użytkownika z #profile-data lub użyj globalnej zmiennej
        const profileData = document.getElementById('profile-data');
        const currentUserId = profileData ? parseInt(profileData.dataset.userId) : null;
        
        // Sprawdź czy post należy do użytkownika (porównaj z data-user-id posta jeśli istnieje)
        const postAuthorUsername = post.querySelector('.author-username').textContent.replace('@', '');
        const currentUserUsername = profileData ? profileData.dataset.username : null;
        const isOwnPost = postAuthorUsername === currentUserUsername;
        
        showPostMenu(moreBtn, postId, post, isOwnPost);
    }
});

// Zamknij menu po kliknięciu poza nim
document.addEventListener('click', function(e) {
    if (!e.target.closest('.post-menu') && !e.target.closest('.post-more')) {
        const existingMenu = document.querySelector('.post-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    }
});

// Funkcja wyświetlająca menu kontekstowe
function showPostMenu(button, postId, postElement, isOwnPost) {
    // Usuń istniejące menu
    const existingMenu = document.querySelector('.post-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Utwórz menu
    const menu = document.createElement('div');
    menu.className = 'post-menu';
    
    if (isOwnPost) {
        // Menu dla własnych postów
        menu.innerHTML = `
            <button class="menu-item edit-post" data-post-id="${postId}">
                <svg viewBox="0 0 24 24" class="menu-icon">
                    <g><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></g>
                </svg>
                Edytuj
            </button>
            <button class="menu-item delete-post" data-post-id="${postId}">
                <svg viewBox="0 0 24 24" class="menu-icon" style="fill: #F4212E;">
                    <g><path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07z"></path></g>
                </svg>
                Usuń
            </button>
        `;
    } else {
        // Menu dla obcych postów
        menu.innerHTML = `
            <button class="menu-item report-post" data-post-id="${postId}">
                <svg viewBox="0 0 24 24" class="menu-icon" style="fill: #F4212E;">
                    <g><path d="M3 2l18 20-1.4 1.4L17.4 21H3V2zm0 17h12.4L4 7.6V19zM21 2v15l-2-2V4H7.6L5.6 2H21z"></path></g>
                </svg>
                Zgłoś
            </button>
        `;
    }
    
    // Pozycjonowanie menu
    document.body.appendChild(menu);
    const rect = button.getBoundingClientRect();
    
    // Lepsze pozycjonowanie menu (obok przycisku, nie przy prawej krawędzi)
    const scrollY = window.scrollY || window.pageYOffset;
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 5 + scrollY}px`;
    menu.style.right = '';
    
    // Obsługa kliknięć w menu
    menu.addEventListener('click', function(e) {
        const item = e.target.closest('.menu-item');
        if (!item) return;
        
        if (item.classList.contains('edit-post')) {
            editPost(postId, postElement);
        } else if (item.classList.contains('delete-post')) {
            deletePost(postId, postElement);
        } else if (item.classList.contains('report-post')) {
            reportPost(postId);
        }
        
        menu.remove();
    });
}

// Funkcja edycji posta
function editPost(postId, postElement) {
    const postText = postElement.querySelector('.post-text');
    const currentContent = postText.textContent;
    
    // Utwórz modal edycji
    const modal = document.createElement('div');
    modal.className = 'modal edit-post-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <button class="modal-close">
                    <svg viewBox="0 0 24 24"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg>
                </button>
                <h2>Edytuj post</h2>
            </div>
            <div class="modal-body" style="padding: 16px;">
                <textarea class="edit-post-textarea" maxlength="280" style="width: 100%; min-height: 120px; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--bg-border); border-radius: 8px; color: var(--text-primary); font-size: 17px; font-family: inherit; resize: vertical;">${escapeHtml(currentContent)}</textarea>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                    <span class="char-counter" style="color: var(--text-secondary); font-size: 13px;">${currentContent.length}/280</span>
                    <button class="save-edit-btn" style="background-color: var(--accent-blue); color: white; border: none; border-radius: 20px; padding: 10px 24px; font-size: 15px; font-weight: 700; cursor: pointer;">Zapisz</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('active');
    
    const textarea = modal.querySelector('.edit-post-textarea');
    const charCounter = modal.querySelector('.char-counter');
    const saveBtn = modal.querySelector('.save-edit-btn');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Auto focus
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    
    // Licznik znaków
    textarea.addEventListener('input', function() {
        const length = this.value.length;
        charCounter.textContent = `${length}/280`;
        
        if (length > 280) {
            charCounter.style.color = '#F4212E';
            saveBtn.disabled = true;
        } else if (length > 260) {
            charCounter.style.color = '#FFD400';
            saveBtn.disabled = false;
        } else {
            charCounter.style.color = 'var(--text-secondary)';
            saveBtn.disabled = false;
        }
    });
    
    // Zapisz zmiany
    saveBtn.addEventListener('click', async function() {
        const newContent = textarea.value.trim();
        
        if (!newContent) {
            showNotification('Post nie może być pusty', 'error');
            return;
        }
        
        if (newContent.length > 280) {
            showNotification('Post może mieć maksymalnie 280 znaków', 'error');
            return;
        }
        
        saveBtn.disabled = true;
        saveBtn.textContent = 'Zapisywanie...';
        
        try {
            const formData = new FormData();
            formData.append('post_id', postId);
            formData.append('content', newContent);
            
            const response = await fetch('includes/edit_post.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                postText.textContent = newContent;
                showNotification('Post zaktualizowany!', 'success');
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            } else {
                showNotification(data.message || 'Błąd podczas edycji', 'error');
                saveBtn.disabled = false;
                saveBtn.textContent = 'Zapisz';
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Wystąpił błąd', 'error');
            saveBtn.disabled = false;
            saveBtn.textContent = 'Zapisz';
        }
    });
    
    // Zamknij modal
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    });
}

// Funkcja usuwania posta
function deletePost(postId, postElement) {
    // Potwierdzenie usunięcia
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal confirm-modal';
    confirmModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header" style="border-bottom: 1px solid var(--bg-border);">
                <h2 style="font-size: 20px; font-weight: 700;">Usuń post?</h2>
            </div>
            <div class="modal-body" style="padding: 20px;">
                <p style="color: var(--text-secondary); margin-bottom: 24px;">Tej operacji nie można cofnąć. Post zostanie trwale usunięty.</p>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button class="confirm-delete-btn" style="background-color: #F4212E; color: white; border: none; border-radius: 20px; padding: 12px 24px; font-size: 15px; font-weight: 700; cursor: pointer; width: 100%;">Usuń</button>
                    <button class="cancel-delete-btn" style="background-color: transparent; color: var(--text-primary); border: 1px solid var(--bg-border); border-radius: 20px; padding: 12px 24px; font-size: 15px; font-weight: 700; cursor: pointer; width: 100%;">Anuluj</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    confirmModal.classList.add('active');
    
    const confirmBtn = confirmModal.querySelector('.confirm-delete-btn');
    const cancelBtn = confirmModal.querySelector('.cancel-delete-btn');
    
    confirmBtn.addEventListener('click', async function() {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Usuwanie...';
        
        try {
            const formData = new FormData();
            formData.append('post_id', postId);
            
            const response = await fetch('includes/delete_post.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Animacja usuwania
                postElement.style.transition = 'opacity 0.3s, transform 0.3s';
                postElement.style.opacity = '0';
                postElement.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    postElement.remove();
                }, 300);
                
                showNotification('Post usunięty', 'success');
                confirmModal.classList.remove('active');
                setTimeout(() => confirmModal.remove(), 300);
            } else {
                showNotification(data.message || 'Błąd podczas usuwania', 'error');
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Usuń';
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Wystąpił błąd', 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Usuń';
        }
    });
    
    cancelBtn.addEventListener('click', function() {
        confirmModal.classList.remove('active');
        setTimeout(() => confirmModal.remove(), 300);
    });
    
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            confirmModal.classList.remove('active');
            setTimeout(() => confirmModal.remove(), 300);
        }
    });
}

// Funkcja zgłaszania posta
function reportPost(postId) {
    showNotification('Funkcja zgłaszania zostanie wkrótce dodana', 'info');
}

// ===== FUNKCJE OBSŁUGI ODPOWIEDZI =====

// Obsługa kliknięcia przycisku odpowiedzi
document.addEventListener('click', function(e) {
    if (e.target.closest('.reply-btn')) {
        const btn = e.target.closest('.reply-btn');
        const postId = btn.dataset.postId;
        const post = btn.closest('.post');
        openReplyModal(postId, post);
    }
});

// Funkcja otwierająca modal odpowiedzi
function openReplyModal(postId, postElement) {
    // Sprawdź czy modal już istnieje
    let modal = document.querySelector('.reply-modal');
    
    if (modal) {
        modal.remove();
    }
    
    // Utwórz modal
    modal = document.createElement('div');
    modal.className = 'modal reply-modal';
    
    // Pobierz dane autora posta z elementu DOM
    const authorName = postElement.querySelector('.author-name').textContent;
    const authorUsername = postElement.querySelector('.author-username').textContent;
    const postContent = postElement.querySelector('.post-text').textContent;
    const postAvatar = postElement.querySelector('.post-avatar').src;
    
    modal.innerHTML = `
        <div class="modal-content reply-modal-content">
            <div class="modal-header">
                <button class="modal-close">
                    <svg viewBox="0 0 24 24"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg>
                </button>
                <h2>Odpowiedzi</h2>
            </div>
            <div class="modal-body reply-modal-body">
                <!-- Oryginalny post -->
                <div class="original-post-preview">
                    <img src="${postAvatar}" alt="Avatar" class="preview-avatar" onerror="this.src='https://via.placeholder.com/40'">
                    <div class="preview-details">
                        <div class="preview-author">
                            <span class="preview-name">${authorName}</span>
                            <span class="preview-username">${authorUsername}</span>
                        </div>
                        <div class="preview-content">${escapeHtml(postContent)}</div>
                    </div>
                </div>
                
                <!-- Formularz odpowiedzi -->
                <div class="reply-form-container">
                    <textarea class="reply-textarea" placeholder="Napisz swoją odpowiedź..." maxlength="280"></textarea>
                    <div class="reply-form-footer">
                        <div class="char-counter-reply"></div>
                        <button class="reply-submit-btn" disabled>Odpowiedz</button>
                    </div>
                </div>
                
                <!-- Lista odpowiedzi -->
                <div class="replies-list-container">
                    <div class="replies-list-header">
                        <h3>Wszystkie odpowiedzi</h3>
                    </div>
                    <div class="replies-list">
                        <div class="loading-replies">Ładowanie odpowiedzi...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Obsługa zamykania modala
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });
    
    // Zamknij modal klikając poza nim
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    });
    
    // Obsługa licznika znaków
    const textarea = modal.querySelector('.reply-textarea');
    const charCounter = modal.querySelector('.char-counter-reply');
    const submitBtn = modal.querySelector('.reply-submit-btn');
    
    textarea.addEventListener('input', function() {
        const count = this.value.length;
        charCounter.textContent = count > 0 ? `${count}/280` : '';
        
        // Włącz/wyłącz przycisk
        submitBtn.disabled = count === 0 || count > 280;
        
        if (count > 280) {
            charCounter.style.color = 'var(--accent-red)';
        } else if (count > 260) {
            charCounter.style.color = '#FFD400';
        } else {
            charCounter.style.color = 'var(--text-secondary)';
        }
        
        // Auto-resize
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    });
    
    // Obsługa wysyłania odpowiedzi
    submitBtn.addEventListener('click', () => {
        submitReply(postId, textarea.value, modal, postElement);
    });
    
    // Zapisz postId w modalu
    modal.dataset.postId = postId;
    
    // Pokaż modal
    modal.classList.add('active');
    
    // Załaduj istniejące odpowiedzi
    loadRepliesInModal(postId, modal);
    
    // Autofocus na textarea
    setTimeout(() => {
        modal.querySelector('.reply-textarea').focus();
    }, 100);
}

// Funkcja wysyłająca odpowiedź
function submitReply(postId, content, modal, postElement) {
    const submitBtn = modal.querySelector('.reply-submit-btn');
    const textarea = modal.querySelector('.reply-textarea');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wysyłanie...';
    
    const formData = new FormData();
    formData.append('post_id', postId);
    formData.append('content', content);
    
    fetch('includes/create_reply.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Wyczyść textarea
            textarea.value = '';
            textarea.style.height = 'auto';
            
            // Zaktualizuj licznik odpowiedzi w poście
            const repliesCountSpan = postElement.querySelector('.replies-count');
            if (repliesCountSpan) {
                const currentCount = parseInt(repliesCountSpan.textContent) || 0;
                repliesCountSpan.textContent = currentCount + 1;
            }
            
            // Pokaż powiadomienie
            showNotification('Odpowiedź dodana!', 'success');
            
            // Odśwież listę odpowiedzi w modalu
            loadRepliesInModal(postId, modal);
            
            // Resetuj przycisk
            submitBtn.disabled = true;
            submitBtn.textContent = originalText;
            
            // Wyczyść licznik
            const charCounter = modal.querySelector('.char-counter-reply');
            if (charCounter) {
                charCounter.textContent = '';
            }
        } else {
            showNotification(data.message || 'Nie udało się dodać odpowiedzi', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    })
    .catch(error => {
        console.error('Błąd:', error);
        showNotification('Wystąpił błąd', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

// Funkcja ładująca odpowiedzi w modalu
function loadRepliesInModal(postId, modal) {
    const repliesList = modal.querySelector('.replies-list');
    
    if (!repliesList) return;
    
    repliesList.innerHTML = '<div class="loading-replies">Ładowanie odpowiedzi...</div>';
    
    const formData = new FormData();
    formData.append('post_id', postId);
    formData.append('page', 1);
    
    fetch('includes/api/get_replies.php', {
        method: 'POST',
        body: formData,
        cache: 'no-store'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            repliesList.innerHTML = '';
            
            if (data.replies.length === 0) {
                repliesList.innerHTML = '<div class="no-replies">Brak odpowiedzi. Bądź pierwszą osobą!</div>';
            } else {
                data.replies.forEach(reply => {
                    const replyElement = createReplyElement(reply);
                    repliesList.appendChild(replyElement);
                });
            }
        } else {
            repliesList.innerHTML = '<div class="error-replies">Błąd ładowania odpowiedzi</div>';
        }
    })
    .catch(error => {
        console.error('Błąd:', error);
        repliesList.innerHTML = '<div class="error-replies">Wystąpił błąd</div>';
    });
}

// Funkcja ładująca odpowiedzi dla posta
function loadReplies(postId, postElement) {
    const repliesSection = postElement.querySelector('.replies-section');
    const repliesList = postElement.querySelector('.replies-list');
    
    if (!repliesSection || !repliesList) return;
    
    repliesList.innerHTML = '<div class="loading-replies">Ładowanie odpowiedzi...</div>';
    repliesSection.style.display = 'block';
    
    const formData = new FormData();
    formData.append('post_id', postId);
    formData.append('page', 1);
    
    fetch('includes/api/get_replies.php', {
        method: 'POST',
        body: formData,
        cache: 'no-store'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            repliesList.innerHTML = '';
            
            if (data.replies.length === 0) {
                repliesList.innerHTML = '<div class="no-replies">Brak odpowiedzi</div>';
            } else {
                data.replies.forEach(reply => {
                    const replyElement = createReplyElement(reply);
                    repliesList.appendChild(replyElement);
                });
            }
        } else {
            repliesList.innerHTML = '<div class="error-replies">Błąd ładowania odpowiedzi</div>';
        }
    })
    .catch(error => {
        console.error('Błąd:', error);
        repliesList.innerHTML = '<div class="error-replies">Wystąpił błąd</div>';
    });
}

// Funkcja tworząca element odpowiedzi
function createReplyElement(reply) {
    const replyDiv = document.createElement('div');
    replyDiv.className = 'reply';
    replyDiv.dataset.replyId = reply.id;
    
    const verifiedBadge = reply.verified ? `
        <svg viewBox="0 0 22 22" class="verified-badge">
            <g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g>
        </svg>
    ` : '';
    
    // Formatuj czas
    const timeAgo = formatTimeAgo(reply.created_at);
    
    replyDiv.innerHTML = `
        <a href="profile.php?user=${reply.username}" class="reply-avatar-link">
            <img src="${reply.profile_image}" alt="Avatar" class="reply-avatar" onerror="this.src='https://via.placeholder.com/32'">
        </a>
        <div class="reply-content">
            <div class="reply-header">
                <a href="profile.php?user=${reply.username}" class="reply-author-name">
                    ${reply.full_name}
                    ${verifiedBadge}
                </a>
                <a href="profile.php?user=${reply.username}" class="reply-author-username">
                    @${reply.username}
                </a>
                <span class="reply-dot">·</span>
                <span class="reply-time">${timeAgo}</span>
            </div>
            <div class="reply-text">${escapeHtml(reply.content)}</div>
        </div>
    `;
    
    return replyDiv;
}

// Funkcja formatująca czas (prostsza wersja)
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Teraz';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd';
    
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}

