/**
 * Algorithm Information and Educational Content Manager
 * Handles algorithm details, code examples, complexity information, and modal display
 */

// Algorithm data cache
let algorithmCache = {};

/**
 * Load algorithm information from server
 * @param {string} algorithm - Algorithm name
 */
async function loadAlgorithmInfo(algorithm) {
    try {
        // Check cache first
        if (algorithmCache[algorithm]) {
            displayAlgorithmInfo(algorithmCache[algorithm]);
            return;
        }

        const response = await fetch(`/api/algorithm-info/${algorithm}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Cache the data
        algorithmCache[algorithm] = data;
        
        // Display the information
        displayAlgorithmInfo(data);
        
    } catch (error) {
        console.error('Error loading algorithm info:', error);
        displayAlgorithmError(error.message);
    }
}

/**
 * Display algorithm information in the info panel
 * @param {Object} data - Algorithm data
 */
function displayAlgorithmInfo(data) {
    const algorithmDetails = document.getElementById('algorithmDetails');
    if (!algorithmDetails) return;
    
    const html = `
        <div class="algorithm-info">
            <h6 class="text-primary mb-3">
                <i class="fas fa-code me-2"></i>
                ${data.name}
            </h6>
            
            <div class="mb-3">
                <h6 class="text-muted mb-2">Description</h6>
                <p class="small">${data.description}</p>
            </div>
            
            <div class="mb-3">
                <h6 class="text-muted mb-2">Time Complexity</h6>
                <div class="complexity-display">
                    <div class="complexity-item">
                        <span class="complexity-best">Best: ${data.time_complexity.best}</span>
                    </div>
                    <div class="complexity-item">
                        <span class="complexity-average">Avg: ${data.time_complexity.average}</span>
                    </div>
                    <div class="complexity-item">
                        <span class="complexity-worst">Worst: ${data.time_complexity.worst}</span>
                    </div>
                </div>
            </div>
            
            <div class="mb-3">
                <h6 class="text-muted mb-2">Properties</h6>
                <div class="algorithm-properties">
                    <span class="badge ${data.stable ? 'bg-success' : 'bg-secondary'} me-1">
                        ${data.stable ? 'Stable' : 'Unstable'}
                    </span>
                    <span class="badge ${data.adaptive ? 'bg-info' : 'bg-secondary'} me-1">
                        ${data.adaptive ? 'Adaptive' : 'Non-adaptive'}
                    </span>
                    <span class="badge bg-primary">Space: ${data.space_complexity}</span>
                </div>
            </div>
            
            <div class="mb-3">
                <h6 class="text-muted mb-2">Applications</h6>
                <ul class="small mb-0">
                    ${data.applications.map(app => `<li>${app}</li>`).join('')}
                </ul>
            </div>
            
            <div class="text-center">
                <button class="btn btn-outline-primary btn-sm" onclick="showCurrentAlgorithmModal()">
                    <i class="fas fa-info-circle me-1"></i>
                    View Details
                </button>
            </div>
        </div>
    `;
    
    algorithmDetails.innerHTML = html;
}

/**
 * Display error message in algorithm info panel
 * @param {string} message - Error message
 */
function displayAlgorithmError(message) {
    const algorithmDetails = document.getElementById('algorithmDetails');
    if (!algorithmDetails) return;
    
    algorithmDetails.innerHTML = `
        <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Failed to load algorithm information: ${message}
        </div>
    `;
}

/**
 * Show modal for currently selected algorithm
 */
async function showCurrentAlgorithmModal() {
    const algorithmSelect = document.getElementById('algorithmSelect');
    const algorithm = algorithmSelect ? algorithmSelect.value : 'bubble';
    await showAlgorithmModal(algorithm);
}

/**
 * Show detailed algorithm modal
 * @param {string} algorithm - Algorithm name
 */
async function showAlgorithmModal(algorithm) {
    const modal = document.getElementById('algorithmModal');
    const modalTitle = document.getElementById('algorithmModalTitle');
    const modalContent = document.getElementById('algorithmModalContent');
    
    if (!modal || !modalTitle || !modalContent) {
        console.error('Modal elements not found');
        return;
    }
    
    try {
        // Get algorithm data
        let data = algorithmCache[algorithm];
        if (!data) {
            data = await loadAlgorithmData(algorithm);
            algorithmCache[algorithm] = data;
        }
        
        modalTitle.textContent = data.name;
        modalContent.innerHTML = generateModalContent(data);
        
        // Initialize code tabs
        initializeCodeTabs();
        
        // Show modal using Bootstrap
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
    } catch (error) {
        console.error('Error showing algorithm modal:', error);
        showNotification('Failed to load algorithm details', 'error');
    }
}

/**
 * Load algorithm data if not cached
 * @param {string} algorithm - Algorithm name
 * @returns {Object} Algorithm data
 */
async function loadAlgorithmData(algorithm) {
    const response = await fetch(`/api/algorithm-info/${algorithm}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error);
    }
    return data;
}

