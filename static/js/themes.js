/**
 * Theme and Visualization Management
 * Handles visualization themes, color schemes, and visual customization
 */

// Theme configuration
const themeConfig = {
    visualizationThemes: {
        bars: {
            name: 'Bars',
            icon: 'chart-bar',
            description: 'Classic bar chart visualization'
        },
        circles: {
            name: 'Circles',
            icon: 'circle',
            description: 'Bubble-based visualization'
        },
        cards: {
            name: 'Cards',
            icon: 'id-card',
            description: 'Playing card style visualization'
        }
    },
    
    colorSchemes: {
        classic: {
            name: 'Classic',
            colors: {
                default: '#3498db',
                comparing: '#e74c3c',
                swapping: '#f39c12',
                sorted: '#27ae60',
                pivot: '#9b59b6',
                background: '#ffffff'
            }
        },
        ocean: {
            name: 'Ocean',
            colors: {
                default: '#3742fa',
                comparing: '#ff3838',
                swapping: '#ff9500',
                sorted: '#2ed573',
                pivot: '#a55eea',
                background: '#f1f2f6'
            }
        },
        sunset: {
            name: 'Sunset',
            colors: {
                default: '#ff6b6b',
                comparing: '#4ecdc4',
                swapping: '#ffe66d',
                sorted: '#95e1d3',
                pivot: '#a8e6cf',
                background: '#fff3e0'
            }
        },
        cyberpunk: {
            name: 'Cyberpunk',
            colors: {
                default: '#00d9ff',
                comparing: '#ff0080',
                swapping: '#ffff00',
                sorted: '#00ff41',
                pivot: '#ff8c00',
                background: '#0a0a0a'
            }
        },
        nature: {
            name: 'Nature',
            colors: {
                default: '#6ab04c',
                comparing: '#eb4d4b',
                swapping: '#f0932b',
                sorted: '#badc58',
                pivot: '#7d5fff',
                background: '#f8f8f8'
            }
        }
    }
};

// Current theme state
let currentVisualizationTheme = 'bars';
let currentColorScheme = 'classic';

/**
 * Initialize theme system
 */
function initializeThemeSystem() {
    loadSavedThemes();
    setupThemeControls();
    updateVisualizationColors();
}

/**
 * Load saved theme preferences
 */
function loadSavedThemes() {
    const savedVisTheme = localStorage.getItem('sortingVisualizerVisTheme') || 'bars';
    const savedColorScheme = localStorage.getItem('sortingVisualizerColorScheme') || 'classic';
    
    setVisualizationTheme(savedVisTheme);
    setColorScheme(savedColorScheme);
}

/**
 * Setup theme control elements
 */
function setupThemeControls() {
    // Setup visualization theme buttons
    const themeButtons = document.querySelectorAll('[data-theme]');
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            setVisualizationTheme(theme);
            updateThemeButtonStates(this);
        });
    });
    
    // Create color scheme selector if it doesn't exist
    createColorSchemeSelector();
    
    // Setup dark/light mode integration
    observeThemeChanges();
}

/**
 * Create color scheme selector
 */
function createColorSchemeSelector() {
    // Find a suitable location for the color scheme selector
    const controlsCard = document.querySelector('#learn-mode .card-body');
    if (!controlsCard) return;
    
    // Check if selector already exists
    if (document.getElementById('colorSchemeSelect')) return;
    
    const colorSchemeHtml = `
        <div class="mb-3" id="colorSchemeContainer">
            <label for="colorSchemeSelect" class="form-label">Color Scheme</label>
            <select class="form-select" id="colorSchemeSelect">
                ${Object.entries(themeConfig.colorSchemes).map(([key, scheme]) => 
                    `<option value="${key}">${scheme.name}</option>`
                ).join('')}
            </select>
        </div>
    `;
    
    // Insert before the speed control
    const speedControl = controlsCard.querySelector('label[for="speedRange"]').parentElement;
    speedControl.insertAdjacentHTML('beforebegin', colorSchemeHtml);
    
    // Add event listener
    const colorSchemeSelect = document.getElementById('colorSchemeSelect');
    if (colorSchemeSelect) {
        colorSchemeSelect.value = currentColorScheme;
        colorSchemeSelect.addEventListener('change', function() {
            setColorScheme(this.value);
        });
    }
}

