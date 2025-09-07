/**
 * Sorting Visualizer - Main visualization engine
 * Handles canvas rendering, animations, and sorting step visualization
 */

// Global visualization state
let visualizerState = {
    canvas: null,
    ctx: null,
    currentArray: [],
    originalArray: [],
    sortingSteps: [],
    currentStep: 0,
    isAnimating: false,
    animationSpeed: 5,
    theme: 'bars',
    colors: {
        default: '#3498db',
        comparing: '#e74c3c',
        swapping: '#f39c12',
        sorted: '#27ae60',
        pivot: '#9b59b6',
        background: '#ffffff'
    }
};

/**
 * Initialize the visualizer
 */
function initializeVisualizer() {
    const canvas = document.getElementById('visualizationCanvas');
    if (!canvas) {
        console.error('Visualization canvas not found');
        return;
    }
    
    visualizerState.canvas = canvas;
    visualizerState.ctx = canvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    
    // Initialize with a sample array
    generateRandomArray();
    
    console.log('Visualizer initialized');
}

/**
 * Resize canvas to fit container
 */
function resizeCanvas() {
    const canvas = visualizerState.canvas;
    if (!canvas) return;
    
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    // Set canvas size with device pixel ratio for crisp rendering
    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = rect.width - 40; // Account for padding
    const height = Math.max(400, Math.min(600, window.innerHeight * 0.5));
    
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Scale context for high DPI displays
    visualizerState.ctx.scale(devicePixelRatio, devicePixelRatio);
}

/**
 * Generate a random array for visualization
 */
function generateRandomArray() {
    const sizeInput = document.getElementById('arraySize');
    const size = sizeInput ? parseInt(sizeInput.value) || 20 : 20;
    
    // Clear any custom input
    const arrayInput = document.getElementById('arrayInput');
    if (arrayInput) {
        arrayInput.value = '';
        arrayInput.classList.remove('is-valid', 'is-invalid');
    }
    
    // Generate array with values between 5 and 200
    const array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 195) + 5);
    }
    
    setVisualizationArray(array);
    showNotification(`Generated random array of ${size} elements`, 'success', 2000);
}

/**
 * Set the array for visualization
 * @param {Array} array - Array to visualize
 */
function setVisualizationArray(array) {
    visualizerState.currentArray = [...array];
    visualizerState.originalArray = [...array];
    visualizerState.sortingSteps = [];
    visualizerState.currentStep = 0;
    visualizerState.isAnimating = false;
    
    resetStatistics();
    drawVisualization();
    
    // Update array display in UI
    updateArrayDisplay();
    
    // Show array statistics
    displayArrayStatistics(array);
}

/**
 * Display array statistics
 * @param {Array} array - Array to analyze
 */
