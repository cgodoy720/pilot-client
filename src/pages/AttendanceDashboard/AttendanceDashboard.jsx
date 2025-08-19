import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  isAuthenticated, 
  getAuthUser, 
  secureLogout, 
  setupSessionMonitoring,
  getSessionInfo,
  refreshSession
} from '../../utils/attendanceAuth';
import './AttendanceDashboard.css';
import logoImage from '../../assets/logo.png';
import CohortAttendanceCard from '../../components/CohortAttendanceCard/CohortAttendanceCard';


const AttendanceDashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Check-in workflow states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  
  // Today's attendance states
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  
  // Settings modal
  const [showSettings, setShowSettings] = useState(false);
  
  // Celebratory animation states
  const [showScanAnimation, setShowScanAnimation] = useState(false);
  const [showWelcomeCelebration, setShowWelcomeCelebration] = useState(false);
  const [showPhotoTransport, setShowPhotoTransport] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  
  // Refs
  const searchInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const initializeDashboard = async () => {
      // Check authentication using utility
      if (!isAuthenticated()) {
        navigate('/attendance-login', { replace: true });
        return;
      }

      // Get user data
      const userData = getAuthUser();
      if (userData) {
        setUser(userData);
      }

      // Get session information
      const session = getSessionInfo();
      setSessionInfo(session);

      // Load today's attendance
      await loadTodayAttendance();

      setIsLoading(false);

      // Setup session monitoring
      const cleanup = setupSessionMonitoring(() => {
        // Session expired callback
        setIsLoggingOut(true);
        setTimeout(() => {
          navigate('/attendance-login', { replace: true });
        }, 1000);
      });

      return cleanup;
    };

    initializeDashboard();
  }, [navigate]);

  // Update session info periodically
  useEffect(() => {
    if (!isLoading && isAuthenticated()) {
      const interval = setInterval(() => {
        const session = getSessionInfo();
        setSessionInfo(session);
        
        // Refresh session activity
        refreshSession();
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Search builders as user types
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchBuilders(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 50); // Reduced delay for faster response while preventing excessive API calls

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Monitor searchResults changes and restore focus if needed
  useEffect(() => {
    if (searchResults.length > 0 && searchInputRef.current && document.activeElement !== searchInputRef.current) {
      console.log('🔧 Restoring focus after searchResults update');
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
    }
  }, [searchResults]);

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Debug video element when camera step is shown
  useEffect(() => {
    if (showCamera && videoRef.current) {
      console.log('Camera step shown, video element:', videoRef.current);
      console.log('Video srcObject:', videoRef.current.srcObject);
      console.log('Video readyState:', videoRef.current.readyState);
      console.log('Video paused:', videoRef.current.paused);
      
      // If we have a stream but no srcObject, try to assign it
      if (videoRef.current && !videoRef.current.srcObject) {
        console.log('Video element exists but no srcObject - this might be a timing issue');
      }
    }
  }, [showCamera]);

  // Assign stream when video element is rendered and ready
  useEffect(() => {
    if (showCamera && cameraStream) {
      console.log('Camera step shown, checking for video element...');
      
      // Use a more robust polling mechanism with exponential backoff
      let attempts = 0;
      const maxAttempts = 20; // 1 second total with exponential backoff
      
      const waitForVideoElement = () => {
        attempts++;
        console.log(`Attempt ${attempts}: Checking for video element...`);
        
        if (videoRef.current) {
          console.log('✅ Video element found in DOM!');
          console.log('Video element:', videoRef.current);
          console.log('Video tagName:', videoRef.current.tagName);
          console.log('Video readyState:', videoRef.current.readyState);
          
          // Double-check the element is actually a video element
          if (videoRef.current.tagName === 'VIDEO') {
            console.log('✅ Confirmed: Valid video element found');
            
            const assignStream = () => {
              if (videoRef.current && cameraStream) {
                try {
                  console.log('🎥 Assigning stream to video element...');
                  videoRef.current.srcObject = cameraStream;
                  console.log('✅ Stream assigned successfully');
                  console.log('Video srcObject after assignment:', videoRef.current.srcObject);
                  
                  // Add event listeners
                  videoRef.current.onloadedmetadata = () => {
                    console.log('📹 Video metadata loaded, starting playback');
                    console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
                    videoRef.current.play().catch(e => {
                      console.error('❌ Error playing video:', e);
                    });
                  };
                  
                  videoRef.current.onerror = (e) => {
                    console.error('❌ Video error:', e);
                  };
                  
                  videoRef.current.onplay = () => {
                    console.log('▶️ Video started playing');
                  };
                  
                  videoRef.current.oncanplay = () => {
                    console.log('✅ Video can play');
                  };
                  
                  videoRef.current.onloadeddata = () => {
                    console.log('📊 Video data loaded');
                    console.log('Final video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
                  };
                  
                } catch (error) {
                  console.error('❌ Error assigning stream:', error);
                }
              } else {
                console.log('❌ Video element or stream not available for assignment');
              }
            };
            
            // Try immediate assignment
            assignStream();
            
            // Verify assignment worked
            setTimeout(() => {
              if (videoRef.current && !videoRef.current.srcObject) {
                console.log('⚠️ Immediate assignment may have failed, retrying...');
                assignStream();
              } else {
                console.log('✅ Stream assignment verified');
              }
            }, 50);
            
          } else {
            console.log('❌ Element found but not a video element:', videoRef.current.tagName);
          }
        } else {
          console.log(`⏳ Video element not ready yet (attempt ${attempts}/${maxAttempts})`);
          
          if (attempts < maxAttempts) {
            // Exponential backoff: 50ms, 100ms, 200ms, 400ms, etc.
            const delay = Math.min(50 * Math.pow(2, attempts - 1), 500);
            setTimeout(waitForVideoElement, delay);
          } else {
            console.error('❌ Failed to find video element after maximum attempts');
            console.log('Current DOM state - searching for video elements:');
            const allVideos = document.querySelectorAll('video');
            console.log('All video elements in DOM:', allVideos);
            console.log('videoRef.current:', videoRef.current);
          }
        }
      };
      
      // Start polling for video element with a small initial delay
      setTimeout(waitForVideoElement, 10);
    }
  }, [showCamera, cameraStream]);

  const loadTodayAttendance = async () => {
    setIsLoadingAttendance(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance/today`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('attendanceToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Raw attendance data received:', data);
        setTodayAttendance(data);
      }
    } catch (error) {
      console.error('Error loading today\'s attendance:', error);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  const searchBuilders = async (query) => {
    setIsSearching(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance/builders?search=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('attendanceToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.builders || []);
        
        // Restore focus after state update
        setTimeout(() => {
          if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 0);
      }
    } catch (error) {
      console.error('Error searching builders:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBuilderSelect = (builder) => {
    setSelectedBuilder(builder);
    setSearchQuery(`${builder.firstName} ${builder.lastName}`);
    setSearchResults([]);
    // Don't automatically show camera - let user continue typing if they want
  };

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    
    // Clear any existing selection when typing
    if (selectedBuilder) {
      setSelectedBuilder(null);
      setShowCamera(false);
      setCapturedPhoto(null);
    }
  };

  const handleSearchFocus = (e) => {
    // Focus handler for future use if needed
  };

  const handleSearchBlur = (e) => {
    // Only blur if clicking outside the entire search step area
    const searchStep = e.currentTarget.closest('.search-step');
    if (!searchStep?.contains(e.relatedTarget)) {
      // User clicked outside search area - allow blur
      return;
    }
    
    // User clicked inside search area - prevent blur and maintain focus
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };

  const handleStartCheckIn = async () => {
    if (selectedBuilder) {
      console.log('Starting camera process...');
      await startCamera();
    }
  };

  const startCamera = async () => {
    if (cameraStream) {
      console.log('Restarting camera with existing stream...');
      setShowCamera(true);
      return;
    }
    
    console.log('Starting new camera stream...');
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user' // Front camera
        }
      });

      console.log('Camera stream obtained:', stream);
      setCameraStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error('Error starting camera:', error);
      setCheckInStatus({ 
        type: 'error', 
        message: 'Unable to access camera. Please check permissions and try again.' 
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // Also clean up stored stream
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handlePhotoCapture = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Camera elements not available');
      return;
    }

    setIsCapturing(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      console.log('Video ready state:', video.readyState);
      console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);

      // Wait for video to be ready
      if (video.readyState < 2) {
        console.log('Video not ready, waiting...');
        await new Promise((resolve) => {
          video.onloadeddata = resolve;
        });
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      console.log('Canvas dimensions set to:', canvas.width, 'x', canvas.height);

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0);

      // Convert to base64 with JPEG format and 0.8 quality
      const photoData = canvas.toDataURL('image/jpeg', 0.8);

      // Validate file size (2MB limit)
      const base64Data = photoData.split(',')[1];
      const decodedSize = Math.ceil((base64Data.length * 3) / 4);
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (decodedSize > maxSize) {
        throw new Error('Photo is too large. Please try again with a smaller image.');
      }

      // Validate resolution (1080p max)
      if (video.videoWidth > 1920 || video.videoHeight > 1080) {
        throw new Error('Photo resolution is too high. Please try again.');
      }

      setCapturedPhoto(photoData);
      console.log('Photo captured successfully:', {
        width: video.videoWidth,
        height: video.videoHeight,
        size: decodedSize,
        format: 'JPEG'
      });

      // Turn off camera after successful photo capture
      console.log('Photo captured, turning off camera...');
      stopCamera();

    } catch (error) {
      console.error('Error capturing photo:', error);
      setCheckInStatus({ type: 'error', message: error.message });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCheckInSubmit = async () => {
    if (!selectedBuilder || !capturedPhoto) return;
    
    // Debug: Log the selectedBuilder object
    console.log('🔍 Selected Builder Object:', selectedBuilder);
    console.log('🔍 User ID from id:', selectedBuilder.id);
    console.log('🔍 User ID from user_id:', selectedBuilder.user_id);
    console.log('🔍 User ID from userId:', selectedBuilder.userId);
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance/checkin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('attendanceToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedBuilder.id || selectedBuilder.user_id || selectedBuilder.userId,
          photoData: capturedPhoto
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCheckInStatus({ type: 'success', message: 'Check-in successful!' });
        
        // Start celebratory sequence
        startCelebratorySequence(`${selectedBuilder.firstName} ${selectedBuilder.lastName}`);
        
        // Refresh attendance data immediately
        loadTodayAttendance();
      } else {
        const errorData = await response.json();
        setCheckInStatus({ type: 'error', message: errorData.error || 'Check-in failed' });
      }
    } catch (error) {
      console.error('Error submitting check-in:', error);
      setCheckInStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCheckInForm = () => {
    // Stop camera if running
    stopCamera();
    
    setSearchQuery('');
    setSearchResults([]);
    setSelectedBuilder(null);
    setShowCamera(false);
    setCapturedPhoto(null);
    setCheckInStatus(null);
    setCameraStream(null);
    
    // Reset all animation states
    setShowScanAnimation(false);
    setShowWelcomeCelebration(false);
    setShowPhotoTransport(false);
    setWelcomeMessage('');
  };

  const handleRetakePhoto = () => {
    console.log('Retake photo clicked - current state:', { isCapturing, capturedPhoto: !!capturedPhoto });
    
    // Reset captured photo and capturing state
    setCapturedPhoto(null);
    setIsCapturing(false);
    setCheckInStatus(null);
    
    // Go back to camera step (not confirmation step)
    setShowCamera(true);
    
    // Restart camera for retake
    console.log('Restarting camera for retake...');
    stopCamera();
    setTimeout(() => {
      startCamera();
    }, 100);
    
    console.log('Retake photo - camera restart initiated');
  };

  // Celebratory animation functions
  const startCelebratorySequence = (builderName) => {
    setWelcomeMessage(`Welcome to class, ${builderName}!`);
    
    // Start scan animation
    setShowScanAnimation(true);
    
    // After 0.3s, automatically show welcome celebration
    setTimeout(() => {
      setShowScanAnimation(false);
      setShowWelcomeCelebration(true);
      
      // After 1s, show photo transport
      setTimeout(() => {
        setShowPhotoTransport(true);
        
        // After 0.5s, hide photo transport but keep welcome celebration
        setTimeout(() => {
          setShowPhotoTransport(false);
          // Keep welcome celebration visible for 2 more seconds so button can appear
          setTimeout(() => {
            setShowWelcomeCelebration(false);
          }, 2000);
        }, 500);
      }, 1000);
    }, 300);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Small delay to show logout state
    setTimeout(() => {
      secureLogout(() => {
        navigate('/attendance-login', { replace: true });
      });
    }, 500);
  };

  const formatSessionTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Process cohort data from today's attendance
  const processCohortData = () => {
    console.log('🔍 processCohortData called');
    console.log('🔍 todayAttendance:', todayAttendance);
    
    // The backend returns data in todayAttendance.cohorts structure
    const cohortsData = todayAttendance?.cohorts || [];
    console.log('🔍 Using cohorts data:', cohortsData);
    
    if (!cohortsData || cohortsData.length === 0) {
      console.log('No cohort data available for processing');
      return [];
    }

    console.log('Processing cohort data from:', cohortsData);

    // Convert to cohort data structure
    const cohortData = [];
    
    // Map cohort names to display names
    const cohortMapping = {
      'March 2025': { name: 'Pilot', level: 'L3' },
      'June 2025': { name: 'June 2025', level: 'L2' },
      'September 2025': { name: 'September', level: 'L1' },
      'Unknown Cohort': { name: 'Unknown', level: 'L?' }
    };

    cohortsData.forEach(cohortGroup => {
      console.log('🔍 Processing cohort group:', cohortGroup);
      
      const cohortName = cohortGroup.cohort || 'Unknown Cohort';
      const attendees = cohortGroup.records || [];
      
      console.log(`Processing ${attendees.length} attendees for cohort: ${cohortName}`);
      
      // Normalize attendee records
      const normalizedAttendees = attendees.map(record => {
        const firstName = record.firstName || record.first_name || 'Unknown';
        const lastName = record.lastName || record.last_name || 'Unknown';
        const checkInTime = record.checkInTime || record.check_in_time || new Date().toISOString();
        
        console.log(`Normalizing record for ${firstName} ${lastName}, checkInTime: ${checkInTime}`);
        
        return {
          ...record,
          firstName: firstName,
          lastName: lastName,
          checkInTime: checkInTime,
          attendanceId: record.attendanceId || record.attendance_id,
          photoUrl: record.photoUrl || record.photo_url || null
        };
      });
      
      const mapping = cohortMapping[cohortName] || { name: cohortName, level: 'L?' };
      console.log(`Creating cohort card for ${cohortName} -> ${mapping.name} ${mapping.level} with ${normalizedAttendees.length} attendees`);
      
      cohortData.push({
        cohortName: mapping.name,
        cohortLevel: mapping.level,
        attendees: normalizedAttendees
      });
    });

    console.log('Final cohort data:', cohortData);
    return cohortData;
  };

  const getSessionStatusColor = () => {
    if (!sessionInfo) return '#a0aec0';
    
    const remainingPercent = (sessionInfo.remainingTime / (8 * 60 * 60 * 1000)) * 100;
    
    if (remainingPercent > 75) return '#48bb78'; // Green
    if (remainingPercent > 50) return '#ed8936'; // Orange
    if (remainingPercent > 25) return '#e53e3e'; // Red
    return '#c53030'; // Dark red
  };

  if (isLoading) {
    return (
      <div className="attendance-dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isLoggingOut) {
    return (
      <div className="attendance-dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Logging out...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-dashboard">
      <div className="attendance-dashboard-header">
        <div className="attendance-dashboard-title">
          <h1>AI-Native Builder Sign In</h1>
          <p className="attendance-dashboard-subtitle">
            Builder check-in system for classroom attendance
          </p>
        </div>
        
        <div className="attendance-dashboard-controls">
          <div className="attendance-session-info">
            <div className="system-status">
              <span className="status-indicator online"></span>
              <span>System Online</span>
            </div>
          </div>
          
          <div className="attendance-user-info">
            <div className="user-details">
              <span className="user-name">Welcome, {user?.firstName} {user?.lastName}</span>
              <span className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Staff'}</span>
            </div>
            
            <div className="header-actions">
              <button 
                onClick={() => setShowSettings(true)} 
                className="settings-button"
                aria-label="Open settings"
              >
                ⚙️
              </button>
              <button 
                onClick={handleLogout} 
                className="logout-button"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging Out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="attendance-dashboard-content">
        <div className="attendance-dashboard-grid">
          {/* Builder Check-in Card */}
          <div className="attendance-dashboard-card primary-card">
            <div className="card-header">
              <div className="card-icon">📷</div>
              <h2>Builder Check-in</h2>
            </div>
            
            <div className="check-in-workflow">
              {/* Step 1: Search */}
              <div className={`search-step ${showCamera ? 'search-step-with-camera' : ''}`}>
                <div className="search-container">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    placeholder="Type builder name to search..."
                    className="builder-search-input"
                    disabled={isSearching}
                    autoComplete="off"
                  />
                  {isSearching && <div className="search-spinner"></div>}
                  
                                  {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((builder) => (
                        <button
                          key={builder.id}
                          onClick={() => handleBuilderSelect(builder)}
                          className="search-result-item"
                          type="button"
                        >
                          <span className="builder-name">{builder.firstName} {builder.lastName}</span>
                          <span className="builder-cohort">{builder.cohort}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {searchQuery && searchResults.length === 0 && !isSearching && !selectedBuilder && (
                  <div className="no-results">
                    No builders found matching "{searchQuery}"
                  </div>
                )}

                {/* Show selected builder and start check-in button */}
                {selectedBuilder && !showCamera && (
                  <div className="selected-builder-info">
                    <div className="selected-builder-display">
                      <span className="selected-name">{selectedBuilder.firstName} {selectedBuilder.lastName}</span>
                      <span className="selected-cohort">{selectedBuilder.cohort}</span>
                    </div>
                    <button 
                      onClick={handleStartCheckIn}
                      className="start-checkin-button"
                    >
                      Start Check-in 📷
                    </button>
                  </div>
                )}
                
                {/* Remove empty space when builder is selected but camera not started */}
                {selectedBuilder && !showCamera && !capturedPhoto && (
                  <div style={{ display: 'none' }}></div>
                )}
              </div>
              
              {/* Step 2: Camera Capture - Side by side */}
              {selectedBuilder && showCamera && !capturedPhoto && (
                <div className="camera-step-side">
                  <div className="selected-builder">
                    <h3>Check-in for: {selectedBuilder.firstName} {selectedBuilder.lastName}</h3>
                    <p className="builder-cohort">{selectedBuilder.cohort}</p>
                  </div>
                  
                  <div className="camera-container">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="camera-video"
                      style={{ 
                        width: '100%', 
                        maxWidth: '320px', 
                        height: '240px',
                        backgroundColor: '#000',
                        borderRadius: '8px',
                        border: '2px solid red',
                        objectFit: 'cover'
                      }}
                    />
                    <canvas
                      ref={canvasRef}
                      style={{ display: 'none' }}
                    />
                    
                    <div className="camera-controls">
                      <button 
                        onClick={handlePhotoCapture}
                        className="capture-button"
                        disabled={isCapturing || !cameraStream}
                      >
                        {isCapturing ? 'Capturing...' : cameraStream ? '📸 Take Photo' : '🔄 Starting Camera...'}
                      </button>
                      
                      <button 
                        onClick={handleRetakePhoto}
                        className="retry-button"
                        disabled={isCapturing}
                      >
                        Retake Photo
                      </button>
                      
                      <button 
                        onClick={() => {
                          stopCamera();
                          setShowCamera(false);
                        }}
                        className="cancel-button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      stopCamera();
                      setSelectedBuilder(null);
                    }}
                    className="back-button"
                  >
                    ← Back to Search
                  </button>
                </div>
              )}
              
              {/* Step 3: Confirmation - Side by side */}
              {capturedPhoto && (
                <div className="confirmation-step-side">
                  <div className="photo-preview">
                    <img 
                      src={capturedPhoto} 
                      alt="Captured photo" 
                      className="captured-photo"
                    />
                    <p className="photo-caption">Photo captured successfully!</p>
                  </div>
                  
                  {checkInStatus && (
                    <div className={`check-in-status ${checkInStatus.type}`}>
                      {checkInStatus.message}
                    </div>
                  )}
                  
                  <div className="confirmation-actions">
                    <button 
                      onClick={handleCheckInSubmit}
                      className="submit-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Complete Check-in'}
                    </button>
                    
                    <button 
                      onClick={handleRetakePhoto}
                      className="retake-button"
                      disabled={isSubmitting}
                    >
                      Retake Photo
                    </button>
                    
                    <button 
                      onClick={resetCheckInForm}
                      className="reset-button"
                      disabled={isSubmitting}
                    >
                      Start Over
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Today's Attendance Card */}
          <div className="attendance-dashboard-card">
            <div className="card-header">
              <div className="card-icon">📊</div>
              <h2>Today's Attendance</h2>
            </div>
            
            {isLoadingAttendance ? (
              <div className="attendance-loading">
                <div className="spinner"></div>
                <p>Loading attendance data...</p>
              </div>
            ) : todayAttendance ? (
              <div className="attendance-summary">
                <div className="attendance-stats">
                  <div className="stat-item">
                    <span className="stat-number">{todayAttendance.summary?.totalRecords || 0}</span>
                    <span className="stat-label">Total Check-ins</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{todayAttendance.summary?.presentCount || 0}</span>
                    <span className="stat-label">On Time</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{todayAttendance.summary?.lateCount || 0}</span>
                    <span className="stat-label">Late</span>
                  </div>
                </div>
                
                <div className="attendance-date">
                  <strong>Date:</strong> {todayAttendance.date || 'Today'}
                </div>
                
                <button 
                  onClick={loadTodayAttendance}
                  className="refresh-button"
                  disabled={isLoadingAttendance}
                >
                  {isLoadingAttendance ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
            ) : (
              <div className="attendance-error">
                <p>Unable to load attendance data</p>
                <button 
                  onClick={loadTodayAttendance}
                  className="retry-button"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Cohort Attendance Cards */}
        <div className="cohort-attendance-section">
          {(() => {
            const cohortData = processCohortData();
            console.log('🔍 Rendering cohort cards, data:', cohortData);
            return cohortData.map((cohort, index) => (
              <CohortAttendanceCard
                key={`${cohort.cohortLevel}-${cohort.cohortName}-${index}`}
                cohortName={cohort.cohortName}
                cohortLevel={cohort.cohortLevel}
                attendees={cohort.attendees}
                className="cohort-card"
              />
            ));
          })()}
        </div>
      </div>
      

      
      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <div className="settings-header">
              <h3>System Settings</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="close-button"
              >
                ×
              </button>
            </div>
            <div className="settings-body">
              <p>Settings configuration will be implemented here.</p>
              <p>This includes camera settings, attendance rules, and system preferences.</p>
            </div>
          </div>
        </div>
      )}

      {/* Celebratory Animations */}
      
      {/* Photo Scan Animation */}
      {showScanAnimation && (
        <div 
          className="scan-animation-overlay"
        >
          <div className="scan-animation-content">
            <div className="scan-flash"></div>
            <div className="logo-spin-container">
              <img 
                src={logoImage} 
                alt="Pursuit Logo" 
                className="spinning-logo"
              />
            </div>
            <div className="scan-text">Processing...</div>
          </div>
        </div>
      )}

      {/* Welcome Celebration */}
      {showWelcomeCelebration && (
        <div 
          className="welcome-celebration-overlay"
        >
          <div className="welcome-celebration-content">
            <div className="welcome-message">{welcomeMessage}</div>
            <div className="celebration-sparkles">
              <span className="sparkle">✨</span>
              <span className="sparkle">🎉</span>
              <span className="sparkle">✨</span>
            </div>
            <button 
              className="next-builder-button-celebration"
              onClick={() => {
                resetCheckInForm();
              }}
            >
              Next Builder →
            </button>
          </div>
        </div>
      )}

      {/* Photo Transport Animation */}
      {showPhotoTransport && (
        <div className="photo-transport-animation">
          <div className="photo-transport-content">
            <div className="transport-photo">
              <img 
                src={capturedPhoto} 
                alt="Transporting photo" 
                className="transporting-photo"
              />
            </div>
            <div className="transport-arrow">→</div>
            <div className="transport-destination">
              <div className="attendance-counter-increment">
                +1
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;
