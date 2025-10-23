// ===== HELPER FUNCTIONS =====

/**
 * Escape HTML characters to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format numbers (1000 -> 1K, 1000000 -> 1M)
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

/**
 * Format time ago (2h, 1d, etc.)
 */
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

/**
 * Get profile data from DOM
 */
function getProfileData() {
    const profileData = document.getElementById('profile-data');
    if (!profileData) {
        return null;
    }
    
    return {
        userId: parseInt(profileData.dataset.userId),
        username: profileData.dataset.username,
        isOwnProfile: profileData.dataset.isOwnProfile === 'true'
    };
}

/**
 * Fix image error handlers (prevent infinite loops)
 */
function fixImageErrors() {
    document.querySelectorAll('img[onerror]').forEach(img => {
        img.removeAttribute('onerror');
        img.addEventListener('error', function() {
            if (!this.dataset.errorHandled) {
                this.dataset.errorHandled = 'true';
                this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23536471"/%3E%3Cpath d="M20 10c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 16c-4.4 0-8 3.6-8 8h16c0-4.4-3.6-8-8-8z" fill="%23E7E9EA"/%3E%3C/svg%3E';
            }
        });
    });
}

/**
 * Prevent default for # links
 */
function preventDefaultHashLinks() {
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
        });
    });
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHtml,
        formatNumber,
        formatTimeAgo,
        getProfileData,
        fixImageErrors,
        preventDefaultHashLinks
    };
}