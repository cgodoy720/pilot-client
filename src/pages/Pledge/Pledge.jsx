import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pursuitLogoFull from '../../assets/logo-full.png';
import Swal from 'sweetalert2';
import 'animate.css';
import './Pledge.css';

function Pledge() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProgramDetails, setShowProgramDetails] = useState(false);
  const [showCodeOfConduct, setShowCodeOfConduct] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  
  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    printedName: '',
    date: ''
  });

  // Code of conduct checkbox state
  const [codeOfConductAgreed, setCodeOfConductAgreed] = useState(false);

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        fullName: `${userData.firstName || userData.first_name || ''} ${userData.lastName || userData.last_name || ''}`.trim(),
        email: userData.email || '',
        printedName: `${userData.firstName || userData.first_name || ''} ${userData.lastName || userData.last_name || ''}`.trim(),
        date: new Date().toLocaleDateString()
      }));
    } else {
      // Redirect to login if no user data
      navigate('/login');
    }
  }, [navigate]);

  // Navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  // Helper function to validate phone number (10 digits)
  const isValidPhoneNumber = (phone) => {
    const digitsOnly = phone.replace(/\D/g, ''); // Remove all non-digit characters
    return digitsOnly.length === 10;
  };

  // Validation for each step
  const isStepValid = (step) => {
    switch (step) {
      case 1: return true; // Introduction - no validation needed
      case 2: return true; // Learning commitments - no validation needed
      case 3: return codeOfConductAgreed; // Community commitments - requires code of conduct agreement
      case 4: return true; // Adapting & Building commitments - no validation needed
      case 5: 
        return formData.fullName && 
               formData.email && 
               formData.phoneNumber && 
               isValidPhoneNumber(formData.phoneNumber) && 
               formData.dateOfBirth;
      case 6: 
        return hasSignature && formData.printedName && formData.date;
      default: return false;
    }
  };

  // Signature canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#FFFFFF'; // Changed to white for better visibility
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Phone number formatting function
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digitsOnly.substring(0, 10);
    
    // Apply formatting based on length
    if (limitedDigits.length <= 3) {
      return limitedDigits;
    } else if (limitedDigits.length <= 6) {
      return `(${limitedDigits.substring(0, 3)}) ${limitedDigits.substring(3)}`;
    } else {
      return `(${limitedDigits.substring(0, 3)}) ${limitedDigits.substring(3, 6)}-${limitedDigits.substring(6)}`;
    }
  };

  const handlePhoneNumberChange = (e) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phoneNumber: formattedValue }));
  };

  // Signature canvas functions
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    // Ensure white stroke color for visibility
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    // Ensure white stroke color is maintained
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Touch event handlers for mobile devices
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    startDrawing(mouseEvent);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    draw(mouseEvent);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    stopDrawing();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const downloadProgramDetails = () => {
    const element = document.createElement('a');
    const file = new Blob([getProgramDetailsText()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'AI-Native_Program_Details.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadCodeOfConduct = () => {
    const codeOfConductText = `Pursuit AI Native Program — Code of Conduct

The Pursuit AI Native Program is a professional learning environment. All participants are expected to uphold the highest standards of conduct at all times, in the classroom, on the premises (including the lobby and roof), and at any Pursuit-related event or gathering, whether in person or virtual.

We expect you to conduct yourself professionally, which includes:
• Cleaning up after yourself
• Taking care of shared spaces, materials, and equipment
• Maintaining focus during sessions and minimizing disruptions
• Respecting the space, staff, volunteers, and your peers

What We Mean by "Showing Respect"
Respect is a core expectation of this program. In this context, it means:
• Listening actively when others are speaking, not interrupting or talking over them
• Using appropriate and professional language and tone, both in person and online
• Being punctual and prepared for all sessions and activities
• Following shared space norms, like cleaning up and not distracting others
• Engaging with others with kindness and professionalism, especially during feedback or collaboration
• Respecting personal boundaries, including physical space, identity, and personal information

Zero-Tolerance Policy
To maintain a safe and professional environment, Pursuit enforces a zero-tolerance policy for the following behaviors, regardless of your age or legal status:
• Use, possession, or influence of drugs or alcohol in any program space
• Violence or threats of any kind, including physical intimidation
• Inappropriate, offensive, or discriminatory language
• Sexual or romantic advances toward any participant, staff member, or volunteer

Consequences for Violations
Violations of this Code of Conduct will be taken seriously. Consequences may include:
• Immediate suspension from the program, at the discretion of Pursuit staff
• Termination of participation in the program without re-entry
• Removal from program spaces and events, both in-person and online

By participating in the Pursuit AI Native Program, you agree to abide by these expectations and contribute to a safe, respectful, and professional learning community.`;

    const element = document.createElement('a');
    const file = new Blob([codeOfConductText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'AI-Native_Code_of_Conduct.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getProgramDetailsText = () => {
    return `AI-Native Program Details

I. Program Overview
The Pursuit AI-Native Program is an intensive program designed to empower individuals to become AI-natives, capable of securing good jobs and leading in the AI-driven future. This program is built on a model centered around the following pillars:
• AI-Powered Individual Learning: Utilizing AI tools for personalized learning pathways and skill development.
• Self-Driven, Active Learning Through Building: Focusing on practical application and project-based learning.
• Many-to-Many Learning and Teaching: Fostering a collaborative environment where Builders learn from and teach each other.
• Industry Network-Integrated: Connecting Builders with industry professionals, mentors, and potential employers.
• Adaptive Approach to Learning: Continuously adjusting the curriculum and approach based on real-time feedback and the evolving AI landscape.

II. Program Schedule & Calendar
Program Start Date: Saturday, September 6, 2025
Program Duration: 2 months in AI Literacy, with the opportunity to continue for up to 7 months in AI Build and AI Showcase if selected. Please note that there may be breaks between program phases.

Weekly Schedule:
• Monday – Wednesday: 6:30 PM – 10:00 PM (In-Person, Long Island City)
• Saturday – Sunday: 10:00 AM – 4:00 PM (In-Person, Long Island City)
• Plus, dedicated time for self-directed learning and project development.

Program Breakdown:
Months 1-2: AI Literacy:
• Focus: Understanding the AI ecosystem, using tools to learn, and beginning to build.
• Activities: Foundational skills development, AI tool exploration, initial project concepts.

Months 3-4: AI Build:
• Focus: Building real-world AI applications while deepening technical understanding.
• Activities: Project development, mentorship, networking.

Months 5-7: AI Showcase:
• Focus: Showcasing your skills, building your network, and securing employment opportunities.
• Activities: Portfolio development, building in public, job searching, and interview preparation.

Key Dates:
• Commitment Ceremony & Launch Event: September 6, 2025
• Good Job Agreement Start: If you proceed to the second stage of the program (L2), you will be subject to the payment obligations of the Good Job Agreement.

III. Laptops & Space
Builders are expected to bring their laptops if they have one. Those who need to borrow a laptop from Pursuit must sign a separate agreement on Launch Day. Borrowed laptops must remain at Pursuit's HQ and cannot be taken off-site.
Builders will have 24/7 access to Pursuit's HQ and WIFI to build and learn outside of program hours.

IV. Attendance
Consistent attendance is crucial for your success and the success of your cohort. The Pursuit AI Native Program will have weekly schedules and will be provided with the most recent calendars. It's important to be present and accountable so that we hold one another as the cohort to the best abilities that we all hold.
In-person participation is a required part of this program, and attendance will be closely tracked.
Absences must be communicated in advance to Pursuit whenever possible.

V. Advancement
During month 2, Pursuit staff members will review each Builder's progress and engagement to determine if continuing beyond month 2 is a good fit. This will be a holistic review based on factors including attendance, work product quality, key concept comprehension, peer, volunteer, and staff feedback, contribution to the community, and demonstrated ability to learn and build with AI.

VI. Good Job Agreement Commitment
If you proceed to the second stage of the program (L2), you will be subject to the payment obligations of the Good Job Agreement. The details of the Good Job Agreement, which were also shared at the Recruitment Workshop you attended, are as follows:
• Start the program with no upfront costs, pay only when you succeed, and get a job with an annual salary of over $85,000.
• If you don't get a job or make below the salary threshold, you pay nothing
• If you lose your job, your payments pause until your next job
• Rate: 15% of gross annual income when you get a job with a salary of at least $85,000
• You pay monthly payments of 15% of gross annual income until one of the following occurs:
  - You've made 36 monthly payments,
  - 5 years have passed since you started the program
  - You've paid $55,000 (which means your salary was ~$122K for three years)

To be clear, signing this pledge does NOT mean you are entering into the Good Job Agreement now. Your Good Job Agreement will go into effect if you proceed to the second stage of the program (L2) on Day 1 of L2.`;
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.dateOfBirth || !formData.printedName || !hasSignature) {
      await Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill out all fields and provide your signature.',
        confirmButtonColor: '#4242ea'
      });
      return;
    }

    // Validate phone number
    if (!isValidPhoneNumber(formData.phoneNumber)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Invalid Phone Number',
        text: 'Please enter a valid 10-digit phone number.',
        confirmButtonColor: '#4242ea'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get current applicant ID from user context or localStorage
      let applicantId = null;
      if (user.applicantId) {
        applicantId = user.applicantId;
      } else {
        // Create or get applicant to get the ID
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/applicant/by-email/${user.email}`);
        if (response.ok) {
          const applicant = await response.json();
          applicantId = applicant.applicant_id;
        }
      }

      if (!applicantId) {
        throw new Error('Unable to find your applicant ID');
      }

      // Get signature data from canvas
      const canvas = canvasRef.current;
      const signatureData = canvas.toDataURL('image/png');
      
      // Submit pledge to backend
      const submitResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/pledge/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicantId: applicantId,
          signatureData: signatureData,
          formData: formData
        })
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.error || 'Failed to submit pledge');
      }

      const result = await submitResponse.json();
      
      // Show celebratory success notification
      await Swal.fire({
        icon: 'success',
        title: '🎉 Congratulations! 🎉',
        html: `
          <div style="text-align: center;">
            <h3 style="color: #4242ea; margin: 20px 0;">Welcome to the AI-Native Program!</h3>
            <p style="font-size: 18px; margin: 15px 0;">🚀 Your journey as a Builder starts now! 🚀</p>
            <p style="font-size: 16px; margin: 10px 0;">Thank you for making this commitment to transform yourself and shape the future with AI.</p>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">Get ready to build, learn, and innovate like never before!</p>
          </div>
        `,
        confirmButtonText: '🎯 Let\'s Build the Future!',
        confirmButtonColor: '#4242ea',
        timer: 6000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__bounceIn'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOut'
        }
      });
      
      // Navigate back to applicant dashboard
      navigate('/apply');
    } catch (error) {
      console.error('Error submitting pledge:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.message || 'There was an error submitting your pledge. Please try again.',
        confirmButtonColor: '#4242ea'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('applicantToken');
    setUser(null);
    navigate('/login');
  };

  // Step rendering functions
  const renderStep1 = () => (
    <div className="pledge__step">
      <div className="pledge__step-content">
        <h2>Welcome to the AI-Native Program</h2>
        <div className="pledge__intro-text">
          <p>Everyone in the AI-Native Program is a Builder.</p>
          <p>The world is evolving at an unprecedented pace, driven by technology and innovation. By taking this pledge, you're committing not just to learn, but to drive your own transformation. You'll gain the skills to build powerful apps, harness the potential of AI, and position yourself as a leader in this rapidly changing digital age.</p>
          <p>This is your opportunity to become not just a consumer of technology, but a creator—an AI-native who shapes the future. Let's embark on this journey together.</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="pledge__step">
      <div className="pledge__step-content">
        <h2>Learning Commitment</h2>
        <p>As a Builder in the Pursuit AI-native Program, I commit to embracing learning with passion, curiosity, and determination.</p>
        <div className="pledge__commitments">
          <br/>
          <h3>Learning</h3>
          <ul>
            <li>Cultivate a growth mindset, and engage deeply with every aspect of the program, such as workshops, projects, and community events.</li>
            <li>Drive my own learning through consistent practice and research.</li>
            <li>Share my learning openly and teach others.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="pledge__step">
      <div className="pledge__step-content">
        <h2>Community Commitment</h2>
        <div className="pledge__commitments">
          <ul>
            <li>Foster a positive, inclusive, supportive community environment.</li>
            <li>Uphold Pursuit's <button 
                type="button" 
                className="code-of-conduct-link" 
                onClick={() => setShowCodeOfConduct(true)}
              >
                code of conduct
              </button></li>
          </ul>
        </div>
        
        <div className="pledge__agreement-section">
          <label className="pledge__checkbox-label">
            <input
              type="checkbox"
              checked={codeOfConductAgreed}
              onChange={(e) => setCodeOfConductAgreed(e.target.checked)}
              className="pledge__checkbox"
            />
            <span className="pledge__checkbox-text">
              I have read and agree to uphold Pursuit's Code of Conduct
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="pledge__step">
      <div className="pledge__step-content">
        <h2>Adapting & Building Commitment</h2>
        <div className="pledge__commitments">
          <h3>Adapting</h3>
          <ul>
            <li>Embrace the uncertainty and fluidity of this ever-evolving program and the AI field itself.</li>
            <li>Remain resilient in the face of challenges, demonstrating initiative to solve problems.</li>
          </ul>
          <br/>
          <h3>Building</h3>
          <ul>
            <li>Consistently work on projects and apply my learning to real-world scenarios.</li>
            <li>Be proactive in seeking opportunities to build and create.</li>
            <li>Embrace a "building in public" approach to share my journey and contribute to the AI community.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="pledge__step">
      <div className="pledge__step-content">
        <h2>Builder Information</h2>
        <div className="pledge__form-grid">
          <div className="pledge__form-field">
            <label>Full Name *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </div>
          <div className="pledge__form-field">
            <label>Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="pledge__form-field">
            <label>Phone Number * (10 digits)</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={handlePhoneNumberChange}
              className={formData.phoneNumber && !isValidPhoneNumber(formData.phoneNumber) ? 'invalid' : ''}
              placeholder="(555) 123-4567"
              required
            />
          </div>
          <div className="pledge__form-field">
            <label>Date of Birth *</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="pledge__step">
      <div className="pledge__step-content">
        <h2>Signature & Agreement</h2>
        <div className="pledge__acknowledgment">
          <p>By signing below, I acknowledge that I understand the <button 
              type="button" 
              className="program-details-link" 
              onClick={() => setShowProgramDetails(true)}
            >
              program details
            </button> and pledge the above to become AI-native, including upholding Pursuit's Code of Conduct.</p>
        </div>
        
        <div className="pledge__signature-section">
          <div className="pledge__signature-field">
            <label>Signature of Builder *</label>
            <div className="pledge__signature-container">
              <canvas
                ref={canvasRef}
                className="pledge__signature-canvas"
                width="400"
                height="200"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
              {hasSignature && (
                <button
                  type="button"
                  className="pledge__clear-signature"
                  onClick={clearSignature}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          <div className="pledge__form-grid">
            <div className="pledge__form-field">
              <label>Printed Name *</label>
              <input
                type="text"
                value={formData.printedName}
                onChange={(e) => setFormData(prev => ({ ...prev, printedName: e.target.value }))}
                required
              />
            </div>
            <div className="pledge__form-field">
              <label>Date *</label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return <div className="pledge__loading">Loading...</div>;
  }

  return (
    <div className="admissions-dashboard pledge-page">
      {/* Top Bar */}
      <div className="admissions-dashboard__topbar">
        <div className="admissions-dashboard__topbar-left">
          <div className="admissions-dashboard__logo-section">
            <Link to="/apply">
              <img src={pursuitLogoFull} alt="Pursuit Logo" className="admissions-dashboard__logo-full" />
            </Link>
          </div>
          <div className="admissions-dashboard__welcome-text">
            Welcome, {user.firstName || user.first_name}!
          </div>
        </div>
        <div className="admissions-dashboard__topbar-right">
          <Link to="/apply" className="nav-link nav-link--active">Apply</Link>
          <Link to="/program-details" className="nav-link">Details</Link>
          <button
            onClick={handleLogout}
            className="admissions-dashboard__button--primary"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pledge__content">
        <div className="pledge__content-inner">
          {/* Progress Bar */}
          <div className="pledge__progress">
            <div className="pledge__progress-bar">
              {Array.from({ length: totalSteps }, (_, index) => (
                <div
                  key={index + 1}
                  className={`pledge__progress-step ${
                    index + 1 === currentStep ? 'active' : ''
                  } ${index + 1 < currentStep ? 'completed' : ''}`}
                  onClick={() => goToStep(index + 1)}
                >
                  <div className="pledge__progress-number">{index + 1}</div>
                  <div className="pledge__progress-label">
                    {index === 0 && 'Introduction'}
                    {index === 1 && 'Learning'}
                    {index === 2 && 'Community'}
                    {index === 3 && 'Building'}
                    {index === 4 && 'Information'}
                    {index === 5 && 'Signature'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pledge__main">
            {/* Render current step */}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}

            {/* Navigation Buttons */}
            <div className="pledge__navigation">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="pledge__button--secondary"
                  onClick={prevStep}
                >
                  Previous
                </button>
              )}
              
              {currentStep < totalSteps && (
                <button
                  type="button"
                  className="pledge__button--primary"
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                >
                  Next
                </button>
              )}
              
              {currentStep === totalSteps && (
                <button
                  type="button"
                  className="pledge__button--primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isStepValid(currentStep)}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Pledge'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Program Details Modal */}
      {showProgramDetails && (
        <div className="modal-overlay" onClick={() => setShowProgramDetails(false)}>
          <div className="modal program-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>AI-Native Program Details</h2>
              <button className="close-btn" onClick={() => setShowProgramDetails(false)}>×</button>
            </div>
            <div className="pledge-modal-content">
              <div className="program-details-content">
                <div className="program-details-text">
                  {getProgramDetailsText().split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="pledge__button--secondary"
                onClick={downloadProgramDetails}
              >
                Download Details
              </button>
              <button 
                className="pledge__button--primary"
                onClick={() => setShowProgramDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code of Conduct Modal */}
      {showCodeOfConduct && (
        <div className="modal-overlay" onClick={() => setShowCodeOfConduct(false)}>
          <div className="modal code-of-conduct-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pursuit AI Native Program — Code of Conduct</h2>
              <button className="close-btn" onClick={() => setShowCodeOfConduct(false)}>×</button>
            </div>
            <div className="pledge-modal-content">
              <div className="code-of-conduct-content">
                <p>The Pursuit AI Native Program is a professional learning environment. All participants are expected to uphold the highest standards of conduct at all times, in the classroom, on the premises (including the lobby and roof), and at any Pursuit-related event or gathering, whether in person or virtual.</p>
                
                <p><strong>We expect you to conduct yourself professionally, which includes:</strong></p>
                <ul>
                  <li>Cleaning up after yourself</li>
                  <li>Taking care of shared spaces, materials, and equipment</li>
                  <li>Maintaining focus during sessions and minimizing disruptions</li>
                  <li>Respecting the space, staff, volunteers, and your peers</li>
                </ul>

                <h3>What We Mean by "Showing Respect"</h3>
                <p>Respect is a core expectation of this program. In this context, it means:</p>
                <ul>
                  <li>Listening actively when others are speaking, not interrupting or talking over them</li>
                  <li>Using appropriate and professional language and tone, both in person and online</li>
                  <li>Being punctual and prepared for all sessions and activities</li>
                  <li>Following shared space norms, like cleaning up and not distracting others</li>
                  <li>Engaging with others with kindness and professionalism, especially during feedback or collaboration</li>
                  <li>Respecting personal boundaries, including physical space, identity, and personal information</li>
                </ul>

                <h3>Zero-Tolerance Policy</h3>
                <p>To maintain a safe and professional environment, Pursuit enforces a zero-tolerance policy for the following behaviors, regardless of your age or legal status:</p>
                <ul>
                  <li>Use, possession, or influence of drugs or alcohol in any program space</li>
                  <li>Violence or threats of any kind, including physical intimidation</li>
                  <li>Inappropriate, offensive, or discriminatory language</li>
                  <li>Sexual or romantic advances toward any participant, staff member, or volunteer</li>
                </ul>

                <h3>Consequences for Violations</h3>
                <p>Violations of this Code of Conduct will be taken seriously. Consequences may include:</p>
                <ul>
                  <li>Immediate suspension from the program, at the discretion of Pursuit staff</li>
                  <li>Termination of participation in the program without re-entry</li>
                  <li>Removal from program spaces and events, both in-person and online</li>
                </ul>

                <p><strong>By participating in the Pursuit AI Native Program, you agree to abide by these expectations and contribute to a safe, respectful, and professional learning community.</strong></p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="pledge__button--secondary"
                onClick={downloadCodeOfConduct}
              >
                Download Code of Conduct
              </button>
              <button 
                className="pledge__button--primary"
                onClick={() => setShowCodeOfConduct(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pledge;