function displayArrayStatistics(array) {
    if (array.length === 0) return;
    
    const stats = {
        size: array.length,
        min: Math.min(...array),
        max: Math.max(...array),
        avg: (array.reduce((sum, val) => sum + val, 0) / array.length).toFixed(1),
        sorted: isSorted(array),
        duplicates: array.length - new Set(array).size
    };
    
    // Update any existing stats display
    const statsContainer = document.querySelector('.array-statistics');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="row text-center">
                <div class="col"><small>Size: <strong>${stats.size}</strong></small></div>
                <div class="col"><small>Range: <strong>${stats.min}-${stats.max}</strong></small></div>
                <div class="col"><small>Avg: <strong>${stats.avg}</strong></small></div>
                <div class="col"><small>Status: <strong class="${stats.sorted ? 'text-success' : 'text-warning'}">${stats.sorted ? 'Sorted' : 'Unsorted'}</strong></small></div>
            </div>
        `;
    }
}

/**
 * Check if array is sorted
 * @param {Array} array - Array to check
 * @returns {boolean} True if sorted
 */
function isSorted(array) {
    for (let i = 1; i < array.length; i++) {
        if (array[i] < array[i - 1]) return false;
    }
    return true;
}

/**
 * Start sorting with selected algorithm
 */
async function startSorting() {
    if (visualizerState.isAnimating) {
        return;
    }
    
    // Get custom array if provided
    const customArray = parseCustomArray();
    if (customArray) {
        setVisualizationArray(customArray);
    }
    
    const algorithmSelect = document.getElementById('algorithmSelect');
    const algorithm = algorithmSelect ? algorithmSelect.value : 'bubble';
    
    if (visualizerState.currentArray.length === 0) {
        showNotification('Please generate or input an array first', 'warning');
        return;
    }
    
    showNotification(`Starting ${getAlgorithmName(algorithm)} sort...`, 'info', 2000);
    
    try {
        // Get sorting steps from server
        const response = await fetch('/api/sort', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                algorithm: algorithm,
                array: visualizerState.originalArray,
                stepByStep: true,
                mode: 'learn'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        visualizerState.sortingSteps = result.steps || [];
        visualizerState.currentStep = 0;
        
        // Update statistics
        updateStatistics({
            comparisons: result.comparisons || 0,
            swaps: result.swaps || 0,
            executionTime: result.execution_time || 0
        });
        
        // Start animation
        if (visualizerState.sortingSteps.length > 0) {
            visualizerState.isAnimating = true;
            updateControlButtons();
            await animateSortingSteps();
        } else {
            showNotification('No sorting steps generated', 'warning');
        }
        
    } catch (error) {
        console.error('Error starting sort:', error);
        showNotification('Error starting sort: ' + error.message, 'error');
    }
}

/**
 * Animate sorting steps
 */
async function animateSortingSteps() {
    while (visualizerState.currentStep < visualizerState.sortingSteps.length && visualizerState.isAnimating) {
        const step = visualizerState.sortingSteps[visualizerState.currentStep];
        
        // Update array state
        visualizerState.currentArray = [...step.array];
        
        // Update step description
        updateStepDescription(step);
        
        // Draw current step
        drawVisualization(step);
        
        // Wait for animation delay
        const delay = getAnimationDelay();
        await new Promise(resolve => setTimeout(resolve, delay));
        
        visualizerState.currentStep++;
    }
    
    // Animation complete
    visualizerState.isAnimating = false;
    updateControlButtons();
    
    if (visualizerState.currentStep >= visualizerState.sortingSteps.length) {
        showNotification('Sorting completed!', 'success');
        celebrateCompletion();
    }
}

/**
 * Pause/resume visualization
 */
function pauseVisualization() {
    visualizerState.isAnimating = !visualizerState.isAnimating;
    updateControlButtons();
    
    if (visualizerState.isAnimating) {
        animateSortingSteps();
    }
}

/**
 * Step forward one animation frame
 */
function stepForward() {
    if (visualizerState.currentStep < visualizerState.sortingSteps.length) {
        const step = visualizerState.sortingSteps[visualizerState.currentStep];
        
        visualizerState.currentArray = [...step.array];
        updateStepDescription(step);
        drawVisualization(step);
        
        visualizerState.currentStep++;
        
        if (visualizerState.currentStep >= visualizerState.sortingSteps.length) {
            showNotification('Sorting completed!', 'success');
            celebrateCompletion();
        }
    }
}

/**
 * Reset visualization to original state
 */
function resetVisualization() {
    visualizerState.isAnimating = false;
    visualizerState.currentStep = 0;
    visualizerState.currentArray = [...visualizerState.originalArray];
    visualizerState.sortingSteps = [];
    
    resetStatistics();
    updateControlButtons();
    clearStepDescription();
    drawVisualization();
    
    showNotification('Visualization reset', 'info', 1500);
}

/**
 * Draw the current visualization
 * @param {Object} step - Current sorting step (optional)
 */
function drawVisualization(step = null) {
    const ctx = visualizerState.ctx;
    const canvas = visualizerState.canvas;
    
    if (!ctx || !canvas) return;
    
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    
    // Clear canvas
    ctx.fillStyle = visualizerState.colors.background;
    ctx.fillRect(0, 0, width, height);
    
    const array = visualizerState.currentArray;
    if (array.length === 0) return;
    
    // Calculate dimensions
    const maxValue = Math.max(...array);
    const minValue = Math.min(...array);
    const valueRange = maxValue - minValue || 1;
    
    const margin = 20;
    const availableWidth = width - 2 * margin;
    const availableHeight = height - 2 * margin;
    
    // Draw based on selected theme
    switch (visualizerState.theme) {
        case 'bars':
            drawBars(ctx, array, step, margin, availableWidth, availableHeight, maxValue);
            break;
        case 'circles':
            drawCircles(ctx, array, step, margin, availableWidth, availableHeight, maxValue, minValue, valueRange);
            break;
        case 'cards':
            drawCards(ctx, array, step, margin, availableWidth, availableHeight, maxValue);
            break;
        default:
            drawBars(ctx, array, step, margin, availableWidth, availableHeight, maxValue);
    }
}

/**
 * Draw bars visualization
 */
function drawBars(ctx, array, step, margin, availableWidth, availableHeight, maxValue) {
    const barWidth = availableWidth / array.length;
    const barSpacing = Math.max(1, barWidth * 0.1);
    const actualBarWidth = barWidth - barSpacing;
    
    array.forEach((value, index) => {
        const barHeight = (value / maxValue) * availableHeight;
        const x = margin + index * barWidth + barSpacing / 2;
        const y = margin + availableHeight - barHeight;
        
        // Determine bar color based on step
        let color = visualizerState.colors.default;
        if (step) {
            if (step.indices && step.indices.includes(index)) {
                switch (step.type) {
                    case 'compare':
                        color = visualizerState.colors.comparing;
                        break;
                    case 'swap':
                        color = visualizerState.colors.swapping;
                        break;
                    case 'pivot':
                        color = visualizerState.colors.pivot;
                        break;
                    case 'sorted':
                        color = visualizerState.colors.sorted;
                        break;
                }
            }
        }
        
        // Draw bar
        ctx.fillStyle = color;
        ctx.fillRect(x, y, actualBarWidth, barHeight);
        
        // Draw value label on smaller arrays
        if (array.length <= 30) {
            ctx.fillStyle = currentTheme === 'dark' ? '#fff' : '#333';
            ctx.font = `${Math.max(8, Math.min(12, barWidth / 3))}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(value, x + actualBarWidth / 2, y - 5);
        }
    });
}

