/**
 * Game Mode - Racing functionality for sorting algorithms
 * Handles algorithm races, visualization, and results display
 */

// Game mode state
let gameState = {
    raceArray: [],
    selectedAlgorithms: [],
    raceResults: {},
    isRacing: false,
    raceCanvases: {}
};

/**
 * Generate random array for race mode
 */
function generateRaceArray() {
    const sizeInput = document.getElementById('raceArraySize');
    const size = sizeInput ? parseInt(sizeInput.value) || 30 : 30;
    
    // Generate array with values between 10 and 100
    const array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 90) + 10);
    }
    
    gameState.raceArray = array;
    
    // Display the array
    displayRaceArray(array);
    
    showNotification(`Generated race array with ${size} elements`, 'success', 2000);
}

/**
 * Display the race array
 * @param {Array} array - Array to display
 */
function displayRaceArray(array) {
    const raceTrack = document.getElementById('raceTrack');
    if (!raceTrack) return;
    
    raceTrack.innerHTML = `
        <div class="race-array-display mb-4">
            <h6 class="text-muted mb-2">Race Array (${array.length} elements):</h6>
            <div class="array-values p-3 bg-light rounded">
                ${array.map((val, idx) => `<span class="array-element badge bg-primary me-1" data-index="${idx}">${val}</span>`).join('')}
            </div>
        </div>
        <div id="raceVisualization">
            <p class="text-muted text-center">Select algorithms and click "Start Race!" to begin</p>
        </div>
    `;
}

/**
 * Start the algorithm race
 */
