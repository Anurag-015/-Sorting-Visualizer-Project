/**
 * Main JavaScript file for Sorting Visualizer
 * Handles global functionality, theme switching, and UI interactions
 */

// Global variables
let currentTheme = 'light';
let isVisualizationRunning = false;
let currentVisualizationData = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeEventListeners();
    setupThemeToggle();
    loadStoredPreferences();
});

/**
 * Initialize theme system
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('sortingVisualizerTheme') || 'light';
    setTheme(savedTheme);
}

/**
 * Set application theme
 * @param {string} theme - 'light' or 'dark'
 */
function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    localStorage.setItem('sortingVisualizerTheme', theme);
    
    // Update chart colors if visualization is active
    if (currentVisualizationData) {
        updateVisualizationTheme();
    }
}

/**
 * Setup theme toggle functionality
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }
}

/**
 * Initialize global event listeners
 */
function initializeEventListeners() {
    // Algorithm selection change
    const algorithmSelect = document.getElementById('algorithmSelect');
    if (algorithmSelect) {
        algorithmSelect.addEventListener('change', function() {
            loadAlgorithmInfo(this.value);
        });
    }
    
    // Array input validation
    const arrayInput = document.getElementById('arrayInput');
    if (arrayInput) {
        arrayInput.addEventListener('input', validateArrayInput);
        arrayInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                parseCustomArray();
            }
        });
    }
    
    // Array size validation
    const arraySize = document.getElementById('arraySize');
    if (arraySize) {
        arraySize.addEventListener('input', function() {
            this.value = Math.max(5, Math.min(100, parseInt(this.value) || 20));
        });
    }
    
    // Speed range update
    const speedRange = document.getElementById('speedRange');
    if (speedRange) {
        speedRange.addEventListener('input', function() {
            updateAnimationSpeed(this.value);
        });
    }
    
    // Theme selection buttons
    const themeButtons = document.querySelectorAll('[data-theme]');
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedTheme = this.getAttribute('data-theme');
            setVisualizationTheme(selectedTheme);
            
            // Update active state
            themeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Window resize handler
    window.addEventListener('resize', debounce(handleWindowResize, 250));
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyboardShortcuts(e) {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
    }
    
    // Don't trigger shortcuts when modals are open
    if (document.querySelector('.modal.show')) {
        return;
    }
    
    switch(e.key) {
        case ' ': // Spacebar - play/pause
            e.preventDefault();
            if (typeof isVisualizationRunning !== 'undefined' && isVisualizationRunning) {
                pauseVisualization();
            } else if (typeof startSorting !== 'undefined') {
                startSorting();
            }
            break;
        case 'r': // R key - reset
            if (e.ctrlKey || e.metaKey) return; // Don't interfere with browser refresh
            e.preventDefault();
            if (typeof resetVisualization !== 'undefined') {
                resetVisualization();
            }
            break;
        case 's': // S key - step forward
            e.preventDefault();
            if (typeof stepForward !== 'undefined') {
                stepForward();
            }
            break;
        case 'g': // G key - generate new array
            e.preventDefault();
            if (typeof generateRandomArray !== 'undefined') {
                generateRandomArray();
            }
            break;
        case 't': // T key - toggle theme
            e.preventDefault();
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
            break;
        case '1': // Switch to learn mode
            e.preventDefault();
            showLearnMode();
            break;
        case '2': // Switch to game mode
            e.preventDefault();
            showGameMode();
            break;
    }
}

/**
 * Handle window resize events
 */
function handleWindowResize() {
    const canvas = document.getElementById('visualizationCanvas');
    if (canvas && currentVisualizationData) {
        resizeCanvas();
        redrawVisualization();
    }
}

/**
 * Validate array input format
 */
function validateArrayInput() {
    const input = document.getElementById('arrayInput');
    const value = input.value.trim();
    
    if (value === '') {
        input.classList.remove('is-invalid', 'is-valid');
        return;
    }
    
    // Check if input contains only numbers, commas, and spaces
    const isValid = /^[\d\s,]+$/.test(value) && 
                   value.split(',').every(num => {
                       const parsed = parseInt(num.trim());
                       return !isNaN(parsed) && parsed >= 1 && parsed <= 1000;
                   });
    
    if (isValid) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
    }
}

/**
 * Parse custom array from input
 * @returns {Array|null} Parsed array or null if invalid
 */