/**
 * Draw circles visualization
 */
function drawCircles(ctx, array, step, margin, availableWidth, availableHeight, maxValue, minValue, valueRange) {
    const cols = Math.ceil(Math.sqrt(array.length));
    const rows = Math.ceil(array.length / cols);
    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / rows;
    const maxRadius = Math.min(cellWidth, cellHeight) / 3;
    
    array.forEach((value, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const centerX = margin + col * cellWidth + cellWidth / 2;
        const centerY = margin + row * cellHeight + cellHeight / 2;
        const radius = ((value - minValue) / valueRange) * maxRadius + 5;
        
        // Determine circle color
        let color = visualizerState.colors.default;
        if (step && step.indices && step.indices.includes(index)) {
            switch (step.type) {
                case 'compare':
                    color = visualizerState.colors.comparing;
                    break;
                case 'swap':
                    color = visualizerState.colors.swapping;
                    break;
                case 'pivot':
                    color = visualizerState.colors.pivot;
                    break;
                case 'sorted':
                    color = visualizerState.colors.sorted;
                    break;
            }
        }
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw value
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value, centerX, centerY + 4);
    });
}

/**
 * Draw cards visualization
 */
function drawCards(ctx, array, step, margin, availableWidth, availableHeight, maxValue) {
    const cardWidth = Math.min(60, availableWidth / array.length - 5);
    const cardHeight = 80;
    const spacing = (availableWidth - array.length * cardWidth) / (array.length + 1);
    const startY = margin + (availableHeight - cardHeight) / 2;
    
    array.forEach((value, index) => {
        const x = margin + spacing + index * (cardWidth + spacing);
        const y = startY;
        
        // Determine card color
        let color = visualizerState.colors.default;
        if (step && step.indices && step.indices.includes(index)) {
            switch (step.type) {
                case 'compare':
                    color = visualizerState.colors.comparing;
                    break;
                case 'swap':
                    color = visualizerState.colors.swapping;
                    break;
                case 'pivot':
                    color = visualizerState.colors.pivot;
                    break;
                case 'sorted':
                    color = visualizerState.colors.sorted;
                    break;
            }
        }
        
        // Draw card
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cardWidth, cardHeight);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cardWidth, cardHeight);
        
        // Draw value
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value, x + cardWidth / 2, y + cardHeight / 2 + 6);
    });
}

/**
 * Update step description
 * @param {Object} step - Current sorting step
 */
function updateStepDescription(step) {
    const stepDescription = document.getElementById('stepDescription');
    const stepText = document.getElementById('stepText');
    
    if (stepDescription && stepText) {
        stepDescription.classList.remove('d-none');
        stepText.textContent = step.message || 'Processing...';
    }
}

/**
 * Clear step description
 */
function clearStepDescription() {
    const stepDescription = document.getElementById('stepDescription');
    if (stepDescription) {
        stepDescription.classList.add('d-none');
    }
}

/**
 * Update control buttons state
 */
function updateControlButtons() {
    const pauseBtn = document.getElementById('pauseBtn');
    const stepBtn = document.getElementById('stepBtn');
    
    if (pauseBtn) {
        const icon = pauseBtn.querySelector('i');
        if (visualizerState.isAnimating) {
            icon.className = 'fas fa-pause';
            pauseBtn.title = 'Pause';
        } else {
            icon.className = 'fas fa-play';
            pauseBtn.title = 'Resume';
        }
    }
    
    if (stepBtn) {
        stepBtn.disabled = visualizerState.isAnimating;
    }
}

