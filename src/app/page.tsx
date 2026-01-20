'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

// Types
interface SubjectRow {
  id: number;
  grade: string;
  hours: string;
  gradeValid: boolean | null;
  hoursValid: boolean | null;
}

interface GradeInfo {
  letter: string;
  colorClass: string;
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

// Configuration
const MAX_GPA = 4.0;
const INITIAL_ROWS = 3;

export default function GPACalculator() {
  // State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [rows, setRows] = useState<SubjectRow[]>([]);
  const [prevGpa, setPrevGpa] = useState('');
  const [prevHours, setPrevHours] = useState('');
  const [prevGpaValid, setPrevGpaValid] = useState<boolean | null>(null);
  const [prevHoursValid, setPrevHoursValid] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [gpaResult, setGpaResult] = useState({ value: 0, hours: 0, letter: '', colorClass: '' });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rowIdCounter, setRowIdCounter] = useState(0);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize theme and rows
  useEffect(() => {
    const savedTheme = localStorage.getItem('gpa-calc-theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Create initial rows
    const initialRows: SubjectRow[] = [];
    for (let i = 0; i < INITIAL_ROWS; i++) {
      initialRows.push({
        id: i + 1,
        grade: '',
        hours: '',
        gradeValid: null,
        hoursValid: null,
      });
    }
    setRows(initialRows);
    setRowIdCounter(INITIAL_ROWS);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gpa-calc-theme', theme);
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Show notification
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  // Remove notification
  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Validate grade input
  const validateGrade = (value: string): boolean | null => {
    if (value === '') return null;
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= MAX_GPA;
  };

  // Validate hours input
  const validateHours = (value: string): boolean | null => {
    if (value === '') return null;
    const num = parseInt(value);
    return !isNaN(num) && num >= 0 && Number.isInteger(parseFloat(value));
  };

  // Update row
  const updateRow = (id: number, field: 'grade' | 'hours', value: string) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      
      if (field === 'grade') {
        return { ...row, grade: value, gradeValid: validateGrade(value) };
      } else {
        // Filter non-integer characters
        const filtered = value.replace(/[^0-9]/g, '');
        return { ...row, hours: filtered, hoursValid: validateHours(filtered) };
      }
    }));
  };

  // Add new row
  const addRow = () => {
    const newId = rowIdCounter + 1;
    setRowIdCounter(newId);
    setRows(prev => [...prev, {
      id: newId,
      grade: '',
      hours: '',
      gradeValid: null,
      hoursValid: null,
    }]);
    
    // Scroll to bottom
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  // Delete row
  const deleteRow = (id: number) => {
    setRows(prev => {
      const newRows = prev.filter(row => row.id !== id);
      // Ensure at least one row remains
      if (newRows.length === 0) {
        const newId = rowIdCounter + 1;
        setRowIdCounter(newId);
        return [{
          id: newId,
          grade: '',
          hours: '',
          gradeValid: null,
          hoursValid: null,
        }];
      }
      return newRows;
    });
  };

  // Get grade info
  const getGradeInfo = (gpa: number): GradeInfo => {
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
  };

  // Calculate GPA
  const calculateGPA = () => {
    let totalPoints = 0;
    let totalHours = 0;
    let hasValidData = false;
    let hasErrors = false;

    rows.forEach(row => {
      // Skip empty rows
      if (row.grade === '' && row.hours === '') return;

      // Check for validation errors
      if (row.gradeValid === false || row.hoursValid === false) {
        hasErrors = true;
        return;
      }

      // Validate that both fields are filled
      if (row.grade !== '' && row.hours !== '') {
        const grade = parseFloat(row.grade);
        const hours = parseInt(row.hours);
        if (!isNaN(grade) && !isNaN(hours) && hours > 0) {
          totalPoints += grade * hours;
          totalHours += hours;
          hasValidData = true;
        }
      } else if (row.grade !== '' || row.hours !== '') {
        hasErrors = true;
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
    const prevGpaValue = parseFloat(prevGpa);
    const prevHoursValue = parseInt(prevHours);

    let finalGpa = currentGpa;
    let finalHours = totalHours;

    if (!isNaN(prevGpaValue) && !isNaN(prevHoursValue) && prevHoursValue > 0) {
      const prevPoints = prevGpaValue * prevHoursValue;
      finalGpa = (prevPoints + totalPoints) / (prevHoursValue + totalHours);
      finalHours = prevHoursValue + totalHours;
    }

    const { letter, colorClass } = getGradeInfo(finalGpa);
    setGpaResult({ value: finalGpa, hours: finalHours, letter, colorClass });
    setShowModal(true);
    showNotification('GPA calculated successfully!', 'success');
  };

  // Reset calculator
  const resetCalculator = () => {
    setShowModal(false);
    setPrevGpa('');
    setPrevHours('');
    setPrevGpaValid(null);
    setPrevHoursValid(null);
    
    const initialRows: SubjectRow[] = [];
    for (let i = 0; i < INITIAL_ROWS; i++) {
      initialRows.push({
        id: i + 1,
        grade: '',
        hours: '',
        gradeValid: null,
        hoursValid: null,
      });
    }
    setRows(initialRows);
    setRowIdCounter(INITIAL_ROWS);
    
    // Scroll to top
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }, 100);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        calculateGPA();
      }
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  // Handle prev GPA input
  const handlePrevGpaChange = (value: string) => {
    setPrevGpa(value);
    if (value === '') {
      setPrevGpaValid(null);
    } else {
      const num = parseFloat(value);
      setPrevGpaValid(!isNaN(num) && num >= 0 && num <= MAX_GPA);
    }
  };

  // Handle prev hours input
  const handlePrevHoursChange = (value: string) => {
    const filtered = value.replace(/[^0-9]/g, '');
    setPrevHours(filtered);
    if (filtered === '') {
      setPrevHoursValid(null);
    } else {
      const num = parseInt(filtered);
      setPrevHoursValid(!isNaN(num) && num >= 0);
    }
  };

  // Get input class
  const getInputClass = (valid: boolean | null) => {
    if (valid === null) return '';
    return valid ? 'input-valid' : 'input-invalid';
  };

  return (
    <>
      {/* Theme Toggle */}
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        <span className="light-icon"><i className="fas fa-sun"></i></span>
        <span className="dark-icon"><i className="fas fa-moon"></i></span>
      </button>

      {/* Main Container */}
      <div className="container">
        <h1>
          <Image 
            src="/gpa.png" 
            alt="GPA Calculator Logo" 
            className="logo"
            width={45}
            height={45}
          />
          GPA Calculator
        </h1>

        <div className="calculator">
          <div className="scrollable-content" ref={scrollContainerRef}>
            {/* Previous Semester Section */}
            <div className="previous-semester">
              <p className="section-title">Previous Semesters (Optional)</p>
              <div className="previous-inputs">
                <div className="previous-input-group">
                  <label htmlFor="prevGpa">Total GPA</label>
                  <input
                    type="text"
                    id="prevGpa"
                    inputMode="decimal"
                    placeholder="e.g. 3.5"
                    className={`prev-input ${getInputClass(prevGpaValid)}`}
                    value={prevGpa}
                    onChange={(e) => handlePrevGpaChange(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="previous-input-group">
                  <label htmlFor="prevHours">Total Hours</label>
                  <input
                    type="number"
                    id="prevHours"
                    min="0"
                    step="1"
                    placeholder="e.g. 60"
                    className={`prev-input ${getInputClass(prevHoursValid)}`}
                    value={prevHours}
                    onChange={(e) => handlePrevHoursChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            {/* Current Semester Section */}
            <p className="section-title">Current Semester</p>
            <div className="headers">
              <span>Subject Grade</span>
              <span>Hours</span>
              <span></span>
            </div>

            <div className="inputs">
              {rows.map((row) => (
                <div key={row.id} className="input-row">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Grade (0-4)"
                    className={`grade-input ${getInputClass(row.gradeValid)}`}
                    value={row.grade}
                    onChange={(e) => updateRow(row.id, 'grade', e.target.value)}
                    autoComplete="off"
                    aria-label={`Subject grade for row ${row.id}`}
                  />
                  <input
                    type="number"
                    placeholder="Credit Hours"
                    className={`hours-input ${getInputClass(row.hoursValid)}`}
                    min="0"
                    step="1"
                    value={row.hours}
                    onChange={(e) => updateRow(row.id, 'hours', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    autoComplete="off"
                    aria-label={`Credit hours for row ${row.id}`}
                  />
                  <button
                    className="delete-btn"
                    onClick={() => deleteRow(row.id)}
                    aria-label="Delete this row"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="button-row">
            <button className="add-row-btn" onClick={addRow}>
              <i className="fas fa-plus"></i> Add Subject
            </button>
            <button onClick={calculateGPA}>
              Calculate GPA
            </button>
          </div>

          {/* Credits */}
          <div className="credits">
            <p>Created by Eng. Abdelrhman Mohamed</p>
            <div className="logo-container">
              <Image
                src="/Abdelrhman_Logo.png"
                alt="Abdelrhman Logo"
                className="author-logo"
                width={25}
                height={25}
              />
              <span><i className="far fa-copyright"></i> 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <div 
        className={`modal-overlay ${showModal ? 'show' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowModal(false);
        }}
      >
        <div className="modal-content">
          <button 
            className="modal-close" 
            onClick={() => setShowModal(false)}
            aria-label="Close modal"
          >
            <i className="fas fa-times"></i>
          </button>
          <div className="modal-icon">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <h2>Your GPA Result</h2>
          <div className="modal-results">
            <p className={`gpa-value ${gpaResult.colorClass}`}>
              Cumulative GPA = {gpaResult.value.toFixed(2)}
            </p>
            <p className="grade-value">
              <span className={gpaResult.colorClass}>Grade: {gpaResult.letter}</span> | Total Hours: {gpaResult.hours}
            </p>
          </div>
          <button className="new-calc-btn" onClick={resetCalculator}>
            <i className="fas fa-redo"></i> Calculate New GPA
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification notification-${notification.type}`}>
          <i className={`fas ${
            notification.type === 'success' ? 'fa-check-circle' :
            notification.type === 'error' ? 'fa-exclamation-circle' :
            'fa-exclamation-triangle'
          }`}></i>
          <span>{notification.message}</span>
          <button 
            className="notification-close" 
            onClick={() => removeNotification(notification.id)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </>
  );
}
