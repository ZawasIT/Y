// ===== UI MODULE =====

/**
 * Show notification to user
 */
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

/**
 * Initialize notification styles
 */
function initNotificationStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
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
}

/**
 * Close modal
 */
function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
}

/**
 * Setup modal close handlers
 */
function setupModalCloseHandlers(modal) {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modal));
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
}

// Initialize styles on load
initNotificationStyles();

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showNotification,
        closeModal,
        setupModalCloseHandlers
    };
}