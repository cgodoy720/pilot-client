import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pursuitLogoFull from '../../assets/logo-full.png';
import Swal from 'sweetalert2';
import { Button } from '../../components/ui/button';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import 'animate.css';

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
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 10;
  };

  // Validation for each step
  const isStepValid = (step) => {
    switch (step) {
      case 1: return true;
      case 2: return true;
      case 3: return codeOfConductAgreed;
      case 4: return true;
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
      ctx.strokeStyle = '#1E1E1E';
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
    const digitsOnly = value.replace(/\D/g, '');
    const limitedDigits = digitsOnly.substring(0, 10);
    
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
    
    ctx.strokeStyle = '#1E1E1E';
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
    
    ctx.strokeStyle = '#1E1E1E';
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
Program Duration: 2 months in AI Literacy, with the opportunity to continue for up to 7 months in AI Build and AI Showcase if selected. Please note that there may be breaks between program phases.

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
    if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.dateOfBirth || !formData.printedName || !hasSignature) {
      await Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill out all fields and provide your signature.',
        confirmButtonColor: '#4242ea',
        confirmButtonText: 'OK, I\'ll complete it'
      });
      return;
    }

    if (!isValidPhoneNumber(formData.phoneNumber)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Invalid Phone Number',
        text: 'Please enter a valid 10-digit phone number.',
        confirmButtonColor: '#4242ea',
        confirmButtonText: 'OK, I\'ll fix it'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let applicantId = null;
      if (user.applicantId) {
        applicantId = user.applicantId;
      } else {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/applicant/by-email/${user.email}`);
        if (response.ok) {
          const applicant = await response.json();
          applicantId = applicant.applicant_id;
        }
      }

      if (!applicantId) {
        throw new Error('Unable to find your applicant ID');
      }

      const canvas = canvasRef.current;
      const signatureData = canvas.toDataURL('image/png');
      
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
      
      await Swal.fire({
        icon: 'success',
        title: '🎉 Congratulations! 🎉',
        html: `
          <div style="text-align: center;">
            <h3 style="color: #4242ea; margin: 20px 0;">Welcome to the AI-Native Program!</h3>
            <p style="font-size: 18px; margin: 15px 0; color: #1E1E1E;">🚀 Your journey as a Builder starts now! 🚀</p>
            <p style="font-size: 16px; margin: 10px 0; color: #666;">Thank you for making this commitment to transform yourself and shape the future with AI.</p>
            <p style="font-size: 14px; color: #999; margin-top: 20px;">Get ready to build, learn, and innovate like never before!</p>
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
      
      navigate('/apply');
    } catch (error) {
      console.error('Error submitting pledge:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.message || 'There was an error submitting your pledge. Please try again.',
        confirmButtonColor: '#4242ea',
        confirmButtonText: 'Try Again'
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

  // Step labels for progress bar
  const stepLabels = ['Introduction', 'Learning', 'Community', 'Building', 'Information', 'Signature'];

  // Step rendering functions
  const renderStep1 = () => (
    <div className="animate-fadeIn">
      <h2 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] mb-6 text-center">
        Welcome to the AI-Native Program
      </h2>
      <div className="space-y-4 text-[#666] text-base md:text-lg leading-relaxed">
        <p className="font-semibold text-[#1E1E1E] text-lg md:text-xl">
          Everyone in the AI-Native Program is a Builder.
        </p>
        <p>
          The world is evolving at an unprecedented pace, driven by technology and innovation. By taking this pledge, you're committing not just to learn, but to drive your own transformation. You'll gain the skills to build powerful apps, harness the potential of AI, and position yourself as a leader in this rapidly changing digital age.
        </p>
        <p>
          This is your opportunity to become not just a consumer of technology, but a creator—an AI-native who shapes the future. Let's embark on this journey together.
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-fadeIn">
      <h2 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] mb-6 text-center">
        Learning Commitment
      </h2>
      <p className="text-[#666] text-base md:text-lg mb-6">
        As a Builder in the Pursuit AI-native Program, I commit to embracing learning with passion, curiosity, and determination.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[#4242EA] mb-4">Learning</h3>
        <ul className="space-y-3 text-[#1E1E1E]">
          <li className="flex items-start gap-3">
            <span className="text-[#4242EA] mt-1">•</span>
            <span>Cultivate a growth mindset, and engage deeply with every aspect of the program, such as workshops, projects, and community events.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#4242EA] mt-1">•</span>
            <span>Drive my own learning through consistent practice and research.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#4242EA] mt-1">•</span>
            <span>Share my learning openly and teach others.</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-fadeIn">
      <h2 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] mb-6 text-center">
        Community Commitment
      </h2>
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
        <ul className="space-y-3 text-[#1E1E1E]">
          <li className="flex items-start gap-3">
            <span className="text-purple-600 mt-1">•</span>
            <span>Foster a positive, inclusive, supportive community environment.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 mt-1">•</span>
            <span>
              Uphold Pursuit's{' '}
              <button 
                type="button" 
                className="text-[#4242EA] underline hover:text-[#3535D1] font-medium"
                onClick={() => setShowCodeOfConduct(true)}
              >
                code of conduct
              </button>
            </span>
          </li>
        </ul>
      </div>
      
      <div className="bg-white border-2 border-[#4242EA] rounded-xl p-6">
        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={codeOfConductAgreed}
            onChange={(e) => setCodeOfConductAgreed(e.target.checked)}
            className="w-5 h-5 mt-0.5 accent-[#4242EA] cursor-pointer flex-shrink-0"
          />
          <span className="text-[#1E1E1E] font-medium">
            I have read and agree to uphold Pursuit's Code of Conduct
          </span>
        </label>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="animate-fadeIn">
      <h2 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] mb-6 text-center">
        Adapting & Building Commitment
      </h2>
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-700 mb-4">Adapting</h3>
          <ul className="space-y-3 text-[#1E1E1E]">
            <li className="flex items-start gap-3">
              <span className="text-amber-600 mt-1">•</span>
              <span>Embrace the uncertainty and fluidity of this ever-evolving program and the AI field itself.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-600 mt-1">•</span>
              <span>Remain resilient in the face of challenges, demonstrating initiative to solve problems.</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Building</h3>
          <ul className="space-y-3 text-[#1E1E1E]">
            <li className="flex items-start gap-3">
              <span className="text-green-600 mt-1">•</span>
              <span>Consistently work on projects and apply my learning to real-world scenarios.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 mt-1">•</span>
              <span>Be proactive in seeking opportunities to build and create.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 mt-1">•</span>
              <span>Embrace a "building in public" approach to share my journey and contribute to the AI community.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="animate-fadeIn">
      <h2 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] mb-6 text-center">
        Builder Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Full Name *</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            required
            className="w-full px-4 py-3 border border-[#C8C8C8] rounded-xl bg-white text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#4242EA] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Email Address *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            className="w-full px-4 py-3 border border-[#C8C8C8] rounded-xl bg-white text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#4242EA] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Phone Number * (10 digits)</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={handlePhoneNumberChange}
            className={`w-full px-4 py-3 border rounded-xl bg-white text-[#1E1E1E] focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              formData.phoneNumber && !isValidPhoneNumber(formData.phoneNumber) 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-[#C8C8C8] focus:ring-[#4242EA]'
            }`}
            placeholder="(555) 123-4567"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Date of Birth *</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            required
            className="w-full px-4 py-3 border border-[#C8C8C8] rounded-xl bg-white text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#4242EA] focus:border-transparent transition-all"
          />
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="animate-fadeIn">
      <h2 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] mb-6 text-center">
        Signature & Agreement
      </h2>
      <div className="bg-[#4242EA]/10 border border-[#4242EA] rounded-xl p-4 mb-6">
        <p className="text-[#1E1E1E] font-medium text-center">
          By signing below, I acknowledge that I understand the{' '}
          <button 
            type="button" 
            className="text-[#4242EA] underline hover:text-[#3535D1] font-semibold"
            onClick={() => setShowProgramDetails(true)}
          >
            program details
          </button>{' '}
          and pledge the above to become AI-native, including upholding Pursuit's Code of Conduct.
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Signature of Builder *</label>
          <div className="relative inline-block w-full">
            <canvas
              ref={canvasRef}
              className="border-2 border-[#C8C8C8] rounded-xl bg-white cursor-crosshair hover:border-[#4242EA] transition-colors w-full max-w-[400px]"
              width="400"
              height="150"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
            {hasSignature && (
              <button
                type="button"
                onClick={clearSignature}
                className="absolute top-2 right-2 md:right-auto md:left-[360px] bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Printed Name *</label>
            <input
              type="text"
              value={formData.printedName}
              onChange={(e) => setFormData(prev => ({ ...prev, printedName: e.target.value }))}
              required
              className="w-full px-4 py-3 border border-[#C8C8C8] rounded-xl bg-white text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#4242EA] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Date *</label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
              className="w-full px-4 py-3 border border-[#C8C8C8] rounded-xl bg-white text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#4242EA] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFEFEF]">
        <div className="text-[#1E1E1E] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF] font-sans">
      {/* Top Bar - Matching ApplicantDashboard */}
      <div className="bg-white border-b border-[#C8C8C8] px-4 md:px-8 py-2">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-5">
            <Link to="/apply">
              <img 
                src={pursuitLogoFull} 
                alt="Pursuit Logo" 
                className="h-8 md:h-10 object-contain cursor-pointer"
                style={{ filter: 'invert(1)' }}
              />
            </Link>
            <div className="text-base md:text-lg font-semibold text-[#1E1E1E]">
              Welcome, {user.firstName || user.first_name}!
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link 
              to="/apply" 
              className="hidden md:block bg-[#4242EA] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#3535D1] transition-colors"
            >
              Apply
            </Link>
            <Link 
              to="/program-details" 
              className="hidden md:block text-[#666] hover:text-[#1E1E1E] px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Details
            </Link>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-6">
        <div className="max-w-[800px] mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center relative">
              {/* Progress line background */}
              <div className="absolute top-5 left-[8%] right-[8%] h-0.5 bg-[#C8C8C8] z-0" />
              {/* Progress line filled */}
              <div 
                className="absolute top-5 left-[8%] h-0.5 bg-[#4242EA] z-0 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 84}%` }}
              />
              
              {stepLabels.map((label, index) => {
                const stepNum = index + 1;
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum < currentStep;
                
                return (
                  <div 
                    key={stepNum}
                    className="flex flex-col items-center cursor-pointer z-10"
                    onClick={() => goToStep(stepNum)}
                  >
                    <div 
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                        ${isCompleted ? 'bg-[#4242EA] text-white' : ''}
                        ${isActive ? 'bg-[#4242EA] text-white scale-110 shadow-lg' : ''}
                        ${!isActive && !isCompleted ? 'bg-white border-2 border-[#C8C8C8] text-[#666]' : ''}
                      `}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
                    </div>
                    <span 
                      className={`
                        text-xs mt-2 text-center max-w-[60px] md:max-w-[80px] leading-tight transition-colors
                        ${isActive ? 'text-[#4242EA] font-semibold' : 'text-[#666]'}
                        ${isCompleted ? 'text-[#4242EA]' : ''}
                      `}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-[#E0E0E0] min-h-[400px] flex flex-col">
            <div className="flex-1 overflow-y-auto mb-6">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {currentStep === 5 && renderStep5()}
              {currentStep === 6 && renderStep6()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-[#E0E0E0]">
              {currentStep > 1 ? (
                <Button
                  onClick={prevStep}
                  variant="outline"
                  className="border-[#C8C8C8] text-[#666] hover:bg-[#F5F5F5] hover:text-[#1E1E1E] px-6"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              ) : (
                <div />
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="bg-[#4242EA] hover:bg-[#3535D1] text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isStepValid(currentStep)}
                  className="bg-[#4242EA] hover:bg-[#3535D1] text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Pledge'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Program Details Modal */}
      {showProgramDetails && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowProgramDetails(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-[800px] max-h-[90vh] w-full flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#E0E0E0] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1E1E1E]">AI-Native Program Details</h2>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] text-[#666] hover:text-[#1E1E1E] text-2xl transition-colors"
                onClick={() => setShowProgramDetails(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="prose prose-sm max-w-none text-[#1E1E1E]">
                {getProgramDetailsText().split('\n').map((line, index) => (
                  <p key={index} className={line.startsWith('•') ? 'ml-4' : ''}>{line}</p>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-[#E0E0E0] flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={downloadProgramDetails}
                className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
              >
                Download Details
              </Button>
              <Button
                onClick={() => setShowProgramDetails(false)}
                className="bg-[#4242EA] hover:bg-[#3535D1] text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Code of Conduct Modal */}
      {showCodeOfConduct && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCodeOfConduct(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-[800px] max-h-[90vh] w-full flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#E0E0E0] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1E1E1E]">Pursuit AI Native Program — Code of Conduct</h2>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] text-[#666] hover:text-[#1E1E1E] text-2xl transition-colors"
                onClick={() => setShowCodeOfConduct(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-[#1E1E1E]">
              <p className="mb-4">The Pursuit AI Native Program is a professional learning environment. All participants are expected to uphold the highest standards of conduct at all times, in the classroom, on the premises (including the lobby and roof), and at any Pursuit-related event or gathering, whether in person or virtual.</p>
              
              <p className="font-semibold mb-2">We expect you to conduct yourself professionally, which includes:</p>
              <ul className="list-disc ml-6 mb-4 space-y-1">
                <li>Cleaning up after yourself</li>
                <li>Taking care of shared spaces, materials, and equipment</li>
                <li>Maintaining focus during sessions and minimizing disruptions</li>
                <li>Respecting the space, staff, volunteers, and your peers</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#4242EA] mt-6 mb-2">What We Mean by "Showing Respect"</h3>
              <p className="mb-2">Respect is a core expectation of this program. In this context, it means:</p>
              <ul className="list-disc ml-6 mb-4 space-y-1">
                <li>Listening actively when others are speaking, not interrupting or talking over them</li>
                <li>Using appropriate and professional language and tone, both in person and online</li>
                <li>Being punctual and prepared for all sessions and activities</li>
                <li>Following shared space norms, like cleaning up and not distracting others</li>
                <li>Engaging with others with kindness and professionalism, especially during feedback or collaboration</li>
                <li>Respecting personal boundaries, including physical space, identity, and personal information</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#4242EA] mt-6 mb-2">Zero-Tolerance Policy</h3>
              <p className="mb-2">To maintain a safe and professional environment, Pursuit enforces a zero-tolerance policy for the following behaviors, regardless of your age or legal status:</p>
              <ul className="list-disc ml-6 mb-4 space-y-1">
                <li>Use, possession, or influence of drugs or alcohol in any program space</li>
                <li>Violence or threats of any kind, including physical intimidation</li>
                <li>Inappropriate, offensive, or discriminatory language</li>
                <li>Sexual or romantic advances toward any participant, staff member, or volunteer</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#4242EA] mt-6 mb-2">Consequences for Violations</h3>
              <p className="mb-2">Violations of this Code of Conduct will be taken seriously. Consequences may include:</p>
              <ul className="list-disc ml-6 mb-4 space-y-1">
                <li>Immediate suspension from the program, at the discretion of Pursuit staff</li>
                <li>Termination of participation in the program without re-entry</li>
                <li>Removal from program spaces and events, both in-person and online</li>
              </ul>

              <p className="font-semibold mt-6">By participating in the Pursuit AI Native Program, you agree to abide by these expectations and contribute to a safe, respectful, and professional learning community.</p>
            </div>
            <div className="p-6 border-t border-[#E0E0E0] flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={downloadCodeOfConduct}
                className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
              >
                Download Code of Conduct
              </Button>
              <Button
                onClick={() => setShowCodeOfConduct(false)}
                className="bg-[#4242EA] hover:bg-[#3535D1] text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default Pledge;
