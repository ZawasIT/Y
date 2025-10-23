// ===== POSTS MODULE =====

/**
 * Create post element from data
 */
function createPostElement(post) {
    const postDiv = document.createElement('article');
    postDiv.className = 'post';
    postDiv.dataset.postId = post.id;
    
    // Konwertuj is_liked i is_reposted na boolean
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

/**
 * Add post to feed
 */
function addPostToFeed(post) {
    const feed = document.querySelector('.feed');
    if (!feed) return;
    
    const postElement = createPostElement(post);
    
    // Dodaj na początek feedu
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

/**
 * Load posts from API
 */
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

/**
 * Show post context menu
 */
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

/**
 * Edit post
 */
function editPost(postId, postElement) {
    const postText = postElement.querySelector('.post-text');
    const currentContent = postText.textContent;
    
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
    
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    
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

/**
 * Delete post
 */
function deletePost(postId, postElement) {
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

/**
 * Report post
 */
function reportPost(postId) {
    showNotification('Funkcja zgłaszania zostanie wkrótce dodana', 'info');
}

/**
 * Initialize post menu handlers
 */
function initPostMenuHandlers() {
    // Obsługa kliknięcia przycisku "więcej"
    document.addEventListener('click', function(e) {
        const moreBtn = e.target.closest('.post-more');
        if (moreBtn) {
            e.stopPropagation();
            const post = moreBtn.closest('.post');
            const postId = post.dataset.postId;
            
            const profileData = getProfileData();
            const postAuthorUsername = post.querySelector('.author-username').textContent.replace('@', '');
            const currentUserUsername = profileData ? profileData.username : null;
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
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createPostElement,
        addPostToFeed,
        loadPosts,
        showPostMenu,
        editPost,
        deletePost,
        reportPost,
        initPostMenuHandlers
    };
}