async function startRace() {
    if (gameState.isRacing) {
        return;
    }
    
    // Get selected algorithms
    const selectedAlgos = getSelectedAlgorithms();
    if (selectedAlgos.length < 2) {
        showNotification('Please select at least 2 algorithms to race', 'warning');
        return;
    }
    
    if (gameState.raceArray.length === 0) {
        showNotification('Please generate a race array first', 'warning');
        return;
    }
    
    gameState.selectedAlgorithms = selectedAlgos;
    gameState.isRacing = true;
    
    // Update UI
    updateRaceControls();
    showNotification(`Starting race with ${selectedAlgos.length} algorithms...`, 'info', 2000);
    
    try {
        // Send race request to server
        const response = await fetch('/api/race', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                algorithms: selectedAlgos,
                array: gameState.raceArray
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const raceResults = await response.json();
        
        if (raceResults.error) {
            throw new Error(raceResults.error);
        }
        
        gameState.raceResults = raceResults;
        
        // Display race visualization
        displayRaceVisualization(raceResults);
        
        // Show results
        displayRaceResults(raceResults);
        
    } catch (error) {
        console.error('Error starting race:', error);
        showNotification('Error starting race: ' + error.message, 'error');
    }
    
    gameState.isRacing = false;
    updateRaceControls();
}

/**
 * Get selected algorithms from checkboxes
 * @returns {Array} Array of selected algorithm names
 */
function getSelectedAlgorithms() {
    const checkboxes = document.querySelectorAll('.algorithm-checkboxes input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Display race visualization
 * @param {Object} raceResults - Results from race API
 */
function displayRaceVisualization(raceResults) {
    const raceTrack = document.getElementById('raceTrack');
    if (!raceTrack) return;
    
    const results = raceResults.results;
    const winner = raceResults.winner;
    
    let visualizationHtml = `
        <div class="race-array-display mb-4">
            <h6 class="text-muted mb-2">Race Array (${gameState.raceArray.length} elements):</h6>
            <div class="array-values p-3 bg-light rounded">
                ${gameState.raceArray.map((val, idx) => `<span class="array-element badge bg-secondary me-1">${val}</span>`).join('')}
            </div>
        </div>
        <div class="race-lanes">
    `;
    
    // Create a lane for each algorithm
    Object.entries(results).forEach(([algorithm, result], index) => {
        const isWinner = algorithm === winner;
        const algorithmName = getAlgorithmDisplayName(algorithm);
        
        visualizationHtml += `
            <div class="race-lane ${isWinner ? 'race-winner' : ''} mb-3">
                <div class="race-lane-header">
                    <div class="race-algorithm-info">
                        <h6 class="race-algorithm-name mb-1">
                            ${isWinner ? '<i class="fas fa-trophy text-warning me-2"></i>' : ''}
                            ${algorithmName}
                            ${isWinner ? ' <span class="badge bg-success">WINNER!</span>' : ''}
                        </h6>
                        <div class="race-stats">
                            <span class="me-3"><i class="fas fa-exchange-alt me-1"></i>Comparisons: ${formatNumber(result.comparisons)}</span>
                            <span class="me-3"><i class="fas fa-random me-1"></i>Swaps: ${formatNumber(result.swaps)}</span>
                            <span><i class="fas fa-stopwatch me-1"></i>Time: ${formatExecutionTime(result.execution_time)}</span>
                        </div>
                    </div>
                    ${isWinner ? '<div class="race-progress">100%</div>' : ''}
                </div>
                <div class="race-visualization">
                    <canvas class="race-canvas" id="raceCanvas${index}" width="800" height="60"></canvas>
                </div>
                <div class="sorted-array mt-2">
                    <small class="text-muted">Final sorted array:</small>
                    <div class="sorted-values">
                        ${result.sorted_array.slice(0, 20).map(val => `<span class="badge bg-success me-1">${val}</span>`).join('')}
                        ${result.sorted_array.length > 20 ? '<span class="text-muted">...</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    visualizationHtml += `</div>`;
    
    raceTrack.innerHTML = visualizationHtml;
    
    // Draw final sorted arrays on canvases
    Object.entries(results).forEach(([algorithm, result], index) => {
        const canvas = document.getElementById(`raceCanvas${index}`);
        if (canvas) {
            drawRaceResult(canvas, result.sorted_array, algorithm === winner);
        }
    });
}

/**
 * Draw race result on canvas
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Array} array - Sorted array
 * @param {boolean} isWinner - Whether this algorithm won
 */
function drawRaceResult(canvas, array, isWinner) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = isWinner ? '#d4edda' : '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    if (array.length === 0) return;
    
    const maxValue = Math.max(...array);
    const barWidth = width / array.length;
    const margin = 5;
    
    array.forEach((value, index) => {
        const barHeight = ((value / maxValue) * (height - 2 * margin));
        const x = index * barWidth;
        const y = height - margin - barHeight;
        
        // Draw bar
        ctx.fillStyle = isWinner ? '#28a745' : '#007bff';
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
        
        // Draw outline
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x + 1, y, barWidth - 2, barHeight);
    });
}

/**
 * Display race results panel
 * @param {Object} raceResults - Results from race API
 */
function displayRaceResults(raceResults) {
    const resultsPanel = document.getElementById('raceResults');
    const winnerAnnouncement = document.getElementById('winnerAnnouncement');
    const raceStatistics = document.getElementById('raceStatistics');
    
    if (!resultsPanel || !winnerAnnouncement || !raceStatistics) return;
    
    resultsPanel.style.display = 'block';
    
    const winner = raceResults.winner;
    const results = raceResults.results;
    
    // Winner announcement
    if (winner) {
        const winnerName = getAlgorithmDisplayName(winner);
        winnerAnnouncement.innerHTML = `
            <div class="winner-card">
                <div class="trophy-icon mb-3">
                    <i class="fas fa-trophy fa-3x text-warning"></i>
                </div>
                <h4 class="text-primary mb-2">${winnerName} Wins!</h4>
                <p class="text-muted">Fastest execution time: ${formatExecutionTime(raceResults.fastest_time)}</p>
            </div>
        `;
    }
    
    // Race statistics
    let statsHtml = '<div class="table-responsive"><table class="table table-sm table-striped">';
    statsHtml += `
        <thead>
            <tr>
                <th>Algorithm</th>
                <th>Time</th>
                <th>Comparisons</th>
                <th>Swaps</th>
                <th>Rank</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    // Sort results by execution time
    const sortedResults = Object.entries(results)
        .filter(([, result]) => !result.error)
        .sort(([, a], [, b]) => a.execution_time - b.execution_time);
    
    sortedResults.forEach(([algorithm, result], index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
        
        statsHtml += `
            <tr class="${rank === 1 ? 'table-success' : ''}">
                <td><strong>${getAlgorithmDisplayName(algorithm)}</strong></td>
                <td>${formatExecutionTime(result.execution_time)}</td>
                <td>${formatNumber(result.comparisons)}</td>
                <td>${formatNumber(result.swaps)}</td>
                <td>${medal}</td>
            </tr>
        `;
    });
    
    statsHtml += '</tbody></table></div>';
    raceStatistics.innerHTML = statsHtml;
}

/**
 * Update race control buttons
 */
function updateRaceControls() {
    const startRaceBtn = document.querySelector('button[onclick="startRace()"]');
    if (startRaceBtn) {
        if (gameState.isRacing) {
            startRaceBtn.disabled = true;
            startRaceBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Racing...';
        } else {
            startRaceBtn.disabled = false;
            startRaceBtn.innerHTML = '<i class="fas fa-flag-checkered me-2"></i>Start Race!';
        }
    }
}

/**
 * Get algorithm display name
 * @param {string} algorithm - Algorithm key
 * @returns {string} Display name
 */
function getAlgorithmDisplayName(algorithm) {
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

/**
 * Reset race
 */
function resetRace() {
    gameState.raceArray = [];
    gameState.selectedAlgorithms = [];
    gameState.raceResults = {};
    gameState.isRacing = false;
    
    // Hide results panel
    const resultsPanel = document.getElementById('raceResults');
    if (resultsPanel) {
        resultsPanel.style.display = 'none';
    }
    
    // Clear race track
    const raceTrack = document.getElementById('raceTrack');
    if (raceTrack) {
        raceTrack.innerHTML = '<p class="text-muted text-center">Generate a race array to begin</p>';
    }
    
    updateRaceControls();
    showNotification('Race reset', 'info', 1500);
}

// Make functions globally available
window.generateRaceArray = generateRaceArray;
window.startRace = startRace;
window.resetRace = resetRace;

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Generate initial race array
    setTimeout(() => {
        generateRaceArray();
    }, 1000);
});