function parseCustomArray() {
    const input = document.getElementById('arrayInput');
    const value = input.value.trim();
    
    if (value === '') return null;
    
    try {
        const array = value.split(',')
            .map(num => parseInt(num.trim()))
            .filter(num => !isNaN(num) && num >= 1 && num <= 1000);
        
        if (array.length === 0) return null;
        if (array.length > 100) return array.slice(0, 100);
        
        return array;
    } catch (error) {
        console.error('Error parsing custom array:', error);
        return null;
    }
}

/**
 * Load stored user preferences
 */
function loadStoredPreferences() {
    // Load preferred speed
    const savedSpeed = localStorage.getItem('sortingVisualizerSpeed');
    if (savedSpeed) {
        const speedRange = document.getElementById('speedRange');
        if (speedRange) {
            speedRange.value = savedSpeed;
            updateAnimationSpeed(savedSpeed);
        }
    }
    
    // Load preferred algorithm
    const savedAlgorithm = localStorage.getItem('sortingVisualizerAlgorithm');
    if (savedAlgorithm) {
        const algorithmSelect = document.getElementById('algorithmSelect');
        if (algorithmSelect) {
            algorithmSelect.value = savedAlgorithm;
            loadAlgorithmInfo(savedAlgorithm);
        }
    }
    
    // Load preferred visualization theme
    const savedVisTheme = localStorage.getItem('sortingVisualizerVisTheme');
    if (savedVisTheme) {
        const themeButton = document.querySelector(`[data-theme="${savedVisTheme}"]`);
        if (themeButton) {
            themeButton.click();
        }
    }
}

/**
 * Save user preference
 * @param {string} key - Preference key
 * @param {string} value - Preference value
 */
function savePreference(key, value) {
    localStorage.setItem(`sortingVisualizer${key}`, value);
}

/**
 * Update animation speed
 * @param {number} speed - Speed value (1-10)
 */
function updateAnimationSpeed(speed) {
    savePreference('Speed', speed);
    
    // Update global animation speed variable if it exists
    if (typeof window.animationSpeed !== 'undefined') {
        window.animationSpeed = parseInt(speed);
    }
}

/**
 * Show notification message
 * @param {string} message - Message to display
 * @param {string} type - Notification type ('success', 'error', 'info', 'warning')
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification alert alert-${type === 'error' ? 'danger' : type} alert-dismissible`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${getNotificationIcon(type)} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove notification
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
}

/**
 * Get appropriate icon for notification type
 * @param {string} type - Notification type
 * @returns {string} Font Awesome icon class
 */
function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format execution time for display
 * @param {number} timeMs - Time in milliseconds
 * @returns {string} Formatted time string
 */
function formatExecutionTime(timeMs) {
    if (timeMs < 1) {
        return '<1ms';
    } else if (timeMs < 1000) {
        return `${Math.round(timeMs)}ms`;
    } else {
        return `${(timeMs / 1000).toFixed(2)}s`;
    }
}

/**
 * Format large numbers for display
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
    if (num < 1000) {
        return num.toString();
    } else if (num < 1000000) {
        return `${(num / 1000).toFixed(1)}K`;
    } else {
        return `${(num / 1000000).toFixed(1)}M`;
    }
}

/**
 * Generate random color
 * @returns {string} Random hex color
 */
function getRandomColor() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
        '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
        '#10AC84', '#EE5A24', '#0ABDE3', '#C44569', '#F8B500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', 'success', 2000);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        showNotification('Failed to copy to clipboard', 'error', 2000);
        return false;
    }
}

/**
 * Download text as file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
function downloadAsFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    showNotification(`Downloaded ${filename}`, 'success', 2000);
}

/**
 * Animate element with CSS classes
 * @param {HTMLElement} element - Element to animate
 * @param {string} animationClass - CSS animation class
 * @param {number} duration - Animation duration in milliseconds
 */
function animateElement(element, animationClass, duration = 500) {
    element.classList.add(animationClass);
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, duration);
}

/**
 * Smooth scroll to element
 * @param {string} elementId - Target element ID
 * @param {number} offset - Scroll offset
 */
function smoothScrollTo(elementId, offset = 80) {
    const element = document.getElementById(elementId);
    if (element) {
        const targetPosition = element.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Add CSS for notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Export functions for use in other modules
window.SortingVisualizer = {
    showNotification,
    formatExecutionTime,
    formatNumber,
    getRandomColor,
    isMobileDevice,
    copyToClipboard,
    downloadAsFile,
    animateElement,
    smoothScrollTo,
    debounce
};
