document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
    setupThemeToggle();
    setupEventListeners();
});

function initializeCalculator() {
    const inputsContainer = document.querySelector('.inputs');
    
    // Create add row button with enhanced styling
    const addRowBtn = document.createElement('button');
    addRowBtn.textContent = '+ Add Subject';
    addRowBtn.className = 'add-row-btn animate__animated animate__fadeIn';
    addRowBtn.onclick = addNewRow;
    
    // Add initial rows
    for (let i = 1; i <= 3; i++) {
        addNewRow();
    }
    
    // Insert add button before calculate button
    document.querySelector('.calculator').insertBefore(addRowBtn, document.getElementById('calculateBtn'));
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Apply saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function setupEventListeners() {
    const inputsContainer = document.querySelector('.inputs');
    
    // Input validation with enhanced user feedback
    inputsContainer.addEventListener('input', function(e) {
        if (e.target.classList.contains('grade')) {
            validateGradeInput(e.target);
        }
        if (e.target.classList.contains('hours')) {
            validateHoursInput(e.target);
        }
    });

    document.getElementById('calculateBtn').addEventListener('click', calculateGPA);
    document.getElementById('newCalculationBtn').addEventListener('click', startNewCalculation);
}

// Enhanced input validation functions
function validateGradeInput(input) {
    // Allow typing decimal point and numbers
    let value = input.value;
    
    // Only proceed with validation if the input isn't just a decimal point
    if (value !== '.') {
        // Remove any non-numeric characters except decimal point
        value = value.replace(/[^\d.]/g, '');
        
        // Ensure only one decimal point
        const decimalCount = (value.match(/\./g) || []).length;
        if (decimalCount > 1) {
            value = value.substring(0, value.lastIndexOf('.'));
        }
        
        // Convert to number and validate range only if we have a valid number
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            if (numValue > 4) {
                value = '4';
                showAlert('Maximum grade is 4.0');
            }
            if (numValue < 0) {
                value = '0';
            }
            
            // Only format if it's not currently being typed
            if (value.indexOf('.') !== value.length - 1) {
                // Format to 2 decimal places if it's a decimal number
                if (!Number.isInteger(numValue)) {
                    value = Math.round(numValue * 100) / 100;
                }
            }
        }
    }
    
    input.value = value;
}

function validateHoursInput(input) {
    let value = input.value.replace(/[^0-9]/g, '');
    value = parseInt(value);
    if (isNaN(value)) value = '';
    if (value < 1) value = 1;
    input.value = value;
}

function addNewRow() {
    const inputsContainer = document.querySelector('.inputs');
    const row = document.createElement('div');
    row.className = 'input-row animate__animated animate__fadeInDown';
    
    const gradeInput = document.createElement('input');
    gradeInput.type = 'text';  // Keep as text type
    gradeInput.inputMode = 'decimal';
    gradeInput.placeholder = 'Grade (0-4)';
    gradeInput.className = 'grade';
    gradeInput.autocomplete = 'off';
    // Remove pattern attribute to allow easier decimal input
    
    const hoursInput = document.createElement('input');
    hoursInput.type = 'number';
    hoursInput.min = '1';
    hoursInput.placeholder = 'Credit Hours';
    hoursInput.className = 'hours';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '×';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = function() {
        if (document.querySelectorAll('.input-row').length > 1) {
            row.classList.add('animate__fadeOutRight');
            setTimeout(() => row.remove(), 500);
        } else {
            showAlert('You must have at least one subject!');
        }
    };
    
    row.appendChild(gradeInput);
    row.appendChild(hoursInput);
    row.appendChild(deleteBtn);
    inputsContainer.appendChild(row);
}

function showAlert(message) {
    // Remove any existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alert = document.createElement('div');
    alert.className = 'alert animate__animated animate__fadeIn';
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.left = '50%';
    alert.style.transform = 'translateX(-50%)';
    alert.style.backgroundColor = '#dc3545';
    alert.style.color = 'white';
    alert.style.padding = '10px 20px';
    alert.style.borderRadius = '5px';
    alert.style.zIndex = '1000';
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.add('animate__fadeOut');
        setTimeout(() => alert.remove(), 500);
    }, 2000);
}

function getGradeLetter(gpa) {
    if (gpa >= 3.70) return 'A';
    if (gpa >= 3.30) return 'A-';
    if (gpa >= 3.00) return 'B+';
    if (gpa >= 2.70) return 'B';
    if (gpa >= 2.30) return 'B-';
    if (gpa >= 2.00) return 'C+';
    if (gpa >= 1.70) return 'C';
    if (gpa >= 1.30) return 'C-';
    if (gpa >= 1.00) return 'D+';
    if (gpa > 0.00) return 'D';
    return 'F';
}

function calculateGPA() {
    let totalPoints = 0;
    let totalHours = 0;
    let hasValidInput = false;
    
    const gradeInputs = document.querySelectorAll('.grade');
    const hoursInputs = document.querySelectorAll('.hours');
    const resultsDiv = document.querySelector('.results');
    
    for (let i = 0; i < gradeInputs.length; i++) {
        const gradeValue = gradeInputs[i].value.trim();
        const hoursValue = hoursInputs[i].value.trim();
        
        // Check if both fields have actual input
        if (gradeValue !== '' && hoursValue !== '') {
            const grade = parseFloat(gradeValue);
            const hours = parseInt(hoursValue);
            
            // Include in calculation if grade is valid (including 0) and hours > 0
            if (!isNaN(grade) && grade >= 0 && hours > 0) {
                hasValidInput = true;
                totalPoints += grade * hours;
                totalHours += hours;
            }
        }
    }
    
    if (!hasValidInput) {
        showAlert('Please enter at least one valid grade and hours');
        resultsDiv.classList.remove('show');
        return;
    }
    
    const gpa = totalPoints / totalHours;
    const roundedGPA = Math.round(gpa * 100) / 100;
    const gradeLetter = getGradeLetter(gpa);
    
    const gpaResult = document.getElementById('gpaResult');
    const gradeResult = document.getElementById('gradeResult');
    
    gpaResult.textContent = `Your GPA = ${roundedGPA}`;
    gradeResult.textContent = `Your Grade: ${gradeLetter}`;
    
    // Show results with animation
    resultsDiv.classList.add('show');
    
    // Add animation to results text
    [gpaResult, gradeResult].forEach(el => {
        el.classList.add('animate__animated', 'animate__fadeIn');
        setTimeout(() => el.classList.remove('animate__animated', 'animate__fadeIn'), 1000);
    });
}

function startNewCalculation() {
    // Clear all input fields
    const inputs = document.querySelectorAll('.grade, .hours');
    inputs.forEach(input => input.value = '');
    
    // Hide results
    const resultsDiv = document.querySelector('.results');
    resultsDiv.classList.remove('show');
    
    // Reset to initial 3 rows
    const inputsContainer = document.querySelector('.inputs');
    inputsContainer.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
        addNewRow();
    }
    
    // Scroll to top smoothly
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Add fade-in animation to new rows
    const newRows = document.querySelectorAll('.input-row');
    newRows.forEach(row => {
        row.classList.add('animate__animated', 'animate__fadeInDown');
    });
}
