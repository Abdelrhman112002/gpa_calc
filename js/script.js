/**
 * GPA Calculator - Enhanced Edition
 * Features: Theme toggle, keyboard shortcuts, auto-focus, validation, tooltips
 */

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const inputs = document.querySelector('.inputs');
const calculateBtn = document.getElementById('calculateBtn');
const newCalculationBtn = document.getElementById('newCalculationBtn');
const resultModal = document.getElementById('resultModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const gpaResult = document.getElementById('gpaResult');
const gradeResult = document.getElementById('gradeResult');
const prevGpa = document.getElementById('prevGpa');
const prevHours = document.getElementById('prevHours');

// Configuration
const MAX_GPA = 4.0;
const INITIAL_ROWS = 3;
let rowCount = 0;

// ============== THEME MANAGEMENT ==============

/**
 * Initialize theme from local storage or system preference
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('gpa-calc-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('gpa-calc-theme', newTheme);
}

// ============== INPUT ROW MANAGEMENT ==============

/**
 * Create a new input row with grade and hours fields
 * @param {boolean} autoFocus - Whether to auto-focus the grade input
 * @returns {HTMLElement} The created row element
 */
function createInputRow(autoFocus = false) {
    rowCount++;
    const row = document.createElement('div');
    row.className = 'input-row animate__animated animate__fadeIn';
    row.id = `row-${rowCount}`;

    row.innerHTML = `
        <input 
            type="text" 
            inputmode="decimal"
            placeholder="Grade (0-4)" 
            class="grade-input" 
            autocomplete="off"
            aria-label="Subject grade for row ${rowCount}"
        >
        <input 
            type="number" 
            placeholder="Credit Hours" 
            class="hours-input" 
            min="0" 
            step="1"
            autocomplete="off"
            aria-label="Credit hours for row ${rowCount}"
        >
        <button 
            class="delete-btn" 
            onclick="deleteRow('row-${rowCount}')"
            aria-label="Delete this row"
        >
            <i class="fas fa-times"></i>
        </button>
    `;

    inputs.appendChild(row);

    // Add event listeners
    const gradeInput = row.querySelector('.grade-input');
    const hoursInput = row.querySelector('.hours-input');

    // Add validation listeners
    gradeInput.addEventListener('input', (e) => validateGradeInput(e.target));
    gradeInput.addEventListener('blur', (e) => validateGradeInput(e.target));
    hoursInput.addEventListener('input', (e) => validateHoursInput(e.target));
    hoursInput.addEventListener('blur', (e) => validateHoursInput(e.target));
    
    // Block non-integer characters for hours input
    hoursInput.addEventListener('keydown', (e) => {
        if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
        }
    });

    // Add Enter key support
    gradeInput.addEventListener('keydown', handleEnterKey);
    hoursInput.addEventListener('keydown', handleEnterKey);

    // Auto-focus if requested
    if (autoFocus) {
        setTimeout(() => {
            gradeInput.focus();
        }, 100);
        
        // Only scroll to show new row when user manually adds (not during init)
        const scrollContainer = document.querySelector('.scrollable-content');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }

    return row;
}

/**
 * Delete an input row by its ID
 * @param {string} rowId - The ID of the row to delete
 */
function deleteRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        // Add exit animation
        row.classList.remove('animate__fadeIn');
        row.classList.add('animate__fadeOut');
        
        setTimeout(() => {
            row.remove();
            // Ensure at least one row remains
            if (inputs.children.length === 0) {
                createInputRow();
            }
        }, 300);
    }
}

// ============== INPUT VALIDATION ==============

/**
 * Validate grade input (0-4)
 * @param {HTMLInputElement} input - The grade input element
 */
function validateGradeInput(input) {
    const value = parseFloat(input.value);
    
    // Remove any existing validation classes
    input.classList.remove('input-valid', 'input-invalid');
    
    if (input.value === '') {
        return; // Empty is neutral
    }
    
    if (isNaN(value) || value < 0 || value > MAX_GPA) {
        input.classList.add('input-invalid');
        showInputError(input, `Grade must be between 0 and ${MAX_GPA}`);
    } else {
        input.classList.add('input-valid');
        hideInputError(input);
    }
}

/**
 * Validate hours input (positive integer)
 * @param {HTMLInputElement} input - The hours input element
 */
function validateHoursInput(input) {
    const value = parseFloat(input.value);
    
    // Remove any existing validation classes
    input.classList.remove('input-valid', 'input-invalid');
    
    if (input.value === '') {
        return; // Empty is neutral
    }
    
    if (isNaN(value) || value < 0 || !Number.isInteger(value)) {
        input.classList.add('input-invalid');
        showInputError(input, 'Hours must be a positive whole number');
    } else {
        input.classList.add('input-valid');
        hideInputError(input);
    }
}