/**
 * Generate modal content HTML
 * @param {Object} data - Algorithm data
 * @returns {string} HTML content
 */
function generateModalContent(data) {
    return `
        <div class="algorithm-modal-content">
            <!-- Description -->
            <div class="mb-4">
                <h5><i class="fas fa-info-circle text-primary me-2"></i>Overview</h5>
                <p>${data.description}</p>
            </div>
            
            <!-- Complexity Table -->
            <div class="mb-4">
                <h5><i class="fas fa-chart-line text-info me-2"></i>Complexity Analysis</h5>
                <div class="table-responsive">
                    <table class="table table-bordered complexity-table">
                        <thead>
                            <tr>
                                <th>Case</th>
                                <th>Time Complexity</th>
                                <th>Space Complexity</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Best</td>
                                <td class="complexity-best">${data.time_complexity.best}</td>
                                <td rowspan="3" class="text-center">${data.space_complexity}</td>
                            </tr>
                            <tr>
                                <td>Average</td>
                                <td class="complexity-average">${data.time_complexity.average}</td>
                            </tr>
                            <tr>
                                <td>Worst</td>
                                <td class="complexity-worst">${data.time_complexity.worst}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Properties -->
            <div class="mb-4">
                <h5><i class="fas fa-cogs text-secondary me-2"></i>Properties</h5>
                <div class="row">
                    <div class="col-md-6">
                        <div class="property-item">
                            <strong>Stability:</strong> 
                            <span class="badge ${data.stable ? 'bg-success' : 'bg-danger'}">
                                ${data.stable ? 'Stable' : 'Unstable'}
                            </span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="property-item">
                            <strong>Adaptivity:</strong> 
                            <span class="badge ${data.adaptive ? 'bg-info' : 'bg-secondary'}">
                                ${data.adaptive ? 'Adaptive' : 'Non-adaptive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Applications -->
            <div class="mb-4">
                <h5><i class="fas fa-lightbulb text-warning me-2"></i>Real-world Applications</h5>
                <ul>
                    ${data.applications.map(app => `<li>${app}</li>`).join('')}
                </ul>
            </div>
            
            <!-- Code Examples -->
            <div class="mb-4">
                <h5><i class="fas fa-code text-success me-2"></i>Implementation</h5>
                ${generateCodeTabs(data.code)}
            </div>
            
            <!-- Download Buttons -->
            <div class="text-center">
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-primary" onclick="downloadCode('${data.name}', 'python')">
                        <i class="fab fa-python me-1"></i>
                        Python
                    </button>
                    <button class="btn btn-outline-warning" onclick="downloadCode('${data.name}', 'javascript')">
                        <i class="fab fa-js me-1"></i>
                        JavaScript
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate code tabs HTML
 * @param {Object} code - Code examples object
 * @returns {string} HTML for code tabs
 */
function generateCodeTabs(code) {
    const languages = Object.keys(code);
    
    return `
        <div class="code-section">
            <ul class="nav nav-tabs code-tabs" role="tablist">
                ${languages.map((lang, index) => `
                    <li class="nav-item">
                        <button class="nav-link code-tab ${index === 0 ? 'active' : ''}" 
                                data-bs-toggle="tab" 
                                data-bs-target="#code-${lang}" 
                                type="button" 
                                role="tab">
                            <i class="fab fa-${getLanguageIcon(lang)} me-1"></i>
                            ${capitalizeFirst(lang)}
                        </button>
                    </li>
                `).join('')}
            </ul>
            <div class="tab-content">
                ${languages.map((lang, index) => `
                    <div class="tab-pane fade ${index === 0 ? 'show active' : ''}" 
                         id="code-${lang}" 
                         role="tabpanel">
                        <div class="code-block">
                            <div class="code-header d-flex justify-content-between align-items-center mb-2">
                                <span class="text-muted">${capitalizeFirst(lang)} Implementation</span>
                                <button class="btn btn-sm btn-outline-secondary" onclick="copyCode('code-${lang}')">
                                    <i class="fas fa-copy me-1"></i>Copy
                                </button>
                            </div>
                            <pre><code class="language-${lang}">${escapeHtml(code[lang])}</code></pre>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Initialize code tab functionality
 */
function initializeCodeTabs() {
    // Bootstrap tabs are automatically initialized
    // Add any additional code tab functionality here
}

/**
 * Download code for specific language
 * @param {string} algorithmName - Algorithm name
 * @param {string} language - Programming language
 */
function downloadCode(algorithmName, language) {
    const algorithm = algorithmName.toLowerCase().replace(' ', '');
    const data = algorithmCache[algorithm];
    
    if (!data || !data.code[language]) {
        showNotification('Code not available for this language', 'warning');
        return;
    }
    
    const code = data.code[language];
    const extension = getFileExtension(language);
    const filename = `${algorithm}_sort.${extension}`;
    
    downloadAsFile(code, filename, 'text/plain');
}

/**
 * Copy code to clipboard
 * @param {string} codeElementId - ID of code element
 */
async function copyCode(codeElementId) {
    const codeElement = document.querySelector(`#${codeElementId} code`);
    if (!codeElement) return;
    
    const code = codeElement.textContent;
    const success = await copyToClipboard(code);
    
    if (success) {
        // Temporarily change button text
        const button = document.querySelector(`#${codeElementId} .btn`);
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check me-1"></i>Copied!';
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 2000);
        }
    }
}

