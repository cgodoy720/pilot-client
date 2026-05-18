import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingWizard from './OnboardingWizard';
import pursuitLogoFull from '../../assets/logo-full.png';
import { Button } from '../../components/ui/button';

function Onboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentApplicantId, setCurrentApplicantId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        const loadApplicantId = async () => {
          if (!userData?.email) {
            navigate('/login');
            return;
          }

          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/applicant/by-email/${userData.email}`);
            if (response.ok) {
              const applicant = await response.json();
              setCurrentApplicantId(applicant.applicant_id);

              // Check if onboarding is open based on cohort start date
              try {
                const cohortRes = await fetch(`${import.meta.env.VITE_API_URL}/api/onboarding/cohort-info`);
                if (cohortRes.ok) {
                  const cohortData = await cohortRes.json();
                  if (!cohortData.is_open) {
                    navigate('/apply');
                    return;
                  }
                }
                // If 404 or other non-ok, fail open (server guards are the backstop)
              } catch {
                // Fail open on network error
              }
            } else {
              navigate('/apply');
            }
          } catch (error) {
            console.error('Error loading applicant ID:', error);
            navigate('/apply');
          } finally {
            setLoading(false);
          }
        };

        loadApplicantId();
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleBackToDashboard = () => {
    navigate('/apply');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('applicantToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFEFEF]">
        <div className="text-[#1E1E1E] text-xl font-proxima">Loading onboarding...</div>
      </div>
    );
  }

  if (!user || !currentApplicantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFEFEF]">
        <div className="text-[#1E1E1E] text-xl font-proxima">Unable to load onboarding. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF] font-sans">
      {/* Top Bar */}
      <div className="bg-white border-b border-[#C8C8C8] px-4 md:px-8 py-2">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-5">
            <img 
              src={pursuitLogoFull} 
              alt="Pursuit Logo" 
              className="h-8 md:h-10 object-contain cursor-pointer"
              style={{ filter: 'invert(1)' }}
              onClick={handleBackToDashboard}
            />
            <div className="text-base md:text-lg font-semibold text-[#1E1E1E]">
              AI-Native Program Onboarding
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-sm text-[#666] hidden md:block">
              Welcome, {user.firstName || user.first_name}!
            </span>
            <Button 
              onClick={handleBackToDashboard}
              variant="outline"
              className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
            >
              Back to Dashboard
            </Button>
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
        <div className="max-w-[1200px] mx-auto">
          <OnboardingWizard 
            user={user}
            applicantId={currentApplicantId}
            onComplete={handleBackToDashboard}
          />
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