/**
 * Set visualization theme
 * @param {string} theme - Theme name
 */
function setVisualizationTheme(theme) {
    if (!themeConfig.visualizationThemes[theme]) {
        // Silently ignore unknown themes to avoid console warnings
        return;
    }
    
    currentVisualizationTheme = theme;
    localStorage.setItem('sortingVisualizerVisTheme', theme);
    
    // Update visualizer state
    if (typeof visualizerState !== 'undefined') {
        visualizerState.theme = theme;
        if (visualizerState.canvas) {
            drawVisualization();
        }
    }
    
    showNotification(`Switched to ${themeConfig.visualizationThemes[theme].name} theme`, 'info', 1500);
}

/**
 * Set color scheme
 * @param {string} scheme - Color scheme name
 */
function setColorScheme(scheme) {
    if (!themeConfig.colorSchemes[scheme]) {
        // Silently ignore unknown color schemes
        return;
    }
    
    currentColorScheme = scheme;
    localStorage.setItem('sortingVisualizerColorScheme', scheme);
    
    updateVisualizationColors();
    
    // Update any active visualizations
    if (typeof visualizerState !== 'undefined' && visualizerState.canvas) {
        drawVisualization();
    }
    
    showNotification(`Applied ${themeConfig.colorSchemes[scheme].name} color scheme`, 'info', 1500);
}

/**
 * Update visualization colors based on current scheme and app theme
 */
function updateVisualizationColors() {
    if (typeof visualizerState === 'undefined') return;
    
    const scheme = themeConfig.colorSchemes[currentColorScheme];
    const isAppDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Base colors from the scheme
    visualizerState.colors = { ...scheme.colors };
    
    // Adjust for dark mode if needed
    if (isAppDarkMode) {
        visualizerState.colors.background = currentColorScheme === 'cyberpunk' ? '#0a0a0a' : '#2d2d2d';
        
        // Brighten colors slightly for better visibility on dark background
        if (currentColorScheme !== 'cyberpunk') {
            visualizerState.colors.default = brightenColor(visualizerState.colors.default, 20);
            visualizerState.colors.comparing = brightenColor(visualizerState.colors.comparing, 20);
            visualizerState.colors.swapping = brightenColor(visualizerState.colors.swapping, 20);
            visualizerState.colors.sorted = brightenColor(visualizerState.colors.sorted, 20);
            visualizerState.colors.pivot = brightenColor(visualizerState.colors.pivot, 20);
        }
    }
}

/**
 * Update theme button states
 * @param {HTMLElement} activeButton - Currently active button
 */
