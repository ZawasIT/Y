// ===== REPLIES MODULE =====

/**
 * Create reply element
 */
function createReplyElement(reply) {
    const replyDiv = document.createElement('div');
    replyDiv.className = 'reply';
    replyDiv.dataset.replyId = reply.id;
    
    const verifiedBadge = reply.verified ? `
        <svg viewBox="0 0 22 22" class="verified-badge">
            <g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g>
        </svg>
    ` : '';
    
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

/**
 * Open reply modal
 */
function openReplyModal(postId, postElement) {
    let modal = document.querySelector('.reply-modal');
    
    if (modal) {
        modal.remove();
    }
    
    modal = document.createElement('div');
    modal.className = 'modal reply-modal';
    
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
                
                <div class="reply-form-container">
                    <textarea class="reply-textarea" placeholder="Napisz swoją odpowiedź..." maxlength="280"></textarea>
                    <div class="reply-form-footer">
                        <div class="char-counter-reply"></div>
                        <button class="reply-submit-btn" disabled>Odpowiedz</button>
                    </div>
                </div>
                
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
    
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    });
    
    const textarea = modal.querySelector('.reply-textarea');
    const charCounter = modal.querySelector('.char-counter-reply');
    const submitBtn = modal.querySelector('.reply-submit-btn');
    
    textarea.addEventListener('input', function() {
        const count = this.value.length;
        charCounter.textContent = count > 0 ? `${count}/280` : '';
        
        submitBtn.disabled = count === 0 || count > 280;
        
        if (count > 280) {
            charCounter.style.color = 'var(--accent-red)';
        } else if (count > 260) {
            charCounter.style.color = '#FFD400';
        } else {
            charCounter.style.color = 'var(--text-secondary)';
        }
        
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    });
    
    submitBtn.addEventListener('click', () => {
        submitReply(postId, textarea.value, modal, postElement);
    });
    
    modal.dataset.postId = postId;
    modal.classList.add('active');
    
    loadRepliesInModal(postId, modal);
    
    setTimeout(() => {
        modal.querySelector('.reply-textarea').focus();
    }, 100);
}

/**
 * Submit reply
 */
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
            textarea.value = '';
            textarea.style.height = 'auto';
            
            const repliesCountSpan = postElement.querySelector('.replies-count');
            if (repliesCountSpan) {
                const currentCount = parseInt(repliesCountSpan.textContent) || 0;
                repliesCountSpan.textContent = currentCount + 1;
            }
            
            showNotification('Odpowiedź dodana!', 'success');
            
            loadRepliesInModal(postId, modal);
            
            submitBtn.disabled = true;
            submitBtn.textContent = originalText;
            
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

/**
 * Load replies in modal
 */
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

/**
 * Initialize reply handlers
 */
function initReplyHandlers() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.reply-btn')) {
            const btn = e.target.closest('.reply-btn');
            const postId = btn.dataset.postId;
            const post = btn.closest('.post');
            openReplyModal(postId, post);
        }
    });
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createReplyElement,
        openReplyModal,
        submitReply,
        loadRepliesInModal,
        initReplyHandlers
    };
}