/**
 * Show error tooltip for input
 * @param {HTMLInputElement} input - The input element
 * @param {string} message - Error message to display
 */
function showInputError(input, message) {
    // Remove existing error tooltip
    hideInputError(input);
    
    const tooltip = document.createElement('div');
    tooltip.className = 'input-error-tooltip animate__animated animate__fadeIn';
    tooltip.textContent = message;
    
    input.parentElement.appendChild(tooltip);
}

/**
 * Hide error tooltip for input
 * @param {HTMLInputElement} input - The input element
 */
function hideInputError(input) {
    const existingTooltip = input.parentElement?.querySelector('.input-error-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
}


// ============== KEYBOARD SHORTCUTS ==============

/**
 * Handle Enter key press on inputs
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleEnterKey(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        
        // If Shift+Enter, add a new row
        if (e.shiftKey) {
            createInputRow(true);
            return;
        }
        
        // Check if this is the last hours input
        const row = e.target.closest('.input-row');
        const gradeInput = row.querySelector('.grade-input');
        const hoursInput = row.querySelector('.hours-input');
        
        if (e.target === gradeInput) {
            // Move to hours input
            hoursInput.focus();
        } else if (e.target === hoursInput) {
            // If this is the last row, add a new row
            const rows = Array.from(inputs.querySelectorAll('.input-row'));
            const lastRow = rows[rows.length - 1];
            
            if (row === lastRow) {
                // Add new row and focus it
                createInputRow(true);
            } else {
                // Move to next row's grade input
                const nextRow = row.nextElementSibling;
                if (nextRow) {
                    nextRow.querySelector('.grade-input').focus();
                }
            }
        }
    }
}

/**
 * Global keyboard shortcuts
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleGlobalKeyboard(e) {
    // Ctrl/Cmd + Enter to calculate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        calculateGPA();
    }
    
    // Escape to close modal
    if (e.key === 'Escape' && resultModal.classList.contains('show')) {
        closeModal();
    }
}

// ============== GPA CALCULATION ==============

/**
 * Calculate the GPA based on all inputs
 */
function calculateGPA() {
    const rows = inputs.querySelectorAll('.input-row');
    let totalPoints = 0;
    let totalHours = 0;
    let hasValidData = false;
    let hasErrors = false;

    rows.forEach(row => {
        const gradeInput = row.querySelector('.grade-input');
        const hoursInput = row.querySelector('.hours-input');
        
        const grade = parseFloat(gradeInput.value);
        const hours = parseInt(hoursInput.value);

        // Skip empty rows
        if (gradeInput.value === '' && hoursInput.value === '') {
            return;
        }

        // Check for validation errors
        if (gradeInput.classList.contains('input-invalid') || 
            hoursInput.classList.contains('input-invalid')) {
            hasErrors = true;
            return;
        }

        // Validate that both fields are filled
        if (gradeInput.value !== '' && hoursInput.value !== '') {
            if (!isNaN(grade) && !isNaN(hours) && hours > 0) {
                totalPoints += grade * hours;
                totalHours += hours;
                hasValidData = true;
            }
        } else if (gradeInput.value !== '' || hoursInput.value !== '') {
            // One field is filled but not the other
            hasErrors = true;
            if (gradeInput.value === '') {
                gradeInput.classList.add('input-invalid');
            }
            if (hoursInput.value === '') {
                hoursInput.classList.add('input-invalid');
            }
        }
    });

    if (hasErrors) {
        showNotification('Please fix the highlighted errors before calculating.', 'error');
        return;
    }

    if (!hasValidData) {
        showNotification('Please enter at least one complete subject with grade and hours.', 'warning');
        return;
    }

    // Calculate current semester GPA
    const currentGpa = totalPoints / totalHours;

    // Check for previous semester data
    const prevGpaValue = parseFloat(prevGpa.value);
    const prevHoursValue = parseInt(prevHours.value);

    let finalGpa = currentGpa;
    let finalHours = totalHours;

    if (!isNaN(prevGpaValue) && !isNaN(prevHoursValue) && prevHoursValue > 0) {
        // Calculate cumulative GPA
        const prevPoints = prevGpaValue * prevHoursValue;
        finalGpa = (prevPoints + totalPoints) / (prevHoursValue + totalHours);
        finalHours = prevHoursValue + totalHours;
    }

    // Display results
    displayResults(finalGpa, finalHours);
}

/**
 * Display the calculated GPA results
 * @param {number} gpa - The calculated GPA
 * @param {number} hours - Total credit hours
 */
function displayResults(gpa, hours) {
    const { letter, colorClass } = getGradeInfo(gpa);
    
    gpaResult.innerHTML = `<span class="${colorClass}">Cumulative GPA = ${gpa.toFixed(2)}</span>`;
    gradeResult.innerHTML = `<span class="${colorClass}">Grade: ${letter}</span> | Total Hours: ${hours}`;
    
    // Show modal
    resultModal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    showNotification('GPA calculated successfully!', 'success');
}

/**
 * Close the result modal
 */
function closeModal() {
    resultModal.classList.remove('show');
    document.body.style.overflow = ''; // Restore scrolling
}

/**
 * Get grade letter and color class based on GPA
 * @param {number} gpa - The GPA value
 * @returns {Object} Object with letter grade and CSS color class
 */
function getGradeInfo(gpa) {
    if (gpa >= 3.7) return { letter: 'A+', colorClass: 'grade-excellent' };
    if (gpa >= 3.5) return { letter: 'A', colorClass: 'grade-excellent' };
    if (gpa >= 3.3) return { letter: 'A-', colorClass: 'grade-excellent' };
    if (gpa >= 3.0) return { letter: 'B+', colorClass: 'grade-good' };
    if (gpa >= 2.7) return { letter: 'B', colorClass: 'grade-good' };
    if (gpa >= 2.3) return { letter: 'B-', colorClass: 'grade-average' };
    if (gpa >= 2.0) return { letter: 'C+', colorClass: 'grade-average' };
    if (gpa >= 1.7) return { letter: 'C', colorClass: 'grade-warning' };
    if (gpa >= 1.3) return { letter: 'C-', colorClass: 'grade-warning' };
    if (gpa >= 1.0) return { letter: 'D', colorClass: 'grade-danger' };
    return { letter: 'F', colorClass: 'grade-danger' };
}

/**
 * Reset the calculator to initial state
 */
function resetCalculator() {
    // Close modal
    closeModal();
    
    // Clear all inputs
    prevGpa.value = '';
    prevHours.value = '';
    prevGpa.classList.remove('input-valid', 'input-invalid');
    prevHours.classList.remove('input-valid', 'input-invalid');
    
    // Remove all rows and create fresh ones
    inputs.innerHTML = '';
    
    for (let i = 0; i < INITIAL_ROWS; i++) {
        createInputRow(i === 0);
    }
}

// ============== NOTIFICATION SYSTEM ==============

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - Type of notification: 'success', 'error', 'warning', 'info'
 */
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} animate__animated animate__slideInRight`;
    
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${iconMap[type]}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('animate__slideInRight');
        notification.classList.add('animate__slideOutRight');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ============== ADD SUBJECT BUTTON ==============

/**
 * Create the Add Subject button
 */
function createAddSubjectButton() {
    const buttonRow = document.querySelector('.button-row');
    
    const addBtn = document.createElement('button');
    addBtn.className = 'add-row-btn';
    addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Subject';
    addBtn.addEventListener('click', () => createInputRow(true));
    
    // Insert before calculate button
    buttonRow.insertBefore(addBtn, calculateBtn);
}

// ============== INITIALIZATION ==============

/**
 * Initialize the application
 */
function init() {
    // Initialize theme
    initializeTheme();
    
    // Add theme toggle listener
    themeToggle.addEventListener('click', toggleTheme);
    
    // Create initial rows (no auto-focus to keep scroll at top)
    for (let i = 0; i < INITIAL_ROWS; i++) {
        createInputRow(false);
    }
    
    // Ensure scroll is at top to show Previous Semesters first
    const scrollContainer = document.querySelector('.scrollable-content');
    if (scrollContainer) {
        scrollContainer.scrollTop = 0;
    }
    
    // Create Add Subject button
    createAddSubjectButton();
    
    // Add calculate button listener
    calculateBtn.addEventListener('click', calculateGPA);
    
    // Add new calculation button listener
    newCalculationBtn.addEventListener('click', resetCalculator);
    
    // Add modal close button listener
    modalCloseBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    resultModal.addEventListener('click', (e) => {
        if (e.target === resultModal) {
            closeModal();
        }
    });
    
    // Add global keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeyboard);
    
    // Add validation to previous semester inputs
    prevGpa.addEventListener('input', () => {
        const value = parseFloat(prevGpa.value);
        prevGpa.classList.remove('input-valid', 'input-invalid');
        if (prevGpa.value !== '') {
            if (isNaN(value) || value < 0 || value > MAX_GPA) {
                prevGpa.classList.add('input-invalid');
            } else {
                prevGpa.classList.add('input-valid');
            }
        }
    });
    
    prevHours.addEventListener('input', () => {
        const value = parseInt(prevHours.value);
        prevHours.classList.remove('input-valid', 'input-invalid');
        if (prevHours.value !== '') {
            if (isNaN(value) || value < 0) {
                prevHours.classList.add('input-invalid');
            } else {
                prevHours.classList.add('input-valid');
            }
        }
    });
    
    // Block non-integer characters for prevHours
    prevHours.addEventListener('keydown', (e) => {
        if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
        }
    });
    
    console.log('GPA Calculator initialized successfully! 🎓');
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
