// ===== INTERACTIONS MODULE =====

/**
 * Handle like button click
 */
function handleLikeClick(likeBtn) {
    const postId = likeBtn.dataset.postId;
    
    if (!postId) {
        console.error('Brak ID posta');
        return;
    }
    
    // Zablokuj przycisk podczas przetwarzania
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

/**
 * Handle follow button click
 */
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

/**
 * Setup follow button hover effects
 */
function setupFollowButtonHover(followBtn) {
    followBtn.addEventListener('mouseenter', function() {
        if (this.textContent.trim() === 'Obserwujesz') {
            this.textContent = 'Przestań obserwować';
            this.style.backgroundColor = 'rgba(244, 33, 46, 0.1)';
            this.style.borderColor = 'rgba(244, 33, 46, 0.4)';
            this.style.color = '#F4212E';
        }
    });

    followBtn.addEventListener('mouseleave', function() {
        if (this.textContent === 'Przestań obserwować') {
            this.textContent = 'Obserwujesz';
            this.style.backgroundColor = 'transparent';
            this.style.borderColor = 'var(--bg-border)';
            this.style.color = 'var(--text-primary)';
        }
    });
}

/**
 * Initialize interaction handlers
 */
function initInteractionHandlers() {
    // Like buttons - użyj event delegation
    document.addEventListener('click', function(e) {
        const likeBtn = e.target.closest('.stat-btn.like');
        if (likeBtn) {
            e.stopPropagation();
            handleLikeClick(likeBtn);
        }
    });

    // Follow buttons - użyj event delegation (ale nie dla profilu)
    document.addEventListener('click', function(e) {
        const followBtn = e.target.closest('.follow-btn');
        if (followBtn && !followBtn.closest('.profile-actions')) {
            e.stopPropagation();
            handleFollowClick(followBtn);
        }
    });
    
    // Hover effects dla follow buttons
    document.addEventListener('mouseover', function(e) {
        if (e.target && typeof e.target.closest === 'function') {
            const followBtn = e.target.closest('.follow-btn');
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
            if (followBtn && !followBtn.closest('.profile-actions') && followBtn.textContent.trim() === 'Przestań obserwować') {
                followBtn.textContent = 'Obserwujesz';
                followBtn.style.backgroundColor = 'transparent';
                followBtn.style.borderColor = 'var(--bg-border)';
                followBtn.style.color = 'var(--text-primary)';
            }
        }
    }, true);
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleLikeClick,
        handleFollowClick,
        setupFollowButtonHover,
        initInteractionHandlers
    };
}