function updateThemeButtonStates(activeButton) {
    // Remove active state from all theme buttons
    const themeButtons = document.querySelectorAll('[data-theme]');
    themeButtons.forEach(button => button.classList.remove('active'));
    
    // Add active state to clicked button
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

/**
 * Observe theme changes and update accordingly
 */
function observeThemeChanges() {
    // Watch for changes to the data-theme attribute
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                updateVisualizationColors();
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
}

/**
 * Create theme preview
 * @param {string} themeName - Theme name
 * @returns {HTMLElement} Preview element
 */
function createThemePreview(themeName) {
    const theme = themeConfig.visualizationThemes[themeName];
    if (!theme) return null;
    
    const preview = document.createElement('div');
    preview.className = 'theme-preview';
    preview.innerHTML = `
        <div class="theme-preview-icon">
            <i class="fas fa-${theme.icon}"></i>
        </div>
        <div class="theme-preview-name">${theme.name}</div>
        <div class="theme-preview-description">${theme.description}</div>
    `;
    
    return preview;
}

/**
 * Create color scheme preview
 * @param {string} schemeName - Color scheme name
 * @returns {HTMLElement} Preview element
 */
function createColorSchemePreview(schemeName) {
    const scheme = themeConfig.colorSchemes[schemeName];
    if (!scheme) return null;
    
    const preview = document.createElement('div');
    preview.className = 'color-scheme-preview';
    
    const colorPalette = Object.entries(scheme.colors)
        .filter(([key]) => key !== 'background')
        .map(([key, color]) => `
            <div class="color-swatch" 
                 style="background-color: ${color}" 
                 title="${key}"></div>
        `).join('');
    
    preview.innerHTML = `
        <div class="color-scheme-name">${scheme.name}</div>
        <div class="color-palette">${colorPalette}</div>
    `;
    
    return preview;
}

/**
 * Generate random color scheme
 * @returns {Object} New color scheme
 */
function generateRandomColorScheme() {
    const baseHue = Math.floor(Math.random() * 360);
    
    return {
        name: 'Random',
        colors: {
            default: `hsl(${baseHue}, 70%, 50%)`,
            comparing: `hsl(${(baseHue + 120) % 360}, 70%, 50%)`,
            swapping: `hsl(${(baseHue + 60) % 360}, 70%, 50%)`,
            sorted: `hsl(${(baseHue + 180) % 360}, 70%, 50%)`,
            pivot: `hsl(${(baseHue + 240) % 360}, 70%, 50%)`,
            background: '#ffffff'
        }
    };
}

/**
 * Apply random color scheme
 */
function applyRandomColorScheme() {
    const randomScheme = generateRandomColorScheme();
    
    // Temporarily add to config
    themeConfig.colorSchemes.random = randomScheme;
    
    setColorScheme('random');
}

/**
 * Export current theme configuration
 * @returns {Object} Theme configuration
 */
function exportThemeConfig() {
    return {
        visualizationTheme: currentVisualizationTheme,
        colorScheme: currentColorScheme,
        timestamp: new Date().toISOString()
    };
}

/**
 * Import theme configuration
 * @param {Object} config - Theme configuration to import
 */
function importThemeConfig(config) {
    if (config.visualizationTheme) {
        setVisualizationTheme(config.visualizationTheme);
    }
    
    if (config.colorScheme) {
        setColorScheme(config.colorScheme);
    }
    
    showNotification('Theme configuration imported successfully', 'success');
}

/**
 * Brighten a color by a percentage
 * @param {string} color - Hex color string
 * @param {number} percent - Percentage to brighten (0-100)
 * @returns {string} Brightened color
 */
function brightenColor(color, percent) {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Brighten each component
    const factor = percent / 100;
    const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Darken a color by a percentage
 * @param {string} color - Hex color string
 * @param {number} percent - Percentage to darken (0-100)
 * @returns {string} Darkened color
 */
function darkenColor(color, percent) {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Darken each component
    const factor = 1 - (percent / 100);
    const newR = Math.floor(r * factor);
    const newG = Math.floor(g * factor);
    const newB = Math.floor(b * factor);
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Get complementary color
 * @param {string} color - Hex color string
 * @returns {string} Complementary color
 */
function getComplementaryColor(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate complementary RGB values
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    
    return `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`;
}

/**
 * Create gradient background for race mode
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
function createGradientBackground(ctx, width, height) {
    const scheme = themeConfig.colorSchemes[currentColorScheme];
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    
    gradient.addColorStop(0, scheme.colors.background);
    gradient.addColorStop(1, darkenColor(scheme.colors.background, 10));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

// Initialize theme system when document is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeThemeSystem();
});

/**
 * Toggle dark/light mode
 */
function toggleDarkMode() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        if (themeIcon) {
            themeIcon.className = 'fas fa-moon';
        }
        localStorage.setItem('sorting-visualizer-dark-mode', 'false');
    } else {
        body.classList.add('dark-mode');
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
        localStorage.setItem('sorting-visualizer-dark-mode', 'true');
    }
    
    // Redraw visualization with new colors
    if (typeof drawVisualization === 'function') {
        drawVisualization();
    }
}

/**
 * Load saved dark mode preference
 */
function loadSavedDarkMode() {
    const savedDarkMode = localStorage.getItem('sorting-visualizer-dark-mode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
    }
}

// Make functions globally available
window.setVisualizationTheme = setVisualizationTheme;
window.setColorScheme = setColorScheme;
window.applyRandomColorScheme = applyRandomColorScheme;
window.exportThemeConfig = exportThemeConfig;
window.importThemeConfig = importThemeConfig;
window.createGradientBackground = createGradientBackground;
window.toggleDarkMode = toggleDarkMode;
window.loadSavedDarkMode = loadSavedDarkMode;
window.themeConfig = themeConfig;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        themeConfig,
        setVisualizationTheme,
        setColorScheme,
        updateVisualizationColors,
        applyRandomColorScheme
    };
}

