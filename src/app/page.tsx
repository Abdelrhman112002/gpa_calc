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
      setTheme('dark');
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
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
    if (gpa >= 3.7) return { letter: 'A+', colorClass: 'text-grade-excellent shadow-[0_0_10px_rgba(40,167,69,0.3)]' };
    if (gpa >= 3.5) return { letter: 'A', colorClass: 'text-grade-excellent shadow-[0_0_10px_rgba(40,167,69,0.3)]' };
    if (gpa >= 3.3) return { letter: 'A-', colorClass: 'text-grade-excellent shadow-[0_0_10px_rgba(40,167,69,0.3)]' };
    if (gpa >= 3.0) return { letter: 'B+', colorClass: 'text-grade-good shadow-[0_0_10px_rgba(23,162,184,0.3)]' };
    if (gpa >= 2.7) return { letter: 'B', colorClass: 'text-grade-good shadow-[0_0_10px_rgba(23,162,184,0.3)]' };
    if (gpa >= 2.3) return { letter: 'B-', colorClass: 'text-grade-average shadow-[0_0_10px_rgba(255,193,7,0.3)]' };
    if (gpa >= 2.0) return { letter: 'C+', colorClass: 'text-grade-average shadow-[0_0_10px_rgba(255,193,7,0.3)]' };
    if (gpa >= 1.7) return { letter: 'C', colorClass: 'text-grade-warning shadow-[0_0_10px_rgba(253,126,20,0.3)]' };
    if (gpa >= 1.3) return { letter: 'C-', colorClass: 'text-grade-warning shadow-[0_0_10px_rgba(253,126,20,0.3)]' };
    if (gpa >= 1.0) return { letter: 'D', colorClass: 'text-grade-danger shadow-[0_0_10px_rgba(220,53,69,0.3)]' };
    return { letter: 'F', colorClass: 'text-grade-danger shadow-[0_0_10px_rgba(220,53,69,0.3)]' };
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
  }, [showModal, calculateGPA]);

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
    if (valid === null) return 'border-black/10 dark:border-white/10';
    return valid 
      ? 'border-valid-color bg-gradient-to-r from-input-bg to-valid-color/[0.05] focus:ring-valid-color/20' 
      : 'border-invalid-color bg-gradient-to-r from-input-bg to-invalid-color/[0.05] focus:ring-invalid-color/20 animate-shake';
  };

  return (
    <>
      {/* Theme Toggle */}
      <button 
        className="fixed top-5 right-5 bg-card-bg border-2 border-border-color rounded-full w-12 h-12 cursor-pointer flex items-center justify-center z-[1000] shadow-[0_4px_15px_var(--shadow-color)] hover:scale-110 transition-all overflow-hidden p-0"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${theme === 'dark' ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
          <i className="fas fa-sun text-white text-xl"></i>
        </span>
        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${theme === 'light' ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <i className="fas fa-moon text-navy text-xl"></i>
        </span>
      </button>

      {/* Main Container */}
      <div className="bg-card-bg p-5 sm:p-8 rounded-[24px] shadow-[0_10px_30px_var(--shadow-color)] w-[95%] max-w-[600px] h-[800px] max-h-[93vh] backdrop-blur-[10px] border border-black/10 dark:border-white/10 flex flex-col items-center relative overflow-hidden">
        <h1 className="text-primary text-center mb-5 sm:mb-6 flex items-center justify-center gap-2 sm:gap-[15px] text-2xl sm:text-[2.2rem] font-semibold">
          <Image 
            src="/gpa.png" 
            alt="GPA Calculator Logo" 
            className="drop-shadow-[0_2px_4px_var(--shadow-color)]"
            width={45}
            height={45}
          />
          GPA Calculator
        </h1>

        <div className="flex flex-col items-center w-full max-w-[500px] mx-auto flex-1 overflow-hidden">
          <div className="w-full flex-1 overflow-y-auto pr-2 custom-scrollbar" ref={scrollContainerRef}>
            {/* Previous Semester Section */}
            <div className="w-full p-4 bg-gray-500/10 rounded-xl mb-4 border border-black/10 dark:border-white/10 backdrop-blur-[5px]">
              <p className="bg-success-btn-gradient bg-clip-text text-transparent font-bold text-xl sm:text-[1.2rem] mb-[0.7rem] text-center title-case tracking-[0.5px] w-fit mx-auto">
                Previous Semesters (Optional)
              </p>
              <div className="flex gap-4 justify-center">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <label htmlFor="prevGpa" className="text-primary text-sm sm:text-base font-semibold">Total GPA</label>
                  <input
                    type="text"
                    id="prevGpa"
                    inputMode="decimal"
                    placeholder="e.g. 3.5"
                    className={`w-full p-2.5 sm:p-[0.8rem] border rounded-xl text-center text-[0.95rem] bg-input-bg text-text-color h-[42px] focus:primary focus:ring-4 focus:ring-primary/20 outline-none transition-all ${getInputClass(prevGpaValid)}`}
                    value={prevGpa}
                    onChange={(e) => handlePrevGpaChange(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <label htmlFor="prevHours" className="text-primary text-sm sm:text-base font-semibold">Total Hours</label>
                  <input
                    type="number"
                    id="prevHours"
                    min="0"
                    step="1"
                    placeholder="e.g. 60"
                    className={`w-full p-2.5 sm:p-[0.7rem] border rounded-xl text-center text-[0.95rem] bg-input-bg text-text-color h-[42px] focus:primary focus:ring-4 focus:ring-primary/20 outline-none transition-all ${getInputClass(prevHoursValid)}`}
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
            <div className="w-full p-4 bg-gray-500/10 rounded-xl mb-4 border border-black/10 dark:border-white/10 backdrop-blur-[5px]">
              <p className="bg-success-btn-gradient bg-clip-text text-transparent font-bold text-xl sm:text-[1.2rem] mb-[0.7rem] text-center title-case tracking-[0.5px] w-fit mx-auto">
                Current Semester
              </p>
              <div className="grid grid-cols-[1fr_1fr_40px] gap-2 sm:gap-4 text-primary font-semibold text-sm sm:text-base text-center w-full mb-3">
                <span className="flex justify-center items-center h-6">Subject Grade</span>
                <span className="flex justify-center items-center h-6">Hours</span>
                <span className="w-10"></span>
              </div>

              <div className="flex flex-col w-full items-center pb-[10px]">
                {rows.map((row) => (
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_40px] gap-4 w-full mb-2 items-center animate-fadeIn group">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Grade (0-4)"
                      className={`w-full p-2.5 sm:p-[0.8rem] border rounded-xl text-center text-base bg-input-bg text-text-color backdrop-blur-[5px] h-[42px] focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all focus:-translate-y-[1px] ${getInputClass(row.gradeValid)}`}
                      value={row.grade}
                      onChange={(e) => updateRow(row.id, 'grade', e.target.value)}
                      autoComplete="off"
                      aria-label={`Subject grade for row ${row.id}`}
                    />
                    <input
                      type="number"
                      placeholder="Credit Hours"
                      className={`w-full p-2.5 sm:p-[0.8rem] border rounded-xl text-center text-base bg-input-bg text-text-color backdrop-blur-[5px] h-[42px] focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all focus:-translate-y-[1px] ${getInputClass(row.hoursValid)}`}
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
                      className="w-8 h-8 min-w-[32px] p-0 bg-delete-btn-gradient text-white border-none rounded-full cursor-pointer flex items-center justify-center m-0 shadow-[0_2px_8px_var(--shadow-color)] hover:scale-110 hover:shadow-[0_4px_12px_var(--shadow-color)] active:scale-95 transition-all outline-none"
                      onClick={() => deleteRow(row.id)}
                      aria-label="Delete this row"
                    >
                      <i className="fas fa-times text-[0.85rem]"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full my-4">
            <button 
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-success-btn-gradient text-white border-none rounded-xl cursor-pointer text-base sm:text-lg font-medium hover:-translate-y-[1px] active:translate-y-0 transition-all" 
              onClick={addRow}
            >
              <i className="fas fa-plus text-xs"></i> Add Subject
            </button>
            <button 
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-btn-gradient text-white border-none rounded-xl cursor-pointer text-base sm:text-lg font-medium hover:-translate-y-[1px] active:translate-y-0 transition-all"
              onClick={calculateGPA}
            >
              Calculate GPA
            </button>
          </div>

          {/* Credits */}
          <div className="text-center pt-2 border-t-2 border-border-color w-full">
            <p className="mb-2 font-light text-text-muted text-base">Created by Eng. Abdelrhman Mohamed</p>
            <div className="flex items-center justify-center gap-2">
              <Image
                src="/Abdelrhman_Logo.png"
                alt="Abdelrhman Logo"
                className="h-6 w-auto transition-transform duration-300 hover:scale-115 drop-shadow-[0_2px_4px_var(--shadow-color)]"
                width={25}
                height={25}
              />
              <span className="text-sm text-text-muted tracking-[1px] flex items-center gap-1">
                <i className="far fa-copyright text-xs"></i> 2026
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[10000] p-4 transition-all animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-card-bg rounded-[24px] p-6 sm:p-10 w-[95%] max-w-[420px] text-center relative shadow-[0_25px_60px_rgba(0,0,0,0.3)] border border-black/10 dark:border-white/10 animate-modalSlideIn">
            <button 
              className="absolute top-[15px] right-[15px] w-9 h-9 min-w-[36px] bg-input-bg border border-border-color rounded-full cursor-pointer flex items-center justify-center text-text-muted hover:bg-delete-btn-gradient hover:text-white transition-all outline-none" 
              onClick={() => setShowModal(false)}
              aria-label="Close modal"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
            <div className="w-20 h-20 mx-auto mb-6 bg-btn-gradient rounded-full flex items-center justify-center">
              <i className="fas fa-graduation-cap text-[2.2rem] text-white"></i>
            </div>
            <h2 className="text-text-color text-2xl font-bold mb-6">Your GPA Result</h2>
            <div className="bg-result-bg rounded-xl p-6 mb-6 border border-black/10 dark:border-white/10">
              <p className={`text-[1.8rem] font-bold mb-2 dark:text-[#4fd1c5] text-primary`}>
                Total GPA = {gpaResult.value.toFixed(2)}
              </p>
              <p className="text-lg font-medium text-text-muted m-0">
                <span className="dark:text-[#4fd1c5] text-primary font-bold">Grade: {gpaResult.letter}</span> | <span className="text-primary font-semibold">Total Hours: {gpaResult.hours}</span>
              </p>
            </div>
            <button 
              className="bg-success-btn-gradient text-white border-none px-6 py-3 rounded-lg cursor-pointer text-base mt-4 min-w-[180px] font-medium shadow-[0_4px_15px_rgba(40,167,69,0.2)] hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(40,167,69,0.3)] transition-all outline-none" 
              onClick={resetCalculator}
            >
              <i className="fas fa-redo mr-2"></i> Calculate New GPA
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-20 right-5 flex flex-col gap-3 z-[10000]">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`bg-notification-bg p-4 pr-5 rounded-xl flex items-center gap-3 shadow-notification max-w-[350px] border border-y-black/10 border-r-black/10 dark:border-y-white/10 dark:border-r-white/10 border-l-[5px] backdrop-blur-md animate-slideIn ${
              notification.type === 'success' ? 'border-l-valid-color' :
              notification.type === 'error' ? 'border-l-invalid-color' :
              'border-l-warning-color'
            }`}
          >
            <i className={`fas ${
              notification.type === 'success' ? 'fa-check-circle text-valid-color' :
              notification.type === 'error' ? 'fa-exclamation-circle text-invalid-color' :
              'fa-exclamation-triangle text-warning-color'
            } text-lg`}></i>
            <span className="text-sm font-medium">{notification.message}</span>
            <button 
              className="ml-auto text-text-muted hover:text-text-color transition-colors" 
              onClick={() => removeNotification(notification.id)}
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