/**
 * Get language icon for Font Awesome
 * @param {string} language - Programming language
 * @returns {string} Icon class
 */
function getLanguageIcon(language) {
    const icons = {
        'python': 'python',
        'javascript': 'js',
        'java': 'java',
        'cpp': 'code',
        'c': 'code'
    };
    return icons[language] || 'code';
}

/**
 * Get file extension for language
 * @param {string} language - Programming language
 * @returns {string} File extension
 */
function getFileExtension(language) {
    const extensions = {
        'python': 'py',
        'javascript': 'js',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c'
    };
    return extensions[language] || 'txt';
}

/**
 * Capitalize first letter of string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Escape HTML characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show algorithm comparison modal
 * @param {Array} algorithms - Array of algorithm names to compare
 */
function showAlgorithmComparison(algorithms) {
    // This could be implemented for advanced comparison features
    console.log('Algorithm comparison not yet implemented');
}

/**
 * Get algorithm recommendation based on array characteristics
 * @param {Array} array - Input array
 * @returns {string} Recommended algorithm
 */
function getAlgorithmRecommendation(array) {
    if (!array || array.length === 0) return 'bubble';
    
    const size = array.length;
    const isNearlySorted = checkIfNearlySorted(array);
    const hasUniqueValues = new Set(array).size === array.length;
    
    // Simple recommendation logic
    if (size <= 10) {
        return isNearlySorted ? 'insertion' : 'selection';
    } else if (size <= 50) {
        return isNearlySorted ? 'insertion' : 'quick';
    } else {
        return isNearlySorted ? 'insertion' : 'merge';
    }
}

/**
 * Check if array is nearly sorted
 * @param {Array} array - Input array
 * @returns {boolean} True if nearly sorted
 */
function checkIfNearlySorted(array) {
    if (array.length <= 1) return true;
    
    let inversions = 0;
    const threshold = array.length * 0.1; // 10% threshold
    
    for (let i = 0; i < array.length - 1; i++) {
        for (let j = i + 1; j < array.length; j++) {
            if (array[i] > array[j]) {
                inversions++;
                if (inversions > threshold) return false;
            }
        }
    }
    
    return true;
}

/**
 * Generate educational quiz questions
 * @param {string} algorithm - Algorithm name
 * @returns {Array} Array of quiz questions
 */
function generateQuizQuestions(algorithm) {
    const quizData = {
        'bubble': [
            {
                question: "What is the best-case time complexity of Bubble Sort?",
                options: ["O(n)", "O(n²)", "O(n log n)", "O(log n)"],
                correct: 0,
                explanation: "In the best case (already sorted array), Bubble Sort can detect this in O(n) time with optimization."
            },
            {
                question: "Is Bubble Sort a stable sorting algorithm?",
                options: ["Yes", "No"],
                correct: 0,
                explanation: "Bubble Sort is stable because it only swaps adjacent elements when they are in wrong order."
            }
        ],
        'quick': [
            {
                question: "What is the worst-case time complexity of Quick Sort?",
                options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
                correct: 2,
                explanation: "Quick Sort's worst case is O(n²) when the pivot is always the smallest or largest element."
            }
        ]
        // Add more quiz questions for other algorithms
    };
    
    return quizData[algorithm] || [];
}

// Make functions globally available
window.loadAlgorithmInfo = loadAlgorithmInfo;
window.showAlgorithmModal = showAlgorithmModal;
window.showCurrentAlgorithmModal = showCurrentAlgorithmModal;
window.downloadCode = downloadCode;
window.copyCode = copyCode;
window.getAlgorithmRecommendation = getAlgorithmRecommendation;
window.generateQuizQuestions = generateQuizQuestions;

