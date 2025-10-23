// ===== MAIN.JS - Entry Point =====
// Import all modules (note: browser doesn't support ES6 modules by default, so we rely on script order)

document.addEventListener('DOMContentLoaded', function() {
    console.log('Platforma Y - Inicjalizacja...');
    
    // Fix image errors
    fixImageErrors();
    
    // Prevent default for hash links
    preventDefaultHashLinks();
    
    // Initialize all modules
    initFeedTabs();
    initNewPostForm();
    initInteractionHandlers();
    initPostMenuHandlers();
    initReplyHandlers();
    
    // Load posts only on main page (not profile)
    const isProfilePage = !!document.getElementById('profile-data');
    if (!isProfilePage) {
        loadPosts();
    }
    
    console.log('Platforma Y - Gotowa!');
});

/**
 * Initialize feed tabs (Dla Ciebie / Obserwowani)
 */
function initFeedTabs() {
    const feedTabs = document.querySelectorAll('.feed-tab');
    if (!feedTabs.length) return;
    
    feedTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            feedTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const tabName = this.dataset.tab;
            if (tabName === 'following') {
                loadPosts(1, 'following');
            } else {
                loadPosts(1, 'for-you');
            }
        });
    });
}

/**
 * Initialize new post form
 */
function initNewPostForm() {
    const textarea = document.querySelector('.post-form textarea');
    const postSubmitBtn = document.querySelector('.post-submit-btn');
    const mainPostButton = document.querySelector('.post-button');

    if (!textarea || !postSubmitBtn) return;

    // Auto-resize textarea
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
        
        // Enable/disable submit button
        if (this.value.trim().length > 0) {
            postSubmitBtn.style.opacity = '1';
            postSubmitBtn.disabled = false;
        } else {
            postSubmitBtn.style.opacity = '0.5';
            postSubmitBtn.disabled = true;
        }
    });

    // Initialize button state
    postSubmitBtn.style.opacity = '0.5';
    postSubmitBtn.disabled = true;

    // Handle post submission
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
        
        const originalText = postSubmitBtn.textContent;
        postSubmitBtn.disabled = true;
        postSubmitBtn.textContent = 'Publikowanie...';
        
        const formData = new FormData();
        formData.append('content', content);
        
        fetch('includes/create_post.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                textarea.value = '';
                textarea.style.height = 'auto';
                
                addPostToFeed(data.post);
                
                showNotification('Post został opublikowany!', 'success');
            } else {
                showNotification(data.message || 'Błąd podczas publikowania', 'error');
            }
            
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

    // Main post button in sidebar
    if (mainPostButton) {
        mainPostButton.addEventListener('click', function() {
            textarea.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Character counter
    const charCounter = document.createElement('div');
    charCounter.className = 'char-counter';
    charCounter.style.cssText = 'color: var(--text-secondary); font-size: 13px; margin-right: 12px; margin-left: auto;';
    
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