/**
 * Update statistics display
 * @param {Object} stats - Statistics object
 */
function updateStatistics(stats) {
    const comparisons = document.getElementById('comparisons');
    const swaps = document.getElementById('swaps');
    const executionTime = document.getElementById('executionTime');
    
    if (comparisons) comparisons.textContent = formatNumber(stats.comparisons);
    if (swaps) swaps.textContent = formatNumber(stats.swaps);
    if (executionTime) executionTime.textContent = formatExecutionTime(stats.executionTime);
}

/**
 * Reset statistics display
 */
function resetStatistics() {
    updateStatistics({ comparisons: 0, swaps: 0, executionTime: 0 });
}

/**
 * Get animation delay based on speed setting
 * @returns {number} Delay in milliseconds
 */
function getAnimationDelay() {
    const speedRange = document.getElementById('speedRange');
    const speed = speedRange ? parseInt(speedRange.value) : 5;
    
    // Convert speed (1-10) to delay (1000ms-50ms)
    return Math.max(50, 1100 - speed * 100);
}

/**
 * Set visualization theme
 * @param {string} theme - Theme name ('bars', 'circles', 'cards')
 */
function setVisualizationTheme(theme) {
    visualizerState.theme = theme;
    savePreference('VisTheme', theme);
    drawVisualization();
    showNotification(`Switched to ${theme} theme`, 'info', 1500);
}

/**
 * Update visualization colors for current theme
 */
function updateVisualizationTheme() {
    if (currentTheme === 'dark') {
        visualizerState.colors.background = '#2d2d2d';
        visualizerState.colors.default = '#4ECDC4';
    } else {
        visualizerState.colors.background = '#ffffff';
        visualizerState.colors.default = '#3498db';
    }
    
    drawVisualization();
}

/**
 * Celebrate sorting completion
 */
function celebrateCompletion() {
    const canvas = visualizerState.canvas;
    if (canvas) {
        animateElement(canvas, 'completion-celebration', 1000);
    }
    
    // Update final array display
    updateArrayDisplay();
}

/**
 * Update array display in UI
 */
function updateArrayDisplay() {
    // Show current array state in text format
    displayCurrentArray();
    drawVisualization();
}

/**
 * Display current array in text format
 */
function displayCurrentArray() {
    const canvas = document.getElementById('visualizationCanvas');
    if (!canvas) return;
    
    const container = canvas.parentElement;
    let arrayDisplay = container.querySelector('.array-display');
    
    if (!arrayDisplay) {
        arrayDisplay = document.createElement('div');
        arrayDisplay.className = 'array-display mt-3 p-3 bg-light rounded';
        container.appendChild(arrayDisplay);
    }
    
    const array = visualizerState.currentArray;
    if (array.length === 0) {
        arrayDisplay.innerHTML = '<p class="text-muted mb-0">No array loaded</p>';
        return;
    }
    
    arrayDisplay.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0 text-muted">Current Array (${array.length} elements):</h6>
            <small class="text-muted">Min: ${Math.min(...array)} | Max: ${Math.max(...array)}</small>
        </div>
        <div class="array-values">
            ${array.map((val, idx) => {
                let className = 'array-element badge me-1 mb-1';
                // Color code based on value range
                if (val <= 33) className += ' bg-info';
                else if (val <= 66) className += ' bg-warning text-dark';
                else className += ' bg-success';
                
                return `<span class="${className}" data-index="${idx}" title="Index ${idx}: ${val}">${val}</span>`;
            }).join('')}
        </div>
    `;
}

/**
 * Get algorithm display name
 * @param {string} algorithm - Algorithm key
 * @returns {string} Display name
 */
function getAlgorithmName(algorithm) {
    const names = {
        'bubble': 'Bubble Sort',
        'insertion': 'Insertion Sort',
        'selection': 'Selection Sort',
        'merge': 'Merge Sort',
        'quick': 'Quick Sort',
        'heap': 'Heap Sort'
    };
    return names[algorithm] || algorithm;
}

// Make functions globally available
window.generateRandomArray = generateRandomArray;
window.startSorting = startSorting;
window.pauseVisualization = pauseVisualization;
window.stepForward = stepForward;
window.resetVisualization = resetVisualization;
window.setVisualizationTheme = setVisualizationTheme;
window.initializeVisualizer = initializeVisualizer;
window.resizeCanvas = resizeCanvas;
window.redrawVisualization = () => drawVisualization();
window.updateVisualizationTheme = updateVisualizationTheme;
